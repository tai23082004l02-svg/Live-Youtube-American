import importlib.util
from pathlib import Path
from datetime import datetime, timezone
import unittest
spec=importlib.util.spec_from_file_location('bridge',Path(__file__).resolve().parents[1]/'tools/youtube-chat/bridge.py')
bridge=importlib.util.module_from_spec(spec);spec.loader.exec_module(bridge)
class BridgeTests(unittest.TestCase):
 def message(self,text='9',when=None):
  return {'snippet':{'type':'textMessageEvent','authorChannelId':'viewer','publishedAt':when or datetime.now(timezone.utc).isoformat(),'textMessageDetails':{'messageText':text}}}
 def test_queue(self):
  q=bridge.VoteQueue();q.snapshot({'round':'a','open':True,'choices':9});q.receive(self.message());q.receive(self.message('10'));q.receive(self.message('2 hi'));q.receive(self.message('1','2000-01-01T00:00:00Z'))
  result=q.snapshot({'round':'a','open':True,'choices':9});self.assertEqual([x['number'] for x in result['votes']],[9]);self.assertEqual(q.snapshot({'round':'a','open':True,'choices':9})['votes'],[])
  q.receive(self.message());self.assertEqual(q.snapshot({'round':'b','open':True,'choices':9})['votes'],[])
  q.receive(self.message(),expected_round='a');self.assertEqual(len(q.queue),0)
  q.snapshot({'round':'b','open':False,'choices':9});q.receive(self.message());self.assertEqual(len(q.queue),0)
 def test_polling_delay(self):
  self.assertEqual(bridge.polling_delay({'pollingIntervalMillis':3000}),3)
  self.assertEqual(bridge.polling_delay({'pollingIntervalMillis':15000}),15)
  self.assertEqual(bridge.polling_delay({'pollingIntervalMillis':1000}),2)
  self.assertEqual(bridge.polling_delay({}),5)
 def test_urls(self):
  for url in ['https://youtu.be/abcdefghijk','https://www.youtube.com/watch?v=abcdefghijk','https://youtube.com/live/abcdefghijk','abcdefghijk']:self.assertEqual(bridge.video_id(url),'abcdefghijk')
  with self.assertRaises(ValueError):bridge.video_id('https://evil.example/watch?v=abcdefghijk')
if __name__=='__main__':unittest.main()
