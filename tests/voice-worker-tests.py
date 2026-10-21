import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import os
import subprocess
import sys
import time

spec=importlib.util.spec_from_file_location('voice_worker',Path(__file__).resolve().parents[1]/'tools/voice_worker.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)


class QueueTests(unittest.TestCase):
    def setUp(self):
        cache=Path(__file__).resolve().parents[1]/'.voice-worker-test-cache'
        cache.mkdir(exist_ok=True)
        self.tmp=tempfile.TemporaryDirectory(dir=cache)
        assert Path(self.tmp.name).resolve().parent==cache.resolve()
        self.addCleanup(self.tmp.cleanup)
        self.calls=[]
        def transport(path,payload=None):
            self.calls.append((path,payload))
            if payload:return b'ID3'+b'x'*300
            return {'voices':[{'name':'Japanese Hero','voice_id':'voiceJa','labels':{'language':'ja','gender':'male'}}]}
        self.worker=module.Worker(self.tmp.name,transport=transport)

    def job(self,name='one',**kw):
        job={'id':name,'text':'Test cry!','output':name,'voice_id':'voice1',**kw}
        path=self.worker.home/'queue'/(name+'.json');module.atomic_json(path,job)
        self.worker.process(path)
        return json.loads((self.worker.home/'results'/path.name).read_text())

    def test_generation_dedup_and_output_protection(self):
        self.assertEqual(self.job()['status'],'done')
        self.assertEqual(self.job()['status'],'done')
        self.assertEqual(len(self.calls),1)
        result=self.job('two')
        self.assertEqual(result['status'],'failed');self.assertEqual(len(self.calls),1)
        self.assertEqual(self.job('three',text='different',output='one')['status'],'failed')

    def test_validation_and_caps(self):
        for kw in [{'text':'x'*201},{'output':'../escape'},{'model':'bad'},{'language':'bad'},{'kind':'shell'}]:
            with self.assertRaises(ValueError):self.worker.validate({'id':'test','text':'hi','output':'test','voice_id':'test',**kw})
        for n in range(5):self.assertEqual(self.job('cap'+str(n),text=str(n)*200)['status'],'done')
        self.assertEqual(self.job('over',text='extra')['status'],'failed');self.assertEqual(len(self.calls),5)

    def test_unknown_paid_failure_not_retried(self):
        def fail(path,payload=None):self.calls.append(path);raise TimeoutError()
        self.worker.transport=fail
        self.assertTrue(self.job()['generation_submitted'])
        self.assertEqual(self.job('retry')['status'],'failed');self.assertEqual(len(self.calls),1)

    def test_japanese_selection_and_read_only_catalog(self):
        result=self.job(voice_id='',voice_selector='japanese_male',language='ja')
        self.assertEqual(result['voice_id'],'voiceJa');self.assertEqual(self.calls[-1][1]['language_code'],'ja')
        result=self.job('catalog',kind='voices');self.assertEqual(result['status'],'done')
        self.assertEqual(result['voices'],1)

    @unittest.skipUnless(os.name=='nt','Windows file locking')
    def test_background_heartbeat_single_instance_and_recovery(self):
        home=self.worker.home
        module.atomic_json(home/'processing'/'interrupted.json',{'id':'interrupted'})
        code="import importlib.util,sys;s=importlib.util.spec_from_file_location('w',sys.argv[1]);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);m.Worker(sys.argv[2]).run()"
        command=[sys.executable,'-c',code,str(Path(module.__file__)),self.tmp.name]
        child=subprocess.Popen(command,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            deadline=time.time()+12
            while not (home/'status.json').exists() and time.time()<deadline:time.sleep(.1)
            state=json.loads((home/'status.json').read_text())
            self.assertEqual(state['status'],'running')
            self.assertEqual(state['pid'],child.pid)
            second=subprocess.run(command,capture_output=True,timeout=5,creationflags=subprocess.CREATE_NO_WINDOW)
            self.assertEqual(second.returncode,0)
            self.assertEqual(json.loads((home/'status.json').read_text())['pid'],child.pid)
            self.assertEqual(json.loads((home/'results/interrupted.json').read_text())['status'],'unknown_after_restart')
            (home/'stop').touch()
            child.wait(timeout=8)
            self.assertEqual(child.returncode,0)
            self.assertEqual(json.loads((home/'status.json').read_text())['status'],'stopped')
        finally:
            if child.poll() is None:child.terminate();child.wait(timeout=5)
            child.stderr.close()


if __name__=='__main__':unittest.main()
