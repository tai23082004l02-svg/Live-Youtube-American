# Down Arena — bàn giao 23/10/2026

## Chạy và cập nhật

- Repo: https://github.com/tai23082004l02-svg/Live-Youtube-American — phát hành từ `main`.
- Game public: https://tai23082004l02-svg.github.io/Live-Youtube-American/dist/
- JavaScript module trực tiếp, không cần build: `dist/app.js` → `dist/src/app.js`. Sửa runtime trong `dist/`.
- OBS Browser Source **1080×1920**, URL đang dùng:
  `http://127.0.0.1:8765/online/?obs=vote&chat=1`
- Công cụ chat: `tools/youtube-chat/start.bat`; điều khiển tại `http://127.0.0.1:8765/control`. Người dùng đã cài Python, OAuth và xác nhận nhận phiếu thật thành công.
- `/online/` tải game/tài nguyên từ GitHub Pages; local chỉ nối chat. Sửa game: push → chờ Pages triển khai thành công → **Refresh cache of current page** trong OBS. Không yêu cầu tải ZIP/file game sau mỗi lần sửa. Chỉ cập nhật công cụ Python mới cần thay file local.
- Đường dẫn local `/dist/` dùng bản game cũ trên máy, không dùng cho cập nhật online. Chỉ mở một game nhận phiếu; giữ công cụ chạy.
- Ngày22/10 GitHub Status xác nhận sự cố Actions, nhiều lượt Pages Queued/Waiting. Nếu bản mới chưa hiện, kiểm tra Actions trước; không kết luận lỗi OBS/cache hoặc yêu cầu thay đổi quyền phát hành khi chưa có bằng chứng. Push thành công không đồng nghĩa đã deploy; tình trạng dịch vụ hiện tại cần kiểm tra lại.

## Cấu hình đã chốt

- Live **1vs1**; HP mặc định **×5**. Migration localStorage: `down-arena-hp-x5-enabled-v1`; không nhân vào base stats.
- 12 nhân vật: Goku Ultra Instinct, Gogeta Blue, Ichigo, Sung Jinwoo, Saber, Tatsumaki, Boa Hancock, Gojo, Sukuna, Rengoku, Naruto Uzumaki (`naruto_v2`), **Madara Uchiha** (`madara`). Roster chuẩn: `ACTIVE_CHARACTERS`; legacy definitions không phải nhân vật đang mở.
- Bình chọn loại hai người đang đánh, còn **10 ứng viên**. Số1–10 cố định trong lượt, hiện1–5 rồi6–10, đổi trang mỗi **5 giây**; vẫn nhận phiếu cho trang đang ẩn.
- Mỗi channel ID một phiếu, gửi số khác để đổi. Khóa khi trận kết thúc, top2 đấu trận tiếp; không có giới hạn45 giây. `chat=1` tắt phiếu mô phỏng.
- Countdown1s; sau kết quả hiện/hô **KO**, giữ1,2s rồi sang trận mới. `LIVE_TIMINGS={intro:1,victory:1.2,waiting:0,champion:0}`. Giữ tải tài nguyên an toàn và entrance nhân vật riêng.
- Chữ KO vàng/đỏ trong suốt thay VICTORY, DRAW vẫn giữ khi hòa. Âm báo `ko_en.mp3`, bản **power2** trầm/mạnh hơn, dài0,914s; Flite RMS xử lý FFmpeg, **không phải ElevenLabs**. Giữ pause/mute và một lần hô mỗi trận.
- Toàn bộ chữ Live **Times New Roman**. HUD chung: tên/HP/nộ nằm ngoài sân, logo DOWN ARENA giữa HUD. Ultimate dùng nhân vật riêng + bong bóng thoại, giữ voice; không khôi phục banner cũ.
- Không hiện DOWN ARENA/DEMO ở hàng đầu hoặc YOUTUBE CHAT CONNECTED trong canvas. Trạng thái kết nối vẫn giữ trên trang điều khiển.
- Dưới sân: nhắc tăng chất lượng video; chữ lớn `COMMENT 1–10 IN CHAT / TO PICK THE NEXT FIGHTERS`; `ONE VOTE EACH · COMMENT AGAIN TO CHANGE`; `SUBSCRIBE TO THE CHANNEL TO CHAT & VOTE`.
- Thumbnail có sẵn: `art/promo/down-arena-live-thumbnail.jpg` (Gojo vs Goku,1280×720).

## Chat và bí mật

