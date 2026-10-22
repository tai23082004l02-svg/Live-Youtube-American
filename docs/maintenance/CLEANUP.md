# Dọn repository ngày 22/10/2026

## Đã dọn

- 70 PNG/contact sheet/MP3 nguồn trong `art/` có cùng byte và SHA-256 với biên nhận upload/download R2 hiện có.
- 57 ảnh QA/screenshot tạo tự động trong `docs/`.
- Bốn file Python bytecode đã vô tình được commit, các cache local và434 PNG frame rời được Git bỏ qua.
- Năm file `art/sources/rengoku` untracked có hash khớp bản R2 (bản trùng), không đưa vào commit.
- Tổng file tracked gỡ:131 file,153,411,930 byte (~146,3MiB). Danh sách từng file/hash/lý do/R2 key: [manifest](cleanup-2026-10-22.json).

Giữ toàn bộ `dist` (mã, ảnh, nhạc, voice, atlases/metadata), tests, công cụ tạo/verify nhân vật, công cụ YouTube, workflows và tài liệu/JSON kết quả cần bàn giao. PNG nguồn KO mới chưa có biên nhận R2 được giữ, không xóa dựa trên phỏng đoán.

Các ảnh QA có thể khôi phục từ commit trước dọn, đường dẫn markdown đến file đã gỡ được chuyển sang liên kết GitHub lịch sử. JSON extraction report được giữ để các test hành vi/metadata vẫn chạy. `.nojekyll` ở root đánh dấu đây là site tĩnh, không cần xử lý Jekyll.

## Khôi phục nguồn khi cần sửa nhân vật

Trong checkout Git có đầy đủ lịch sử:

```bash
python3 tools/restore_source_art.py --source git
```

Hoặc chỉ Gogeta:

```bash
python3 tools/restore_source_art.py --receipt docs/gogeta-blue-r2-archive.json --source git
```

Các nguồn được trả về đúng đường dẫn cũ, kiểm tra kích thước vàSHA-256. File đang tồn tại không bị ghi đè. Sau đó chạy công cụ `prepare_*.py`/`verify_*.py` như trước. Nguồn đã archive được `.gitignore` để không tự đẩy lại khi `git add .`; nếu chủ động sửa sheet và cần commit bản mới thì thêm đích danh bằng `git add -f path` hoặc bỏ dòng ignore tương ứng.

Nếu clone shallow thiếu commit, fetch lịch sử trước. Nếu tải ZIP không có `.git`, có thể phục hồi từ R2 bằng AWS CLI và thông tin truy cập hợp lệ:

```bash
python3 tools/restore_source_art.py --source r2
```

Lệnh R2 cần AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY và cấu hình region auto. Không dán credentials lên GitHub. Helper chỉ khôi phục đường dẫn `art/` trong receipt, không ghi đè runtime.

Archive workflows tự phục hồi nguồn thiếu từ receipt bằng lịch sử Git trước khi upload/verify, nên việc dọn không bỏ khả năng tạo archive sau này. Bỏ trigger chỉ dựa vào thay đổi file workflow để lần dọn này không gây thêm năm lượt archive; vẫn chạy khi tài nguyên runtime tương ứng đổi và vẫn có workflow_dispatch.

## Khả năng khôi phục đã kiểm tra

Đã chạy helper khôi phục tất cả70 nguồn, đối chiếu SHA-256 của từng file với manifest rồi gỡ lại khỏi working tree. Tests asset/voting/chat/title/victory, Gogeta/Madara/Naruto/Rengoku và Chromium game online qua. Không sửa combat stats, gameplay, JSON đăng nhập hoặc R2 objects.

## Lưu ý dung lượng và phát hành

Dọn này giảm bản checkout mới và phần dữ liệu đưa lên Pages, **không thu nhỏ lịch sử `.git`** và không xóa lịch sử remote. Người dùng đã xác nhận GitHub Status đang có sự cố Actions ngày22/10/2026; cleanup không thể sửa sự cố dịch vụ đó. Commit thành công không đồng nghĩa Pages đã deploy. Chờ lượt mới nhất thành công rồi refresh OBS.
