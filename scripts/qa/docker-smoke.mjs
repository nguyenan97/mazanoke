import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pages, infoPages } from '../../content/pages.mjs';
const image = process.argv[2] || 'mazanoke-anhgon';
const docker = (...args) => execFileSync('docker', args, { encoding:'utf8', stdio:['ignore','pipe','pipe'] }).trim();
const routes = [...pages, ...Object.values(infoPages)].flatMap(page => [page.vi.path, page.en.path]);
const containers = [];
async function start(auth = false) {
  const name = `anhgon-qa-${process.pid}-${auth ? 'auth' : 'public'}`;
  docker('run', '-d', '--rm', '--name', name, '-p', '127.0.0.1::80',
    ...(auth ? ['-e', 'USERNAME=qa-fixture', '-e', 'PASSWORD=local-disposable-fixture'] : []), image);
  containers.push(name);
  const port = docker('port', name, '80').match(/127\.0\.0\.1:(\d+)/)?.[1];
  assert.ok(port, 'Docker must bind only to loopback');
  const origin = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { if ((await fetch(origin)).status === (auth ? 401 : 200)) return { origin, name }; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error('Container did not become ready: ' + docker('logs', name));
}
try {
  const { origin } = await start();
  let asset;
  for (const route of routes) {
    const response = await fetch(origin + route), html = await response.text();
    assert.equal(response.status, 200, route);
    assert.match(html, /name="robots" content="noindex, follow"/);
    asset ||= html.match(/src="([^\"]+app\.js)"/)?.[1];
  }
  assert.ok(asset);
  for (const file of [asset, '/robots.txt', '/sitemap.xml', '/manifest.json']) assert.equal((await fetch(origin + file)).status, 200, file);
  assert.equal((await fetch(origin + '/qa-missing/')).status, 404);
  const redirect = await fetch(origin + '/en/index.html', { redirect:'manual' });
  assert.equal(redirect.status, 301); assert.equal(new URL(redirect.headers.get('location'), origin).pathname, '/en/');
  const auth = await start(true);
  const headers = { Authorization:'Basic ' + Buffer.from('qa-fixture:local-disposable-fixture').toString('base64') };
  const protectedFiles = ['/', '/en/', '/robots.txt', '/sitemap.xml', asset];
  async function checkAuth() {
    for (const file of protectedFiles) {
      assert.equal((await fetch(auth.origin + file)).status, 401, 'unprotected ' + file);
      assert.equal((await fetch(auth.origin + file, { headers })).status, 200, 'auth failed ' + file);
    }
  }
  await checkAuth(); docker('restart', auth.name);
  // An ephemeral host port can be reallocated when Docker Desktop restarts a container.
  const restartedPort = docker('port', auth.name, '80').match(/127\.0\.0\.1:(\d+)/)?.[1];
  assert.ok(restartedPort); auth.origin = `http://127.0.0.1:${restartedPort}`;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { if ((await fetch(auth.origin)).status === 401) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await checkAuth();
  console.log('Docker smoke passed: 14 routes, assets, noindex, 404, 301, auth on all paths and restart.');
} finally {
  for (const name of containers) { try { docker('rm', '-f', name); } catch {} }
}
