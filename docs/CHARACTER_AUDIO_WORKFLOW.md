> Latest (2026-10-21): Sukuna integrated;8 active fighters. Read the new Sukuna section at the top of PROJECT_HANDOFF.md. Current checkout is `C:\Users\ntt23\Documents\Codex\2026-10-21\trong-phi-n-tr\down-arena`. Sukuna voice4.08s/245steps; direct browser/listening QA pending.

# Quy trình tạo nhân vật và âm thanh — Down Arena

Cập nhật 2026-10-21. Đây là hướng dẫn cho phiên chat tiếp theo; đọc cùng PROJECT_HANDOFF.md và README.md, ưu tiên mã hiện tại và mục bàn giao mới nhất khi lịch sử mâu thuẫn.

## 1. Dự án và trạng thái hiện tại

- Chỉnh trực tiếp C:\Users\ntt23\Documents\Codex\2026-10-19\new-chat-2\down-arena. Không tạo lại game.
- Mã thật trong dist/src; JS ngay dưới dist chỉ là điểm vào tương thích.
- Roster chơi hiện tại: Goku Ultra, Ichigo, Sung Jinwoo, Saber, Tatsumaki, Boa Hancock, Gojo. Các nhân vật khác giữ mã/ảnh để thiết kế lại nhưng đã gỡ khỏi lựa chọn và random. CHARACTERS là kho định nghĩa; ACTIVE_CHARACTERS mới là roster cho giao diện.
- Gojo v2 vừa hoàn tất. npm test toàn bộ đã qua; log docs/gojo-v2-test-results.log. Contact sheets đã xem; chưa QA trực tiếp hình/âm thanh trên trình duyệt.
- Dùng cổng8766, webroot dist. Kiểm tra đúng thư mục server trước khi chạy Start_Game.cmd/npm start; không tắt server dự án khác. Ctrl+F5 khi trang dùng cache cũ. Không tự đổi cổng chỉ vì đổi phiên chat.

## 2. Thiết kế và tạo ảnh: đúng thứ tự

1. Đề xuất vai trò, chỉ số, 3–4 kỹ năng, nội tại, Ultimate và ý tưởng xuất hiện. Bám phong cách chibi2D top-down của game; không chuyển sang tranh chân dung hay góc phối cảnh không dùng được khi giao đấu.
2. Làm sheet động tác TRƯỚC: idle, chạy, đấm, đá, lướt, đỡ, trúng đòn, gục. Mỗi hàng một động tác, diễn tiến rõ, cơ thể nhất quán, tay/chân nhìn được. Dùng công cụ tạo ảnh cho minh họa; không giả ảnh chất lượng cao bằng hình khối sơ sài.
3. Sheet skill/VFX RIÊNG: tư thế thi triển và đạn/va chạm/vùng chiêu tách rõ. Hiệu ứng lớn phải có ô lớn tương ứng, không ép vào ô thân người.
4. Sheet xuất hiện: các bước đúng thời gian, ví dụ cổng/vòng phép xuất hiện trước rồi nhân vật mới hiện. Không để nhân vật có sẵn từ frame đầu nếu kịch bản yêu cầu cổng trước.
5. Sheet Ultimate nổi bật, có giai đoạn tích tụ/phóng/va chạm/tàn dư. Sheet khung thoại riêng phù hợp nhân vật, đủ mép viền; chữ hiển thị bằng code để rõ và dịch được.
6. Thông thường tổng5 sheet: <id>_actions.png, <id>_skills.png, <id>_intro.png, <id>_ultimate.png, <id>_dialogue.png. Đây là quy ước cho nhân vật mới, không đổi tên hàng loạt tài nguyên cũ. Nếu cần thêm sheet thì ghi rõ.
7. Tạo từng sheet theo yêu cầu user; không tự tích hợp khi user mới yêu cầu minh họa. Khi user nói đã lưu, kiểm tra đúng file thực tế trong art/sources/, kích thước/alpha/nội dung; nếu có nhiều bản thì xem ảnh để chọn đúng, không đoán theo tên.

## 3. Quy tắc sheet để cắt đẹp

