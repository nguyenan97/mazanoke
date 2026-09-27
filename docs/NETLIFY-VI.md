# Ảnh Gọn trên Netlify Free

Bản Việt hóa của MAZANOKE. Xử lý ảnh client-side, không cần database, API key hoặc Functions.

## Site hiện tại

- Production: https://anh-gon-vn.netlify.app/
- Dashboard: https://app.netlify.com/projects/anh-gon-vn
- Site ID: `190d2047-b9db-4f47-ba7e-519f696cfefd`
- Team: `nguyenan6197`, gói Free tại thời điểm tạo ngày 2026-09-27.
- Deploy qua Netlify plugin, build trên Netlify. **Chưa liên kết GitHub continuous deployment**; push repo chưa tự cập nhật production. Muốn bật, liên kết repo `nguyenan97/mazanoke` vào project hiện tại trong Netlify, không tạo project mới.
- Đã kiểm tra production: HTTPS public, Inter, canonical/robots/sitemap, chuyển WebP, tạo ZIP. Browser automation chưa xác nhận lưu file xuống ổ đĩa (download bị hủy trong môi trường kiểm thử).

## Deploy từ GitHub

1. Đăng nhập Netlify, dùng team ở gói **Free**.
2. Add new project → Import an existing project → GitHub → `nguyenan97/mazanoke`.
3. Production branch: `main`. Netlify tự đọc `netlify.toml`:
   - Build command: `node scripts/build-netlify.mjs`
   - Publish directory: `dist`
4. Deploy. Kiểm tra nén ảnh và tải file trên URL HTTPS vừa tạo.

Build không cài dependencies. Netlify cung cấp biến `URL` để sinh canonical và sitemap. Khi dùng custom domain, đặt `SITE_URL=https://domain-cua-ban` rồi redeploy. Deploy preview/branch deploy có `noindex`; production được index.

## Local

Yêu cầu Node.js 22+. Chạy `node scripts/build-netlify.mjs`, sau đó dùng static HTTP server phục vụ `dist/`. Không dùng `file://` để kiểm tra worker/PWA. Local build không có URL sẽ noindex.

## Vận hành

- Theo dõi Usage trong Netlify; không bật paid upgrade hoặc auto recharge nếu muốn giữ chi phí hosting bằng 0.
- Sau khi có domain ổn định, xác minh Google Search Console và gửi `/sitemap.xml`.
- Bản này chưa có quảng cáo/analytics. Chỉ tích hợp khi có tài khoản và mã publisher thực tế; cập nhật thông tin quyền riêng tư khi thay đổi.
- Để tăng traffic, phát triển hướng dẫn có ví dụ ảnh và nội dung riêng; việc deploy hay dịch giao diện không bảo đảm có traffic/doanh thu.
- Giữ LICENSE, attribution và liên kết mã nguồn fork. Thư viện đi kèm có notice riêng tại `docs/ATTRIBUTIONS.md` và `assets/vendor`.
- Tên tạm: Ảnh Gọn. Đổi đồng bộ `index.html`, `manifest.json` và metadata trong `scripts/build-netlify.mjs` khi chọn brand mới.
