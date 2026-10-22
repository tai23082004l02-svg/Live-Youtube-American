# Thoại truyện tranh

Thay banner Ultimate bằng **nhân vật riêng + bong bóng thoại trắng viền đen**, có đuôi hướng về người nói. Tên và lời thoại đều dùng `"Times New Roman", Times, serif`, chữ đen, tự xuống dòng. Dùng hình toàn thân có sẵn của đúng nhân vật, không cắt chân/tóc hoặc kéo giãn; không dùng ảnh khung thoại cũ.

Áp dụng cho12 nhân vật đang hoạt động, Ultimate cá nhân, hợp kích đội và câu hô chuyển Baryon. Chế độ đấu thường/ngang dùng vùng dưới khung hình; Live bình chọn ghép trong vùng trận; Live sân dọc dùng lớp thoại riêng và giữ vùng đen cuối màn hình. Tùy chọn giảm hiệu ứng tắt trượt nhẹ/bóng mờ. Bong bóng biến mất khi câu hô kết thúc; bỏ các bảng tên kỹ năng cũ xuất hiện sau lời thoại.

Giữ nguyên file giọng nói, câu thoại hiện có, số tick cinematic, cách phát một lần, tạm dừng/tiếp tục, tắt tiếng, giảm nhạc nền và cơ chế sát thương. Không tạo giọng mới. Renderer `dist/src/render/comic-dialogue.js` đọc trạng thái, không sửa mô phỏng. Ảnh banner và hàm render cũ còn trong nguồn để lưu trữ, nhưng luồng render game không gọi chúng.

Kiểm tra:

- `node tests/comic-dialogue-tests.mjs`:12 người nói × cá nhân/đội × giảm hiệu ứng, đúng atlas/frame đầy đủ, không vẽ ảnh banner, font/word wrapping/Baryon/state immutability.
- Các bộ UI, âm thanh, thời gian giọng đội, Madara, Gogeta Blue, Naruto v2, hợp kích, Live dọc và bình chọn đã qua.
- `python tools/qa_comic_dialogue.py`: tự mở server cục bộ, Chromium thật; kiểm tra Ichigo cá nhân, Sukuna hợp kích, câu hô giải mã/tạm dừng/tiếp tục, không có lệnh vẽ banner cũ, Live bình chọn và Live dọc Full HD. Ảnh/kết quả tại [comic-qa](comic-qa).

Times New Roman có sẵn trên Windows chạy OBS; trên máy không cài font, trình duyệt dùng Times hoặc serif dự phòng.
