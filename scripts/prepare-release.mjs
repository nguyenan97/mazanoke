import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd:root, encoding:'utf8' }).trim();
if (git('status', '--porcelain')) throw new Error('Commit all source changes before preparing a release.');
const revision = git('rev-parse', 'HEAD');
execFileSync(process.execPath, ['scripts/check.mjs'], { cwd:root, stdio:'inherit' });
const build = JSON.parse(readFileSync(path.join(root, 'dist/build-report.json'), 'utf8'));
const target = path.join(root, '.netlify', 'release-candidates', `${build.version}-${revision.slice(0, 7)}`);
// A candidate is immutable. Preparing the same revision twice must not overwrite it.
mkdirSync(target, { recursive:true });
mkdirSync(path.join(target, 'public'));
cpSync(path.join(root, 'dist'), path.join(target, 'public'), { recursive:true });
const files = [];
function inventory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes:true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) inventory(file);
    else {
      const bytes = readFileSync(file);
      files.push({ path:path.relative(path.join(target, 'public'), file).split(path.sep).join('/'), bytes:bytes.length,
        sha256:createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
inventory(path.join(target, 'public'));
const manifest = { revision, version:build.version, origin:build.origin, createdAt:new Date().toISOString(),
  deployment:'HELD — local candidate only; no Netlify API or deploy command was executed',
  routes:build.routes, totalBytes:files.reduce((sum, file) => sum + file.bytes, 0), files };
writeFileSync(path.join(target, 'release.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared local candidate: ${target}\n${files.length} files, ${manifest.totalBytes} bytes. No deployment performed.`);
