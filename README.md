# Down Arena

## 🎮 Chơi online

### [▶ Mở Down Arena online](https://tai23082004l02-svg.github.io/Live-Youtube-American/dist/)

Mở liên kết trên bằng Chrome hoặc Edge, đợi tải tài nguyên rồi chọn chế độ và bắt đầu trận. Không cần tải game hoặc chạy máy chủ trên máy.

README là trang giới thiệu; bấm liên kết để mở game trên GitHub Pages.

---

## Naruto Uzumaki — KCM → Baryon

Đã thêm Naruto vào danh sách **10 nhân vật**. Chọn **Đấu thường → Naruto Uzumaki (KCM → Baryon)** để thử.

- Xuất hiện: Hiền Nhân → KCM2.
- HP dưới 50%: biến hình Baryon một lần, giữ nguyên HP; tốc độ và cận chiến tăng 15%, tốc độ tích nộ tăng30% đến hết trận.
- KCM: Rasengan Rush dịch chuyển sát mục tiêu, hai ảnh phân thân tồn tại8 giây và Rasenshuriken. Baryon: Crimson Rush, Tail Counter và Baryon Rasengan.
- Hai Ultimate riêng, ba câu thoại tiếng Nhật; hoạt cảnh dừng thời gian chiến đấu và khớp thời lượng âm thanh.

[Xem toàn bộ sheet gốc](art/drafts/naruto-v2) · [Xem frame đã tách](art/frames/naruto_v2) · [Ảnh trong game](docs/naruto-v2-qa/kcm.png) · [Chi tiết và kiểm tra](docs/NARUTO_V2.md)

## Bình chọn đối thủ — bản mô phỏng

Chọn **Live → Bình chọn đối thủ → Bắt đầu Live Arena** để mở khung dọc9:16: bảng6 tên phía trên, trận ngang16:9 ở giữa, phần dưới đen. Bình chọn mở đến khi trận hiện tại kết thúc, rồi chốt top2 cho trận tiếp theo; không có chân dung. **Chưa kết nối chat YouTube: số phiếu hiện là mô phỏng.** Có thể tắt mô phỏng và thử đổi phiếu trong bảng điều khiển.

[Xem hướng dẫn OBS và bình chọn](docs/VIEWER_VOTE.md) · [Xem bố cục](docs/viewer-vote-qa/broadcast.png)

## Rengoku — 9 nhân vật

Chọn **Kyojuro Rengoku** trong đấu đơn, FFA, đội, giải đấu hoặc Live Arena. Có 3 kỹ năng kiếm lửa, nội tại Burning Heart khi HP ≤35%, Ultimate Purgatory và lời tung chiêu tiếng Nhật 4,64 giây. Nếu còn bản cũ, tải lại trang bằng Ctrl+F5; góc màn hình phải hiện **RENGOKU / 9 CHARACTERS**.

- 5 sheet nguồn được tách thành 122 frame; atlas có padding 32 px và metadata riêng cho hàng 5/6 frame.
- Kiểm tra: Rengoku, UI, âm thanh, Live và trình duyệt Chromium thực tế đã qua. Kết quả tổng: 42/50 bộ qua; 8 bộ cũ vẫn thiếu tài nguyên đối chiếu trong `art`, giống trước thay đổi này.
- Xem [hướng dẫn Rengoku](docs/RENGOKU.md) và [ảnh kiểm tra trong game](docs/rengoku-qa/cinematic.png).

## Sukuna presentation impact revision — 2026-10-21 (latest)

User feedback: Sukuna lacked visual force compared with Gojo. Compared Gojo native VFX and measured strong-alpha actor heights: original Sukuna~110px versus Gojo~125px. Increased Sukuna actor presentation scale from.86 to.98 (~125px); adjusted spectator entrance compensation to avoid a size pop. Source art, extraction and all combat/audio parameters remain unchanged.

- Added character-local charge light, precursor slash/Furnace buildup, release afterglow and ground rings. Dismantle uses larger native crescents with directional afterimages instead of the generic rotating energy-orb overlay. Furnace arrow and impact have stronger scale/lighting. Dedicated impact renderer uses peak flashes before fragments dissipate; ordinary hit accents stay smaller than skill impacts.
- Shrine now stages spectral warning → shrine assembly → empowered architecture, with6 sharply timed slash bursts matching existing30-tick pulse cadence. Field stays fixed; added bounded local slash lattice/rings. Personal/team cinematic actor changes from raised hand to seal to open arms; release pose used after warning. Local effects use combat time/visual clock and no RNG; no simulation changes. Additional impact shake respects reduced-effects. Reduced mode removes slash afterimages/lattice and reduces flash.
- Full regression: `docs/sukuna-impact-test-results.log`. New render checks enforce finite native crops, balanced canvas, deterministic rendering/no RNG, scene immutability and reduced mode. Actual-renderer offline image/path proof reviewed in `art/frames/sukuna/runtime_proof.png`; regeneration tools now capture radial fills and slash paths too. Direct browser animation/listening QA remains pending due the recorded tab/session error.
- Refresh http://127.0.0.1:8766/?build=sukuna-impact-2 (Ctrl+F5); badge SUKUNA IMPACT /8 CHARACTERS. Existing server untouched. No new paid voice requests.

## Sukuna playable integration — 2026-10-21 (latest)

Current project: `C:\Users\ntt23\Documents\Codex\2026-10-21\trong-phi-n-tr\down-arena`. Runtime code remains in `dist/src`. Active roster: **8** — Goku Ultra, Ichigo, Sung Jinwoo, Saber, Tatsumaki, Boa Hancock, Gojo, Ryomen Sukuna (`sukuna`). Legacy definitions remain retired. This section supersedes historical roster counts below.

