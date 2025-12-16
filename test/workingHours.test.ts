import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_WORKING_HOURS,
  isWorkingDay,
  isWorkingTime,
  nextWorkingTime,
  workingTimeBetween,
  addWorkingHours,
  addWorkingDays,
  subtractWorkingDays,
  getNextWorkingDay,
  getPreviousWorkingDay,
  getWorkingDaysInMonth,
  getWorkingDaysInMonthArray,
  workingDaysBetween,
  isBreakTime,
  getWorkDayStart,
  getWorkDayEnd,
  getWorkingHoursPerDay
} from '../src/workingHours';

describe('working hours utilities', () => {
  it('detects working day', () => {
    const monday = new Date('2025-09-08T10:00:00'); // Monday
    expect(isWorkingDay(monday)).toBe(true);
  });

  it('detects working time', () => {
    const dt = new Date('2025-09-08T10:30:00');
    expect(isWorkingTime(dt)).toBe(true);
    const lunch = new Date('2025-09-08T12:30:00');
    expect(isWorkingTime(lunch)).toBe(false);
  });

  it('finds next working time', () => {
    const dt = new Date('2025-09-08T07:59:00');
    const next = nextWorkingTime(dt);
    expect(next.getHours()).toBeGreaterThanOrEqual(DEFAULT_WORKING_HOURS.hours.start);
  });

  it('computes working time between dates', () => {
    const start = new Date('2025-09-08T09:00:00');
    const end = new Date('2025-09-08T17:00:00');
    const ms = workingTimeBetween(start, end);
    // 8 hours minus 1 hour lunch = 7 hours
    expect(ms).toBe(7 * 60 * 60 * 1000);
  });

  it('adds working hours', () => {
    const start = new Date('2025-09-08T16:30:00');
    const end = addWorkingHours(start, 2); // Should cross into next day
    expect(end.getDate()).toBeGreaterThanOrEqual(start.getDate());
  });

  describe('addWorkingDays', () => {
    it('adds working days correctly', () => {
      const friday = new Date('2025-01-10'); // Friday
      const result = addWorkingDays(friday, 1);
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(13);
    });

    it('handles negative days', () => {
      const monday = new Date('2025-01-13'); // Monday
      const result = addWorkingDays(monday, -1);
      expect(result.getDay()).toBe(5); // Friday
      expect(result.getDate()).toBe(10);
    });

    it('skips weekends', () => {
      const thursday = new Date('2025-01-09'); // Thursday
      const result = addWorkingDays(thursday, 3);
      expect(result.getDay()).toBe(2); // Tuesday
    });
  });

  describe('subtractWorkingDays', () => {
    it('subtracts working days correctly', () => {
      const monday = new Date('2025-01-13'); // Monday
      const result = subtractWorkingDays(monday, 3);
      expect(result.getDate()).toBe(8); // Wednesday
    });
  });

  describe('getNextWorkingDay', () => {
    it('returns next working day', () => {
      const friday = new Date('2025-01-10'); // Friday
      const result = getNextWorkingDay(friday);
      expect(result.getDay()).toBe(1); // Monday
    });

    it('skips Saturday to Monday', () => {
      const saturday = new Date('2025-01-11'); // Saturday
      const result = getNextWorkingDay(saturday);
      expect(result.getDay()).toBe(1); // Monday
    });
  });

  describe('getPreviousWorkingDay', () => {
    it('returns previous working day', () => {
      const monday = new Date('2025-01-13'); // Monday
      const result = getPreviousWorkingDay(monday);
      expect(result.getDay()).toBe(5); // Friday
    });

    it('skips Sunday to Friday', () => {
      const sunday = new Date('2025-01-12'); // Sunday
      const result = getPreviousWorkingDay(sunday);
      expect(result.getDay()).toBe(5); // Friday
    });
  });

  describe('getWorkingDaysInMonth', () => {
    it('counts working days in a month', () => {
      // January 2025 has 23 weekdays
      const count = getWorkingDaysInMonth(2025, 0);
      expect(count).toBe(23);
    });
  });

  describe('getWorkingDaysInMonthArray', () => {
    it('returns array of working days', () => {
      const days = getWorkingDaysInMonthArray(2025, 0);
      expect(days.length).toBe(23);
      days.forEach(day => {
        expect([1, 2, 3, 4, 5]).toContain(day.getDay());
      });
    });
  });

  describe('workingDaysBetween', () => {
    it('counts working days between dates', () => {
      const start = new Date('2025-01-06'); // Monday
      const end = new Date('2025-01-10'); // Friday
      expect(workingDaysBetween(start, end)).toBe(5);
    });

    it('handles weekend spanning', () => {
      const start = new Date('2025-01-10'); // Friday
      const end = new Date('2025-01-13'); // Monday
      expect(workingDaysBetween(start, end)).toBe(2);
    });
  });

  describe('isBreakTime', () => {
    it('detects lunch break', () => {
      const lunch = new Date('2025-01-13T12:30:00'); // Monday lunch time
      expect(isBreakTime(lunch)).toBe(true);
    });

    it('returns false outside breaks', () => {
      const morning = new Date('2025-01-13T10:30:00');
      expect(isBreakTime(morning)).toBe(false);
    });
  });

  describe('getWorkDayStart and getWorkDayEnd', () => {
    it('returns work day boundaries', () => {
      const date = new Date('2025-01-13T14:30:00');
      
      const start = getWorkDayStart(date);
      expect(start.getHours()).toBe(9);
      expect(start.getMinutes()).toBe(0);
      
      const end = getWorkDayEnd(date);
      expect(end.getHours()).toBe(17);
      expect(end.getMinutes()).toBe(0);
    });
  });

  describe('getWorkingHoursPerDay', () => {
    it('calculates working hours excluding breaks', () => {
      // Default: 9-17 with 1 hour lunch = 7 hours
      expect(getWorkingHoursPerDay()).toBe(7);
    });

    it('handles custom config', () => {
      const customConfig = {
        workingDays: [1, 2, 3, 4, 5],
        hours: { start: 8, end: 18 }, // 10 hours
        breaks: [
          { start: 12, end: 13 }, // 1 hour lunch
          { start: 15, end: 15.5 } // 30 min coffee break
        ]
      };
      expect(getWorkingHoursPerDay(customConfig)).toBe(8.5);
    });
  });
});
