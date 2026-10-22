"""Local-only YouTube read-only OAuth bridge and game server. Never serves credentials."""
import json
import os
import re
import threading
import time
import webbrowser
from collections import deque
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from urllib.request import Request as URLRequest, urlopen

ROOT = Path(__file__).resolve().parents[2]
SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']
PORT = 8765
BASE = f'http://127.0.0.1:{PORT}'
GAME_ORIGIN = 'https://tai23082004l02-svg.github.io'
GAME_URL = GAME_ORIGIN + '/Live-Youtube-American/dist/?obs=vote&chat=1'


def video_id(value):
    parsed = urlparse(value)
    if parsed.hostname in ('youtu.be', 'www.youtu.be'):
        value = parsed.path.strip('/').split('/')[0]
    elif parsed.hostname in ('youtube.com', 'www.youtube.com', 'm.youtube.com'):
        value = parse_qs(parsed.query).get('v', [''])[0] or (parsed.path.split('/')[2] if parsed.path.startswith('/live/') else '')
    if not re.fullmatch(r'[A-Za-z0-9_-]{11}', value):
        raise ValueError('Enter a valid YouTube live link or 11-character video ID.')
    return value


def polling_delay(data):
    # Never poll earlier than YouTube's required interval.
    return max(2, float(data.get('pollingIntervalMillis', 5000)) / 1000)


class VoteQueue:
    def __init__(self):
        self.lock = threading.Lock()
        self.round = None
        self.open = False
        self.choices = 0
        self.queue = deque(maxlen=5000)
        self.status = 'YouTube not connected'
        self.since = time.time()
        self.heartbeat = 0

    def snapshot(self, data):
        round_id = data.get('round')
        choices = data.get('choices', 0)
        if not isinstance(round_id, str) or len(round_id) > 128 or type(choices) is not int or not 0 <= choices <= 100:
            raise ValueError('Invalid ballot')
        with self.lock:
            if self.round != round_id:
                self.queue.clear()
                self.since = time.time()
            if not self.open and data.get('open') is True:
                self.since = time.time()
            self.heartbeat = time.monotonic()
            self.round, self.open, self.choices = round_id, data.get('open') is True, choices
            votes = list(self.queue) if self.open else []
            self.queue.clear()
            return {'status': self.status, 'votes': votes}

    def receive(self, message, expected_round=None):
        snippet = message.get('snippet', {})
        text = snippet.get('textMessageDetails', {}).get('messageText', '').strip()
        viewer = snippet.get('authorChannelId')
        if snippet.get('type') != 'textMessageEvent' or not viewer or not re.fullmatch(r'[1-9][0-9]{0,2}', text):
            return
        try:
            published = datetime.fromisoformat(snippet.get('publishedAt', '').replace('Z', '+00:00')).timestamp()
        except ValueError:
            return
        with self.lock:
            if expected_round is not None and expected_round != self.round:
                return
            if self.open and time.monotonic()-self.heartbeat < 5 and published >= self.since and 1 <= int(text) <= self.choices:
                self.queue.append({'round': self.round, 'viewer': viewer, 'number': int(text)})


class Bridge:
    def __init__(self):
        self.votes = VoteQueue()
        self.connect_lock = threading.Lock()

    def connect(self, config, video):
        if not self.connect_lock.acquire(blocking=False):
            raise ValueError('A connection is already active. Restart the tool to change streams.')
        if not isinstance(config, dict) or 'installed' not in config:
            self.connect_lock.release()
            raise ValueError('Select the Desktop OAuth client JSON file.')
        self.votes.status = 'Sign in to YouTube in your browser'
        threading.Thread(target=self.run, args=(config, video), daemon=True).start()

    def run(self, config, video):
        try:
            import requests
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.oauth2.credentials import Credentials
            from google.auth.transport.requests import Request
            from google.auth.exceptions import RefreshError
            token_path = ROOT / '.secrets' / 'youtube-chat-token.json'
            creds = None
            if token_path.exists():
                saved = json.loads(token_path.read_text())
                if saved.get('client_id') == config['installed'].get('client_id'):
                    creds = Credentials.from_authorized_user_info(saved, SCOPES)
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except RefreshError:
                    creds = None
            if not creds or not creds.valid:
                flow = InstalledAppFlow.from_client_config(config, SCOPES)
                creds = flow.run_local_server(host='127.0.0.1', port=0, open_browser=True, timeout_seconds=180, authorization_prompt_message='Complete Google sign-in in the browser.', success_message='Connected. You can close this tab.', prompt='consent', access_type='offline')
            token_path.parent.mkdir(exist_ok=True)
            token_path.write_text(creds.to_json())
            os.chmod(token_path, 0o600)

            def get(resource, **params):
                if not creds.valid:
                    creds.refresh(Request())
                    token_path.write_text(creds.to_json())
                response = requests.get('https://www.googleapis.com/youtube/v3/' + resource, params=params, headers={'Authorization': 'Bearer ' + creds.token}, timeout=30)
                if response.status_code != 200:
                    try:
                        reason = response.json()['error']['errors'][0]['reason']
                    except (ValueError, KeyError, IndexError):
                        reason = 'requestFailed'
                    allowed = {'quotaExceeded', 'dailyLimitExceeded', 'liveChatEnded', 'liveChatDisabled', 'liveChatNotFound', 'forbidden', 'insufficientPermissions', 'rateLimitExceeded'}
                    raise RuntimeError(reason if reason in allowed else f'YouTube HTTP {response.status_code}')
                return response.json()

            result = get('videos', part='liveStreamingDetails', id=video)
            items = result.get('items', [])
            chat = items[0].get('liveStreamingDetails', {}).get('activeLiveChatId') if items else None
            if not chat:
                raise RuntimeError('No active chat. Start the live broadcast and enable live chat, then reconnect.')
            page, first = None, True
            seen, order = set(), deque()
            while True:
                # Freeze the ballot identity at request time so a delayed response cannot vote in the next round.
                with self.votes.lock:
                    request_round, request_open = self.votes.round, self.votes.open
                params = dict(liveChatId=chat, part='snippet', maxResults=2000)
                if page:
                    params['pageToken'] = page
                data = get('liveChat/messages', **params)
                page = data.get('nextPageToken')
                for message in data.get('items', []):
                    mid = message.get('id')
                    if not mid or mid in seen:
                        continue
                    seen.add(mid)
                    order.append(mid)
                    if len(order) > 20000:
                        seen.discard(order.popleft())
                    with self.votes.lock:
                        same_round = request_open and request_round == self.votes.round
                    if not first and same_round:
                        self.votes.receive(message, request_round)
                first = False  # Discard chat history received on initial connection.
                self.votes.status = 'YOUTUBE CHAT CONNECTED'
                time.sleep(polling_delay(data))
        except Exception as exc:
            # Never expose OAuth responses, credentials or request URLs.
            safe = str(exc) if isinstance(exc, RuntimeError) else 'Connection failed. Check OAuth test user, API access and internet connection.'
            self.votes.status = safe
        finally:
            self.connect_lock.release()


