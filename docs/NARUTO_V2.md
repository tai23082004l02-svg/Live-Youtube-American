# Naruto Uzumaki — Kurama's Last Flame

Chọn **Đấu thường → Naruto Uzumaki (KCM → Baryon)**. Nhân vật cũng tham gia đấu đội, giải đấu và Live bình chọn. Nếu trang còn bản cũ, tải lại sau khi GitHub Pages triển khai xong; dấu phiên bản là **BARYON RETREAT / TELEPORT**.

## Hình và hoạt ảnh

8 sheet gốc trong [art/drafts/naruto-v2](../art/drafts/naruto-v2) gồm:32 frame hành động KCM,32 Baryon,16 kỹ năng KCM,16 kỹ năng Baryon,16 xuất hiện,12 biến hình,16 Ultimate và4 khung hội thoại. Tổng144 frame. Tạo hình dựa trên concept ba dạng và phong cách chibi của Gojo v2; sprite được căn chân và vẽ nguyên ô bằng metadata, không dùng kích thước320×224 của Naruto cũ.

13 atlas WebP chạy game nằm ở `dist/assets/characters/naruto_v2/`. Sheet gốc không bị cắt sửa. Bộ tách dùng đường phân cách theo alpha, lưu frame RGBA gốc, rồi đóng atlas có khoảng đệm32px. File kiểm tra độc lập dựng lại mọi pixel có alpha dương đúng một lần. Điều này kiểm tra việc bảo toàn dữ liệu; chất lượng chuyển động còn cần đánh giá bằng mắt.

Tái tạo:

```bash
python tools/prepare_naruto_v2.py
python tools/verify_naruto_v2.py
python tools/prepare_spectator_meta.py
```

Cần Pillow, numpy, scipy. Các frame PNG rời được bỏ qua bởi Git; contact sheet và `extraction_report.json` được giữ để xem nhanh. R2 lưu bản theo commit qua workflow **Archive Naruto v2 assets to R2**, tải ngược và so sánh byte trước khi ghi biên nhận `docs/naruto-v2-r2-archive.json`. Game vẫn tải atlas/MP3 từ GitHub Pages; bản sao R2 là kho lưu trữ riêng, chưa phải CDN công khai.

## Hai dạng chiến đấu

HP1400, tốc độ210, cận chiến75 theo mặc định, chỉnh được trong bảng chỉ số.

| Giai đoạn | Hành vi |
|---|---|
| Xuất hiện2.5 giây | Hiền Nhân chuyển sang KCM2 |
| KCM2 | Rasengan Rush dịch chuyển tức thời tới cách mục tiêu65px rồi đánh175 sát thương và gây choáng0.5 giây, hai phân thân35 sát thương/đòn tồn tại8 giây, Rasenshuriken210 và sát thương lan85 |
| HP dưới50% | Dịch chuyển ra vùng trống cách xa các đấu sĩ rồi bật hoạt cảnh Baryon2.4 giây; toàn trận tạm dừng, không hồi máu và không cộng chỉ số lặp |
| Baryon | Tốc độ và cận chiến ×1.15, tích nộ cá nhân ×1.30; Crimson Rush3 đòn45/55/95, Tail Counter đỡ một đòn từ phía trước và phản85 khi trong tầm, Baryon Rasengan250/lan65 |

Rasengan Rush được AI dùng khi mục tiêu trong650px. Root ngăn dịch chuyển; vị trí đến luôn được giữ trong sàn. Sprite biến mất0.1 giây lúc dịch chuyển, có khói ở điểm đi/đến và nhãn TELEPORT. Đối thủ vẫn có thể né đòn trong thời gian ra chiêu0.3 giây. Đòn gây sát thương thành công làm choáng30 tick (0.5 giây): ngắt động tác, giữ vị trí, không di chuyển/ra đòn/dịch chuyển né/kích hoạt Ultimate. Đòn bị né hoặc sát thương bằng0 không gây choáng.

Baryon tăng30% mọi nguồn nộ cá nhân: nộ tự hồi từ2 lên2.6 điểm/giây, cùng nộ khi gây và nhận sát thương thường. Nộ vẫn tối đa100, ngừng trong hoạt cảnh và thời gian khóa; Ultimate không sinh nộ.

