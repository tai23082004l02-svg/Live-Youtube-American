"""Verify extracted source coverage, color/alpha fidelity and padded runtime frames."""
from pathlib import Path
import json,hashlib
from PIL import Image
import numpy as np
R=Path(__file__).resolve().parents[1]
report=json.loads((R/'art/frames/boa_hancock/extraction_report.json').read_text(encoding='utf-8'))
assert report['frameCount']==170
for entry in report['sourceReports']:
    path=R/'art/sources'/entry['file'];assert hashlib.sha256(path.read_bytes()).hexdigest()==entry['sha256']
    source=np.array(Image.open(path).convert('RGBA'));coverage=np.zeros(source.shape[:2],np.uint8);rebuilt=np.zeros_like(source)
    for f in report['frames']:
        if f['source']!=entry['file']:continue
        raw=Image.open(R/f['rawPath']).convert('RGBA');assert list(raw.size)==f['rawSize'];pad=f['rawPadding'];box=raw.getbbox()
        assert box and min(box[:2])>=pad and box[2]<=raw.width-pad and box[3]<=raw.height-pad
        x0,y0,x1,y1=f['sourceRect'];cut=np.array(raw.crop((pad,pad,pad+x1-x0,pad+y1-y0)));mask=cut[:,:,3]>0
        coverage[y0:y1,x0:x1]+=mask
        rebuilt[y0:y1,x0:x1][mask]=cut[mask]
    present=source[:,:,3]>0
    assert np.all(coverage[present]==1),entry['file']
    assert not coverage[~present].any(),entry['file']
    assert np.array_equal(rebuilt[present],source[present]),entry['file']
    print(entry['file'],': complete one-to-one RGBA coverage; original unchanged')
used=[]
for item in report['atlases']:
    name=item if isinstance(item,str) else item['name'];meta=json.loads((R/f'art/frames/boa_hancock/{name}.json').read_text(encoding='utf-8'))
    image=Image.open(R/f'dist/assets/characters/boa_hancock/{name}.webp').convert('RGBA');w,h=meta['frameSize']
    assert image.size==(w*meta['columns'],h*meta['rows'])
    for f in meta['frames']:
        x=f['column']*w;y=f['row']*h;box=image.crop((x,y,x+w,y+h)).getbbox();assert box and min(box[:2])>=30 and box[2]<=w-30 and box[3]<=h-30,(name,f['name'],box)
        used.append(f['rawPath'])
assert len(used)==len(set(used))==170
print('PASS:170 full-resolution PNG frames,6 lossless WebP atlases, complete source RGBA, no new frame-edge clipping.')
