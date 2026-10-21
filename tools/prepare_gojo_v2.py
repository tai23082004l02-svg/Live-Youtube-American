"""Gojo v2: seam-aware extraction, original alpha retained and padded native atlases."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage
from prepare_team_dialogue import seam
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'art/frames/gojo_v2';RUN=ROOT/'dist/assets/characters/gojo_v2'
OUT.mkdir(parents=True,exist_ok=True);RUN.mkdir(parents=True,exist_ok=True)
reports=[]
def extract(name,rows,cols,body_rows,reference_row=0,ys=None):
 path=ROOT/'art/sources'/name;im=Image.open(path).convert('RGBA');a=np.array(im);alpha=a[:,:,3];h,w=alpha.shape;yy,xx=np.indices(alpha.shape)
 ys=ys or [round(i*h/rows) for i in range(rows+1)];xs=[round(i*w/cols) for i in range(cols+1)]
 ycuts=[seam(alpha,y) for y in ys[1:-1]];rowmap=sum((yy>=cut[None,:]).astype(np.int16) for cut in ycuts);colmap=np.zeros_like(rowmap)
 for r in range(rows):
  cuts=[seam(alpha[ys[r]:ys[r+1]].T,x) for x in xs[1:-1]]
  cell=sum((xx>=cut[np.clip(yy-ys[r],0,ys[r+1]-ys[r]-1)]).astype(np.int16) for cut in cuts);colmap[rowmap==r]=cell[rowmap==r]
 # Keep connected strong silhouettes intact across nominal seams (kicks, hair, boots).
 owner=rowmap*cols+colmap
 labels,n=ndimage.label(alpha>80);boxes=ndimage.find_objects(labels);mapping=np.zeros(n+1,np.int32)
 for i,b in enumerate(boxes,1):
  if b is None:continue
  mask=labels[b]==i;votes=np.bincount(owner[b][mask],minlength=rows*cols);mapping[i]=int(votes.argmax())+1
 nearest=ndimage.distance_transform_edt(labels==0,return_distances=False,return_indices=True);nearlabels=labels[tuple(nearest)];owned=mapping[nearlabels]-1
 rowmap=owned//cols;colmap=owned%cols
 frames=[];mass=0;body_heights=[]
 for r in range(rows):
  for c in range(cols):
   cell=a.copy();cell[(rowmap!=r)|(colmap!=c)]=0;mass+=int(cell[:,:,3].sum());cut=Image.fromarray(cell);box=cut.getbbox();assert box,(name,r,c)
   x0,y0,x1,y1=box;cut=cut.crop(box)
   pixels=np.array(cut);strong=pixels[:,:,3]>32;l,n=ndimage.label(strong);sizes=np.bincount(l.ravel());sizes[0]=0
   valid=sizes>20;valid[0]=False;solid=valid[l];by,bx=np.where(solid)
   if not len(bx):by,bx=np.where(pixels[:,:,3]>0)
   core=(x0+int(bx.min()),y0+int(by.min()),x0+int(bx.max())+1,y0+int(by.max())+1)
   if r in body_rows:
    rgb=pixels[:,:,:3].astype(int);hair=(rgb.min(2)>140)&((rgb.max(2)-rgb.min(2))<95)&(pixels[:,:,3]>80)
    hl,hn=ndimage.label(hair);hs=np.bincount(hl.ravel());hs[0]=0
    if hn and hs.max()>20:
     hy,hx=ndimage.center_of_mass(hair,hl,int(hs.argmax()));cx=x0+hx
    else:cx=(core[0]+core[2])/2
    pivot=(cx,core[3])
   else:pivot=((xs[c]+xs[c+1])/2,(ys[r]+ys[r+1])/2)
   if r==reference_row:body_heights.append(core[3]-core[1])
   f={'cut':cut,'box':box,'pivot':pivot,'body':r in body_rows,'source':name,'row':r,'col':c};frames.append(f);cut.save(OUT/(Path(name).stem+f'_{r}_{c}.png'))
 assert mass==int(alpha.astype(np.uint64).sum())
 body_scale=145/max(1,float(np.median(body_heights)))
 for f in frames:f['scale']=body_scale if f['body'] else 1
 reports.append({'source':name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'size':[w,h],'sourceAlphaMass':mass,'allSourceAlphaAccountedFor':True})
 return frames
base=extract('gojo_v2_actions.png',8,6,set(range(8)))
skills=extract('gojo_v2_skills.png',4,6,{0},0,[0,290,530,770,1024])
intro=extract('gojo_v2_intro.png',4,6,{0,1},1,[0,315,615,850,1024])
ultimate=extract('gojo_v2_ultimate.png',4,6,{0,1},0,[0,300,560,800,1024])
dialogue=extract('gojo_v2_dialogue.png',2,2,set())
# Blank portal-only start frames have the same position as the later entrance.
for f in intro[:3]:f['pivot']=((f['box'][0]+f['box'][2])/2,f['box'][3])
meta={};allframes=[]
def atlas(key,frames,cols):
 pad=32;ext=[0,0,0,0]
 for f in frames:
  x0,y0,x1,y1=f['box'];px,py=f['pivot'];s=f['scale'];ext=[max(ext[0],(px-x0)*s),max(ext[1],(x1-px)*s),max(ext[2],(py-y0)*s),max(ext[3],(y1-py)*s)]
 px=int(np.ceil(ext[0]))+pad;py=int(np.ceil(ext[2]))+pad;fw=int(np.ceil((ext[0]+ext[1]+2*pad)/16)*16);fh=int(np.ceil((ext[2]+ext[3]+2*pad)/16)*16)
 rows=(len(frames)+cols-1)//cols;im=Image.new('RGBA',(fw*cols,fh*rows));preview=Image.new('RGB',(cols*240,rows*175),'#34434e');draw=ImageDraw.Draw(preview);bounds=[]
 for i,f in enumerate(frames):
  cut=f['cut'];s=f['scale'];cut=cut.resize((max(1,round(cut.width*s)),max(1,round(cut.height*s))),Image.Resampling.LANCZOS);x=round(px+(f['box'][0]-f['pivot'][0])*s);y=round(py+(f['box'][1]-f['pivot'][1])*s)
  frame=Image.new('RGBA',(fw,fh));frame.alpha_composite(cut,(x,y));b=frame.getbbox();assert b[0]>=pad-2 and b[1]>=pad-2 and b[2]<=fw-pad+2 and b[3]<=fh-pad+2,(key,i,b,fw,fh);bounds.append(list(b));im.alpha_composite(frame,((i%cols)*fw,(i//cols)*fh));thumb=frame.copy();thumb.thumbnail((230,155));preview.paste(thumb,((i%cols)*240+(240-thumb.width)//2,(i//cols)*175+15),thumb);draw.text(((i%cols)*240+4,(i//cols)*175),str(i),fill='white')
 im.save(RUN/(key+'.webp'),lossless=True,method=6);preview.save(OUT/(key+'_contact.png'));meta[key]={'frameSize':[fw,fh],'pivot':[px,py],'columns':cols,'rows':rows,'bounds':bounds};allframes.append(len(frames));print(key,fw,fh,rows,flush=True)
blue=[skills[i] for i in [0,1,2,2,1,0]];red=[skills[i] for i in [3,4,5,5,4,3]];purple=[skills[i] for i in [0,1,4,4,5,0]]
atlas('gojo_v2',base+blue+red+purple+ultimate[:12],6)
atlas('gojo_v2_vfx',skills[6:],6)
atlas('gojo_v2_intro',intro[:12],6)
atlas('gojo_v2_intro_vfx',intro[12:],6)
atlas('gojo_v2_ultimate_vfx',ultimate[12:],6)
atlas('gojo_v2_dialogue',dialogue,2)
(ROOT/'dist/src/render/gojo-v2-meta.js').write_text('export const GOJO_V2_META='+json.dumps(meta,separators=(',',':'))+';\n',encoding='utf-8')
(OUT/'extraction_report.json').write_text(json.dumps({'sourceReports':reports,'runtimeFrames':sum(allframes),'atlases':meta},indent=2),encoding='utf-8')
portrait=base[0]['cut'].copy();portrait.thumbnail((120,100));portrait.save(ROOT/'dist/assets/ui/portraits/gojo.webp',lossless=True)
print('Gojo v2:124 source frames, all alpha accounted for; padded atlases ready.')
