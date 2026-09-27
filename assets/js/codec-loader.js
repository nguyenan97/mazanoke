const scripts = new Map();
const codecs = {
  compression: ['/assets/vendor/browser-image-compression.js', () => window.imageCompression],
  heic: ['/assets/vendor/heic-to.js', () => window.HeicTo],
  tiff: ['/assets/vendor/utif.js', () => window.UTIF],
  zip: ['/assets/vendor/jszip.js', () => window.JSZip]
};
export function loadCodec(name) {
  const [src, read] = codecs[name];
  if (read()) return Promise.resolve(read());
  if (!scripts.has(src)) {
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src; script.async = true;
      const timer = setTimeout(() => fail(), 45000);
      function fail() { clearTimeout(timer); script.remove(); reject(new Error('codecError')); }
      script.onerror = fail;
      script.onload = () => { clearTimeout(timer); read() ? resolve(read()) : fail(); };
      document.head.append(script);
    });
    scripts.set(src, promise);
    promise.catch(() => scripts.delete(src));
  }
  return scripts.get(src);
}
