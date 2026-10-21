"""Extract Jinwoo's five sheets, preserving all original alpha and full silhouettes."""
import json
import numpy as np
from scipy import ndimage
from PIL import Image
from prepare_team_dialogue import seam
import prepare_ichigo as common

ROOT=common.ROOT
OUT=ROOT/'art/frames/sung_jinwoo'
RUNTIME=ROOT/'dist/assets/characters/sung_jinwoo'

def assign(rgba,frames,threshold):
    alpha=rgba[:,:,3]
    if 'dialogue' in frames[0]['source']:
        yy,xx=np.indices(alpha.shape);cuts=[seam(alpha,y) for y in [246,483,792]]
        return ((xx>=768).astype(np.int16)+2*sum((yy>=cut[None,:]).astype(np.int16) for cut in cuts)+1),[]
    labels,n=ndimage.label(alpha>threshold);boxes=ndimage.find_objects(labels)
    seeds={};markers=np.zeros(alpha.shape,np.int32)
    for index,f in enumerate(frames,1):
        x0,y0,x1,y1=f['region'];region=labels[y0:y1,x0:x1];ys,xs=np.nonzero(region)
        if not len(xs):raise ValueError(('Empty source cell',f['name']))
        cx=(x1-x0)/2;cy=(y1-y0)*(.3 if f['body'] else .5)
        k=int(np.argmin((xs-cx)**2+(ys-cy)**2));x=int(xs[k]+x0);y=int(ys[k]+y0)
        label=int(labels[y,x]);seeds.setdefault(label,[]).append(index);markers[y,x]=index
        if f['body']:f['sourcePivot']=[(x0+x1)/2,y1-8]
    owners=np.zeros(alpha.shape,np.int16);warnings=[]
    for label,box in enumerate(boxes,1):
        if box is None:continue
        mask=labels[box]==label;choices=seeds.get(label,[])
        if len(choices)==1:owners[box][mask]=choices[0]
        elif choices:
            seed=markers[box].copy();seed[~mask]=-1;cost=np.uint8(255-alpha[box]);cost[~mask]=255
            split=ndimage.watershed_ift(cost,seed);missing=mask&(split<=0)
            if missing.any():
                _,nearest=ndimage.distance_transform_edt(split<=0,return_indices=True);split[missing]=split[tuple(nearest[:,missing])]
            owners[box][mask]=split[mask];warnings.append({'type':'joined_source_components','frames':[frames[i-1]['name'] for i in choices]})
        else:
            cy,cx=ndimage.center_of_mass(mask);cx+=box[1].start;cy+=box[0].start
            best=min(range(len(frames)),key=lambda i:((cx-sum(frames[i]['region'][::2])/2)/(frames[i]['region'][2]-frames[i]['region'][0]))**2+((cy-sum(frames[i]['region'][1::2])/2)/(frames[i]['region'][3]-frames[i]['region'][1]))**2)
            owners[box][mask]=best+1
    missing=(alpha>0)&(owners==0)
    if missing.any():
        _,nearest=ndimage.distance_transform_edt(owners==0,return_indices=True);owners[missing]=owners[tuple(nearest[:,missing])]
    assert np.all(owners[alpha>0]>0)
    return owners,warnings

def spec(filename,names,ys,body_rows):
    cols=2 if 'dialogue' in filename else 6
    frames=common.descriptors(filename,names,ys,[int(i*1536/cols) for i in range(cols+1)],body_rows)
    return frames

def main():
    common.OUT=OUT;common.RUNTIME=RUNTIME;common.assign_pixels=assign
    OUT.mkdir(parents=True,exist_ok=True);RUNTIME.mkdir(parents=True,exist_ok=True)
    if (ROOT/'art/sources/sung_jinwoo_ultimate.png').read_bytes()==(ROOT/'art/sources/sung_jinwoo_dialogue.png').read_bytes():raise ValueError('Ultimate source is the dialogue sheet; save the6x6 army image first.')
    base=spec('sung_jinwoo.png',['idle','run','slash','finisher','dash','guard','hurt','defeat'],[0,150,280,412,548,670,800,914,1024],8)
    skills=spec('sung_jinwoo_skills.png',['rush_cast','rush_vfx','exchange_cast','exchange_vfx','summon_cast','igris','domain_cast','domain_vfx'],[0,137,254,389,508,640,774,904,1024],0)
    for f in skills:f['body']=f['row'] in [0,2,4,6]
    intro=spec('sung_jinwoo_intro.png',['intro_walk','intro_draw','intro_power','intro_portal','intro_aura','intro_igris'],[0,183,373,564,717,849,1024],3)
    ultimate=spec('sung_jinwoo_ultimate.png',['arise_cast','arise_release','arise_ground','army_emerge','army_charge','army_impact'],[0,180,351,512,684,850,1024],2)
    dialogue=spec('sung_jinwoo_dialogue.png',['dialogue_blank','dialogue_example','portrait','arise_banner'],[0,246,483,792,1024],0)
    sheets=[base,skills,intro,ultimate,dialogue];reports=[common.export_source(frames) for frames in sheets]
    for f in intro[:18]:f['actorScale']=.8
    for f in ultimate[:12]:f['actorScale']=.85
    group=lambda items:[items[i:i+6] for i in range(0,len(items),6)]
    metadata=[common.atlas('sung_jinwoo',group(base+skills[:6]+skills[12:18]+skills[24:30]+skills[36:42]+ultimate[:12]),True,6),
        common.atlas('sung_jinwoo_vfx',group(skills[6:12]+skills[18:24]+skills[42:48]),columns=6),
        common.atlas('igris',[skills[30:36]],True,6),
        common.atlas('sung_jinwoo_intro',group(intro[:18]),True,6),
        common.atlas('sung_jinwoo_intro_vfx',group(intro[18:]),columns=6),
        common.atlas('sung_jinwoo_ultimate_vfx',group(ultimate[12:]),columns=6),
        common.atlas('sung_jinwoo_dialogue',[dialogue[i:i+2] for i in range(0,8,2)],columns=2)]
    meta={m['name']:{k:m[k] for k in ['frameSize','pivot','columns','rows']} for m in metadata}
    (ROOT/'dist/src/render/jinwoo-meta.js').write_text('export const JINWOO_META='+json.dumps(meta)+';\n',encoding='utf-8')
    report={'sourceReports':reports,'frameCount':sum(map(len,sheets)),'atlases':list(meta),'frames':[{k:v for k,v in f.items() if not k.startswith('_')} for sheet in sheets for f in sheet]}
    (OUT/'extraction_report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    # A small portrait for tournament brackets.
    portrait=dialogue[4]['_cut'];portrait.thumbnail((120,100));portrait.save(ROOT/'dist/assets/ui/portraits/sung_jinwoo.webp',lossless=True)
    print('Prepared',report['frameCount'],'raw frames and7 atlases with full source alpha coverage.')

if __name__=='__main__':main()
