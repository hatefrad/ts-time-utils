import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type PackageJson = {
  name: string;
};

const rootDir = fileURLToPath(new URL('../..', import.meta.url));
const packageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8')) as PackageJson;

function runNode(args: string[]) {
  return spawnSync(process.execPath, args, {
    cwd: rootDir,
    encoding: 'utf8',
  });
}

describe('built package integration', () => {
  it('loads root and subpath exports from a consumer-style CommonJS script', () => {
    const script = `
      const pkg = require(${JSON.stringify(packageJson.name)});
      const recurrence = require(${JSON.stringify(`${packageJson.name}/recurrence`)});
      const format = require(${JSON.stringify(`${packageJson.name}/format`)});
      const rule = {
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2024-01-01T09:00:00Z'),
        count: 3
      };
      const occurrences = pkg.createRecurrence(rule).getAllOccurrences(3);
      process.stdout.write(JSON.stringify({
        root: typeof pkg.createRecurrence,
        recurrence: typeof recurrence.createRecurrence,
        format: typeof format.formatDateRange,
        first: occurrences[0]?.toISOString(),
        range: format.formatDateRange(occurrences[0], occurrences[2], { separator: ' to ' })
      }));
    `;

    const result = runNode(['-e', script]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout)).toEqual({
      root: 'function',
      recurrence: 'function',
      format: 'function',
      first: '2024-01-01T09:00:00.000Z',
      range: 'Jan 1 to Jan 3, 2024',
    });
  });

  it('loads root and subpath exports from a consumer-style ESM script', () => {
    const script = `
      const pkg = await import(${JSON.stringify(packageJson.name)});
      const parse = await import(${JSON.stringify(`${packageJson.name}/parse`)});
      const dateRange = await import(${JSON.stringify(`${packageJson.name}/dateRange`)});
      const start = parse.parseDate('2025-09-13T14:30:00');
      const range = { start, end: parse.parseDate('2025-09-15T14:30:00') };
      process.stdout.write(JSON.stringify({
        root: typeof pkg.addTime,
        parse: typeof parse.parseDate,
        overlap: dateRange.dateRangeOverlap(range, range)
      }));
    `;

    const result = runNode(['--input-type=module', '-e', script]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout)).toEqual({
      root: 'function',
      parse: 'function',
      overlap: true,
    });
  });
});
