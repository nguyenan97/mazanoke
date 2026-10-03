import { cp, mkdir, readFile, writeFile, readdir, rm, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages, infoPages } from '../content/pages.mjs';
import { icon } from '../assets/js/ui-icons.js';
import { guides } from '../content/guides.mjs';
import { transform } from 'esbuild';
import { compile } from 'sass';
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
const application = ['app.js','core.js','codec-loader.js','image-engine.js','ui-icons.js'];
const vendors = ['browser-image-compression.js','heic-to.js','utif.js','jszip.js'];
const uiLibraries = ['choices.min.css','choices.js'];
const sources = ['scripts/build-netlify.mjs','index.html','package-lock.json','config/site.json','content/pages.mjs','content/guides.mjs','locales/en.json','locales/vi.json','assets/css/app.css','assets/css/pico-theme.scss','assets/js/theme.js','service-worker.js', ...uiLibraries.map(name => `assets/vendor/${name}`), ...application.map(name => `assets/js/${name}`), ...vendors.map(name => `assets/vendor/${name}`)];
const hash = createHash('sha256');
hash.update(origin.href).update(String(production)).update(verification);
for (const file of sources) hash.update(file).update(await readFile(path.join(root, file)));
const version = hash.digest('hex').slice(0, 12), appBase = `/assets/app/${version}`;
async function save(route, content) { const file = path.join(out, route); await mkdir(path.dirname(file), { recursive:true }); await writeFile(file, content); }
async function copy(source, target = source) { const to = path.join(out, target); await mkdir(path.dirname(to), { recursive:true }); await cp(path.join(root, source), to, { recursive:true }); }
async function minify(file, loader) { return (await transform(await readFile(path.join(root, file), 'utf8'), { loader, minify:true, target:'es2022', legalComments:'inline', ...(loader === 'js' ? { format:'esm' } : {}) })).code; }
for (const file of application) await save(`assets/app/${version}/${file}`, await minify(`assets/js/${file}`, 'js'));
await save(`assets/app/${version}/choices.js`, await minify('assets/vendor/choices.js', 'js'));
const pico = compile(path.join(root, 'assets/css/pico-theme.scss'), { loadPaths:[path.join(root, 'node_modules/@picocss/pico/scss')], style:'compressed', quietDeps:true }).css;
const choicesCss = await readFile(path.join(root, 'assets/vendor/choices.min.css'), 'utf8');
const appCss = await readFile(path.join(root, 'assets/css/app.css'), 'utf8');
for (const [name, css] of [['app.css', pico + '\n' + choicesCss + '\n' + appCss], ['info.css', pico + '\n' + appCss]]) await save(`assets/app/${version}/${name}`, (await transform(css, { loader:'css', minify:true, legalComments:'inline' })).code);
const themeInit = (await transform(await readFile(path.join(root, 'assets/js/theme.js'), 'utf8'), { loader:'js', minify:true })).code.replaceAll('</script', '<\\/script');
await copy('assets/vendor/CHOICES-LICENSE', 'assets/licenses/CHOICES-LICENSE');
await copy('assets/vendor/PICO-LICENSE.md', 'assets/licenses/PICO-LICENSE.md');
await copy('assets/vendor/lucide/LICENSE', 'assets/licenses/LUCIDE-LICENSE');
for (const file of vendors) await copy(`assets/vendor/${file}`);
await copy('assets/fonts/inter');
for (const file of ['apple-touch-icon.png','android-chrome-192x192.png','android-chrome-512x512.png']) await copy(`assets/images/${file}`);
await copy('favicon.ico'); await copy('LICENSE'); await copy('docs/ATTRIBUTIONS.md', 'ATTRIBUTIONS.md');