Tail Counter không chặn Ultimate. Phân thân không đỡ đạn, không tính là đấu sĩ, không đánh đồng đội và được dọn khi Naruto biến hình hoặc bị hạ. Các kỹ năng vẫn chịu hệ số công/phòng thủ và chí mạng của engine.

Ultimate KCM **Kurama Rasengan** cảnh báo vị trí rồi đánh vùng; Baryon **Final Impact** cảnh báo hướng rồi lướt theo đường, mỗi đối thủ chỉ trúng một lần. Cả hai có sát thương cơ sở420 × hệ số Ultimate2 trước các hệ số phòng thủ; có thể tránh vùng/đường cảnh báo. Root ngăn lướt. Đấu đội dùng hệ thống hợp kích chung, chọn màu, sprite, lời thoại và thời lượng theo dạng của người dẫn.

## Giọng nói

3 MP3 tiếng Nhật dùng giọng Charlie có sẵn trong tài khoản ElevenLabs, model `eleven_v3`; không mô phỏng giọng diễn viên gốc.

| Câu | Thời lượng đo | Tick hoạt cảnh |
|---|---:|---:|
| KCM: 九喇嘛！大玉螺旋丸！ |2.88s|173|
| Baryon: これで終わりだ！ |1.68s|101|
| Biến hình: これが、バリオンモードだ！ |2.40s|144|

MP3, thông tin sinh và thời lượng nằm ở `dist/assets/audio/voices/naruto_v2_*`. Nhạc/âm chiến đấu giảm khi thoại; tạm dừng, tiếp tục, tắt tiếng và reset giữ quy tắc chung. Workflow sinh giọng chỉ chạy thủ công, bỏ qua file đã có và không tự thử lại yêu cầu trả phí.

## Kiểm tra

- `node tests/naruto-v2-tests.mjs`: frame/atlas, thời lượng, ngưỡng50%, đóng băng mô phỏng, không hồi máu/cộng buff lặp, hàng đợi biến hình,6 kỹ năng, phân thân, phản đòn, hai Ultimate cá nhân/đội, né vùng, root, seeded replay, portrait5v5 và giới hạn renderer.
- Chromium thật: tải tài nguyên không lỗi, chọn và chỉnh chỉ số, Hiền Nhân/KCM/Baryon, cả hai Ultimate, thoại đã decode/phát theo lịch, tạm dừng/tiếp tục, thời gian hoạt cảnh ở tốc độ4×, đạn, phân thân và Live bình chọn. [Kết quả](naruto-v2-qa/results.json), [KCM](naruto-v2-qa/kcm.png), [Baryon](naruto-v2-qa/baryon.png).
-44/52 suite qua khi chạy riêng.8 suite cũ dừng vì thiếu file tham chiếu trong `art/`, không bị vô hiệu hóa hoặc giả lập để qua. [Danh sách](naruto-v2-tests.json).
- Chưa đánh giá giọng bằng tai hoặc kiểm tra trực tiếp trên điện thoại thật. GitHub Pages công khai không truy cập được từ môi trường kiểm tra này.

Kiểm tra cập nhật: `python tools/qa_rasengan_stun.py` (máy chủ dist tại cổng8767), [biên nhận trình duyệt](naruto-v2-qa/rasengan-stun.json).

Trước khi bật Baryon, Naruto chọn điểm trống trong sàn để tránh che cụm giao tranh; xét cả đồng đội lẫn đối thủ, giữ nguyên HP và chỉ dịch chuyển một lần. Nếu đang bị trói chân, đợi hết trói mới dịch chuyển/biến hình. Điểm chọn xác định theo vị trí, không dùng RNG, hỗ trợ sàn ngang/dọc và tỉ lệ1–4. [Ảnh kiểm tra](naruto-v2-qa/baryon-retreat.png) · [Biên nhận Chromium](naruto-v2-qa/baryon-retreat.json).

Đạn Baryon Rasengan hiển thị lớn gấp1.75 lần (scale0.56 thay vì0.32); điều chỉnh này chỉ ảnh hưởng hình ảnh.
