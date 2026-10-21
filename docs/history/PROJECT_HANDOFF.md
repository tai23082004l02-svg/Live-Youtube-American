## Correction: Kurama dodge is fixed at50%
User clarified: after charging completes, transformed Naruto uses exactly50% dodgeChance, replacing the base rate (not a multiplier or50-point addition). Normal form uses configured dodgeChance. Attack remains+20%; charging immunity remains1 second. HUD/log updated. No tests rerun, per user instruction.

## Kurama dodge bonus update (2026-10-18)
After the 1-second charge completes, transformed Naruto also has 1.5 times the configured dodgeChance, capped at100% (12% becomes18%). This is a relative50% increase, not50 percentage points. Base settings are unchanged; no stacking, no effect during charging, no change to blink/block/dash reaction. HUD/log show the bonus. The user explicitly requested no test rerun for this small change; tests were not rerun.

# Latest update — Prototype 15 / One-second invulnerable charging

Same project/port: new-chat-5/down-arena, http://127.0.0.1:8766/.

- User source ../sprite_sources/naruto_transform.png is cut by tools/prepare_transform.py into six aligned 320x224 RGBA poses, atlas/contact/metadata and dist/assets/naruto_transform.webp. It loads ahead only with Naruto, alongside normal/Kurama/VFX atlases.
- Alive Naruto strictly below50% starts state `transform` once. It cancels the current action, clears movement and begins a60-tick (one simulation second) charge. HP is not healed. At exactly50% there is no charge; lethal hits still do not revive Naruto.
- During charging: no movement or new attacks/skills; cooldowns pause; incoming damage is discarded before dodge/block/critical rolls. Body collisions move the other actor instead of displacing Naruto. Two charging bodies remain fixed. Existing projectiles and clone helpers can keep acting.
- On tick60 the actor becomes Kurama, returns idle, emits the existing kurama event, and gains the20% damage multiplier. transformProtectedTick protects that completion tick too; damage resumes on the following tick. Thus all60 charging ticks are fully protected, no early buff or vulnerable final frame. Timing follows simulation speed:1s at1x,2 real seconds at0.5x,0.5 real seconds at2x.
- Rendering plays six charging frames in place even with optional VFX disabled. HUD shows charging/immune status, then Kurama +20%. Per-UID initiation/completion logs remain distinct for repeated Naruto copies. New matches reset all charge fields.
- Updated kurama-tests verifies exactly60 ticks, every-tick stationary position and damage immunity including overlap collisions, post-charge damage, strict threshold, one initiation/completion, reset, no revival,20% bonus and duplicate isolation. Existing simulation/regression and extended UI smoke tests cover rendering, charge HUD, reset, clones,5-FFA and5v5.
- Validation completed: simulation/regression suites and current UI smoke pass. Direct browser Prototype15 ran Naruto vsPiccolo through a full match and confirmed the completed Kurama/+20% state. The exact60-tick stationary/immunity boundary was verified automatically. No standalone HTML or Library updates.

## Previous handoff (historical)

# Latest update — Prototype 14 / Naruto Kurama awakening

- Same source/server: new-chat-5/down-arena, http://127.0.0.1:8766/.
- User supplied ../sprite_sources/naruto_kurama.png. tools/prepare_kurama.py aligns 60 RGBA slots to normal Naruto's existing row mapping; some source defeat cells span columns, so final complete resting pose is reused. Empty-hand recovery replaces the transformed shuriken source's held-orb pose after release. Source PNG atlas/individual frames/contact sheet are in art; runtime lossless dist/assets/naruto_kurama.webp.
- Naruto alone awakens when **alive and strictly below 50% max HP**. Exactly50% does not trigger. awakenNaruto runs before each simulation tick and after that tick's damage resolution. It emits one kurama event per actor. Lethal damage does not awaken/revive Naruto. State persists for the remainder of the match, including defeat presentation; new Duel resets it. No healing, speed buff, cooldown reset or skill interruption.
- +20% outgoing damage is a single1.2 multiplier at hit resolution for transformed Naruto, including punches/kicks, Rasengan, direct/splash Rasenshuriken and clone damage credited to the owner UID. It stacks multiplicatively with configured skill damage, critical multiplier and existing defensive reductions, rounded once at the end. Base melee/skillPower are never mutated, so no repeated stacking. Already-flying projectiles resolve against the owner's form when they hit. All hits queued during the tick of the initial threshold crossing use the pre-awakening state; awakening follows resolution.
- Character/ghost/clone drawing swaps to Kurama atlas according to the correct owner's kurama flag. Helpers inherit their owner's current form visually and damage multiplier. Team copies awaken independently by uid. HUD role shows Kurama +20%, a golden ring burst and log announce awakening. VFX-off still shows the transformed character and attack indicator.
- Both Naruto forms load ahead with Naruto assets, only if Naruto is selected; this avoids a mid-fight network fetch/blank sprite. Non-Naruto matches do not load Kurama. Other skills, no-time-limit rules and teams are unchanged.
- Tests: kurama-tests covers exact threshold, single event, no lethal revival, persistence/new-match reset, duplicate isolation and20% damage. Existing Naruto/default combat/replay and UI suites also run. UI mock specifically forces a threshold crossing and checks render/role/reset.

