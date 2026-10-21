## Correction: Kurama dodge is fixed at50%
User clarified: after charging completes, transformed Naruto uses exactly50% dodgeChance, replacing the base rate (not a multiplier or50-point addition). Normal form uses configured dodgeChance. Attack remains+20%; charging immunity remains1 second. HUD/log updated. No tests rerun, per user instruction.

## Kurama dodge bonus update (2026-10-18)
After the 1-second charge completes, transformed Naruto also has 1.5 times the configured dodgeChance, capped at100% (12% becomes18%). This is a relative50% increase, not50 percentage points. Base settings are unchanged; no stacking, no effect during charging, no change to blink/block/dash reaction. HUD/log show the bonus. The user explicitly requested no test rerun for this small change; tests were not rerun.

# Down Arena — Prototype 15: Naruto charging animation

Open http://127.0.0.1:8766/ and Ctrl+F5.

Below50% HP, Naruto now stands still and charges for **1 second**, immune to damage and collision pushing. After charging, he transforms into Kurama and gains **20% attack damage** until the match ends. The charge triggers once per Naruto per match. The1-second duration follows the selected simulation speed.

Six animation frames come from sprite_sources/naruto_transform.png. All existing modes, clone support and unlimited match duration remain.

## Older documentation (historical)

# Down Arena — Prototype 14: Naruto Kurama

Open http://127.0.0.1:8766/ and Ctrl+F5.

Naruto automatically becomes Kurama Chakra Mode when alive below50% HP. It gains20% attack damage (melee, skills and clone support) until the match ends. Exactly50% does not trigger. No healing or revival is granted; a new match starts in normal form. Each Naruto copy transforms independently.

The character appearance, temporary clones and dash ghosts use the new golden sprite sheet. All previous modes/settings and unlimited match duration remain.

Rebuild transformed assets with python tools/prepare_kurama.py. Only matches selecting Naruto load its transformed atlas.

## Previous documentation (historical)

# Down Arena — Prototype 13: Naruto

Open http://127.0.0.1:8766/ and Ctrl+F5. Start_Game_8766.cmd starts the server if needed.

Choose **Naruto** in 1v1, free-for-all or team slots. This is normal Naruto only: punches/kicks, ninja dash, Rasengan rush, Rasenshuriken explosion and two temporary shadow-clone helpers. Clone helpers attack for6 seconds, disappear when Naruto dies, do not block attacks and do not count as players. The stats menu supports all existing combat settings for Naruto.

Free-for-all now supports2–5 distinct characters; team battles remain1–5 vs1–5 with repeated characters allowed. All actors are AI-controlled. Matches have no time limit.

Source frames: art/frames/naruto and art/frames/naruto_vfx. Rebuild with python tools/prepare_naruto.py (Pillow/numpy/scipy for development only). Runtime resources load per selected character. Tests and direct browser duel verified; no standalone HTML regenerated.

## Older documentation (historical)

# Down Arena — Prototype 12

Open http://127.0.0.1:8766/ and Ctrl+F5 (Start_Game_8766.cmd if stopped).

New arena: **Thiên Đài Hoàng Hôn**, using the supplied cloud-temple background. Walking, spawns and teleport positions are fitted to its stone platform.

**No time limit in any mode.** The clock displays elapsed time. Last surviving fighter/team wins; simultaneous total elimination draws. There is no automatic HP-based decision after 60 seconds. Defensive settings such as 100% evasion can produce an unresolved match; use pause/reset when desired.

Automated tests and a real browser duel on the new arena passed. All prior character/stat/team features remain.

## Older documentation (historical)

# Down Arena — Prototype 11: Combat variety

Open http://127.0.0.1:8766/ and Ctrl+F5. Expand character settings and choose a character.

New settings: dodge chance, random defensive teleport chance and cooldown, critical chance and total critical damage multiplier, block chance and block damage reduction, general damage reduction, approach tendency, preferred fighting distance and dash reaction chance. Hover labels for explanations. Defaults are enabled; old saved settings acquire new defaults automatically. Random teleport is attempted after dodge fails and only when its separate cooldown is ready.

