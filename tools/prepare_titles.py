"""Split irregular wordmarks by alpha islands; preserve every source alpha pixel."""
from pathlib import Path
import json
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import label,find_objects,distance_transform_edt
root=Path(__file__).resolve().parents[1]
im=Image.open(root/'art/sources/Down Arena Wordmark Sprite Sheet.png').convert('RGBA');a=np.array(im)
l,n=label(a[:,:,3]>16);seeds=np.zeros(l.shape,np.uint8)
regions=[]
for i,b in enumerate(find_objects(l)):
 if b and np.count_nonzero(l[b]==i+1)>1000:regions.append((i+1,b))
assert len(regions)==8
names=['down_arena','victory','champion','vs','tournament_draw','next_battle','draw','rematch']
# Component scan order is determined by the topmost visible pixel.
for j,(component,b) in enumerate(regions,1):seeds[l==component]=j
_,indices=distance_transform_edt(seeds==0,return_indices=True)
owner=seeds[tuple(indices)]
out=root/'dist/assets/ui/titles';out.mkdir(parents=True,exist_ok=True)
meta={};preview=Image.new('RGB',(1100,720),'#12202e');painter=ImageDraw.Draw(preview)
retained=0
for j,name in enumerate(names,1):
 pixels=a.copy();pixels[owner!=j]=0;retained+=np.count_nonzero(pixels[:,:,3]);part=Image.fromarray(pixels);box=part.getbbox();part=part.crop(box)
 padded=Image.new('RGBA',(part.width+48,part.height+48));padded.paste(part,(24,24));padded.save(out/(name+'.webp'),lossless=True,method=6)
 meta[name]={'width':padded.width,'height':padded.height,'sourceBounds':list(box),'padding':24}
 thumb=padded.copy();thumb.thumbnail((510,145));x=(j-1)%2*550+(550-thumb.width)//2;y=(j-1)//2*180;preview.paste(thumb,(x,y),thumb);painter.text(((j-1)%2*550+20,y+155),name,fill='white')
assert retained==np.count_nonzero(a[:,:,3]),'No source alpha pixel may be discarded'
(out/'meta.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
preview.save(root/'art/title_split_check.png')
print('8 wordmarks exported; all source alpha pixels retained,24px transparent padding each.')
