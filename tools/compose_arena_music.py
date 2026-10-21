"""Original deterministic electronic/orchestral battle cue, no sampled songs."""
from pathlib import Path
import json
import subprocess
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'art/music'
RUNTIME = ROOT / 'dist/assets/audio/music'
SR, BPM, BARS = 44100, 128, 64
BEAT = 60 / BPM
LENGTH = BARS * 4 * BEAT
N = round(LENGTH * SR)
rng = np.random.default_rng(20261020)
dry = np.zeros((N, 2), np.float32)
drums = np.zeros_like(dry)


def filt(x, hz, kind='lowpass'):
    return sosfilt(butter(2, hz, btype=kind, fs=SR, output='sos'), x).astype(np.float32)


def add(bus, x, beat, gain=1, pan=0):
    start = round(beat * BEAT * SR)
    x = np.asarray(x, np.float32) * gain
    stereo = x[:, None] * np.array([np.cos((pan+1)*np.pi/4), np.sin((pan+1)*np.pi/4)], np.float32)
    # Periodic placement carries reverb/note tails over the loop boundary.
    if start < N:
        count = min(len(x), N-start)
        bus[start:start+count] += stereo[:count]
        if count < len(x):
            bus[:len(x)-count] += stereo[count:]


def note(midi, beats, voice, velocity=1):
    duration = beats * BEAT
    release = .12 if voice in ('bass', 'pluck') else .32
    t = np.arange(round((duration+release)*SR), dtype=np.float32)/SR
    f = 440 * 2**((midi-69)/12)
    attack = .008 if voice != 'pad' else .18
    env = np.minimum(t/attack, 1) * np.minimum(np.maximum(duration+release-t, 0)/release, 1)
    phase = 2*np.pi*f*t
    if voice == 'bass':
        x = .8*np.sin(phase)+.20*np.sin(2*phase)+.11*np.sin(3*phase)
        env *= .7+.3*np.exp(-t*12)
    elif voice == 'pluck':
        x = np.sin(phase)+.32*np.sin(2*phase)+.14*np.sin(3*phase)
        env *= np.exp(-t*6)
    elif voice == 'pad':
        x = sum(np.sin(phase*(1+detune)) for detune in (-.0025, 0, .0025))/3
        x += .14*np.sin(2*phase)
        env *= .85+.15*np.sin(2*np.pi*.7*t)
    elif voice == 'brass':
        x = sum(np.sin(phase*k)/(k**1.3) for k in range(1, 7))
        x = filt(x, 2700)
        env *= .65+.35*np.exp(-t*5)
    else:
        vibrato = .018*np.sin(2*np.pi*5*t)*np.minimum(t/.22,1)
        x = np.sin(phase+vibrato)+.25*np.sin(2*phase+vibrato)+.08*np.sin(3*phase)
        env *= .8+.2*np.exp(-t*8)
    return x*env*velocity


def drum(kind, variation=0):
    duration = {'kick':.48,'snare':.30,'hat':.11,'open':.34,'crash':1.8,'tom':.48}[kind]
    t = np.arange(round(duration*SR), dtype=np.float32)/SR
    noise = rng.standard_normal(len(t)).astype(np.float32)
    if kind == 'kick':
        phase = 2*np.pi*(46*t + 93*.025*(1-np.exp(-t/.025)))
        x = np.sin(phase)*np.exp(-t*10)+.1*filt(noise,4000,'highpass')*np.exp(-t*160)
    elif kind == 'snare':
        x = .65*filt(noise,1500,'highpass')*np.exp(-t*18)+.45*np.sin(2*np.pi*185*t)*np.exp(-t*25)
    elif kind in ('hat','open','crash'):
        decay = {'hat':50,'open':13,'crash':3.5}[kind]
        x = filt(noise,6500,'highpass')*np.exp(-t*decay)
        x += .07*sum(np.sin(2*np.pi*f*t) for f in [4211,5873,7817])*np.exp(-t*decay)
    else:
        x = np.sin(2*np.pi*((95+variation*18)*t+45*.05*(1-np.exp(-t/.05))))*np.exp(-t*12)
    return x*np.minimum(t/.001,1)


samples = {k:[drum(k, i) for i in range(4)] for k in ('kick','snare','hat','open','crash','tom')}
# D minor; final A dominant gives a deliberate return to D at the loop seam.
progression = [(38,[62,65,69]),(34,[58,62,65]),(41,[60,65,69]),(36,[60,64,67]),
               (38,[62,65,69]),(34,[58,62,65]),(43,[58,62,67]),(33,[61,64,69])]
motifs = [
 [(0,74,.75),(1,77,.5),(1.75,81,.75),(3,79,.5),(3.5,77,.5)],
 [(0,74,.75),(1,72,.5),(2,70,1),(3.5,72,.5)],
 [(0,77,.75),(1,81,.5),(2,84,.75),(3,81,.75)],
 [(0,79,1),(1.5,76,.5),(2.5,72,1)],
 [(0,74,.5),(.75,77,.5),(1.5,81,.5),(2.5,86,1)],
 [(0,82,.75),(1,81,.5),(2,77,1),(3.5,74,.5)],
 [(0,79,.75),(1,77,.5),(2,74,1),(3.25,70,.5)],
 [(0,73,.75),(1,76,.5),(2,81,.75),(3,73,.75)],
]