- Lưới đều, ô cách nhau, nền trong suốt khi phù hợp; không chữ nhãn chồng lên khung hình. Cùng hàng giữ tỷ lệ cơ thể và hướng nhìn nhất quán.
- Chừa khoảng thở quanh tóc, bàn chân, vũ khí, áo choàng và tia sáng. Không chạm mép ô; đòn đá và kiếm dài cần ô rộng hơn.
- Xem ảnh bằng view_image trước khi cắt. Đừng chỉ chia đều khi ảnh thực tế lệch lưới: dùng seam/component phù hợp hoặc bounds thủ công, kiểm tra từng hàng.
- Không cắt rời chân/tay/vũ khí sang frame khác; không bóp méo để vừa ô. Không dùng alpha threshold mạnh làm mất ánh sáng mỏng. Không tự xóa nền đen nếu đó là VFX thật.
- Giữ file nguồn nguyên vẹn. Xuất contact sheet trên nền tương phản để xem toàn bộ frame; kiểm tra viền, alpha, mảnh thừa, vị trí chân, độ nét và sự rung tỷ lệ giữa frame.
- Thêm padding trong suốt, pivot theo chân/thân ổn định; metadata tách riêng frameSize/pivot/bounds. Render toàn ô với metadata thay vì crop chặt mất hiệu ứng. Đồng bộ điểm phóng đạn/socket với tay nhân vật và hướng lật.
- Tham khảo tools/prepare_gojo_v2.py: component ownership, alpha coverage report, padding32px, bounds điều chỉnh theo sheet. Không áp nguyên các bounds của Gojo lên ảnh nhân vật khác.
- Raw frames/contact/report: art/frames/<id>/. Runtime WebP: dist/assets/characters/<id>/. Metadata: dist/src/render/. Ưu tiên lossless khi cần giữ viền/alpha.

## 4. Tích hợp đầy đủ, không chỉ thêm tên

- characters/<id>.js: stats, assets, init/tick/onAct/updateAction/chooseSkill, pose và cleanup. Registry trong characters/index.js và ACTIVE_CHARACTERS.
- engine/assets.js: manifest và lazy loading đúng tài nguyên được chọn; giữ cache/retry. engine/sim.js: entrance, hooks, projectile/hit và cleanup cần thiết.
- render/<id>.js + app.js: thân, back/front VFX, đạn, hit, intro, Ultimate, dialogue. Không để fallback ô màu khi ảnh chưa tải.
- personal-ultimate.js, ultimate-rules.js: rage, cảnh vận chiêu, sát thương, danger vùng chiêu, thời gian giọng. Team ultimate nếu có phải nối vào hệ thống hiện hữu, không tạo queue song song.
- spectator-intro.js, spectator meta và tools/prepare_spectator_meta.py: nhân vật trên khán đài cũng dùng đúng atlas/pivot/hiệu ứng xuất hiện; kiểm tra cả spectator và fighter.
- UI: tất cả selector, stats/reset, portrait, random/FFA/team/tournament/Live và dữ liệu lựa chọn cũ. Không kích hoạt lại nhân vật đã retired.
- Giữ deterministic seeded simulation, không friendly fire, không hiệu ứng tồn tại sau chết/reset, không NaN, pose luôn trong bounds.
- Luật đang có: nộ tăng theo thời gian; dùng queue Ultimate chung. Vận Ultimate tạm dừng giao đấu theo cơ chế có sẵn. Damage Ultimate không bị né tự động, vẫn tránh được bằng rời vùng chiêu. Hệ số Ultimate x2 đã có trong ultimate-rules.js: tránh nhân đôi thêm lần nữa.
- Khung thoại ở dưới; live dọc dành25% dưới cho UI, không che sàn. Chữ thoại/UI chiến đấu tiếng Anh cho người xem Mỹ; lời tung chiêu có thể tiếng Nhật.

## 5. Tạo giọng: dùng worker hiện có, không bắt user bấm lại từng lần

Đã có ElevenLabs local worker: tools/voice_worker.py, tools/start_voice_worker.ps1, Start_Voice_Worker.cmd, Stop_Voice_Worker.cmd, Setup_ElevenLabs.cmd. Key được lưu DPAPI theo tài khoản Windows. Không đọc/in/chép API key ra chat, log, source hoặc frontend; không yêu cầu user gửi key vào chat.

1. Đọc .voice-worker/status.json kiểm tra heartbeat gần hiện tại. Nếu worker chưa chạy thì dùng launcher có sẵn, chạy nền ẩn. Sandbox/network có thể chặn; báo đúng trở ngại, không hứa mọi phiên đều có quyền giống nhau.
2. Đọc .voice-worker/voices.json và các kết quả có sẵn để tái dùng voice phù hợp. Có thể gửi job kind=voices để lấy catalog. Giọng nam/nữ và sắc thái phải hợp nhân vật; không mặc định dùng một giọng cho tất cả. Giọng tổng hợp phong cách chiến đấu, không khẳng định giống diễn viên gốc.
3. Viết câu ngắn bằng tiếng Nhật thật, language=ja; UI dịch tiếng Anh. eleven_v3 hỗ trợ cách diễn đạt cảm xúc qua tag như [serious], [shouting]; dùng vừa phải. Tránh phiên âm dài làm phát âm hài hoặc kéo lê sai nhịp.
4. Gửi một JSON UTF-8 hoàn chỉnh bằng temp rồi atomic rename vào .voice-worker/queue/<job-id>.json. Filename phải trùng id; output là tên stem không có đường dẫn. Mẫu cấu trúc dưới đây chỉ để tham khảo, KHÔNG tự chạy khi chưa có yêu cầu tạo âm thanh mới:

