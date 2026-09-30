import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, infoPages } from '../content/pages.mjs';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const read = file => readFileSync(path.join(root, file), 'utf8');
const report = JSON.parse(read('build-report.json'));
assert.equal(report.production, true, 'Release must be production');
assert.equal(new URL(report.origin).protocol, 'https:', 'Public release requires HTTPS origin');
const expected = [...pages, ...Object.values(infoPages)].flatMap(page => [page.vi.path, page.en.path]);
assert.deepEqual([...report.routes].sort(), [...expected].sort());
const titles = new Set(), descriptions = new Set();
for (const page of [...pages, ...Object.values(infoPages)]) for (const locale of ['vi', 'en']) {
  const route = page[locale].path, html = read(route.slice(1) + 'index.html');
  assert.ok(html.includes(`<html lang="${locale}">`), route + ' language');
  assert.ok(html.includes(`rel="canonical" href="${report.origin}${route}"`), route + ' canonical');
  assert.match(html, /name="robots" content="index, follow"/);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && description && !titles.has(title) && !descriptions.has(description), route + ' unique metadata');
  titles.add(title); descriptions.add(description);
  for (const lang of ['vi', 'en', 'x-default']) {
    const target = page[lang === 'x-default' ? 'en' : lang].path;
    assert.ok(html.includes(`hreflang="${lang}" href="${report.origin}${target}"`), route + ' alternate');
  }
  for (const [, href] of html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)) {
    assert.ok(!href.includes('..') && existsSync(path.join(root, href)), route + ' missing local link ' + href);
  }
}
const sitemap = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(sitemap.sort(), expected.map(route => report.origin + route).sort());
assert.ok(read('robots.txt').includes(`Sitemap: ${report.origin}/sitemap.xml`));
assert.doesNotMatch(read('robots.txt'), /Disallow: \//);
assert.doesNotMatch(read('_headers'), /X-Robots-Tag.*noindex/i);
assert.match(read('404.html'), /name="robots" content="noindex"/);
for (const route of expected) assert.ok(read('_redirects').includes(`${route}index.html ${route} 301!`));
console.log(`Verified production ${report.version}: ${expected.length} pages, metadata, internal links, hreflang, sitemap, robots and redirects.`);
