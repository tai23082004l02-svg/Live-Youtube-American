"""Preserve every source RGBA pixel, padding six panels without trimming effects.
Touching row glows are separated along low-alpha seams; originals stay unchanged.
"""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art/frames/team_dialogue'
SOURCE=ROOT/'art/sources/team_ultimate_dialogue.png'
NAMES=['cyan','gold','destruction','chakra','cards','crimson']

def seam(alpha,center):
    lo,hi=max(0,center-25),min(alpha.shape[0],center+26)
    cost=(alpha[lo:hi].astype(float)/255)**2*30+np.abs(np.arange(lo,hi)[:,None]-center)*.06
    dp=cost[:,0].copy();back=np.zeros(cost.shape,dtype=np.int16)
    for x in range(1,cost.shape[1]):
        candidates=np.stack([np.r_[np.inf,dp[:-1]]+.3,dp,np.r_[dp[1:],np.inf]+.3])
        choice=candidates.argmin(axis=0);back[:,x]=np.arange(len(dp))+choice-1
        dp=cost[:,x]+candidates.min(axis=0)
    y=int(dp.argmin());path=np.zeros(cost.shape[1],dtype=int)
    for x in range(cost.shape[1]-1,-1,-1):
        path[x]=y+lo;y=int(back[y,x]) if x else y
    return path

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    original=Image.open(SOURCE).convert('RGBA');rgba=np.array(original);h,w=rgba.shape[:2]
    a=rgba[:,:,3];yy,xx=np.indices((h,w));s1=seam(a,round(h/3));s2=seam(a,round(h*2/3))
    labels=(xx>=w//2).astype(int)+2*((yy>=s1[None,:]).astype(int)+(yy>=s2[None,:]).astype(int))
    atlas=Image.new('RGBA',(1152*2,384*3));proof=Image.new('RGBA',(1152,576),'#14202b');draw=ImageDraw.Draw(proof)
    frames=[];coverage=np.zeros((h,w),dtype=np.uint8)
    for i,name in enumerate(NAMES):
        mask=(labels==i)&(a>0);coverage[mask]+=1
        ys,xs=np.where(mask);box=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
        cut=rgba[box[1]:box[3],box[0]:box[2]].copy();cut[~mask[box[1]:box[3],box[0]:box[2]]]=0
        image=Image.fromarray(cut);image.save(OUT/(name+'_raw.png'))
        fw,fh=1152,384;x=(fw-image.width)//2;y=(fh-image.height)//2
        assert min(x,y)>=30,(name,box,x,y)
        frame=Image.new('RGBA',(fw,fh));frame.paste(image,(x,y));frame.save(OUT/(name+'.png'))
        atlas.paste(frame,((i%2)*fw,(i//2)*fh))
        # Source coordinates shared across themes, converted to the padded cell.
        col=i%2;row=i//2;ox=x-box[0];oy=y-box[1];sx=col*(w//2);sy=row*(h/3)
        point=lambda px,py:[round(sx+px+ox),round(sy+py+oy)]
        frames.append({'name':name,'row':row,'column':col,'sourceRect':box,'offset':[x,y],
                       'portrait':point(190 if not col else 205,132),'nameplate':point(370,73 if row==0 else 65),
                       'text':point(355,145),'teammates':[point(v,209 if row<2 else 202) for v in [185,247,310]]})
        thumb=frame.resize((576,192));proof.alpha_composite(thumb,((i%2)*576,(i//2)*192));draw.text(((i%2)*576+8,(i//2)*192+8),name,fill='white')
    assert np.all(coverage[a>0]==1)
    target=ROOT/'dist/assets/effects/team_dialogue.webp';target.parent.mkdir(parents=True,exist_ok=True);atlas.save(target,lossless=True,method=4)
    meta={'frameSize':[1152,384],'columns':2,'rows':3,'sourceSize':[w,h],'sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'frames':frames}
    (OUT/'metadata.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
    (ROOT/'dist/src/render/team-dialogue-meta.js').write_text('export const TEAM_DIALOGUE_META='+json.dumps(meta)+';\n',encoding='utf-8')
    proof.save(OUT/'contact.png');print('Prepared six padded panels; every positive-alpha source pixel assigned exactly once.')

if __name__=='__main__':main()
