# Live dọc 9:16

Mở http://127.0.0.1:8766/?build=vertical-live-1 rồi nhấn Ctrl+F5.

Chọn **Live dọc · 9:16 · Đấu ngẫu nhiên + giải đấu** và nhấn **Bắt đầu Live Arena**. Bản ngang vẫn giữ ở lựa chọn Live Arena16:9.

## Bố cục

- Canvas xuất1080×1920, bố cục logic540×960. Dùng [Browser Source Full HD trong OBS](OBS.md) để tránh thu cửa sổ nhỏ rồi phóng lớn.
- Trên20%: khán đài6 khách ngẫu nhiên có hoạt ảnh đứng và cổng xuất hiện. Mỗi60s đang chạy thay đội khách mới. Tạm dừng sẽ dừng đồng hồ này.
- Giữa55%: thanh máu đội, sân đá riêng, nhân vật/skill, màn giới thiệu và kết quả. Spawn đội A phía trên, B phía dưới;1/2/5 người mỗi đội. Camera chiến thắng giữ từ game; chữ kết quả được bố trí lại cho dọc.
- Dưới25%: đen hoàn toàn ở mọi giai đoạn, dành chỗ cho phần bình luận của nền tảng. Không hiện bình luận mẫu, không ghi chữ lên vùng này.
- Khung thoại Ultimate dùng đầy đủ ảnh gốc, co đều theo chiều rộng, nằm cuối vùng giao đấu; không tràn vào vùng đen.

## Chu kỳ

1. Bốc thể thức1vs1,2vs2 hoặc5vs5 và đội hình khác nhau mỗi trận.
2. Giới thiệu1s → chiến đấu không giới hạn thời gian → VICTORY5s → chờ5s.
3. Sau5 trận ngẫu nhiên: bốc8 nhân vật trong8s, từng ô khóa kết quả.
4. Đánh giải đơn8 suất,7 trận, trao chức vô địch8s.
5. Quay về đấu ngẫu nhiên và lặp lại.

**Bình chọn YouTube chưa kết nối.** Màn bốc thăm ghi rõ AUTO SELECTION. Không có phiếu giả hoặc yêu cầu nhập khóa API. Khi nối chat thật sẽ thay nguồn lựa chọn này bằng kết quả bình chọn. Hiện không chèn quảng cáo và không có thời gian chờ cho quảng cáo.

## Điều khiển

- Space: tạm dừng/tiếp tục, gồm cả khán đài và bốc thăm.
- Esc: hiện bảng điều khiển; game vẫn tiếp tục.
- Mở màn hình Live9:16: quay lại hình sạch.
- Dừng Live Arena: kết thúc phiên, hủy tải cũ, trả tốc độ cũ.
- Giữ cửa sổ hiển thị; chuyển tab/ẩn trang tự tạm dừng. F11 có thể bật toàn màn hình.
- Lỗi tải tài nguyên: Esc → Tải lại tài nguyên. Lỗi ảnh khán đài giữ khách cũ, không chặn trận đấu.

Game sử dụng chỉ số, hệ số HP, hệ số sàn đã chỉnh trước khi bắt đầu. Tốc độ trong live1×. Hợp kích theo tùy chọn hiện tại và chỉ có ở đội2/5 người; Ultimate riêng giữ nguyên.

Kiểm tra tự động toàn bộ đã qua. Chưa QA trực tiếp hình ảnh/âm thanh trong trình duyệt; vẫn cần buổi chạy thử trước khi phát công khai. Chế độ này chỉ tạo hình game, chưa tự phát YouTube.


### Sequential spectators (2026-10-21)
Six slots enter at0/10/20/30/40/50 seconds, then replace individually at60/70/80/90/100/110 and repeat. Previous occupants remain until their slot is due. Each cycle selects6 unique guests, excluding the previous six when the pool permits. The independent spectator loader preloads only idle + entrance actor/VFX assets. Eight supported characters reuse their native2.5s entrance presentation; others use the existing portal. Reduced-effects mode shows idle with a fade. Clock pauses with Live pause. Generation guards protect Stop/restart. Tests: vertical-arena-tests (schedule, distinct slots, full8 entrance renderers) and UI VM suite PASS; direct browser visual/audio QA pending.


### Sunset arena (2026-10-21)
Active portrait background: art/sources/vertical_arena_sunset.png -> dist/assets/arenas/vertical_arena_sunset.webp (quality94). The source941x1176 artwork band maps continuously to540x720 using a shared proportional split at source y313.6; source black padding is excluded, compositor keeps exact bottom25% black. Six guest foot anchors repositioned on the upper terrace. Existing inset octagonal collision area verified within the new paved surface using a geometry overlay; no combat rules changed. Menu backdrop also uses sunset artwork. Vertical/spectator-intro tests and UI VM PASS; browser visual/audio QA still pending.


### Continuous background / bottom introduction (2026-10-21)
Portrait background now draws once over the entire540x720 upper band. The original game canvas is transparent in portrait mode and carries actors/VFX only; no separate floor image or opaque dividing strip. Horizontal rendering unchanged. The5s pre-match team introduction (including5vs5 portraits) is now confined to y720..960, temporarily using the chat quarter. This quarter returns to pure black outside intro. Existing dialogue/victory and battle geometry remain. Vertical tests assert all intro text stays in the bottom quarter; UI regression PASS. Direct browser QA pending.
