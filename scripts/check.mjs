import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
for (const args of [['--test', 'tests'], ['scripts/build-netlify.mjs'], ['scripts/verify-build.mjs']]) {
  execFileSync(process.execPath, args, { cwd:root, stdio:'inherit',
    env:{ ...process.env, CONTEXT:'production' } });
}
