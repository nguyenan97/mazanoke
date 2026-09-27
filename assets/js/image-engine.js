import { normalizeType, outputName, encodeIco } from './core.js';
import { loadCodec } from './codec-loader.js';
function checkAbort(signal) { if (signal?.aborted) throw signal.reason || new DOMException('Aborted', 'AbortError'); }
export function openImage(blob, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image(), url = URL.createObjectURL(blob);
    const timer = setTimeout(() => finish(new Error('timeout')), 30000);
    const abort = () => finish(signal.reason || new DOMException('Aborted', 'AbortError'));
    const finish = (error) => {
      clearTimeout(timer); URL.revokeObjectURL(url); signal?.removeEventListener('abort', abort);
      image.onload = image.onerror = null;
      error ? reject(error) : resolve(image);
    };
    image.onload = () => finish(); image.onerror = () => finish(new Error('failed'));
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) { abort(); return; }
    image.src = url;
  });
}
function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('failed')), type, quality));
}
async function preprocess(file, type, signal) {
  checkAbort(signal);
  if (['image/heic','image/heif'].includes(type)) {
    const heic = await loadCodec('heic'); checkAbort(signal);
    return await heic({ blob: file, type: 'image/png', quality: 1 });
  }
  if (type === 'image/tiff') {
    const utif = await loadCodec('tiff'); checkAbort(signal);
    const buffer = await file.arrayBuffer(), first = utif.decode(buffer)[0];
    if (!first || !first.t256 || !first.t257 || first.t256[0] * first.t257[0] > 40000000) throw new Error('tooLarge');
    utif.decodeImage(buffer, first);
    const canvas = document.createElement('canvas');
    canvas.width = first.width; canvas.height = first.height;
    try {
      canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(utif.toRGBA8(first)), first.width, first.height), 0, 0);
      return await canvasBlob(canvas, 'image/png');
    } finally { canvas.width = canvas.height = 1; }
  }
  return file.type === type ? file : new Blob([file], { type });
}
export async function processImage(file, settings, signal, onProgress) {
  const type = normalizeType(file);
  if (!['image/jpeg','image/png','image/webp','image/heic','image/heif','image/avif','image/tiff','image/gif','image/svg+xml','image/x-icon','image/vnd.microsoft.icon'].includes(type)) throw new Error('unsupported');
  if (file.size > 50000000) throw new Error('tooLarge');
  let source = await preprocess(file, type, signal); checkAbort(signal);
  const decoded = await openImage(source, signal); checkAbort(signal);
  if (!decoded.naturalWidth || !decoded.naturalHeight || decoded.naturalWidth * decoded.naturalHeight > 40000000) throw new Error('tooLarge');
  const outputType = settings.format === 'auto' ? (['image/jpeg','image/png','image/webp'].includes(type) ? type : 'image/png') : settings.format;
  const ico = outputType === 'image/x-icon';
  const max = ico ? Math.min(settings.maxDimension || 256, 256) : settings.maxDimension;
  const ratio = max ? Math.min(1, max / Math.max(decoded.naturalWidth, decoded.naturalHeight)) : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(decoded.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(decoded.naturalHeight * ratio));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('tooLarge');
  if (outputType === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(decoded, 0, 0, canvas.width, canvas.height);
  try {
    source = await canvasBlob(canvas, 'image/png'); checkAbort(signal);
    const compress = await loadCodec('compression'); checkAbort(signal);
    const compressType = ico ? 'image/png' : outputType;
    const normalized = new File([source], 'normalized.png', { type:'image/png' });
    let image = await compress(normalized, {
      fileType: compressType, initialQuality: settings.quality / 100,
      maxSizeMB: settings.mode === 'target' ? settings.targetBytes / (1024 * 1024) : Number.POSITIVE_INFINITY,
      maxIteration: 20, alwaysKeepResolution: !(settings.mode === 'target' && settings.allowResize),
      useWebWorker: true, preserveExif: false, signal, onProgress,
      libURL: `${location.origin}/assets/vendor/browser-image-compression.js`
    });
    checkAbort(signal);
    if (image.type !== compressType) throw new Error('unsupported');
    const output = await openImage(image, signal); checkAbort(signal);
    const width = output.naturalWidth, height = output.naturalHeight;
    canvas.width = Math.max(1, Math.round(width * Math.min(1, 120 / Math.max(width, height))));
    canvas.height = Math.max(1, Math.round(height * Math.min(1, 120 / Math.max(width, height))));
    canvas.getContext('2d').drawImage(output, 0, 0, canvas.width, canvas.height);
    const thumbnail = await canvasBlob(canvas, 'image/png');
    if (ico) image = encodeIco(image, width, height);
    checkAbort(signal);
    return { blob:image, thumbnail, width, height, originalBytes:file.size, name:outputName(file.name, image.type), target:settings.mode === 'target' ? settings.targetBytes : null };
  } finally { canvas.width = canvas.height = 1; }
}
