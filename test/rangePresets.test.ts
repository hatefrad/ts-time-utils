import { describe, it, expect } from 'vitest';
import {
  today, yesterday, tomorrow,
  lastNDays, nextNDays,
  thisWeek, lastWeek, nextWeek,
  thisMonth, lastMonth, nextMonth,
  thisYear, lastYear, nextYear,
  quarterRange, lastQuarter, nextQuarter,
  RANGE_PRESETS
} from '../src/rangePresets';

function ms(d: Date) { return d.getTime(); }

const ref = new Date('2025-09-13T10:20:30Z');

describe('range presets', () => {
  it('today range', () => {
    const r = today(ref);
    expect(r.end.getDate() - r.start.getDate()).toBe(1);
  });

  it('yesterday', () => {
    const r = yesterday(ref);
    // end should align exactly with start of today
    expect(r.end.getTime()).toBe(today(ref).start.getTime());
  });

  it('last N days', () => {
    const r = lastNDays(5, ref);
    expect(ms(r.end) - ms(r.start)).toBeGreaterThan(0);
  });

  it('this week length', () => {
    const r = thisWeek(ref);
    expect((ms(r.end) - ms(r.start)) / (1000*60*60*24)).toBe(7);
  });

  it('month boundaries', () => {
    const r = thisMonth(ref);
    expect(r.start.getDate()).toBe(1);
  });

  it('year boundaries', () => {
    const r = thisYear(ref);
    expect(r.start.getMonth()).toBe(0);
  });

  it('quarter range', () => {
    const r = quarterRange(ref);
    expect(r.start.getMonth() % 3).toBe(0);
  });

  it('range presets map', () => {
    const r = RANGE_PRESETS.today(ref);
    expect(r.start <= ref && r.end >= ref).toBe(true);
  });
});
