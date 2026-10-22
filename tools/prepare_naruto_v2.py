"""Extract reviewed Naruto v2 source rows using alpha-aware seams, without modifying sources.
Dependencies: Pillow, numpy, scipy. Native raw RGBA is preserved exactly once;
runtime atlases scale each source group uniformly to a 145px reference body.
"""
from pathlib import Path
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage
from prepare_team_dialogue import seam
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art/frames/naruto_v2';RUN=ROOT/'dist/assets/characters/naruto_v2'
OUT.mkdir(parents=True,exist_ok=True);RUN.mkdir(parents=True,exist_ok=True)
reports=[];meta={};groups={}

def extract(name,counts,body_rows,reference_row=0):
 path=ROOT/f'art/drafts/naruto-v2/naruto_v2_{name}.png';im=Image.open(path).convert('RGBA');a=np.array(im);h,w=a.shape[:2];alpha=a[:,:,3];yy,xx=np.indices(alpha.shape)
 ys=[round(r*h/len(counts)) for r in range(len(counts)+1)]
 cuts=[seam(alpha,y) for y in ys[1:-1]]
 rowmap=sum((yy>=c[None,:]).astype(np.int16) for c in cuts)
 owner=np.zeros((h,w),np.int16);serial=0
 for r,n in enumerate(counts):
  rowalpha=alpha[ys[r]:ys[r+1]]
  centers=[round(c*w/n) for c in range(1,n)]
  cuts=[seam(rowalpha.T,x) for x in centers]
  colmap=sum((xx>=c[np.clip(yy-ys[r],0,len(c)-1)]).astype(np.int16) for c in cuts) if cuts else np.zeros((h,w),np.int16)
  owner[rowmap==r]=serial+colmap[rowmap==r];serial+=n
 # Attach small disconnected glow islands to the nearest strong silhouettes; preserve
 # all original positive-alpha samples. Large joined silhouettes keep seam ownership.
 labels,n=ndimage.label(alpha>80)
 for i,box in enumerate(ndimage.find_objects(labels),1):
  if box is None:continue
  mask=labels[box]==i;votes=np.bincount(owner[box][mask],minlength=serial)
  if mask.sum()<100 or votes.max()/mask.sum()>.92:
   owner[box][mask]=int(votes.argmax())
 nearest=ndimage.distance_transform_edt(labels==0,return_distances=False,return_indices=True)
 owner=owner[tuple(nearest)]
 frames=[];mass=0;reference=[];serial=0
 for r,count in enumerate(counts):
  row=[]
  for c in range(count):
   cell=a.copy();cell[owner!=serial]=0;serial+=1;cut=Image.fromarray(cell);box=cut.getbbox();assert box,(name,r,c)
   raw=cut.crop(box);raw.save(OUT/f'{name}_{r}_{c}.png');mass+=int(np.array(raw)[:,:,3].astype(np.uint64).sum())
   strong=np.array(raw)[:,:,3]>64;lab,num=ndimage.label(strong);sizes=np.bincount(lab.ravel());sizes[0]=0
   keep=sizes>30;keep[0]=False;by,bx=np.where(keep[lab]);assert len(bx),(name,r,c)
   core=(int(bx.min()),int(by.min()),int(bx.max())+1,int(by.max())+1)
   if r in body_rows:
    # Hair center is steadier than sword/cape extremes; bottom is opaque foot baseline.
    p=np.array(raw);rgb=p[:,:,:3].astype(int);hair=(rgb[:,:,0]>170)&(rgb[:,:,1]>100)&(rgb[:,:,2]<140)&(p[:,:,3]>128)
    hl,hn=ndimage.label(hair);hs=np.bincount(hl.ravel());hs[0]=0
    hx=ndimage.center_of_mass(hair,hl,int(hs.argmax()))[1] if hn and hs.max()>15 else (core[0]+core[2])/2
    pivot=(hx,core[3])
   else:pivot=((core[0]+core[2])/2,(core[1]+core[3])/2)
   f={'raw':raw,'pivot':pivot,'source':name,'row':r,'col':c,'box':box,'core':core,'body':r in body_rows}
   row.append(f)
   if r==reference_row:reference.append(core[3]-core[1])
  frames.append(row)
 assert mass==int(alpha.astype(np.uint64).sum()),name
 scale=145/float(np.median(reference))
 for row in frames:
  for f in row:f['scale']=scale if f['body'] else 1
 reports.append({'source':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'size':[w,h],'rowCounts':counts,'nativeFrames':serial,'frames':[{'row':f['row'],'col':f['col'],'box':list(f['box'])} for row in frames for f in row],'allSourceAlphaAccountedFor':True,'alphaMass':mass,'referenceBodyScale':scale})
 return frames

