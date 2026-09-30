import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = readdirSync(path.join(root, 'tests')).filter(file => file.endsWith('.test.mjs')).sort().map(file => `tests/${file}`);
if (!files.length) throw new Error('No tests discovered');
// Explicit files avoid directory/glob differences between Node versions and shells.
execFileSync(process.execPath, ['--test', ...files], { cwd:root, stdio:'inherit' });
