# Live Arena — bản đầu tiên

1. Mở game, nhấn Ctrl+F5 rồi chọn **Live Arena · Tự chạy 16:9** ở mục chế độ.
2. Chỉnh chỉ số, hệ số HP, kích thước sàn và âm lượng trước khi bắt đầu.
3. Nhấn **Bắt đầu Live Arena**. Game chuyển sang màn hình sạch 16:9.
4. **Space** tạm dừng/tiếp tục. **Esc** hiện bảng điều khiển; trận vẫn tiếp tục. Nhấn **Dừng Live Arena** để kết thúc phiên hoặc nút mở màn hình live để quay lại.
5. Có thể dùng **F11** của trình duyệt để toàn màn hình. Trong OBS, lấy hình cửa sổ game và kiểm tra âm thanh trước khi phát.

## Chu kỳ tự động

- Chọn 8 nhân vật khác nhau từ toàn bộ danh sách, bốc cặp đấu.
- Giới thiệu cặp đấu 1 giây → giao đấu không giới hạn thời gian → KO và âm báo ngắn, giữ kết quả 1,2 giây.
- Chuyển sang trận tiếp theo ngay sau nhịp KO, không có đếm ngược nghỉ thêm 5 giây.
- Hoàn tất 7 trận, ghi nhận nhà vô địch rồi tự bốc giải mới, không nghỉ thêm 8 giây.
- Hòa sẽ đấu lại đúng cặp đó. HP và năng lượng được khởi tạo lại mỗi trận.
- Hiện số giải, vòng/trận, thanh máu, trận tiếp theo, nhà vô địch gần nhất và số danh hiệu trong phiên.

## Thiết lập và vận hành

- Tốc độ live cố định 1×. Khi dừng, game trả về tốc độ trước đó.
- Giải dùng chỉ số, hệ số HP và sàn hiện tại; giữ nguyên luật chiến đấu. Giải đơn không dùng hợp kích đội; Ultimate riêng vẫn hoạt động.
- Dùng canvas 960×540 và co giãn đúng 16:9 theo cửa sổ; các thành phần người xem đều được vẽ trên canvas. Không cần ảnh/sprite mới.
- Nhạc đã chọn tiếp tục qua các màn chuyển trận, giọng skill dùng hệ thống sẵn có. Tạm dừng/dừng phiên sẽ dừng âm thanh tương ứng.
- Giữ cửa sổ game hiển thị khi phát. Đổi sang tab khác hoặc ẩn trang sẽ tự tạm dừng; quay lại và nhấn Space để tiếp tục.
- Nếu tải tài nguyên lỗi, màn hình báo ASSET LOAD FAILED. Nhấn Esc rồi **Tải lại tài nguyên**; không tự bỏ qua cặp đấu.
- Đây là chế độ trình diễn game, **chưa kết nối hoặc phát lên YouTube**, chưa có bình chọn từ chat hay bình luận viên tự động.

## Kiểm tra

Unit và UI VM đã kiểm tra: giải 8 người, đủ 7 trận, tự mở giải mới, hòa đấu lại, tạm dừng, chuyển chế độ, hủy tải cũ và thử lại sau lỗi. Full `npm test` PASS, log `live-arena-test-results.log`.

QA trực tiếp hình ảnh/âm thanh chưa hoàn tất: môi trường kiểm tra chặn socket localhost (WinError10013), Playwright không khởi chạy được. Công cụ `tools/qa_live_arena.py` để chạy lại trong môi trường trình duyệt cho phép; ảnh chụp chỉ dùng kiểm tra nội bộ.

URL bản mới: http://127.0.0.1:8766/?build=live-arena-1