- Validation completed: npm test passes. Direct browser duel Naruto vs Piccolo on8766 showed the awakening log, golden transformed defeat pose, HUD attack+20%, clone hits35→42 and Rasenshuriken220→264. No standalone or Library update.

## Earlier handoff (historical)

# Latest update — Prototype 13 / Normal-form Naruto

- Same source and port: new-chat-5/down-arena, http://127.0.0.1:8766/.
- User source sheets: ../sprite_sources/naruto.png (1024x1536 RGBA) and naruto_vfx.png (1145x1374 RGBA). Character source already has real alpha despite brown RGB in transparent pixels. No replacement art generated. tools/prepare_naruto.py creates aligned PNG frames, contact preview, metadata, source atlases and lossless WebP runtime atlases. Some final defeat concept cells are merged; the last clean lying pose is held/reused instead of cutting a torso/feet into separate frames.
- Normal form only; no transformation, Kurama aura or Tailed Beast Bomb. Character atlas is 6x10 frames at 320x224, pivot160,192. Rows idle/run/punch/dash/Rasengan/clone-seals/hurt/defeat/kick/shuriken. First eight rows follow the existing engine convention; narutoPose chooses the extra rows and cast/recovery frames. Punch/kick alternate via combo. VFX atlas contains ONLY the first three relevant source rows: Rasengan, Rasenshuriken, smoke (5x3).
- Defaults 1150 HP,190 speed,72 melee,100% skill/cooldown, plus shared combat probability/tactic defaults. Stats editor and saved-settings migration support Naruto. Loads naruto + naruto_vfx only when selected; repeated copies reuse atlases.
- Rasengan: 0.45s preparation, dash at380 units/s during0.45–0.73s, one175-damage contact within95 units,6s cooldown, recovery to1.05s. Can miss against movement/defense.
- Rasenshuriken:0.85s cast,220 direct damage,90 secondary splash within110 units,500 speed,10s cooldown. Shares existing block/dodge/crit/skill scaling and no friendly damage. No generic ki beam for Naruto.
- Clone skill:0.55s preparation,2 temporary helpers,6s life,14s cooldown. Each follows nearest living enemy of its owner, moves at owner speed,35 skill-scaled damage within65 units every0.9s. Owner UID receives damage/critical credit. Helpers have no HP, are not targeted by enemy AI, do not block shots/bodies, are not player slots or victory survivors, and disappear when owner dies. This is a supporting skill, not fully playable clone actors. Per-owner cap2; no stacking beyond it. Summon/expiry emits smoke. Original Naruto skills/stats do not mutate a repeated teammate's state.
- Free-for-all can now select2–5 distinct characters with A–E. Existing 1v1 and teams1–5 per side remain. Larger HUD is used for five-player FFA. No match time limit reintroduced.
- Validation: existing regression suites pass. naruto-tests covers80 real-default duels/5-FFA,15 repeated Naruto team games,replay,Rasengan single hit,shuriken splash,clone expiry/death,no self/allied damage and UID attribution. UI mock covers Naruto results/skills,settings apply/reset,lazy assets,5-FFA and repeated team actors. Frame dimensions/alpha/nonempty content and HTML unique IDs checked.
- Direct browser: Prototype13 loads on8766; selected Naruto vsPiccolo, inspected normal-form sprite on the actual arena, ran a whole duel and saw Rasengan,Rasenshuriken,clone damage in logs and correct final result. Audio listening/mobile QA not performed. No standalone export or Library changes.

