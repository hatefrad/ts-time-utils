import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_WORKING_HOURS,
  isWorkingDay,
  isWorkingTime,
  nextWorkingTime,
  workingTimeBetween,
  addWorkingHours
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
});