function editorial(page, locale) {
  const guide = guides[page.id]?.[locale];
  if (!guide) return '';
  const table = guide.table ? `<div class="table-scroll"><table><caption>${escape(guide.table.caption)}</caption><thead><tr>${guide.table.headers.map(text => `<th scope="col">${escape(text)}</th>`).join('')}</tr></thead><tbody>${guide.table.rows.map(([first,...rest]) => `<tr><th scope="row">${escape(first)}</th>${rest.map(text => `<td>${escape(text)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  return `<section class="task-explainer" aria-labelledby="example-title"><h2 id="example-title">${escape(guide.heading)}</h2>${guide.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}${table}${guide.subheading ? `<h3>${escape(guide.subheading)}</h3><ul>${guide.tips.map(text => `<li>${escape(text)}</li>`).join('')}</ul>` : ''}${guide.source ? `<p><a href="${escape(guide.source[0])}">${escape(guide.source[1])}</a></p>` : ''}<p class="related-links">${guide.links.map(([id,label]) => `<a href="${pages.find(item => item.id === id)[locale].path}">${escape(label)}</a>`).join('')}</p></section>`;
}
function tool(messages, entry, page, locale) {
  const t = key => escape(messages[key]);
  return `<noscript><p class="noscript">${t('noJs')}</p></noscript>
  <div class="workspace">
    <div class="work-area">
      <div><section id="dropzone" class="dropzone" aria-labelledby="drop-title">
        <div class="upload-mark">${icon('image-up', 'upload-icon')}</div>
        <h2 id="drop-title">${t('drop')}</h2><p class="format-list">${t('formats')}</p>
        <input id="files" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,image/tiff,image/gif,image/svg+xml,image/x-icon,.heic,.heif,.tif,.tiff,.ico" multiple aria-label="${t('pick')}" tabindex="-1">
        <div class="upload-actions"><button id="choose" class="primary" type="button">${icon('upload')}${t('pick')}</button><button id="sample" class="secondary" type="button">${icon('image')}${t('sample')}</button></div><p class="paste-hint">${t('paste')}</p>
      </section><p class="sample-row">${icon('shield-check')}${t('private')}</p></div>
      <div class="status"><div class="status-content"><p id="notice" role="status" aria-live="polite"></p><progress id="progress" max="1" value="0" hidden aria-label="${t('working').replace('{current}', '').replace('{total}', '')}"></progress></div><button id="cancel" class="secondary" hidden>${t('cancel')}</button></div>
      <section class="panel results-panel" aria-labelledby="results-title"><div class="panel-heading"><h2 id="results-title">${icon('images')}${t('results')}<span id="result-count"></span></h2><div class="result-actions"><button id="clear" class="text-button" disabled>${t('clear')}</button><button id="zip" class="secondary" disabled>${icon('archive')}${t('zip')}</button></div></div><div id="empty" class="empty-state">${icon('images', 'empty-icon')}<strong>${t('empty')}</strong><p>${t('emptyHint')}</p></div><div id="results-list" class="results-list"></div></section>
    </div>
    <form id="settings-form" class="panel settings"><h2>${icon('sliders-horizontal')}${t('settings')}</h2><p>${t('settingsHint')}</p><fieldset id="settings-fields"><legend class="visually-hidden">${t('settings')}</legend>
      <div class="field"><label for="mode">${t('method')}</label><select id="mode"><option value="quality">${t('qualityMode')}</option><option value="target">${t('targetMode')}</option></select></div>
      <div class="field"><label for="quality">${t('quality')} <output id="quality-value" for="quality">80%</output></label><input id="quality" type="range" min="1" max="100" value="80"></div>
      <div class="field wide" id="target-field" hidden><label for="target">${t('target')}</label><div class="row"><input class="size-value" id="target" type="number" min="0.001" max="100000" value="200" step="any" inputmode="decimal" aria-describedby="unit-hint"><select class="size-unit" id="unit" aria-label="${t('unit')}"><option>KB</option><option>MB</option></select></div><small id="unit-hint">${t('unitHint')}</small><label class="checkbox"><input type="checkbox" id="allow-resize">${t('resizeToFit')}</label></div>
      <div class="field wide"><label for="format">${t('output')}</label><select id="format"><option value="auto">${t('auto')}</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option><option value="image/x-icon">ICO</option></select><small>${t('formatHint')}</small></div>
      <div class="field wide"><label for="dimensions">${t('dimensions')}</label><input id="dimensions" type="number" min="1" max="8000" placeholder="${t('dimensionsPlaceholder')}" inputmode="numeric"><small>${t('dimensionsHint')}</small></div>
    </fieldset></form>
  </div>
  <div class="offline-tools"><button class="text-button" id="offline">${icon('cloud-download')}${t('offline')}</button><button class="text-button" id="install" hidden>${t('install')}</button><span id="offline-status" role="status"></span></div>
  <section id="guide" class="guide"><h2>${t('steps')}</h2><ol class="step-grid">${entry.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol><div class="notes"><h3>${t('notes')}</h3><ul>${entry.notes.map(note => `<li>${escape(note)}</li>`).join('')}</ul></div>${editorial(page, locale)}<div class="faq"><h2>${t('faq')}</h2>${entry.faq.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}</div></section>`;
}

async function renderPage(page, locale, info = false) {
  const messages = dictionaries[locale], entry = page[locale], other = locale === 'en' ? 'vi' : 'en';
  const route = entry.path, description = entry.description || entry.paragraphs[0];
  const home = pages[0][locale], isHome = page.id === 'home';
  const breadcrumbName = entry.label || entry.title.split('|')[0].trim();
  const graph = [{ '@type':info && page === infoPages.about ? 'AboutPage' : 'WebPage', '@id':absolute(route) + '#page', url:absolute(route), name:entry.title, description, inLanguage:locale, isPartOf:{ '@id':absolute('/') + '#website' }, ...(isHome ? {} : { breadcrumb:{ '@id':absolute(route) + '#breadcrumb' } }) }];
  if (isHome && locale === 'vi') graph.unshift({ '@type':'WebSite', '@id':absolute('/') + '#website', name:site.brand, alternateName:'Ảnh Gọn', url:absolute('/') });
  if (!isHome) graph.push({ '@type':'BreadcrumbList', '@id':absolute(route) + '#breadcrumb', itemListElement:[{ '@type':'ListItem', position:1, name:messages.brand, item:absolute(home.path) }, { '@type':'ListItem', position:2, name:breadcrumbName, item:absolute(route) }] });
  const metadata = `<link rel="canonical" href="${escape(absolute(route))}">\n${site.locales.map(lang => `<link rel="alternate" hreflang="${lang}" href="${escape(absolute(page[lang].path))}">`).join('\n')}\n<link rel="alternate" hreflang="x-default" href="${escape(absolute(page.en.path))}">\n<meta property="og:type" content="website"><meta property="og:url" content="${escape(absolute(route))}"><meta property="og:title" content="${escape(entry.title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:site_name" content="${escape(messages.brand)}"><meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'vi_VN'}"><meta property="og:locale:alternate" content="${locale === 'en' ? 'vi_VN' : 'en_US'}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(entry.title)}"><meta name="twitter:description" content="${escape(description)}"><script type="application/ld+json">${json({ '@context':'https://schema.org', '@graph':graph })}</script>`;
  const values = {
    ...Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, escape(value)])),
    locale, title:escape(entry.title), description:escape(description), h1:escape(entry.h1 || entry.title), intro:escape(entry.intro || ''),
    breadcrumbs:isHome ? '' : `<nav class="breadcrumbs" aria-label="${locale === 'vi' ? 'Đường dẫn trang' : 'Breadcrumb'}"><a href="${home.path}">${escape(messages.brand)}</a><span aria-hidden="true">/</span><span aria-current="page">${escape(breadcrumbName)}</span></nav>`,
    robots:production ? 'index, follow' : 'noindex, follow', metadata:metadata + (production && verification && route === '/' ? `\n<meta name="google-site-verification" content="${escape(verification)}">` : ''),
    body:info ? `<article id="guide" class="article">${entry.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</article>` : tool(messages, entry, page, locale),
    homeUrl:pages[0][locale].path, aboutUrl:infoPages.about[locale].path, privacyUrl:infoPages.privacy[locale].path,
    sourceUrl:site.sourceUrl, alternateUrl:page[other].path, alternateLocale:other,
    taskNavigation:`<nav class="task-nav" aria-label="${escape(messages.tools)}">${pages.map(item => `<a href="${item[locale].path}"${item.id === page.id ? ' aria-current="page"' : ''}>${icon(item.id === 'home' ? 'images' : item.id === '200kb' ? 'target' : 'file-image')}<span>${escape(item[locale].label)}</span></a>`).join('')}</nav>`,
    manifest:locale === 'en' ? '/en/manifest.json' : '/manifest.json',
    styleUrl:`${appBase}/${info ? 'info' : 'app'}.css`, themeInit, appScript:info ? '' : `<script type="module" src="${appBase}/app.js"></script>`,
    fontPreloads:`<link rel="preload" href="/assets/fonts/inter/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>${locale === 'vi' ? '<link rel="preload" href="/assets/fonts/inter/inter-vietnamese-wght-normal.woff2" as="font" type="font/woff2" crossorigin>' : ''}`,
    brandIcon:icon('image','brand-mark'), languageIcon:icon('languages'), themeIcons:icon('moon','icon theme-moon') + icon('sun','icon theme-sun'), trustIcon:icon('shield-check'),
    pageConfig:json({ locale, id:page.id || 'info', preset:page.preset || {}, messages, preview:!production })
  };
  const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => { if (!(key in values)) throw new Error(`Unknown template key ${key}`); return values[key]; });
  await save(`${route.slice(1)}index.html`, html);
}
for (const page of pages) for (const locale of site.locales) await renderPage(page, locale);
for (const page of Object.values(infoPages)) for (const locale of site.locales) await renderPage(page, locale, true);
for (const locale of site.locales) {
  const en = locale === 'en';
  await save(en ? 'en/manifest.json' : 'manifest.json', JSON.stringify({ name:en ? 'AnhGon | Image tools' : 'Ảnh Gọn | Công cụ ảnh', short_name:dictionaries[locale].brand, id:'/', start_url:en ? '/en/' : '/', scope:'/', lang:locale, display:'standalone', background_color:'#f5f8f6', theme_color:'#f5f8f6', icons:[192,512].map(size => ({ src:`/assets/images/android-chrome-${size}x${size}.png`, sizes:`${size}x${size}`, type:'image/png' })) }, null, 2));
}
await save('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...routeSet].map(route => `<url><loc>${escape(absolute(route))}</loc></url>`).join('')}</urlset>\n`);
await save('robots.txt', `User-agent: *\nAllow: /\n${production ? `Sitemap: ${absolute('/sitemap.xml')}\n` : ''}`);
await save('_redirects', [...routeSet].map(route => `${route}index.html ${route} 301!`).join('\n') + '\n');
await save('_headers', `${production ? '' : '/*\n  X-Robots-Tag: noindex, follow\n'}${appBase}/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
await save('404.html', `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>404 | AnhGon</title><link rel="stylesheet" href="${appBase}/info.css"><main class="shell intro"><h1>404</h1><p>Không tìm thấy trang / Page not found.</p><a href="/">Ảnh Gọn</a> · <a href="/en/">English image tools</a></main></html>`);
const core = ['/', '/en/', ...application.map(file => `${appBase}/${file}`), `${appBase}/choices.js`, `${appBase}/app.css`, `${appBase}/info.css`, '/manifest.json', '/en/manifest.json', '/assets/fonts/inter/inter-latin-wght-normal.woff2', '/assets/fonts/inter/inter-vietnamese-wght-normal.woff2', '/favicon.ico', '/assets/images/android-chrome-192x192.png', '/assets/images/android-chrome-512x512.png', '/assets/images/apple-touch-icon.png'];
const offline = [...new Set([...core, ...routeSet, ...vendors.map(file => `/assets/vendor/${file}`)])];
let sw = await readFile(path.join(root, 'service-worker.js'), 'utf8');
sw = sw.replace('__VERSION__', version).replace('__CORE__', JSON.stringify(core)).replace('__OFFLINE__', JSON.stringify(offline));
await save('service-worker.js', sw);
await save('build-report.json', JSON.stringify({ version, production, origin:origin.origin, routes:[...routeSet], initialAppFiles:core.filter(file => file.includes(appBase)), optionalCodecs:vendors }, null, 2));
console.log(`Built ${routeSet.size} pages (${pages.length * site.locales.length} tools), ${production ? 'production' : 'noindex preview'}, version ${version}`);