for bar in range(BARS):
    beat = bar*4
    root, chord = progression[bar%8]
    section = 'intro' if bar<8 else 'a' if bar<24 else 'break' if bar<32 else 'b' if bar<48 else 'climax' if bar<60 else 'turn'
    intensity = {'intro':.52,'a':.80,'break':.42,'b':.88,'climax':1,'turn':.72}[section]
    # Warm sustained strings with distinct left/right chord voices.
    for i, pitch in enumerate(chord):
        add(dry,note(pitch,3.8,'pad'),beat,.060,[-.6,.05,.6][i])
    add(dry,note(root+12,3.7,'pad'),beat,.055,-.15)
    if section != 'break' or bar>=28:
        for j in range(8):
            pitch = chord[[0,2,1,2,0,2,1,2][j]] + (12 if bar>=32 and j%2 else 0)
            add(dry,note(pitch,.32,'pluck'),beat+j*.5,.075*intensity,(-1 if j%2 else 1)*.45)
    if section not in ('intro','break') or bar>=4 and section=='intro':
        for j in [0,.75,1.5,2,2.75,3.5]:
            add(dry,note(root+ (12 if j==3.5 else 0),.40,'bass'),beat+j,.235*intensity)
    if section in ('a','b','climax'):
        for offset,pitch,duration in motifs[bar%8]:
            add(dry,note(pitch,duration,'lead'),beat+offset,.10 if section=='a' else .125,.08)
            if section=='climax':
                add(dry,note(pitch-12,duration,'brass'),beat+offset,.042,-.16)
    if section in ('b','climax') or section=='intro' and bar%2==0:
        for offset in [0,2.5]:
            for pitch in chord:
                add(dry,note(pitch,.48,'brass'),beat+offset,.036*intensity,-.1)
    # Half-time break, driving four-beat pulse in battle passages.
    kicks = [0,2.5] if section=='break' else [0,1.5,2,3.5] if bar%4==3 else [0,1,2,3]
    if section=='intro' and bar<4: kicks=[0]
    for j in kicks:add(drums,samples['kick'][bar%4],beat+j,.48*intensity)
    if section!='intro' or bar>=4:
        for j in ([2] if section=='break' else [1,3]):add(drums,samples['snare'][bar%4],beat+j,.235*intensity,.06)
    if section not in ('intro','break') or bar>=4 and section=='intro':
        for j in range(8):add(drums,samples['hat'][j%4],beat+j*.5,.052*intensity*(.72 if j%2==0 else 1),(-1 if j%2 else 1)*.32)
        for j in [1.5,3.5]:add(drums,samples['open'][bar%4],beat+j,.038*intensity,.4)
    if bar in [0,8,16,24,32,40,48,56,60]:add(drums,samples['crash'][bar%4],beat,.10,-.3)
    if bar%8==7:
        for j in range(6):add(drums,samples['tom'][j%4],beat+2.5+j*.25,.15*intensity,-.4+j*.16)

# Beat-synchronous stereo ambience and sidechain space for kick/impact transients.
time = np.arange(N,dtype=np.float32)/SR
sidechain = 1-.22*np.exp(-np.mod(time,BEAT)/.055)
dry *= sidechain[:,None]
wet = np.zeros_like(dry)
for delay,level in [(BEAT*.75,.105),(BEAT*1.5,.070),(.071,.055),(.113,.040)]:
    wet += np.roll(dry,round(delay*SR),axis=0)[:,::-1]*level
loop = dry+wet+drums
loop = np.tanh(loop*1.12)
loop *= .82/max(float(np.max(np.abs(loop))),.001)
# Tiny equal endpoint fades remove any discontinuity at the repeated boundary.
edge=round(SR*.004)
loop[:edge] *= np.linspace(0,1,edge)[:,None]
loop[-edge:] *= np.linspace(1,0,edge)[:,None]
OUT.mkdir(parents=True,exist_ok=True)
RUNTIME.mkdir(parents=True,exist_ok=True)
sf.write(OUT/'down_arena_limit_break_loop.wav',loop,SR,subtype='PCM_16')
# Listening edition has soft entrance and an extended final chord/decay.
full = np.zeros((N+SR*4,2),np.float32)
full[:N] = loop
full[:int(SR*.7)] *= np.linspace(0,1,int(SR*.7))[:,None]
tail = np.zeros_like(full)
for p in [38,50,62,65,69,74]:
    x = note(p,5.2,'pad')*.075
    start=N-round(BEAT*SR)
    end=min(start+len(x),len(tail))
    tail[start:end] += x[:end-start,None]*.707
fade=round(BEAT*SR)
full[N-fade:N] *= np.linspace(1,0,fade)[:,None]
full += tail
full[-SR:] *= np.linspace(1,0,SR)[:,None]
full=np.clip(full,-.98,.98)
sf.write(OUT/'down_arena_limit_break_master.wav',full,SR,subtype='PCM_16')
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(OUT/'down_arena_limit_break_master.wav'),'-c:a','libmp3lame','-b:a','192k','-metadata','title=Down Arena - Limit Break','-metadata','artist=Original procedural composition',str(OUT/'Down_Arena_Limit_Break.mp3')],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(OUT/'down_arena_limit_break_loop.wav'),'-c:a','libvorbis','-q:a','6','-metadata','LOOPSTART=0','-metadata',f'LOOPEND={N}',str(RUNTIME/'Down_Arena_Limit_Break_Loop.ogg')],check=True)
stats={'title':'Down Arena - Limit Break','bpm':BPM,'key':'D minor','loop_seconds':LENGTH,'listening_seconds':len(full)/SR,'sample_rate':SR,'peak':float(np.max(np.abs(loop))),'rms':float(np.sqrt(np.mean(loop**2))),'boundary_step':np.abs(loop[0]-loop[-1]).tolist(),'original_synthesis':True,'integrated_playback':False}
(OUT/'music_info.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
print(json.dumps(stats))
