# Ảnh Gọn trên Netlify Free

- Production: [anh-gon-vn.netlify.app](https://anh-gon-vn.netlify.app/)
- English: [/en/](https://anh-gon-vn.netlify.app/en/)
- [Dashboard](https://app.netlify.com/projects/anh-gon-vn)
- Site ID: `190d2047-b9db-4f47-ba7e-519f696cfefd`
- Team `nguyenan6197`, Free được kiểm tra lại ngày 30/09/2026.
- Build: `node scripts/build-netlify.mjs`; publish: `dist`; Node trên Netlify: 22.
- Bản review ngày 28/09/2026 đã publish: deploy `6aba77db68c13400d1c0ae8e`, version `1f6966c8046c`.

## Deploy

**Quy định ngày 30/09/2026:** hoàn tất cả đợt thay đổi và QA local rồi mới gom một lần deploy. Chủ site đã cho phép publish đợt UI sau QA/CI; không tạo preview deploy. Xem [RELEASE-POLICY.md](RELEASE-POLICY.md). GitHub CI chỉ kiểm tra local.

Tái sử dụng project trên. Netlify plugin upload source và chạy build trên Netlify. **Chưa liên kết GitHub continuous deployment**: push repo không tự cập nhật production. Nếu bật sau này, liên kết `nguyenan97/mazanoke` vào project hiện tại; không tạo project trùng.

Build không cần install runtime dependencies. `CONTEXT=production` tạo bản indexable; preview/local có noindex. Canonical origin lấy theo thứ tự `SITE_URL`, `URL` của Netlify, `config/site.json`. Luôn dùng origin production cho canonical, không dùng deploy-preview hostname.

## Local

Node.js 20+:

```sh
npm test
npm run build
npm start
```

Mở `http://127.0.0.1:4173`. `index.html` trong source là template, không mở trực tiếp bằng file://. Muốn thử service worker local, build `node scripts/build-netlify.mjs --production` trước `npm start`. Build/test tạo lại `dist`, không chứa ảnh của người dùng.

## Search Console miễn phí

Property HTTPS đã được Google xác minh bằng HTML tag ngày 28/09/2026. Mã công khai được lưu trong `config/site.json`; không xóa mã này khi deploy. Review ngày 30/09/2026: sitemap báo **Success**, đọc gần nhất ngày 29/09 và phát hiện đủ **14 URL**. Google Live Test fetch thành công. Trang chủ còn **Discovered - currently not indexed**; yêu cầu index thủ công bị từ chối do daily quota. Kết quả đầy đủ nằm trong [RELEASE-CHECKS.md](RELEASE-CHECKS.md).

Các bước dưới dành cho việc thiết lập lại hoặc quản lý property:

1. Đăng nhập [Search Console](https://search.google.com/search-console/), tạo **URL-prefix** property `https://anh-gon-vn.netlify.app/`.
2. Chọn HTML tag, lấy riêng giá trị `content` của `google-site-verification`. Đây là mã xác minh công khai, không phải mật khẩu.
3. Đặt `GOOGLE_SITE_VERIFICATION` trong build environment hoặc `googleSiteVerification` trong `config/site.json`; redeploy.
4. Verify rồi submit `https://anh-gon-vn.netlify.app/sitemap.xml`.

Sitemap hợp lệ hoặc thông báo submit thành công không đảm bảo Google đã đọc sitemap hay index tất cả URL. Đọc trạng thái fetch riêng với báo cáo Page indexing.

## Giữ chi phí 0

Không bật paid upgrade, auto recharge, Functions, paid analytics, paid API hay mua domain. Xem Usage trên dashboard; Free có quota và site có thể bị pause khi hết quota. Không có image uploads lên server, chỉ static assets/codecs/fonts.

Sau mỗi deploy kiểm tra root, English, 200 KB, HEIC, WebP→JPG, sitemap/robots, real 404 và redirect `/index.html`. Các bước và kết quả gần nhất ở [RELEASE-CHECKS.md](RELEASE-CHECKS.md).