For a less aggressive fighter, lower approach tendency and raise preferred distance. Critical damage 175% means 1.75 times normal damage. Block 50% reduction halves damage only on a successful block. All chances use the match seed. Defense chances can be set to zero to disable them. Apply and restore affect the selected species, including its repeated team copies.

Existing 1v1, free-for-all and 1–5 versus 1–5 team modes remain available. Automated regression/new combat tests and direct browser checks performed; no standalone export generated.

## Previous documentation (historical)

# Down Arena — Prototype 10: Custom teams

Open http://127.0.0.1:8766/ and Ctrl+F5. Use Start_Game_8766.cmd if the server is stopped.

Select **PVP · Đấu đội**, set A and B independently to 1–5 fighters and choose the character in each slot. This supports 3vs1, 2vs2 and 5vs5 now, including repeated characters. Blue is A, red is B. AI controls all fighters and allies cannot damage each other. Stats remain per character, shared by all copies.

Last surviving team wins; after 60 seconds compare total remaining HP divided by total starting max HP of each team. Equal ratios draw. Existing 1v1 and free-for-all remain available.

Regression and new team tests pass. A complete 5vs5 was verified directly in the browser. No standalone HTML generated.

## Previous documentation (historical)

# Down Arena — Prototype 09

Launch Start_Game_8766.cmd and visit http://127.0.0.1:8766/ (Ctrl+F5 after changes).

- **PVP:** choose 2, 3 or 4 players, then choose a different character for each slot. All characters are still AI-controlled. 1v1 remains available.
- **Character stats:** expand settings, choose the character to edit, change values and apply. Only that character is updated. Restore also affects only the selected character.
- Four characters available: Goku, Vegeta, Broly, Piccolo. Duplicate characters and online multiplayer are not implemented.
- Automated checks and direct browser PVP/editor checks pass. No standalone export was generated.

## Previous documentation (historical)

# Down Arena — Prototype 08: Piccolo

This copy lives in `new-chat-5/down-arena`. Launch **Start_Game_8766.cmd** (or Start_Game.cmd), keep the server window open, then visit **http://127.0.0.1:8766/**. Port 8765 can continue serving the older copy independently. Confirm the page says Prototype 08.

Choose Piccolo in either 1v1 slot, or select three distinct fighters with A/B/C in FFA. Piccolo has Special Beam Cannon, Hellzone Grenade, Light Grenade, basic ki shots, melee and dash. HP/speed/damage/cooldown are editable in the existing stats menu.

Separated transparent PNG frames: `art/frames/piccolo/` and `art/frames/piccolo_vfx/`. Character contact preview: `art/frames/piccolo/contact.png`. Rebuild from the sibling sprite_sources directory using `python tools/prepare_piccolo.py` (Pillow, numpy, scipy needed for this development step only). The game itself has no new dependency.

`npm test` runs regression + Piccolo simulation and mocked UI tests. Browser visual/audio verification of this copy is still pending; the browser connection was unavailable during implementation. Source concept art includes repeated and baked-glow poses.

Local modular source is the deliverable. Do not regenerate standalone HTML or update Library unless requested.

---
Previous documentation (historical):

# Down Arena — bản dự án đầy đủ

Game tự đấu 2D với Goku, Vegeta và Broly. Người xem chọn cặp đấu, seed và tốc độ; AI tự điều khiển cả hai bên.

## Chạy trên Windows

1. Giải nén toàn bộ gói, giữ nguyên cấu trúc thư mục.
2. Máy cần Python 3. Nhấp đúp `Start_Game.cmd`.
3. Giữ cửa sổ máy chủ mở, truy cập **http://127.0.0.1:8765** bằng Chrome hoặc Edge.
4. Nhấn Ctrl+C trong cửa sổ máy chủ để dừng.

Nếu cổng 8765 đang được dùng, mở terminal tại thư mục dự án và chạy:

```powershell
python -m http.server 8766 --bind 127.0.0.1 --directory dist
```

Sau đó mở http://127.0.0.1:8766. Không mở trực tiếp `dist/index.html`, vì bản đầy đủ dùng mô-đun JavaScript cần HTTP.

