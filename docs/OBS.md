> Trạng thái mới nhất (22/10/2026): [bàn giao kỹ thuật](NEXT_CHAT_HANDOFF.md) và [hướng dẫn chat YouTube](YOUTUBE_CHAT.md). Live hiện là1vs1, chat thật,10 ứng viên/2 trang, game từ GitHub qua `/online/`. Các phần dưới có thể giữ ghi chú của phiên bản demo trước đó.

# Nguồn OBS Full HD

Mở **OBS → Sources → + → Browser** và dùng:

- Live bình chọn + đấu trường ngang: `https://tai23082004l02-svg.github.io/Live-Youtube-American/dist/?obs=vote`
- Live sân dọc + giải đấu: `https://tai23082004l02-svg.github.io/Live-Youtube-American/dist/?obs=vertical`

Đặt **Width1080**, **Height1920**, rồi **Transform → Fit to Screen** (Ctrl+F). Base/Output của OBS cũng1080×1920. Tắt nguồn Window Capture cũ để không chồng hai bản game. Browser Source tự chọn chế độ và bắt đầu Live Arena; không tự bắt đầu phát YouTube. Nếu âm thanh chưa chạy, nhấp phải nguồn → Interact → bấm một lần vào game để mở âm thanh theo chính sách trình duyệt. Chỉ thu âm game một đường để tránh vọng.

Canvas xuất trực tiếp1080×1920 với hệ tọa độ bố cục540×960 và transform2×. Chữ được raster hóa ở kích thước đầu ra; cảnh trận960×540 được ghép thẳng vào vùng1080px, tránh bước giảm xuống540px rồi phóng lên1080px. CSS vẫn vừa màn hình9:16. Bảng bình chọn được kéo lên để chừa dải tên/HP riêng ngay trên sân. Sân không vẽ chồng HUD hoặc thanh HP nhỏ dưới chân trong chế độ bình chọn; logic trận giữ nguyên.

Nguồn Chrome nhỏ được Window Capture rồi phóng lớn trong OBS vẫn có thể mất nét; dùng Browser Source với đúng kích thước thay cho cách đó. Bitrate không khắc phục được chữ đã mờ ngay tại nguồn. Hiện bảng bình chọn vẫn dùng phiếu mô phỏng, chưa lấy bình luận YouTube.

Kiểm tra: `node tests/obs-output-tests.mjs`, các bộ UI/Live/vote hiện có và `python tools/qa_obs_output.py` với server ở port8768. Chromium xác nhận buffer và kích thước hiển thị đều1080×1920, transform2×, hai chế độ tự chạy và không tạm dừng. Ảnh/kết quả trong `docs/obs-qa`.

HUD Live bình chọn dùng cùng một mẫu cho mọi nhân vật: bên trái xanh lam, bên phải đỏ hồng, thanh HP và thanh nộ Ultimate vàng bên dưới. Giữa hai bên là logo DOWN ARENA nền trong suốt. Thanh nộ dùng giá trị0–100 thật của đấu sĩ, đổi màu sáng khi đầy và tiêu hao về0 khi tung Ultimate. Có ảnh kiểm tra tại `docs/obs-qa/shared-hud.png` và `shared-hud-ready.png`.
