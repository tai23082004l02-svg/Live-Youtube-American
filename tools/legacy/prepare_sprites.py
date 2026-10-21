from PIL import Image,ImageDraw
import numpy as np
from scipy import ndimage
from pathlib import Path
import json,zipfile,base64
root=Path('outputs/arena_sprites');root.mkdir(parents=True,exist_ok=True)
actions=['idle','run','melee','dash','beam','powerup','hurt','defeat']
# Measured boundaries, not an assumed uniform 6 x 8 grid.
xs=[35,300,540,780,1020,1260,1510]
ys=[0,150,285,425,545,685,820,940,1024]
report={}; previews=[]; html=[]
for name in ['goku','vegeta']:
 im=Image.open('sprite_sources/'+name+'.png').convert('RGBA');a=np.array(im)
 # Remove only near-invisible alpha specks; retain genuine translucent effect edges.
 a[a[:,:,3]<=3]=0; im=Image.fromarray(a)
 folder=root/name;folder.mkdir(exist_ok=True)
 atlas=Image.new('RGBA',(320*6,224*8));meta={'character':name,'frameSize':[320,224],'pivot':[160,192],'fpsSuggested':8,'alignment':'automatic body-color ground estimate; airborne/defeat poses need gameplay offsets','animations':{}}
 contact=Image.new('RGB',(6*240,8*192),(37,43,57));d=ImageDraw.Draw(contact)
 for row,action in enumerate(actions):
  frames=[];entries=[]
  for col in range(6):
   bounds=[]
   for nominal in [ys[row],ys[row+1]]:
    if nominal in [0,1024]: bounds.append(nominal);continue
    lo=max(0,nominal-18);hi=min(1024,nominal+19)
    counts=(a[lo:hi,xs[col]:xs[col+1],3]>100).sum(axis=1)
    score=counts+np.abs(np.arange(lo,hi)-nominal)*0.08
    bounds.append(int(lo+score.argmin()))
   box=(xs[col],bounds[0],xs[col+1],bounds[1]);crop=im.crop(box)
   cc=np.array(crop);ll,nn=ndimage.label(cc[:,:,3]>12);ss=np.bincount(ll.ravel());ss[0]=0
   # Discard tiny detached pieces leaking from adjacent animation rows.
   keep=ss>=max(120,ss.max()*0.025);keep[0]=False
   edge_ids=np.unique(np.concatenate([ll[0,:],ll[-1,:],ll[:,0],ll[:,-1]]))
   biggest=int(ss.argmax())
   for ident in edge_ids:
    if ident!=biggest:keep[ident]=False
   mask=keep[ll];mask=ndimage.binary_dilation(mask,iterations=2)
   cc[~mask]=0;crop=Image.fromarray(cc)
   c=np.array(crop);r,g,b,al=[c[:,:,i].astype(float) for i in range(4)]
   if name=='goku':body=(r>90)&(r>g*1.28)&(g>b*1.20)&(al>200)
   else:body=(b>55)&(b>r*1.35)&(b>g*1.10)&(al>200)
   labels,n=ndimage.label(body);sizes=np.bincount(labels.ravel());sizes[0]=0
   if n:body=labels==sizes.argmax()
   yy,xx=np.where(body)
   solid=np.array(crop.getchannel('A'))>150
   sy,sx=np.where(solid)
   px=int(np.median(xx)) if len(xx) else crop.width//2
   # Preserve relative ground baseline within the pose using opaque silhouette bottom.
   py=int(sy.max()+1) if len(sy) else crop.height
   ox=160-px;oy=192-py
   # All visible source pixels must fit the common frame.
   bb=crop.getbbox()
   if bb:
    ox=max(-bb[0],min(ox,320-bb[2]));oy=max(-bb[1],min(oy,224-bb[3]))
   frame=Image.new('RGBA',(320,224));frame.alpha_composite(crop,(ox,oy));frames.append(frame)
   fn=f'{action}_{col:02d}.png';frame.save(folder/fn);atlas.alpha_composite(frame,(col*320,row*224))
   entries.append({'file':fn,'atlasRect':[col*320,row*224,320,224],'sourceRect':list(box),'sourceOffset':[ox,oy],'pivot':[160,192]})
   thumb=frame.resize((240,168),Image.Resampling.LANCZOS);contact.paste(thumb,(col*240,row*192+19),thumb);d.text((col*240+6,row*192+3),f'{action} {col:02d}',fill='white')
  meta['animations'][action]={'loop':action in ['idle','run','powerup'],'frames':entries}
  bgframes=[]
  for f in frames:
   bg=Image.new('RGB',f.size,(37,43,57));bg.paste(f,mask=f.getchannel('A'));bgframes.append(bg)
  bgframes[0].save(folder/f'{action}_preview.gif',save_all=True,append_images=bgframes[1:],duration=130,loop=0)
  html.append(f'<div><h3>{name} — {action}</h3><img src="{name}/{action}_preview.gif"></div>')
 atlas.save(folder/'atlas.png');(folder/'animations.json').write_text(json.dumps(meta,indent=2),encoding='utf-8');contact.save(root/f'{name}_contact.png');previews.append(contact)
 report[name]={'frames':48,'sourceSize':list(im.size),'alphaZeroPercent':round(float((a[:,:,3]==0).mean()*100),2),'canvas':[320,224]}
(root/'preview.html').write_text('<!doctype html><meta charset="utf-8"><title>Goku & Vegeta sprite preview</title><style>body{background:#151a24;color:white;font-family:system-ui}main{display:grid;grid-template-columns:repeat(4,1fr)}img{max-width:100%}h3{font-size:16px}</style><h1>Goku & Vegeta — animation review</h1><p>Concept frames: 8 fps preview, no interpolation. Artwork includes embedded skill effects.</p><main>'+''.join(html)+'</main>',encoding='utf-8')
(root/'README_VI.txt').write_text('GOI SPRITE THU NGHIEM GOKU & VEGETA\n\nMoi nhan vat: 48 PNG RGBA, 320 x 224 px; atlas 1920 x 1792; animations.json; 8 GIF xem thu.\nMo preview.html de xem cac dong tac. Pivot tham chieu: (160,192). Khong doi ty le anh goc.\n\nDay la frame tach tu anh minh hoa, CHUA phai hoat anh san xuat hoan chinh. Can danh gia do muot, huong tay/chieu, va sai khac hinh dang giua frame. Can chan tu dong chi la so bo; dash/hurt/defeat co the can offset rieng.\n\nHieu ung nang luong da nam trong anh; vung damage va vat the dan phai lap trinh rieng. Khong dung hinh hieu ung lam hitbox. Moi bo chi co mot huong, co the lat ngang khi thu; chua co du 4/8 huong.\n\nidle, run, melee, dash, beam, powerup, hurt, defeat: 6 frame moi dong. Toc do xem thu 8 fps, thoi gian gameplay se chot sau.\n\nBien cat hang da do rieng thay vi chia anh thanh 8 hang bang nhau. Kiem tra contact sheet de phat hien chi tiet sat bien.\n',encoding='utf-8')
(root/'KNOWN_ISSUES.txt').write_text('Concept asset limitations: beam frames 03-04 and powerup frames 02-03 may have cropped or overlapping effects inherited from the source layout. Rebuild energy beams as separate game effects for final use. Alignment is provisional. Review all GIF previews before integration.',encoding='utf-8')
(root/'qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
with zipfile.ZipFile('outputs/Goku_Vegeta_Sprites_v1.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in root.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(root))
print(json.dumps(report));print('ZIP bytes',Path('outputs/Goku_Vegeta_Sprites_v1.zip').stat().st_size)
