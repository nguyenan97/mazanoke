export function targetBytes(value, unit) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || !['KB', 'MB'].includes(unit)) throw new Error('invalidSettings');
  return Math.floor(number * (unit === 'KB' ? 1000 : 1000000));
}
export function formatBytes(bytes, locale = 'en') {
  const unit = bytes >= 1000000 ? 'MB' : bytes >= 1000 ? 'KB' : 'B';
  const value = bytes / (unit === 'MB' ? 1000000 : unit === 'KB' ? 1000 : 1);
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} ${unit}`;
}
export function normalizeType(file) {
  const ext = file.name?.split('.').pop().toLowerCase();
  const types = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', heic:'image/heic', heif:'image/heif', avif:'image/avif', tif:'image/tiff', tiff:'image/tiff', gif:'image/gif', svg:'image/svg+xml', ico:'image/x-icon' };
  return file.type && file.type !== 'application/octet-stream' ? file.type : types[ext] || '';
}
export function outputName(name, mime) {
  const extension = { 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp', 'image/x-icon':'ico', 'image/vnd.microsoft.icon':'ico' }[mime];
  if (!extension) throw new Error('unsupported');
  return `${(name || 'image').replace(/\.[^.]+$/, '').replace(/[\x00-\x1f/\\:*?"<>|]/g, '_') || 'image'}.${extension}`;
}
export function uniqueRecords(records) {
  const used = new Set();
  return records.map(record => {
    const original = record.name;
    const dot = original.lastIndexOf('.');
    const base = dot > 0 ? original.slice(0, dot) : original;
    const ext = dot > 0 ? original.slice(dot) : '';
    let name = original, number = 1;
    while (used.has(name.toLowerCase())) name = `${base} (${number++})${ext}`;
    used.add(name.toLowerCase());
    return { ...record, name };
  });
}
export function validateSettings(settings) {
  let target = Number(settings.target), unit = settings.unit, bytes;
  try { bytes = targetBytes(target, unit); } catch { bytes = NaN; }
  // An unused, hidden target must not block quality-based compression.
  if (settings.mode === 'quality' && (!Number.isFinite(bytes) || bytes < 1000 || bytes > 100000000)) {
    target = 200; unit = 'KB'; bytes = 200000;
  }
  if (!['quality', 'target'].includes(settings.mode) || !['auto','image/jpeg','image/png','image/webp','image/x-icon'].includes(settings.format) || !Number.isFinite(settings.quality) || settings.quality < 1 || settings.quality > 100 || bytes < 1000 || bytes > 100000000 || !Number.isInteger(settings.maxDimension) || settings.maxDimension < 0 || settings.maxDimension > 8000) throw new Error('invalidSettings');
  if (!Number.isFinite(bytes)) throw new Error('invalidSettings');
  return { ...settings, target, unit, targetBytes: bytes };
}
export function encodeIco(png, width, height) {
  if (!width || !height || width > 256 || height > 256) throw new Error('invalidSettings');
  const header = new ArrayBuffer(22), view = new DataView(header);
  view.setUint16(2, 1, true); view.setUint16(4, 1, true);
  view.setUint8(6, width === 256 ? 0 : width); view.setUint8(7, height === 256 ? 0 : height);
  view.setUint16(10, 1, true); view.setUint16(12, 32, true);
  view.setUint32(14, png.size, true); view.setUint32(18, 22, true);
  return new Blob([header, png], { type: 'image/x-icon' });
}
