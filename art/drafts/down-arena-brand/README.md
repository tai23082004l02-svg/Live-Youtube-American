# DOWN ARENA — nhận diện thương hiệu

Sheet `down-arena-brand-sheet.png` gồm logo ngang, biểu tượng A/cổng đấu trường, bản gọn và đơn sắc.

Đã triển khai bản ngang nền trong suốt **ở giữa HUD đấu sĩ, thay chữ VS**. Bản gốc `down-arena-logo-transparent.png` được giữ nguyên RGBA, runtime dùng `dist/assets/brand/down-arena-logo.png` cùng nội dung. Thông số alpha-bounds chỉ dùng để căn logo đúng tỷ lệ; renderer vẽ toàn bộ ảnh, không cắt sáng viền.

Live Full HD hiển thị logo rộng khoảng293px, không chạm tên/HP/nộ. File ảnh dùng AssetLoader và giữ cache qua các trận. Ảnh trong game: [brand-hud.png](../../../docs/obs-qa/brand-hud.png). Kiểm tra trình duyệt: `tools/qa_hud_logo.py`.
