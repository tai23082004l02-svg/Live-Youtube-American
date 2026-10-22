# Bàn giao Down Arena — trạng thái ngày 22/10/2026

Đọc file này trước khi tiếp tục. **Đã dọn nguồn/ảnh QA khỏi main: [hướng dẫn khôi phục](maintenance/CLEANUP.md).** Đây là trạng thái hiện hành; các ghi chú cũ trong `PROJECT_HANDOFF.md`, README và tài liệu nhân vật có thể mô tả những mốc roster 9/10/11, bảng 6 lựa chọn hoặc chưa kết nối chat. Không khôi phục các trạng thái cũ đó.

## Dự án và triển khai

- Repository: https://github.com/tai23082004l02-svg/Live-Youtube-American
- Nhánh phát hành: `main`. Trong môi trường vừa bàn giao, checkout làm việc tên `work`, đẩy bằng `git push origin HEAD:main`. Kiểm tra lại branch/remote trong môi trường mới trước khi thao tác.
- Game public: https://tai23082004l02-svg.github.io/Live-Youtube-American/dist/
- Game là JavaScript module chạy trực tiếp, không cần build. `dist/app.js` import `dist/src/app.js`; `dist/` là mã nguồn runtime cần sửa và phát hành.
- GitHub Pages cần hoàn tất triển khai sau mỗi push. Không kết luận public đã cập nhật chỉ vì push thành công.
- Người dùng đã cài OBS, được quyền live YouTube, đã cài Python và chạy công cụ chat trên Windows. Người dùng đã xác nhận nhận phiếu thật thành công. Không yêu cầu thiết lập Google Cloud lại từ đầu.

## Cách người dùng đang chạy Live

OBS Browser Source, Width **1080**, Height **1920**:

```text
http://127.0.0.1:8765/online/?obs=vote&chat=1
```

- `tools/youtube-chat/start.bat` chạy công cụ local. Trang điều khiển: `http://127.0.0.1:8765/control`.
- `/online/` tải HTML mới từ GitHub Pages, chèn `<base href="https://tai23082004l02-svg.github.io/Live-Youtube-American/dist/">`. Mã, CSS, ảnh và âm thanh đều tải từ GitHub, không phải bản game cũ trên máy.
- Chat JS gọi **URL tuyệt đối** `http://127.0.0.1:8765/api/votes`; không đổi thành `/api/votes` tương đối, vì `<base>` có thể khiến fetch chạy sang GitHub.
- Sửa game/thêm nhân vật: push GitHub, đợi Pages xong, người dùng chỉ cần **Properties → Refresh cache of current page** trong OBS. Không bảo người dùng tải ZIP/thay từng file game nữa.
- Chỉ sửa chính công cụ Python/launcher mới cần cập nhật công cụ trên máy. Chưa có cơ chế tự cập nhật công cụ.
- `/dist/?obs=vote&chat=1` trên local vẫn dùng bản `dist` đã tải về, là đường dẫn cũ. Không dùng nó khi muốn cập nhật game online.
- Trang GitHub `?obs=vote&chat=1` có hỗ trợ CORS đến bridge, nhưng Chrome có thể hỏi Local network access; OBS có thể không hiện hộp cấp quyền. Ưu tiên wrapper `/online/`.
- Giữ `start.bat` chạy; chỉ một bản game nhận phiếu. Đóng tab game thử khi dùng OBS. Trang control có thể giữ mở.
- Người dùng từng bị mờ vì OBS Output 360×640, đã sửa lên 1080×1920. Không hạ xuống 360. Khung game được vẽ vào canvas Full HD, logical 540×960.
- Phiếu trong OBS cập nhật nhanh nhưng video YouTube trên điện thoại có trễ riêng. Hướng dẫn Ultra low latency trong YouTube Studio, Stream Delay OBS tắt, điện thoại xem sát LIVE. Không nhầm trễ video với trễ đọc chat.

