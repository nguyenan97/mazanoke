import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages, infoPages } from '../content/pages.mjs';
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

test('structured data describes the canonical page and matches the visible language breadcrumbs', () => {
  const origin = 'https://anh-gon-vn.netlify.app';
  for (const page of [...pages, ...Object.values(infoPages)]) for (const locale of ['vi', 'en']) {
    const route = page[locale].path, html = read(route.slice(1) + 'index.html');
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1])['@graph'];
    const entry = graph.find(node => ['WebPage', 'AboutPage'].includes(node['@type']));
    assert.equal(entry.url, origin + route);
    assert.equal(entry.inLanguage, locale);
    assert.equal(entry.isPartOf['@id'], origin + '/#website');
    assert.equal(graph.filter(node => node['@type'] === 'WebSite').length, route === '/' ? 1 : 0);
    if (page.id === 'home') continue;
    const breadcrumb = graph.find(node => node['@type'] === 'BreadcrumbList');
    assert.equal(entry.breadcrumb['@id'], breadcrumb['@id']);
    assert.deepEqual(breadcrumb.itemListElement.map(item => [item.position, item.item]), [[1, origin + pages[0][locale].path], [2, origin + route]]);
    assert.ok(html.includes(`class="breadcrumbs"`) && html.includes(`href="${pages[0][locale].path}"`));
    assert.ok(html.includes(`aria-current="page">${breadcrumb.itemListElement[1].name}</span>`));
  }
});

test('task guidance and contextual links are present in HTML before JavaScript runs', () => {
  for (const page of pages) for (const locale of ['vi', 'en']) {
    const html = read(page[locale].path.slice(1) + 'index.html');
    const guidance = html.match(/<section class="task-explainer"[\s\S]+?<\/section>/)?.[0];
    assert.ok(guidance, page.id + ' static guidance');
    const links = [...guidance.matchAll(/href="(\/[^\"]*)"/g)].map(match => match[1]);
    assert.ok(links.length >= 2);
    for (const route of links) {
      assert.equal(route.startsWith('/en/'), locale === 'en');
      assert.ok(existsSync(path.join(root, 'dist', route, 'index.html')));
    }
  }
});

test('initial asset budgets stay bounded and informational pages avoid the processing application', () => {
  const report = JSON.parse(read('build-report.json'));
  const bytes = url => statSync(path.join(root, 'dist', url)).size;
  const modules = report.initialAppFiles.filter(url => url.endsWith('.js'));
  assert.ok(modules.reduce((sum, url) => sum + bytes(url), 0) <= 100_000, 'Initial JavaScript budget: 100 KB uncompressed');
  assert.ok(bytes(report.initialAppFiles.find(url => url.endsWith('/app.css'))) <= 90_000, 'Tool CSS budget: 90 KB uncompressed');
  for (const page of Object.values(infoPages)) for (const locale of ['vi', 'en']) {
    const html = read(page[locale].path.slice(1) + 'index.html');
    assert.doesNotMatch(html, /<script[^>]+src=/);
    assert.match(html, /\/info\.css/);
  }
});

test('Netlify global headers cannot override the generated asset cache policy', () => {
  const config = readFileSync(path.join(root, 'netlify.toml'), 'utf8');
  const global = config.split('[[headers]]').find(block => /for\s*=\s*"\/\*"/.test(block));
  assert.ok(global);
  assert.doesNotMatch(global.replace(/^\s*#.*$/gm, ''), /Cache-Control\s*=/i);
  const headers = read('_headers');
  assert.match(headers, /\/assets\/app\/[a-f0-9]+\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
  assert.match(headers, /\/assets\/fonts\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
});
