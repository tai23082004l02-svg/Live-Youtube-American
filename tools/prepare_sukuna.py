"""Sukuna: seam-aware native extraction; preserve every original positive-alpha pixel."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage
from prepare_team_dialogue import seam

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art/frames/sukuna'; RUN=ROOT/'dist/assets/characters/sukuna'
OUT.mkdir(parents=True,exist_ok=True);RUN.mkdir(parents=True,exist_ok=True)
reports=[];meta={}

def extract(number,rows,cols,body_rows,ys=None):
    paths=list((ROOT/'art/sources').glob(f'Sukuna*-{number}.png'))
    assert len(paths)==1,paths
    path=paths[0];a=np.array(Image.open(path).convert('RGBA'));alpha=a[:,:,3];h,w=alpha.shape
    yy,xx=np.indices((h,w));ys=ys or [round(i*h/rows) for i in range(rows+1)]
    rowmap=sum((yy>=s[None,:]).astype(np.int16) for s in [seam(alpha,y) for y in ys[1:-1]])
    owner=rowmap*cols
    for r in range(rows):
        cuts=[seam(alpha[ys[r]:ys[r+1]].T,round(i*w/cols)) for i in range(1,cols)]
        cm=sum((xx>=s[np.clip(yy-ys[r],0,ys[r+1]-ys[r]-1)]).astype(np.int16) for s in cuts)
        owner[rowmap==r]+=cm[rowmap==r]
    # A whole connected silhouette goes to its majority cell; faint pixels retain original RGBA.
    labels,n=ndimage.label(alpha>80);mapping=np.zeros(n+1,np.int16)
    for i,b in enumerate(ndimage.find_objects(labels),1):
        if b is None:continue
        mapping[i]=np.bincount(owner[b][labels[b]==i],minlength=rows*cols).argmax()+1
    nearest=ndimage.distance_transform_edt(labels==0,return_distances=False,return_indices=True)
    owned=mapping[labels[tuple(nearest)]]-1
    frames=[];coverage=np.zeros_like(alpha,dtype=np.uint8);rec=np.zeros_like(a)
    for i in range(rows*cols):
        mask=(owned==i)&(alpha>0);coverage[mask]+=1
        py,px=np.where(mask);assert len(px),(number,i)
        box=[int(px.min()),int(py.min()),int(px.max()+1),int(py.max()+1)]
        cut=a[box[1]:box[3],box[0]:box[2]].copy();local=mask[box[1]:box[3],box[0]:box[2]];cut[~local]=0
        rec[mask]=a[mask]
        im=Image.fromarray(cut);pad=Image.new('RGBA',(im.width+64,im.height+64));pad.paste(im,(32,32));name=f'source_{number}_{i:02}.png';pad.save(OUT/name)
        rgb=cut[:,:,:3].astype(int);solid=cut[:,:,3]>80
        hair=(rgb[:,:,0]>rgb[:,:,1]+12)&(rgb[:,:,1]>75)&(rgb[:,:,2]>65)&solid
        hl,hn=ndimage.label(hair);sizes=np.bincount(hl.ravel());sizes[0]=0
        if hn and sizes.max()>15:
            hy,hx=np.where(hl==sizes.argmax());headx=float(np.median(hx));hairwidth=float(hx.max()-hx.min()+1)
        else:headx=im.width/2;hairwidth=0
        pivot=[headx,im.height] if i//cols in body_rows else [im.width/2,im.height/2]
        frames.append({'image':im,'sourceRect':box,'pivot':pivot,'hairwidth':hairwidth,'raw':name,'body':i//cols in body_rows})
    assert np.all(coverage[alpha>0]==1) and np.array_equal(rec[alpha>0],a[alpha>0])
    reports.append({'source':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'size':[w,h],'positiveAlphaPixels':int((alpha>0).sum()),'alphaMass':int(alpha.astype(np.uint64).sum()),'exactRGBAReconstruction':True,'sourceEdgePixels':int(((alpha[0]>0).sum()+(alpha[-1]>0).sum()+(alpha[:,0]>0).sum()+(alpha[:,-1]>0).sum())),'frames':[{k:v for k,v in f.items() if k not in ['image']} for f in frames]})
    return frames

def atlas(key,frames,cols,scale=1,feet=False):
    # No source resampling: native cells and per-frame pivots, draw scale applied once by renderer.
    fw=max(f['image'].width for f in frames)+64;fh=max(f['image'].height for f in frames)+64
    fw=(fw+15)//16*16;fh=(fh+15)//16*16;rows=(len(frames)+cols-1)//cols
    im=Image.new('RGBA',(fw*cols,fh*rows));contact=Image.new('RGB',(cols*240,rows*190),'#34434e');draw=ImageDraw.Draw(contact);pivots=[];bounds=[]
    for i,f in enumerate(frames):
        cut=f['image'];x=(fw-cut.width)//2;y=fh-32-cut.height if feet else (fh-cut.height)//2
        im.paste(cut,((i%cols)*fw+x,(i//cols)*fh+y))
        pivots.append([x+f['pivot'][0],y+f['pivot'][1]]);bounds.append([x,y,x+cut.width,y+cut.height])
        thumb=cut.copy();thumb.thumbnail((222,162));contact.paste(thumb,((i%cols)*240+(240-thumb.width)//2,(i//cols)*190+22),thumb);draw.text(((i%cols)*240+5,(i//cols)*190+3),str(i),fill='white')
    im.save(RUN/(key+'.webp'),lossless=True,method=6);contact.save(OUT/(key+'_contact.png'))
    meta[key]={'frameSize':[fw,fh],'columns':cols,'rows':rows,'pivots':pivots,'bounds':bounds,'drawScale':scale}
    print(key,fw,fh,len(frames),flush=True)

base=extract(1,8,6,set(range(8)),[0,150,280,420,565,675,805,930,1024])
skills=extract(2,4,6,set(range(4)))
vfx=extract(3,4,6,set())
intro=extract(4,4,6,{0,1})
ult=extract(5,4,4,{0})
dialogue=extract(6,2,2,set())
atlas('sukuna',base,6,145/np.median([f['image'].height for f in base[:6]]),True)
atlas('sukuna_cast',skills,6,145/np.median([f['image'].height for f in skills[:6]]),True)
atlas('sukuna_vfx',vfx,6,.85)
atlas('sukuna_intro',intro[:12],6,145/np.median([f['image'].height for f in intro[6:12]]),True)
atlas('sukuna_intro_vfx',intro[12:],6,.85)
atlas('sukuna_ultimate_actor',ult[:4],4,145/np.median([f['image'].height for f in ult[:3]]),True)
atlas('sukuna_ultimate_vfx',ult[4:],4,1)
atlas('sukuna_dialogue',dialogue,2,1)
(ROOT/'dist/src/render/sukuna-meta.js').write_text('export const SUKUNA_META='+json.dumps(meta,separators=(',',':'))+';\n',encoding='utf-8')
(OUT/'extraction_report.json').write_text(json.dumps({'sources':reports,'atlases':meta},indent=2),encoding='utf-8')
portrait=base[0]['image'].copy();portrait.thumbnail((120,100));portrait.save(ROOT/'dist/assets/ui/portraits/sukuna.webp',lossless=True)
print('Sukuna: all six sources preserved,140 unique raw frames with32px padding.')