## Previous handoff (historical)

# Latest update — Prototype 12 / Celestial arena, no time limit

- Same source/server: new-chat-5/down-arena, http://127.0.0.1:8766/.
- User saved original art at ../sprite_sources/arena_background.png (1672x941). Runtime uses optimized dist/assets/arena.webp. floor() draws the art at 960x540. Common arena asset is loaded together with selected character assets before Start is enabled and retained on roster changes; a failed image loads through the existing retry/error flow. Character resources remain lazy and deduplicated.
- Walkable ground is fitted to the art's trapezoid: y 145–390; left edge = 180-(y-135)*0.22, right = 960-left. clampPosition is shared by movement/body resolution, random defensive blink and Goku teleport destinations. Team rows now span y150–380 and free-for-all y270 +/-110 to remain on the platform. This changes fight geometry and therefore old seed outcomes.
- **Removed the 60-second ending rule in every mode.** The HUD counts elapsed seconds up from zero and the badge says unlimited. Sole surviving actor/team wins, simultaneous total elimination draws. No timeout HP comparison. Extremely defensive/invulnerable configurations can remain unresolved until the viewer resets, as requested by removing the deadline.
- Tests updated to assert no result at the old deadline and combat-tests checks frozen opponents past 120 seconds in solo/team. All prior regression, combat, team and UI tests pass. Common arena asset is included in loadedAssets diagnostics.
- Direct browser verification: Prototype 12 on 8766 displayed the exact supplied background, elapsed clock and unlimited label, and a real duel completed with Broly victory. Audio/mobile QA not performed. No standalone HTML or Library update.

## Earlier handoff (historical)

# Latest update — Prototype 11 / Combat probabilities and tactical AI

Same project and port: new-chat-5/down-arena, http://127.0.0.1:8766/.

- Added per-species settings in config/editor: dodgeChance 12%, blinkChance 8%, blinkCooldown 6 seconds, critChance 15%, critDamage 175% total multiplier, blockChance 18%, blockReduction 50%, damageReduction 0%, aggression 65%, preferredRange 170px, reactionChance 75%. Existing saved HP/speed/etc are retained and missing new fields receive defaults via normalizeStats. Settings apply to all copies of the species.
- Dodge: chance on an incoming hit; attempts a short safe displacement and cancels that hit if a free position is found. Random blink is checked only if dodge failed and blink cooldown is zero; tries a safe random point 110–210 units away, cancels current action, grants 0.18s immunity and starts its separate cooldown. Does not replace Goku's castable teleport. If no safe position exists after 12 attempts, defense fails and damage proceeds.
- Resolution: friendly-fire guard -> blink immunity -> dodge -> eligible blink -> attacker critical -> global reduction -> block reduction -> round damage. Ordinary minimum damage 1, full block (100% reduction) can produce zero. Critical and block may both occur. Probabilities are conditional, not a promise about observed frequency in short matches. No extra random numbers for disabled 0% or guaranteed 100% outcomes.
- Tactical AI chooses approach/orbit/retreat on a seeded 0.8–1.6s cadence, weighted by aggression. Defensive behavior uses preferredRange and low-HP retreat. Melee requires an approach decision; reactionChance gates the existing danger-triggered dash, subject to dash cooldown. At aggression 100%, retain previous pursuit behavior. Skill priorities remain intact.
- Uses only simulation RNG; same complete config/seed/teams/order/swap remains replayable. Cosmetic clock does not affect outcomes. Fighter counters: crits, blocks, evades, blinks. Hit events include critical/blocked flags; evade/random teleport cues and damage labels/logs identify actors by uid.
- Existing deterministic skill/damage regression tests now use baseline-fixture.mjs, disabling new chance defenses, criticals and tactics to preserve old exact assertions. New combat-tests.mjs uses production defaults and covers 80 real-settings solo/team matches, exact 0/100% outcomes, critical+block+armor stacking, blink cooldown, old-settings migration and replay. UI mock also covers new settings apply/limits/restore. Prior 5v5 safety tests remain intact.
- Direct browser: Prototype 11 loaded, editor showed all new values/hints, applied current values and ran a real duel. Audio/mobile QA not performed. No standalone or Library update.

