from PIL import Image,ImageDraw
from pathlib import Path
from scipy import ndimage
import numpy as np,json,zipfile
out=Path('outputs/broly_frames');out.mkdir(parents=True,exist_ok=True)
for name,ys,actions in [('broly',[0,145,265,400,520,652,797,925,1024],['idle','run','melee','dash','beam','powerup','hurt','defeat']),('broly_vfx',[0,185,355,515,675,845,1024],['charge','orb','roar','rush','wave','impact'])]:
 im=Image.open('sprite_sources/'+name+'.png').convert('RGBA');a=np.array(im);a[a[:,:,3]<=5]=0;im=Image.fromarray(a);folder=out/name;folder.mkdir(exist_ok=True);atlas=Image.new('RGBA',(1920,224*len(actions)));meta={'frameSize':[320,224],'animations':{}};contact=Image.new('RGB',(1200,160*len(actions)),(30,39,49));d=ImageDraw.Draw(contact)
 for row,action in enumerate(actions):
  frames=[];entries=[]
  for col in range(6):
   x0,x1=col*256,(col+1)*256;bounds=[]
   for nominal in [ys[row],ys[row+1]]:
    if nominal in [0,1024]:bounds.append(nominal);continue
    lo,hi=max(0,nominal-10),min(1024,nominal+11);counts=(a[lo:hi,x0:x1,3]>110).sum(axis=1);bounds.append(int(lo+(counts+np.abs(np.arange(lo,hi)-nominal)*.1).argmin()))
   crop=im.crop((x0,bounds[0],x1,bounds[1]));c=np.array(crop)
   if name=='broly':
    ll,n=ndimage.label(c[:,:,3]>15);sz=np.bincount(ll.ravel());sz[0]=0;keep=sz>=max(90,sz.max()*.015);keep[0]=False
    for ident in np.unique(np.concatenate([ll[0],ll[-1],ll[:,0],ll[:,-1]])):
     if ident!=sz.argmax():keep[ident]=False
    mask=ndimage.binary_dilation(keep[ll],iterations=2);c[~mask]=0;crop=Image.fromarray(c)
    r,g,b,al=[c[:,:,i].astype(float) for i in range(4)];skin=(r>100)&(g>65)&(b<g*.88)&(r>g*1.08)&(al>180);yy,xx=np.where(skin);px=int(np.median(xx)) if len(xx) else 128;solid=np.where(al>150);py=int(solid[0].max()+1) if len(solid[0]) else crop.height;ox,oy=160-px,192-py
   else:
    ll,n=ndimage.label(c[:,:,3]>15);sz=np.bincount(ll.ravel());sz[0]=0;keep=sz>=8;keep[0]=False
    for ident in np.unique(np.concatenate([ll[0],ll[-1],ll[:,0],ll[:,-1]])):
     if ident!=sz.argmax():keep[ident]=False
    mask=ndimage.binary_dilation(keep[ll],iterations=2);c[~mask]=0;crop=Image.fromarray(c);ox,oy=32,(224-crop.height)//2
   bb=crop.getbbox()
   if bb:ox=max(-bb[0],min(ox,320-bb[2]));oy=max(-bb[1],min(oy,224-bb[3]))
   frame=Image.new('RGBA',(320,224));frame.alpha_composite(crop,(ox,oy));frame.save(folder/f'{action}_{col:02d}.png');frames.append(frame);atlas.alpha_composite(frame,(col*320,row*224))
   anchor=[160,192] if name=='broly' else [160,112]
   if name=='broly_vfx' and action in ['orb','charge','roar']:
    cc=np.array(frame);white=(cc[:,:,0]>210)&(cc[:,:,1]>210)&(cc[:,:,2]>120)&(cc[:,:,3]>100);yy,xx=np.where(white)
    if len(xx):anchor=[int(np.median(xx)) if action!='roar' else 52,int(np.median(yy))]
   entries.append({'file':f'{action}_{col:02d}.png','rect':[col*320,row*224,320,224],'anchor':anchor})
   t=frame.resize((200,140));contact.paste(t,(col*200,row*160+18),t);d.text((col*200+4,row*160+2),action+' '+str(col),fill='white')
  meta['animations'][action]=entries
 atlas.save(folder/'atlas.png');(folder/'atlas.json').write_text(json.dumps(meta,indent=2),encoding='utf-8');contact.save(out/f'{name}_contact.png')
 Path('down-arena/dist/assets/'+name+'.png').write_bytes((folder/'atlas.png').read_bytes())
 Path('down-arena/dist/assets/'+name+'.json').write_text(json.dumps(meta),encoding='utf-8')
(out/'README.txt').write_text('Broly: 48 RGBA frames, 320x224; VFX: 36 RGBA frames, 320x224. Atlas JSON provides per-frame anchors. Concept art has some baked-in glow and tight source gutters; frames are prototype assets, not a finished multi-direction animation set. Character anchor 160,192; VFX anchors vary by sequence. Assets use original pixel scale. Broly and VFX must be integrated as separate render layers.\n',encoding='utf-8')
with zipfile.ZipFile('outputs/Broly_Frames_v1.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out))
print('Separated 48 character + 36 VFX frames, atlases and anchors.')