```json
{
  "id": "character_ultimate_ja_01",
  "kind": "speech",
  "voice_id": "VOICE_ID_FROM_CATALOG",
  "text": "[serious] CÂU TIẾNG NHẬT ĐÃ SOẠN",
  "language": "ja",
  "model": "eleven_v3",
  "output": "character_ultimate_japanese_raw"
}
```

5. Theo dõi .voice-worker/results/<job-id>.json; không gửi lại job chỉ vì chờ lâu. Worker giới hạn200 ký tự/job,1000 ký tự/ngày,10 mẫu/ngày; chống gửi trùng và không tự retry trả phí. Lỗi/timeout sau submit có thể đã dùng credit. Không tự tăng hạn mức hay generate hàng loạt để thử giọng.
6. Output raw trong art/audio/elevenlabs/. Giữ raw. Gojo mới dùng gojo_unlimited_void_japanese_raw.mp3, preset Brian (voice_id nPczCjzI2devNBz1zQrb), câu 領域展開。無量空処。, dài3.28s; đây là mốc tham khảo, không phải giọng bắt buộc cho nhân vật sau.
7. Đo thời lượng file bằng ffprobe. Chỉ cắt im lặng/normalize khi cần hoặc được yêu cầu; user từng muốn dùng giọng sạch nguyên bản. Không thêm echo/pitch quá mức. Không tuyên bố đã nghe hay giọng hay nếu chỉ kiểm tra metadata.
8. Copy bản runtime sang dist/assets/audio/voices/<id>_ultimate_ja.mp3. Nối SPEECH_ASSETS, TEAM_SPEECH trong dist/src/audio.js, mapping kind của personal Ultimate và thời gian trong ultimate-rules.js. Lưu ý cache/load/mute/pause/resume/music ducking, phát1 lần cho1 lần tung chiêu.
9. Tính thời gian vận chiêu theo ceil(durationSeconds*60) khi phù hợp; kiểm tra pipeline dùng đúng số bước. Goku Ultra có ngoại lệ đã chốt4s, đừng đổi lại toàn bộ giọng theo độ dài raw. Gojo197steps/3.28s, Ichigo183steps/3.04s. Kiểm tra TEAM_VOICE_STEPS khi hợp kích có cùng người nói.
10. Khi user đã yêu cầu tạo và tích hợp thẳng, làm trọn pipeline không dừng chờ duyệt mẫu trừ khi thật sự thiếu dữ kiện/quyền. Không coi tài liệu này là ủy quyền tự phát sinh request trả phí ngoài yêu cầu user hiện tại.

## 6. Âm thanh chiến đấu và nhạc

- Giữ audio.js hiện có: SFX synth/sample, tránh tiếng chồng quá to và spam. tools/prepare_combat_sfx.py là pipeline hiện tại; phân biệt kiếm/đấm/chưởng/va chạm/block/dash/Ultimate.
- Nhạc hiện có Limit Break và Godbreaker, lựa chọn Random/off và âm lượng riêng. tools/compose_arena_music.py, tools/compose_godbreaker.py có bản nhạc tạo bằng code; không nhầm với công cụ sinh bài hát/giọng hát tự nhiên.
- Không cần gọi ElevenLabs để làm các tiếng tổng hợp mà pipeline local đã đáp ứng. Victory voice phát một lần khi thắng, không phát lại mỗi frame.

## 7. Xác minh và bàn giao

- Chạy kiểm tra phù hợp rồi npm test khi thay đổi tích hợp rộng. Gojo mẫu: tests/gojo-v2-tests.mjs, tests/audio-tests.mjs, tests/team-voice-timing-tests.mjs, tests/vertical-arena-tests.mjs, tests/ui-active-roster.mjs.
- Test ảnh thực tế: nguồn/frame/contact, padding và alpha coverage, native render/pose. Test logic: hit/cooldown/team safety/ultimate freeze-rage-pulses-escape/death cleanup/replay. Test UI: xuất hiện trong mọi mode và tải đúng ảnh/giọng.
- Nhân vật mới có intro sẽ làm fixture test cũ phải chờ intro xong trước đo hit; cập nhật precondition đúng, không tắt intro chỉ để test qua.
- QA trình duyệt và nghe âm thanh nếu có công cụ; nếu không có, ghi rõ chưa QA trực tiếp. npm test qua không đồng nghĩa hình/âm thanh thực tế hoàn hảo.
- Cập nhật PROJECT_HANDOFF.md và README.md phần đầu, ghi roster, file mới, thông số, voice/duration, lệnh regenerate, test và giới hạn QA. Không sửa lịch sử cũ thành kết quả mới. Không tạo lại game, không khởi động/tắt server sai thư mục.
