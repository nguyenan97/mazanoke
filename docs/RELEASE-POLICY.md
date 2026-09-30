# Release theo đợt, giữ quota Netlify

Yêu cầu chủ site ngày 30/09/2026: hoàn thành plan và kiểm tra trước khi deploy; hạn chế deploy để không hết quota trong tháng. **Đợt này chỉ commit/push, không deploy Netlify.**

## Quy trình mặc định

1. Gom code, nội dung, bản dịch, tài liệu và demo vào một đợt làm việc.
2. Chạy `npm run check`: unit/build checks → production build local → kiểm tra metadata, link nội bộ, hreflang, sitemap, robots và redirects. Không gọi Netlify.
3. Chạy QA browser trên local; kiểm tra các flow thay đổi, download thật, mobile và lỗi console. Các script tại `scripts/qa/` dùng Playwright CLI, không được ship vào site.
4. Nếu sửa Docker, build local và chạy `node scripts/qa/docker-smoke.mjs <image>`. Kiểm tra routes, auth và restart. Không push container lên registry.
5. Cập nhật `RELEASE-CHECKS.md`, ghi chính xác môi trường đã kiểm tra và phần chưa xác minh; commit/push GitHub.
6. Từ working tree sạch, chạy `npm run release:prepare`. Lưu một candidate trong `.netlify/release-candidates/<version>-<commit>/public/`, kèm `release.json` chứa commit, version, origin, dung lượng và SHA-256 từng file. Lệnh không upload hoặc deploy.
7. Khi kết thúc thời gian giữ quota và cần phát hành, kiểm tra quota thực tế của Netlify, chọn candidate đã QA rồi publish **một lần**. Kiểm tra production một lượt sau publish; chỉ deploy lại nếu có lỗi ảnh hưởng người dùng cần sửa.

Không đặt mục tiêu số lần deploy theo một quota giả định. Không bật Git continuous deployment trong giai đoạn này; GitHub push không được tạo Netlify build/preview. Không mua gói, bật auto recharge hoặc trả phí để vượt quota.

## CI miễn phí

`.github/workflows/verify.yml` chạy `npm run check`, browser regression/TIFF và Docker smoke trên standard Ubuntu runner. Repo hiện public; job được chặn trên private fork. CI không có deploy step, Netlify token, lịch chạy định kỳ hay artifact upload. Standard runners cho public repo miễn phí theo [GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Candidate và production là hai trạng thái riêng

- Production hiện tại: version `1f6966c8046c`, deploy `6aba77db68c13400d1c0ae8e` ngày 28/09/2026.
- Candidate tiếp theo: sửa TIFF orientation và Docker CRLF; đã kiểm tra local, giữ lại chưa publish.
- Application version của candidate: `64363715005d`, 43 files / 4,064,985 bytes. Chọn folder theo commit mới nhất đã hoàn tất QA; `release.json` ghi revision chính xác. [CI đã pass](https://github.com/nguyenan97/mazanoke/actions/runs/36723499637).
- Demo/screenshots và tài liệu vận hành chỉ ở GitHub; static generator không đưa chúng vào bundle.
- Safari/iOS thật chưa có thiết bị để kiểm tra. WebKit trên Windows với iPhone emulation là bằng chứng bổ sung, không được ghi thành đã pass thiết bị iPhone thật.

## Lệnh QA browser

```sh
npm run check
npm start
npx --yes --package @playwright/cli playwright-cli -s=qa open http://127.0.0.1:4173/en/ --browser chrome
npx --yes --package @playwright/cli playwright-cli -s=qa run-code --filename scripts/qa/browser-release.js
npx --yes --package @playwright/cli playwright-cli -s=qa run-code --filename scripts/qa/tiff-orientation.js
```

WebKit dùng `--browser webkit --device "iPhone 15"`; cài bằng `playwright-cli install-browser webkit` nếu thiếu. `scripts/qa/offline-heic.js` cần public fixture [libheif examples/example.heic](https://github.com/strukturag/libheif/blob/master/examples/example.heic) tại `output/playwright/example.heic`; fixture không được ship. `capture-demo.js` tạo screenshot bằng sample tại chỗ.
