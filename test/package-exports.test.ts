import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type ExportTarget = {
  import?: string;
  require?: string;
  types?: string;
};

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const packageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8')) as {
  name: string;
  main: string;
  module: string;
  types: string;
  exports: Record<string, string | ExportTarget>;
};

const documentedSubpaths = ['.', './format', './plugins', './naturalLanguage'] as const;

function getExportTarget(subpath: string): ExportTarget {
  const target = packageJson.exports[subpath];
  if (!target || typeof target === 'string') {
    throw new Error(`Missing export target for ${subpath}`);
  }
  return target;
}

function resolveBuiltPath(target: string): string {
  return path.join(rootDir, target.replace(/^\.\//, ''));
}

function runNode(args: string[]) {
  return spawnSync(process.execPath, args, {
    cwd: rootDir,
    encoding: 'utf8',
  });
}

describe('package exports', () => {
  it('declares the documented subpath exports in package metadata', () => {
    for (const subpath of documentedSubpaths) {
      expect(packageJson.exports).toHaveProperty(subpath);
      expect(getExportTarget(subpath)).toEqual(
        expect.objectContaining({
          import: expect.any(String),
          require: expect.any(String),
          types: expect.any(String),
        }),
      );
    }
  });

  it('ships the built CJS and ESM entrypoints referenced by package metadata', () => {
    expect(existsSync(resolveBuiltPath(packageJson.main))).toBe(true);
    expect(existsSync(resolveBuiltPath(packageJson.module))).toBe(true);
    expect(existsSync(resolveBuiltPath(packageJson.types))).toBe(true);

    for (const subpath of documentedSubpaths) {
      const target = getExportTarget(subpath);
      expect(existsSync(resolveBuiltPath(target.import!))).toBe(true);
      expect(existsSync(resolveBuiltPath(target.require!))).toBe(true);
      expect(existsSync(resolveBuiltPath(target.types!))).toBe(true);
    }
  });

  it('resolves the documented package entrypoints in raw Node without module-type warnings', () => {
    const cjsRoot = runNode([
      '-e',
      `const pkg = require(${JSON.stringify(packageJson.name)}); process.stdout.write(JSON.stringify({
        formatDuration: typeof pkg.formatDuration,
        chain: typeof pkg.chain
      }));`,
    ]);
    expect(cjsRoot.status).toBe(0);
    expect(cjsRoot.stderr).toBe('');
    expect(JSON.parse(cjsRoot.stdout)).toEqual({
      formatDuration: 'function',
      chain: 'function',
    });

    const cjsFormat = runNode([
      '-e',
      `const pkg = require(${JSON.stringify(`${packageJson.name}/format`)}); process.stdout.write(JSON.stringify({
        formatDuration: typeof pkg.formatDuration,
        sample: pkg.formatDuration(5000)
      }));`,
    ]);
    expect(cjsFormat.status).toBe(0);
    expect(cjsFormat.stderr).toBe('');
    expect(JSON.parse(cjsFormat.stdout)).toEqual({
      formatDuration: 'function',
      sample: '5 seconds',
    });

    const esmNaturalLanguage = runNode([
      '--input-type=module',
      '-e',
      `const pkg = await import(${JSON.stringify(`${packageJson.name}/naturalLanguage`)}); process.stdout.write(JSON.stringify({
        parseNaturalDate: typeof pkg.parseNaturalDate
      }));`,
    ]);
    expect(esmNaturalLanguage.status).toBe(0);
    expect(esmNaturalLanguage.stderr).toBe('');
    expect(JSON.parse(esmNaturalLanguage.stdout)).toEqual({
      parseNaturalDate: 'function',
    });
  });
});
