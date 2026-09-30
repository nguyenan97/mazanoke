# Ảnh Gọn / AnhGon

Công cụ image compression/conversion miễn phí bằng Vietnamese và English, chạy trên thiết bị. Kế hoạch và nguồn nghiên cứu: [SEO-GROWTH-PLAN.md](SEO-GROWTH-PLAN.md).

## Sản phẩm hiện tại

- 5 tác vụ × 2 ngôn ngữ, cùng About/Privacy cho mỗi ngôn ngữ.
- 200 KB tính bằng 200.000 bytes; hiển thị đạt/chưa đạt theo blob thật. Cho phép người dùng chọn giảm pixel để đạt mục tiêu.
- Batch tối đa 50 file, 50 MB/file và giới hạn ảnh decode 40 megapixel; xử lý lần lượt. Lỗi một file không làm hỏng các file còn lại.
- Kết quả giữ blob, tên và thumbnail cùng nhau. ZIP tự tránh trùng tên; giới hạn tổng kết quả 100 MB, ZIP 75 MB để giảm rủi ro hết bộ nhớ.
- JPG nền trắng; ảnh động thành ảnh tĩnh; EXIF bị loại bỏ. AVIF tùy hỗ trợ của browser. Không cam kết mọi ảnh đều nhẹ hơn hay luôn đạt mục tiêu.
- Inter tự host, light/dark, desktop 2 cột và mobile upload trước; navigation 5 tác vụ, dropdown borderless, kết quả dạng hàng; ảnh mẫu tạo tại chỗ, kéo thả, chọn file, paste.
- Lazy-load codecs; offline tải theo yêu cầu; update chỉ reload sau khi đã xóa kết quả để tránh mất batch.

## Hệ thống

`content/pages.mjs` quản lý route/nội dung/preset, `locales/` quản lý UI strings, `config/site.json` quản lý brand/origin. Build sinh `dist`, không sửa trực tiếp output. Các script legacy upstream vẫn được giữ trong repository để tham chiếu, không được ship bởi build mới.

Không có account, database, upload API, analytics hoặc quảng cáo. Search Console đã xác minh quyền sở hữu ngày 28/09/2026; review 30/09 xác nhận sitemap Success và 14 URL được phát hiện. Trang chủ chưa được index; chưa có số liệu usage riêng của AnhGon.

## Vận hành

Giữ site Netlify Free hiện tại và URL ổn định. Git push chưa tự deploy vì continuous deployment chưa liên kết. Không tạo project mới. Xem [NETLIFY-VI.md](NETLIFY-VI.md) và [RELEASE-CHECKS.md](RELEASE-CHECKS.md).

Ngày 30/09 bổ sung quy trình release theo đợt: local checks, browser QA, GitHub CI miễn phí và candidate có checksum. UI mới cùng TIFF/Docker fixes ở commit `028bee1` đã push và CI pass. Chủ site đã cho phép publish một lần, nhưng plugin upload lỗi HTTP 500; CLI cần owner đăng nhập/authorize. Production còn bản cũ; candidate `48ef738bb1d5-028bee1` đã xác minh checksum và có thể deploy trực tiếp với `--no-build`. [Release policy](RELEASE-POLICY.md), [demo và draft chia sẻ](LAUNCH-KIT.md).