- Google Cloud `down-arena-live`, YouTube Data API v3 đã bật đúng dự án; OAuth Desktop/External Testing, scope `youtube.readonly`. Không thiết lập lại từ đầu.
- JSON/token chỉ ở máy người dùng; token `.secrets/youtube-chat-token.json`, không commit/log/upload. R2 và ElevenLabs keys ở GitHub Secrets, không hỏi người dùng dán vào chat.
- Bridge hiện polling theo chỉ dẫn YouTube, tối thiểu2s/mặc định5s; **chưa có streamList**. Không hứa tức thì hoặc quota đủ chạy cả ngày. Video YouTube trễ riêng với việc nhận phiếu trong OBS.
- Chỉ người đăng ký được chat phải bật trong YouTube Studio; game không tự kiểm tra subscription. Nếu người dùng mở chat cho mọi người, sửa hướng dẫn Subscribe cho phù hợp; hiện chưa đổi yêu cầu đó.
- Bridge bind127.0.0.1, kiểm tra Host/Origin; không mở quyền credentials cho website khác. Fetch phiếu dùng URL **tuyệt đối** `http://127.0.0.1:8765/api/votes` vì wrapper có `<base>` trỏ GitHub.

## File cần sửa theo chức năng

| Việc | File |
| --- | --- |
| Tích hợp, HP, âm thanh | `dist/src/app.js`, `dist/src/audio.js` |
| Lịch chuyển trận | `dist/src/live-arena.js`, `voting-arena.js`, `vertical-arena.js` |
| Bảng bình chọn, phân trang, HUD, chữ hướng dẫn | `dist/src/render/viewer-vote.js` |
| Phiếu và chọn top2 | `dist/src/engine/viewer-vote.js` |
| Chat | `dist/src/youtube-chat.js`, `tools/youtube-chat/` |
| KO / thoại | `dist/src/render/victory.js`, `titles.js`, `comic-dialogue.js` |
| Combat / nhân vật / assets | `dist/src/engine/sim.js`, `dist/src/characters/`, `dist/src/engine/assets.js`, `dist/assets/` |

Các URL import quan trọng có query phiên bản để tránh cache OBS. Khi sửa runtime liên quan, cập nhật chuỗi phiên bản ở `dist/index.html` → `dist/app.js` → `dist/src/app.js` và import module tương ứng; không chỉ thêm query vào URL trang.

## Tài nguyên và khôi phục

- Đã dọn131 file tracked (~146MiB): nguồn có R2 receipt/hash, ảnh QA và bytecode. **Runtime `dist` giữ đủ**; không xóa lịch sử Git/R2. Các cache/frame rời/bản trùng local cũng đã dọn.
- Trước khi sửa/tách sheet: `python3 tools/restore_source_art.py --source git` (cần lịch sử Git); hoặc `--source r2` với AWS CLI/credentials hợp lệ. Helper khôi phục70 file và kiểm tra hash, không ghi đè chỉnh sửa có sẵn.
- Nguồn khôi phục bị ignore để không vô tình commit lại. Đã thử khôi phục đủ70 file. Chi tiết: `docs/maintenance/CLEANUP.md`, manifest và `docs/*r2-archive.json`.
- Công cụ tạo/verify, metadata extraction, tests, workflows vẫn giữ. Archive workflows tự restore nguồn trước khi chạy. KO PNG nguồn chưa có R2 receipt vẫn được giữ.
- R2 bucket `down-arena-assets`, Secrets `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`, vars `R2_ENDPOINT`/`R2_BUCKET`. ElevenLabs secret `ELEVENLABS_API_KEY`; xem workflow tương ứng khi cần tạo voice. Đừng mặc định mọi asset đã ở CDN công khai.
- Chi tiết nhân vật khi cần: `docs/NARUTO_V2.md`, `MADARA.md`, `GOGETA_BLUE.md`, `RENGOKU.md`; đừng thay hành vi đã duyệt khi chỉ sửa giao diện.

## Kiểm tra và bàn giao tiếp

- Checks liên quan: `node tests/audio-tests.mjs`, `tests/victory-tests.mjs`, `tests/viewer-vote-tests.mjs`, `tests/youtube-chat-tests.mjs`, `tests/live-arena-tests.mjs`, `tests/vertical-arena-tests.mjs` (chạy từng file với node).
- UI: `node --experimental-vm-modules tests/ui-active-roster.mjs`; Python: `python3 tests/youtube_chat_tests.py`; trình duyệt: `python3 tools/qa_online_chat.py` (Playwright + Chromium, cổng8765).
- QA browser giả lập nguồn GitHub nhưng chạy renderer/game thật; không chứng minh Pages public đã deploy. OAuth thật được người dùng xác nhận trên Windows, môi trường dev không giữ credentials.
- Một số suite legacy thiếu file art/audio tham chiếu từ trước; không tạo file giả hoặc tắt test để che lỗi. Không nói toàn bộ test pass nếu chỉ chạy tập liên quan.
- Mọi cập nhật trên đã push `main`. Không có tính năng mới đang chờ thực hiện. Tiếp tục theo yêu cầu kế tiếp, nói tiếng Việt, không hỏi lại setup đã hoàn tất.
