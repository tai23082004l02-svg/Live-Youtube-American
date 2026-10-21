"""Prepare Yugi and his three summon sheets, preserving original RGBA glow."""
from pathlib import Path
from PIL import Image,ImageDraw
from scipy import ndimage
import numpy as np,json
R=Path(__file__).resolve().parents[1];runtime=R/'dist/assets/characters/yugi';runtime.mkdir(parents=True,exist_ok=True)
settings={'yugi':([0,200,392,585,787,981,1159,1343,1536],8,145),'dark_magician':([0,205,400,591,786,985,1187,1373,1536],6,155),'summoned_skull':([0,200,383,579,778,974,1172,1340,1536],6,150),'kuriboh':([0,177,360,543,717,889,1024],4,95)}
for name,(ys,rows,size) in settings.items():
 src=Image.open(R/f'art/sources/{name}.png').convert('RGBA');out=R/f'art/frames/{name}';out.mkdir(parents=True,exist_ok=True);atlas=Image.new('RGBA',(1920,rows*224));contact=Image.new('RGB',(960,rows*112),'#38554a');draw=ImageDraw.Draw(contact)
 first=src.crop((0,ys[0],round(src.width/6),ys[1]));bbox=first.getbbox();scale=size/(bbox[3]-bbox[1])
 for row in range(rows):
  for col in range(6):
   left=round(col*src.width/6);right=round((col+1)*src.width/6);left=max(0,left-(18 if name=='yugi' and row==7 else 0));right=min(src.width,right+(35 if name=='yugi' and row==7 else 0));crop=src.crop((left,ys[row],right,ys[row+1]));a=np.array(crop);labels,n=ndimage.label(a[:,:,3]>32);sizes=np.bincount(labels.ravel());sizes[0]=0
   if n:a[:,:,3]=np.where(ndimage.binary_dilation(labels==sizes.argmax(),iterations=3),a[:,:,3],0)
   cut=Image.fromarray(a);box=cut.getbbox() or (0,0,cut.width,cut.height);pivot=(box[0]+box[2])/2;foot=box[3];cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.LANCZOS);frame=Image.new('RGBA',(320,224));frame.alpha_composite(cut,(160-round(pivot*scale),192-round(foot*scale)));frame.save(out/f'row{row}_{col:02}.png');atlas.alpha_composite(frame,(col*320,row*224));thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb);draw.text((col*160,row*112),f'{row}:{col}',fill='white')
 atlas.save(R/f'art/atlases/{name}.png');atlas.save(runtime/f'{name}.webp',lossless=True,method=6);contact.save(out/'contact.png');(out/'atlas.json').write_text(json.dumps({'frameSize':[320,224],'pivot':[160,192],'columns':6,'rows':rows},indent=2))
 if name!='yugi':
  vout=R/f'art/frames/{name}_vfx';vout.mkdir(exist_ok=True);vfx=Image.new('RGBA',(3072,768));contact=Image.new('RGB',(1152,288),'#38554a')
  for row in range(2):
   for col in range(6):
    crop=src.crop((round(col*src.width/6),ys[rows+row],round((col+1)*src.width/6),ys[rows+row+1]));frame=Image.new('RGBA',(512,384));frame.alpha_composite(crop,((512-crop.width)//2,(384-crop.height)//2));frame.save(vout/f'row{row}_{col:02}.png');vfx.alpha_composite(frame,(col*512,row*384));thumb=frame.resize((192,144));contact.paste(thumb,(col*192,row*144),thumb)
  vfx.save(R/f'art/atlases/{name}_vfx.png');vfx.save(runtime/f'{name}_vfx.webp',lossless=True,method=6);contact.save(vout/'contact.png');(vout/'atlas.json').write_text(json.dumps({'frameSize':[512,384],'sourceAlphaPreserved':True},indent=2))
print('Yugi pack:144 character/summon frame slots,36 separate VFX frames,7 runtime atlases.')
