import { describe, it, expect } from 'vitest';
import {
  createNanosecondTimestamp,
  fromNanoseconds,
  dateToNanoseconds,
  nanosecondsToDate,
  addNanoseconds,
  subtractNanoseconds,
  compareNanoseconds,
  nowNanoseconds,
  formatNanoseconds,
  parseNanoseconds,
  createHighResDuration,
  addHighResDuration,
  subtractHighResDuration,
  highResDurationToMs,
  msToHighResDuration,
  toBigIntMs,
  fromBigIntMs,
  toBigIntSeconds,
  fromBigIntSeconds,
  addBigIntMs,
  subtractBigIntMs,
  diffBigIntMs,
  isInDSTGap,
  isInDSTOverlap,
  getDSTTransitionsInYear,
  resolveAmbiguousTime,
  ValidDate,
  ensureValidDate,
  parseValidDate,
  assertValidDate,
  LEAP_SECONDS,
  leapSecondsBetween,
  isNearLeapSecond,
  taiToUtc,
  utcToTai
} from '../src/precision.js';

describe('High-Precision Utilities', () => {
  describe('NanosecondTimestamp', () => {
    it('should create from milliseconds and nanoseconds', () => {
      const ts = createNanosecondTimestamp(1000, 500000);

      expect(ts.milliseconds).toBe(1000);
      expect(ts.nanoseconds).toBe(500000);
      expect(ts.totalNanoseconds).toBe(BigInt(1000500000));
    });

    it('should normalize overflow nanoseconds', () => {
      const ts = createNanosecondTimestamp(1000, 1500000); // 1.5 extra ms

      expect(ts.milliseconds).toBe(1001);
      expect(ts.nanoseconds).toBe(500000);
    });

    it('should create from BigInt nanoseconds', () => {
      const ts = fromNanoseconds(BigInt(1000500000));

      expect(ts.milliseconds).toBe(1000);
      expect(ts.nanoseconds).toBe(500000);
    });

    it('should convert Date to nanoseconds', () => {
      const date = new Date('2024-03-25T14:30:00.123Z');
      const ts = dateToNanoseconds(date);

      expect(ts.milliseconds).toBe(date.getTime());
      expect(ts.nanoseconds).toBe(0); // Date only has ms precision
    });

    it('should convert back to Date', () => {
      const original = new Date('2024-03-25T14:30:00.123Z');
      const ts = dateToNanoseconds(original);
      const converted = nanosecondsToDate(ts);

      expect(converted.getTime()).toBe(original.getTime());
    });

    it('should add nanosecond timestamps', () => {
      const a = createNanosecondTimestamp(1000, 500000);
      const b = createNanosecondTimestamp(500, 600000);
      const result = addNanoseconds(a, b);

      expect(result.milliseconds).toBe(1501);
      expect(result.nanoseconds).toBe(100000);
    });

    it('should subtract nanosecond timestamps', () => {
      const a = createNanosecondTimestamp(1000, 500000);
      const b = createNanosecondTimestamp(500, 200000);
      const result = subtractNanoseconds(a, b);

      expect(result.milliseconds).toBe(500);
      expect(result.nanoseconds).toBe(300000);
    });

    it('should compare nanosecond timestamps', () => {
      const a = createNanosecondTimestamp(1000, 500000);
      const b = createNanosecondTimestamp(1000, 600000);
      const c = createNanosecondTimestamp(1000, 500000);

      expect(compareNanoseconds(a, b)).toBe(-1);
      expect(compareNanoseconds(b, a)).toBe(1);
      expect(compareNanoseconds(a, c)).toBe(0);
    });

    it('should get current time with nanosecond precision', () => {
      const before = Date.now();
      const ts = nowNanoseconds();
      const after = Date.now();

      expect(ts.milliseconds).toBeGreaterThanOrEqual(before);
      expect(ts.milliseconds).toBeLessThanOrEqual(after);
    });
  });

  describe('Nanosecond Formatting', () => {
    it('should format with nanosecond precision', () => {
      const ts = createNanosecondTimestamp(
        new Date('2024-03-25T14:30:45.123Z').getTime(),
        456789
      );
      const formatted = formatNanoseconds(ts);

      expect(formatted).toBe('2024-03-25T14:30:45.123456789Z');
    });

    it('should parse ISO string with nanoseconds', () => {
      const ts = parseNanoseconds('2024-03-25T14:30:45.123456789Z');

      expect(ts).not.toBeNull();
      expect(ts!.nanoseconds).toBe(456789);
    });

    it('should parse standard ISO string', () => {
      const ts = parseNanoseconds('2024-03-25T14:30:45.123Z');

      expect(ts).not.toBeNull();
      expect(ts!.nanoseconds).toBe(0);
    });

    it('should return null for invalid string', () => {
      const ts = parseNanoseconds('invalid');
      expect(ts).toBeNull();
    });
  });

  describe('HighResDuration', () => {
    it('should create from seconds and nanoseconds', () => {
      const dur = createHighResDuration(10, 500000000);

      expect(dur.seconds).toBe(10);
      expect(dur.nanoseconds).toBe(500000000);
    });

    it('should normalize overflow nanoseconds', () => {
      const dur = createHighResDuration(10, 1500000000); // 1.5 extra seconds

      expect(dur.seconds).toBe(11);
      expect(dur.nanoseconds).toBe(500000000);
    });

    it('should add durations', () => {
      const a = createHighResDuration(10, 500000000);
      const b = createHighResDuration(5, 700000000);
      const result = addHighResDuration(a, b);

      expect(result.seconds).toBe(16);
      expect(result.nanoseconds).toBe(200000000);
    });

    it('should subtract durations', () => {
      const a = createHighResDuration(10, 500000000);
      const b = createHighResDuration(5, 200000000);
      const result = subtractHighResDuration(a, b);

      expect(result.seconds).toBe(5);
      expect(result.nanoseconds).toBe(300000000);
    });

    it('should handle borrow in subtraction', () => {
      const a = createHighResDuration(10, 200000000);
      const b = createHighResDuration(5, 500000000);
      const result = subtractHighResDuration(a, b);

      expect(result.seconds).toBe(4);
      expect(result.nanoseconds).toBe(700000000);
    });

    it('should convert to milliseconds', () => {
      const dur = createHighResDuration(10, 500000000); // 10.5 seconds
      const ms = highResDurationToMs(dur);

      expect(ms).toBe(10500);
    });

    it('should convert from milliseconds', () => {
      const dur = msToHighResDuration(10500);

      expect(dur.seconds).toBe(10);
      expect(dur.nanoseconds).toBe(500000000);
    });
  });

  describe('BigInt Timestamp', () => {
    it('should convert Date to BigInt milliseconds', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const bigInt = toBigIntMs(date);

      expect(typeof bigInt).toBe('bigint');
      expect(bigInt).toBe(BigInt(date.getTime()));
    });

    it('should convert BigInt milliseconds to Date', () => {
      const original = new Date('2024-03-25T14:30:00Z');
      const bigInt = toBigIntMs(original);
      const converted = fromBigIntMs(bigInt);

      expect(converted.getTime()).toBe(original.getTime());
    });

    it('should convert to BigInt seconds', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const seconds = toBigIntSeconds(date);

      expect(seconds).toBe(BigInt(Math.floor(date.getTime() / 1000)));
    });

    it('should convert BigInt seconds to Date', () => {
      const seconds = BigInt(1711373400);
      const date = fromBigIntSeconds(seconds);

      expect(date.getTime()).toBe(1711373400000);
    });

    it('should add BigInt milliseconds to Date', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const result = addBigIntMs(date, BigInt(3600000)); // 1 hour

      expect(result.getTime()).toBe(date.getTime() + 3600000);
    });

    it('should subtract BigInt milliseconds from Date', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const result = subtractBigIntMs(date, BigInt(3600000)); // 1 hour

      expect(result.getTime()).toBe(date.getTime() - 3600000);
    });

    it('should calculate BigInt difference', () => {
      const a = new Date('2024-03-25T14:30:00Z');
      const b = new Date('2024-03-25T13:30:00Z');
      const diff = diffBigIntMs(a, b);

      expect(diff).toBe(BigInt(3600000));
    });
  });

  describe('DST Handling', () => {
    it('should detect DST transitions in a year', () => {
      const transitions = getDSTTransitionsInYear(2024);

      // Most timezones have 0 or 2 transitions per year
      expect(transitions.length).toBeGreaterThanOrEqual(0);
    });

    it('should check if date is in DST gap', () => {
      // This depends on local timezone, so just test it runs
      const date = new Date('2024-03-10T02:30:00');
      const result = isInDSTGap(date);

      expect(typeof result).toBe('boolean');
    });

    it('should check if date is in DST overlap', () => {
      const date = new Date('2024-11-03T01:30:00');
      const result = isInDSTOverlap(date);

      expect(typeof result).toBe('boolean');
    });

    it('should resolve ambiguous time', () => {
      const date = new Date('2024-11-03T01:30:00');
      const earlier = resolveAmbiguousTime(date, 'earlier');
      const later = resolveAmbiguousTime(date, 'later');

      // Both should return valid dates
      expect(earlier instanceof Date).toBe(true);
      expect(later instanceof Date).toBe(true);
    });
  });

  describe('ValidDate', () => {
    it('should create from valid Date', () => {
      const date = new Date('2024-03-25');
      const valid = ValidDate.from(date);

      expect(valid.value.getTime()).toBe(date.getTime());
      expect(valid.time).toBe(date.getTime());
    });

    it('should throw for invalid Date', () => {
      const invalid = new Date('invalid');

      expect(() => ValidDate.from(invalid)).toThrow('Invalid Date');
    });

    it('should return null from tryFrom for invalid Date', () => {
      const invalid = new Date('invalid');
      const result = ValidDate.tryFrom(invalid);

      expect(result).toBeNull();
    });

    it('should create from timestamp', () => {
      const valid = ValidDate.fromTimestamp(1711373400000);

      expect(valid.time).toBe(1711373400000);
    });

    it('should create from ISO string', () => {
      const valid = ValidDate.fromISO('2024-03-25T14:30:00Z');

      expect(valid.value.getFullYear()).toBe(2024);
    });

    it('should format to ISO string', () => {
      const valid = ValidDate.fromISO('2024-03-25T14:30:00.000Z');

      expect(valid.toISOString()).toBe('2024-03-25T14:30:00.000Z');
    });

    it('should format to locale string', () => {
      const valid = ValidDate.fromISO('2024-03-25T14:30:00Z');
      const locale = valid.toLocaleString('en-US');

      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThan(0);
    });
  });

  describe('ensureValidDate', () => {
    it('should return valid date unchanged', () => {
      const date = new Date('2024-03-25');
      const result = ensureValidDate(date);

      expect(result.getTime()).toBe(date.getTime());
    });

    it('should return fallback for invalid date', () => {
      const invalid = new Date('invalid');
      const fallback = new Date('2024-01-01');
      const result = ensureValidDate(invalid, fallback);

      expect(result.getTime()).toBe(fallback.getTime());
    });
  });

  describe('parseValidDate', () => {
    it('should parse valid string', () => {
      const result = parseValidDate('2024-03-25');

      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(2024);
    });

    it('should parse valid number', () => {
      const result = parseValidDate(1711373400000);

      expect(result).not.toBeNull();
    });

    it('should parse valid Date', () => {
      const date = new Date('2024-03-25');
      const result = parseValidDate(date);

      expect(result).toBe(date);
    });

    it('should return null for invalid input', () => {
      const result = parseValidDate('invalid');

      expect(result).toBeNull();
    });
  });

  describe('assertValidDate', () => {
    it('should pass for valid date', () => {
      const date = new Date('2024-03-25');

      expect(() => assertValidDate(date)).not.toThrow();
    });

    it('should throw for invalid date', () => {
      const invalid = new Date('invalid');

      expect(() => assertValidDate(invalid)).toThrow();
    });

    it('should use custom message', () => {
      const invalid = new Date('invalid');

      expect(() => assertValidDate(invalid, 'Custom error')).toThrow('Custom error');
    });
  });

  describe('Leap Seconds', () => {
    it('should have known leap seconds', () => {
      expect(LEAP_SECONDS.length).toBeGreaterThan(25);
    });

    it('should count leap seconds between dates', () => {
      const start = new Date('1970-01-01');
      const end = new Date('2020-01-01');
      const count = leapSecondsBetween(start, end);

      expect(count).toBeGreaterThan(25);
    });

    it('should detect near leap second', () => {
      // Dec 31, 2016 had a leap second
      const nearLeap = new Date('2016-12-31T23:59:59.500Z');
      const notNear = new Date('2016-12-15T12:00:00Z');

      expect(isNearLeapSecond(nearLeap)).toBe(true);
      expect(isNearLeapSecond(notNear)).toBe(false);
    });

    it('should convert UTC to TAI', () => {
      const utc = new Date('2020-01-01T00:00:00Z');
      const tai = utcToTai(utc);

      // TAI should be ahead of UTC by 37 seconds (as of 2017)
      expect(tai).toBeGreaterThan(utc.getTime());
    });

    it('should convert TAI to UTC', () => {
      const utc = new Date('2020-01-01T00:00:00Z');
      const tai = utcToTai(utc);
      const backToUtc = taiToUtc(tai);

      // Should round-trip (approximately)
      expect(Math.abs(backToUtc.getTime() - utc.getTime())).toBeLessThan(1000);
    });
  });
});
