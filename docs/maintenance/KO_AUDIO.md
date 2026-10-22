# KO announcer and fast match changes

The active KO call is `dist/assets/audio/voices/ko_en.mp3`, generated locally with the CMU Flite RMS voice through FFmpeg. This is synthesized speech (not an ElevenLabs recording or a clone). Spoken text is “Kay! Oh!” so both letters are pronounced. Only leading/trailing silence was trimmed; the gap between the two letters is preserved. 44.1kHz/128kbps MP3, about0.914s including MP3 padding; metadata is beside the file. Revision power2 lowers pitch12% while preserving speaking tempo, adds3dB bass and2dB presence shaping, stronger compression, a quiet34ms slap and a higher loudness target. Measured true peak is about-2.45dBTP. The total call still ends before the1.2s result hold. The previous victory file is retained as a legacy asset but no longer selected.

The result call starts at0.12s. KO reveal starts at0.12s. Live results hold1.2s, then there is no additional intermission/champion wait. The next match still loads safely and keeps its existing1s countdown/character entrances. Pause, mute, draw handling and one announcement per match remain in place.

Generation used FFmpeg's `flite=text=Kay! Oh!:voice=rms`, leading trim, reverse/leading trim/reverse for trailing trim, highpass90Hz and loudnorm(-17LUFS,-2dBTP). No API key or generation credit was used. Subjective listening remains for the user; automated tests cover asset selection, decode/duration and lifecycle.

## Flite notice

This project only distributes generated speech; the synthesizer source/binaries are not bundled. Relevant upstream notice is retained below:

===========================================

Authors:	Language Technologies Institute
			Alan W Black <awb@cs.cmu.edu>
			David Huggins-Daines <dhd@cepstral.com>
			and others (see ACKNOWLEDGEMENTS for details)

Copyright: Copyright (c) 1999-2001 by:
			Language Technologies Institute
			Carnegie Mellon University
			All Rights Reserved.

License:
	Permission is hereby granted, free of charge, to use and distribute
 this software and its documentation without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of this work, and to
 permit persons to whom this work is furnished to do so, subject to
 the following conditions:
  1. The code must retain the above copyright notice, this list of
     conditions and the following disclaimer.
  2. Any modifications must be clearly marked as such.
  3. Original authors' names are not deleted.
  4. The authors' names are not used to endorse or promote products
     derived from this software without specific prior written
     permission.

 CARNEGIE MELLON UNIVERSITY AND THE CONTRIBUTORS TO THIS WORK
 DISCLAIM ALL WARRANTIES WITH REGARD TO THIS SOFTWARE, INCLUDING
 ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS, IN NO EVENT
 SHALL CARNEGIE MELLON UNIVERSITY NOR THE CONTRIBUTORS BE LIABLE
 FOR ANY SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
 AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
 ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 THIS SOFTWARE.