- Sukuna defaults: HP1250, speed210, melee78, dodge15%, blink10%, block20%, preferredRange160. Dismantle150/CD7s: fixed-direction piercing slash; Cleave190/CD9s: short approach and range-checked slash, root prevents movement; Furnace230 direct +70 splash to other nearby enemies/CD14s. Common skillPower, defenses, arena bounds and team safety apply. All stats have a full editable panel.
- Reverse Cursed Technique: below35%HP, once per match, restores15%maxHP (rounded total) across6 pulses over3 combat seconds. No immunity/resurrection; pause/Ultimate freeze suspends healing. Resets with a fresh match.
- Malevolent Shrine: existing personal rage/shared personal-team queue,245-step cinematic,36-tick warning, fixed200-radius field centered at casting position,6 pulses70×existing Ultimate multiplier2 =840 base total over3s. No root; leaving field avoids later pulses. Owner death/petrification cancels. Automatic dodge/blink invulnerability cannot negate Ultimate hits inside the field. Damage does not generate rage. Sukuna may lead the existing team Ultimate with themed slash VFX and his native dialogue/voice; team damage rules unchanged.
- Six user-saved source PNGs retain their original names `Sukuna*-1.png` through `Sukuna*-6.png` in `art/sources`. Inspected before extraction. `python tools/prepare_sukuna.py` generates140 unique native raw frames with32px padding,8 lossless runtime atlases and per-frame native pivots in `render/sukuna-meta.js`. Full positive-alpha RGBA is assigned exactly once; original hashes unchanged. Contact sheets and report in `art/frames/sukuna`. `python tools/verify_sukuna.py` independently verifies source reconstruction/native pixels/padding. Source-edge content cannot be reconstructed by extraction.
- `python tools/prepare_spectator_meta.py` regenerates gallery alignment. Fighter and spectator entrances show portal-only frames before Sukuna; native entrance actor/VFX reused. Full frame metadata is used for body, cast, dash ghosts, projectiles, domain and dialogue. All16 static selectors, stats panel, random/FFA/teams/tournament/both Live formats include Sukuna;8-slot cups now have8 unique active entrants.
- ElevenLabs: one existing worker queue job `sukuna_shrine_ja_01`, Adam preset `pNInz6obpgDQGcFmaJgB`, eleven_v3, Japanese domain call,29 submitted characters. Raw `art/audio/elevenlabs/sukuna_malevolent_shrine_japanese_raw.mp3`; byte-identical runtime `dist/assets/audio/voices/sukuna_ultimate_ja.mp3`. ffprobe4.08s → ceil(4.08×60)=245 personal/team cinematic steps. Existing cache/pause/resume/mute/reset/music ducking retained. No key read or exposed, no paid retry and no voice cloning.
- Validation: full `npm test` PASS (`docs/sukuna-test-results.log`); expanded actual-app UI loop PASS (`docs/sukuna-ui-results.log`) including4x wall-clock cinematic, pause/resume and native dialogue/Ultimate atlas draws. New Sukuna tests cover skills/miss/root/splash/team safety/healing/death/freeze/domain840/escape/automatic dodge/seeded duel/portrait5v5. Source/native verifier PASS (`docs/sukuna-assets-verification.log`); MP3 decode PASS; six launcher tests PASS. Offline actual-renderer composition proof reviewed (`art/frames/sukuna/runtime_proof.png`), regenerate with `python tools/qa_sukuna_render.py`.
- **Direct browser animation/audio listening QA remains pending.** In-app browser attempt failed with `Tab 1 is not part of browser session`; offline composition and automated tests do not replace listening/interactive QA.
- Port8766 retained. No listener was found; launched the existing `tools/serve_game.py` for this exact checkout, without stopping any other server. Launcher now advertises SUKUNA /8 CHARACTERS. Refresh **http://127.0.0.1:8766/?build=sukuna-1** and Ctrl+F5 if cached.

> New character / sprite extraction / Japanese voice workflow: [docs/CHARACTER_AUDIO_WORKFLOW.md](docs/CHARACTER_AUDIO_WORKFLOW.md). Read before adding or redesigning a character.

> CURRENT PLAYABLE ROSTER (2026-10-21): Goku Ultra, Ichigo, Sung Jinwoo, Saber, Tatsumaki, Boa Hancock, Gojo, Ryomen Sukuna. Other characters are retired from all game selection and random modes; definitions/assets are retained for redesign. Older sections below are history.

## Gojo v2 — current implementation (2026-10-21)

Gojo rejoins the playable roster: seven characters total. Source sheets are `art/sources/gojo_v2_{actions,skills,intro,ultimate,dialogue}.png`. Run `python tools/prepare_gojo_v2.py` then `python tools/prepare_spectator_meta.py` to regenerate runtime assets. Extraction preserves original alpha coverage and adds transparent padding; native frame dimensions and pivots live in `dist/src/render/gojo-v2-meta.js`. Review contacts and extraction report are in `art/frames/gojo_v2/`. Older Gojo sections below are historical; the previous definition is archived as `gojo-legacy.js`.

Defaults: HP1200, speed205, melee70, dodge20%, blink15%, block15%. Blue105 (CD7s) pulls enemies; Red165 (CD9s) knocks back; Hollow Purple290 (CD16s) pierces. Infinity has a20% activation chance on incoming hits, reduces damage70%, and has a4s internal cooldown. Unlimited Void uses personal rage, a fixed190-radius field, five pulses totaling840 base damage, and respects the shared ultimate queue. Ultimate damage bypasses automatic dodge rolls; targets can escape the area. The2.5s entrance begins with a portal before Gojo appears. Native dialogue stays in the bottom area with English text.

Japanese voice: `dist/assets/audio/voices/gojo_ultimate_ja.mp3`, original in `art/audio/elevenlabs/`; duration3.28s, cinematic197 simulation steps. Uses existing voice mute, pause and music ducking. Actual browser appearance and audio playback still need direct QA; automated checks and extracted contact sheets are separate validation. Full `npm test` passed after integration, including Gojo v2, active-roster UI, audio, arena boundaries, deterministic replay and team battles.

# Down Arena

## Live Arena (2026-10-21)
**Vertical live:** choose **Live dọc · 9:16 · Đấu ngẫu nhiên + giải đấu**, then Start Live Arena. Six animated spectators rotate every60s. Five random1v1/2v2/5v5 matches precede an8-entrant solo cup, then the cycle repeats. The bottom25% is pure black; no ads. YouTube voting is not connected yet; entrants are selected automatically. See [vertical guide](docs/VERTICAL_LIVE.md). Refresh http://127.0.0.1:8766/?build=vertical-live-1 .
If port8766 is already serving this exact project, Start_Game reuses it and prints ALREADY RUNNING. An unrelated server is never stopped or replaced. This also supports the older static game server.
Choose **Live Arena** mode, then **Start Live Arena**. Eight unique fighters play seven single-elimination matches; fresh cups repeat automatically. Clean16:9 feed,5s introductions/victories/countdowns,8s champion display. Space pauses/resumes; Esc shows operator controls; Stop ends the session. This runs the game only, not a YouTube broadcast. See [Live Arena guide](docs/LIVE_ARENA.md). Refresh http://127.0.0.1:8766/?build=live-arena-1 .

Game chibi 2D top-down: AI tự giao đấu, phục vụ quay video. Có Goku, Vegeta, Broly, Piccolo và Naruto.

## Chạy game

Mở `Start_Game.cmd`, hoặc chạy `npm start` trong thư mục này. Mở http://127.0.0.1:8766/ và Ctrl+F5 sau khi cập nhật mã.
Máy chủ phục vụ thư mục `dist`; mã JavaScript chạy trực tiếp, không cần build. Cần Python và Node.js để chạy máy chủ/kiểm tra.

