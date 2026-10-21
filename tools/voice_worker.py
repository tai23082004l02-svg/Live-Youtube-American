"""Local, file-queue ElevenLabs worker. No listening ports or executable jobs."""
from pathlib import Path
import ctypes
import datetime as dt
import hashlib
import json
import os
import re
import threading
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ID = re.compile(r'^[A-Za-z0-9_-]{1,70}$')
MAX_CHARS, DAILY_CHARS, DAILY_SAMPLES = 200, 1000, 10


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')
    os.replace(temp, path)


def load_key(root):
    # Windows CurrentUser DPAPI: compatible with ConvertFrom-SecureString.
    class Blob(ctypes.Structure):
        _fields_ = [('length', ctypes.c_uint32), ('data', ctypes.POINTER(ctypes.c_ubyte))]
    raw = bytes.fromhex((root/'.secrets/elevenlabs.key.dpapi').read_text(encoding='utf-8-sig').strip())
    buf = (ctypes.c_ubyte*len(raw)).from_buffer_copy(raw)
    source, output = Blob(len(raw), buf), Blob()
    crypt = ctypes.WinDLL('crypt32', use_last_error=True)
    crypt.CryptUnprotectData.argtypes = [ctypes.POINTER(Blob), ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32, ctypes.POINTER(Blob)]
    if not crypt.CryptUnprotectData(ctypes.byref(source), None, None, None, None, 0, ctypes.byref(output)):
        raise RuntimeError('Cannot decrypt key for this Windows account')
    try:
        return ctypes.string_at(output.data, output.length).decode('utf-16-le')
    finally:
        ctypes.memset(output.data, 0, output.length)
        kernel = ctypes.WinDLL('kernel32')
        kernel.LocalFree.argtypes = [ctypes.c_void_p]
        kernel.LocalFree(output.data)


