"""Hand-authored regions follow long beams instead of assuming four uniform columns."""
from pathlib import Path
from PIL import Image,ImageDraw
import json
import numpy as np
R=Path(__file__).resolve().parents[1]
src=Image.open(R/'art/sources/team_ultimate.png').convert('RGBA')
assert src.size==(1536,1024)
OUT=R/'art/frames/team_ultimate';OUT.mkdir(parents=True,exist_ok=True)
RUN=R/'dist/assets/effects';RUN.mkdir(parents=True,exist_ok=True)
# Nonuniform regions preserve beam heads/tails and large dialogue panels.
regions=[
 [(0,0,380,190),(380,0,780,190),(780,0,1160,190),(1160,0,1536,190)],
 [(0,190,320,353),(325,190,695,353),(695,190,1185,353),(1185,181,1536,355)],
 [(0,353,320,525),(320,353,695,525),(695,353,1180,525),(1180,350,1536,525)],
 [(0,525,305,706),(310,525,680,706),(680,525,1160,706),(1165,525,1536,706)],
 [(0,706,310,868),(310,706,685,868),(685,706,1150,868),(1150,706,1536,868)],
 [(0,868,320,1024),(320,868,680,1024),(680,868,1200,1024),(1200,868,1536,1024)]
]
atlas=Image.new('RGBA',(4096,3072));contact=Image.new('RGB',(1280,960),'#24323e');draw=ImageDraw.Draw(contact)
meta={'frameSize':[1024,512],'columns':4,'rows':6,'sourceRegions':regions,'frames':[]}
for row,cells in enumerate(regions):
 for col,rect in enumerate(cells):
  cut=src.crop(rect)
  if row==3:
   # The next row's cyan shuriken glow protrudes into the purple source regions.
   # Mask only that differently colored neighbor, retaining violet/white destruction glow.
   a=np.array(cut);r=a[:,:,0].astype(float);g=a[:,:,1].astype(float);b=a[:,:,2].astype(float)
   yy=np.indices(r.shape)[0]
   neighbor=((g>r*1.12)&(b>r*1.10)&(g>65))|((yy>r.shape[0]*.86)&(g>r*.9)&(b>r*.9))
   a[:,:,3]=np.where(neighbor,0,a[:,:,3]);cut=Image.fromarray(a)
  # No alpha threshold: preserve faint glow and tiny sparks from each source region.
  scale=min(1.8,960/cut.width,448/cut.height)
  cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.LANCZOS)
  frame=Image.new('RGBA',(1024,512));x=(1024-cut.width)//2;y=(512-cut.height)//2;frame.alpha_composite(cut,(x,y))
  box=frame.getbbox();assert box and min(box[0],box[1])>=24 and box[2]<=1000 and box[3]<=488
  frame.save(OUT/f'{row}_{col}.png');atlas.alpha_composite(frame,(col*1024,row*512));thumb=frame.resize((320,160));contact.paste(thumb,(col*320,row*160),thumb);draw.text((col*320+5,row*160+5),f'{row}:{col}',fill='white')
  meta['frames'].append({'row':row,'col':col,'bounds':box})
atlas.save(R/'art/atlases/team_ultimate.png');atlas.save(RUN/'team_ultimate.webp',lossless=True,method=4);contact.save(OUT/'contact.png');(OUT/'atlas.json').write_text(json.dumps(meta,indent=2))
print('Team Ultimate:24 large1024x512 frames, custom beam/UI source regions, original alpha preserved, padded borders.')
