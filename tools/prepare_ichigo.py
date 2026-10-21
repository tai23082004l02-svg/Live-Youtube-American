"""Lossless source extraction with connected silhouettes, wide frames and border QA.

All nontransparent source pixels belong to exactly one extracted frame. Nominal
regions select objects, not scissors: connected blades/coat edges may extend
beyond those regions. Original PNGs are never modified.
"""
from pathlib import Path
import hashlib,json,math
from PIL import Image,ImageDraw
import numpy as np
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[1]
SOURCES=ROOT/'art/sources';OUT=ROOT/'art/frames/ichigo'
RUNTIME=ROOT/'dist/assets/characters/ichigo'
PAD=32

def descriptors(source,names,ys,xs,body_rows=0,head_limit=None):
    result=[]
    for row,name in enumerate(names):
        for col in range(len(xs)-1):
            result.append({'name':f'{name}_{col:02}','action':name,'row':row,'column':col,
                           'region':[xs[col],ys[row],xs[col+1],ys[row+1]],'body':row<body_rows,
                           'source':source,'headLimit':head_limit})
    return result

def specifications():
    intro='ichigo_intro.png' if (SOURCES/'ichigo_intro.png').exists() else 'chigo_intro.png'
    return [
      descriptors('ichigo.png',['idle','run','slash','rising','dash','guard','hurt','defeat'],
                  [0,145,275,408,548,660,798,914,1024],[0,445,785,1140,1536],8,1024),
      descriptors('ichigo_skills.png',['getsuga_cast','shunpo_cast','combo_cast','hollow_cast','getsuga','shunpo','combo','hollow_aura'],
                  [0,145,277,415,568,688,772,873,1024],[0,440,800,1195,1536],4,565),
      descriptors(intro,['intro_turn','intro_draw','intro_power','intro_guard','intro_aura','intro_ground'],
                  [0,177,350,535,700,884,1024],[0,415,780,1150,1536],4,700),
      descriptors('ichigo_ultimate.png',['ultimate_charge','ultimate_release','ultimate_energy','ultimate_impact'],
                  [0,275,510,781,1024],[0,415,780,1185,1536],2,460),
      descriptors('ichigo_dialogue.png',['dialogue_blank','dialogue_example','portrait','ultimate_banner'],
                  [0,252,490,805,1024],[0,770,1536]),
    ]

