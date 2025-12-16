import { describe, it, expect } from 'vitest';
import {
  eachDay,
  eachWeekday,
  eachWeekend,
  eachWeek,
  eachMonth,
  eachQuarter,
  eachYear,
  eachHour,
  eachMinute,
  eachDayOfWeek,
  eachInterval,
  countDays,
  countWeekdays,
  countWeekendDays,
  countWeeks,
  countMonths,
  iterateDates,
  iterateDays,
  iterateWeekdays,
  iterateMonths,
  filterDays,
  eachMonthEnd,
  eachNthDayOfMonth,
} from '../src/iterate.js';

describe('Date iteration utilities', () => {
  describe('eachDay', () => {
    it('should generate array of days', () => {
      const days = eachDay(
        new Date('2024-01-01'),
        new Date('2024-01-05')
      );
      expect(days.length).toBe(5);
      expect(days[0].getDate()).toBe(1);
      expect(days[4].getDate()).toBe(5);
    });

    it('should return single day for same start and end', () => {
      const days = eachDay(
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );
      expect(days.length).toBe(1);
    });
  });

  describe('eachWeekday', () => {
    it('should generate only weekdays', () => {
      const weekdays = eachWeekday(
        new Date('2024-01-01'), // Monday
        new Date('2024-01-07') // Sunday
      );
      expect(weekdays.length).toBe(5);
      weekdays.forEach(d => {
        expect(d.getDay()).toBeGreaterThan(0);
        expect(d.getDay()).toBeLessThan(6);
      });
    });
  });

  describe('eachWeekend', () => {
    it('should generate only weekend days', () => {
      const weekends = eachWeekend(
        new Date('2024-01-01'),
        new Date('2024-01-14')
      );
      expect(weekends.length).toBe(4); // 2 weekends
      weekends.forEach(d => {
        expect(d.getDay() === 0 || d.getDay() === 6).toBe(true);
      });
    });
  });

  describe('eachWeek', () => {
    it('should generate week starts', () => {
      const weeks = eachWeek(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );
      expect(weeks.length).toBeGreaterThanOrEqual(4);
      weeks.forEach(d => {
        expect(d.getDay()).toBe(0); // Sunday
      });
    });

    it('should support custom week start', () => {
      const weeks = eachWeek(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1 // Monday
      );
      weeks.forEach(d => {
        expect(d.getDay()).toBe(1); // Monday
      });
    });
  });

  describe('eachMonth', () => {
    it('should generate first of each month', () => {
      const months = eachMonth(
        new Date('2024-01-15'),
        new Date('2024-04-15')
      );
      expect(months.length).toBe(3); // Feb, Mar, Apr
      months.forEach(d => {
        expect(d.getDate()).toBe(1);
      });
    });
  });

  describe('eachQuarter', () => {
    it('should generate quarter starts', () => {
      const quarters = eachQuarter(
        new Date('2024-01-15'),
        new Date('2024-12-15')
      );
      expect(quarters.length).toBe(3); // Q2, Q3, Q4
      expect(quarters[0].getMonth()).toBe(3); // April
      expect(quarters[1].getMonth()).toBe(6); // July
      expect(quarters[2].getMonth()).toBe(9); // October
    });
  });

  describe('eachYear', () => {
    it('should generate January 1st of each year', () => {
      const years = eachYear(
        new Date('2022-06-15'),
        new Date('2025-06-15')
      );
      expect(years.length).toBe(3); // 2023, 2024, 2025
      years.forEach(d => {
        expect(d.getMonth()).toBe(0);
        expect(d.getDate()).toBe(1);
      });
    });
  });

  describe('eachHour', () => {
    it('should generate hourly intervals', () => {
      const hours = eachHour(
        new Date('2024-01-01T09:00:00'),
        new Date('2024-01-01T12:00:00')
      );
      expect(hours.length).toBe(4);
    });

    it('should support custom step', () => {
      const hours = eachHour(
        new Date('2024-01-01T00:00:00'),
        new Date('2024-01-01T12:00:00'),
        3
      );
      expect(hours.length).toBe(5); // 0, 3, 6, 9, 12
    });
  });

  describe('eachMinute', () => {
    it('should generate minute intervals', () => {
      const minutes = eachMinute(
        new Date('2024-01-01T09:00:00'),
        new Date('2024-01-01T09:05:00')
      );
      expect(minutes.length).toBe(6);
    });

    it('should support custom step', () => {
      const minutes = eachMinute(
        new Date('2024-01-01T09:00:00'),
        new Date('2024-01-01T09:30:00'),
        15
      );
      expect(minutes.length).toBe(3); // 0, 15, 30
    });
  });

  describe('eachDayOfWeek', () => {
    it('should generate all Mondays', () => {
      const mondays = eachDayOfWeek(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1 // Monday
      );
      expect(mondays.length).toBe(5);
      mondays.forEach(d => {
        expect(d.getDay()).toBe(1);
      });
    });
  });

  describe('eachInterval', () => {
    it('should support day intervals', () => {
      const dates = eachInterval(
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        { days: 3 }
      );
      expect(dates.length).toBe(4); // 1, 4, 7, 10
    });

    it('should support week intervals', () => {
      const dates = eachInterval(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        { weeks: 2 }
      );
      expect(dates.length).toBe(3); // 1, 15, 29
    });

    it('should support hour intervals', () => {
      const dates = eachInterval(
        new Date('2024-01-01T00:00:00'),
        new Date('2024-01-01T12:00:00'),
        { hours: 4 }
      );
      expect(dates.length).toBe(4); // 0, 4, 8, 12
    });
  });

  describe('countDays', () => {
    it('should count days inclusive', () => {
      expect(countDays(
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )).toBe(5);
    });

    it('should return 1 for same day', () => {
      expect(countDays(
        new Date('2024-01-01'),
        new Date('2024-01-01')
      )).toBe(1);
    });
  });

  describe('countWeekdays', () => {
    it('should count weekdays', () => {
      expect(countWeekdays(
        new Date('2024-01-01'), // Monday
        new Date('2024-01-07') // Sunday
      )).toBe(5);
    });
  });

  describe('countWeekendDays', () => {
    it('should count weekend days', () => {
      expect(countWeekendDays(
        new Date('2024-01-01'),
        new Date('2024-01-14')
      )).toBe(4);
    });
  });

  describe('countWeeks', () => {
    it('should count weeks', () => {
      expect(countWeeks(
        new Date('2024-01-01'),
        new Date('2024-01-14')
      )).toBe(2);
    });
  });

  describe('countMonths', () => {
    it('should count months', () => {
      expect(countMonths(
        new Date('2024-01-15'),
        new Date('2024-04-15')
      )).toBe(4);
    });
  });

  describe('iterateDates', () => {
    it('should create lazy iterator', () => {
      const iterator = iterateDates(
        new Date('2024-01-01'),
        new Date('2024-01-05')
      );
      const dates = [...iterator];
      expect(dates.length).toBe(5);
    });
  });

  describe('iterateDays', () => {
    it('should iterate days lazily', () => {
      const iterator = iterateDays(
        new Date('2024-01-01'),
        new Date('2024-01-03')
      );
      const dates = [...iterator];
      expect(dates.length).toBe(3);
    });
  });

  describe('iterateWeekdays', () => {
    it('should iterate weekdays lazily', () => {
      const iterator = iterateWeekdays(
        new Date('2024-01-01'),
        new Date('2024-01-07')
      );
      const dates = [...iterator];
      expect(dates.length).toBe(5);
    });
  });

  describe('iterateMonths', () => {
    it('should iterate months lazily', () => {
      const iterator = iterateMonths(
        new Date('2024-01-15'),
        new Date('2024-04-15')
      );
      const dates = [...iterator];
      expect(dates.length).toBe(4);
    });
  });

  describe('filterDays', () => {
    it('should filter days by predicate', () => {
      const filtered = filterDays(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        d => d.getDate() === 15
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].getDate()).toBe(15);
    });
  });

  describe('eachMonthEnd', () => {
    it('should generate last day of each month', () => {
      const ends = eachMonthEnd(
        new Date('2024-01-15'),
        new Date('2024-04-15')
      );
      expect(ends.length).toBe(3);
      expect(ends[0].getDate()).toBe(31); // Jan
      expect(ends[1].getDate()).toBe(29); // Feb (2024 is leap year)
      expect(ends[2].getDate()).toBe(31); // Mar
    });
  });

  describe('eachNthDayOfMonth', () => {
    it('should generate 15th of each month', () => {
      const dates = eachNthDayOfMonth(
        new Date('2024-01-01'),
        new Date('2024-04-30'),
        15
      );
      expect(dates.length).toBe(4);
      dates.forEach(d => {
        expect(d.getDate()).toBe(15);
      });
    });

    it('should cap at month end for short months', () => {
      const dates = eachNthDayOfMonth(
        new Date('2024-02-01'),
        new Date('2024-02-29'),
        31
      );
      expect(dates.length).toBe(1);
      expect(dates[0].getDate()).toBe(29); // Feb 29 in 2024
    });
  });
});
