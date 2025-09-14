/**
 * Interval utilities: operations on time intervals [start, end)
 */

import type { Interval, DateInput } from './types.js';

/** Create an interval ensuring start <= end */
export function createInterval(start: DateInput, end: DateInput): Interval | null {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return null;
  return { start: s, end: e };
}

/** Validate an object is a proper interval */
export function isValidInterval(i: any): i is Interval {
  return !!i && i.start instanceof Date && i.end instanceof Date && !isNaN(i.start) && !isNaN(i.end) && i.start <= i.end;
}

/** Duration of interval in ms */
export function intervalDuration(i: Interval): number {
  return i.end.getTime() - i.start.getTime();
}

/** Whether interval contains date (inclusive start, exclusive end) */
export function intervalContains(i: Interval, date: DateInput): boolean {
  const d = date instanceof Date ? date : new Date(date);
  return d >= i.start && d < i.end;
}

/** Whether two intervals overlap */
export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Intersection of two intervals, or null */
export function intervalIntersection(a: Interval, b: Interval): Interval | null {
  const start = a.start > b.start ? a.start : b.start;
  const end = a.end < b.end ? a.end : b.end;
  return start < end ? { start, end } : null;
}

/** Merge overlapping or touching intervals into a minimal set */
export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  const result: Interval[] = [];
  let current = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next.start <= current.end) { // overlap or touching
      if (next.end > current.end) current.end = next.end;
    } else {
      result.push(current);
      current = { ...next };
    }
  }
  result.push(current);
  return result;
}

/** Subtract interval b from a (can split into 0,1,2 intervals) */
export function subtractInterval(a: Interval, b: Interval): Interval[] {
  if (!intervalsOverlap(a, b)) return [a];
  const parts: Interval[] = [];
  if (b.start > a.start) parts.push({ start: a.start, end: b.start });
  if (b.end < a.end) parts.push({ start: b.end, end: a.end });
  return parts;
}

/** Split an interval into day-boundary intervals (UTC based) */
export function splitIntervalByDay(i: Interval): Interval[] {
  const res: Interval[] = [];
  let cursor = new Date(i.start);
  while (cursor < i.end) {
    const dayEnd = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 1));
    const end = dayEnd < i.end ? dayEnd : i.end;
    res.push({ start: new Date(cursor), end: new Date(end) });
    cursor = end;
  }
  return res;
}

/** Total covered duration of possibly overlapping intervals */
export function totalIntervalCoverage(intervals: Interval[]): number {
  return mergeIntervals(intervals).reduce((sum, i) => sum + intervalDuration(i), 0);
}

/** Normalize array: filter invalid and merge */
export function normalizeIntervals(intervals: (Interval | null | undefined)[]): Interval[] {
  return mergeIntervals(intervals.filter(isValidInterval) as Interval[]);
}
