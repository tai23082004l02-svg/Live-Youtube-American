"""Independently reconstruct all positive-alpha source samples from native extracted frames."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'art/frames/gogeta_blue'
report=json.loads((OUT/'extraction_report.json').read_text())
for source in report['sources']:
 path=ROOT/source['source'];assert hashlib.sha256(path.read_bytes()).hexdigest()==source['sha256']
 a=np.array(Image.open(path).convert('RGBA'));reconstructed=np.zeros_like(a)
 name=path.stem.removeprefix('gogeta_blue_')
 for f in source['frames']:
  raw=np.array(Image.open(OUT/f"{name}_{f['row']}_{f['col']}.png").convert('RGBA'))
  x0,y0,x1,y1=f['box'];assert raw.shape[:2]==(y1-y0,x1-x0)
  mask=raw[:,:,3]>0;region=reconstructed[y0:y1,x0:x1]
  assert not np.any(region[:,:,3][mask]),(name,f,'duplicate alpha')
  region[mask]=raw[mask]
 mask=a[:,:,3]>0
 assert np.array_equal(a[mask],reconstructed[mask]),name
 assert np.array_equal(a[:,:,3],reconstructed[:,:,3]),name
 print(name,source['nativeFrames'],'native frames; every positive-alpha RGBA sample reconstructed exactly once')
for key,m in report['atlases'].items():
 im=Image.open(ROOT/f'dist/assets/characters/gogeta_blue/{key}.webp');w,h=m['frameSize']
 assert im.size==(w*m['columns'],h*m['rows'])
 for r,n in enumerate(m['rowCounts']):
  for c in range(n):
   b=im.crop((c*w,r*h,(c+1)*w,(r+1)*h)).getbbox()
   assert list(b)==m['bounds'][r][c]
   assert b[0]>=30 and b[1]>=30 and b[2]<=w-30 and b[3]<=h-30
print('PASS: source reconstruction, frame counts, atlas dimensions, alpha bounds and transparent padding')
