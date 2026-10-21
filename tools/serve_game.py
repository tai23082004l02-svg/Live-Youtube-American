"""Serve this exact checkout on the established game port, without stale browser caches."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import urllib.request
import uuid
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
URL = 'http://127.0.0.1:8766/'
HEALTH_PATH = '/__down_arena_server__'

def same_project_running():
    """Reuse only a positively identified server for this exact checkout."""
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(URL.rstrip('/') + HEALTH_PATH, timeout=1.5) as response:
            info = json.loads(response.read(4096))
        if (isinstance(info, dict) and info.get('app') == 'down-arena'
                and os.path.normcase(str(Path(info.get('project', '')).resolve())) == os.path.normcase(str(ROOT))):
            return True
    except (OSError, ValueError, TypeError):
        pass
    # Older launchers served static files without the identity endpoint. A
    # one-use marker proves they serve THIS dist directory, not another game.
    nonce = uuid.uuid4().hex
    marker = ROOT / 'dist' / ('.down-arena-probe-' + nonce + '.json')
    payload = {'app': 'down-arena', 'project': str(ROOT), 'nonce': nonce}
    try:
        marker.write_text(json.dumps(payload), encoding='utf-8')
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(URL + marker.name, timeout=1.5) as response:
            return json.loads(response.read(4096)) == payload
    except (OSError, ValueError, TypeError):
        return False
    finally:
        marker.unlink(missing_ok=True)

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlsplit(self.path).path == HEALTH_PATH:
            payload = json.dumps({'app': 'down-arena', 'project': str(ROOT)}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    print('DOWN ARENA - SUKUNA - 8 CHARACTERS', flush=True)
    print('Project: ' + str(ROOT), flush=True)
    try:
        server = ThreadingHTTPServer(('127.0.0.1', 8766), partial(Handler, directory=str(ROOT / 'dist')))
    except OSError as error:
        if getattr(error, 'winerror', None) == 10048 or error.errno in (48, 98, 10048):
            if same_project_running():
                print('\nTHIS DOWN ARENA COPY IS ALREADY RUNNING. No second server is needed.', flush=True)
                print('Open ' + URL + '?build=sukuna-impact-2', flush=True)
                return 0
        print('\nCANNOT START THIS UPDATED COPY ON PORT 8766.', flush=True)
        print('The existing service could not be identified as this project.', flush=True)
        print('No other server was stopped. Check the port owner before closing anything.', flush=True)
        print(str(error), flush=True)
        return 1
    print('Open http://127.0.0.1:8766/?build=sukuna-impact-2', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
