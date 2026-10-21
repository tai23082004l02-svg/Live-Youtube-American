"""Extract Saber's five sheets, preserving all original alpha and full silhouettes."""
import json
import numpy as np
from scipy import ndimage
from PIL import Image
from prepare_team_dialogue import seam
import prepare_ichigo as common

ROOT=common.ROOT
OUT=ROOT/'art/frames/saber'
RUNTIME=ROOT/'dist/assets/characters/saber'

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
        if frames[0]['source']=='saber_ultimate.png' and row>=3:
            boundaries={3:[225,460,720,1015,1260],4:[205,450,700,1018,1260],5:[205,450,735,1008,1260]}[row]
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
    # The saved motion image has SEVEN rows (42 poses), not the prompted eight.
    # Its run row also supplies dash; never invent a missing row by slicing bodies.
    base=spec('saber.png',['idle','run','slash','overhead','guard','hurt','defeat'],[0,145,275,405,552,695,852,1024],7)
    skills=spec('saber_skills.png',['invisible_cast','invisible_vfx','mana_cast','mana_vfx','strike_cast','strike_vfx','avalon_cast','avalon_vfx'],[0,145,262,390,505,645,745,885,1024],0)
    for f in skills:f['body']=f['row'] in [0,2,4,6]
    intro=spec('saber_intro.png',['intro_sword','intro_materialize','intro_ready','intro_circle','intro_cocoon','intro_flash'],[0,195,390,580,710,885,1024],3)
    ultimate=spec('saber_ultimate.png',['excalibur_charge','excalibur_release','charge_vfx','muzzle_vfx','beam_vfx','impact_vfx'],[0,230,415,585,740,860,1024],2)
    dialogue=spec('saber_dialogue.png',['dialogue_blank','dialogue_example','portrait','excalibur_banner'],[0,235,455,790,1024],0)
    sheets=[base,skills,intro,ultimate,dialogue];reports=[common.export_source(frames) for frames in sheets]
    for f in intro[:18]:f['actorScale']=.8
    for f in ultimate[:12]:f['actorScale']=.8
    group=lambda items:[items[i:i+6] for i in range(0,len(items),6)]
    metadata=[common.atlas('saber',group(base+skills[:6]+skills[12:18]+skills[24:30]+skills[36:42]+ultimate[:12]),True,6),
        common.atlas('saber_vfx',group(skills[6:12]+skills[18:24]+skills[30:36]+skills[42:48]),columns=6),
        common.atlas('saber_intro',group(intro[:18]),True,6),
        common.atlas('saber_intro_vfx',group(intro[18:]),columns=6),
        common.atlas('saber_ultimate_vfx',group(ultimate[12:]),columns=6),
        common.atlas('saber_dialogue',[dialogue[i:i+2] for i in range(0,8,2)],columns=2)]
    meta={m['name']:{k:m[k] for k in ['frameSize','pivot','columns','rows']} for m in metadata}
    (ROOT/'dist/src/render/saber-meta.js').write_text('export const SABER_META='+json.dumps(meta)+';\n',encoding='utf-8')
    report={'sourceReports':reports,'frameCount':sum(map(len,sheets)),'atlases':list(meta),'frames':[{k:v for k,v in f.items() if not k.startswith('_')} for sheet in sheets for f in sheet]}
    (OUT/'extraction_report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    portrait=dialogue[4]['_cut'].copy();portrait.thumbnail((120,100));portrait.save(ROOT/'dist/assets/ui/portraits/saber.webp',lossless=True)
    print('Prepared',report['frameCount'],'raw frames and 6 atlases with full source alpha coverage.')

if __name__=='__main__':main()
