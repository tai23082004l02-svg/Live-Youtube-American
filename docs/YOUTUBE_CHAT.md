# Bình chọn bằng chat YouTube trên máy OBS

Công cụ phục vụ game tại máy và đọc YouTube qua OAuth quyền `youtube.readonly`. Không cần đưa JSON lên GitHub/R2. Tệp token nằm trong `.secrets/youtube-chat-token.json` (đã được Git bỏ qua).

## Chạy trên Windows

1. Cài Python 3 từ python.org, bật tùy chọn thêm Python vào PATH và Python Launcher.
2. Tải bản mới của repository (Code → Download ZIP), giải nén đầy đủ. Không cần chép JSON vào repository.
3. Mở `tools/youtube-chat/start.bat`. Lần đầu công cụ tải thư viện vào `.secrets/youtube-chat-venv`.
4. Trang `http://127.0.0.1:8765/control` tự mở. Chọn JSON **Desktop OAuth** đã tải từ Google Cloud, dán link buổi YouTube đang live rồi bấm **Đăng nhập và kết nối**.
5. Đăng nhập tài khoản đã thêm vào OAuth Test users, chọn đúng kênh. Nếu Google hiển thị cảnh báo ứng dụng chưa xác minh, kiểm tra đúng tên ứng dụng của bạn rồi dùng Advanced/Continue để tiếp tục thử nghiệm.
6. Đợi trạng thái `YOUTUBE CHAT CONNECTED`. Nếu live chưa bắt đầu hoặc chat tắt, bắt đầu live rồi kết nối lại.
7. OBS → Browser Source → URL `http://127.0.0.1:8765/online/?obs=vote&chat=1`, Width 1080, Height 1920. Địa chỉ `/online/` tải HTML và toàn bộ mã, hình ảnh, âm thanh từ GitHub Pages; không dùng bản `dist` cũ trên máy. Khi thêm nhân vật hoặc sửa game chỉ cần Refresh cache of current page trong OBS. Cần internet. Đường dẫn `/dist/` vẫn hỗ trợ bản local cũ nếu cần.
8. Giữ công cụ chạy trong lúc phát. Chỉ mở **một** bản game nhận phiếu; đóng tab game thử trước khi dùng OBS. Muốn đổi buổi live đang kết nối: đóng công cụ rồi mở lại.

Trong YouTube Studio → Chỉnh sửa buổi live → Tùy chỉnh → chế độ người tham gia chat, bật **Người đăng ký**. YouTube quản lý điều kiện đăng ký, công cụ không kiểm tra danh sách đăng ký riêng.

## Thử thực tế

- Dùng tài khoản khác đã đăng ký kênh, bình luận chỉ số `1` rồi `2`. Phiếu cũ phải đổi sang lựa chọn 2.
- Số phải thuộc danh sách hiện tại; công cụ tự nhận số lượng lựa chọn từ game. Mã hỗ trợ 1–9 và số lớn hơn; giao diện game hiện vẫn hiển thị 6 lựa chọn.
- Bật `chat=1` sẽ tắt phiếu tự động và nút phiếu thử. Phiếu thật khóa khi trận kết thúc, hai nhân vật đứng đầu đấu 1vs1 tiếp.
- Chat cũ lúc kết nối bị bỏ qua. Phiếu cũ/đến trễ qua lượt, lúc tạm dừng hoặc ngắt game không được chuyển sang lượt mới.
- Thăm dò theo `pollingIntervalMillis` YouTube trả về, tối thiểu 2 giây (mặc định 5 giây nếu không có chỉ dẫn). Không còn ép chờ 10 giây. Khoảng chờ thực tế vẫn phụ thuộc YouTube; đọc thường xuyên hơn dùng quota nhiều hơn. Bình luận sát thời điểm hết trận có thể không kịp tính.

## Hạn mức và đăng nhập

YouTube Data API dùng quota, đọc chat liên tục sẽ tiêu hao quota; chưa có bảo đảm phát cả ngày với quota mặc định. Khi quota hết, công cụ dừng nhận và hiện lỗi, không tự tạo phiếu. Kiểm tra API → Quotas trong Google Cloud trước buổi live dài. Không cần bật dịch vụ tính phí cho công cụ.

OAuth External ở chế độ Testing có thể yêu cầu cấp quyền lại sau khoảng 7 ngày. Nếu lỗi đăng nhập, xác nhận tài khoản nằm trong Test users, YouTube Data API v3 bật đúng dự án và scope `youtube.readonly` đã lưu. Muốn xóa đăng nhập đã lưu: đóng công cụ rồi xóa `.secrets/youtube-chat-token.json`.

Đã kiểm tra tự động parser/khóa lượt/đổi phiếu và tích hợp game bằng dữ liệu giả lập. Đăng nhập Google và nhận chat thật cần thử trên máy sở hữu tài khoản; môi trường phát triển không có JSON/token của bạn.

## Game trên GitHub, công cụ chat trên máy

Cập nhật công cụ một lần để có đường dẫn `/online/`. Sau đó cập nhật game không yêu cầu tải ZIP/file game về máy. JSON và token luôn ở máy; GitHub không nhận OAuth token. Trang chính GitHub cũng hỗ trợ `?obs=vote&chat=1`, nhưng Chrome có thể yêu cầu quyền Local network access và OBS có thể không hiện hộp cấp quyền. Vì vậy dùng địa chỉ `/online/` trong OBS để tránh phụ thuộc quyền đó. Khi GitHub Pages đang triển khai, chờ hoàn tất rồi làm mới nguồn. Công cụ chat nếu có sửa riêng vẫn cần cập nhật; thay đổi game thông thường không cần.