**Khi đổi phiên chat:** cổng thuộc tiến trình máy chủ, không thuộc phiên chat. Kiểm tra tiến trình/cây thư mục đang phục vụ trước khi khởi động lại. Cổng8765 từng chạy bản cũ ở new-chat-3; bản này dùng8766. Nếu8766 đang phục vụ đúng thư mục này thì tiếp tục dùng; không tự tắt tiến trình khác. Nếu bị chiếm bởi bản khác, dùng cổng trống và ghi lại URL trong handoff. Đổi tên chat không đổi đường dẫn dự án.

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `dist/src/characters/` | Mỗi nhân vật một mô-đun: chỉ số gốc, danh sách ảnh, thực thi skill, ưu tiên AI; pose/socket riêng khi có |
| `dist/src/engine/` | Mô phỏng, cấu hình chỉ số chung, tải ảnh có cache |
| `dist/src/render/` | Helper hiển thị chung, metadata VFX |
| `dist/src/app.js` | Giao diện, canvas, hiệu ứng và vòng lặp |
| `dist/assets/characters/<id>/` | Ảnh WebP riêng từng nhân vật |
| `dist/assets/arenas/` | Ảnh sàn đấu |
| `art/sources/` | Ảnh gốc người dùng; lưu ảnh mới vào đây |
| `art/frames/`, `art/atlases/` | Frame đã tách và atlas PNG |
| `tools/` | Công cụ tách ảnh đang dùng |
| `tests/` | Kiểm tra tự động |
| `docs/history/` | Tài liệu trước khi tổ chức lại |
| `tools/legacy/`, `archive/exports/`, `art/archive/` | Script và bản xuất cũ, giữ để tham khảo |

Các tệp JS nhỏ ngay dưới `dist` là điểm vào tương thích, trỏ vào `dist/src`. Sửa mã thật trong `dist/src`. Giữ tên dự án và webroot để máy chủ hiện tại tiếp tục hoạt động.

## Luật hiện tại

Đấu đôi; PVP tự do2–5 nhân vật khác nhau; PVP đội1–5 đấu sĩ mỗi đội, cho phép trùng nhân vật. AI điều khiển tất cả. Không giới hạn thời gian. Cùng seed, cấu hình và đội hình sẽ tái hiện trận.
Menu chỉ số chọn một nhân vật để chỉnh; thiết lập lưu localStorage `down-arena-stats-v1`.
Naruto dưới50% HP vận công1 giây đứng yên và miễn sát thương, rồi biến hình: sát thương+20%, tỷ lệ né **cố định50%**. Mỗi bản sao Naruto kích hoạt một lần mỗi trận. Hai phân thân hỗ trợ6 giây, không tính đấu sĩ còn sống.
Tài nguyên ảnh chỉ tải cho nhân vật được chọn và sàn đấu.

## Công cụ và kiểm tra

Chạy `npm test` từ gốc dự án. Gồm mô phỏng, skill, đội hình, tải tài nguyên và UI giả lập; UI giả lập không thay thế kiểm tra trình duyệt thật. Bài UI dùng VM modules của Node và có thể in cảnh báo experimental.
Tách lại ảnh với `python tools/prepare_piccolo.py`, `prepare_naruto.py`, `prepare_kurama.py`, hoặc `prepare_transform.py`. Cần Pillow, numpy, scipy. Đầu vào ở `art/sources`, đầu ra WebP theo nhân vật.
Script trong `tools/legacy` là bản lịch sử, có thể còn đường dẫn cũ; không chạy tự động. Không tái tạo HTML độc lập hoặc cập nhật Library nếu người dùng chưa yêu cầu.

## Gojo (thiết kế mới)
Đã tích hợp hai sheet riêng cho động tác cơ bản và kỹ năng. Blue hút, Red đẩy lùi, Hollow Purple xuyên mục tiêu, Vô Lượng Không Xứ làm chậm trong vùng. Menu có chỉnh chỉ số Gojo; FFA tối đa5 và đội tối đa5vs5. Dùng `python tools/prepare_gojo.py` để tách lại ảnh nguồn; cần Pillow, numpy, scipy, opencv-python.

## Sasuke
Đã có Sasuke trong chọn nhân vật và chỉnh chỉ số: Chidori lao tới, Hỏa Cầu nổ lan, Amaterasu vùng lửa4s, Susanoo chém và giảm40% sát thương trong5s. Tách ảnh với `python tools/prepare_sasuke.py` (Pillow,numpy,scipy). VFX dùng ô512x384, giữ nguyên alpha nguồn; không lọc bỏ phần sáng. FFA vẫn tối đa5 và đội tối đa5vs5.

- Susanoo: duy trì300tick (5s) sau khi kích hoạt; hồi25% sát thương HP thực sự lấy từ địch sau giảm sát thương/đỡ, làm tròn mỗi hit. Tối đa maxHP, không hồi sinh; áp dụng mọi đòn trong thời gian buff, kể cả vùng lửa/đạn. Có số hồi máu xanh trên đầu.

## Gogeta Super Saiyan
Gogeta có Big Bang Kamehameha xuyên mục tiêu, Stardust Breaker nổ lan, Meteor Explosion áp sát/nổ và Stardust Fall bắn5 đạn. Chọn được trong mọi chế độ và menu chỉ số. Tách lại bằng `python tools/prepare_gogeta.py` (Pillow,numpy,scipy): atlas nhân vật8 cột,96 frame; VFX8 cột,32 frame cỡ512x384. FFA vẫn tối đa5, đội tối đa5vs5.

## Luffy
Luffy có Gum-Gum Pistol tầm xa, Gatling5 nhịp, Red Hawk nổ lan, Gear2 tăng tốc30% và sát thương15% trong6s. Có chọn nhân vật/menu chỉ số. `python tools/prepare_luffy.py` nhận luffy.png cùng luffy_skills.png hoặc luffy_skill.png; xuất72 ô frame nhân vật (gồm tư thế giữ),24 VFX512x384 giữ alpha. FFA tối đa5, đội tối đa5vs5.

## Kích thước sàn tùy chỉnh (2026-10-18)
- Trong thanh tùy chọn có Kích thước sàn (%)100–400 và nút Áp dụng sàn. Mặc định100 giữ sàn cũ;200 tăng mỗi chiều2 lần, diện tích4 lần. Áp dụng bắt đầu trận mới. Lưu localStorage down-arena-arena-scale-v1 độc lập chỉ số. Mọi chế độ dùng cùng thông số.
- engine/arena.js chuẩn hóa hệ số; Duel nhận tham số thứ6 arenaScale=1. Giãn tọa độ và biên hình thang quanh480,270, giãn vị trí xuất phát, chỉnh giới hạn đạn và dịch chuyển. Giữ nguyên tốc độ/tầm đánh/sát thương/cooldown theo đơn vị thế giới.
- Renderer áp dụng camera1/scale cho toàn bộ canvas (nhân vật, clone, VFX, đạn, số sát thương) và vẽ nền theo world rect mở rộng. HUD ngoài canvas giữ nguyên. Bản đồ lớn hơn nên nhân vật nhỏ hơn trên màn hình.
- Có tests/arena-tests.mjs cho100/150/200/400%, replay, biên, đạn và Goku teleport ngoài biên cũ,5vs5; UI mock kiểm tra áp dụng, lưu, validate và camera/nền. Chưa QA trực tiếp trình duyệt do công cụ phiên browser lỗi đã ghi trước.

