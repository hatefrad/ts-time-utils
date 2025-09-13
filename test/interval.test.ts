import { describe, it, expect } from 'vitest';
import { 
  createInterval, isValidInterval, intervalDuration, intervalContains,
  intervalsOverlap, intervalIntersection, mergeIntervals, subtractInterval,
  splitIntervalByDay, totalIntervalCoverage, normalizeIntervals
} from '../src/interval';

function d(str: string) { return new Date(str); }

describe('interval utilities', () => {
  it('creates valid intervals', () => {
    const i = createInterval('2025-01-01T00:00:00Z','2025-01-02T00:00:00Z');
    expect(i && i.start.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(i && i.end.toISOString()).toBe('2025-01-02T00:00:00.000Z');
  });

  it('rejects invalid intervals', () => {
    expect(createInterval('bad','2025-01-02')).toBeNull();
    expect(createInterval('2025-01-03','2025-01-02')).toBeNull();
  });

  it('validates intervals', () => {
    const i = createInterval('2025-01-01','2025-01-02');
    expect(isValidInterval(i)).toBe(true);
    expect(isValidInterval({ start: new Date('x'), end: new Date() })).toBe(false);
  });

  it('computes duration', () => {
    const i = createInterval('2025-01-01T00:00:00Z','2025-01-01T12:00:00Z')!;
    expect(intervalDuration(i)).toBe(12*60*60*1000);
  });

  it('contains dates', () => {
    const i = createInterval('2025-01-01T00:00:00Z','2025-01-02T00:00:00Z')!;
    expect(intervalContains(i, d('2025-01-01T12:00:00Z'))).toBe(true);
    expect(intervalContains(i, d('2025-01-02T00:00:00Z'))).toBe(false); // exclusive end
  });

  it('detects overlap & intersection', () => {
    const a = createInterval('2025-01-01','2025-01-05')!;
    const b = createInterval('2025-01-04','2025-01-10')!;
    expect(intervalsOverlap(a,b)).toBe(true);
    const inter = intervalIntersection(a,b)!;
    expect(inter.start.toISOString()).toBe('2025-01-04T00:00:00.000Z');
    expect(inter.end.toISOString()).toBe('2025-01-05T00:00:00.000Z');
  });

  it('merges intervals', () => {
    const a = createInterval('2025-01-01','2025-01-03')!;
    const b = createInterval('2025-01-02','2025-01-04')!;
    const c = createInterval('2025-01-10','2025-01-11')!;
    const merged = mergeIntervals([a,b,c]);
    expect(merged.length).toBe(2);
    expect(merged[0].start.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(merged[0].end.toISOString()).toBe('2025-01-04T00:00:00.000Z');
  });

  it('subtracts intervals', () => {
    const a = createInterval('2025-01-01','2025-01-10')!;
    const b = createInterval('2025-01-03','2025-01-05')!;
    const parts = subtractInterval(a,b);
    expect(parts.length).toBe(2);
    expect(parts[0].end.toISOString()).toBe('2025-01-03T00:00:00.000Z');
    expect(parts[1].start.toISOString()).toBe('2025-01-05T00:00:00.000Z');
  });

  it('splits by day', () => {
    const i = createInterval('2025-01-01T00:00:00Z','2025-01-03T06:00:00Z')!;
    const parts = splitIntervalByDay(i);
    expect(parts.length).toBe(3);
    expect(parts[0].start.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(parts[0].end.toISOString()).toBe('2025-01-02T00:00:00.000Z');
    expect(parts[2].end.toISOString()).toBe('2025-01-03T06:00:00.000Z');
  });

  it('total coverage', () => {
    const a = createInterval('2025-01-01','2025-01-05')!;
    const b = createInterval('2025-01-03','2025-01-07')!;
    const total = totalIntervalCoverage([a,b]);
    expect(total).toBe(6 * 24 * 60 * 60 * 1000); // Jan1->Jan7
  });

  it('normalizes intervals', () => {
    const a = createInterval('2025-01-01','2025-01-03');
    const b = createInterval('2025-01-02','2025-01-04');
    const norm = normalizeIntervals([a,b,null,undefined]);
    expect(norm.length).toBe(1);
    expect(norm[0].start.toISOString()).toBe('2025-01-01T00:00:00.000Z');
  });
});