## Bình chọn hiện hành

- Live bình chọn **1vs1**. Đã thử 2vs2 rồi người dùng yêu cầu quay về 1vs1. Hỗ trợ engine 2vs2 còn trong mã nhưng không phải mặc định Live.
- Tổng **12 nhân vật**, hai người đang đánh bị loại khỏi ứng viên. Còn **10 lựa chọn**, đánh số ổn định **1–10** trong lượt.
- Hiện năm dòng mỗi trang: 1–5, sau **5 giây** chuyển 6–10, sau 5 giây quay lại. `votePageAge` độc lập với countdown intro; pause dừng đổi trang.
- Vẫn nhận bình luận cho trang đang ẩn. Chỉ chuyển trang hiển thị, không đổi ID/số, không xóa phiếu.
- Mỗi YouTube channel ID một phiếu; bình luận số khác để đổi. Không nhận nội dung kiểu “1 hello”; số ngoài danh sách bị loại.
- **Không có thời hạn 45 giây.** Chốt phiếu khi trận kết thúc; hai người nhiều phiếu nhất đấu trận sau. Hòa phiếu dùng seed; trận hòa có xử lý rematch/reopen.
- `chat=1` tắt mô phỏng và nút gửi phiếu thử. Mở mode bình chọn không có `chat=1` vẫn là demo.
- Mã lựa chọn không hardcode giới hạn 6; parser nhận số nhiều chữ số. Hiện UI/controller chọn limit 10.

## YouTube OAuth và bridge

- Google Cloud project người dùng: **Down Arena Live**, project ID `down-arena-live`.
- **YouTube Data API v3 đã bật đúng project.** Lần đầu bị HTTP403 vì API chỉ bật nhầm ở My First Project; bật ở Down Arena Live đã giải quyết.
- OAuth External / Testing, Desktop app, tên client **Down Arena Chat**. Người dùng đã thêm tài khoản quản lý kênh vào Test users và scope `https://www.googleapis.com/auth/youtube.readonly`.
- Người dùng chọn JSON trên trang control, nhập link xem buổi live, đăng nhập Google/chọn kênh. Không dùng link Studio hay stream key.
- Công cụ **chỉ đọc**, không đăng bình luận hoặc thay đổi kênh. Hạn chế chỉ người đăng ký được chat phải bật trong **YouTube Studio**, không phải kiểm tra subscription API trong game.
- JSON do người dùng giữ trên máy. Token lưu `.secrets/youtube-chat-token.json`. Không đưa JSON/token/email cá nhân/stream key lên GitHub, log hoặc R2.
- File chính: `tools/youtube-chat/bridge.py`, `control.html`, `start.bat`, `requirements.txt`; JS nhận phiếu: `dist/src/youtube-chat.js`.
- OAuth mở loopback callback trên cổng ngẫu nhiên, token có refresh, tái cấp quyền khi hết hạn. Testing có thể yêu cầu đăng nhập lại sau khoảng 7 ngày.
- Polling thực tế hiện tại: `liveChat/messages`, chờ `max(2 giây, pollingIntervalMillis YouTube trả về)`, mặc định 5 giây khi thiếu chỉ dẫn. **Chưa triển khai streamList/nhận chat liên tục**. Không hứa trễ 0. Không poll nhanh hơn chỉ dẫn API.
- Chat lịch sử lần kết nối đầu bị bỏ qua. Dedup message ID; kiểm tra round, publishedAt, trạng thái pause/open và heartbeat để tránh phiếu cũ sang lượt mới. Queue có giới hạn.
- Chưa có bảo đảm live cả ngày với quota mặc định. API quota hết thì dừng nhận, không tự sinh phiếu; đọc nhanh hơn tiêu hao quota nhiều hơn.
- Server chỉ bind `127.0.0.1:8765`, kiểm tra Host/Origin. Chỉ `/api/votes` cho phép origin GitHub đã định; `/api/connect` chỉ cho trang control local. Không mở CORS `*` cho credentials. Static local chỉ trong `dist`.
- Trạng thái kết nối vẫn có trên **control/operator panel**. Người dùng yêu cầu bỏ dòng đó khỏi **khung live dành cho khán giả**; không xóa chẩn đoán control.