## Earlier handoff (historical)

# Latest update — Prototype 10 / Custom teams

- Same project/launcher/port: new-chat-5/down-arena, http://127.0.0.1:8766/.
- Modes: existing 1v1; PVP free-for-all (2–4 distinct characters); **PVP team battle**, A/B each 1–5 slots, including 3v1, 2v2, 5v5. Repeated characters are allowed in team mode. All actors remain AI-controlled.
- `new Duel(seed, swap, roster, stats, teams=null)` adds an optional parallel array of A/B team assignments. Without teams, prior validation and results are preserved. With teams, both sides are required, at most five per side; repeated species are permitted.
- Fighter `id` is still the character/species used for skills/assets/stats. `uid` is the unique actor ID (legacy solo modes use species IDs), `team` determines hostility, `slot` numbers each team locally. Never use species ID to identify a specific actor in team combat. Shots carry ownerUid; events carry uid and sourceUid; targetId stores uid. `shotOwner` supports legacy shots without ownerUid for old tests.
- `isEnemy` is shared by targeting, danger avoidance, wave AoE, projectile collision and Light Grenade splash, plus a final damage guard. Allies do not absorb shots or receive friendly damage. Collision between bodies remains physical for all living fighters. Dead owners' projectiles may finish their flight.
- Team victory when only one team remains alive; double KO draws. At 60s compare total current HP / total initial max HP per team (dead actors count in denominator), equal ratios draw. Results are teamA/teamB/draw. Solo results remain species IDs/draw. Replay requires same seed, side, roster order, teams and stats.
- Team spawns on opposite sides with up to five vertical positions; swap reverses sides. HUD uses two columns outside the canvas and team-colored bars, rings and actor labels. Logs, hit flashes and cosmetic shot sockets identify actors by uid. Asset loader still deduplicates by species and only loads selected species/VFX.
- Stats editor stays species-based: changing Goku affects all Goku copies; no per-slot stat editor.
- Tests: previous regression suites + 90 team games (30 each 3v1/2v2/5v5), replay, unique spawns/UIDs, no friendly projectile/AoE damage, same-species opponents, attribution, timeout/double KO/win. UI mock runs complete 5v5 including results, 3v1 resizing and return to solo. HTML nesting/unique IDs checked.
- Direct browser: opened Prototype 10 on 8766, configured and ran 5v5 with duplicate characters and saw **Team B victory** with several survivors. Checked team HUD and settings visually. Earlier browser connection failures are historical. No audio listening or mobile visual QA performed.
- No standalone or Library update.

## Previous handoff (historical)

# Latest update — Prototype 09 / PVP and selected character stats

- Local source and port unchanged: new-chat-5/down-arena, http://127.0.0.1:8766/.
- The user requested the label **PVP** instead of Free-for-all. This remains AI-controlled combat for video recording, not network multiplayer or keyboard-controlled combat.
- PVP has a player-count selector for 2, 3 or 4 distinct roster entries. Four is the current maximum because the roster contains four characters; duplicates are not supported. A/B/C/D controls, HUD and skill cards show only active slots. 1v1 is retained. Player count or roster changes reset the match and load only selected resources.
- Simulation accepts arrays of length 2–4 and uses evenly spaced elliptical spawns for 3/4 fighters. Existing target selection, pair collision, splash and elimination logic remains shared. Internal multi-fighter mode is now `pvp`.
- Stats editor: `statCharacter` chooses one visible fieldset. Apply and restore operate only on that selected character, retaining the saved configuration of other characters. Draft field values survive switching the selector until refresh. localStorage key remains down-arena-stats-v1.
- Validation: regression suites pass; added 100 four-player simulations including deterministic replays, bounds, HP/death invariants, unique spawns and timeout tie. UI mock covers player counts, visibility, stats selection, validation and selected-only restore. HTML nesting and unique controller IDs checked.
- **Direct browser verification succeeded on 8766 this time:** Prototype 09 loads, switched PVP to four fighters and ran a real match with Piccolo; switched to two and confirmed extra slots hidden; opened stats and selected Piccolo/Goku with only the selected panel visible. Audio listening and narrow-screen visual QA were not performed. Earlier browser connection limitations below are historical.
- No standalone HTML regenerated and no Library update.

## Earlier handoff (historical)