def atlas(key,rows):
 flat=[f for row in rows for f in row];pad=32;ex=[0,0,0,0]
 for f in flat:
  w,h=f['raw'].size;px,py=f['pivot'];s=f['scale'];ex=[max(ex[0],px*s),max(ex[1],(w-px)*s),max(ex[2],py*s),max(ex[3],(h-py)*s)]
 px,py=math.ceil(ex[0])+pad,math.ceil(ex[2])+pad
 fw=math.ceil((sum(ex[:2])+2*pad)/16)*16;fh=math.ceil((sum(ex[2:])+2*pad)/16)*16
 cols=max(map(len,rows));im=Image.new('RGBA',(fw*cols,fh*len(rows)));bounds=[]
 contact=Image.new('RGB',(cols*210,len(rows)*190),'#34434e');draw=ImageDraw.Draw(contact)
 for r,row in enumerate(rows):
  rb=[]
  for c,f in enumerate(row):
   raw=f['raw'];s=f['scale'];cut=raw.resize((max(1,round(raw.width*s)),max(1,round(raw.height*s))),Image.Resampling.LANCZOS)
   frame=Image.new('RGBA',(fw,fh));frame.alpha_composite(cut,(round(px-f['pivot'][0]*s),round(py-f['pivot'][1]*s)))
   box=frame.getbbox();assert box and min(box[:2])>=pad-2 and box[2]<=fw-pad+2 and box[3]<=fh-pad+2,(key,r,c,box)
   im.alpha_composite(frame,(c*fw,r*fh));rb.append(list(box))
   thumb=frame.copy();thumb.thumbnail((200,165));contact.paste(thumb,(c*210+(210-thumb.width)//2,r*190+20),thumb);draw.text((c*210+4,r*190+3),f'{r}:{c}',fill='white')
  bounds.append(rb)
 im.save(RUN/f'{key}.webp',lossless=True,method=6);contact.save(OUT/f'{key}_contact.png')
 meta[key]={'frameSize':[fw,fh],'pivot':[px,py],'columns':cols,'rows':len(rows),'rowCounts':list(map(len,rows)),'bounds':bounds}
 groups[key]=rows
 print(key,im.size,'cells',sum(map(len,rows)),flush=True)

a=extract('kcm_actions',[4]*8,set(range(8)))
b=extract('baryon_actions',[4]*8,set(range(8)))
k=extract('kcm_skills',[4]*4,{0})
r=extract('baryon_skills',[4]*4,{0})
i=extract('intro',[4]*4,{0,1},1)
t=extract('transform',[4]*3,{0,1},0)
u=extract('ultimate',[4]*4,{0,1},0)
d=extract('dialogue',[2]*2,set())
atlas('naruto_v2',a);atlas('naruto_v2_baryon',b)
atlas('naruto_v2_cast',[k[0]]);atlas('naruto_v2_baryon_cast',[r[0]])
atlas('naruto_v2_vfx',k[1:]);atlas('naruto_v2_baryon_vfx',r[1:])
atlas('naruto_v2_intro',i[:2]);atlas('naruto_v2_intro_vfx',i[2:])
atlas('naruto_v2_transform',t[:2]);atlas('naruto_v2_transform_vfx',t[2:])
atlas('naruto_v2_ultimate_actor',u[:2]);atlas('naruto_v2_ultimate_vfx',u[2:])
atlas('naruto_v2_dialogue',d)
(ROOT/'dist/src/render/naruto-v2-meta.js').write_text('export const NARUTO_V2_META='+json.dumps(meta,separators=(',',':'))+';\n')
(OUT/'extraction_report.json').write_text(json.dumps({'sources':reports,'atlases':meta},indent=2)+'\n')
portrait=a[0][0]['raw'].copy();portrait.thumbnail((120,110));portrait.save(ROOT/'dist/assets/ui/portraits/naruto_v2.webp',lossless=True)
