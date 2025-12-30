import { describe, it, expect } from 'vitest';
import {
  toPlainDate,
  toPlainTime,
  toPlainDateTime,
  toZonedDateTime,
  toInstant,
  createDuration,
  parseDuration,
  nowInstant,
  nowPlainDateTime,
  nowPlainDate,
  nowPlainTime,
  nowZonedDateTime,
  fromTemporal
} from '../src/temporal.js';

describe('Temporal API Compatibility', () => {
  describe('PlainDate', () => {
    it('should create from Date', () => {
      const date = new Date('2024-03-25');
      const plain = toPlainDate(date);

      expect(plain.year).toBe(2024);
      expect(plain.month).toBe(3);
      expect(plain.day).toBe(25);
    });

    it('should create from components', () => {
      const plain = toPlainDate(2024, 3, 25);

      expect(plain.year).toBe(2024);
      expect(plain.month).toBe(3);
      expect(plain.day).toBe(25);
    });

    it('should provide computed properties', () => {
      const plain = toPlainDate(2024, 3, 25); // Monday

      expect(plain.dayOfWeek).toBe(1); // Monday = 1 (ISO)
      expect(plain.dayOfYear).toBeGreaterThan(80);
      expect(plain.weekOfYear).toBeGreaterThan(12);
      expect(plain.daysInMonth).toBe(31);
      expect(plain.daysInYear).toBe(366); // 2024 is leap year
      expect(plain.monthsInYear).toBe(12);
      expect(plain.inLeapYear).toBe(true);
    });

    it('should serialize to ISO string', () => {
      const plain = toPlainDate(2024, 3, 5);
      expect(plain.toString()).toBe('2024-03-05');
      expect(plain.toJSON()).toBe('2024-03-05');
    });

    it('should compare dates', () => {
      const a = toPlainDate(2024, 3, 1);
      const b = toPlainDate(2024, 3, 15);

      expect(a.equals(toPlainDate(2024, 3, 1))).toBe(true);
      expect(a.equals(b)).toBe(false);
      expect(a.compare(b)).toBeLessThan(0);
      expect(b.compare(a)).toBeGreaterThan(0);
    });

    it('should add duration', () => {
      const plain = toPlainDate(2024, 3, 25);
      const added = plain.add({ days: 7 });

      expect(added.year).toBe(2024);
      expect(added.month).toBe(4);
      expect(added.day).toBe(1);
    });

    it('should subtract duration', () => {
      const plain = toPlainDate(2024, 3, 25);
      const subtracted = plain.subtract({ months: 1 });

      expect(subtracted.month).toBe(2);
    });

    it('should calculate until/since', () => {
      const a = toPlainDate(2024, 3, 1);
      const b = toPlainDate(2024, 3, 15);

      const until = a.until(b);
      expect(until.days).toBe(14);

      const since = b.since(a);
      expect(since.days).toBe(14);
    });

    it('should modify with .with()', () => {
      const plain = toPlainDate(2024, 3, 25);
      const modified = plain.with({ month: 12 });

      expect(modified.year).toBe(2024);
      expect(modified.month).toBe(12);
      expect(modified.day).toBe(25);
    });

    it('should convert to Date', () => {
      const plain = toPlainDate(2024, 3, 25);
      const date = plain.toDate();

      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2); // 0-indexed
      expect(date.getDate()).toBe(25);
    });
  });

  describe('PlainTime', () => {
    it('should create from Date', () => {
      const date = new Date('2024-03-25T14:30:45.123');
      const time = toPlainTime(date);

      expect(time.hour).toBe(14);
      expect(time.minute).toBe(30);
      expect(time.second).toBe(45);
      expect(time.millisecond).toBe(123);
    });

    it('should create from components', () => {
      const time = toPlainTime(14, 30, 45, 123);

      expect(time.hour).toBe(14);
      expect(time.minute).toBe(30);
      expect(time.second).toBe(45);
      expect(time.millisecond).toBe(123);
    });

    it('should serialize to string', () => {
      expect(toPlainTime(14, 30, 45).toString()).toBe('14:30:45');
      expect(toPlainTime(14, 30, 45, 123).toString()).toBe('14:30:45.123');
      expect(toPlainTime(9, 5, 0).toString()).toBe('09:05:00');
    });

    it('should compare times', () => {
      const a = toPlainTime(10, 0);
      const b = toPlainTime(14, 30);

      expect(a.equals(toPlainTime(10, 0, 0, 0))).toBe(true);
      expect(a.compare(b)).toBeLessThan(0);
    });

    it('should add and subtract time', () => {
      const time = toPlainTime(10, 30);
      const added = time.add({ hours: 2, minutes: 45 });

      expect(added.hour).toBe(13);
      expect(added.minute).toBe(15);
    });

    it('should wrap around midnight', () => {
      const time = toPlainTime(23, 0);
      const added = time.add({ hours: 3 });

      expect(added.hour).toBe(2);
    });

    it('should modify with .with()', () => {
      const time = toPlainTime(14, 30);
      const modified = time.with({ hour: 9 });

      expect(modified.hour).toBe(9);
      expect(modified.minute).toBe(30);
    });
  });

  describe('PlainDateTime', () => {
    it('should create from Date', () => {
      const date = new Date('2024-03-25T14:30:45.123');
      const dt = toPlainDateTime(date);

      expect(dt.year).toBe(2024);
      expect(dt.month).toBe(3);
      expect(dt.day).toBe(25);
      expect(dt.hour).toBe(14);
      expect(dt.minute).toBe(30);
      expect(dt.second).toBe(45);
      expect(dt.millisecond).toBe(123);
    });

    it('should create from components', () => {
      const dt = toPlainDateTime(2024, 3, 25, 14, 30);

      expect(dt.year).toBe(2024);
      expect(dt.month).toBe(3);
      expect(dt.day).toBe(25);
      expect(dt.hour).toBe(14);
      expect(dt.minute).toBe(30);
    });

    it('should serialize to ISO string', () => {
      const dt = toPlainDateTime(2024, 3, 25, 14, 30, 0);
      expect(dt.toString()).toBe('2024-03-25T14:30:00');
    });

    it('should extract PlainDate and PlainTime', () => {
      const dt = toPlainDateTime(2024, 3, 25, 14, 30);
      const date = dt.toPlainDate();
      const time = dt.toPlainTime();

      expect(date.year).toBe(2024);
      expect(time.hour).toBe(14);
    });

    it('should calculate until/since', () => {
      const a = toPlainDateTime(2024, 3, 25, 10, 0);
      const b = toPlainDateTime(2024, 3, 25, 14, 30);

      const until = a.until(b);
      expect(until.hours).toBe(4);
      expect(until.minutes).toBe(30);
    });

    it('should add duration', () => {
      const dt = toPlainDateTime(2024, 3, 25, 23, 0);
      const added = dt.add({ hours: 3 });

      expect(added.day).toBe(26);
      expect(added.hour).toBe(2);
    });
  });

  describe('ZonedDateTime', () => {
    it('should create from Date and timezone', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const zdt = toZonedDateTime(date, 'America/New_York');

      expect(zdt.timeZone).toBe('America/New_York');
      expect(zdt.epochMilliseconds).toBe(date.getTime());
    });

    it('should get date parts in timezone', () => {
      const date = new Date('2024-03-25T18:00:00Z');
      const zdt = toZonedDateTime(date, 'America/Los_Angeles');

      // 6PM UTC = 11AM PDT
      expect(zdt.hour).toBe(11);
    });

    it('should convert to PlainDate/Time/DateTime', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const zdt = toZonedDateTime(date, 'UTC');

      const plainDate = zdt.toPlainDate();
      const plainTime = zdt.toPlainTime();
      const plainDateTime = zdt.toPlainDateTime();

      expect(plainDate.year).toBe(2024);
      expect(plainTime.hour).toBe(14);
      expect(plainDateTime.year).toBe(2024);
    });

    it('should convert to Instant', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const zdt = toZonedDateTime(date, 'UTC');
      const instant = zdt.toInstant();

      expect(instant.epochMilliseconds).toBe(date.getTime());
    });

    it('should include offset and timezone in toString', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const zdt = toZonedDateTime(date, 'UTC');
      const str = zdt.toString();

      expect(str).toContain('[UTC]');
    });
  });

  describe('Instant', () => {
    it('should create from Date', () => {
      const date = new Date('2024-03-25T14:30:00Z');
      const instant = toInstant(date);

      expect(instant.epochMilliseconds).toBe(date.getTime());
      expect(instant.epochSeconds).toBe(Math.floor(date.getTime() / 1000));
    });

    it('should create from epoch milliseconds', () => {
      const ms = Date.now();
      const instant = toInstant(ms);

      expect(instant.epochMilliseconds).toBe(ms);
    });

    it('should serialize to ISO string', () => {
      const instant = toInstant(new Date('2024-03-25T14:30:00.000Z'));
      expect(instant.toString()).toBe('2024-03-25T14:30:00.000Z');
    });

    it('should compare instants', () => {
      const a = toInstant(1000);
      const b = toInstant(2000);

      expect(a.equals(toInstant(1000))).toBe(true);
      expect(a.compare(b)).toBeLessThan(0);
    });

    it('should add/subtract duration', () => {
      const instant = toInstant(new Date('2024-03-25T14:30:00Z'));
      const added = instant.add({ hours: 1 });

      expect(added.epochMilliseconds - instant.epochMilliseconds).toBe(3600000);
    });

    it('should calculate until/since', () => {
      const a = toInstant(0);
      const b = toInstant(3600000); // 1 hour later

      const until = a.until(b);
      expect(until.milliseconds).toBe(3600000);
    });

    it('should convert to ZonedDateTime', () => {
      const instant = toInstant(new Date('2024-03-25T14:30:00Z'));
      const zdt = instant.toZonedDateTime('Europe/London');

      expect(zdt.timeZone).toBe('Europe/London');
      expect(zdt.epochMilliseconds).toBe(instant.epochMilliseconds);
    });
  });

  describe('Duration', () => {
    it('should create from components', () => {
      const duration = createDuration({
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
      });

      expect(duration.years).toBe(1);
      expect(duration.months).toBe(2);
      expect(duration.days).toBe(3);
      expect(duration.hours).toBe(4);
      expect(duration.minutes).toBe(5);
      expect(duration.seconds).toBe(6);
    });

    it('should serialize to ISO 8601 duration', () => {
      const duration = createDuration({ days: 1, hours: 2, minutes: 30 });
      expect(duration.toString()).toBe('P1DT2H30M');

      const empty = createDuration({});
      expect(empty.toString()).toBe('PT0S');
    });

    it('should calculate sign and blank', () => {
      const positive = createDuration({ days: 1 });
      const negative = createDuration({ days: -1 });
      const zero = createDuration({});

      expect(positive.sign).toBe(1);
      expect(negative.sign).toBe(-1);
      expect(zero.sign).toBe(0);

      expect(positive.blank).toBe(false);
      expect(zero.blank).toBe(true);
    });

    it('should negate and abs', () => {
      const duration = createDuration({ days: 5 });
      const negated = duration.negated();
      const absed = negated.abs();

      expect(negated.days).toBe(-5);
      expect(absed.days).toBe(5);
    });

    it('should add and subtract', () => {
      const a = createDuration({ hours: 1 });
      const b = createDuration({ hours: 2 });

      const sum = a.add(b);
      const diff = b.subtract(a);

      expect(sum.hours).toBe(3);
      expect(diff.hours).toBe(1);
    });

    it('should calculate total in units', () => {
      const duration = createDuration({ days: 1, hours: 12 });

      expect(duration.total('hours')).toBe(36);
      expect(duration.total('days')).toBe(1.5);
    });
  });

  describe('parseDuration', () => {
    it('should parse ISO 8601 duration strings', () => {
      const d1 = parseDuration('P1Y2M3DT4H5M6S');
      expect(d1.years).toBe(1);
      expect(d1.months).toBe(2);
      expect(d1.days).toBe(3);
      expect(d1.hours).toBe(4);
      expect(d1.minutes).toBe(5);
      expect(d1.seconds).toBe(6);
    });

    it('should parse negative durations', () => {
      const d = parseDuration('-P1D');
      expect(d.days).toBe(-1);
    });

    it('should parse duration with fractional seconds', () => {
      const d = parseDuration('PT1.5S');
      expect(d.seconds).toBe(1);
      expect(d.milliseconds).toBe(500);
    });

    it('should throw on invalid duration', () => {
      expect(() => parseDuration('invalid')).toThrow();
    });
  });

  describe('now* functions', () => {
    it('should return current instant', () => {
      const before = Date.now();
      const instant = nowInstant();
      const after = Date.now();

      expect(instant.epochMilliseconds).toBeGreaterThanOrEqual(before);
      expect(instant.epochMilliseconds).toBeLessThanOrEqual(after);
    });

    it('should return current PlainDate', () => {
      const now = new Date();
      const plain = nowPlainDate();

      expect(plain.year).toBe(now.getFullYear());
      expect(plain.month).toBe(now.getMonth() + 1);
    });

    it('should return current PlainTime', () => {
      const now = new Date();
      const time = nowPlainTime();

      expect(time.hour).toBe(now.getHours());
    });

    it('should return current PlainDateTime', () => {
      const now = new Date();
      const dt = nowPlainDateTime();

      expect(dt.year).toBe(now.getFullYear());
      expect(dt.hour).toBe(now.getHours());
    });

    it('should return current ZonedDateTime', () => {
      const zdt = nowZonedDateTime('UTC');
      const now = new Date();

      expect(zdt.timeZone).toBe('UTC');
      expect(Math.abs(zdt.epochMilliseconds - now.getTime())).toBeLessThan(1000);
    });
  });

  describe('fromTemporal', () => {
    it('should convert PlainDate to Date', () => {
      const plain = toPlainDate(2024, 3, 25);
      const date = fromTemporal(plain);

      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2);
      expect(date.getDate()).toBe(25);
    });

    it('should convert PlainDateTime to Date', () => {
      const dt = toPlainDateTime(2024, 3, 25, 14, 30);
      const date = fromTemporal(dt);

      expect(date.getFullYear()).toBe(2024);
      expect(date.getHours()).toBe(14);
    });

    it('should convert ZonedDateTime to Date', () => {
      const zdt = toZonedDateTime(new Date('2024-03-25T14:30:00Z'), 'UTC');
      const date = fromTemporal(zdt);

      expect(date.getTime()).toBe(new Date('2024-03-25T14:30:00Z').getTime());
    });

    it('should convert Instant to Date', () => {
      const instant = toInstant(new Date('2024-03-25T14:30:00Z'));
      const date = fromTemporal(instant);

      expect(date.getTime()).toBe(new Date('2024-03-25T14:30:00Z').getTime());
    });
  });
});
