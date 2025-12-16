import { describe, it, expect } from 'vitest';
import {
  parseCronExpression,
  parseCronField,
  matchesCron,
  getNextCronDate,
  getNextCronDates,
  getPreviousCronDate,
  isValidCron,
  describeCron,
  CRON_PRESETS
} from '../src/cron';

describe('cron utilities', () => {
  describe('parseCronExpression', () => {
    it('parses valid 5-field cron expression', () => {
      const result = parseCronExpression('0 9 * * 1');
      expect(result).toEqual({
        minute: '0',
        hour: '9',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '1'
      });
    });

    it('returns null for invalid expressions', () => {
      expect(parseCronExpression('invalid')).toBeNull();
      expect(parseCronExpression('0 9 * *')).toBeNull(); // Missing field
      expect(parseCronExpression('0 9 * * * *')).toBeNull(); // Too many fields
    });
  });

  describe('parseCronField', () => {
    it('parses wildcard', () => {
      const result = parseCronField('*', 0, 59);
      expect(result?.type).toBe('all');
      expect(result?.values.length).toBe(60);
    });

    it('parses specific value', () => {
      const result = parseCronField('30', 0, 59);
      expect(result?.type).toBe('specific');
      expect(result?.values).toEqual([30]);
    });

    it('parses range', () => {
      const result = parseCronField('1-5', 0, 59);
      expect(result?.type).toBe('range');
      expect(result?.values).toEqual([1, 2, 3, 4, 5]);
    });

    it('parses step', () => {
      const result = parseCronField('*/15', 0, 59);
      expect(result?.type).toBe('step');
      expect(result?.values).toEqual([0, 15, 30, 45]);
    });

    it('parses list', () => {
      const result = parseCronField('1,3,5', 0, 59);
      expect(result?.type).toBe('list');
      expect(result?.values).toEqual([1, 3, 5]);
    });

    it('returns null for invalid fields', () => {
      expect(parseCronField('100', 0, 59)).toBeNull(); // Out of range
      expect(parseCronField('abc', 0, 59)).toBeNull(); // Not a number
    });
  });

  describe('matchesCron', () => {
    it('matches every minute', () => {
      expect(matchesCron(new Date(), '* * * * *')).toBe(true);
    });

    it('matches specific time', () => {
      const date = new Date(2025, 0, 13, 9, 0); // Monday, Jan 13, 2025 at 9:00 AM
      expect(matchesCron(date, '0 9 * * 1')).toBe(true); // 9:00 AM on Monday
      expect(matchesCron(date, '0 10 * * 1')).toBe(false); // Wrong hour
    });

    it('matches day of week', () => {
      const monday = new Date(2025, 0, 13, 9, 0); // Monday
      expect(matchesCron(monday, '0 9 * * 1')).toBe(true);
      expect(matchesCron(monday, '0 9 * * 0')).toBe(false); // Sunday
    });

    it('returns false for invalid expression', () => {
      expect(matchesCron(new Date(), 'invalid')).toBe(false);
    });
  });

  describe('getNextCronDate', () => {
    it('gets next occurrence', () => {
      const after = new Date(2025, 0, 13, 8, 55); // 8:55 AM
      const next = getNextCronDate('0 9 * * *', after); // Daily at 9:00 AM
      expect(next?.getHours()).toBe(9);
      expect(next?.getMinutes()).toBe(0);
    });

    it('returns null for invalid expression', () => {
      expect(getNextCronDate('invalid')).toBeNull();
    });
  });

  describe('getNextCronDates', () => {
    it('gets multiple next occurrences', () => {
      const after = new Date(2025, 0, 13, 8, 55);
      const dates = getNextCronDates('0 9 * * *', 3, after);
      expect(dates.length).toBe(3);
      dates.forEach(d => {
        expect(d.getHours()).toBe(9);
        expect(d.getMinutes()).toBe(0);
      });
    });
  });

  describe('getPreviousCronDate', () => {
    it('gets previous occurrence', () => {
      const before = new Date(2025, 0, 13, 9, 5); // 9:05 AM
      const prev = getPreviousCronDate('0 9 * * *', before);
      expect(prev?.getHours()).toBe(9);
      expect(prev?.getMinutes()).toBe(0);
    });

    it('returns null for invalid expression', () => {
      expect(getPreviousCronDate('invalid')).toBeNull();
    });
  });

  describe('isValidCron', () => {
    it('validates correct expressions', () => {
      expect(isValidCron('* * * * *')).toBe(true);
      expect(isValidCron('0 9 * * 1')).toBe(true);
      expect(isValidCron('*/5 * * * *')).toBe(true);
      expect(isValidCron('0 0 1 1 *')).toBe(true);
    });

    it('invalidates incorrect expressions', () => {
      expect(isValidCron('invalid')).toBe(false);
      expect(isValidCron('60 * * * *')).toBe(false); // Invalid minute
      expect(isValidCron('* 24 * * *')).toBe(false); // Invalid hour
    });
  });

  describe('describeCron', () => {
    it('describes common patterns', () => {
      expect(describeCron('* * * * *')).toBe('Every minute');
      expect(describeCron('0 * * * *')).toBe('Every hour');
      expect(describeCron('0 0 * * *')).toBe('Every day at midnight');
      expect(describeCron('0 0 1 * *')).toBe('First day of every month at midnight');
    });

    it('returns null for invalid expression', () => {
      expect(describeCron('invalid')).toBeNull();
    });
  });

  describe('CRON_PRESETS', () => {
    it('has valid preset expressions', () => {
      Object.values(CRON_PRESETS).forEach(preset => {
        expect(isValidCron(preset)).toBe(true);
      });
    });

    it('includes common presets', () => {
      expect(CRON_PRESETS.everyMinute).toBe('* * * * *');
      expect(CRON_PRESETS.everyHour).toBe('0 * * * *');
      expect(CRON_PRESETS.everyDay).toBe('0 0 * * *');
      expect(CRON_PRESETS.weekdays).toBe('0 0 * * 1-5');
    });
  });
});
