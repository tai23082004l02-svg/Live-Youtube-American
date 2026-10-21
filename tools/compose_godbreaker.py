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
SR, BPM, BARS = 44100, 148, 80
BEAT = 60 / BPM
LENGTH = BARS * 4 * BEAT
N = round(LENGTH * SR)
rng = np.random.default_rng(20261021)
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
    if voice == 'guitar':
        wave=sum(np.sin(phase*k)/(k**.85) for k in range(1,12))
        x=filt(np.tanh(wave*2.4),4300)
        env*=np.exp(-t*8)*(1-np.exp(-t*160))
    elif voice == 'saw':
        x=sum(sum(np.sin(phase*k*(1+detune))/k for k in range(1,9)) for detune in [-.004,0,.004])/3
        x=filt(x,3800)
        env*=.75+.25*np.exp(-t*7)
    elif voice == 'strings':
        x=sum(np.sin(phase*k)/(k**1.2) for k in range(1,8))
        x=filt(x,3200)
        env*=np.exp(-t*7)
    elif voice == 'bass':
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


samples={k:[drum(k,i) for i in range(4)] for k in ('kick','snare','hat','open','crash','tom')}
# Original E-minor / C / G / D progression with B-dominant turnarounds.
progression=[(40,[64,67,71]),(40,[64,67,71]),(36,[60,64,67]),(36,[60,64,67]),(43,[62,67,71]),(38,[62,66,69]),(36,[60,64,67]),(35,[63,66,71])]
melodies=[[(0,76,.7),(1,79,.45),(1.75,83,.7),(3,81,.4),(3.5,79,.4)],[(0,78,.5),(.75,76,.7),(2,74,.7),(3,71,.7)],[(0,76,.7),(1,79,.7),(2,84,1.2)],[(0,83,.7),(1,79,.7),(2,76,1.2)],[(0,79,.7),(1,83,.5),(2,86,.7),(3,83,.7)],[(0,81,.7),(1,78,.5),(2,74,.7),(3,78,.7)],[(0,79,.5),(.75,76,.5),(1.5,72,.7),(3,76,.7)],[(0,78,.7),(1,75,.5),(2,71,.7),(3,75,.7)]]
sections=[]
for bar in range(BARS):
    beat=bar*4
    section='intro' if bar<4 else 'drive' if bar<20 else 'build' if bar<28 else 'drop' if bar<44 else 'break' if bar<52 else 'return' if bar<68 else 'climax' if bar<76 else 'turn'
    intensity={'intro':.55,'drive':.85,'build':.75,'drop':1,'break':.4,'return':.95,'climax':1,'turn':.85}[section]
    if not sections or sections[-1]['name']!=section:sections.append({'name':section,'seconds':round(beat*BEAT,3)})
    root,chord=progression[(bar-4)%8]
    for i,pitch in enumerate(chord):add(dry,note(pitch,3.9,'pad'),beat,.04,[-.65,0,.65][i])
    active=section not in ['intro','break']
    # Stereo palm-muted power chords, sixteenth-note push into each downbeat.
    if active:
        rhythm=[0,.5,.75,1.5,2,2.5,2.75,3.5] if bar%2==0 else [0,.75,1,1.5,2,2.75,3.25,3.5]
        for j in rhythm:
            for pitch in [root+12,root+19]:
                add(dry,note(pitch,.21 if j%1 else .32,'guitar'),beat+j,.07*intensity,-.72)
                add(dry,note(pitch,.24,'guitar'),beat+j+.012,.065*intensity,.72)
            add(dry,note(root,.32,'bass'),beat+j,.23*intensity)
    else:
        add(dry,note(root,3.7,'bass'),beat,.11)
    # Arpeggiated string ostinato around the sides; melody stays out of the bass.
    if section!='intro':
        for j in range(8):
            pitch=chord[[0,2,1,2,0,1,2,1][j]]+(12 if section in ['drop','return','climax'] and j%2 else 0)
            add(dry,note(pitch,.27,'strings' if active else 'pluck'),beat+j*.5,.045*intensity,(-1 if j%2 else 1)*.4)
    if section in ['drive','drop','return','climax','break']:
        for j,pitch,dur in melodies[(bar-4)%8]:
            add(dry,note(pitch,dur,'saw' if active else 'lead'),beat+j,.067*intensity,0)
            if section=='climax':add(dry,note(pitch-12,dur,'brass'),beat+j,.035,-.1)
    # Syncopated rock drums, strong backbeat and deliberate half-time contrast.
    kicks=[0] if section=='intro' else [0,2.5] if section=='break' else [0,.75,2,2.5] if bar%2 else [0,1.5,2,3.5]
    for j in kicks:add(drums,samples['kick'][bar%4],beat+j,.6*intensity)
    for j in ([2] if section=='break' else [1,3]):add(drums,samples['snare'][bar%4],beat+j,.29*intensity,.03)
    for j in range(8 if section not in ['climax','build'] else 16):
        step=.5 if section not in ['climax','build'] else .25
        add(drums,samples['hat'][j%4],beat+j*step,.04*intensity*(.6 if j%2 else 1),(-1 if j%2 else 1)*.3)
    if active:
        for j in [1.5,3.5]:add(drums,samples['open'][bar%4],beat+j,.036,.45)
    if bar in [0,4,20,28,36,44,52,60,68,76]:add(drums,samples['crash'][bar%4],beat,.13,-.3)
    if bar%8==3 or bar in [27,51,75,79]:
        for j in range(8):add(drums,samples['tom'][j%4],beat+2+j*.25,.14*intensity,-.6+j*.17)
    if section=='build':
        for j in range(8 if bar<24 else 16):add(drums,samples['snare'][j%4],beat+j*(.5 if bar<24 else .25),.065+(bar-20)*.009,.05)
