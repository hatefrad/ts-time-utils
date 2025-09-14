import { describe, it, expect } from 'vitest';
import { 
  Duration, 
  createDuration, 
  isValidDuration, 
  parseDurationString, 
  formatDurationString,
  maxDuration,
  minDuration,
  sumDurations,
  averageDuration
} from '../src/duration.js';

describe('Duration', () => {
  describe('constructor and creation', () => {
    it('should create duration from milliseconds', () => {
      const duration = new Duration(5000);
      expect(duration.milliseconds).toBe(5000);
      expect(duration.seconds).toBe(5);
    });

    it('should create duration from object', () => {
      const duration = new Duration({ hours: 1, minutes: 30 });
      expect(duration.hours).toBe(1.5);
      expect(duration.milliseconds).toBe(5400000);
    });

    it('should create duration from string', () => {
      const duration = new Duration('1h 30m');
      expect(duration.hours).toBe(1.5);
    });

    it('should create duration using static methods', () => {
      expect(Duration.fromSeconds(60).minutes).toBe(1);
      expect(Duration.fromMinutes(60).hours).toBe(1);
      expect(Duration.fromHours(24).days).toBe(1);
      expect(Duration.fromDays(7).weeks).toBe(1);
    });

    it('should create duration between dates', () => {
      const start = new Date('2023-01-01T10:00:00Z');
      const end = new Date('2023-01-01T11:30:00Z');
      const duration = Duration.between(start, end);
      expect(duration.hours).toBe(1.5);
    });
  });

  describe('arithmetic operations', () => {
    it('should add durations', () => {
      const d1 = Duration.fromHours(1);
      const d2 = Duration.fromMinutes(30);
      const result = d1.add(d2);
      expect(result.hours).toBe(1.5);
    });

    it('should subtract durations', () => {
      const d1 = Duration.fromHours(2);
      const d2 = Duration.fromMinutes(30);
      const result = d1.subtract(d2);
      expect(result.hours).toBe(1.5);
    });

    it('should not allow negative durations from subtraction', () => {
      const d1 = Duration.fromMinutes(30);
      const d2 = Duration.fromHours(1);
      const result = d1.subtract(d2);
      expect(result.milliseconds).toBe(0);
    });

    it('should multiply duration', () => {
      const duration = Duration.fromHours(1);
      const result = duration.multiply(2.5);
      expect(result.hours).toBe(2.5);
    });

    it('should divide duration', () => {
      const duration = Duration.fromHours(3);
      const result = duration.divide(2);
      expect(result.hours).toBe(1.5);
    });

    it('should throw error when dividing by zero', () => {
      const duration = Duration.fromHours(1);
      expect(() => duration.divide(0)).toThrow('Cannot divide duration by zero');
    });

    it('should get absolute duration', () => {
      const duration = new Duration(-5000);
      const abs = duration.abs();
      expect(abs.milliseconds).toBe(5000);
    });

    it('should negate duration', () => {
      const duration = Duration.fromSeconds(5);
      const negated = duration.negate();
      expect(negated.milliseconds).toBe(-5000);
    });
  });

  describe('comparisons', () => {
    it('should compare durations for equality', () => {
      const d1 = Duration.fromMinutes(60);
      const d2 = Duration.fromHours(1);
      expect(d1.equals(d2)).toBe(true);
      expect(d1.equals(3600000)).toBe(true);
    });

    it('should compare durations for greater than', () => {
      const d1 = Duration.fromHours(2);
      const d2 = Duration.fromHours(1);
      expect(d1.greaterThan(d2)).toBe(true);
      expect(d2.greaterThan(d1)).toBe(false);
    });

    it('should compare durations for less than', () => {
      const d1 = Duration.fromHours(1);
      const d2 = Duration.fromHours(2);
      expect(d1.lessThan(d2)).toBe(true);
      expect(d2.lessThan(d1)).toBe(false);
    });

    it('should compare durations with compareTo', () => {
      const d1 = Duration.fromHours(1);
      const d2 = Duration.fromHours(2);
      const d3 = Duration.fromHours(1);
      
      expect(d1.compareTo(d2)).toBe(-1);
      expect(d2.compareTo(d1)).toBe(1);
      expect(d1.compareTo(d3)).toBe(0);
    });

    it('should check if duration is zero', () => {
      const zero = new Duration(0);
      const nonZero = Duration.fromSeconds(1);
      
      expect(zero.isZero()).toBe(true);
      expect(nonZero.isZero()).toBe(false);
    });

    it('should check if duration is positive or negative', () => {
      const positive = Duration.fromSeconds(5);
      const negative = new Duration(-5000);
      const zero = new Duration(0);
      
      expect(positive.isPositive()).toBe(true);
      expect(negative.isPositive()).toBe(false);
      expect(zero.isPositive()).toBe(false);
      
      expect(positive.isNegative()).toBe(false);
      expect(negative.isNegative()).toBe(true);
      expect(zero.isNegative()).toBe(false);
    });
  });

  describe('string parsing', () => {
    it('should parse simple formats', () => {
      expect(Duration.fromString('5000').milliseconds).toBe(5000);
      expect(Duration.fromString('5000ms').milliseconds).toBe(5000);
    });

    it('should parse complex formats', () => {
      expect(Duration.fromString('1h 30m').hours).toBe(1.5);
      expect(Duration.fromString('2d 3h 45m 30s').days).toBeCloseTo(2.156597, 5);
      expect(Duration.fromString('1.5 hours').hours).toBe(1.5);
      expect(Duration.fromString('90 minutes').hours).toBe(1.5);
    });

    it('should handle various unit formats', () => {
      expect(Duration.fromString('1 day').days).toBe(1);
      expect(Duration.fromString('2 days').days).toBe(2);
      expect(Duration.fromString('1 hour').hours).toBe(1);
      expect(Duration.fromString('2 hours').hours).toBe(2);
      expect(Duration.fromString('1 minute').minutes).toBe(1);
      expect(Duration.fromString('2 minutes').minutes).toBe(2);
      expect(Duration.fromString('1 second').seconds).toBe(1);
      expect(Duration.fromString('2 seconds').seconds).toBe(2);
    });

    it('should throw error for invalid formats', () => {
      expect(() => Duration.fromString('invalid')).toThrow('Invalid duration format');
      expect(() => Duration.fromString('')).toThrow('Invalid duration format');
    });
  });

  describe('string formatting', () => {
    it('should format duration to string', () => {
      expect(new Duration(0).toString()).toBe('0ms');
      expect(Duration.fromSeconds(90).toString()).toBe('1m 30s');
      expect(Duration.fromHours(25).toString()).toBe('1d 1h');
      expect(Duration.fromMilliseconds(5500).toString()).toBe('5s 500ms');
    });

    it('should format negative durations', () => {
      const negative = new Duration(-5000);
      expect(negative.toString()).toBe('-5s');
    });

    it('should convert to object representation', () => {
      const duration = Duration.fromString('1d 2h 30m 45s 500ms');
      const obj = duration.toObject();
      
      expect(obj.days).toBe(1);
      expect(obj.hours).toBe(2);
      expect(obj.minutes).toBe(30);
      expect(obj.seconds).toBe(45);
      expect(obj.milliseconds).toBe(500);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON', () => {
      const duration = Duration.fromHours(2);
      expect(duration.toJSON()).toBe(7200000);
      expect(JSON.stringify(duration)).toBe('7200000');
    });

    it('should deserialize from JSON', () => {
      const duration = Duration.fromJSON(7200000);
      expect(duration.hours).toBe(2);
    });
  });

  describe('utility functions', () => {
    it('should create duration with createDuration', () => {
      const duration = createDuration(5000);
      expect(duration.milliseconds).toBe(5000);
    });

    it('should validate duration with isValidDuration', () => {
      const duration = new Duration(5000);
      expect(isValidDuration(duration)).toBe(true);
      expect(isValidDuration(5000)).toBe(false);
      expect(isValidDuration('5000')).toBe(false);
    });

    it('should parse duration string', () => {
      const duration = parseDurationString('1h 30m');
      expect(duration.hours).toBe(1.5);
    });

    it('should format duration string (short)', () => {
      const duration = Duration.fromHours(1.5);
      expect(formatDurationString(duration)).toBe('1h 30m');
    });

    it('should format duration string (long)', () => {
      const duration = Duration.fromString('2d 3h 45m 30s');
      const formatted = formatDurationString(duration, { long: true });
      expect(formatted).toBe('2 days, 3 hours, 45 minutes, 30 seconds');
    });

    it('should find maximum duration', () => {
      const d1 = Duration.fromHours(1);
      const d2 = Duration.fromHours(3);
      const d3 = Duration.fromHours(2);
      
      const max = maxDuration(d1, d2, d3);
      expect(max?.hours).toBe(3);
      expect(maxDuration()).toBe(null);
    });

    it('should find minimum duration', () => {
      const d1 = Duration.fromHours(1);
      const d2 = Duration.fromHours(3);
      const d3 = Duration.fromHours(2);
      
      const min = minDuration(d1, d2, d3);
      expect(min?.hours).toBe(1);
      expect(minDuration()).toBe(null);
    });

    it('should sum durations', () => {
      const d1 = Duration.fromHours(1);
      const d2 = Duration.fromHours(2);
      const d3 = Duration.fromHours(3);
      
      const sum = sumDurations(d1, d2, d3);
      expect(sum.hours).toBe(6);
    });

    it('should calculate average duration', () => {
      const d1 = Duration.fromHours(1);
      const d2 = Duration.fromHours(2);
      const d3 = Duration.fromHours(3);
      
      const avg = averageDuration(d1, d2, d3);
      expect(avg?.hours).toBe(2);
      expect(averageDuration()).toBe(null);
    });
  });

  describe('conversions', () => {
    it('should convert between all units', () => {
      const oneHour = Duration.fromHours(1);
      
      expect(oneHour.milliseconds).toBe(3600000);
      expect(oneHour.seconds).toBe(3600);
      expect(oneHour.minutes).toBe(60);
      expect(oneHour.hours).toBe(1);
      expect(oneHour.days).toBeCloseTo(1/24, 10);
      expect(oneHour.weeks).toBeCloseTo(1/168, 10);
    });

    it('should handle approximate month and year conversions', () => {
      const duration = new Duration({ months: 1, years: 1 });
      
      // These are approximate since months and years vary
      expect(duration.days).toBeCloseTo(365.25 + 30.44, 1);
    });
  });
});