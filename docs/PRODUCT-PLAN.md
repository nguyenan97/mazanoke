# Ảnh Gọn — định hướng sản phẩm và phát hành

## Người dùng và nhu cầu

Công cụ tiếng Việt cho người đăng ảnh sản phẩm, quản trị website và gửi ảnh qua biểu mẫu giới hạn dung lượng. Tác vụ chính: nén ảnh, chuyển HEIC/PNG sang JPG, chuyển WebP và thu nhỏ kích thước. Lợi thế cần giữ: thao tác nhanh, không đăng ký, xử lý trên thiết bị, hướng dẫn rõ giới hạn.

## Giao diện phiên bản đầu

- Inter Variable tự host, đủ Vietnamese; body 14 px, tiêu đề 28–36 px, weight 400/500/600/650. Cùng font cho label và heading.
- Nền sáng mặc định, chữ đậm, border mảnh, nút chính xanh; có dark mode. Vùng upload không có texture trang trí.
- Desktop: chọn ảnh và kết quả bên trái, tùy chỉnh bên phải. Mobile: chọn ảnh phía trên, tab tùy chỉnh/kết quả bên dưới.
- Preset thật: 200 KB, JPG, WebP, cạnh dài 1200 px. Thông báo thiết lập áp dụng cho ảnh thêm tiếp theo.
- Kết quả: tên file, kích thước, dung lượng, tỷ lệ thay đổi, tải từng ảnh và ZIP. Không có số liệu giả hay cam kết luôn đạt dung lượng.
- Hướng dẫn và FAQ dưới công cụ. Giữ attribution và mã nguồn fork.

## Đã triển khai

Trang công cụ, preset, responsive, font tự host, FAQ, PWA/offline, build static Netlify, canonical/sitemap production, noindex preview. Chưa có tài khoản, database, analytics hoặc quảng cáo.

## SEO và nội dung tiếp theo

Đây là backlog, chưa khẳng định có lượng tìm kiếm đã đo.

| Trang dự kiến | Nội dung riêng cần có | Tác vụ |
|---|---|---|
| `/nen-anh-200kb/` | Ví dụ trước/sau, xử lý khi chưa đạt mục tiêu | Dung lượng |
| `/heic-sang-jpg/` | Ảnh iPhone, chọn file, giới hạn bộ nhớ | JPG |
| `/png-sang-jpg/` | Minh họa mất nền trong suốt | JPG |
| `/doi-anh-sang-webp/` | Dùng WebP cho website, kiểm tra kết quả | WebP |
| `/thay-doi-kich-thuoc-anh/` | Phân biệt pixel/KB, giữ tỷ lệ | Resize |

Chỉ phát hành trang có nội dung và ví dụ riêng; không sinh hàng trăm trang thay mỗi từ khóa. Đăng ký Search Console khi URL ổn định, gửi sitemap, theo dõi query/impression/click. Nếu chuyển domain, cập nhật canonical và redirect đồng bộ.

## Kiếm tiền

Đầu tiên đo tính hữu dụng và lượng truy cập. Sau đó cân nhắc quảng cáo dưới kết quả hoặc trong hướng dẫn; không sát nút tải, không tạo nút tải giả. Affiliate chỉ trong bài liên quan và có công bố. Cần publisher ID thực tế trước khi tích hợp. Khi thêm analytics/ads phải cập nhật nội dung quyền riêng tư.

Không đặt mục tiêu thu nhập khi chưa có dữ liệu. Theo dõi lượt tìm kiếm dẫn vào, tỷ lệ hoàn tất tác vụ, lỗi xử lý, lượt quay lại, usage hosting, doanh thu/1.000 phiên khi đã monetization.

## Điều kiện phát hành Netlify

1. Kiểm tra font có dấu, desktop/mobile/dark mode, overflow.
2. Chạy nén, đổi định dạng, preset dung lượng/resize và ZIP.
3. Xác định team Free và site theo repo; tránh project trùng.
4. Kết nối repo, xác minh build, robots/canonical/sitemap trên HTTPS.
5. Xác minh download bằng browser. Báo rõ nếu automation không ghi nhận file.

Static hosting, không dùng Functions/API tính phí. Theo dõi Usage, không tự bật paid upgrade/auto recharge.
