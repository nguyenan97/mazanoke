// Editorial content is rendered into HTML; none of it depends on client-side JS.
export const guides = {
  home: {
    vi: { heading:'Chọn cách giảm dung lượng phù hợp', paragraphs:[
      'Nếu biểu mẫu chỉ nhận ảnh dưới một giới hạn cụ thể, dùng chế độ theo dung lượng. Nếu bạn chuẩn bị ảnh cho website, bắt đầu với chất lượng 80% và chiều tối đa bằng kích thước hiển thị cần thiết, rồi kiểm tra kết quả.',
      'Dung lượng file và kích thước ảnh khác nhau: KB/MB là số bytes lưu trữ; pixel quyết định chiều rộng và cao. Giảm pixel giúp giảm dung lượng nhưng có thể khiến chữ nhỏ khó đọc. Giữ bản gốc và xem ảnh ở kích thước sử dụng thực tế trước khi tải.'
    ], links:[['200kb','Chuẩn bị ảnh dưới 200 KB'],['webp','Tạo WebP cho website'],['heic','Mở ảnh HEIC từ iPhone']] },
    en: { heading:'Choose the right way to reduce an image', paragraphs:[
      'For a form with a specific upload limit, use file-size mode. For a website, start at 80% quality and limit the dimensions to the size you need to display, then inspect the result.',
      'File size and image dimensions are different: KB/MB describe stored bytes, while pixels describe width and height. Fewer pixels can reduce the file size, but small text may become harder to read. Keep the original and check the output at its intended display size.'
    ], links:[['200kb','Prepare an image under 200 KB'],['webp','Make WebP images for a website'],['heic','Open iPhone HEIC photos']] }
  },
  '200kb': {
    vi: { heading:'Ví dụ nén ảnh xuống 200 KB', paragraphs:[
      'Ảnh mẫu do công cụ tạo có kích thước 1200 × 800 px. Trong lượt kiểm tra browser với chất lượng 80%, đầu ra JPG và không giảm pixel, dung lượng giảm từ khoảng 725,97 KB xuống 120,72 KB: kết quả nằm dưới giới hạn 200.000 bytes.',
      'Đây là kết quả đo trên ảnh mẫu, không phải tỷ lệ giảm đảm bảo cho ảnh của bạn. Ảnh có nhiều chi tiết hoặc nhiễu thường khó nén hơn; encoder của mỗi browser cũng có thể cho kết quả khác nhau.'
    ], table:{ caption:'Một lượt kiểm tra với ảnh mẫu của công cụ', headers:['Thông số','Ảnh gốc','Kết quả'], rows:[['Định dạng','PNG','JPG'],['Kích thước','1200 × 800 px','1200 × 800 px'],['Dung lượng xấp xỉ','725,97 KB','120,72 KB'],['Giới hạn của biểu mẫu','200.000 bytes','Đạt mục tiêu']] }, subheading:'Nếu ảnh vẫn vượt giới hạn', tips:[
      'Chọn JPG hoặc WebP thay vì PNG cho ảnh chụp. PNG phù hợp khi cần giữ đồ họa hoặc nền trong suốt.',
      'Bật cho phép giảm kích thước, nhưng đối chiếu yêu cầu pixel của biểu mẫu trước. Giới hạn dung lượng không thay thế yêu cầu chiều rộng, chiều cao hoặc tỷ lệ.',
      'Thêm lại ảnh để áp dụng tùy chỉnh mới. Kết quả đã xử lý giữ nguyên setting của lần trước.',
      'Với giới hạn 100 KB hoặc 50 KB, nhập trực tiếp con số mới; luôn dùng nhãn đạt mục tiêu để kiểm tra.'
    ], links:[['home','Nén theo chất lượng và resize ảnh'],['webp','Chuyển ảnh sang WebP']] },
    en: { heading:'An example of compressing an image to 200 KB', paragraphs:[
      'The tool generates a 1200 × 800 px sample image. In a browser check at 80% quality, with JPG output and no pixel reduction, its size went from about 725.97 KB to 120.72 KB: below the 200,000-byte limit.',
      'This is a measured sample result, not a promised reduction for your images. Detailed or noisy images can be harder to compress, and different browser encoders may produce different sizes.'
    ], table:{ caption:'One check using the tool’s generated sample', headers:['Property','Original','Result'], rows:[['Format','PNG','JPG'],['Dimensions','1200 × 800 px','1200 × 800 px'],['Approximate size','725.97 KB','120.72 KB'],['Form upload limit','200,000 bytes','Within target']] }, subheading:'If the image is still too large', tips:[
      'Use JPG or WebP rather than PNG for photos. PNG is useful for graphics or transparency.',
      'Allow smaller dimensions, but check the form’s pixel requirements first. A size limit does not replace requirements for width, height or aspect ratio.',
      'Add the image again after changing settings. Existing results retain the settings used to create them.',
      'For a 100 KB or 50 KB limit, enter that number directly and check the result’s within-target label.'
    ], links:[['home','Compress by quality and resize images'],['webp','Convert images to WebP']] }
  },
  heic: {
    vi: { heading:'Lấy đúng file HEIC và kiểm tra ảnh JPG', paragraphs:[
      'Trên iPhone, việc chia sẻ hoặc chọn ảnh từ Photos có thể tạo một bản JPG trước khi công cụ nhận file. Nếu muốn kiểm tra bộ giải mã HEIC, chọn file gốc có đuôi .heic hoặc .heif từ ứng dụng Files.',
      'Sau khi chuyển, mở JPG và kiểm tra hướng xoay, khuôn mặt, chữ nhỏ và các vùng sáng. Công cụ tạo ảnh tĩnh, không giữ chuyển động Live Photo hoặc metadata EXIF; không thay thế bản gốc nếu bạn cần chỉnh sửa về sau.'
    ], subheading:'Ví dụ kiểm tra bằng file HEIC công khai', tips:[
      'Fixture example.heic của libheif có dung lượng 718.114 bytes. Lượt kiểm tra bộ giải mã cho đầu ra JPG 1280 × 854 px.',
      'JPG có thể lớn hơn hoặc nhỏ hơn HEIC. Chuyển định dạng nhằm tương thích với ứng dụng; kiểm tra dung lượng thật nếu cần gửi vào biểu mẫu.',
      'Nếu browser thiếu bộ nhớ, thử từng file trước và giới hạn chiều tối đa. Lần đầu cần mạng để tải decoder; lưu công cụ offline khi còn kết nối.'
    ], source:['https://github.com/strukturag/libheif/blob/master/examples/example.heic','File thử nghiệm công khai của libheif'], links:[['200kb','Giảm JPG xuống mục tiêu 200 KB'],['webp','Tạo bản WebP cho website']] },
    en: { heading:'Choose the original HEIC and inspect the JPG', paragraphs:[
      'Sharing or selecting an image from iPhone Photos may create a JPG before the tool receives the file. To test HEIC decoding, select an original .heic or .heif file from Files.',
      'Open the converted JPG and check orientation, faces, small text and highlights. The tool creates a still image and does not keep Live Photo motion or EXIF metadata; keep the original for future editing.'
    ], subheading:'A check with a public HEIC file', tips:[
      'The libheif example.heic fixture is 718,114 bytes. A decoder check produced a JPG measuring 1280 × 854 px.',
      'A JPG may be larger or smaller than its HEIC source. Conversion improves compatibility; check the actual file size when preparing it for a form.',
      'If browser memory is limited, start with one file and set a maximum dimension. First use needs a connection to download the decoder; save offline tools while connected.'
    ], source:['https://github.com/strukturag/libheif/blob/master/examples/example.heic','Public libheif test file'], links:[['200kb','Reduce the JPG to a 200 KB target'],['webp','Make a WebP copy for a website']] }
  },
  webp: {
    vi: { heading:'Dùng WebP đúng kích thước trên website', paragraphs:[
      'Một ảnh 1200 × 800 px có thể thu về 300 × 200 px khi đặt chiều tối đa 300. Tỷ lệ được giữ nguyên. Với ảnh mẫu của công cụ ở chất lượng 80%, lượt kiểm tra này cho WebP khoảng 4,26 KB; đó là kết quả riêng của ảnh mẫu.',
      'Chọn chiều tối đa theo khu vực hiển thị và độ nét cần thiết trên màn hình mật độ cao. Kiểm tra ảnh trên cả nền sáng và tối nếu nguồn có transparency. So sánh dung lượng JPG và WebP thực tế trước khi chọn file.'
    ], links:[['home','So sánh chất lượng và dung lượng'],['webp-jpg','Đổi WebP thành JPG để gửi biểu mẫu']] },
    en: { heading:'Use WebP at the dimensions your website needs', paragraphs:[
      'A 1200 × 800 px image becomes 300 × 200 px when the maximum dimension is 300, preserving its aspect ratio. At 80% quality, this check produced a roughly 4.26 KB WebP from the tool’s sample; this result is specific to that sample.',
      'Choose dimensions for the display area and sharpness you need on high-density screens. Inspect transparent images against both light and dark backgrounds. Compare the actual JPG and WebP sizes before choosing a file.'
    ], links:[['home','Compare quality and file size'],['webp-jpg','Convert WebP to JPG for a form']] }
  },
  'webp-jpg': {
    vi: { heading:'Chuyển WebP sang JPG và xử lý nền trong suốt', paragraphs:[
      'Đổi tên đuôi .webp thành .jpg không tạo file JPG hợp lệ. Công cụ giải mã ảnh WebP rồi encode JPG; tên kết quả và MIME đi theo định dạng thật.',
      'JPG không có alpha. Vùng trong suốt sẽ được ghép lên nền trắng, nên hãy kiểm tra logo, viền và bóng đổ trước khi dùng. Nếu cần giữ nền trong suốt, chọn PNG hoặc giữ WebP. File JPG có thể lớn hơn nguồn; nếu biểu mẫu có giới hạn, dùng chế độ theo dung lượng.'
    ], links:[['200kb','Chuẩn bị JPG dưới 200 KB'],['webp','Giữ WebP cho ảnh website']] },
    en: { heading:'Convert WebP to JPG and handle transparency', paragraphs:[
      'Renaming .webp to .jpg does not create a valid JPG. The tool decodes the WebP and encodes JPG data; the output filename and MIME follow the actual format.',
      'JPG has no alpha channel. Transparent areas are placed on white, so inspect logos, edges and shadows before using the image. Choose PNG or retain WebP when transparency matters. The JPG may be larger than the source; use file-size mode for a form with an upload limit.'
    ], links:[['200kb','Prepare a JPG below 200 KB'],['webp','Keep WebP for website images']] }
  }
};