## Hệ số HP toàn bộ nhân vật
Trong menu chỉnh chỉ số có hệ số HP1–100, nút HP×10, Áp dụng HP toàn bộ và Reset HP về×1. Áp dụng bắt đầu trận mới, lưu localStorage down-arena-hp-multiplier-v1 riêng. Hệ số nhân HP gốc sau normalize cho tất cả actor (kể cả bản trùng đấu đội), không nhân chồng, không sửa stats gốc. HP cuối có thể vượt20000 do multiplier. Duel nhận tham số thứ7 hpMultiplier=1; maxHP/HP cùng nhân để giữ đúng tỉ lệ biến hình/hồi máu. Có tests/hp-multiplier-tests.mjs và UI mock cho preset, custom, reset, lưu và không nhân chồng.

- Đấu đội có nút Đội hình ngẫu nhiên cho cả hai đội, hoặc riêng độiA/B. Giữ số đấu sĩ, hệ sốHP, cỡ sàn và seed; xáo trộn roster để không trùng trong cùng đội (vẫn cho trùng giữa hai đội). Chọn tay vẫn cho phép trùng như cũ. Nhấn random bắt đầu trận mới; random dùng RNG giao diện, trận đấu theo seed và đội hình đã chọn.

## Frieza (Fide) — 2026-10-18
Nhân vật thứ10, có DeathBeam180 xuyên từng địch1 lần/CD6; hai DeathSaucers truy đuổi95 mỗi đĩa/CD10; Supernova270+splash120 trong140/CD15; Golden8s sát thương+25%, tốc+15%/CD24, không hồiHP/không miễn sát thương. Hook updateShot mới gọi riêng metadata nhân vật để điều hướng đĩa; stats/movement/damage hooks giữ nguyên.
Nguồn frieza.png1536x1024 có7 hàng, hurt/defeat chung hàng cuối; prepare_frieza.py ánh xạ thành8 hàng động tác cơ bản +4 hàng cast,8frame mỗi hàng (có tư thế giữ). Nguồn kỹ năng frieza_skill.png1024x1536, chấp nhận alias frieza_skills.png. Atlas thường/vàng96ô320x224, VFX24ô512x384 giữ alpha. Golden atlas đổi phần trắng thành vàng, giữ màu tím; bộ renderer pose/defeat/ghost8frame và aura theo hướng nhân vật.
Có menu, stats, random đội, HP toàn bộ và sàn mở rộng; tests/frieza-tests.mjs và UI mock. Chưa QA hình/âm thanh trực tiếp trên trình duyệt (lỗi công cụ phiên browser đã ghi trước).

## Gaara — 2026-10-18
Nhân vật thứ11, HP1250/speed175/melee65. Cát truy đuổi145/CD7, Quan tài cát70+trói90tick rồi bóp160/CD12 (có thể né, tôn trọng miễn Naruto), Khiên cát300 hấp thụ sau armor/block trong5s/CD15 (lượng khiên theo skillPower), Lưu sa vùng145 trong5s chậm50% và24damage mỗi0.5s/CD16. Vùng biến mất khi chủ chết, không ảnh hưởng đồng đội; slow tạm thời không ghi đè speed gốc.
Engine bổ sung hook absorbDamage sau giảm/đỡ và trước mấtHP/hút máu; damage hấp thụ không tính HP damage hay hút máu Sasuke. Có source/atlas/runtime riêng: gaara.png và gaara_skills.png1024x1536; prepare_gaara.py xuất72 body320x224/24 VFX512x384 giữ alpha. UI/stats/audio/random đội và HP multiplier dùng chung. Khiên lật theo f.face; quan tài vẽ theo uid mục tiêu.
Có tests/gaara-tests.mjs và UI mock. Trình duyệt/âm thanh thật chưa QA (lỗi phiên browser đã ghi trước).

## Yami Yugi — 2026-10-18
Nhân vật thứ12, HP900/speed185/melee50. DarkMagician sống10s/CD13 tự bắn90 mỗi1.3s; Kuriboh sống6s/CD14 hấp thụ280 sát thương (theo skillPower) rồi biến mất; SummonedSkull sống5s/CD18, sét110 trong120 mỗi1.5s; DarkMagicAttack220/CD10 cần DarkMagician đang tồn tại. Yugi đánh thường bằng lá bài phép, không đấm.
Triệu hồi nằm trong f.summons, mỗi loại tối đa1/chủ, uid riêng; không có HP/collision/không được tính đấu sĩ hay điều kiện thắng; chỉ Yugi là đấu sĩ. Sát thương và đạn ghi ownerUid Yugi, không đánh đồng đội. Trước step cập nhật hạn tồn tại, di chuyển, AI quái; onDeath mới xóa summons và đạn quái requiresOwnerAlive cùng tick. Khiên dùng hook absorbDamage hiện có. Mọi reset tạo summons rỗng; RNG mô phỏng giữ seeded.
prepare_yugi.py nhận4 sheet nguồn yugi/dark_magician/kuriboh/summoned_skull. Xuất144 ô nhân vật/quái (48/36/24/36)320x224 và36 VFX512x384,7 runtime atlases trong assets/characters/yugi. Tải lazy cả bộ chỉ khi chọnYugi. render/yugi-effects.js vẽ quái, VFX, portal và Kuriboh shield; app nối UI/stats/audio/pose/ghost. Quái có thể đi theo chủ ngoài sàn cũ, dùng clamp của arena.
Có tests/yugi-tests.mjs và UI mock cho asset, summon, command, shield, expiry/death, owner trùng, replay,5v5 toànYugi, reset. Chưa QA hình/âm thanh trên trình duyệt thật (lỗi phiên công cụ đã ghi trước).

- Cân bằng Yugi: mặc định HP900, dodgeChance0, blinkChance0. Config cho phép combat defaults riêng nhân vật; migrate giá trị Yugi cũ1050/12/8 đã lưu về900/0/0 khi tải, giữ chỉ số khác và hệ sốHP chung.


## Goku Blue (2026-10-19)
Thirteen characters now available. Select **Goku Blue** for a black-hair-to-Blue intro with lightning before combat, Instant Transmission Kamehameha, Blue Rush, God Bind and Kaioken x10. Source sheets: `art/sources/goku_blue.png`, `goku_blue_skills.png`, `goku_blue_transform.png`. Re-extract with `python tools/prepare_goku_blue.py` (Pillow, numpy, scipy). Runtime uses four lazy atlases. `npm test` includes character and UI coverage; direct browser/audio QA remains unverified due browser session error.