Không cần cài thư viện npm, không cần API AI, và không cần Internet khi chơi sau khi giải nén. Node.js chỉ cần nếu muốn chạy bộ kiểm tra mã nguồn.

## Hai bản dùng chung mã nguồn

- **Bản xem nhanh:** `Down_Arena_Play.html` là một tệp tự chứa, khoảng 3 MB, mở trực tiếp được. Tất cả ảnh được nhúng vào HTML; tăng số nhân vật vẫn làm tệp này lớn lên.
- **Bản đầy đủ:** `dist/index.html` nhỏ, ảnh WebP nằm riêng trong `dist/assets/`. Chỉ tải ảnh cho hai nhân vật được chọn; Broly mới cần thêm atlas hiệu ứng xanh. Khi đổi cặp, game chờ tải xong mới cho bắt đầu. Trình duyệt có thể dùng bộ nhớ đệm để tải lại nhanh hơn.

Mở bản xem nhanh nếu chưa có Python. Dùng bản đầy đủ để tiếp tục phát triển nhiều nhân vật.

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `dist/index.html`, `style.css` | Giao diện và sân đấu |
| `dist/app.js` | Điều khiển màn hình, animation, hiệu ứng và camera |
| `dist/sim.js` | Mô phỏng chiến đấu, AI, seed, kỹ năng |
| `dist/assets.js` | Danh mục tài nguyên, tải theo cặp, bộ nhớ đệm và thử lại khi lỗi |
| `dist/audio.js` | Hiệu ứng âm thanh tổng hợp bằng Web Audio |
| `dist/broly-meta.js` | Vị trí frame và điểm neo VFX Broly |
| `dist/assets/*.webp` | Ảnh tối ưu dùng trong game |
| `art/atlases/*.png` | Atlas PNG gốc để chỉnh sửa, không tải khi chơi |
| `build_standalone.py` | Tạo lại bản HTML tự chứa từ mã nguồn |
| `PROJECT_HANDOFF.md` | Ghi chú cho phiên chat hoặc người phát triển tiếp theo |

Âm thanh hiện được tổng hợp bằng code, chưa dùng file WAV ngoài.

## Chỉnh sửa và kiểm tra

Chỉnh các tệp trong `dist/`, làm mới trình duyệt để xem. Ctrl+F5 khi trình duyệt vẫn giữ bản cũ.

Chạy các kiểm tra bằng Node.js:

```powershell
npm test
```

Tạo lại HTML xem nhanh:

```powershell
python build_standalone.py
```

HTML xuất ra thư mục `outputs/` cạnh thư mục dự án. Script chỉ đóng gói, không cần Pillow hoặc tải mạng.

## Giới hạn hiện tại

Sprite là tài nguyên minh họa một hướng có lật ngang; vài frame có ánh sáng sát mép. Chỉ số cân bằng đang thử nghiệm. Mô phỏng và công cụ tải đã được kiểm tra tự động; kiểm tra UI hiện dùng canvas giả lập, chưa thay thế việc nhìn và nghe trực tiếp trong trình duyệt. Chưa có nhiều hiệp, tua timeline, multiplayer hoặc xuất video trực tiếp.

## Chỉ số và đấu tự do (bản 07)
Mở «Điều chỉnh chỉ số nhân vật» để chỉnh HP, tốc độ, sát thương đấm, sức mạnh kỹ năng (%) và thời gian hồi chiêu (%). Bấm Áp dụng để lưu trên trình duyệt và đặt lại trận. Hồi chiêu 50% nghĩa là còn nửa thời gian hồi; thời gian chuẩn bị và hồi động tác không đổi. Nút khôi phục mặc định đặt lại cả ba nhân vật.

Chế độ «Đấu tự do · 3 người» đưa cả Goku, Vegeta, Broly vào sân, mỗi người tự chọn đối thủ gần còn sống. Ai sống cuối thắng, hết 60 giây so phần trăm HP; bằng nhau thì hòa. Xác chết không cản đường hoặc nhận thêm sát thương. Sóng nổ đánh được nhiều đối thủ, đạn trúng người đầu tiên trên đường bay. Chế độ hiện tại chưa có đội 2v2 hoặc nhiều bản sao của cùng nhân vật.
