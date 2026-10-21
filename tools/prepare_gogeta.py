"""Eight-frame Gogeta atlases. Preserve original alpha, including soft VFX glow."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json
from scipy import ndimage
R=Path(__file__).resolve().parents[1]
base=Image.open(R/'art/sources/gogeta.png').convert('RGBA');skills=Image.open(R/'art/sources/gogeta_skills.png').convert('RGBA')
assert base.size==skills.size==(1536,1024)
out=R/'art/frames/gogeta';out.mkdir(parents=True,exist_ok=True)
vout=R/'art/frames/gogeta_vfx';vout.mkdir(parents=True,exist_ok=True)
runtime=R/'dist/assets/characters/gogeta';runtime.mkdir(parents=True,exist_ok=True)
(R/'art/atlases').mkdir(exist_ok=True)
by=[0,149,274,414,554,677,813,938,1024];sy=[0,150,298,445,602,706,802,923,1024]
names=['idle','run','melee','kick','dash','guard','hurt','defeat','bigbang','stardust','meteor','stardustfall']
atlas=Image.new('RGBA',(2560,2688));contact=Image.new('RGB',(1280,1344),'#38554a');draw=ImageDraw.Draw(contact)
meta={'frameSize':[320,224],'pivot':[160,192],'columns':8,'animations':{}}
for row,name in enumerate(names):
 source=base if row<8 else skills;sr=row if row<8 else row-8;ys=by if row<8 else sy
 for col in range(8):
  # The generated casting sheet uses three cells for detached VFX instead of a body.
  # Hold the preceding body pose for those frames; the separate VFX atlas supplies the release.
  sc=3 if row==8 and col in [4,5] else 4 if row in [9,11] and col==5 else col
  crop=source.crop((sc*192,ys[sr],(sc+1)*192,ys[sr+1]));a=np.array(crop);h,w=a.shape[:2]
  labels,n=ndimage.label(a[:,:,3]>40);sizes=np.bincount(labels.ravel());sizes[0]=0
  if n:
   primary=labels==sizes.argmax();a[:,:,3]=np.where(ndimage.binary_dilation(primary,iterations=3),a[:,:,3],0)
  yy,xx=np.indices((h,w));hair=(a[:,:,0]>150)&(a[:,:,1]>95)&(a[:,:,2]<135)&(a[:,:,3]>150)&(yy<h*.55)
  hx=float(np.median(xx[hair])) if hair.any() else w/2
  feet=(a[:,:,3]>150)&(yy>h*.65)&(abs(xx-hx)<80)
  fy=int(yy[feet].max()+1) if feet.any() else (crop.getbbox() or (0,0,w,h))[3]
  if row==0 and col==0:scale=145/(fy-int(yy[a[:,:,3]>150].min()))
  crop=Image.fromarray(a).resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS)
  frame=Image.new('RGBA',(320,224));frame.alpha_composite(crop,(160-round(hx*scale),192-round(fy*scale)))
  frame.save(out/f'{name}_{col:02}.png');atlas.alpha_composite(frame,(col*320,row*224));thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb);draw.text((col*160,row*112),f'{name} {col}',fill='white')
 meta['animations'][name]={'row':row,'frames':8}
atlas.save(R/'art/atlases/gogeta.png');atlas.save(runtime/'gogeta.webp',lossless=True,method=6);contact.save(out/'contact.png');(out/'atlas.json').write_text(json.dumps(meta,indent=2))
# Per-frame bounds deliberately overlap where the source uses a long beam across two grid cells.
boxes=[[(0,180),(180,335),(335,525),(525,685),(685,978),(978,1158),(1158,1350),(1350,1536)],[(0,175),(175,340),(340,520),(520,690),(690,974),(974,1168),(1168,1350),(1350,1536)],[(0,178),(178,352),(352,557),(557,705),(705,925),(925,1155),(1155,1360),(1360,1536)],[(0,175),(175,345),(345,525),(525,705),(705,930),(930,1155),(1155,1360),(1360,1536)]]
vfx=Image.new('RGBA',(4096,1536));contact=Image.new('RGB',(1536,576),'#38554a')
for row,name in enumerate(['bigbang','stardust','meteor','stardustfall']):
 for col in range(8):
  left,right=boxes[row][col];crop=skills.crop((left,sy[row+4],right,sy[row+5]))
  a=np.array(crop);labels,n=ndimage.label(a[:,:,3]>16);sizes=np.bincount(labels.ravel());sizes[0]=0
  if n and col not in [0,7]:
   primary=sizes.argmax();border=set(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]]));border.discard(0);border.discard(primary)
   for fragment in border:
    remove=ndimage.binary_dilation(labels==fragment,iterations=3)&(labels!=primary);a[:,:,3][remove]=0
   crop=Image.fromarray(a)
  frame=Image.new('RGBA',(512,384));frame.alpha_composite(crop,((512-crop.width)//2,(384-crop.height)//2))
  frame.save(vout/f'{name}_{col:02}.png');vfx.alpha_composite(frame,(col*512,row*384));thumb=frame.resize((192,144));contact.paste(thumb,(col*192,row*144),thumb)
vfx.save(R/'art/atlases/gogeta_vfx.png');vfx.save(runtime/'gogeta_vfx.webp',lossless=True,method=6);contact.save(vout/'contact.png')
(vout/'atlas.json').write_text(json.dumps({'frameSize':[512,384],'pivot':[256,192],'columns':8,'sourceAlphaPreserved':True,'animations':{n:{'row':i,'frames':8} for i,n in enumerate(['bigbang','stardust','meteor','stardustfall'])}},indent=2))
print('Gogeta:96 character frames (held release poses),32 independent alpha-preserved VFX frames.')
