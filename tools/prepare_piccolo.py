"""Rebuild Piccolo prototype frames from the two user supplied concept sheets.
Run from project root. Requires Pillow, numpy and scipy (development only).
The source has merged beam cells; these are deliberately NOT treated as poses.
"""
from pathlib import Path
from PIL import Image, ImageDraw
from scipy import ndimage
import numpy as np
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art/sources'
OUT = ROOT / 'art/frames/piccolo'
OUT.mkdir(parents=True, exist_ok=True)
im = Image.open(SOURCE / 'picolo.png').convert('RGBA')
xs = [60, 300, 510, 710, 970, 1200, 1448]
ys = [0, 146, 282, 423, 563, 708, 850, 977, 1086]
actions = ['idle', 'run', 'melee', 'dash', 'beam', 'powerup', 'hurt', 'defeat', 'special', 'hellzone']
# Remap concept rows to the engine's established row convention.
sources = [(0, list(range(6))), (1, list(range(6))), (2, list(range(6))),
           (6, [0, 1, 2, 3, 3, 5]), (3, [0, 1, 2, 3, 3, 5]),
           (3, [0, 1, 2, 2, 2, 5]), (7, [0, 1, 0, 1, 0, 1]),
           (7, list(range(6))), (4, [0, 1, 2, 3, 3, 5]), (5, list(range(6)))]
atlas = Image.new('RGBA', (1920, 224 * len(actions)))
meta = {'frameSize': [320, 224], 'pivot': [160, 192], 'animations': {}}
for row, (action, (sr, cols)) in enumerate(zip(actions, sources)):
    entries = []
    for col, sc in enumerate(cols):
        x0, x1, y0, y1 = xs[sc], xs[sc+1], ys[sr], ys[sr+1]
        if sr in (3, 4) and sc == 3:
            x1 = 870  # stop at the extended hand, omit the baked beam
        crop = im.crop((x0, y0, x1, y1))
        a = np.array(crop)
        labels, _ = ndimage.label(a[:, :, 3] > 35)
        sizes = np.bincount(labels.ravel()); sizes[0] = 0
        # Keep the connected body and its antialiasing; discard neighboring glow fragments.
        mask = ndimage.binary_dilation(labels == sizes.argmax(), iterations=1)
        a[~mask] = 0
        crop = Image.fromarray(a)
        solid = a[:, :, 3] > 150
        yy, xx = np.where(solid)
        green = (a[:, :, 1].astype(float) > a[:, :, 0] * 1.12) & (a[:, :, 1] > 65) & solid
        gy, gx = np.where(green)
        px = int(np.median(gx)) if len(gx) else int(np.median(xx))
        py = int(yy.max()+1)
        # Resting body remains at the same ground anchor even during hit/fall poses.
        frame = Image.new('RGBA', (320, 224))
        frame.alpha_composite(crop, (160-px, 192-py))
        filename = f'{action}_{col:02d}.png'
        frame.save(OUT / filename)
        atlas.alpha_composite(frame, (col*320, row*224))
        entries.append({'file': filename, 'rect': [col*320, row*224, 320, 224], 'anchor': [160,192]})
    meta['animations'][action] = entries
atlas.save(ROOT / 'art/atlases/piccolo.png')
atlas.save(ROOT / 'dist/assets/characters/piccolo/piccolo.webp', lossless=True, method=6)
(OUT / 'atlas.json').write_text(json.dumps(meta, indent=2))
preview = Image.new('RGB', (1200, len(actions)*150), '#1a2430')
draw = ImageDraw.Draw(preview)
for r, name in enumerate(actions):
    for c in range(6):
        frame = atlas.crop((c*320,r*224,(c+1)*320,(r+1)*224)).resize((200,140))
        preview.paste(frame,(c*200,r*150+12),frame)
        draw.text((c*200+3,r*150+1),f'{name} {c}',fill='white')
preview.save(OUT / 'contact.png')

vfx = Image.open(SOURCE / 'piccolo_vfx.png').convert('RGBA')
vx = [0, 267, 611, 1035, 1440, 1774]
vy = [0, 185, 365, 550, 710, 887]
va = Image.new('RGBA', (1600,1120))
vf = ROOT / 'art/frames/piccolo_vfx'; vf.mkdir(parents=True,exist_ok=True)
vm = {'frameSize':[320,224], 'animations':{}}
for r, name in enumerate(['special','hellzone','light','wave','support']):
    entries=[]
    for c in range(5):
        tile=vfx.crop((vx[c],vy[r],vx[c+1],vy[r+1]))
        tile=tile.crop(tile.getbbox())
        tile.thumbnail((308,208),Image.Resampling.LANCZOS)
        frame=Image.new('RGBA',(320,224))
        frame.alpha_composite(tile,((320-tile.width)//2,(224-tile.height)//2))
        frame.save(vf / f'{name}_{c:02d}.png')
        va.alpha_composite(frame,(c*320,r*224))
        entries.append({'rect':[c*320,r*224,320,224], 'anchor':[160,112]})
    vm['animations'][name]=entries
va.save(ROOT/'art/atlases/piccolo_vfx.png')
va.save(ROOT/'dist/assets/characters/piccolo/piccolo_vfx.webp',lossless=True,method=6)
(vf/'atlas.json').write_text(json.dumps(vm,indent=2))
print('Piccolo: 60 aligned animation slots (reuses selected concept poses), 25 VFX frames, RGBA PNGs and lossless WebP atlases.')
