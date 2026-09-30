# Ảnh Gọn / AnhGon — kế hoạch tăng trưởng miễn phí

Cập nhật 30/09/2026. Kế hoạch này thay thế đề xuất mua custom domain và đặt English ở root. Ràng buộc hiện tại: **không chi tiền**, dùng site Netlify đang có, phát triển dựa trên nhu cầu thực.

## Quyết định về tên, URL và ngôn ngữ

- Tên hiển thị: **Ảnh Gọn** trong tiếng Việt, **AnhGon** trong tiếng Anh. Giữ attribution MAZANOKE/civilblur và GPL-3.0.
- Production: `https://anh-gon-vn.netlify.app/`. URL có dấu gạch và hậu tố `vn` chưa lý tưởng để xây thương hiệu quốc tế, nhưng đủ dùng để kiểm chứng thị trường ở chi phí 0. Không đổi URL đang hoạt động chỉ để ngắn hơn.
- Repository `mazanoke` giữ nguyên để tránh đứt source links và thao tác vận hành; package mới tên `anhgon`. Tên repository không phải nội dung chính người tìm kiếm nhìn thấy.
- Vietnamese ở `/`, English ở `/en/`; mỗi tác vụ có cặp URL riêng, language switcher cùng tác vụ. Không redirect theo IP hoặc ngôn ngữ browser.
- Chưa thêm ngôn ngữ thứ ba. English dùng để kiểm chứng nhu cầu quốc tế; dữ liệu country/query của chính site sẽ quyết định phần mở rộng.

## Bằng chứng thị trường và cách đọc số liệu