# Current handoff — Prototype 08 / Piccolo (2026-10-18)

Active source: `C:\Users\ntt23\Documents\Codex\2026-10-18\new-chat-5\down-arena`.
Sibling `sprite_sources/picolo.png` and `piccolo_vfx.png` are the user supplied originals.
Use **http://127.0.0.1:8766/** for this copy. Port 8765 showed Prototype 07 from the previous copy during this session. `Start_Game.cmd`, `Start_Game_8766.cmd`, and `npm start` target 8766. Do not edit or delete the old project.

## Current behavior
- Four roster entries: Goku, Vegeta, Broly, Piccolo. 1v1 picks any distinct pair. FFA still has three fighters, now selected with A/B/C controls; duplicates are automatically replaced. This is not a four-player mode.
- Piccolo defaults: 1250 HP, 170 speed, 80 melee, 100% skill damage/cooldown. Existing localStorage settings retain old fighters and acquire Piccolo defaults automatically.
- Piccolo: basic ki shot, Special Beam Cannon (1.1s windup, 300 damage, 11s cooldown), Hellzone Grenade (five 44-damage shots with brief deterministic steering, 10s cooldown), Light Grenade (260 direct damage, 130 secondary splash within 105 units, 13s cooldown). Modifiers apply as for other fighters; splash does not damage its caster or duplicate the direct hit.
- `dist/assets.js` lazily loads Piccolo + Piccolo VFX only when selected. Existing Broly assets remain separate.
- `dist/presentation.js` defines Piccolo poses, measured charge anchors and mirrored emission sockets; no cosmetic data enters combat simulation.
- `tools/prepare_piccolo.py`: rebuild with Python + Pillow/numpy/scipy, from project root. Writes 60 aligned character animation slots (some deliberately reused poses) and 25 VFX PNG frames into `art/frames/`, PNG atlases into `art/atlases/` and lossless WebP runtime atlases into `dist/assets/`. Character grid 6 columns, VFX grid 5 columns, all frames 320x224. Character pivot [160,192], VFX default [160,112]. Source is concept art with uneven cells, merged beam cells, baked charge glows and some source-edge clipping; it is not a hand-authored production animation set. Do not claim 60 unique poses. Selected clean frames replace merged beam-only cells.
- Audio uses Web Audio synthesis, including three new charge cues; no external WAV files.

## Validation
`npm test` passes the previous regression suites plus 180 Piccolo duels and 60 Piccolo FFA games, replay determinism, single emission / five grenades, direct and splash damage, cooldown/damage modifiers and mirrored sockets. UI mock covers Piccolo selection, stats apply/reset, selected-only loading, FFA picks, both VFX settings and match results. `node --check` passes app/sim. Frame contact sheet inspected directly as an image.

**Actual browser visual/audio QA remains incomplete.** Browser tool returned stale-session errors and connection timeouts on 8766. Starting Python through the tools reported a server but its URL could not be reached from the host browser; do not claim the new server is verified running. Run `Start_Game_8766.cmd` from Explorer to serve the actual copied project, then open 8766 and verify Prototype 08 and Piccolo in the roster. The user requested this separate port. No standalone HTML rebuilt and no Library artifact updated.

## Previous handoff (historical; current section above takes precedence)

# Handoff — Down Arena

## Mục tiêu
Game 2D tự đấu phục vụ quay video. Không có điều khiển nhân vật bằng bàn phím. Giữ phong cách chibi top-down hơi nghiêng, sân 16:9 và ba nhân vật Goku, Vegeta, Broly.

## Bản chuẩn và cách tiếp tục
Đọc README.md, dist/sim.js, dist/app.js, dist/assets.js trước khi sửa. Chỉnh mã mô-đun trước, sau đó chạy build_standalone.py. Không chỉnh riêng HTML sinh ra rồi bỏ quên mã nguồn. Bản xem nhanh và bản đầy đủ phải dùng cùng luật chiến đấu.

Tệp HTML đang dùng có Library ID ổn định: libfile_4a85217cf62481919fe091341f907b3e. Nếu cập nhật Library, thay thế đúng tệp này và giữ version guard; tra phiên bản hiện tại trước khi ghi. Không tạo tệp trùng tên nếu mục tiêu là cập nhật bản hiện có.

