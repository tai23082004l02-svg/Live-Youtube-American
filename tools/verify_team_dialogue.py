from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
folder=ROOT/'art/frames/team_dialogue'
m=json.loads((folder/'metadata.json').read_text())
source=ROOT/'art/sources/team_ultimate_dialogue.png'
assert hashlib.sha256(source.read_bytes()).hexdigest()==m['sourceSHA256']
original=np.array(Image.open(source).convert('RGBA'));rebuilt=np.zeros_like(original);counts=np.zeros(original.shape[:2],dtype=int)
atlas=Image.open(ROOT/'dist/assets/effects/team_dialogue.webp').convert('RGBA')
for f in m['frames']:
    raw=np.array(Image.open(folder/(f['name']+'_raw.png')).convert('RGBA'));x0,y0,x1,y1=f['sourceRect'];mask=raw[:,:,3]>0
    rebuilt[y0:y1,x0:x1][mask]=raw[mask];counts[y0:y1,x0:x1]+=mask
    fw,fh=m['frameSize'];frame=np.array(atlas.crop((f['column']*fw,f['row']*fh,(f['column']+1)*fw,(f['row']+1)*fh)))
    x,y=f['offset'];part=frame[y:y+raw.shape[0],x:x+raw.shape[1]]
    assert np.array_equal(part[mask],raw[mask]),f['name']
    assert not frame[:30,:,3].any() and not frame[-30:,:,3].any() and not frame[:,:30,3].any() and not frame[:,-30:,3].any()
mask=original[:,:,3]>0
assert np.all(counts[mask]==1) and np.array_equal(original[mask],rebuilt[mask])
print('PASS: six lossless padded panels, every source RGBA pixel retained once, original hash unchanged, 30px clear runtime edges.')