## Beerus (Birut) — 14 characters
Beerus has Hakai, Destruction Sphere, Divine Shock and Destroyer Wrath (+25% damage/-20% incoming damage for6 seconds). His2.5-second entrance plays before combat, together with Goku Blue when selected. Re-extract the three source PNGs with `python tools/prepare_beerus.py` (Pillow,numpy,scipy). New simulation/UI tests are included in `npm test`.
Keep port8766. Latest page: http://127.0.0.1:8766/index.html?v=beerus-14 — press Ctrl+F5 if the old version is cached. Current page badge reads BEERUS /14 characters.


## Ultimate đồng đội
Trong đấu đội, gây/nhận sát thương tích nộ chung, chuẩn hóa theo tổng HP đội. Đầy nộ tự chọn người dẫn và hiện cảnh giới thiệu 1 giây, tạm dừng mô phỏng. Sau đó báo vùng đánh 0,6 giây rồi hợp kích với4 họ VFX tùy người dẫn. Có thể né, không đánh đồng đội, Ultimate không tự tạo nộ. Hồi tích nộ15 giây. Hai đội đầy nộ phát lần lượt.
Tách lại sheet với `python tools/prepare_team_ultimate.py` (Pillow,numpy). `npm test` gồm cơ chế và giao diện. Mở http://127.0.0.1:8766/index.html?v=team-ultimate-1 và Ctrl+F5 nếu trang còn cũ.


## Ichigo Kurosaki — playable, 15 characters
`python tools/prepare_ichigo.py` extracts the5 saved sheets into112 full-resolution PNGs with protective margins and6 WebP atlases. Intro input accepts `ichigo_intro.png` or the saved alias `chigo_intro.png`. Use `python tools/verify_ichigo.py` to verify full source RGBA coverage, unchanged source files and clear atlas borders. Preview/contact and size/pivot metadata are in `art/frames/ichigo`; read this metadata when integrating the character, because these sword/UI frames are wider than old characters.

Ichigo is available in duel, FFA and teams: Getsuga Tensho, Shunpo, Bankai Slash and Hollow Mask. His independent rage meter activates Full-Power Getsuga Tensho at 100, with a 15-second rage lockout. An illustrated English dialogue freezes combat for 1 real second, then a directional warning precedes the dodgeable piercing crescent. Personal/team Ultimates queue and never generate rage from Ultimate damage. Ultimate titles/dialogue are English; controls remain Vietnamese.

Run Start_Game.cmd in this folder and open http://127.0.0.1:8766/index.html?v=ichigo-15, then select Ichigo Kurosaki. Ctrl+F5 if cached. The six atlases use generated `render/ichigo-meta.js` to preserve full sword/effect/UI borders. All npm tests passed; live browser/audio QA remains unverified.


Team Ultimate now uses six themed illustrated chat panels with English dialogue and the speaker portrait only and a separate launch title. Rebuild with `python tools/prepare_team_dialogue.py`; verify with `python tools/verify_team_dialogue.py`. Open http://127.0.0.1:8766/index.html?v=team-dialogue-1 (Ctrl+F5 if cached).

Use “Hợp kích đội: BẬT/TẮT” beside the Ultimate filter to disable team Ultimates. The setting is remembered and applies without restarting the match; re-enabling starts fresh rage meters. Ichigo personal Ultimate remains active. Floating battle labels are English. Latest page: http://127.0.0.1:8766/index.html?v=battle-options-1 .


## Giải đấu 8 suất
Chọn chế độ “Giải đấu · 8 suất”. Chọn đấu đơn hoặc đội1–5 đấu sĩ, điền8 suất theo các cặp1–2/3–4/5–6/7–8 hoặc bấm “Bốc thăm nhánh”, rồi “Bắt đầu giải”. Tự chạy cả giải được bật mặc định; bỏ chọn để dùng “Trận tiếp theo”. “Tạm dừng” hoạt động cả lúc giới thiệu và giữa các trận. “Về thiết lập giải” tạo lại giải từ đầu.

Loại trực tiếp:4 tứ kết,2 bán kết,1 chung kết. Một trận quyết định; hòa sẽ đấu lại cặp đó với seed lượt mới. Cho phép nhân vật trùng giữa/cùng các suất. Mỗi trận tạo mô phỏng mới, đầy HP và xóa nộ/buff. Chỉ số/HP toàn bộ/cỡ sàn/hợp kích được chốt lúc bắt đầu giải; đấu đơn chỉ có Ultimate cá nhân, đấu đội giữ tùy chọn hợp kích. Nhánh đấu, cảnh VS/WINNER/CHAMPION có cúp, thống kê wins/damage/KOs và chữ tiếng Anh phục vụ quay video. Không giới hạn thời gian, không lưu giải qua tải lại trang.

Mở http://127.0.0.1:8766/index.html?v=tournament-8-1 và Ctrl+F5 nếu trang còn cũ. npm test bao gồm mô hình giải và UI; chưa QA trực tiếp trên trình duyệt.


## Sung Jinwoo - nhân vật16
Có trong đấu đơn, FFA, đội và giải đấu. HP1100/speed225/melee72. Dagger Rush chém3 lần; Shadow Exchange đổi chỗ với Igris (không dùng được khi bị trói); Summon Igris gọi1 lính hỗ trợ8s; Monarch’s Domain tăng sát thương20% và tốc độ15% trong6s. Igris không phải đấu sĩ, biến mất khi chủ chết và không giữ lại qua trận.

Ultimate riêng ARISE tích nộ từ sát thương HP thực, dùng khung thoại riêng tiếng Anh, dừng1 giây rồi báo hướng0,6s; ba đợt binh đoàn xung phong có thể né. Hồi tích nộ15s, không tự tạo nộ từ Ultimate. Xếp hàng cùng Ultimate cá nhân Ichigo và hợp kích đội. Nút tắt hợp kích chỉ tắt đòn đội.

Tách lại5 nguồn bằng `python tools/prepare_sung_jinwoo.py`, kiểm tra bằng `python tools/verify_sung_jinwoo.py`.176 raw frames và7 atlas có đệm; metadata riêng trong render/jinwoo-meta.js. Mở http://127.0.0.1:8766/index.html?v=jinwoo-16 , Ctrl+F5 rồi chọn Sung Jinwoo. Toàn bộ npm test đã qua; chưa QA trực tiếp hình/âm thanh trên trình duyệt.

Ultimate cá nhân và hợp kích đội tự tích thêm2 nộ mỗi giây mô phỏng chiến đấu, bên cạnh nộ từ gây/nhận sát thương. Nếu không giao tranh, cần50 giây từ0 lên100. Không tích trong màn xuất hiện, cảnh thoại, tạm dừng, khi đã chết hoặc900tick hồi nộ sau khi kích hoạt. Đội lớn/nhỏ đều2 nộ/giây, không nhân theo số thành viên; tắt hợp kích vẫn tắt toàn bộ thanh nộ đội. URL mới: http://127.0.0.1:8766/index.html?v=passive-rage-1 .