BRIDGE = Bridge()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def send(self, code, body, mime='application/json'):
        if isinstance(body, dict):
            body = json.dumps(body).encode()
        elif isinstance(body, str):
            body = body.encode()
        self.send_response(code)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if self.path == '/api/votes' and self.headers.get('Origin') in (BASE, GAME_ORIGIN):
            self.send_header('Access-Control-Allow-Origin', self.headers['Origin'])
            self.send_header('Vary', 'Origin')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.end_headers()
        self.wfile.write(body)

    def valid_host(self):
        return self.headers.get('Host') == f'127.0.0.1:{PORT}'

    def do_GET(self):
        if not self.valid_host():
            return self.send(403, {})
        path = urlparse(self.path).path
        if path in ('/online', '/online/'):
            try:
                request = URLRequest(GAME_ORIGIN + '/Live-Youtube-American/dist/?v=' + str(time.time_ns()), headers={'Cache-Control': 'no-cache'})
                with urlopen(request, timeout=20) as response:
                    html = response.read().decode('utf-8')
                # Source and every game asset load from Pages, never the local dist copy.
                base = '<base href="' + GAME_ORIGIN + '/Live-Youtube-American/dist/">'
                html = html.replace('<head>', '<head>' + base, 1)
                return self.send(200, html, 'text/html; charset=utf-8')
            except Exception:
                return self.send(502, 'Cannot load game from GitHub Pages. Check internet and retry.', 'text/plain; charset=utf-8')
        if path in ('/', '/control'):
            return self.send(200, (Path(__file__).parent / 'control.html').read_bytes(), 'text/html; charset=utf-8')
        if path == '/api/status':
            return self.send(200, {'status': BRIDGE.votes.status})
        if path.startswith('/dist/'):
            import mimetypes
            target = (ROOT / path.lstrip('/')).resolve()
            if target.is_relative_to((ROOT / 'dist').resolve()):
                if target.is_dir():
                    target /= 'index.html'
                if target.is_file():
                    return self.send(200, target.read_bytes(), mimetypes.guess_type(target)[0] or 'application/octet-stream')
        self.send(404, {})

    def do_OPTIONS(self):
        if not self.valid_host() or self.path != '/api/votes' or self.headers.get('Origin') not in (BASE, GAME_ORIGIN):
            return self.send(403, {})
        self.send(204, b'')

    def do_POST(self):
        allowed = (BASE, GAME_ORIGIN) if self.path == '/api/votes' else (BASE,)
        if not self.valid_host() or self.headers.get('Origin') not in allowed:
            return self.send(403, {})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 65536:
                raise ValueError('Invalid request size')
            data = json.loads(self.rfile.read(length))
            if self.path == '/api/votes':
                return self.send(200, BRIDGE.votes.snapshot(data))
            if self.path == '/api/connect':
                BRIDGE.connect(data.get('credentials'), video_id(data.get('video', '')))
                return self.send(200, {'ok': True})
            self.send(404, {})
        except (ValueError, TypeError, AttributeError):
            self.send(400, {'error': 'Check the live URL and Desktop OAuth JSON. Restart to change an active connection.'})


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    print('Down Arena Chat: ' + BASE + '/control')
    print('OBS Browser Source (game from GitHub): ' + BASE + '/online/?obs=vote&chat=1')
    webbrowser.open(BASE + '/control')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
