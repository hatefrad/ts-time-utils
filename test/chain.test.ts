import { describe, it, expect } from 'vitest';
import { chain, ChainedDate, formatMs } from '../src/chain.js';

describe('chain API', () => {
  describe('chain()', () => {
    it('creates ChainedDate from Date', () => {
      const d = new Date(2025, 0, 15, 10, 30, 0);
      const c = chain(d);
      expect(c).toBeInstanceOf(ChainedDate);
      expect(c.toDate().getTime()).toBe(d.getTime());
    });

    it('creates ChainedDate from string', () => {
      const c = chain('2025-01-15T10:30:00');
      expect(c.year()).toBe(2025);
      expect(c.month()).toBe(1);
      expect(c.day()).toBe(15);
    });

    it('creates ChainedDate from timestamp', () => {
      const ts = new Date(2025, 0, 15).getTime();
      const c = chain(ts);
      expect(c.year()).toBe(2025);
    });

    it('creates ChainedDate for now when no arg', () => {
      const before = Date.now();
      const c = chain();
      const after = Date.now();
      expect(c.valueOf()).toBeGreaterThanOrEqual(before);
      expect(c.valueOf()).toBeLessThanOrEqual(after);
    });
  });

  describe('transformations', () => {
    it('add() adds time immutably', () => {
      const c = chain(new Date(2025, 0, 15));
      const c2 = c.add(1, 'day');
      expect(c2).not.toBe(c);
      expect(c.day()).toBe(15);
      expect(c2.day()).toBe(16);
    });

    it('add() works with various units', () => {
      const base = chain(new Date(2025, 0, 15, 10, 0, 0));
      expect(base.add(1, 'hour').hours()).toBe(11);
      expect(base.add(30, 'minutes').minutes()).toBe(30);
      expect(base.add(1, 'week').day()).toBe(22);
      expect(base.add(1, 'month').month()).toBe(2);
      expect(base.add(1, 'year').year()).toBe(2026);
    });

    it('subtract() subtracts time', () => {
      const c = chain(new Date(2025, 0, 15));
      expect(c.subtract(5, 'days').day()).toBe(10);
    });

    it('startOf() returns start of period', () => {
      const c = chain(new Date(2025, 0, 15, 14, 35, 22));
      expect(c.startOf('day').hours()).toBe(0);
      expect(c.startOf('day').minutes()).toBe(0);
      expect(c.startOf('month').day()).toBe(1);
      expect(c.startOf('year').month()).toBe(1);
      expect(c.startOf('year').day()).toBe(1);
    });

    it('endOf() returns end of period', () => {
      const c = chain(new Date(2025, 0, 15, 14, 35, 22));
      expect(c.endOf('day').hours()).toBe(23);
      expect(c.endOf('day').minutes()).toBe(59);
      expect(c.endOf('month').day()).toBe(31);
    });

    it('set() sets date components', () => {
      const c = chain(new Date(2025, 0, 15));
      const c2 = c.set({ year: 2030, month: 6, day: 20 });
      expect(c2.year()).toBe(2030);
      expect(c2.month()).toBe(6);
      expect(c2.day()).toBe(20);
    });

    it('clone() creates a copy', () => {
      const c = chain(new Date(2025, 0, 15));
      const c2 = c.clone();
      expect(c2).not.toBe(c);
      expect(c2.valueOf()).toBe(c.valueOf());
    });
  });

  describe('chaining', () => {
    it('supports method chaining', () => {
      const c = chain(new Date(2025, 0, 15))
        .add(1, 'day')
        .add(2, 'hours')
        .startOf('hour');

      expect(c.day()).toBe(16);
      expect(c.hours()).toBe(2);
      expect(c.minutes()).toBe(0);
    });

    it('complex chain example', () => {
      const result = chain(new Date(2025, 0, 15))
        .startOf('month')
        .add(1, 'week')
        .endOf('day')
        .format('YYYY-MM-DD');

      expect(result).toBe('2025-01-08');
    });
  });

  describe('formatters', () => {
    it('format() uses pattern string', () => {
      const c = chain(new Date(2025, 0, 15));
      expect(c.format('YYYY-MM-DD')).toBe('2025-01-15');
      expect(c.format('MMM D, YYYY')).toBe('Jan 15, 2025');
    });

    it('formatTime() formats time', () => {
      const c = chain(new Date(2025, 0, 15, 14, 30));
      expect(c.formatTime('24h')).toBe('14:30');
    });

    it('toISOString() returns ISO string', () => {
      const c = chain(new Date(Date.UTC(2025, 0, 15, 12, 0, 0)));
      expect(c.toISOString()).toBe('2025-01-15T12:00:00.000Z');
    });

    it('dayOrdinal() formats day', () => {
      expect(chain(new Date(2025, 0, 1)).dayOrdinal()).toBe('1st');
      expect(chain(new Date(2025, 0, 2)).dayOrdinal()).toBe('2nd');
      expect(chain(new Date(2025, 0, 3)).dayOrdinal()).toBe('3rd');
      expect(chain(new Date(2025, 0, 4)).dayOrdinal()).toBe('4th');
    });
  });

  describe('comparisons', () => {
    it('isValid() checks validity', () => {
      expect(chain(new Date(2025, 0, 15)).isValid()).toBe(true);
      expect(chain(new Date('invalid')).isValid()).toBe(false);
    });

    it('isWeekend()/isWeekday()', () => {
      const sat = chain(new Date(2025, 0, 18)); // Saturday
      const mon = chain(new Date(2025, 0, 20)); // Monday
      expect(sat.isWeekend()).toBe(true);
      expect(sat.isWeekday()).toBe(false);
      expect(mon.isWeekend()).toBe(false);
      expect(mon.isWeekday()).toBe(true);
    });

    it('isBefore()/isAfter()', () => {
      const earlier = chain(new Date(2025, 0, 10));
      const later = chain(new Date(2025, 0, 20));
      expect(earlier.isBefore(later.toDate())).toBe(true);
      expect(earlier.isAfter(later.toDate())).toBe(false);
      expect(later.isBefore(earlier.toDate())).toBe(false);
      expect(later.isAfter(earlier.toDate())).toBe(true);
    });

    it('isBetween()', () => {
      const c = chain(new Date(2025, 0, 15));
      expect(c.isBetween(new Date(2025, 0, 10), new Date(2025, 0, 20))).toBe(true);
      expect(c.isBetween(new Date(2025, 0, 20), new Date(2025, 0, 30))).toBe(false);
    });

    it('isSameDay()', () => {
      const c1 = chain(new Date(2025, 0, 15, 10, 0));
      const c2 = new Date(2025, 0, 15, 22, 0);
      const c3 = new Date(2025, 0, 16);
      expect(c1.isSameDay(c2)).toBe(true);
      expect(c1.isSameDay(c3)).toBe(false);
    });

    it('isSameMonth()/isSameYear()', () => {
      const c = chain(new Date(2025, 0, 15));
      expect(c.isSameMonth(new Date(2025, 0, 1))).toBe(true);
      expect(c.isSameMonth(new Date(2025, 1, 15))).toBe(false);
      expect(c.isSameYear(new Date(2025, 11, 31))).toBe(true);
      expect(c.isSameYear(new Date(2024, 0, 15))).toBe(false);
    });

    it('isLeapYear()', () => {
      expect(chain(new Date(2024, 0, 1)).isLeapYear()).toBe(true);
      expect(chain(new Date(2025, 0, 1)).isLeapYear()).toBe(false);
    });
  });

  describe('getters', () => {
    const c = chain(new Date(2025, 5, 20, 14, 35, 22, 123));

    it('returns date components', () => {
      expect(c.year()).toBe(2025);
      expect(c.month()).toBe(6); // 1-indexed
      expect(c.day()).toBe(20);
      expect(c.hours()).toBe(14);
      expect(c.minutes()).toBe(35);
      expect(c.seconds()).toBe(22);
      expect(c.milliseconds()).toBe(123);
    });

    it('weekday() returns day of week', () => {
      expect(c.weekday()).toBe(5); // Friday
    });

    it('quarter() returns quarter', () => {
      expect(chain(new Date(2025, 0, 15)).quarter()).toBe(1);
      expect(chain(new Date(2025, 3, 15)).quarter()).toBe(2);
      expect(chain(new Date(2025, 6, 15)).quarter()).toBe(3);
      expect(chain(new Date(2025, 9, 15)).quarter()).toBe(4);
    });

    it('daysInMonth() returns days count', () => {
      expect(chain(new Date(2025, 0, 15)).daysInMonth()).toBe(31);
      expect(chain(new Date(2025, 1, 15)).daysInMonth()).toBe(28);
      expect(chain(new Date(2024, 1, 15)).daysInMonth()).toBe(29); // leap year
    });
  });

  describe('diff()', () => {
    it('returns difference in units', () => {
      const a = chain(new Date(2025, 0, 1));
      const b = new Date(2025, 0, 11);
      expect(a.diff(b, 'days', false)).toBe(10);
    });

    it('returns precise difference', () => {
      const a = chain(new Date(2025, 0, 1, 0, 0, 0));
      const b = new Date(2025, 0, 1, 12, 0, 0);
      expect(a.diff(b, 'days', true)).toBe(0.5);
    });
  });

  describe('conversions', () => {
    const c = chain(new Date(2025, 5, 20, 14, 35, 22, 123));

    it('toDate() returns Date', () => {
      const d = c.toDate();
      expect(d).toBeInstanceOf(Date);
      expect(d.getFullYear()).toBe(2025);
    });

    it('valueOf() returns timestamp', () => {
      expect(typeof c.valueOf()).toBe('number');
    });

    it('unix() returns unix timestamp', () => {
      const unix = c.unix();
      expect(unix).toBe(Math.floor(c.valueOf() / 1000));
    });

    it('toArray() returns array', () => {
      const arr = c.toArray();
      expect(arr).toEqual([2025, 6, 20, 14, 35, 22, 123]);
    });

    it('toObject() returns object', () => {
      const obj = c.toObject();
      expect(obj).toEqual({
        year: 2025,
        month: 6,
        day: 20,
        hours: 14,
        minutes: 35,
        seconds: 22,
        milliseconds: 123
      });
    });
  });

  describe('formatMs()', () => {
    it('formats milliseconds', () => {
      const oneDay = 24 * 60 * 60 * 1000;
      expect(formatMs(oneDay)).toContain('day');
    });

    it('works with chain diff', () => {
      const a = chain(new Date(2025, 0, 1));
      const b = new Date(2025, 0, 3);
      const ms = a.diff(b);
      expect(formatMs(ms)).toContain('2');
      expect(formatMs(ms)).toContain('day');
    });
  });

  describe('immutability', () => {
    it('original date is never mutated', () => {
      const original = new Date(2025, 0, 15, 10, 0, 0);
      const originalTime = original.getTime();

      const c = chain(original);
      c.add(1, 'day');
      c.subtract(1, 'month');
      c.startOf('year');
      c.endOf('day');
      c.set({ year: 2030 });

      expect(original.getTime()).toBe(originalTime);
    });

    it('ChainedDate internal state is never mutated', () => {
      const c = chain(new Date(2025, 0, 15));
      const originalValue = c.valueOf();

      c.add(1, 'day');
      c.subtract(1, 'month');

      expect(c.valueOf()).toBe(originalValue);
    });
  });
});
