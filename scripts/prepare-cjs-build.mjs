import { readdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const requirePattern = /require\("\.\/([^"]+)\.js"\)/g;

for (const file of readdirSync(distDir)) {
  if (!file.endsWith('.js')) continue;
  renameSync(path.join(distDir, file), path.join(distDir, file.replace(/\.js$/, '.cjs')));
}

for (const file of readdirSync(distDir)) {
  if (!file.endsWith('.cjs')) continue;
  const filePath = path.join(distDir, file);
  const contents = readFileSync(filePath, 'utf8');
  writeFileSync(filePath, contents.replace(requirePattern, 'require("./$1.cjs")'));
}