## Bố cục và chữ đã chốt

- Bảng bình chọn ở trên, HUD ngoài sân, sân ngang 16:9 ở giữa, phần dưới dùng hướng dẫn, còn lại nền đen. Không đưa HP/tên trở lại bên trong sân.
- HUD chung cho mọi nhân vật: tên, HP, thanh năng lượng/nộ thực dưới HP; logo DOWN ARENA trong suốt ở giữa thay VS.
- Logo là ảnh `dist/assets/brand/down-arena-logo.png`; chữ trong ảnh không thay font bằng CSS.
- Đã bỏ chữ DOWN ARENA và DEMO · YOUTUBE CHAT NOT CONNECTED ở hàng trên cùng; bỏ VIEWER CHOICE DEMO và AI BATTLE.
- **Times New Roman** cho toàn bộ chữ live: tiêu đề, bảng tên, HP/nộ, hướng dẫn, thông tin trang; speech bubble cũng Times New Roman. Tránh đưa Segoe UI trở lại.
- Dưới sân có: “For the best experience, set video quality to the highest available.”
- Chữ lớn màu vàng dưới đó, số tự lấy theo danh sách:
  - `COMMENT 1–10 IN CHAT`
  - `TO PICK THE NEXT FIGHTERS`
  - `ONE VOTE EACH · COMMENT AGAIN TO CHANGE`
  - `SUBSCRIBE TO THE CHANNEL TO CHAT & VOTE`
- Không hiện YOUTUBE CHAT CONNECTED trong canvas live.
- Ultimate dùng nhân vật riêng + bong bóng thoại trắng viền đen kiểu truyện tranh, **giữ giọng nói**; không khôi phục banner lớn cũ.
- Countdown trận mới **1 giây**; hoạt cảnh xuất hiện nhân vật 2,5 giây và thời gian thoại riêng không bị rút về 1 giây.
- HP mặc định **×5**, có migration localStorage `down-arena-hp-x5-enabled-v1` chuyển giá trị đã lưu sang5 một lần; không nhân thêm vào base stats.

## Roster hiện tại — 12 người

| ID | Tên hiển thị |
| --- | --- |
| `goku_ultra` | Goku Ultra Instinct |
| `gogeta_blue` | Gogeta Blue |
| `ichigo` | Ichigo Kurosaki |
| `sung_jinwoo` | Sung Jinwoo |
| `saber` | Saber |
| `tatsumaki` | Tatsumaki |
| `boa_hancock` | Boa Hancock |
| `gojo` | Gojo |
| `sukuna` | Ryomen Sukuna |
| `rengoku` | Kyojuro Rengoku |
| `naruto_v2` | Naruto Uzumaki |
| `madara` | **Madara Uchiha** |

`characters/index.js` giữ legacy definitions để không phá dữ liệu cũ, nhưng selector dùng ACTIVE_CHARACTERS. Không đưa legacy Gogeta/Goku thường trở lại roster nếu chưa được yêu cầu.

Chi tiết các nhân vật mới nằm trong `docs/GOGETA_BLUE.md`, `MADARA.md`, `NARUTO_V2.md`, `RENGOKU.md`. Naruto: Rasengan Rush teleport + stun 0,5s, phân thân 8s, retreat rồi Baryon dưới50%HP, hồi nộ +30%. Madara giữ tầm300–450, retreat gần200, mở màn đen rồi bóng bay lên. Rengoku voice Ultimate ngắn1,44s. Giữ hành vi đã duyệt khi sửa giao diện.

## Các file cần biết

