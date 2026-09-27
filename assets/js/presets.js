// Presets configure the existing controls; they never start a job automatically.
document.querySelectorAll('[data-preset]').forEach(button => {
  button.addEventListener('click', () => {
    if (state.isCompressing) {
      document.getElementById('presetStatus').textContent = 'Chờ xử lý xong hoặc hủy trước khi đổi tùy chỉnh.';
      return;
    }
    setCompressMethod('quality');
    setQuality(80);
    setDimensionMethod('original');
    setConvertMethod('default');
    let message;
    switch (button.dataset.preset) {
      case '200kb':
        setCompressMethod('limitWeight'); setWeightUnit('KB'); setWeight(200, 'KB'); setConvertMethod('image/jpeg');
        message = 'Đã chọn: mục tiêu 200 KB, xuất JPG (không giữ nền trong suốt). Chọn ảnh để bắt đầu.';
        break;
      case 'jpg':
        setConvertMethod('image/jpeg');
        message = 'Đã chọn: xuất JPG, chất lượng 80%. JPG không giữ nền trong suốt.';
        break;
      case 'webp':
        setConvertMethod('image/webp');
        message = 'Đã chọn: xuất WebP, chất lượng 80%. Chọn ảnh để bắt đầu.';
        break;
      case '1200px':
        setDimensionMethod('limit'); setLimitDimensions(1200);
        message = 'Đã chọn: cạnh dài nhất 1200 px, giữ tỷ lệ ảnh. Chọn ảnh để bắt đầu.';
        break;
    }
    selectSubpage('settings');
    document.getElementById('presetStatus').textContent = message;
    document.querySelectorAll('[data-preset]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
});

// A manual edit makes the previous preset label stale.
['click', 'change', 'input'].forEach(eventName => {
  document.querySelector('.image-options-container').addEventListener(eventName, () => {
    document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    document.getElementById('presetStatus').textContent = '';
  });
});
