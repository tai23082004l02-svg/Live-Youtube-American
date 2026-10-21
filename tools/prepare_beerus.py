"""Extract the actual Beerus illustration layout, preserving ears, tail and effect margins."""
from pathlib import Path
from PIL import Image,ImageDraw
from scipy import ndimage
import numpy as np,json
R=Path(__file__).resolve().parents[1]
OUT=R/'art/frames/beerus';OUT.mkdir(parents=True,exist_ok=True)
RUN=R/'dist/assets/characters/beerus';RUN.mkdir(parents=True,exist_ok=True)
base=Image.open(R/'art/sources/beerus.png').convert('RGBA')
skills=Image.open(R/'art/sources/beerus_skills.png').convert('RGBA')
intro=Image.open(R/'art/sources/beerus_intro.png').convert('RGBA')
BY=[0,202,377,570,777,936,1128,1306,1448]
SY=[0,230,452,690,899,1085,1215,1448]
IY=[0,241,477,730,1005,1199]
NATIVE_META={}
def extract(src,row,col,ys,body=False):
    a=np.array(src.crop((0,ys[row],src.width,ys[row+1])))
    labels,n=ndimage.label(a[:,:,3]>90)
    boxes=ndimage.find_objects(labels);parts=[]
    for i,b in enumerate(boxes):
        if b is None:continue
        area=int((labels[b]==i+1).sum())
        if area>500:parts.append((i+1,b,area))
    centers=[(c+.5)*src.width/6 for c in range(6)]
    candidates=[(i,b,area) for i,b,area in parts if min(5,int((b[1].start+b[1].stop)/2/src.width*6))==col]
    if body and candidates:
        i,b,area=max(candidates,key=lambda v:v[2])
        if b[1].stop-b[1].start<src.width/6*1.5:
            mask=ndimage.binary_dilation(labels==i,iterations=5)
            a[:,:,3]=np.where(mask,a[:,:,3],0)
            cut=Image.fromarray(a);box=cut.getbbox();return cut.crop(box)
    # Effects use a full padded source cell: retain soft alpha instead of discarding glow.
    left=round(col*src.width/6);right=round((col+1)*src.width/6)
    cut=Image.fromarray(a).crop((left,0,right,a.shape[0]))
    return cut
def build_native(name,rows):
    # Retain the actual source pixels. The renderer applies the old fitted scale
    # once, avoiding the earlier atlas downsample followed by another downsample.
    w,h=512,384;atlas=Image.new('RGBA',(6*w,len(rows)*h));frames=[]
    for row,entries in enumerate(rows):
        for col,(cut,requested_scale) in enumerate(entries):
            x=(w-cut.width)//2;y=320-cut.height
            assert x>=24 and y>=24 and x+cut.width<=w-24
            atlas.paste(cut,(col*w+x,row*h+y))
            fit=min(requested_scale,288/cut.width,180/cut.height)
            frames.append({'row':row,'column':col,'sourceSize':list(cut.size),'offset':[x,y],'fitScale':fit})
    atlas.save(RUN/f'{name}_native.webp',lossless=True,method=4)
    meta={'frameSize':[w,h],'pivot':[256,320],'columns':6,'rows':len(rows),'frames':frames}
    if name=='beerus':
        f=frames[0];cw,ch=f['sourceSize'];scale=f['fitScale'];oldx=(320-round(cw*scale))//2;oldy=192-round(ch*scale)
        meta['portraitRect']=[f['offset'][0]+(115-oldx)/scale,f['offset'][1]+(30-oldy)/scale,95/scale,125/scale]
    NATIVE_META[name]=meta

def build(name,rows,body=False):
    if body:build_native(name,rows)
    w,h=(320,224) if body else (512,384)
    atlas=Image.new('RGBA',(6*w,len(rows)*h));contact=Image.new('RGB',(960,len(rows)*112),'#314b47');draw=ImageDraw.Draw(contact)
    for row,entries in enumerate(rows):
        for col,(cut,scale) in enumerate(entries):
            scale=min(scale,(w-32)/cut.width,(180 if body else h-32)/cut.height)
            cut=cut.resize((max(1,round(cut.width*scale)),max(1,round(cut.height*scale))),Image.Resampling.LANCZOS)
            x=(w-cut.width)//2;y=192-cut.height if body else (h-cut.height)//2
            assert min(x,y)>=8 and x+cut.width<=w-8 and y+cut.height<=h-8
            frame=Image.new('RGBA',(w,h));frame.alpha_composite(cut,(x,y))
            frame.save(OUT/f'{name}_{row}_{col}.png');atlas.alpha_composite(frame,(col*w,row*h))
            thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb)
            draw.text((col*160+2,row*112+2),f'{row}:{col}',fill='white')
    atlas.save(R/f'art/atlases/{name}.png');atlas.save(RUN/f'{name}.webp',lossless=True,method=4);contact.save(OUT/f'{name}_contact.png')
    (OUT/f'{name}.json').write_text(json.dumps({'frameSize':[w,h],'pivot':[160,192] if body else [256,192],'rows':len(rows),'framesPerRow':6,'runtimePadding':8},indent=2))
bodyrows=[[(extract(base,r,c,BY,True),.78) for c in range(6)] for r in range(8)]
bodyrows += [[(extract(skills,r,c,SY,True),.70) for c in range(6)] for r in range(3)]
# Actual skill sheet has three cast rows. Reuse the composed intro power pose for wrath.
bodyrows += [[(extract(intro,2,c,IY,True),.68) for c in range(6)]]
build('beerus',bodyrows,True)
build('beerus_intro',[[(extract(intro,r,c,IY,True),.68) for c in range(6)] for r in range(3)],True)
build('beerus_vfx',[[(extract(skills,r,c,SY),1) for c in range(6)] for r in range(3,7)])
build('beerus_intro_vfx',[[(extract(intro,r,c,IY),1) for c in range(6)] for r in range(3,5)])
(R/'dist/src/render/beerus-meta.js').write_text('export const BEERUS_NATIVE_META='+json.dumps(NATIVE_META)+';\n',encoding='utf-8')
print('Beerus:72 body/cast,18 intro,24 skill VFX,12 intro VFX. Full cells padded inside runtime atlas.')