| Mục | File/thư mục |
| --- | --- |
| App và tích hợp | `dist/src/app.js`, `dist/index.html`, `dist/style.css` |
| Quy tắc đấu và nhân vật | `dist/src/engine/sim.js`, `dist/src/characters/` |
| Controller Live bình chọn | `dist/src/voting-arena.js` |
| Ballot, top hai, match config | `dist/src/engine/viewer-vote.js` |
| Bảng, phân trang, HUD và hướng dẫn | `dist/src/render/viewer-vote.js` |
| Bridge JS, không chứa token | `dist/src/youtube-chat.js` |
| Full HD / auto-start | `dist/src/obs-output.js` |
| Thoại truyện tranh | `dist/src/render/comic-dialogue.js` |
| Tài nguyên runtime và manifest | `dist/assets/`, `dist/src/engine/assets.js` |
| Sprite nguồn / tách / verify | `art/drafts/`, `tools/prepare_*.py`, `tools/verify_*.py` |
| Hướng dẫn người dùng | `docs/YOUTUBE_CHAT.md`, `docs/OBS.md` |

## R2, ElevenLabs và bảo toàn tài nguyên

- GitHub Actions có check R2, thử upload PNG, archive nguồn/runtime revisioned và tạo voice ElevenLabs.
- R2 bucket `down-arena-assets`; endpoint đã cấu hình ở repository variables `R2_ENDPOINT`, `R2_BUCKET`. Secrets: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
- ElevenLabs secret `ELEVENLABS_API_KEY`; các workflow `*-voice.yml` đã có. Không yêu cầu người dùng dán key vào chat. Tên voices/settings cần xem workflow thực tế trước khi gọi.
- R2 đã được người dùng xác nhận upload/download ảnh thành công. Receipt brand/Gogeta/Madara và các archive khác trong `docs/*r2-archive.json`; chỉ khẳng định file cụ thể đã backup khi receipt/hash xác nhận.
- R2 là nơi archive; không mặc định mọi tài nguyên đã chuyển sang public CDN. `dist/assets` vẫn cần cho game online.
- Không xóa nguồn, runtime, voice hoặc thư mục lớn để “dọn” khi chưa kiểm tra phụ thuộc và bản sao khôi phục. `art/sources/rengoku` gồm năm bản trùng đã đối chiếu hash với R2 và dọn trong đợt cleanup; xem manifest. Nguồn đã archive trong `art/drafts`/contact sheets được khôi phục theo nhu cầu qua `tools/restore_source_art.py`. PNG nguồn KO chưa archive vẫn được giữ.
- Native frame extraction có padding/metadata; tham khảo Gojo v2 tại `dist/assets/characters/gojo_v2`. Tránh cắt sheet theo grid tùy tiện, giữ kích thước và ownership frame chuẩn. Logo/draft nguồn đã có trong `art/drafts/down-arena-brand`.

## Kiểm tra trước khi đẩy

Các lệnh thực tế đã qua ở phiên này:

```bash
node tests/viewer-vote-tests.mjs
node tests/youtube-chat-tests.mjs
node --experimental-vm-modules tests/ui-active-roster.mjs
python3 tests/youtube_chat_tests.py
python3 tools/qa_online_chat.py
git diff --check
```

`qa_online_chat.py` cần Python Playwright và Chromium; bind cổng8765. Nó giả lập **nguồn GitHub Pages** bằng file local, nhưng chạy game thật trong Chromium, kiểm tra tải remote assets, ballot10, giao phiếu, CORS và cô lập credentials. Không phải bằng chứng đã đăng nhập OAuth trong môi trường dev hay public Pages deploy xong. Test browser mới nhất không có page errors. Người dùng riêng đã xác nhận OAuth + chat thật thành công trên Windows.

Các test 2vs2 còn tồn tại để bảo vệ engine hỗ trợ nhiều người; pass chúng không có nghĩa Live đang 2vs2. Một số suite legacy từng ENOENT do thiếu file tham chiếu art/audio cũ (tám suite được ghi ở `docs/gogeta-blue-tests.json`). Đừng tạo file giả hoặc tắt test để che lỗi; không khẳng định toàn bộ suite vừa chạy nếu chỉ chạy tập liên quan.