Beerus dùng atlas động tác/intro giữ pixel nguồn (`beerus_native.webp`, `beerus_intro_native.webp`), thu nhỏ một lần lúc vẽ với chất lượng cao và tương phản nhẹ. Giữ kích thước/chỉ số cũ. `python tools/prepare_beerus.py` tạo cả atlas tương thích cũ và atlas native; `python tools/verify_beerus_native.py` kiểm tra90 frame nguồn và kích thước hiển thị. URL: http://127.0.0.1:8766/index.html?v=beerus-clarity-1 .


## Goku Ultra Instinct - nhân vật 17
Đã thêm vào đấu đôi, FFA, đấu đội và giải đấu. HP1200, tốc độ230, đấm80, né mặc định20%. Instinct Counter né và phản đòn một lần trong cửa sổ ngắn; Silver Rush đánh3 nhịp; Instinct Kamehameha bước ngang rồi bắn chưởng xuyên; Ultra Focus tăng tốc20% và thêm20 điểm phần trăm né trong6s. Các bước né/lao tôn trọng trạng thái trói, không cấp miễn sát thương.

Màn xuất hiện đi từ tóc đen sang tóc bạc với đá bay, aura và chớp sáng. Ultimate riêng SUPREME KAMEHAMEHA tích nộ từ sát thương và2 nộ mỗi giây giao đấu; đủ100 sẽ dùng khung thoại tiếng Anh “My body moves on its own.”, dừng1 giây rồi báo hướng, đấm mở màn và tung chưởng lớn. Có thể né; Ultimate không tự tạo nộ, hồi tích nộ15s. Dùng cùng hàng đợi với Ichigo/Jinwoo/hợp kích, có khung thoại riêng khi làm thủ lĩnh đội.

Đã tách176 frame từ5 ảnh gốc thành6 atlas WebP lossless có đệm, giữ trọn phần ảnh hiện có. Tạo lại bằng `python tools/prepare_goku_ultra.py`, kiểm tra bằng `python tools/verify_goku_ultra.py`. Metadata ở `dist/src/render/ultra-meta.js`. Toàn bộ `npm test` đã qua; đã xem ảnh frame/khung thoại, chưa QA trực tiếp hình/âm thanh trong trình duyệt.

Chạy Start_Game.cmd trong đúng thư mục dự án, mở http://127.0.0.1:8766/index.html?build=goku-ultra-17 rồi chọn Goku Ultra Instinct. Nhãn góc màn hình phải là GOKU ULTRA /17 CHARACTERS; Ctrl+F5 nếu còn trang cũ. Phiên này kiểm tra HTTP bị chặn quyền socket, không thay hoặc dừng server nào.


## Chỉnh lối đánh AI
Trong phần chỉnh chỉ số riêng của từng nhân vật có thêm5 mục (0-100%): Truy kích70%, Nối chiêu65%, Phản công60%, Liều chiến55% và Đổi mục tiêu35%. Truy kích giúp bám theo sau đòn trúng; nối chiêu ưu tiên đòn tiếp theo khi kết thúc động tác; phản công ưu tiên đáp trả sau né/đỡ; liều chiến quyết định áp sát hay rút khi HP dưới40%; đổi mục tiêu xét kẻ vừa đánh mình hoặc kẻ gần hơn trong đấu đông người. Đổi mục tiêu không chọn đồng đội. Mỗi mục lưu và khôi phục riêng theo nhân vật; dữ liệu cũ tự nhận mặc định cho mục còn thiếu.

Các tỷ lệ điều khiển lựa chọn AI, vẫn tuân thủ tầm đánh, hồi chiêu, động tác đang thi triển và trạng thái trói. Không tăng sát thương hoặc cấp miễn sát thương. Mở http://127.0.0.1:8766/index.html?build=fighting-styles-1 và Ctrl+F5 nếu còn giao diện cũ. Nhãn mới: FIGHTING STYLES /17 CHARACTERS.

Goku Ultra mặc định mới: né đòn50%, dịch chuyển né đòn25%. Ultra Focus vẫn cộng20 điểm phần trăm né trong6s. Dữ liệu lưu còn mặc định cũ20%/8% được cập nhật một lần; các giá trị tự chỉnh khác được giữ.

Cân bằng Goku Ultra mới nhất: né đòn30%, dịch chuyển né đòn25%. Khi Ultra Focus hoạt động, né đòn thành50%.


## Boa Hancock - nhân vật20
Đã thêm Boa Hancock, dùng bản động tác đã sửa chân. HP1050/tốc độ215/đòn thường65, đánh tim từ xa và đá khi áp sát. Pistol Kiss bắn tim150; Slave Arrow phóng5 mũi tên; Perfume Femur đá150 và làm chậm; Mero Mero Mellow gây100 sát thương và hóa đá0,7s. Sau khi hết hóa đá có3s miễn tái hóa đá; né hoặc đỡ về0 sát thương sẽ không bị hóa đá. Có trong mọi chế độ, chỉnh chỉ số, random đội, lọc hợp kích và giải đấu.

Ultimate EMPRESS’S JUDGMENT có khung thoại ruby–vàng riêng, dừng1 giây, báo hướng0,6s rồi phóng3 đợt tên và sóng đá kết thúc. Tổng420 sát thương trước phòng thủ, có thể né; đợt đầu có hóa đá ngắn0,3s và vẫn tuân theo miễn tái hóa đá. Sát thương Ultimate không tạo nộ. Người đang hóa đá không thể bắt đầu Ultimate; bị hóa đá trong lúc đang chuẩn bị có thể ngắt chiêu, đạn đã bay vẫn tồn tại.

Intro: cánh hoa → cổng rắn ánh sáng → Hancock bước ra → hất tóc vào thế chiến đấu. Đã tách170 frame có đệm thành6 atlas, giữ nguyên5 ảnh gốc. Tạo lại `python tools/prepare_boa_hancock.py`, kiểm tra `python tools/verify_boa_hancock.py`. Toàn bộ npm test đã qua; đã xem ảnh frame/khung thoại, chưa QA trực tiếp hình/âm thanh trên trình duyệt.

Mở http://127.0.0.1:8766/index.html?build=boa-hancock-20 , Ctrl+F5 rồi chọn Boa Hancock. Nhãn mới BOA HANCOCK /20 CHARACTERS; vẫn Start_Game.cmd hoặc npm start, cổng8766.

## Tatsumaki - nhân vật19
Tatsumaki đánh xa, HP1000/tốc độ205/đòn thường45, áp sát20%, giữ cự ly300px và phản ứng lướt85%. Đòn thường là viên niệm lực, dùng chỉ số sát thương đòn thường, không tự lao vào đấm. Có đủ chỉnh chỉ số, lối đánh, random đội, lọc hợp kích và giải đấu.

