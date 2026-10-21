"""Original synthesized battle one-shots; no third-party recordings."""
from pathlib import Path
import numpy as np
from scipy.signal import butter,sosfilt
import soundfile as sf
root=Path(__file__).resolve().parents[1];out=root/'dist/assets/audio/sfx';out.mkdir(parents=True,exist_ok=True)
sr=44100;rng=np.random.default_rng(20261022)
def filt(x,hz,kind='lowpass'):return sosfilt(butter(2,hz,btype=kind,fs=sr,output='sos'),x)
groups={'sword_swing':.26,'sword_hit':.48,'punch':.22,'heavy_hit':.65,'energy_launch':.50,'energy_hit':.78,'sword_block':.50}
preview=[]
for group,duration in groups.items():
 for variant in range(3):
  t=np.arange(round(duration*sr))/sr;n=rng.standard_normal(len(t));v=1+(variant-1)*.07
  if group=='sword_swing':
   env=np.sin(np.pi*np.minimum(t/duration,1))**2
   x=filt(n,1400,'highpass')*env*.32+np.sin(2*np.pi*(2000*v*t-2600*t*t))*env*.10
  elif group in ['sword_hit','sword_block']:
   x=filt(n,2300,'highpass')*np.exp(-t*85)*.65
   for f,g in [(1170,.23),(1817,.17),(2789,.10),(4211,.065)]:x+=np.sin(2*np.pi*f*v*t)*np.exp(-t*(11 if group=='sword_block' else 17))*g
   if group=='sword_hit':x+=np.sin(2*np.pi*(105*v*t+40*.02*(1-np.exp(-t/.02))))*np.exp(-t*20)*.3
  elif group in ['punch','heavy_hit']:
   heavy=group=='heavy_hit';x=filt(n,5500)*np.exp(-t*90)*.55
   phase=2*np.pi*((47 if heavy else 75)*v*t+100*.018*(1-np.exp(-t/.018)))
   x+=np.sin(phase)*np.exp(-t*(10 if heavy else 25))*.7
   x+=filt(n,1100)*np.exp(-t*(9 if heavy else 30))*.22
  elif group=='energy_launch':
   env=np.minimum(t/.008,1)*np.exp(-t*9);phase=2*np.pi*(760*v*t-600*t*t)
   x=(np.sin(phase)+.22*np.sin(phase*2.03))*env*.33
   x+=filt(n,3800)*env*.35+np.sin(2*np.pi*65*v*t)*np.exp(-t*13)*.35
  else:
   x=filt(n,4300)*np.exp(-t*65)*.7+filt(n,1300)*np.exp(-t*7)*.38
   x+=np.sin(2*np.pi*(42*v*t+95*.025*(1-np.exp(-t/.025))))*np.exp(-t*8)*.6
   x+=filt(n,5500,'highpass')*np.exp(-t*13)*(.5+.5*np.sin(2*np.pi*51*t))*.12
  x=np.tanh(x*1.2);x*=np.minimum(t/.0015,1);edge=round(sr*.008);x[-edge:]*=np.linspace(1,0,edge)
  x*=.82/max(np.abs(x).max(),.001)
  sf.write(out/f'{group}_{variant+1}.wav',x,sr,subtype='PCM_16')
  preview.extend([x,np.zeros(round(sr*.28))])
p=root/'art/audio/combat_sfx_preview.wav';sf.write(p,np.concatenate(preview),sr,subtype='PCM_16');print('21 original one-shots exported; peak0.82, mono44.1kHz PCM16. Preview:',p)