Semrush ước tính tháng 8/2026: iLoveIMG **43,78 triệu visits**, TinyPNG **6,78 triệu visits**. Đây là lượt truy cập toàn site, không phải unique users hay số người dùng riêng công cụ nén. Nhu cầu tồn tại và lớn, nhưng không suy ra traffic tương lai của AnhGon. Nguồn: [iLoveIMG](https://www.semrush.com/website/iloveimg.com/overview/), [TinyPNG](https://www.semrush.com/website/tinypng.com/overview/).

Bảng keyword công khai của iLoveIMG cho **India**, tháng 8/2026, ước tính `photo compressor` 823.000, `compress image` 368.000, `webp to jpg` 246.000 searches/tháng. Đây không phải volume toàn cầu. India là giả thuyết thị trường cho nội dung English, không phải kết luận site đã có người dùng ở đó. Chọn thêm WebP→JPG vì tín hiệu nhu cầu cụ thể; chưa mua gói keyword research. [Nguồn bảng keyword](https://www.semrush.com/website/iloveimg.com/overview/).

Ưu tiên người gửi ảnh vào biểu mẫu giới hạn dung lượng, người cần mở ảnh iPhone và người chuẩn bị ảnh cho website. Privacy là lợi ích thật nhưng không độc quyền: [Squoosh](https://squoosh.app/) cũng xử lý trên thiết bị. Khác biệt cần giữ là batch dễ dùng, preset đúng, báo đạt/chưa đạt dung lượng, hướng dẫn theo tác vụ và mobile tốt.

## Phạm vi đã xây dựng

| Tác vụ | Vietnamese | English | Giá trị riêng |
|---|---|---|---|
| Nén ảnh | `/` | `/en/` | Chất lượng, định dạng, resize và batch |
| Mục tiêu 200 KB | `/nen-anh-200kb/` | `/en/compress-image-to-200kb/` | Preset 200.000 bytes; kiểm tra kết quả thực |
| HEIC → JPG | `/heic-sang-jpg/` | `/en/heic-to-jpg/` | Decoder lazy-load, hướng dẫn lấy HEIC gốc |
| Đổi sang WebP | `/doi-anh-sang-webp/` | `/en/convert-to-webp/` | Preset WebP, transparency và kích thước |
| WebP → JPG | `/webp-sang-jpg/` | `/en/webp-to-jpg/` | Tương thích biểu mẫu, nền trắng |

Tổng 10 tool pages và 4 About/Privacy pages. Mỗi trang có HTML static, title/description/H1 riêng, hướng dẫn, giới hạn và FAQ tương ứng. Sample tạo trên browser để người dùng tự kiểm tra, không dùng số before/after cố định cho mọi ảnh.

Canonical tự trỏ, hreflang hai chiều và x-default tới bản English tương ứng; sitemap chỉ chứa URL canonical; URL không tồn tại trả 404. Preview có noindex nhưng vẫn crawlable để bot đọc được noindex. [Google multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## Kiến trúc và chi phí

Node static generator, không có runtime server, database, paid API hoặc analytics SDK. Ảnh xử lý trong browser; metadata EXIF không giữ lại. Decoder HEIC/TIFF, compression và ZIP chỉ tải khi cần; offline download đầy đủ là thao tác chủ động của người dùng. JS/CSS có content hash; ảnh đầu vào không được gửi lên Netlify.

Free hosting vẫn có quota. Netlify Free có hard limit và có thể pause site khi hết quota; không tự bật upgrade/auto recharge. Theo dõi Usage trước khi thêm nội dung hoặc tăng phân phối. [Netlify billing FAQ](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/).

## Bước tiếp theo và tiêu chí quyết định

Baseline review 30/09: Search Console Performance hiện hiển thị 0 clicks, 0 impressions và Queries chưa có dữ liệu; chart mới có ngày 27/09. Chưa đủ dữ liệu để chọn quốc gia hoặc ngôn ngữ bổ sung. Sitemap đã được đọc thành công; ưu tiên kế tiếp là Google crawl/index các trang hiện có. Số liệu này chỉ phản ánh Google Search, không đo direct traffic hay lượt xử lý ảnh.

1. **Search Console:** đã xác minh URL-prefix property bằng HTML tag và submit `/sitemap.xml` ngày 28/09/2026. Review 30/09: sitemap **Success**, phát hiện đủ 14 URL; Google Live Test fetch thành công. Trang chủ **Discovered - currently not indexed**; một yêu cầu index thủ công bị từ chối vì daily quota. Chờ Google crawl/index và dùng Page indexing để chẩn đoán khi có dữ liệu, không submit lặp lại. Token được giữ trong `config/site.json`. Không cần mua domain. Chi tiết trong `RELEASE-CHECKS.md`. [Google verification](https://support.google.com/webmasters/answer/9008080?hl=en).
2. **Sau khi có dữ liệu:** xem index status, query, country, device, impression, click, CTR theo page và locale. Search Console không đo số lượt xử lý ảnh hoặc tỷ lệ download; hiện chưa có telemetry nên không suy diễn conversion rate.
3. **Mỗi lần đánh giá 28 ngày:** ưu tiên page có impression và query đúng ý định nhưng CTR thấp để sửa title/description; page đã có click nhưng hướng dẫn thiếu thì bổ sung ví dụ thật. Page chưa được index cần kiểm tra lý do trước khi thêm page mới. Lịch này là hướng dẫn vận hành, chưa tạo automation.
4. **Nội dung kế tiếp:** resize và PNG→JPG là backlog. Chỉ thêm khi query/review cho thấy nhu cầu và có nội dung riêng. 50/100 KB dùng chung ô mục tiêu trước; không tạo hàng loạt trang chỉ thay con số.
5. **Ngôn ngữ kế tiếp:** chỉ ưu tiên khi có tín hiệu lặp lại từ một thị trường và có khả năng biên tập/kiểm tra bản dịch. Không chọn chỉ vì quốc gia đó đông dân.
6. **Phân phối miễn phí:** repository README và link công cụ; chuẩn bị bài demo cho cộng đồng liên quan. Chỉ gửi/đăng ra cộng đồng khi chủ site chỉ định nơi đăng và cho phép gửi. Không spam backlink.

Không đặt forecast doanh thu, ranking hoặc người dùng khi chưa có dữ liệu. Giai đoạn đầu tối ưu khả năng hoàn tất tác vụ và index đúng; chưa thêm ads, affiliate hay biểu mẫu lấy email.

## Điều kiện phát hành

- Unit/build checks cho bytes, MIME, ZIP pairing, ICO, metadata, route pairing và lazy codecs.
- Browser checks cho download thật, lỗi giữa batch, JPEG alpha, WebP/resize, HEIC, offline, mobile và dark mode.
- Kiểm tra production sau deploy, bao gồm 404, redirect, canonical, sitemap và preset.
- Safari/iOS thật và Docker engine chưa được xác minh trong môi trường hiện tại; không ghi đã pass các môi trường này.

Chi tiết vận hành: [NETLIFY-VI.md](NETLIFY-VI.md). Kết quả kiểm tra: [RELEASE-CHECKS.md](RELEASE-CHECKS.md).
