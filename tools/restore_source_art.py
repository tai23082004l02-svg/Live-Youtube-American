"""Restore archived authoring art on demand, without committing it back to runtime."""
import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--receipt', help='One docs/*r2-archive.json receipt; default all receipts')
parser.add_argument('--source', choices=['git', 'r2'], default='git')
args = parser.parse_args()
receipts = [ROOT / args.receipt] if args.receipt else sorted((ROOT / 'docs').glob('*r2-archive.json'))
restored = 0
for receipt_path in receipts:
    receipt = json.loads(receipt_path.read_text())
    for item in receipt['verifiedObjects']:
        relative = item['path']
        if not relative.startswith('art/'):
            continue
        target = (ROOT / relative).resolve()
        if not target.is_relative_to(ROOT / 'art'):
            raise ValueError('Unsafe archive path')
        if target.exists():
            continue  # Never replace edits to working art.
        if args.source == 'git':
            data = subprocess.check_output(['git', 'show', receipt['sourceCommit'] + ':' + relative], cwd=ROOT)
        else:
            import tempfile
            endpoint = os.environ.get('R2_ENDPOINT', 'https://fdd00e4aaaf0b0220e5d4ee517661254.r2.cloudflarestorage.com')
            with tempfile.TemporaryDirectory() as directory:
                downloaded = Path(directory) / 'object'
                subprocess.run(['aws', 's3', 'cp', f"s3://{receipt['bucket']}/{item['key']}", str(downloaded), '--endpoint-url', endpoint, '--only-show-errors'], check=True)
                data = downloaded.read_bytes()
        if len(data) != item['bytes'] or hashlib.sha256(data).hexdigest() != item['sha256']:
            raise ValueError('Archive verification failed: ' + relative)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        restored += 1
print(f'Restored {restored} verified authoring files; existing edits preserved.')
