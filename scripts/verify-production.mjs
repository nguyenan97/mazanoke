import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pages, infoPages } from '../content/pages.mjs';

const config = JSON.parse(readFileSync(new URL('../config/site.json', import.meta.url), 'utf8'));
const origin = new URL(config.productionUrl).origin;
assert.equal(new URL(origin).protocol, 'https:');
const entries = [...pages, ...Object.values(infoPages)].flatMap(page =>
  ['vi', 'en'].map(locale => ({ page, locale, route: page[locale].path })));
const expectedUrls = entries.map(({ route }) => origin + route).sort();
const results = [], assets = new Set(), titles = new Set(), descriptions = new Set();
let version;

async function request(route, options = {}) {
  return fetch(origin + route, { signal: AbortSignal.timeout(30_000), ...options });
}

async function check(label, action) {
  try {
    await action();
    results.push({ check: label, passed: true });
  } catch (error) {
    results.push({ check: label, passed: false, error: error.message });
  }
}

for (const { page, locale, route } of entries) {
  await check(route, async () => {
    const response = await request(route, { redirect: 'manual' });
    assert.equal(response.status, 200, 'HTTP status');
    assert.match(response.headers.get('content-type') || '', /text\/html/i);
    assert.doesNotMatch(response.headers.get('x-robots-tag') || '', /noindex|none/i);
    const html = await response.text();
    assert.ok(html.includes(`<html lang="${locale}">`), 'HTML language');
    assert.ok(html.includes(`rel="canonical" href="${origin}${route}"`), 'Self canonical');
    assert.match(html, /name="robots" content="index, follow"/);
    assert.equal((html.match(/<h1>/g) || []).length, 1, 'Single H1');
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && !titles.has(title), 'Unique title');
    assert.ok(description && !descriptions.has(description), 'Unique description');
    titles.add(title); descriptions.add(description);
    for (const lang of ['vi', 'en', 'x-default']) {
      const target = page[lang === 'x-default' ? 'en' : lang].path;
      assert.ok(html.includes(`hreflang="${lang}" href="${origin}${target}"`), `${lang} alternate`);
    }
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] || '{}')['@graph'];
    assert.ok(Array.isArray(graph), 'Structured data graph');
    const webpage = graph.find(node => ['WebPage', 'AboutPage'].includes(node['@type']));
    assert.equal(webpage?.url, origin + route, 'Structured canonical');
    assert.equal(webpage?.inLanguage, locale, 'Structured language');
    if (pages.includes(page)) assert.match(html, /class="task-explainer"/, 'Static editorial guide');
    if (route === '/') {
      assert.ok(html.includes(`name="google-site-verification" content="${config.googleSiteVerification}"`), 'Ownership tag');
    }
    for (const [, asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"#?]+)"/g)) assets.add(asset);
  });
}

await check('sitemap.xml', async () => {
  const response = await request('/sitemap.xml', { redirect: 'manual' });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /xml/i);
  const urls = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort();
  assert.deepEqual(urls, expectedUrls);
});
await check('robots.txt', async () => {
  const response = await request('/robots.txt');
  assert.equal(response.status, 200);
  const robots = await response.text();
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.doesNotMatch(robots, /^\s*Disallow:\s*\/(?:\s|$)/m);
});
await check('build-report.json', async () => {
  const response = await request('/build-report.json');
  assert.equal(response.status, 200);
  const report = await response.json();
  assert.equal(report.production, true);
  assert.equal(report.origin, origin);
  assert.deepEqual(report.routes.map(route => origin + route).sort(), expectedUrls);
  assert.match(report.version, /^[a-f0-9]{12}$/);
  version = report.version;
});
await check('unknown route returns 404', async () => {
  const response = await request('/__anhgon_verification_missing_page__/', { redirect: 'manual' });
  assert.equal(response.status, 404);
  assert.match(await response.text(), /name="robots" content="noindex"/);
});
for (const { route } of entries) await check(`${route}index.html redirect`, async () => {
  const response = await request(`${route}index.html`, { redirect: 'manual' });
  assert.equal(response.status, 301);
  assert.equal(new URL(response.headers.get('location'), origin).href, origin + route);
});
for (const asset of assets) await check(`asset ${asset}`, async () => {
  const response = await request(asset, { method: 'HEAD', redirect: 'manual' });
  assert.equal(response.status, 200);
  assert.doesNotMatch(response.headers.get('content-type') || '', /text\/html/i);
});

const checkedAt = new Date().toISOString();
const report = { checkedAt, origin, version, routes: entries.length, results };
const output = fileURLToPath(new URL('../output/verification/', import.meta.url));
mkdirSync(output, { recursive: true });
writeFileSync(output + 'production-latest.json', JSON.stringify(report, null, 2) + '\n');
const failures = results.filter(result => !result.passed);
for (const failure of failures) console.error(`FAIL ${failure.check}: ${failure.error}`);
console.log(`Production ${version || 'unknown'}: ${results.length - failures.length}/${results.length} checks passed, ${entries.length} pages. Report: output/verification/production-latest.json`);
if (failures.length) process.exitCode = 1;
