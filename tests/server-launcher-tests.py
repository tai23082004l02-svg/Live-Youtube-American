import importlib.util
import io
import json
from pathlib import Path
import unittest
from unittest.mock import patch, Mock
from contextlib import redirect_stdout

spec=importlib.util.spec_from_file_location('serve_game',Path(__file__).resolve().parents[1]/'tools/serve_game.py')
server=importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)

class LauncherTests(unittest.TestCase):
    def probe(self,payload):
        opener=Mock()
        opener.open.return_value=io.BytesIO(json.dumps(payload).encode())
        with patch.object(server.urllib.request,'build_opener',return_value=opener):
            return server.same_project_running()

    def test_identity_requires_exact_project(self):
        self.assertTrue(self.probe({'app':'down-arena','project':str(server.ROOT)}))
        self.assertFalse(self.probe({'app':'down-arena','project':str(server.ROOT.parent/'other-game')}))
        self.assertFalse(self.probe({'app':'other-app','project':str(server.ROOT)}))
        self.assertFalse(self.probe([]))

    def test_unavailable_identity_is_not_trusted(self):
        with patch.object(server.urllib.request,'build_opener',side_effect=OSError('blocked')):
            self.assertFalse(server.same_project_running())

    def test_legacy_static_server_requires_own_one_use_marker(self):
        opener=Mock()
        def respond(url,timeout):
            if url.endswith(server.HEALTH_PATH):return io.BytesIO(b'{}')
            marker=server.ROOT/'dist'/url.rsplit('/',1)[-1]
            return io.BytesIO(marker.read_bytes())
        opener.open.side_effect=respond
        with patch.object(server.urllib.request,'build_opener',return_value=opener):
            self.assertTrue(server.same_project_running())
        self.assertEqual(list((server.ROOT/'dist').glob('.down-arena-probe-*.json')),[])

    def test_duplicate_same_project_reuses_without_error(self):
        with patch.object(server,'ThreadingHTTPServer',side_effect=OSError(10048,'busy')),patch.object(server,'same_project_running',return_value=True),redirect_stdout(io.StringIO()) as out:
            self.assertEqual(server.main(),0)
            self.assertIn('ALREADY RUNNING',out.getvalue())

    def test_other_service_is_not_replaced(self):
        with patch.object(server,'ThreadingHTTPServer',side_effect=OSError(10048,'busy')),patch.object(server,'same_project_running',return_value=False),redirect_stdout(io.StringIO()) as out:
            self.assertEqual(server.main(),1)
            self.assertIn('No other server was stopped',out.getvalue())

    def test_new_server_closes_cleanly(self):
        instance=Mock();instance.serve_forever.side_effect=KeyboardInterrupt()
        with patch.object(server,'ThreadingHTTPServer',return_value=instance),redirect_stdout(io.StringIO()):
            self.assertEqual(server.main(),0)
            instance.server_close.assert_called_once()

if __name__=='__main__':unittest.main()