## Cách làm việc với người dùng

- Trao đổi tiếng Việt, thực hiện công việc và push thay vì chỉ đề xuất khi đã được yêu cầu.
- Người dùng không muốn tải ZIP hoặc thay file sau mỗi lần sửa game. Với game online chỉ hướng dẫn refresh OBS; phân biệt cập nhật helper Python thực sự cần file local.
- Giữ lời hứa đúng khả năng: không nói đã deploy/đã test OAuth/streamList nếu mới kiểm tra giả lập hoặc chỉ push code.
- Hiện không có yêu cầu chức năng mới nào đang chờ ngoài việc bàn giao này. Khi nhận yêu cầu mới, đọc trạng thái hiện tại trước, không triển khai lại setup đã xong.

## Bổ sung phát hành sau bàn giao

HP hiện ×5, migration key `down-arena-hp-x5-enabled-v1`. Vì người dùng vẫn thấy ×10 và mất dòng Subscribe trên OBS, các URL trong chuỗi `dist/index.html` → `dist/app.js` → `dist/src/app.js` → `dist/src/voting-arena.js` → renderer được thêm query phiên bản trực tiếp (không dựa vào import map). Khi sửa critical runtime cần giữ cơ chế bust cache này và kiểm tra entry mới. Kiểm tra browser đã xác nhận ×5 và dòng Subscribe có Times New Roman; public Pages chưa được xác minh từ môi trường dev do truy cập mạng bị chặn.

## Màn kết thúc KO

Thay chữ VICTORY ở màn kết thúc bằng ảnh KO vàng kim/đỏ cam nền trong suốt: `dist/assets/ui/titles/ko.webp`, nguồn PNG `art/drafts/down-arena-brand/ko-title.png`. `render/titles.js` thêm key KO, `render/victory.js` dùng KO cho thắng và giữ DRAW khi hòa. Tên người thắng bên dưới dùng Times New Roman. Không đổi thời gian freeze/reveal/chuyển trận hoặc âm thanh. Kiểm tra `tests/victory-tests.mjs`, `tests/title-assets-tests.mjs` và `tools/qa_online_chat.py` (draw ảnh KO thực tế). Bản mới đã push không đồng nghĩa Pages triển khai xong: người dùng đang thấy nhiều lượt Pages Queued; phải chờ dấu xanh trước khi refresh OBS.

## Dọn repository

131 file tracked (~146MiB) được gỡ: nguồn có R2 receipt/hash, ảnh QA tái tạo được, bytecode. Runtime `dist` giữ nguyên. Trước khi sửa/tách lại sheet, chạy `python3 tools/restore_source_art.py --source git`; helper khôi phục70 nguồn từ lịch sử và kiểm tra hash. Xem `docs/maintenance/CLEANUP.md` và manifest để biết đường dẫn/R2 keys. Không chạy prepare/verify nguồn khi chưa restore; các test gameplay không cần restore. GitHub Actions đang có sự cố theo GitHub Status người dùng đã gửi; không tiếp tục đoán lỗi OBS/cache khi deploy vẫn chờ.

## KO audio và chuyển trận nhanh

Âm báo kết thúc dùng `ko_en.mp3` (Flite RMS, khoảng0,862s, không phải ElevenLabs), bỏ route phát `victory_en.mp3`. Màn/tiếng KO bắt đầu sau0,12s. LIVE_TIMINGS hiện `{intro:1,victory:1.2,waiting:0,champion:0}`; sau1,2s chuyển sang trận mới, không còn hai khoảng nghỉ5s. Giữ load guard, intro1s và entrance nhân vật riêng. Không để test scheduler hardcode4,9/5s. Xem `docs/maintenance/KO_AUDIO.md`.
