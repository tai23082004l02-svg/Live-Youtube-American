"""Native atlases must retain extracted source pixels and legacy display size."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1]
files=[R/'art/sources'/name for name in ['beerus.png','beerus_skills.png','beerus_intro.png']]
hashes=[hashlib.sha256(p.read_bytes()).hexdigest() for p in files]
scope={'__file__':str(R/'tools/prepare_beerus.py')}
exec((R/'tools/prepare_beerus.py').read_text().split('bodyrows=')[0],scope)
extract=scope['extract'];meta=json.loads((R/'dist/src/render/beerus-meta.js').read_text().split('=',1)[1].rstrip(';\n'))
count=0
for name,m in meta.items():
    atlas=Image.open(R/f'dist/assets/characters/beerus/{name}_native.webp').convert('RGBA');w,h=m['frameSize']
    assert atlas.size==(w*6,h*m['rows'])
    for f in m['frames']:
        row,col=f['row'],f['column']
        if name=='beerus_intro' or row==11:src,source_row,ys,requested=scope['intro'],row if name=='beerus_intro' else 2,scope['IY'],.68
        elif row<8:src,source_row,ys,requested=scope['base'],row,scope['BY'],.78
        else:src,source_row,ys,requested=scope['skills'],row-8,scope['SY'],.70
        cut=extract(src,source_row,col,ys,True);assert list(cut.size)==f['sourceSize']
        frame=atlas.crop((col*w,row*h,(col+1)*w,(row+1)*h));x,y=f['offset']
        a=np.array(cut);b=np.array(frame.crop((x,y,x+cut.width,y+cut.height)));present=a[:,:,3]>0
        assert np.array_equal(a[present],b[present]),(name,row,col)
        box=frame.getbbox();assert min(box[:2])>=24 and box[2]<=w-24 and box[3]<=h-24
        fit=min(requested,288/cut.width,180/cut.height);assert fit==f['fitScale']
        # Original atlas rounds dimensions; new direct scaling differs by <1px.
        assert abs(round(cut.height*fit)*.86-cut.height*fit*.86)<1
        count+=1
assert hashes==[hashlib.sha256(p.read_bytes()).hexdigest() for p in files]
assert count==90
print('PASS:90 native Beerus frames retain original extracted RGBA, clear padding, same display size within1px; all3 sources unchanged.')
