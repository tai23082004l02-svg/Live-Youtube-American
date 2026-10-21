# Rengoku

Playable Kyojuro Rengoku uses the existing 2D simulation and all game modes.

## Mechanics

- HP1300, speed220, melee78, block25%, no blink; preferred range100.
- Unknowing Fire: aimed dash into a forward melee sweep (135 damage before shared modifiers), cooldown7s. Root prevents movement.
- Rising Scorching Sun: forward130-unit sword sweep (150 damage, brief12-tick root, knockback), cooldown9s.
- Flame Tiger: projectile195 damage with80-unit splash for75 damage, cooldown12s. Team-safe; disappears if owner dies.
- Burning Heart: below/equal35% HP, +10% outgoing damage and25% faster normal melee cooldown recovery. No invulnerability.
- Purgatory: measured279-step cinematic,36-tick warning, then a36-tick dash along a fixed corridor; one hit per enemy,420× existing Ultimate multiplier2 before shared modifiers. Enemies can leave the corridor. Root prevents movement; death/petrification cancels. Queue and team Ultimate use existing systems.

## Source and extraction

Original sources: `art/drafts/rengoku/rengoku_{actions,skills,intro,ultimate,dialogue}.png`. Despite folder name these are the retained inputs for regeneration; game does not load them. Do not delete until verified R2 archive and a restoration route exist.

Install Pillow/numpy/scipy if extraction tools are needed, then run from repository root:

```sh
python tools/prepare_rengoku.py
python tools/verify_rengoku.py
python tools/prepare_spectator_meta.py
```

The actions sheet has row counts `[6,6,6,6,5,6,6,5]`; each other character/effect sheet has24 cells, dialogue4:122 native frames total. Extraction uses alpha-aware seams, reviewed nonuniform action-row boundaries and nearest-silhouette ownership. All positive-alpha RGBA samples are retained once in native raw PNGs; sources are immutable and verified by SHA256. Runtime groups resize uniformly (reference body145px), use32px padding, stable body anchors and full-cell metadata. Raw frames are generated and ignored; contact sheets and extraction report are retained. `rengokuSprite` clamps columns to the actual count of that row.

## Recorded speech

`dist/assets/audio/voices/rengoku_ultimate_ja.mp3` is the clean generated Brian/eleven_v3 Japanese recording: 炎の呼吸、奥義！玖ノ型、煉獄！ (Flame Breathing, secret technique! Ninth Form: Purgatory!). It is4.64s; `engine/rengoku-voice.js` supplies279 steps to both personal and team cinematics. Existing audio cache, mute, pause/resume, reset and music ducking apply. Generation metadata is alongside the MP3. Generation uses credit; setup and testing never require a new request.

## Validation

Run `node tests/rengoku-tests.mjs`, `node tests/audio-tests.mjs`, `node --experimental-vm-modules tests/ui-active-roster.mjs`, and the extraction verifier. The full `npm test` remains blocked by eight legacy reference-art dependencies; individually executed50 suites yielded42 pass and8 missing-art failures, recorded in `rengoku-test-results.json`. Assertions were not disabled.

For real browser QA, start `python tools/serve_game.py`, install Playwright and Chromium if necessary, and run `python tools/qa_rengoku.py`. Optional `CHROMIUM_PATH` selects a system browser. The browser fixture forces Ultimate readiness to inspect its lifecycle and records screenshots/results under `docs/rengoku-qa`. It decodes and schedules the real4.64s MP3 and tests pause/resume. This is not a subjective listening review.

## R2 archive

`Archive Rengoku assets to R2` uses existing GitHub Secrets. It stores versioned sheets, runtime assets, contact images, extraction report and clean voice, verifies downloaded bytes, and commits a receipt at `docs/rengoku-r2-archive.json`. Existing bucket objects and repository sources are not removed. No credential belongs in source or frontend. The game continues loading its runtime assets from GitHub Pages, so it needs no R2 public access or CORS change.
