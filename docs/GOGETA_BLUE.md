# Gogeta Blue

Chọn **Đấu thường → Gogeta Blue** hoặc chọn trong đấu đội, FFA, giải đấu và Live. Phiên bản: **GOGETA BLUE / 12 CHARACTERS**. Gogeta Super Saiyan cũ được giữ trong mã nguồn; Gogeta Blue là nhân vật riêng trong danh sách hoạt động.

HP1200 · Tốc độ235 · Đòn thường84 · Đỡ15% · Không có dịch chuyển né tự động mặc định.

| Chiêu | Hành vi | Sát thương gốc | Hồi |
|---|---|---|---|
| Fusion Combo | Ba đòn cận chiến, cú cuối đẩy nhẹ | 24 +25 +35 ở chỉ số mặc định |0,9s|
| Meteor Assault | Lao tới tối đa900px/s, ba đòn trong phạm vi115px; không dịch chuyển tức thời |50 +55 +95|8s|
| Stardust Breaker | Cầu cầu vồng, nổ lan115px |230 trực tiếp,75 lên địch xung quanh|10s|
| God Punisher | Năm cầu xanh vàng theo loạt |48 ×5|11s|
| Full Force Kamehameha | Lùi lấy khoảng trống trong0,3s đầu câu hô, cảnh báo hướng0,6s rồi bắn chưởng lớn xuyên mục tiêu |840 mỗi địch, trúng tối đa một lần|100 nộ|

Các kỹ năng thường chịu né/đỡ và chỉ số sức mạnh kỹ năng. Combo thường dùng chỉ số cận chiến. Địch rời khỏi tầm combo/rush sẽ khiến đòn hụt. Trói ngăn lao/lùi; choáng/hóa đá dùng cơ chế gián đoạn chung. Kamehameha tuân theo quy tắc Ultimate chung: bỏ qua né tự động nhưng vẫn có thể tránh đường bắn; đỡ/giáp vẫn có tác dụng. Chết hoặc bị vô hiệu hóa trong giai đoạn cảnh báo sẽ hủy phát bắn. Chưởng đã bắn tiếp tục bay. Không gây sát thương đồng đội.

AI dùng Meteor Assault để áp sát từ110–420px, đánh combo khi vào dưới100px, lùi ngắn khi đòn thường đang hồi và tung cầu năng lượng từ140–650px. Không có hồi máu hay biến hình tăng chỉ số giữa trận.

Màn xuất hiện2,5s: dạng tóc đen khoanh tay hạ xuống, chạm đất, vận khí, chuyển tóc xanh và vào tư thế sẵn sàng. Hiệu ứng tách khỏi thân. Hợp kích đội dùng hình ảnh Kamehameha riêng, giữ bán kính160px và sát thương hợp kích chung.

## Tài nguyên và kiểm tra

- Sáu sheet nguồn trong [art/drafts/gogeta-blue](../art/drafts/gogeta-blue), tổng84frame:32 động tác,12 cast,8 xuất hiện,16 VFX,12 Ultimate,4 thoại.
- Tám atlas WebP runtime trong `dist/assets/characters/gogeta_blue`; kích thước và pivot riêng trong `dist/src/render/gogeta-blue-meta.js`, padding32px.
- `python tools/prepare_gogeta_blue.py` tách theo seam alpha; hàng động tác dùng mốc thực tế và giữ nguyên từng hình liền khối. `python tools/verify_gogeta_blue.py` tái dựng toàn bộ pixel RGBA có alpha từ frame nguồn, xác nhận không thiếu/trùng; kiểm tra kích thước và padding atlas.
- Giọng preset **Adam**, ElevenLabs `eleven_v3`, tiếng Nhật “かめはめ波ー！”. File gốc được giữ; PCM giải mã2,0s →120tick cho câu hô cá nhân/đội. Dùng bộ cache, tạm dừng, tiếp tục, tắt tiếng và giảm nhạc chung. Không mô phỏng giọng diễn viên gốc.
- `node tests/gogeta-blue-tests.mjs`: phạm vi/đòn hụt, đường lao, root, né/đỡ, projectile/splash/đồng đội, AI, cinematic, cảnh báo/chưởng/thoát đường/chết, renderer full-cell và trận hoàn tất có thể tái lập.
- `python tools/qa_gogeta_blue.py`: Chromium thật với server `python -m http.server 8768 --directory dist`; kiểm tra assets, thoại giải mã/tạm dừng/tiếp tục, cá nhân/đội và Live bình chọn. Kết quả và ảnh tại [gogeta_blue-qa](gogeta_blue-qa).
- Workflow **Archive Gogeta Blue assets to R2** sao lưu ảnh nguồn, atlas, ảnh liên hệ, báo cáo và âm thanh vào revision riêng; tải xuống đối chiếu byte trước khi ghi `docs/gogeta-blue-r2-archive.json`. Giữ nguồn tạm trên GitHub để duyệt; chưa xóa nguồn hay object R2.