Psychic Barrage bắn3 viên đá; Gravity Crush đánh dấu vùng cố định rồi nén nổ sau1s; Psychic Repulsion đẩy kẻ áp sát và lùi ra (tôn trọng trói); Twisting Storm là lốc chậm gây nhiều nhịp sát thương, không khóa cứng. Vùng kỹ năng thường biến mất khi chủ chết. Ultimate PSYCHIC CATACLYSM dùng khung thoại riêng 'Know your place.', dừng1 giây, báo vùng0,6s rồi thiên thạch giáng xuống sau0,5s; có thể thoát vùng hoặc né/đỡ. Dùng nộ và hàng đợi chung; sát thương Ultimate không tạo nộ.

Intro: đá rung/bay trước → mở vòng niệm lực → Tatsumaki hiện lên → khoanh tay. Đã tách170 frame từ5 ảnh gốc thành6 atlas có đệm. Sheet động tác thực tế có7 hàng, lướt dùng hàng bay. Tạo lại `python tools/prepare_tatsumaki.py`, kiểm tra `python tools/verify_tatsumaki.py`. Đã kiểm tra tự động và xem ảnh frame/khung thoại; chưa QA trực tiếp trình duyệt/âm thanh.

Mở http://127.0.0.1:8766/index.html?build=tatsumaki-19 , Ctrl+F5 rồi chọn Tatsumaki. Nhãn mới TATSUMAKI /19 CHARACTERS; vẫn Start_Game.cmd hoặc npm start, cổng8766.

## Saber - nhân vật18
Saber có trong đấu đôi, FFA, đội và giải đấu; HP1150/tốc độ220/đấm78. Có Invisible Air, Mana Burst, Strike Air và Avalon (giảm45% sát thương trong4s, đẩy kẻ áp sát). Ultimate EXCALIBUR tích nộ theo quy tắc chung, có khung thoại xanh/vàng riêng, dừng1 giây rồi báo hướng0,6s và bắn chưởng vàng có thể né. Hợp kích dẫn đội dùng United Excalibur.

Màn xuất hiện: vòng phép → chỉ có kiếm → kiếm hóa thành Saber → thế thủ. Nguồn động tác thực tế có7 hàng, dash dùng hàng chạy. Đã tách170 frame có đệm thành6 atlas; tạo lại `python tools/prepare_saber.py`, kiểm tra `python tools/verify_saber.py`. Đã kiểm tra tự động và ảnh frame/khung thoại, chưa QA trực tiếp trình duyệt/âm thanh.

Mở http://127.0.0.1:8766/index.html?build=saber-18 , Ctrl+F5 rồi chọn Saber. Nhãn bản mới: SABER /18 CHARACTERS. Chạy Start_Game.cmd hoặc npm start trong đúng thư mục, vẫn cổng8766.

## Âm thanh chiến đấu
Đã nâng cấp tiếng đấm nhiều lớp, đòn nặng có âm trầm; né, dịch chuyển và đỡ có âm riêng. Vận khí tăng dần theo động tác; chưởng đang bay có âm năng lượng chạy theo vị trí trái/phải. Ultimate hạ tiếng giao đấu xung quanh, có âm tích tụ, tung chiêu và nổ kèm dư âm. Một số nhân vật có cao độ/chất âm riêng, vẫn dùng âm thanh tổng hợp sẵn trong game.

Mixer giới hạn48 nguồn âm ngắn và8 nhóm âm liên tục, giảm tiếng trùng nhau và ưu tiên Ultimate để đấu5vs5 bớt chồng tiếng. Pause/reset/tắt âm dừng các nguồn đang phát. Dùng nút âm thanh và thanh âm lượng hiện có; bấm Bắt đầu để trình duyệt mở âm thanh. URL mới: http://127.0.0.1:8766/index.html?build=combat-audio-1 , Ctrl+F5 nếu còn bản cũ. Đã kiểm tra kỹ thuật tự động; chưa nghe QA trực tiếp trong trình duyệt.


## Cân bằng chiến đấu mới nhất
- Tatsumaki: lốc xoáy kéo dài4 giây, tối đa8 nhịp sát thương.
- Saber: mặc định1.400 HP,40% đỡ đòn.
- Ultimate cá nhân và hợp kích: vận chiêu2 giây thực, dừng toàn bộ giao đấu trong đoạn này; sát thương gấp đôi. Sau đó vẫn có0,6 giây báo hướng/vùng để đối thủ né.
- Bỏ khóa hồi nộ15 giây sau khi dùng Ultimate. Nộ lại tích từ sát thương thường và2 điểm/giây khi giao đấu; sát thương Ultimate không tạo nộ.
- Dịch chuyển né mặc định hồi3 giây, khoảng cách ngẫu nhiên140–250px, vẫn giới hạn bởi mép sàn/vị trí người khác. Giá trị tự chỉnh khác được giữ; các mức mặc định cũ được cập nhật một lần.
Mở http://127.0.0.1:8766/index.html?build=combat-balance-1 và Ctrl+F5. Nhãn COMBAT BALANCE /20 CHARACTERS. Giữ nguyên cổng8766.


Tatsumaki Twisting Storm update: travel speed150px/s (1.5x), homes on its enemy and retargets a living enemy when needed. Duration4s and damage cadence unchanged. Refresh http://127.0.0.1:8766/index.html?build=tatsumaki-homing-1 .


Ichigo Shunpo now closes directly to65px from the target without the old300px travel cap. AI can use it at long range; roots still prevent movement. Damage155/cooldown9s unchanged. Refresh http://127.0.0.1:8766/index.html?build=ichigo-shunpo-1 .


Goku Ultra update: Ultra Focus adds20 personal Ultimate rage points per cast (cap100). Instinct Counter is now a20% passive counter chance without cooldown, retaining110damage and existing range/root/Ultimate restrictions. HUD shows PASSIVE20%. Refresh http://127.0.0.1:8766/index.html?build=ultra-passive-1 .


Ichigo passive: each damaging noncritical hit adds1 percentage point to critical chance; a damaging critical clears the bonus. Effective chance capped100%; base edited stat unchanged. Evaded/zero-damage hits do not count. HUD shows CRIT STACKS and TOTAL. Refresh http://127.0.0.1:8766/index.html?build=ichigo-crit-stack-1 .


Ultimate damage now ignores random dodge, automatic evasive blink and evade invulnerability. Leave the actual projectile path/impact area before it hits to escape; block and damage reduction still work. Applies to personal and team Ultimates. Refresh http://127.0.0.1:8766/index.html?build=ultimate-area-hit-1 .


Monarch Domain now gives Jinwoo20% lifesteal from actual damage dealt during its6s duration, including Igris and Ultimate while active. Healing capped at maxHP; cooldown24s and existing buffs unchanged. Refresh http://127.0.0.1:8766/index.html?build=jinwoo-lifesteal-1 .


Each living fighter now has an underfoot HP bar with an energy/rage bar below. Energy shows personal Ultimate rage, or enabled team rage for fighters without personal Ultimate; otherwise empty. Team labels appear below both bars. Refresh http://127.0.0.1:8766/index.html?build=fighter-bars-1 .


