# Viewer choice broadcast — demo

Open the game, choose **Live → Bình chọn đối thủ → Bắt đầu Live Arena**. This is a new `live_vote` mode. The existing horizontal cup and vertical grandstand modes remain available.

## Layout and OBS

The output canvas is1080×1920 (9:16), using540×960 logical units at2×. Six text-only candidate rows sit higher at y88–240. The two explanatory lines below candidates are removed. Fighter names/HP sit directly on the black area at y252–296, with32logical pixels of black separation before the arena. The original960×540 horizontal battle is fitted to540×303.75 at y328, with no match HUD or foot-health bars painted over the field. The remaining lower area stays black. There are no candidate portraits.

In OBS use a1080×1920 canvas and a Browser Source viewport1080×1920. Open the same game URL, select this mode and start Live. The browser output fits the portrait canvas directly. Desktop Esc opens operator controls; on a touchscreen, tap **Điều khiển**. That touch-only button is hidden on desktop capture.

## Voting rules

- Up to6 active fighters per battle-length round, with no fixed time limit; current fighters are excluded when at least2 alternatives exist.
- Candidate numbers remain fixed for the whole round. The catalog rotates across rounds, keeping large rosters bounded.
- One vote per stable viewer ID. Another valid number from that ID replaces the old choice. Invalid and late votes are ignored.
- The top two distinct candidates form the next match. Ties, including no-vote rounds, use a seeded random tiebreak.
- Voting locks immediately when the battle has a result, before the victory animation. The top two enter the next match after the normal victory/intermission screens. Draws rematch the current pair and reopen the same candidate list and accumulated votes at rematch startup.
- Pause freezes battle and voting. Asset load failures preserve the ballot for Retry. Stop clears the ballot; mode changes remove the broadcast styling.

## Explicit demo status

**No YouTube chat is connected.** The output clearly labels simulated votes. Automatic demo voters are enabled initially and can be disabled in operator controls. The operator can enter a test viewer ID and a number, then submit/change that test vote. These controls do not accept votes from other browsers or viewers.

Subscriber-only chat is a separate YouTube Studio setting; this version does not enforce subscription status. Real integration needs a trusted chat reader and stable YouTube author channel IDs, with secrets kept out of frontend code. No YouTube credentials or API calls are added here.

## Validation

```sh
node tests/viewer-vote-tests.mjs
node tests/mode-menu-tests.mjs
node tests/live-arena-tests.mjs
node tests/vertical-arena-tests.mjs
node --experimental-vm-modules tests/ui-active-roster.mjs
```

All passed. Real Chromium QA additionally exercised assets,9:16 composition with a horizontal arena, operator vote replacement, pause, result lock, top-two next match, new round, stop/mode cleanup and touch controls at393×852. Screenshots/results are in `docs/viewer-vote-qa`. Run `python -m http.server 8767 --bind 127.0.0.1 --directory dist` and `python tools/qa_viewer_vote.py` to reproduce; battle results are forced by the test fixture. The existing launcher on8766 was left untouched because its listener could not be positively identified in this environment.

The full legacy npm suite still depends on original reference artwork absent from this checkout; no legacy assertions were disabled.
