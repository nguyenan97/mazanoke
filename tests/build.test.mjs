import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFileSync(path.join(root, 'dist', name), 'utf8');
const build = context => execFileSync(process.execPath, ['scripts/build-netlify.mjs'], { cwd:root, env:{ ...process.env, CONTEXT:context, SITE_URL:'https://anh-gon-vn.netlify.app' }, stdio:'pipe' });
test('preview is crawlable so noindex can be read, then production is indexable', () => {
  build('deploy-preview');
  assert.match(read('en/index.html'), /name="robots" content="noindex, follow"/);
  assert.match(read('_headers'), /X-Robots-Tag: noindex/);
  assert.doesNotMatch(read('robots.txt'), /Disallow: \//);
  assert.doesNotMatch(read('index.html'), /name="google-site-verification"/);
  build('production');
  assert.match(read('en/index.html'), /name="robots" content="index, follow"/);
  assert.doesNotMatch(read('_headers'), /X-Robots-Tag/);
  const site = JSON.parse(readFileSync(path.join(root, 'config/site.json'), 'utf8'));
  const token = process.env.GOOGLE_SITE_VERIFICATION || site.googleSiteVerification;
  if (token) assert.ok(read('index.html').includes(`name="google-site-verification" content="${token}"`));
  assert.doesNotMatch(read('en/index.html'), /name="google-site-verification"/);
});
test('all fourteen generated pages have unique canonical and bidirectional alternates', () => {
  const report = JSON.parse(read('build-report.json'));
  assert.equal(report.routes.length, 14);
  const canonical = new Set();
  for (const route of report.routes) {
    const html = read(route.slice(1) + 'index.html');
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert.doesNotMatch(html, /\{\{\w+\}\}/);
    const match = html.match(/rel="canonical" href="([^"]+)"/);
    assert.equal(match[1], 'https://anh-gon-vn.netlify.app' + route);
    canonical.add(match[1]);
    const alternates = [...html.matchAll(/rel="alternate" hreflang="(vi|en)" href="([^"]+)"/g)];
    assert.equal(alternates.length, 2);
    for (const [, locale, url] of alternates) {
      const alternate = read(new URL(url).pathname.slice(1) + 'index.html');
      assert.match(alternate, new RegExp(`href="${match[1].replaceAll('.', '\\.')}"`));
      assert.ok(alternate.includes(`<html lang="${locale}">`));
    }
    assert.ok(read('sitemap.xml').includes(`<loc>${match[1]}</loc>`));
    for (const [, asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"#]+)"/g)) assert.ok(existsSync(path.join(root, 'dist', asset)), asset);
  }
  assert.equal(canonical.size, 14);
});
test('initial pages do not load vendor decoders and offline core does not precache them', () => {
  const html = read('index.html'), sw = read('service-worker.js');
  assert.doesNotMatch(html, /<script[^>]+vendor/);
  const core = JSON.parse(sw.match(/const CORE = (\[[^;]+\]);/)[1]);
  assert.ok(core.every(url => !url.includes('/vendor/')));
  assert.ok(core.some(url => /\/assets\/app\/[a-f0-9]+\/app.js/.test(url)));
  assert.doesNotMatch(read('404.html'), /rel="canonical"/);
});
