import { formatBytes, targetBytes, validateSettings, uniqueRecords } from './core.js';
import { loadCodec } from './codec-loader.js';
const page = JSON.parse(document.getElementById('page-config').textContent);
const $ = id => document.getElementById(id);
const t = (key, values = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), page.messages[key] || key);
let busy = false, zipping = false, controller, registration;
let records = [];
const defaults = { mode:'quality', quality:80, target:200, unit:'KB', format:'auto', maxDimension:0, allowResize:false };
function message(key, values) { if ($('notice')) $('notice').textContent = t(key, values); }
function controls() {
  if (!$('settings-fields')) return;
  $('settings-fields').disabled = busy;
  $('cancel').hidden = !busy;
  $('zip').disabled = busy || zipping || records.length === 0;
  $('clear').disabled = busy || zipping || !$('results-list').children.length;
  $('sample').disabled = busy;
  $('empty').hidden = $('results-list').children.length > 0;
  $('result-count').textContent = records.length ? ` (${records.length})` : '';
}
function readSettings() {
  return validateSettings({ mode:$('mode').value, quality:Number($('quality').value), target:Number($('target').value), unit:$('unit').value, format:$('format').value, maxDimension:Number($('dimensions').value || 0), allowResize:$('allow-resize').checked });
}
function displaySettings(settings) {
  for (const key of ['mode','quality','target','unit','format']) $(key).value = settings[key];
  $('dimensions').value = settings.maxDimension || '';
  $('allow-resize').checked = settings.allowResize;
  updateFields();
}
function updateFields() {
  $('target-field').hidden = $('mode').value !== 'target';
  $('quality-value').textContent = `${$('quality').value}%`;
}
function addError(file, error) {
  const article = document.createElement('article'); article.className = 'result error-result';
  const name = document.createElement('p'); name.className = 'result-name'; name.textContent = file.name;
  const detail = document.createElement('p'); detail.className = 'result-note warning';
  detail.textContent = t(Object.hasOwn(page.messages, error.message) ? error.message : 'failed');
  article.append(name, detail); $('results-list').append(article);
}
function release(record) { URL.revokeObjectURL(record.url); URL.revokeObjectURL(record.preview); }
function addResult(result) {
  result.id = crypto.randomUUID(); result.url = URL.createObjectURL(result.blob); result.preview = URL.createObjectURL(result.thumbnail);
  records.push(result);
  const article = document.createElement('article'); article.className = 'result'; article.dataset.resultId = result.id;
  const image = document.createElement('img'); image.src = result.preview; image.alt = t('previewAlt'); image.width = image.height = 54;
  const text = document.createElement('div');
  const name = document.createElement('p'); name.className = 'result-name'; name.textContent = result.name;
  const meta = document.createElement('p'); meta.className = 'result-meta';
  meta.textContent = `${formatBytes(result.originalBytes, page.locale)} → ${formatBytes(result.blob.size, page.locale)} · ${result.width} × ${result.height} px`;
  const note = document.createElement('p'); note.className = 'result-note';
  if (result.target) {
    note.textContent = result.blob.size <= result.target ? t('targetMet', { size:formatBytes(result.target, page.locale) }) : t('targetMissed');
    note.classList.toggle('warning', result.blob.size > result.target);
  } else {
    const percent = (100 * (1 - result.blob.size / result.originalBytes)).toFixed(1);
    note.textContent = result.blob.size < result.originalBytes ? t('saved', { percent }) : t(result.blob.size === result.originalBytes ? 'unchanged' : 'larger');
    note.classList.toggle('warning', result.blob.size > result.originalBytes);
  }
  text.append(name, meta, note);
  const actions = document.createElement('div'); actions.className = 'result-links';
  const link = document.createElement('a'); link.href = result.url; link.download = result.name; link.textContent = t('download'); link.className = 'download-image';
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'text-button'; remove.textContent = t('remove');
  remove.addEventListener('click', () => { if (busy || zipping) return; release(result); records = records.filter(record => record.id !== result.id); article.remove(); controls(); });
  actions.append(link, remove); article.append(image, text, actions); $('results-list').append(article);
}
async function run(files) {
  if (busy || zipping) { message('busy'); return; }
  files = Array.from(files).filter(Boolean);
  if (!files.length) return;
  if (files.length > 50) { message('batchLimit'); return; }
  let settings;
  try { settings = readSettings(); } catch { message('invalidSettings'); return; }
  if (records.reduce((size, record) => size + record.blob.size, 0) >= 100000000) { message('memoryLimit'); return; }
  busy = true; controller = new AbortController(); controls();
  let success = 0, failed = 0;
  try {
    const { processImage } = await import('./image-engine.js');
    for (let index = 0; index < files.length && !controller.signal.aborted; index++) {
      const file = files[index];
      message('working', { current:index + 1, total:files.length });
      $('progress').hidden = false; $('progress').value = index / files.length;
      const job = new AbortController();
      const cancel = () => job.abort(new DOMException('Aborted', 'AbortError'));
      controller.signal.addEventListener('abort', cancel, { once:true });
      const timer = setTimeout(() => job.abort(new Error('timeout')), 90000);
      let rejectOnAbort;
      try {
        const abortPromise = new Promise((_, reject) => { rejectOnAbort = () => reject(job.signal.reason); job.signal.addEventListener('abort', rejectOnAbort, { once:true }); });
        const result = await Promise.race([processImage(file, settings, job.signal, progress => { if (!job.signal.aborted) $('progress').value = (index + Math.min(progress, 99) / 100) / files.length; }), abortPromise]);
        if (controller.signal.aborted) break;
        if (records.reduce((size, record) => size + record.blob.size, 0) + result.blob.size > 100000000) throw new Error('memoryLimit');
        addResult(result); success++;
      } catch (error) {
        if (controller.signal.aborted) break;
        addError(file, error); failed++;
      } finally {
        clearTimeout(timer); controller.signal.removeEventListener('abort', cancel);
        job.signal.removeEventListener('abort', rejectOnAbort);
      }
      controls();
    }
    message(controller.signal.aborted ? 'cancelled' : 'complete', { success, failed });
  } catch { message('failed'); }
  finally { busy = false; $('progress').hidden = true; $('files').value = ''; controls(); }
}
function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function downloadZip() {
  if (busy || zipping || !records.length) return;
  if (records.reduce((sum, record) => sum + record.blob.size, 0) > 75000000) { message('zipLimit'); return; }
  zipping = true; controls(); message('zipWorking');
  try {
    const JSZip = await loadCodec('zip'); const zip = new JSZip();
    for (const record of uniqueRecords(records)) zip.file(record.name, record.blob);
    const blob = await zip.generateAsync({ type:'blob', compression:'STORE' });
    triggerDownload(blob, 'anhgon-images.zip'); message('complete', { success:records.length, failed:0 });
  } catch { message('zipError'); }
  finally { zipping = false; controls(); }
}
async function sample() {
  if (busy) return;
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 800;
  const ctx = canvas.getContext('2d'), pixels = ctx.createImageData(1200, 800);
  let seed = 437;
  for (let y = 0; y < 800; y++) for (let x = 0; x < 1200; x++) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    const index = (y * 1200 + x) * 4, grain = seed % 24;
    pixels.data[index] = 225 - x / 30 + grain;
    pixels.data[index + 1] = 234 - y / 28 + grain;
    pixels.data[index + 2] = 246 - y / 40;
    pixels.data[index + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  ctx.fillStyle = '#245bd6'; ctx.beginPath(); ctx.arc(875, 350, 200, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f5bd55'; ctx.fillRect(660, 395, 275, 210);
  ctx.fillStyle = '#173456'; ctx.font = 'bold 100px sans-serif'; ctx.fillText('AnhGon', 95, 355);
  ctx.font = '28px sans-serif'; ctx.fillText('1200 × 800 px', 100, 415);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  canvas.width = canvas.height = 1;
  if (blob) await run([new File([blob], 'anhgon-sample.png', { type:'image/png' })]);
}

$('theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark'; document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  try { localStorage.setItem('anhgon-theme', dark ? 'theme-dark' : 'theme-light'); } catch {}
});
if ($('files')) {
  let saved = {};
  try { saved = validateSettings(JSON.parse(localStorage.getItem('anhgon-settings-v2'))); } catch {}
  displaySettings({ ...defaults, ...saved, ...page.preset });
  let previousUnit = $('unit').value;
  $('unit').addEventListener('change', () => {
    try {
      const bytes = targetBytes($('target').value, previousUnit);
      $('target').value = bytes / ($('unit').value === 'KB' ? 1000 : 1000000);
      previousUnit = $('unit').value;
    } catch { $('unit').value = previousUnit; message('invalidSettings'); }
  });
  $('settings-form').addEventListener('input', () => { updateFields(); });
  $('settings-form').addEventListener('change', () => { updateFields(); try { localStorage.setItem('anhgon-settings-v2', JSON.stringify(readSettings())); } catch {} });
  $('settings-form').addEventListener('submit', event => event.preventDefault());
  $('choose').addEventListener('click', () => { if (!busy && !zipping) $('files').click(); else message('busy'); });
  $('files').addEventListener('change', () => run($('files').files));
  $('sample').addEventListener('click', sample);
  $('cancel').addEventListener('click', () => controller?.abort());
  $('zip').addEventListener('click', downloadZip);
  $('clear').addEventListener('click', () => { if (busy || zipping) return; records.forEach(release); records = []; $('results-list').replaceChildren(); $('notice').textContent = ''; controls(); });
  const drop = $('dropzone');
  for (const type of ['dragenter','dragover']) drop.addEventListener(type, event => { event.preventDefault(); drop.classList.add('dragging'); });
  for (const type of ['dragleave','drop']) drop.addEventListener(type, event => { event.preventDefault(); drop.classList.remove('dragging'); });
  drop.addEventListener('drop', event => run(event.dataTransfer.files));
  document.addEventListener('paste', event => {
    const files = [...(event.clipboardData?.items || [])].filter(item => item.kind === 'file' && item.type.startsWith('image/')).map(item => item.getAsFile());
    if (files.length) { event.preventDefault(); run(files); }
  });
  controls();
}
window.addEventListener('pagehide', event => { if (!event.persisted) records.forEach(release); });

let installPrompt;
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; if ($('install')) $('install').hidden = false; });
$('install')?.addEventListener('click', async () => { if (installPrompt) { await installPrompt.prompt(); installPrompt = null; $('install').hidden = true; } });
if ('serviceWorker' in navigator && !page.preview) {
  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('/service-worker.js');
      const show = () => { $('update').hidden = !(registration.waiting && navigator.serviceWorker.controller); };
      show();
      navigator.serviceWorker.addEventListener('controllerchange', show);
      registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', show));
      $('reload').addEventListener('click', () => {
        if (busy || zipping || records.length) { message('update'); return; }
        if (!registration.waiting) { location.reload(); return; }
        $('reload').disabled = true;
        navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once:true });
        registration.waiting.postMessage('SKIP_WAITING');
      });
    } catch {}
  });
}
$('offline')?.addEventListener('click', async () => {
  const button = $('offline'); button.disabled = true; $('offline-status').textContent = t('offlineSaving');
  try {
    if (!registration) throw new Error('offlineFailed');
    const ready = await navigator.serviceWorker.ready;
    const channel = new MessageChannel();
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('offlineFailed')), 120000);
      channel.port1.onmessage = event => { clearTimeout(timer); event.data.ok ? resolve() : reject(new Error('offlineFailed')); };
      ready.active.postMessage('CACHE_OFFLINE', [channel.port2]);
    });
    $('offline-status').textContent = t('offlineReady');
  } catch { $('offline-status').textContent = t('offlineFailed'); }
  finally { button.disabled = false; }
});
