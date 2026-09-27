# Ảnh Gọn trên Netlify Free

- Production: [anh-gon-vn.netlify.app](https://anh-gon-vn.netlify.app/)
- English: [/en/](https://anh-gon-vn.netlify.app/en/)
- [Dashboard](https://app.netlify.com/projects/anh-gon-vn)
- Site ID: `190d2047-b9db-4f47-ba7e-519f696cfefd`
- Team `nguyenan6197`, Free được kiểm tra ngày 27/09/2026.
- Build: `node scripts/build-netlify.mjs`; publish: `dist`; Node trên Netlify: 22.
- Bản đa ngôn ngữ đã publish và kiểm tra ngày 27/09/2026: deploy `6ab9409fb245cdabc96dc47d`, version `c87034776468`.

## Deploy

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

1. Đăng nhập [Search Console](https://search.google.com/search-console/), tạo **URL-prefix** property `https://anh-gon-vn.netlify.app/`.
2. Chọn HTML tag, lấy riêng giá trị `content` của `google-site-verification`. Đây là mã xác minh công khai, không phải mật khẩu.
3. Đặt `GOOGLE_SITE_VERIFICATION` trong build environment hoặc `googleSiteVerification` trong `config/site.json`; redeploy.
4. Verify rồi submit `https://anh-gon-vn.netlify.app/sitemap.xml`.

Đăng nhập Google là bước của chủ tài khoản. Không đánh dấu hoàn tất xác minh/indexing nếu chưa được Google xác nhận. Sitemap hợp lệ không đảm bảo tất cả URL được index.

## Giữ chi phí 0

Không bật paid upgrade, auto recharge, Functions, paid analytics, paid API hay mua domain. Xem Usage trên dashboard; Free có quota và site có thể bị pause khi hết quota. Không có image uploads lên server, chỉ static assets/codecs/fonts.

Sau mỗi deploy kiểm tra root, English, 200 KB, HEIC, WebP→JPG, sitemap/robots, real 404 và redirect `/index.html`. Các bước và kết quả gần nhất ở [RELEASE-CHECKS.md](RELEASE-CHECKS.md).
