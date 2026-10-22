# Madara Lục Đạo

[Mở game](https://tai23082004l02-svg.github.io/Live-Youtube-American/dist/), chọn **Đấu thường → Madara Lục Đạo**. Cũng có trong đấu đội, FFA, giải đấu, Live ngang/dọc và Live bình chọn. Sau khi GitHub Pages cập nhật, dấu phiên bản là **MADARA SIX PATHS / 11 CHARACTERS**.

## Tạo hình và hoạt ảnh

Tóc trắng dài, áo choàng Lục Đạo trắng với magatama đen, Rinnegan tím, tích trượng đen và Cầu Đạo Ngọc. Giữ góc nhìn hơi từ trên xuống và tỉ lệ chibi như Gojo v2. [Sheet gốc](../art/drafts/madara-six-paths) và [contact sheet](../art/frames/madara).

6 sheet mới gồm32 frame hành động,12 niệm chiêu,8 xuất hiện,16 VFX,12 Ultimate và4 khung hội thoại, tổng84 frame.8 atlas WebP tại `dist/assets/characters/madara/`, vẽ nguyên ô theo `render/madara-meta.js`; đệm32px giúp tránh lộ frame bên cạnh.

```bash
python tools/prepare_madara.py
python tools/verify_madara.py
python tools/prepare_spectator_meta.py
```

Cần Pillow, numpy, scipy. Bộ kiểm tra độc lập dựng lại mọi pixel RGBA có alpha dương đúng một lần từ frame gốc, kiểm tra kích thước atlas và khoảng đệm. Frame PNG rời bỏ qua bởi Git, tái tạo được; sheet gốc, contact và báo cáo được giữ.

## Chiêu thức

HP1350, tốc độ205, ưu tiên giữ khoảng cách290px. Có thể chỉnh chỉ số trong bảng nhân vật.

| Chiêu | Cách hoạt động |
|---|---|
| Đánh thường | Phóng Cầu Đạo Ngọc nhỏ,62 sát thương, hồi cơ sở1,8s |
| Cầu Đạo Ngọc |3 quả đạn lớn liên tiếp,85/quả, sát thương lan30 trong70px; hồi8s |
| Lam Độn – Quang Nha | Tia tím lõi trắng xuyên nhiều đối thủ,220/mục tiêu, mỗi mục tiêu chỉ trúng một lần; hồi10s |
| Luân Mộ | Một bóng Madara bán trong suốt tự áp sát, đánh65 mỗi0,9s, tồn tại5s; hồi15s |
| Thiên Ngại Chấn Tinh | Hô ngắn, cảnh báo vị trí0,6s, thiên thạch rơi0,7s rồi đánh vùng bán kính200px; sát thương420× hệ số Ultimate2 trước các hệ số phòng thủ |

Đạn, tia sáng, bóng và vụ nổ không gây sát thương đồng đội. Bóng không phải đấu sĩ, không chắn đạn, không tính người sống và được dọn khi hết hạn hoặc Madara bị hạ. Đạn thường của Madara cần chủ còn sống. Thiên thạch đã phóng tiếp tục rơi; trước lúc phóng, choáng/hóa đá/hạ người niệm sẽ hủy chiêu. Đối thủ có thể rời vòng cảnh báo.

**Nội tại:** HP dưới40% kích hoạt vĩnh viễn tốc độ hồi kỹ năng ×1,2 một lần; không cộng lặp khi hồi máu. Đây là tăng tốc hồi, tương đương thời gian hồi khoảng83,3% mức thường. Không hồi HP.

**Hợp kích đội:** dùng quy tắc chung của game (vùng160px, ba nhịp sát thương), với thiên thạch, portrait, khung thoại và giọng Madara riêng.

## Xuất hiện và hiệu ứng

Màn xuất hiện2,5s: bóng tối và đá bay → Madara hạ xuống → Cầu Đạo Ngọc hiện sau lưng → mở mắt/chạm trượng, vào tư thế. Hiệu ứng kỹ năng tách khỏi nhân vật: cầu đen lớn gần bằng người, Quang Nha dày kéo dài từ miệng theo hướng bắn, bóng Luân Mộ lớn hơn thân chính, thiên thạch và sóng va chạm rộng. Chế độ giảm VFX hạn chế bóng sáng/rung mạnh.

## Giọng nói và thời gian

Câu **天碍震星！**, giọng Daniel có sẵn trên ElevenLabs, model `eleven_v3`. File gốc2s giữ tại `art/drafts/madara-six-paths/madara_ultimate_ja_original.mp3`. Bản chạy game xử lý `atempo=1.4`, giữ cao độ, thời lượng PCM giải mã1,418322s; hoạt cảnh86 tick (làm tròn lên). Thời lượng container MP3 là1,462857s vì đệm mã hóa; đồng bộ dùng âm thanh đã giải mã.

Nộ, đạn, cooldown và đồng hồ trận không chạy trong hoạt cảnh. Thoại hỗ trợ pause/resume/mute/reset và giảm nhạc nền. Workflow sinh giọng hiện chỉ chạy thủ công, bỏ qua file đã có, không tự thử lại yêu cầu trả phí. Không nhân bản giọng diễn viên.

## Kiểm tra và lưu trữ

- `node tests/madara-tests.mjs`: atlas/84 frame, giọng ngắn, bốn loại hành động, ba cầu, tia xuyên, tuổi thọ bóng và chết, an toàn đồng đội, nội tại, cảnh báo/rơi/nổ, né vùng, ngắt niệm, hợp kích, seeded replay,5v5 sàn ngang/dọc tỉ lệ1–4 và giới hạn renderer.
- [Chromium thật](madara-qa/results.json): tải tài nguyên, bảng chỉ số, xuất hiện, các chiêu, Ultimate cá nhân/đội, phát MP3 thực và tạm dừng/tiếp tục, Live bình chọn. [Ảnh](madara-qa).
- [Kết quả toàn bộ suite](madara-tests.json):45/53 qua khi chạy riêng;8 suite cũ cần file tham chiếu nguồn còn thiếu, vẫn giữ nguyên.
- Workflow **Archive Madara assets to R2** lưu bản theo commit, tải ngược và so sánh byte. Biên nhận nằm ở `docs/madara-r2-archive.json` sau khi hoàn tất. Game tải tài nguyên từ GitHub Pages; R2 là bản lưu riêng.

Chưa đánh giá giọng bằng tai hoặc trên điện thoại thật. Không truy cập được GitHub Pages công khai từ môi trường thực thi này.