class Worker:
    def __init__(self, root=ROOT, transport=None, key_provider=load_key):
        self.root = Path(root)
        self.home = self.root/'.voice-worker'
        for folder in ['queue', 'processing', 'results']:
            (self.home/folder).mkdir(parents=True, exist_ok=True)
        self.output = self.root/'art/audio/elevenlabs'
        self.output.mkdir(parents=True, exist_ok=True)
        self.transport = transport or self.request
        self.key_provider = key_provider
        self.active = None
        self.quit = threading.Event()

    def request(self, path, payload=None):
        if not path.startswith(('/v1/voices', '/v1/text-to-speech/')):
            raise ValueError('Endpoint not allowed')
        key = self.key_provider(self.root)
        headers = {'xi-api-key':key, 'Accept':'audio/mpeg' if payload else 'application/json'}
        data = None
        if payload is not None:
            data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        req = urllib.request.Request('https://api.elevenlabs.io'+path, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=90) as response:
                content = response.read(5_000_001)
                if len(content)>5_000_000:
                    raise ValueError('Response too large')
                if payload is not None and ('audio/' not in response.headers.get('Content-Type','') or len(content)<200):
                    raise ValueError('Invalid audio response')
                return content if payload is not None else json.loads(content)
        finally:
            headers.clear()
            key = None

    def voices(self):
        voices = self.transport('/v1/voices').get('voices', [])
        public = [{k:v.get(k) for k in ['voice_id','name','labels','description','verified_languages','category']} for v in voices]
        atomic_json(self.home/'voices.json', public)
        return public

    def validate(self, job):
        if not isinstance(job, dict) or not ID.fullmatch(str(job.get('id',''))):
            raise ValueError('Invalid job ID')
        kind = job.get('kind','speech')
        if kind=='voices':
            return
        if kind!='speech':
            raise ValueError('Only speech or voices jobs allowed')
        text = job.get('text')
        if not isinstance(text,str) or not text.strip() or len(text)>MAX_CHARS:
            raise ValueError('Text must contain1-200 characters')
        if not ID.fullmatch(str(job.get('output',''))):
            raise ValueError('Output must be a plain filename stem')
        if job.get('language','en') not in ['en','ja']:
            raise ValueError('Language must be en or ja')
        if job.get('model','eleven_v3') not in ['eleven_v3','eleven_multilingual_v2','eleven_flash_v2_5']:
            raise ValueError('Model not allowed')
        if not ID.fullmatch(str(job.get('voice_id',''))) and job.get('voice_selector')!='japanese_male':
            raise ValueError('Choose voice_id or japanese_male')

    def select_voice(self, job):
        if job.get('voice_id'):
            return job['voice_id']
        candidates=[]
        for v in self.voices():
            labels=v.get('labels') or {}
            japanese = str(labels.get('language','')).lower() in ['ja','japanese'] or 'japanese' in str(labels.get('accent','')).lower() or any(item.get('language')=='ja' or str(item.get('locale','')).startswith('ja') for item in v.get('verified_languages') or [])
            known = bool(re.match(r'^(Asahi|Otani|Ken)(?:\s|$|-)',v.get('name') or '',re.I))
            if (japanese or known) and (str(labels.get('gender','')).lower()=='male' or known):
                candidates.append(v)
        candidates.sort(key=lambda v:not re.search('energetic|powerful|anime|dynamic|character|strong',(v.get('description') or '')+' '+(v.get('name') or ''),re.I))
        if not candidates:
            raise ValueError('No Japanese male voice. Add one in ElevenLabs Voices > Explore > Japanese + Male, then queue a new job.')
        return candidates[0]['voice_id']

    def budget(self, text, fingerprint):
        path=self.home/'usage.json'
        state=json.loads(path.read_text()) if path.exists() else {'days':{},'submitted':[]}
        if fingerprint in state['submitted']:
            raise ValueError('Identical request already submitted; no automatic paid retry')
        day=dt.date.today().isoformat()
        use=state['days'].setdefault(day,{'characters':0,'samples':0})
        if use['characters']+len(text)>DAILY_CHARS or use['samples']>=DAILY_SAMPLES:
            raise ValueError('Daily limit reached:1000 characters or10 samples')
        # Reserve before POST; failed/time-out generations are never auto-retried.
        use['characters']+=len(text)
        use['samples']+=1
        state['submitted'].append(fingerprint)
        atomic_json(path,state)

    def process(self, path):
        name=path.stem
        result=self.home/'results'/path.name
        if result.exists():
            path.unlink()
            return
        claimed=self.home/'processing'/path.name
        os.replace(path,claimed)
        self.active=name
        submitted=False
        try:
            if claimed.stat().st_size>8192:
                raise ValueError('Job too large')
            job=json.loads(claimed.read_text(encoding='utf-8-sig'))
            self.validate(job)
            if job['id']!=name:
                raise ValueError('Filename must match job ID')
            if job.get('kind')=='voices':
                voices=self.voices()
                value={'status':'done','voices':len(voices),'catalog':'.voice-worker/voices.json'}
            else:
                out=self.output/(job['output']+'.mp3')
                if out.exists():
                    raise ValueError('Output already exists; not overwritten')
                voice=self.select_voice(job)
                if not ID.fullmatch(voice):
                    raise ValueError('Invalid voice ID')
                payload={'text':job['text'],'model_id':job.get('model','eleven_v3'),'language_code':job.get('language','en'),'voice_settings':{'stability':0.5,'similarity_boost':0.75}}
                fingerprint=hashlib.sha256(json.dumps({'voice':voice,'payload':payload},sort_keys=True).encode()).hexdigest()
                self.budget(job['text'],fingerprint)
                submitted=True
                audio=self.transport('/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',payload)
                if not isinstance(audio,bytes) or len(audio)<200:
                    raise ValueError('Invalid audio output')
                # Exclusive creation prevents replacement of a concurrently created file.
                with out.open('xb') as f:
                    f.write(audio)
                value={'status':'done','output':str(out.relative_to(self.root)),'characters_submitted':len(job['text']),'voice_id':voice}
        except Exception as exc:
            # Network exception bodies/headers may contain private metadata; never log them.
            safe=str(exc) if isinstance(exc,ValueError) else type(exc).__name__
            value={'status':'failed','error':safe,'generation_submitted':submitted,'automatic_retry':False}
        atomic_json(result,{'id':name,**value})
        claimed.unlink(missing_ok=True)
        self.active=None

    def heartbeat(self):
        while not self.quit.is_set():
            atomic_json(self.home/'status.json',{'pid':os.getpid(),'heartbeat':time.time(),'active':self.active,'status':'running','daily_character_limit':DAILY_CHARS,'daily_sample_limit':DAILY_SAMPLES})
            self.quit.wait(2)

    def run(self):
        import msvcrt
        lock=(self.home/'worker.lock').open('a+b')
        lock.seek(0); lock.write(b'0'); lock.flush(); lock.seek(0)
        try:
            msvcrt.locking(lock.fileno(),msvcrt.LK_NBLCK,1)
        except OSError:
            lock.close()
            return
        try:
            # Claimed jobs after a crash are uncertain, not safe to automatically retry.
            for path in (self.home/'processing').glob('*.json'):
                atomic_json(self.home/'results'/path.name,{'id':path.stem,'status':'unknown_after_restart','automatic_retry':False})
                path.unlink()
            stop=self.home/'stop'
            stop.unlink(missing_ok=True)
            thread=threading.Thread(target=self.heartbeat,daemon=True)
            thread.start()
            while not stop.exists():
                for path in sorted((self.home/'queue').glob('*.json')):
                    if stop.exists():
                        break
                    self.process(path)
                time.sleep(1)
        finally:
            self.quit.set()
            if 'thread' in locals():
                thread.join(3)
            atomic_json(self.home/'status.json',{'pid':os.getpid(),'heartbeat':time.time(),'status':'stopped'})
            lock.close()


if __name__=='__main__':
    Worker().run()