## Automatic voice generation
Open Start_Voice_Worker.cmd once per session; it runs hidden and requires no console left open. Stop_Voice_Worker.cmd stops after the active request. Agent requests are local JSON jobs; results/audio appear automatically. Default limits:200 characters/job,1000 characters/day and10 samples/day; no automatic paid retry or overwriting. Key remains DPAPI-encrypted outside web assets. First queued request refreshes available voices and tries the requested Japanese male Kamehameha sample. Voices must be available in My Voices. No game playback integration yet.

Goku Ultra personal Ultimate now plays the selected9:39 Japanese Kamehameha recording. Cinematic charge lasts5.85 real seconds to match the5.84s file, including at4x game speed; pause resumes the voice at the paused position. Existing warning and punch/beam sequence follows. Other Ultimates unchanged. Enable audio and press Start. Refresh http://127.0.0.1:8766/index.html?build=ultra-voice-1 .


Ultimate dialogue frames now sit at the bottom, keeping action visible without a full-screen dark overlay. Personal/team themes keep complete borders and portraits. Refresh http://127.0.0.1:8766/index.html?build=bottom-dialogue-1 .


Ichigo personal Ultimate now plays the approved clean Japanese Getsuga Tensho voice unchanged, with3.05s cinematic charge matching the3.04s recording. Goku Ultra Kamehameha voice/charge is now4s, time-compressed with pitch preserved. Existing warning/release sequences follow; bottom dialogue unchanged. Enable sound and refresh http://127.0.0.1:8766/index.html?build=ichigo-voice-1 .

Background music: choose Down Arena - Limit Break or Off beside sound controls, adjust music volume separately (default18%, saved automatically). Uses the120s seamless loop of the composed MP3 song. Starts with battle, pauses/resumes with match, rewinds on reset, lowers during Ultimate dialogue. Effects/voices retain their own button and volume. Refresh http://127.0.0.1:8766/index.html?build=battle-music-1 .

Jinwoo personal ARISE now plays the approved clean Japanese Okiro recording unchanged during its existing2s charge. Background music lowers while he speaks. Enable effects/voice audio and refresh http://127.0.0.1:8766/index.html?build=jinwoo-voice-1 .
Victory presentation: finishing hit briefly freezes with a flash and mild shake, then the camera approaches surviving winner(s) with character-colored aura and light particles. Large VICTORY appears over the arena; REMATCH becomes available after2.3s. Reduced effects also reduces this presentation. Refresh http://127.0.0.1:8766/index.html?build=victory-1 .

Saber now calls Excalibur in Japanese during her personal Ultimate and when leading a team Ultimate. Team Ultimates led by Goku Ultra, Sung Jinwoo or Ichigo play their existing Japanese recordings. Charge durations match voice lengths; pause/resume, effects/voice mute and music ducking apply. Refresh http://127.0.0.1:8766/index.html?build=saber-team-voices-1 .



## Vertical courtyard artwork (2026-10-21)
Integrated art/sources/vertical_arena_courtyard.png as dist/assets/arenas/vertical_arena_courtyard.webp. Portrait mode uses separate source regions for the shared spectator terrace and combat floor, preserving the black bottom quarter. Six spectators stand in two staggered rows with contact shadows and full-cell sprites anchored using generated idle alpha metadata (tools/prepare_spectator_meta.py). Horizontal modes are unchanged. Direct browser visual QA remains pending.


### Opening mode menu (2026-10-21)
Every page load opens a separate entry screen: Battle (duel/FFA/teams), Tournament, Live Arena (portrait9:16 or landscape16:9 submenu). Choosing opens the existing setup, without auto-start. The header Choose mode button stops the current battle/session and returns home. Mode dropdown options are restricted to the chosen family; hidden main/header are inert while home is open. Existing game and Live rules remain unchanged. Tests: mode-menu-tests + UI VM regression.


### Illustrated title assets (2026-10-21)
Source: art/sources/Down Arena Wordmark Sprite Sheet.png. tools/prepare_titles.py separates8 irregular alpha clusters using strong-alpha components and assigns original soft-alpha pixels to nearest wordmark, preserving every nonzero source alpha pixel. Runtime lossless WebP files + metadata in dist/assets/ui/titles,24px transparent padding. Contact-sheet QA: art/title_split_check.png. Shared render/titles.js fits full images proportionally, with text fallback during loading/failure. Applied to vertical Live headings, matching horizontal Live labels, normal Victory/Draw and opening-menu logo. No character names/countdowns restored. Title assets/victory/vertical/UI tests PASS; direct browser QA still pending.


### Tatsumaki / Boa Ultimate voices (2026-10-21)
Created two Japanese female calls through the existing ElevenLabs worker, one generation each (63 submitted characters total). Tatsumaki: Laura, psychic-catastrophe call; Boa: Lily, Mero Mero judgment call. Clean original MP3s in art/audio/elevenlabs; runtime tatsumaki_ultimate_ja.mp3 and boa_hancock_ultimate_ja.mp3 in dist/assets/audio/voices. Registered personal cataclysm/judgment and team-leader speech. Cinematics now149steps (2.483s) /135steps (2.25s), covering MP3 durations2.48/2.24s. Cached loading, pause/resume, mute/reset and music ducking use the existing speech path. No voice cloning, combat damage unchanged. Targeted audio/team timing/characters/UI and MP3 decode checks PASS. Full run log docs/ultimate-female-voice-test-results.log; direct listening QA pending.


### Combat sound pack (2026-10-21)
Created21 original synthesized PCM one-shots (7groups x3 variants) via tools/prepare_combat_sfx.py: sword swing/hit/block, punch, heavy hit, energy launch/impact. Runtime dist/assets/audio/sfx; local audition reel art/audio/combat_sfx_preview.wav. combat-samples.js caches decoded buffers on audio unlock, cycles variations, routes sword users Ichigo/Saber/Jinwoo/Sasuke, energy attacks by attacker state, heavy hits by existing threshold. Sample playback shares existing spatial buses,48-voice cap, throttling, mute/reset and Ultimate ducking; old procedural audio remains fallback during loading/failure. Files decoded/finite/endpoints/peak checks PASS; combat-samples/audio/UI tests PASS. Direct listening QA pending.

### Six-character roster
ACTIVE_CHARACTERS exports the six available fighters; app labels, all16 static character selectors, stats selection, Live gallery and random generation use only these. Saved retired picks sanitize to active defaults; old stats panels stay hidden. CHARACTERS remains the legacy definition catalog to preserve redesign resources/engine regression coverage.5vs5 selects5 distinct fighters per side, allowing cross-side duplicates when fewer than10 are available.8-slot cups fill from a seeded6-character pool, allowing repeated entrants. Current npm UI regression is tests/ui-active-roster.mjs; tests/ui-smoke.mjs is retained as historical20-character coverage and is not the current UI contract.