## Hiện trạng
- Mô phỏng 60 tick/giây, AI quyết định khoảng 10 lần/giây, RNG có seed; không gọi mô hình AI trong trận.
- Một hiệp, 60 giây tối đa; hết giờ so phần trăm HP, chết đồng thời là hòa.
- Chọn hai nhân vật khác nhau; đổi cặp hoặc seed đặt lại trận.
- Goku: Kamehameha, lướt, Dịch chuyển tức thời, Kaioken.
- Vegeta: Galick Gun, lướt, ba đạn khí, Final Flash.
- Broly: 1300 HP, Eraser Cannon, lướt, lao người, sóng nổ, Gigantic Roar.
- Có tạm dừng, đổi bên, 0.5/1/2x, vùng va chạm, bật/tắt hiệu ứng, âm thanh tổng hợp, chế độ quay, replay từ đầu cùng seed.
- Chưa có seek/tua tới thời điểm bất kỳ, thể thức ba hiệp hay ghi hình trực tiếp.

## Tài nguyên và mở rộng
ROSTER và ASSET_MANIFEST nằm trong dist/assets.js. Dữ liệu ảnh là WebP có alpha. Khi chọn cặp chỉ nạp tài nguyên của hai nhân vật đó; lớp VFX Broly chỉ tải nếu Broly được chọn. Khi chuyển cặp nhanh, token thế hệ ngăn dữ liệu cũ ghi đè dữ liệu mới. Chưa có bộ skill điều khiển hoàn toàn bằng data: thêm nhân vật mới vẫn cần chỉnh sim, render, giao diện chọn và kiểm tra.

Bản HTML độc lập vẫn nhúng mọi ảnh nên tổng dung lượng vẫn tăng khi thêm nhân vật. Bản đầy đủ có thể tăng tổng tài nguyên mà không buộc tải tất cả ngay khi mở. Không khẳng định giới hạn dung lượng chính xác của phần xem trước: bản khoảng 9.85 MB từng bị trắng, bản khoảng 3.06 MB người dùng xác nhận mở được.

## Kiểm tra
npm test gồm kiểm tra mô phỏng, kỹ năng, 400 trận với Broly, tải tài nguyên và UI giả lập. Không diễn giải UI giả lập thành đã kiểm tra bằng trình duyệt thật. User đã kiểm tra các bản trước bằng mắt; khi sửa hình/âm thanh vẫn cần xem trực tiếp.

## Hosting
Dự án từng đăng ký Sites nhưng chưa publish vì môi trường không kết nối được Git. Không khẳng định có URL online đang hoạt động. Bản ZIP này không kèm credential, Git metadata hay cấu hình triển khai riêng của phiên chat.

## Broly cast alignment fix
`dist/presentation.js` holds Broly scale/pivot, per-pose charge sockets, cast-frame selection and projectile screen projection. `app.js` captures presentation-only shot sockets in a WeakMap immediately after the emission tick. Charge and projectile share the same hand/orb origin, mirrored with facing; the visual offset blends onto the existing ground collision path. Combat simulation is unchanged. Broly uses recovery frame 5 after release to avoid holding a second orb throughout recovery. `muzzle-tests.mjs` checks launch origin and both facings.

User preference: the local server at http://127.0.0.1:8765 is now the primary deliverable. Edit the modular source directly; do not regenerate or publish the standalone HTML unless the user asks.

## Bản 07 — chỉnh chỉ số và FFA
`dist/config.js` khai báo chỉ số mặc định và giới hạn. Constructor `new Duel(seed, swap, fighters, stats)` nhận 2 hoặc 3 nhân vật khác nhau. `app.js` lưu cấu hình chỉ số vào localStorage key `down-arena-stats-v1`, có fallback nếu storage bị chặn. Apply đặt lại trận. Mỗi cấu hình stats nằm trong simulation để seed chỉ tái hiện khi cả cấu hình/mode/vị trí khớp. Mode FFA dùng cả ba nhân vật, chọn mục tiêu gần còn sống, va chạm từng cặp, projectile tìm va chạm đầu tiên, AoE nhiều mục tiêu, chết đồng thời và xếp hạng %HP khi hết giờ. `ffa-tests.mjs` kiểm tra 200 trận, cấu hình tùy chỉnh và vùng nổ. Không sinh HTML mới theo yêu cầu người dùng: localhost là bản chính.
