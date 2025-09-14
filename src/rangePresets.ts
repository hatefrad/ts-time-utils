/**
 * Predefined date range helpers for common time periods
 */

import type { DateRange } from './types.js';

function todayRange(now = new Date()): DateRange {
  const start = new Date(now); start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return { start, end };
}

export function today(now = new Date()): DateRange { return todayRange(now); }
export function yesterday(now = new Date()): DateRange {
  const t = todayRange(now);
  const end = new Date(t.start); // yesterday end equals today start
  const start = new Date(end); start.setDate(start.getDate() - 1);
  return { start, end };
}

export function tomorrow(now = new Date()): DateRange {
  const t = todayRange(now);
  t.start.setDate(t.start.getDate() + 1);
  t.end.setDate(t.end.getDate() + 1);
  return t;
}

export function lastNDays(n: number, now = new Date()): DateRange {
  const end = new Date(now);
  const start = new Date(end); start.setDate(start.getDate() - n);
  return { start, end };
}

export function nextNDays(n: number, now = new Date()): DateRange {
  const start = new Date(now);
  const end = new Date(start); end.setDate(end.getDate() + n);
  return { start, end };
}

export function thisWeek(now = new Date()): DateRange {
  const start = new Date(now);
  const day = start.getDay(); // 0 Sunday
  start.setHours(0,0,0,0);
  start.setDate(start.getDate() - day); // start of week Sunday
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return { start, end };
}

export function lastWeek(now = new Date()): DateRange {
  const w = thisWeek(now);
  w.start.setDate(w.start.getDate() - 7);
  w.end.setDate(w.end.getDate() - 7);
  return w;
}

export function nextWeek(now = new Date()): DateRange {
  const w = thisWeek(now);
  w.start.setDate(w.start.getDate() + 7);
  w.end.setDate(w.end.getDate() + 7);
  return w;
}

export function thisMonth(now = new Date()): DateRange {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export function lastMonth(now = new Date()): DateRange {
  const m = thisMonth(now);
  m.start.setMonth(m.start.getMonth() - 1);
  m.end.setMonth(m.end.getMonth() - 1);
  return m;
}

export function nextMonth(now = new Date()): DateRange {
  const m = thisMonth(now);
  m.start.setMonth(m.start.getMonth() + 1);
  m.end.setMonth(m.end.getMonth() + 1);
  return m;
}

export function thisYear(now = new Date()): DateRange {
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  return { start, end };
}

export function lastYear(now = new Date()): DateRange {
  const y = thisYear(now);
  y.start.setFullYear(y.start.getFullYear() - 1);
  y.end.setFullYear(y.end.getFullYear() - 1);
  return y;
}

export function nextYear(now = new Date()): DateRange {
  const y = thisYear(now);
  y.start.setFullYear(y.start.getFullYear() + 1);
  y.end.setFullYear(y.end.getFullYear() + 1);
  return y;
}

export function rollingWindowDays(days: number, now = new Date()): DateRange {
  const end = new Date(now);
  const start = new Date(end); start.setDate(start.getDate() - days);
  return { start, end };
}

export function quarterRange(now = new Date()): DateRange {
  const q = Math.floor(now.getMonth()/3); // 0-3
  const start = new Date(now.getFullYear(), q*3, 1);
  const end = new Date(now.getFullYear(), q*3 + 3, 1);
  return { start, end };
}

export function lastQuarter(now = new Date()): DateRange {
  const q = quarterRange(now);
  q.start.setMonth(q.start.getMonth() - 3);
  q.end.setMonth(q.end.getMonth() - 3);
  return q;
}

export function nextQuarter(now = new Date()): DateRange {
  const q = quarterRange(now);
  q.start.setMonth(q.start.getMonth() + 3);
  q.end.setMonth(q.end.getMonth() + 3);
  return q;
}

/** Map of preset functions for dynamic access */
export const RANGE_PRESETS = {
  today, yesterday, tomorrow,
  last7Days: (now?: Date) => lastNDays(7, now),
  last30Days: (now?: Date) => lastNDays(30, now),
  next7Days: (now?: Date) => nextNDays(7, now),
  thisWeek, lastWeek, nextWeek,
  thisMonth, lastMonth, nextMonth,
  thisYear, lastYear, nextYear,
  quarter: quarterRange, lastQuarter, nextQuarter,
};