# Gentle musical delay; transients remain dry and clear.
time=np.arange(N,dtype=np.float32)/SR
dry*= (1-.2*np.exp(-np.mod(time,BEAT)/.045))[:,None]
wet=np.zeros_like(dry)
for delay,level in [(BEAT*.75,.10),(BEAT*1.5,.055),(.047,.045)]:wet+=np.roll(dry,round(delay*SR),axis=0)[:,::-1]*level
mix=np.tanh((dry+wet+drums)*1.15)
mix*=.88/max(float(np.max(np.abs(mix))),.001)
edge=round(.006*SR);mix[:edge]*=np.linspace(0,1,edge)[:,None];mix[-edge:]*=np.linspace(1,0,edge)[:,None]
OUT.mkdir(exist_ok=True,parents=True);RUNTIME.mkdir(exist_ok=True,parents=True)
loop_path=OUT/'Down_Arena_Godbreaker_Loop.wav';sf.write(loop_path,mix,SR,subtype='PCM_16')
# Listening edition fades naturally; runtime loop keeps the full repeated groove.
listen=mix.copy();fade=round(4*BEAT*SR);listen[-fade:]*=np.linspace(1,0,fade)[:,None]
master=OUT/'Down_Arena_Godbreaker_Master.wav';sf.write(master,listen,SR,subtype='PCM_16')
mp3=OUT/'Down_Arena_Godbreaker.mp3'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(master),'-c:a','libmp3lame','-b:a','192k','-metadata','title=Down Arena - Godbreaker','-metadata','artist=Down Arena - original synthesized composition',str(mp3)],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(loop_path),'-c:a','libvorbis','-q:a','6',str(RUNTIME/'Down_Arena_Godbreaker_Loop.ogg')],check=True)
info={'title':'Down Arena - Godbreaker','bpm':BPM,'key':'E minor','seconds':LENGTH,'sections':sections,'peak':float(np.max(np.abs(mix))),'rms':float(np.sqrt(np.mean(mix**2))),'method':'Original procedural synthesizer composition; no sampled songs or vocals.'}
(OUT/'godbreaker_info.json').write_text(json.dumps(info,indent=2),encoding='utf-8')
print(json.dumps(info));print(mp3)
