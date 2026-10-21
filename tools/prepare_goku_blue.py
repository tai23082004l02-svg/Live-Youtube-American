"""Source-specific cuts; preserve alpha and whole effects without thresholding glow."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
import numpy as np
from scipy import ndimage
R=Path(__file__).resolve().parents[1]
runtime=R/'dist/assets/characters/goku_blue';runtime.mkdir(parents=True,exist_ok=True)
out=R/'art/frames/goku_blue';out.mkdir(parents=True,exist_ok=True)
sources={n:Image.open(R/f'art/sources/{n}.png').convert('RGBA') for n in ['goku_blue','goku_blue_skills','goku_blue_transform']}
base_y=[0,158,306,465,638,778,940,1085,1200,1365,1536]
skill_y=[0,232,435,650,883,1040,1180,1320,1536]
intro_y=[0,221,433,650,865,1074,1217,1370,1536]
def crop(src,row,col,ys,defeat=False):
    xs=[0,201,385,578,802,1024] if defeat else [0,171,342,513,684,855,1024]
    c=min(col,4) if defeat else col
    return src.crop((xs[c],ys[row],xs[c+1],ys[row+1]))
def bodycrop(src,row,col,ys,defeat=False):
    # Find the complete connected silhouette across the entire source row BEFORE cutting.
    # This retains hands/boots crossing the nominal grid and excludes neighboring remnants.
    a=np.array(src.crop((0,ys[row],1024,ys[row+1])))
    labels,n=ndimage.label(a[:,:,3]>50);objects=ndimage.find_objects(labels)
    candidates=[]
    for i,box in enumerate(objects):
        if box is None:continue
        area=int((labels[box]==i+1).sum())
        if area>700:candidates.append((box[1].start, i+1,box))
    candidates.sort()
    # Five defeat poses are intentional; hold the final pose for cell six.
    count=5 if defeat else 6
    if len(candidates)!=count:raise ValueError((row,len(candidates),count))
    _,label,box=candidates[min(col,count-1)]
    mask=ndimage.binary_dilation(labels==label,iterations=4)
    a[:,:,3]=np.where(mask,a[:,:,3],0)
    image=Image.fromarray(a);bbox=image.getbbox()
    return image.crop((max(0,bbox[0]-4),0,min(1024,bbox[2]+4),a.shape[0]))
def effectcrop(src,row,col,ys):
    a=np.array(src.crop((0,ys[row],1024,ys[row+1])))
    labels,n=ndimage.label(a[:,:,3]>60);mask=np.zeros(labels.shape,bool)
    xx=np.indices(labels.shape)[1]
    for i,box in enumerate(ndimage.find_objects(labels)):
        if box is None:continue
        cx=(box[1].start+box[1].stop)/2
        if src is sources['goku_blue_skills'] and row==4 and col==4 and box[1].stop<710:continue
        if box[1].stop-box[1].start>250:
            mask|=(labels==i+1)&(xx>=round(col*1024/6))&(xx<round((col+1)*1024/6))
        elif min(5,int(cx/1024*6))==col:mask|=labels==i+1
    a[:,:,3]=np.where(ndimage.binary_dilation(mask,iterations=10),a[:,:,3],0)
    image=Image.fromarray(a);box=image.getbbox()
    return image.crop(box) if box else Image.new('RGBA',(1,1))
def build(name,cells,body=False):
    w,h=(320,224) if body else (512,384)
    atlas=Image.new('RGBA',(6*w,len(cells)*h));contact=Image.new('RGB',(960,len(cells)*112),'#34414b')
    for row,cuts in enumerate(cells):
        for col,cut in enumerate(cuts):
            # Common scale: no per-frame stretching. Entire source region remains intact.
            scale=(.95 if name=='goku_blue' and row<10 else .72) if body else min(1,480/cut.width,352/cut.height)
            cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.LANCZOS)
            frame=Image.new('RGBA',(w,h))
            box=cut.getbbox();bottom=box[3] if box else cut.height
            pos=((w-cut.width)//2,192-bottom) if body else ((w-cut.width)//2,(h-cut.height)//2)
            assert pos[0]>=0 and pos[1]>=0 and pos[1]+cut.height<=h,(name,row,col,pos)
            frame.alpha_composite(cut,pos);frame.save(out/f'{name}_{row}_{col}.png');atlas.alpha_composite(frame,(col*w,row*h))
            thumb=frame.resize((160,112));contact.paste(thumb,(col*160,row*112),thumb)
    atlas.save(R/f'art/atlases/{name}.png');atlas.save(runtime/f'{name}.webp',lossless=True,method=4)
    contact.save(out/f'{name}_contact.png')
    (out/f'{name}.json').write_text(json.dumps({'frameSize':[w,h],'rows':len(cells),'columns':6,'sourceAlphaPreserved':True},indent=2))
base=sources['goku_blue'];skills=sources['goku_blue_skills'];intro=sources['goku_blue_transform']
build('goku_blue',[[bodycrop(base,r,c,base_y,r==7) for c in range(6)] for r in range(10)]+[[bodycrop(skills,r,c,skill_y) for c in range(6)] for r in range(4)],True)
build('goku_blue_vfx',[[effectcrop(skills,r,c,skill_y) for c in range(6)] for r in range(4,8)])
build('goku_blue_transform',[[bodycrop(intro,r,c,intro_y) for c in range(6)] for r in range(4)],True)
build('goku_blue_intro_vfx',[[effectcrop(intro,r,c,intro_y) for c in range(6)] for r in range(4,8)])
print('Goku Blue: 84 action/cast, 24 intro, 48 VFX frames; alpha preserved, no runtime frame clipping.')
