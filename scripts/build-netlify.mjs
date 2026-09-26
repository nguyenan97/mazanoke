import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
for (const entry of ['index.html', 'assets', 'favicon.ico', 'manifest.json', 'service-worker.js', 'LICENSE']) {
  await cp(path.join(root, entry), path.join(out, entry), { recursive: true });
}
await cp(path.join(root, 'docs/ATTRIBUTIONS.md'), path.join(out, 'ATTRIBUTIONS.md'));
let html = await readFile(path.join(out, 'index.html'), 'utf8');
const rawUrl = process.env.SITE_URL || process.env.URL;
const preview = Boolean(process.env.CONTEXT && process.env.CONTEXT !== 'production');
const escape = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
if (rawUrl) {
  const parsed = new URL(rawUrl);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('SITE_URL must be a public HTTP(S) URL');
  const url = parsed.origin + '/';
  html = html.replace('<!-- deployment-meta -->', `<link rel="canonical" href="${escape(url)}" />\n<meta property="og:url" content="${escape(url)}" />\n<meta property="og:type" content="website" />\n<meta property="og:locale" content="vi_VN" />\n<meta property="og:title" content="Ảnh Gọn — Nén ảnh miễn phí" />\n<meta property="og:description" content="Giảm dung lượng, đổi định dạng ảnh ngay trên thiết bị." />`);
  await writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(url)}</loc></url></urlset>\n`);
  await writeFile(path.join(out, 'robots.txt'), preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${url}sitemap.xml\n`);
} else {
  await writeFile(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  console.log('No SITE_URL/URL: local build, indexing disabled. Netlify provides URL automatically.');
}
if (preview || !rawUrl) html = html.replace('content="index, follow"', 'content="noindex, nofollow"');
await writeFile(path.join(out, 'index.html'), html);
// Content-based cache version ensures a new deployment refreshes the offline app.
const hash = createHash('sha256').update(html);
async function hashAssets(dir) {
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await hashAssets(file); else hash.update(entry.name).update(await readFile(file));
  }
}
await hashAssets(path.join(out, 'assets'));
const swPath = path.join(out, 'service-worker.js');
const sw = await readFile(swPath, 'utf8');
hash.update(sw).update(await readFile(path.join(out, 'manifest.json')));
await writeFile(swPath, sw.replace(/const APP_VERSION = "[^"]+";/, `const APP_VERSION = "vi-${hash.digest('hex').slice(0,12)}";`));
console.log('Built static site in dist/');
