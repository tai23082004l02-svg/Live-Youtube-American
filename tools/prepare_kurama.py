"""Align the user's Kurama sheet to normal Naruto's 6x10 runtime atlas."""
from pathlib import Path
from PIL import Image,ImageDraw
from scipy import ndimage
import numpy as np,json
ROOT=Path(__file__).resolve().parents[1]
source=Image.open(ROOT/'art/sources/naruto_kurama.png').convert('RGBA')
assert source.size==(1024,1536),source.size
xs=[0,170,340,515,690,860,1024]
ys=[0,160,300,450,610,750,905,1055,1235,1390,1536]
mapping=[('idle',0),('run',1),('melee',2),('dash',4),('rasengan',6),('clones',5),('hurt',8),('defeat',9),('kick',3),('shuriken',7)]
out=ROOT/'art/frames/naruto_kurama';out.mkdir(parents=True,exist_ok=True)
atlas=Image.new('RGBA',(1920,2240));contact=Image.new('RGB',(1200,1500),'#202b3b');draw=ImageDraw.Draw(contact);meta={'frameSize':[320,224],'pivot':[160,192],'animations':{}}
for row,(name,sr) in enumerate(mapping):
    entries=[]
    for col in range(6):
        sc=5 if name=='shuriken' and col==4 else col
        left,right=xs[sc],xs[sc+1]
        if name=='kick' and col==1:right+=20
        if name=='defeat':left,right=[(0,170),(170,335),(330,540),(550,760),(775,1024),(775,1024)][col]
        crop=source.crop((left,ys[sr],right,ys[sr+1]));a=np.array(crop)
        labels,_=ndimage.label(a[:,:,3]>60);sizes=np.bincount(labels.ravel());sizes[0]=0
        mask=ndimage.binary_dilation(labels==sizes.argmax(),iterations=1);a[~mask]=0;a[a[:,:,3]<10]=0
        yy,xx=np.where(a[:,:,3]>180)
        top=yy.min();head=(a[:,:,3]>180)&(np.indices(a.shape[:2])[0]<top+55)
        hy,hx=np.where(head);pivot=int(np.median(hx)) if name!='defeat' else int(np.median(xx))
        frame=Image.new('RGBA',(320,224));frame.alpha_composite(Image.fromarray(a),(160-pivot,192-int(yy.max()+1)))
        file=f'{name}_{col:02d}.png';frame.save(out/file);atlas.alpha_composite(frame,(col*320,row*224));entries.append({'file':file,'rect':[col*320,row*224,320,224],'anchor':[160,192]})
        thumb=frame.resize((200,140));contact.paste(thumb,(col*200,row*150+10),thumb);draw.text((col*200+2,row*150),f'{name} {col}',fill='white')
    meta['animations'][name]=entries
atlas.save(ROOT/'art/atlases/naruto_kurama.png');atlas.save(ROOT/'dist/assets/characters/naruto/naruto_kurama.webp',lossless=True,method=6)
contact.save(out/'contact.png');(out/'atlas.json').write_text(json.dumps(meta,indent=2))
print('Kurama: 60 aligned RGBA slots, with held final resting pose for merged source cells.')
