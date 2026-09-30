import test from 'node:test';
import assert from 'node:assert/strict';
import { targetBytes, formatBytes, normalizeType, outputName, uniqueRecords, validateSettings, encodeIco } from '../assets/js/core.js';
test('upload limits use decimal bytes consistently across KB and MB', () => {
  assert.equal(targetBytes(200, 'KB'), 200000);
  assert.equal(targetBytes(0.2, 'MB'), 200000);
  assert.equal(formatBytes(200000, 'en'), '200 KB');
  assert.ok(204800 > targetBytes(200, 'KB'), '200 KiB must not pass a 200 KB form');
});
test('invalid targets and unsupported units fail before processing', () => {
  for (const value of [0, -1, NaN, Infinity, 'bad']) assert.throws(() => targetBytes(value, 'KB'));
  assert.throws(() => targetBytes(200, 'GB'));
});
test('MIME-less HEIC and TIFF files are detected without mutating readonly File.type', () => {
  assert.equal(normalizeType(Object.freeze({ name:'PHONE.HEIC', type:'' })), 'image/heic');
  assert.equal(normalizeType({ name:'scan.tif', type:'application/octet-stream' }), 'image/tiff');
  assert.equal(normalizeType({ name:'unknown.bin', type:'' }), '');
});
test('output filenames reflect actual MIME and cannot form ZIP paths', () => {
  assert.equal(outputName('holiday.webp', 'image/jpeg'), 'holiday.jpg');
  assert.equal(outputName('../private.png', 'image/webp').includes('/'), false);
  assert.throws(() => outputName('photo.jpg', 'image/heic'));
});
test('ZIP deduplication retains blob/name pairing and handles pre-existing suffixes', () => {
  const records = [ { name:'photo.jpg', blob:'A' }, { name:'photo (1).jpg', blob:'B' }, { name:'PHOTO.jpg', blob:'C' } ];
  const result = uniqueRecords(records);
  assert.deepEqual(result.map(r => r.name), ['photo.jpg','photo (1).jpg','PHOTO (2).jpg']);
  assert.deepEqual(result.map(r => r.blob), ['A','B','C']);
  assert.equal(records[2].name, 'PHOTO.jpg');
});
test('settings reject corrupt local storage values and out-of-range dimensions', () => {
  const valid = { mode:'target', target:200, unit:'KB', quality:80, maxDimension:0, format:'image/jpeg', allowResize:false };
  assert.equal(validateSettings(valid).targetBytes, 200000);
  for (const change of [{ quality:NaN }, { maxDimension:-1 }, { maxDimension:9000 }, { format:'text/html' }, { target:200000 }]) assert.throws(() => validateSettings({ ...valid, ...change }));
});
test('ICO directory points to the embedded PNG and encodes 256 px as zero', async () => {
  const png = new Blob([new Uint8Array([137,80,78,71])], { type:'image/png' });
  const ico = encodeIco(png, 256, 128), data = new DataView(await ico.arrayBuffer());
  assert.equal(ico.type, 'image/x-icon'); assert.equal(ico.size, 26);
  assert.equal(data.getUint16(2, true), 1); assert.equal(data.getUint16(4, true), 1);
  assert.equal(data.getUint8(6), 0); assert.equal(data.getUint8(7), 128);
  assert.equal(data.getUint32(14, true), 4); assert.equal(data.getUint32(18, true), 22);
  assert.throws(() => encodeIco(png, 512, 512));
});

test('clearing an unused target cannot block quality mode, but target mode remains strict', () => {
  const settings = { mode:'quality', target:0, unit:'KB', quality:80, maxDimension:0, format:'image/jpeg', allowResize:false };
  for (const target of [0, '', NaN, 0.1, 200000]) {
    const normalized = validateSettings({ ...settings, target });
    assert.equal(normalized.target, 200);
    assert.equal(normalized.targetBytes, 200000);
    assert.throws(() => validateSettings({ ...settings, mode:'target', target }));
  }
  assert.equal(validateSettings({ ...settings, target:0.5, unit:'MB' }).targetBytes, 500000);
});
