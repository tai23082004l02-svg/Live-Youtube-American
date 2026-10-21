"""Extract Boa Hancock's five sheets, preserving all original alpha and full silhouettes."""
import json
import numpy as np
from scipy import ndimage
from PIL import Image
from prepare_team_dialogue import seam
import prepare_ichigo as common

ROOT=common.ROOT
OUT=ROOT/'art/frames/boa_hancock'
RUNTIME=ROOT/'dist/assets/characters/boa_hancock'

def assign(rgba,frames,threshold):
    alpha=rgba[:,:,3];yy,xx=np.indices(alpha.shape)
    rows=max(f['row'] for f in frames)+1;cols=max(f['column'] for f in frames)+1
    ybounds=[next(f['region'][1] for f in frames if f['row']==row) for row in range(1,rows)]
    xbounds=[next(f['region'][0] for f in frames if f['column']==col) for col in range(1,cols)]
    ycuts=[seam(alpha,y) for y in ybounds]
    rowmap=sum((yy>=cut[None,:]).astype(np.int16) for cut in ycuts)
    colmap=np.zeros_like(rowmap)
    for row in range(rows):
        sample=next(f for f in frames if f['row']==row);y0,y1=sample['region'][1::2]
        boundaries=xbounds
        if frames[0]['source']=='boa_hancock_skills.png' and row==3:
            boundaries=[256,512,768,1024,1320]
        if frames[0]['source']=='boa_hancock_ultimate.png':
            if row==1:boundaries=[256,512,768,1060,1280]
            if row in [3,5]:boundaries=[256,512,768,1060,1320]
        cuts=[seam(alpha[y0:y1,:].T,x) for x in boundaries]
        cell=sum((xx>=cut[np.clip(yy-y0,0,y1-y0-1)]).astype(np.int16) for cut in cuts)
        colmap[rowmap==row]=cell[rowmap==row]
    for f in frames:
        if f['body']:
            x0,y0,x1,y1=f['region'];f['sourcePivot']=[(x0+x1)/2,y1-8]
    return rowmap*cols+colmap+1,[]

def spec(filename,names,ys,body_rows):
    cols=2 if 'dialogue' in filename else 6
    width=Image.open(ROOT/'art/sources'/filename).width
    return common.descriptors(filename,names,ys,[int(i*width/cols) for i in range(cols+1)],body_rows)

def main():
    common.OUT=OUT;common.RUNTIME=RUNTIME;common.assign_pixels=assign
    OUT.mkdir(parents=True,exist_ok=True);RUNTIME.mkdir(parents=True,exist_ok=True)
    # Corrected motion source has seven rows; guard and hurt share the reaction row.
    base=spec('boa_hancock.png',['idle','run','kiss','kick','dash','guard_hurt','defeat'],[0,155,285,425,585,720,865,1024],7)
    skills=spec('boa_hancock_skills.png',['kiss_cast','kiss_vfx','arrow_cast','arrow_vfx','femur_cast','femur_vfx','mellow_cast','mellow_vfx'],[0,155,240,405,510,670,765,920,1024],0)
    for f in skills:f['body']=f['row'] in [0,2,4,6]
    intro=spec('boa_hancock_intro.png',['intro_petals','intro_materialize','intro_ready','intro_ring','intro_portal','intro_flash'],[0,200,390,605,715,890,1024],3)
    ultimate=spec('boa_hancock_ultimate.png',['judgment_charge','judgment_kick','heart_vfx','arrow_vfx','stone_vfx','impact_vfx'],[0,215,420,580,710,860,1024],2)
    dialogue=spec('boa_hancock_dialogue.png',['dialogue_blank','dialogue_example','portrait','judgment_banner'],[0,235,460,775,1024],0)
    sheets=[base,skills,intro,ultimate,dialogue];reports=[common.export_source(frames) for frames in sheets]
    for f in intro[:18]:f['actorScale']=.78
    for f in ultimate[:12]:f['actorScale']=.75
    group=lambda items:[items[i:i+6] for i in range(0,len(items),6)]
    metadata=[common.atlas('boa_hancock',group(base+skills[:6]+skills[12:18]+skills[24:30]+skills[36:42]+ultimate[:12]),True,6),
        common.atlas('boa_hancock_vfx',group(skills[6:12]+skills[18:24]+skills[30:36]+skills[42:48]),columns=6),
        common.atlas('boa_hancock_intro',group(intro[:18]),True,6),
        common.atlas('boa_hancock_intro_vfx',group(intro[18:]),columns=6),
        common.atlas('boa_hancock_ultimate_vfx',group(ultimate[12:]),columns=6),
        common.atlas('boa_hancock_dialogue',[dialogue[i:i+2] for i in range(0,8,2)],columns=2)]
    meta={m['name']:{k:m[k] for k in ['frameSize','pivot','columns','rows']} for m in metadata}
    (ROOT/'dist/src/render/boa-meta.js').write_text('export const BOA_META='+json.dumps(meta)+';\n',encoding='utf-8')
    report={'sourceReports':reports,'frameCount':sum(map(len,sheets)),'atlases':list(meta),'frames':[{k:v for k,v in f.items() if not k.startswith('_')} for sheet in sheets for f in sheet]}
    (OUT/'extraction_report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    portrait=dialogue[4]['_cut'].copy();portrait.thumbnail((120,100));portrait.save(ROOT/'dist/assets/ui/portraits/boa_hancock.webp',lossless=True)
    print('Prepared',report['frameCount'],'raw frames and 6 atlases with full source alpha coverage.')

if __name__=='__main__':main()