def assign_pixels(rgba,frames,threshold):
    """Keep whole strong components, then assign faint alpha to the nearest core."""
    alpha=rgba[:,:,3];labels,n=ndimage.label(alpha>threshold)
    boxes=ndimage.find_objects(labels);counts=np.bincount(labels.ravel())
    head_labels={};warnings=[];effect_markers=np.zeros(labels.shape,np.int32)
    body_frames=[f for f in frames if f['body']]
    if body_frames:
        r,g,b=rgba[:,:,:3].transpose(2,0,1)
        hair=(r>150)&(g>65)&(g<215)&(b<105)&(alpha>80)
        hair[body_frames[0]['headLimit']:]=False
        hair=ndimage.binary_closing(hair,iterations=2)
        hl,_=ndimage.label(hair);sizes=np.bincount(hl.ravel());sizes[0]=0
        head_ids=np.flatnonzero(sizes>350)
        heads=ndimage.center_of_mass(hair,hl,head_ids);head_boxes=ndimage.find_objects(hl)
        if len(heads)!=len(body_frames):raise ValueError(('Unexpected hair markers',frames[0]['source'],len(heads),len(body_frames)))
        # Source rows are not uniform, but the head centers give an unambiguous row order.
        heads=sorted(zip(head_ids,heads),key=lambda item:item[1][0])
        ordered=[]
        for row in range(len(body_frames)//4):ordered.extend(sorted(heads[row*4:row*4+4],key=lambda item:item[1][1]))
        for index,(head_id,(hy,hx)) in enumerate(ordered):
            core_ids=labels[hl==head_id];core_ids=core_ids[core_ids>0]
            core=int(np.bincount(core_ids).argmax())
            head_labels.setdefault(core,[]).append((index+1,int(head_id)))
            f=body_frames[index];f['head']=[float(hx),float(hy)]
            hb=head_boxes[int(head_id)-1];f['headWidth']=hb[1].stop-hb[1].start
            # Keep the body origin stable independently of an extended sword's bbox.
            f['sourcePivot']=[float(hx),float(f['region'][3]-8)]
    for owner,f in enumerate(frames,1):
        if f['body']:continue
        x0,y0,x1,y1=f['region'];yy,xx=np.nonzero(labels[y0:y1,x0:x1]>0)
        if not len(xx):raise ValueError(('No effect marker',f['name']))
        distance=(xx-(x1-x0)/2)**2+(yy-(y1-y0)/2)**2
        nearest=int(distance.argmin());sx=int(xx[nearest]+x0);sy=int(yy[nearest]+y0)
        label=int(labels[sy,sx]);effect_markers[sy,sx]=owner
        head_labels.setdefault(label,[]).append((owner,None))
    owners=np.zeros(labels.shape,np.int16)
    for label,box in enumerate(boxes,1):
        if box is None:continue
        component=labels[box]==label;heads=head_labels.get(label,[])
        if len(heads)==1:
            owner=heads[0][0];owners[box][component]=owner;continue
        if len(heads)>1:
            # Only joined source silhouettes need a watershed. This does not invent
            # missing art; record the contact so it is visible in the QA report.
            markers=np.zeros(component.shape,np.int32)
            for owner,head_id in heads:
                seed=(effect_markers[box]==owner) if head_id is None else (hl[box]==head_id)
                markers[seed&component]=owner
            markers[~component]=-1
            cost=np.uint8(255-alpha[box]);cost[~component]=255
            split=ndimage.watershed_ift(cost,markers)
            pair={frames[owner-1]['name']:owner for owner,_ in heads}
            if set(pair)=={'getsuga_03','shunpo_03'}:
                # The faint bridge between these two illustrations has its alpha
                # valley at source y674. Keep the upper blast's baseline with it.
                yy=np.indices(component.shape)[0]+box[0].start
                split[component&(yy<674)]=pair['getsuga_03']
                split[component&(yy>=674)]=pair['shunpo_03']
            missing=component&(split<=0)
            if missing.any():
                _,indices=ndimage.distance_transform_edt(split<=0,return_indices=True)
                split[missing]=split[tuple(indices[:,missing])]
            owners[box][component]=split[component]
            warnings.append({'type':'joined_source_components','frames':[frames[owner-1]['name'] for owner,_ in heads]})
            continue
        # Detached particles, chains, whole VFX and panel outlines are assigned as
        # components. They are not clipped along the nominal cell boundary.
        cy,cx=ndimage.center_of_mass(component);cx+=box[1].start;cy+=box[0].start
        best=None
        for index,f in enumerate(frames,1):
            x0,y0,x1,y1=f['region']
            left=max(x0,box[1].start);right=min(x1,box[1].stop)
            top=max(y0,box[0].start);bottom=min(y1,box[0].stop)
            overlap=0 if right<=left or bottom<=top else int((labels[top:bottom,left:right]==label).sum())
            distance=((cx-(x0+x1)/2)/max(1,x1-x0))**2+((cy-(y0+y1)/2)/max(1,y1-y0))**2
            score=overlap/max(1,counts[label])-.015*distance
            if best is None or score>best[0]:best=(score,index)
        owners[box][component]=best[1]
    core=owners>0
    _,indices=ndimage.distance_transform_edt(~core,return_indices=True)
    missing=(alpha>0)&~core;owners[missing]=owners[tuple(indices[:,missing])]
    assert np.all(owners[alpha>0]>0)
    return owners,warnings

def export_source(frames):
    filename=frames[0]['source'];path=SOURCES/filename
    rgba=np.array(Image.open(path).convert('RGBA'))
    owners,warnings=assign_pixels(rgba,frames,8 if 'dialogue' in filename else 48)
    source_mass=int(rgba[:,:,3].astype(np.uint64).sum());mass=0
    for index,f in enumerate(frames,1):
        mask=(owners==index)&(rgba[:,:,3]>0);ys,xs=np.nonzero(mask)
        if not len(xs):raise ValueError(('Empty frame',filename,f['name']))
        x0,x1=int(xs.min()),int(xs.max()+1);y0,y1=int(ys.min()),int(ys.max()+1)
        cut=rgba[y0:y1,x0:x1].copy();cut[:,:,3]=np.where(mask[y0:y1,x0:x1],cut[:,:,3],0)
        extracted=Image.fromarray(cut);raw=Image.new('RGBA',(extracted.width+PAD*2,extracted.height+PAD*2))
        raw.paste(extracted,(PAD,PAD))
        folder=OUT/Path(filename).stem;folder.mkdir(parents=True,exist_ok=True)
        raw.save(folder/(f['name']+'.png'))
        frame_mass=int(cut[:,:,3].astype(np.uint64).sum());mass+=frame_mass
        f.update({'sourceRect':[x0,y0,x1,y1],'rawSize':list(raw.size),'rawPadding':PAD,'alphaMass':frame_mass,
                  'sourceEdgeContact':{'left':bool(mask[:,0].any()),'right':bool(mask[:,-1].any()),'top':bool(mask[0].any()),'bottom':bool(mask[-1].any())},
                  'visibleSourceEdgeContact':{'left':bool((mask[:,0]&(rgba[:,0,3]>64)).any()),'right':bool((mask[:,-1]&(rgba[:,-1,3]>64)).any()),'top':bool((mask[0]&(rgba[0,:,3]>64)).any()),'bottom':bool((mask[-1]&(rgba[-1,:,3]>64)).any())},
                  'rawPath':str((folder/(f['name']+'.png')).relative_to(ROOT)).replace('\\','/')})
        f['_cut']=extracted
        if 'sourcePivot' not in f:f['sourcePivot']=[(x0+x1)/2,(y0+y1)/2]
    assert mass==source_mass,(filename,mass,source_mass)
    return {'file':filename,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sourceSize':[rgba.shape[1],rgba.shape[0]],
            'sourceAlphaMass':source_mass,'extractedAlphaMass':mass,'allSourceAlphaAccountedFor':True,'warnings':warnings}

def atlas(name,rows,body=False,columns=4):
    flat=[f for row in rows for f in row]
    scale=1.0 if body else 1.35 if 'dialogue' in name else 1.4
    # Size the atlas AROUND the complete frames, not the other way round.
    left=right=above=below=0
    for f in flat:
        x0,y0,x1,y1=f['sourceRect'];px,py=f['sourcePivot']
        factor=scale*f.get('actorScale',1)
        left=max(left,(px-x0)*factor);right=max(right,(x1-px)*factor);above=max(above,(py-y0)*factor);below=max(below,(y1-py)*factor)
    px=math.ceil(left)+PAD;py=math.ceil(above)+PAD
    fw=math.ceil((px+right+PAD)/32)*32;fh=math.ceil((py+below+PAD)/32)*32
    image=Image.new('RGBA',(fw*columns,fh*len(rows)))
    meta={'name':name,'frameSize':[fw,fh],'pivot':[px,py],'columns':columns,'rows':len(rows),'scale':scale,'padding':PAD,'frames':[],'animations':{}}
    preview=Image.new('RGB',(columns*280,len(rows)*200),'#33434b');draw=ImageDraw.Draw(preview)
    for row,entries in enumerate(rows):
        meta['animations'][entries[0]['action']]={'row':row,'frames':len(entries)}
        for col,f in enumerate(entries):
            cut=f['_cut'];x0,y0,_,_=f['sourceRect'];spx,spy=f['sourcePivot']
            factor=scale*f.get('actorScale',1)
            scaled=cut.resize((round(cut.width*factor),round(cut.height*factor)),Image.Resampling.LANCZOS)
            x=round(px+(x0-spx)*factor);y=round(py+(y0-spy)*factor)
            frame=Image.new('RGBA',(fw,fh));frame.paste(scaled,(x,y))
            bounds=frame.getbbox();assert bounds and bounds[0]>=PAD-2 and bounds[1]>=PAD-2 and bounds[2]<=fw-PAD+2 and bounds[3]<=fh-PAD+2,(name,f['name'],bounds,[fw,fh])
            image.paste(frame,(col*fw,row*fh))
            meta['frames'].append({'name':f['name'],'row':row,'column':col,'bounds':list(bounds),'source':f['source'],'sourceRect':f['sourceRect'],'sourceScale':factor,'rawPath':f['rawPath']})
            thumb=cut.copy();thumb.thumbnail((256,164),Image.Resampling.LANCZOS)
            preview.paste(thumb,(col*280+(280-thumb.width)//2,row*200+23+(166-thumb.height)//2),thumb)
            draw.rectangle((col*280+3,row*200+20,(col+1)*280-4,(row+1)*200-5),outline='#5e7581')
            draw.text((col*280+8,row*200+4),f['name'],fill='#ffffff')
    image.save(ROOT/f'art/atlases/{name}.png');image.save(RUNTIME/f'{name}.webp',lossless=True,method=4)
    (OUT/f'{name}.json').write_text(json.dumps(meta,indent=2),encoding='utf-8');preview.save(OUT/f'{name}_contact.png')
    print(name,len(flat),'frames',fw,fh,'pivot',px,py,flush=True)
    return meta

def main():
    OUT.mkdir(parents=True,exist_ok=True);RUNTIME.mkdir(parents=True,exist_ok=True)
    sheets=specifications();reports=[export_source(f) for f in sheets]
    base,skills,intro,ultimate,dialogue=sheets
    reference=float(np.median([f['headWidth'] for f in base]))
    for sheet in sheets:
        actors=[f for f in sheet if f['body']]
        if actors:
            factor=reference/float(np.median([f['headWidth'] for f in actors]))
            for f in actors:f['actorScale']=round(factor,6)
    group=lambda a:[a[i:i+4] for i in range(0,len(a),4)]
    metadata=[atlas('ichigo',group(base+skills[:16]+ultimate[:8]),True),
              atlas('ichigo_vfx',group(skills[16:])),atlas('ichigo_intro',group(intro[:16]),True),
              atlas('ichigo_intro_vfx',group(intro[16:])),atlas('ichigo_ultimate_vfx',group(ultimate[8:])),
              atlas('ichigo_dialogue',[dialogue[i:i+2] for i in range(0,8,2)],columns=2)]
    runtime_meta={m['name']:{k:m[k] for k in ['frameSize','pivot','columns','rows']} for m in metadata}
    (ROOT/'dist/src/render/ichigo-meta.js').write_text('export const ICHIGO_META='+json.dumps(runtime_meta)+';\n',encoding='utf-8')
    manifest={'sourceReports':reports,'frameCount':sum(len(s) for s in sheets),'sourceFilesUnmodified':True,
              'atlases':[{k:m[k] for k in ['name','frameSize','pivot','columns','rows']} for m in metadata],
              'frames':[{k:v for k,v in f.items() if not k.startswith('_')} for sheet in sheets for f in sheet]}
    (OUT/'extraction_report.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print('Extracted',manifest['frameCount'],'frames. Full-resolution raw PNG alpha mass matches every source exactly.',flush=True)

if __name__=='__main__':main()
