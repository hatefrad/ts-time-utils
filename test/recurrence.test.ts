import { describe, it, expect } from 'vitest';
import {
  createRecurrence,
  getNextOccurrence,
  getOccurrencesBetween,
  isRecurrenceDate,
  isValidRecurrenceRule,
  recurrenceToString
} from '../src/recurrence';

describe('Recurrence', () => {
  describe('createRecurrence', () => {
    it('should create a daily recurrence', () => {
      const recurrence = createRecurrence({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2024-01-01')
      });

      expect(recurrence.rule.frequency).toBe('daily');
      expect(recurrence.rule.interval).toBe(1);
    });

    it('should create a weekly recurrence with specific days', () => {
      const recurrence = createRecurrence({
        frequency: 'weekly',
        interval: 1,
        startDate: new Date('2024-01-01'),
        byWeekday: [1, 3, 5] // Monday, Wednesday, Friday
      });

      expect(recurrence.rule.byWeekday).toEqual([1, 3, 5]);
    });
  });

  describe('getNextOccurrence', () => {
    it('should get next daily occurrence', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01')
      };

      const next = getNextOccurrence(rule, new Date('2024-01-05'));
      expect(next).toEqual(new Date('2024-01-06'));
    });

    it('should get next occurrence every 2 days', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 2,
        startDate: new Date('2024-01-01')
      };

      const next = getNextOccurrence(rule, new Date('2024-01-05'));
      expect(next).toEqual(new Date('2024-01-07'));
    });

    it('should get next weekly occurrence on Monday', () => {
      const rule = {
        frequency: 'weekly' as const,
        interval: 1,
        startDate: new Date('2024-01-01'), // Monday
        byWeekday: [1] // Mondays
      };

      const next = getNextOccurrence(rule, new Date('2024-01-02')); // Tuesday
      expect(next?.getDay()).toBe(1); // Monday
      expect(next?.getDate()).toBe(8); // Next Monday
    });

    it('should get next monthly occurrence on the 15th', () => {
      const rule = {
        frequency: 'monthly' as const,
        interval: 1,
        startDate: new Date('2024-01-15'),
        byMonthDay: [15]
      };

      const next = getNextOccurrence(rule, new Date('2024-01-20'));
      expect(next?.getDate()).toBe(15);
      expect(next?.getMonth()).toBe(1); // February (0-indexed)
    });

    it('should return null when until date is passed', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01'),
        until: new Date('2024-01-10')
      };

      const next = getNextOccurrence(rule, new Date('2024-01-11'));
      expect(next).toBeNull();
    });
  });

  describe('getOccurrencesBetween', () => {
    it('should get daily occurrences in range', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01')
      };

      const occurrences = getOccurrencesBetween(
        rule,
        new Date('2024-01-01'),
        new Date('2024-01-05')
      );

      expect(occurrences.length).toBe(5);
      expect(occurrences[0]).toEqual(new Date('2024-01-01'));
      expect(occurrences[4]).toEqual(new Date('2024-01-05'));
    });

    it('should get weekly occurrences on specific days', () => {
      const rule = {
        frequency: 'weekly' as const,
        interval: 1,
        startDate: new Date('2024-01-01'), // Monday
        byWeekday: [1, 3, 5] // Mon, Wed, Fri
      };

      const occurrences = getOccurrencesBetween(
        rule,
        new Date('2024-01-01'),
        new Date('2024-01-14')
      );

      // Should have Mon/Wed/Fri in first week + Mon/Wed/Fri in second week
      expect(occurrences.length).toBe(6);
      expect(occurrences[0].getDay()).toBe(1); // Monday
      expect(occurrences[1].getDay()).toBe(3); // Wednesday
      expect(occurrences[2].getDay()).toBe(5); // Friday
    });

    it('should respect limit parameter', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01')
      };

      const occurrences = getOccurrencesBetween(
        rule,
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        10
      );

      expect(occurrences.length).toBe(10);
    });

    it('should return empty array when no occurrences in range', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01'),
        until: new Date('2024-01-10')
      };

      const occurrences = getOccurrencesBetween(
        rule,
        new Date('2024-02-01'),
        new Date('2024-02-28')
      );

      expect(occurrences.length).toBe(0);
    });
  });

  describe('isRecurrenceDate', () => {
    it('should return true for valid daily occurrence', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01')
      };

      expect(isRecurrenceDate(new Date('2024-01-05'), rule)).toBe(true);
    });

    it('should return false for non-occurrence date', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 2,
        startDate: new Date('2024-01-01')
      };

      expect(isRecurrenceDate(new Date('2024-01-02'), rule)).toBe(false);
      expect(isRecurrenceDate(new Date('2024-01-03'), rule)).toBe(true);
    });

    it('should return false for date before start', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-10')
      };

      expect(isRecurrenceDate(new Date('2024-01-05'), rule)).toBe(false);
    });

    it('should return false for date after until', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01'),
        until: new Date('2024-01-10')
      };

      expect(isRecurrenceDate(new Date('2024-01-15'), rule)).toBe(false);
    });

    it('should validate weekly occurrences on specific days', () => {
      const rule = {
        frequency: 'weekly' as const,
        interval: 1,
        startDate: new Date('2024-01-01'), // Monday
        byWeekday: [1, 5] // Monday and Friday
      };

      expect(isRecurrenceDate(new Date('2024-01-01'), rule)).toBe(true); // Monday
      expect(isRecurrenceDate(new Date('2024-01-02'), rule)).toBe(false); // Tuesday
      expect(isRecurrenceDate(new Date('2024-01-05'), rule)).toBe(true); // Friday
    });
  });

  describe('isValidRecurrenceRule', () => {
    it('should validate valid daily rule', () => {
      expect(isValidRecurrenceRule({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2024-01-01')
      })).toBe(true);
    });

    it('should reject rule without frequency', () => {
      expect(isValidRecurrenceRule({
        startDate: new Date('2024-01-01')
      } as any)).toBe(false);
    });

    it('should reject rule without startDate', () => {
      expect(isValidRecurrenceRule({
        frequency: 'daily'
      } as any)).toBe(false);
    });

    it('should reject rule with invalid interval', () => {
      expect(isValidRecurrenceRule({
        frequency: 'daily',
        interval: 0,
        startDate: new Date('2024-01-01')
      })).toBe(false);
    });

    it('should reject rule with invalid count', () => {
      expect(isValidRecurrenceRule({
        frequency: 'daily',
        interval: 1,
        count: 0,
        startDate: new Date('2024-01-01')
      })).toBe(false);
    });

    it('should reject rule with until before start', () => {
      expect(isValidRecurrenceRule({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2024-01-10'),
        until: new Date('2024-01-01')
      })).toBe(false);
    });

    it('should reject rule with invalid weekday', () => {
      expect(isValidRecurrenceRule({
        frequency: 'weekly',
        interval: 1,
        startDate: new Date('2024-01-01'),
        byWeekday: [7] // Invalid, should be 0-6
      })).toBe(false);
    });

    it('should reject rule with invalid month day', () => {
      expect(isValidRecurrenceRule({
        frequency: 'monthly',
        interval: 1,
        startDate: new Date('2024-01-01'),
        byMonthDay: [32] // Invalid, should be 1-31
      })).toBe(false);
    });
  });

  describe('recurrenceToString', () => {
    it('should format daily recurrence', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01')
      };

      expect(recurrenceToString(rule)).toBe('Every day');
    });

    it('should format daily recurrence with interval', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 3,
        startDate: new Date('2024-01-01')
      };

      expect(recurrenceToString(rule)).toBe('Every 3 days');
    });

    it('should format weekly recurrence with days', () => {
      const rule = {
        frequency: 'weekly' as const,
        interval: 1,
        startDate: new Date('2024-01-01'),
        byWeekday: [1, 3, 5]
      };

      expect(recurrenceToString(rule)).toBe('Every week on Monday, Wednesday, Friday');
    });

    it('should format monthly recurrence with day of month', () => {
      const rule = {
        frequency: 'monthly' as const,
        interval: 1,
        startDate: new Date('2024-01-01'),
        byMonthDay: [15]
      };

      expect(recurrenceToString(rule)).toBe('Every month on day 15');
    });

    it('should format yearly recurrence with months', () => {
      const rule = {
        frequency: 'yearly' as const,
        interval: 1,
        startDate: new Date('2024-01-01'),
        byMonth: [1, 6, 12]
      };

      expect(recurrenceToString(rule)).toBe('Every year in January, June, December');
    });

    it('should include count in description', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01'),
        count: 10
      };

      expect(recurrenceToString(rule)).toBe('Every day (10 times)');
    });

    it('should include until date in description', () => {
      const rule = {
        frequency: 'daily' as const,
        interval: 1,
        startDate: new Date('2024-01-01'),
        until: new Date('2024-12-31')
      };

      expect(recurrenceToString(rule)).toContain('until');
    });
  });

  describe('getAllOccurrences', () => {
    it('should get all occurrences up to limit', () => {
      const recurrence = createRecurrence({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2024-01-01')
      });

      const all = recurrence.getAllOccurrences(5);
      expect(all.length).toBe(5);
    });

    it('should respect count limit', () => {
      const recurrence = createRecurrence({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2024-01-01'),
        count: 3
      });

      const all = recurrence.getAllOccurrences(10);
      expect(all.length).toBe(3);
    });

    it('should respect until date', () => {
      const recurrence = createRecurrence({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2024-01-01'),
        until: new Date('2024-01-05')
      });

      const all = recurrence.getAllOccurrences(100);
      expect(all.length).toBeLessThanOrEqual(5);
    });
  });
});
