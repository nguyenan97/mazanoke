import { cp, mkdir, readFile, writeFile, readdir, rm, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages, infoPages } from '../content/pages.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.resolve(root, 'dist');
const site = JSON.parse(await readFile(path.join(root, 'config/site.json'), 'utf8'));
const dictionaries = Object.fromEntries(await Promise.all(site.locales.map(async locale => [locale, JSON.parse(await readFile(path.join(root, `locales/${locale}.json`), 'utf8'))])));
const template = await readFile(path.join(root, 'index.html'), 'utf8');
const origin = new URL(process.env.SITE_URL || process.env.URL || site.productionUrl);
if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Invalid production origin');
const production = process.env.CONTEXT === 'production' || (!process.env.CONTEXT && process.argv.includes('--production'));
const verification = (process.env.GOOGLE_SITE_VERIFICATION || site.googleSiteVerification || '').trim();
if (verification && !/^[A-Za-z0-9_-]{10,256}$/.test(verification)) throw new Error('Invalid Search Console verification token');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const absolute = route => new URL(route, origin).href;
const keys = Object.keys(dictionaries.vi).sort().join('|');
for (const locale of site.locales) if (Object.keys(dictionaries[locale]).sort().join('|') !== keys) throw new Error(`Missing translations in ${locale}`);
const routeSet = new Set();
for (const page of [...pages, ...Object.values(infoPages)]) for (const locale of site.locales) {
  const route = page[locale]?.path;
  if (!route || !/^\/(?:[a-z0-9-]+\/)*$/.test(route) || routeSet.has(route)) throw new Error(`Invalid/duplicate route: ${route}`);
  routeSet.add(route);
}
// Only remove this generated directory; reject symlinks and any path outside the repo.
if (out !== path.join(root, 'dist')) throw new Error('Unsafe build path');
try { if ((await lstat(out)).isSymbolicLink()) throw new Error('dist must not be a symlink'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
await rm(out, { recursive:true, force:true }); await mkdir(out, { recursive:true });
const application = ['app.js','core.js','codec-loader.js','image-engine.js','theme.js'];
const vendors = ['browser-image-compression.js','heic-to.js','utif.js','jszip.js'];
const sources = ['scripts/build-netlify.mjs','index.html','config/site.json','content/pages.mjs','locales/en.json','locales/vi.json','assets/css/app.css','service-worker.js', ...application.map(name => `assets/js/${name}`), ...vendors.map(name => `assets/vendor/${name}`)];
const hash = createHash('sha256');
hash.update(origin.href).update(String(production)).update(verification);
for (const file of sources) hash.update(file).update(await readFile(path.join(root, file)));
const version = hash.digest('hex').slice(0, 12), appBase = `/assets/app/${version}`;
async function save(route, content) { const file = path.join(out, route); await mkdir(path.dirname(file), { recursive:true }); await writeFile(file, content); }
async function copy(source, target = source) { const to = path.join(out, target); await mkdir(path.dirname(to), { recursive:true }); await cp(path.join(root, source), to, { recursive:true }); }
for (const file of application) await copy(`assets/js/${file}`, `assets/app/${version}/${file}`);
await copy('assets/css/app.css', `assets/app/${version}/app.css`);
for (const file of vendors) await copy(`assets/vendor/${file}`);
await copy('assets/fonts/inter');
for (const file of ['apple-touch-icon.png','android-chrome-192x192.png','android-chrome-512x512.png']) await copy(`assets/images/${file}`);
await copy('favicon.ico'); await copy('LICENSE'); await copy('docs/ATTRIBUTIONS.md', 'ATTRIBUTIONS.md');

function tool(messages, entry) {
  const t = key => escape(messages[key]);
  return `<noscript><p class="noscript">${t('noJs')}</p></noscript>
  <div class="workspace">
    <div class="work-area">
      <div><section id="dropzone" class="dropzone" aria-labelledby="drop-title">
        <svg class="upload-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="5" y="7" width="38" height="34" rx="6"/><circle cx="32" cy="17" r="4"/><path d="m6 33 12-14 12 16 6-8 7 9"/></svg>
        <h2 id="drop-title">${t('drop')}</h2><p class="format-list">${t('formats')}</p>
        <input id="files" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,image/tiff,image/gif,image/svg+xml,image/x-icon,.heic,.heif,.tif,.tiff,.ico" multiple aria-label="${t('pick')}" tabindex="-1">
        <button id="choose" class="primary" type="button">${t('pick')}</button><p class="paste-hint">${t('paste')}</p>
      </section><div class="sample-row"><span>${t('sampleHint')}</span><button id="sample" class="text-button">${t('sample')}</button></div></div>
      <div class="status"><div class="status-content"><p id="notice" role="status" aria-live="polite"></p><progress id="progress" max="1" value="0" hidden aria-label="${t('working').replace('{current}', '').replace('{total}', '')}"></progress></div><button id="cancel" class="secondary" hidden>${t('cancel')}</button></div>
      <section class="panel" aria-labelledby="results-title"><div class="panel-heading"><h2 id="results-title">${t('results')}<span id="result-count"></span></h2><div class="result-actions"><button id="clear" class="secondary" disabled>${t('clear')}</button><button id="zip" class="secondary" disabled>${t('zip')}</button></div></div><div id="empty" class="empty-state"><strong>${t('empty')}</strong><p>${t('emptyHint')}</p></div><div id="results-list" class="results-list"></div></section>
    </div>
    <form id="settings-form" class="panel settings"><h2>${t('settings')}</h2><p>${t('settingsHint')}</p><fieldset id="settings-fields"><legend class="visually-hidden">${t('settings')}</legend>
      <div class="field"><label for="mode">${t('method')}</label><select id="mode"><option value="quality">${t('qualityMode')}</option><option value="target">${t('targetMode')}</option></select></div>
      <div class="field"><label for="quality">${t('quality')} <output id="quality-value" for="quality">80%</output></label><input id="quality" type="range" min="1" max="100" value="80"></div>
      <div class="field wide" id="target-field" hidden><label for="target">${t('target')}</label><div class="row"><input class="size-value" id="target" type="number" min="0.001" max="100000" value="200" step="any" inputmode="decimal" aria-describedby="unit-hint"><select class="size-unit" id="unit" aria-label="${t('unit')}"><option>KB</option><option>MB</option></select></div><small id="unit-hint">${t('unitHint')}</small><label class="checkbox"><input type="checkbox" id="allow-resize">${t('resizeToFit')}</label></div>
      <div class="field wide"><label for="format">${t('output')}</label><select id="format"><option value="auto">${t('auto')}</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option><option value="image/x-icon">ICO</option></select><small>${t('formatHint')}</small></div>
      <div class="field wide"><label for="dimensions">${t('dimensions')}</label><input id="dimensions" type="number" min="1" max="8000" placeholder="—" inputmode="numeric"><small>${t('dimensionsHint')}</small></div>
    </fieldset></form>
  </div>
  <div class="offline-tools"><button class="text-button" id="offline">${t('offline')}</button><button class="text-button" id="install" hidden>${t('install')}</button><span id="offline-status" role="status"></span></div>
  <section id="guide" class="guide"><h2>${t('steps')}</h2><ol class="step-grid">${entry.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol><div class="notes"><h3>${t('notes')}</h3><ul>${entry.notes.map(note => `<li>${escape(note)}</li>`).join('')}</ul></div><div class="faq"><h2>${t('faq')}</h2>${entry.faq.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}</div></section>`;
}

async function renderPage(page, locale, info = false) {
  const messages = dictionaries[locale], entry = page[locale], other = locale === 'en' ? 'vi' : 'en';
  const route = entry.path, description = entry.description || entry.paragraphs[0];
  const metadata = `<link rel="canonical" href="${escape(absolute(route))}">\n${site.locales.map(lang => `<link rel="alternate" hreflang="${lang}" href="${escape(absolute(page[lang].path))}">`).join('\n')}\n<link rel="alternate" hreflang="x-default" href="${escape(absolute(page.en.path))}">\n<meta property="og:type" content="website"><meta property="og:url" content="${escape(absolute(route))}"><meta property="og:title" content="${escape(entry.title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'vi_VN'}">${page.id === 'home' && locale === 'vi' ? `<script type="application/ld+json">${json({ '@context':'https://schema.org', '@type':'WebSite', name:site.brand, alternateName:'Ảnh Gọn', url:absolute('/') })}</script>` : ''}`;
  const values = {
    ...Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, escape(value)])),
    locale, title:escape(entry.title), description:escape(description), h1:escape(entry.h1 || entry.title), intro:escape(entry.intro || ''),
    robots:production ? 'index, follow' : 'noindex, follow', metadata:metadata + (production && verification && route === '/' ? `\n<meta name="google-site-verification" content="${escape(verification)}">` : ''),
    body:info ? `<article id="guide" class="article">${entry.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</article>` : tool(messages, entry),
    homeUrl:pages[0][locale].path, aboutUrl:infoPages.about[locale].path, privacyUrl:infoPages.privacy[locale].path,
    sourceUrl:site.sourceUrl, alternateUrl:page[other].path, alternateLocale:other,
    relatedLinks:pages.filter(item => item.id !== page.id).map(item => `<a href="${item[locale].path}">${escape(item[locale].label)}</a>`).join(''),
    manifest:locale === 'en' ? '/en/manifest.json' : '/manifest.json',
    styleUrl:`${appBase}/app.css`, themeUrl:`${appBase}/theme.js`, appUrl:`${appBase}/app.js`,
    pageConfig:json({ locale, id:page.id || 'info', preset:page.preset || {}, messages, preview:!production })
  };
  const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => { if (!(key in values)) throw new Error(`Unknown template key ${key}`); return values[key]; });
  await save(`${route.slice(1)}index.html`, html);
}
for (const page of pages) for (const locale of site.locales) await renderPage(page, locale);
for (const page of Object.values(infoPages)) for (const locale of site.locales) await renderPage(page, locale, true);
for (const locale of site.locales) {
  const en = locale === 'en';
  await save(en ? 'en/manifest.json' : 'manifest.json', JSON.stringify({ name:en ? 'AnhGon — Image tools' : 'Ảnh Gọn — Công cụ ảnh', short_name:dictionaries[locale].brand, id:'/', start_url:en ? '/en/' : '/', scope:'/', lang:locale, display:'standalone', background_color:'#f7f8fb', theme_color:'#f7f8fb', icons:[192,512].map(size => ({ src:`/assets/images/android-chrome-${size}x${size}.png`, sizes:`${size}x${size}`, type:'image/png' })) }, null, 2));
}
await save('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...routeSet].map(route => `<url><loc>${escape(absolute(route))}</loc></url>`).join('')}</urlset>\n`);
await save('robots.txt', `User-agent: *\nAllow: /\n${production ? `Sitemap: ${absolute('/sitemap.xml')}\n` : ''}`);
await save('_redirects', [...routeSet].map(route => `${route}index.html ${route} 301!`).join('\n') + '\n');
await save('_headers', `${production ? '' : '/*\n  X-Robots-Tag: noindex, follow\n'}${appBase}/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
await save('404.html', `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>404 — AnhGon</title><link rel="stylesheet" href="${appBase}/app.css"><main class="shell intro"><h1>404</h1><p>Không tìm thấy trang / Page not found.</p><a href="/">Ảnh Gọn</a> · <a href="/en/">English image tools</a></main></html>`);
const core = ['/', '/en/', ...application.map(file => `${appBase}/${file}`), `${appBase}/app.css`, '/manifest.json', '/en/manifest.json', '/assets/fonts/inter/inter-latin-wght-normal.woff2', '/assets/fonts/inter/inter-vietnamese-wght-normal.woff2', '/favicon.ico', '/assets/images/android-chrome-192x192.png', '/assets/images/android-chrome-512x512.png', '/assets/images/apple-touch-icon.png'];
const offline = [...new Set([...core, ...routeSet, ...vendors.map(file => `/assets/vendor/${file}`)])];
let sw = await readFile(path.join(root, 'service-worker.js'), 'utf8');
sw = sw.replace('__VERSION__', version).replace('__CORE__', JSON.stringify(core)).replace('__OFFLINE__', JSON.stringify(offline));
await save('service-worker.js', sw);
await save('build-report.json', JSON.stringify({ version, production, origin:origin.origin, routes:[...routeSet], initialAppFiles:core.filter(file => file.includes(appBase)), optionalCodecs:vendors }, null, 2));
console.log(`Built ${routeSet.size} pages (${pages.length * site.locales.length} tools), ${production ? 'production' : 'noindex preview'}, version ${version}`);
