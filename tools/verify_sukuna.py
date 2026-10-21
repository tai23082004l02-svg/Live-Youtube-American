"""Independent native-pixel/source-hash/coverage/border verification."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'art/frames/sukuna'
r=json.loads((OUT/'extraction_report.json').read_text(encoding='utf-8'));count=0
for source in r['sources']:
    p=ROOT/'art/sources'/source['source'];assert hashlib.sha256(p.read_bytes()).hexdigest()==source['sha256']
    original=np.array(Image.open(p).convert('RGBA'));rebuilt=np.zeros_like(original);coverage=np.zeros(original.shape[:2],np.uint8)
    for f in source['frames']:
        a=np.array(Image.open(OUT/f['raw']).convert('RGBA'));assert not a[:32,:,3].any() and not a[-32:,:,3].any() and not a[:,:32,3].any() and not a[:,-32:,3].any()
        x0,y0,x1,y1=f['sourceRect'];a=a[32:-32,32:-32];mask=a[:,:,3]>0;rebuilt[y0:y1,x0:x1][mask]=a[mask];coverage[y0:y1,x0:x1][mask]+=1;count+=1
    positive=original[:,:,3]>0;assert np.all(coverage[positive]==1);assert np.array_equal(original[positive],rebuilt[positive])
groups={'sukuna':(1,0,48),'sukuna_cast':(2,0,24),'sukuna_vfx':(3,0,24),'sukuna_intro':(4,0,12),'sukuna_intro_vfx':(4,12,24),'sukuna_ultimate_actor':(5,0,4),'sukuna_ultimate_vfx':(5,4,16),'sukuna_dialogue':(6,0,4)}
for key,(num,start,end) in groups.items():
    m=r['atlases'][key];w,h=m['frameSize'];im=Image.open(ROOT/'dist/assets/characters/sukuna'/(key+'.webp')).convert('RGBA')
    for i,n in enumerate(range(start,end)):
        cell=im.crop(((i%m['columns'])*w,(i//m['columns'])*h,(i%m['columns']+1)*w,(i//m['columns']+1)*h));b=cell.getbbox();assert min(b[0],b[1],w-b[2],h-b[3])>=32
        raw=Image.open(OUT/f'source_{num}_{n:02}.png').convert('RGBA');got=np.array(cell.crop(b));expected=np.array(raw.crop(raw.getbbox()));assert np.array_equal(got[:,:,3],expected[:,:,3]);assert np.array_equal(got[expected[:,:,3]>0],expected[expected[:,:,3]>0]),(key,i)
assert count==140
print('PASS:140 unique raw frames,6 unchanged sources,exact original RGBA reconstruction,8 lossless native atlases,32px clear borders.')
