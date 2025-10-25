import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createCountdown,
  getRemainingTime,
  formatCountdown,
  isExpired,
  getProgressPercentage,
  getTimeUntil,
  createDeadline
} from '../src/countdown';

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRemainingTime', () => {
    it('should calculate remaining time correctly', () => {
      const target = new Date('2024-12-31T23:59:59');
      const from = new Date('2024-12-31T00:00:00');
      
      const remaining = getRemainingTime(target, from);
      
      expect(remaining.hours).toBe(23);
      expect(remaining.minutes).toBe(59);
      expect(remaining.seconds).toBe(59);
      expect(remaining.isExpired).toBe(false);
    });

    it('should mark as expired when target is in past', () => {
      const target = new Date('2024-01-01');
      const from = new Date('2024-12-31');
      
      const remaining = getRemainingTime(target, from);
      
      expect(remaining.isExpired).toBe(true);
    });

    it('should calculate days and weeks', () => {
      const target = new Date('2024-02-01');
      const from = new Date('2024-01-01');
      
      const remaining = getRemainingTime(target, from);
      
      expect(remaining.totalDays).toBe(31);
      expect(remaining.weeks).toBeGreaterThan(0);
    });

    it('should handle milliseconds', () => {
      const target = new Date('2024-01-01T00:00:01.500');
      const from = new Date('2024-01-01T00:00:00.000');
      
      const remaining = getRemainingTime(target, from);
      
      expect(remaining.totalMilliseconds).toBe(1500);
      expect(remaining.seconds).toBe(1);
      expect(remaining.milliseconds).toBe(500);
    });
  });

  describe('formatCountdown', () => {
    it('should format countdown with default options', () => {
      const target = new Date('2024-01-15T12:30:45');
      const from = new Date('2024-01-01T00:00:00');
      
      const formatted = formatCountdown(target, { from });
      
      expect(formatted).toContain('d');
      expect(formatted).toContain('h');
      expect(formatted).toContain('m');
      expect(formatted).toContain('s');
    });

    it('should format with long format', () => {
      const target = new Date('2024-01-03T02:30:15');
      const from = new Date('2024-01-01T00:00:00');
      
      const formatted = formatCountdown(target, {
        from,
        short: false
      });
      
      expect(formatted).toContain('day');
      expect(formatted).toContain('hour');
    });

    it('should respect maxUnits option', () => {
      const target = new Date('2024-01-15T12:30:45');
      const from = new Date('2024-01-01T00:00:00');
      
      const formatted = formatCountdown(target, {
        maxUnits: 2
      } as any);
      
      const parts = formatted.split(' ');
      expect(parts.length).toBeLessThanOrEqual(2);
    });

    it('should show only specified units', () => {
      const target = new Date('2024-01-02T00:00:00');
      const from = new Date('2024-01-01T00:00:00');
      
      const formatted = formatCountdown(target, {
        units: ['days', 'hours']
      } as any);
      
      expect(formatted).toContain('d');
      expect(formatted).not.toContain('m');
      expect(formatted).not.toContain('s');
    });

    it('should return "Expired" for past dates', () => {
      const target = new Date('2024-01-01');
      const from = new Date('2024-12-31');
      
      const formatted = formatCountdown(target, from as any);
      
      expect(formatted).toBe('Expired');
    });

    it('should show zero values when showZero is true', () => {
      const target = new Date('2024-01-01T01:00:00');
      const from = new Date('2024-01-01T00:00:00');
      
      const formatted = formatCountdown(target, {
        from,
        units: ['days', 'hours', 'minutes'],
        showZero: true
      });
      
      expect(formatted).toContain('0d');
    });
  });

  describe('isExpired', () => {
    it('should return true for past dates', () => {
      expect(isExpired(new Date('2020-01-01'), new Date('2024-01-01'))).toBe(true);
    });

    it('should return false for future dates', () => {
      expect(isExpired(new Date('2030-01-01'), new Date('2024-01-01'))).toBe(false);
    });

    it('should handle same date', () => {
      const date = new Date('2024-01-01');
      expect(isExpired(date, date)).toBe(false);
    });
  });

  describe('getProgressPercentage', () => {
    it('should calculate 50% progress', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const current = new Date('2024-01-16');
      
      const progress = getProgressPercentage(start, end, current);
      
      expect(progress).toBeCloseTo(50, 0);
    });

    it('should return 0% for date before start', () => {
      const start = new Date('2024-01-10');
      const end = new Date('2024-01-31');
      const current = new Date('2024-01-01');
      
      const progress = getProgressPercentage(start, end, current);
      
      expect(progress).toBe(0);
    });

    it('should return 100% for date after end', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const current = new Date('2024-02-15');
      
      const progress = getProgressPercentage(start, end, current);
      
      expect(progress).toBe(100);
    });

    it('should throw error if start is after end', () => {
      const start = new Date('2024-01-31');
      const end = new Date('2024-01-01');
      const current = new Date('2024-01-15');
      
      expect(() => getProgressPercentage(start, end, current)).toThrow();
    });
  });

  describe('getTimeUntil', () => {
    it('should get time in days', () => {
      const target = new Date('2024-01-10');
      const from = new Date('2024-01-01');
      
      const days = getTimeUntil(target, 'days', from);
      
      expect(days).toBe(9);
    });

    it('should get time in hours', () => {
      const target = new Date('2024-01-01T12:00:00');
      const from = new Date('2024-01-01T00:00:00');
      
      const hours = getTimeUntil(target, 'hours', from);
      
      expect(hours).toBe(12);
    });

    it('should get time in weeks', () => {
      const target = new Date('2024-01-15');
      const from = new Date('2024-01-01');
      
      const weeks = getTimeUntil(target, 'weeks', from);
      
      expect(weeks).toBe(2);
    });

    it('should return negative value for past dates', () => {
      const target = new Date('2024-01-01');
      const from = new Date('2024-01-10');
      
      const days = getTimeUntil(target, 'days', from);
      
      expect(days).toBeLessThan(0);
    });
  });

  describe('createCountdown', () => {
    it('should create countdown instance', () => {
      const target = new Date(Date.now() + 10000);
      const countdown = createCountdown(target);
      
      expect(countdown.isRunning()).toBe(false);
      expect(countdown.isExpired()).toBe(false);
    });

    it('should call onTick callback', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00'));
      const target = new Date('2024-01-01T00:00:10');
      const onTick = vi.fn();
      
      const countdown = createCountdown(target, { onTick, interval: 1000 });
      countdown.start();
      
      vi.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalled();
      
      countdown.stop();
    });

    it('should call onComplete when countdown finishes', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00'));
      const target = new Date('2024-01-01T00:00:02');
      const onComplete = vi.fn();
      
      const countdown = createCountdown(target, { onComplete, interval: 1000 });
      countdown.start();
      
      vi.advanceTimersByTime(3000);
      expect(onComplete).toHaveBeenCalled();
    });

    it('should stop countdown', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00'));
      const target = new Date('2024-01-01T00:00:10');
      const onTick = vi.fn();
      
      const countdown = createCountdown(target, { onTick, interval: 1000 });
      countdown.start();
      expect(countdown.isRunning()).toBe(true);
      
      countdown.stop();
      expect(countdown.isRunning()).toBe(false);
    });

    it('should reset countdown with new target', () => {
      const target1 = new Date(Date.now() + 10000);
      const target2 = new Date(Date.now() + 20000);
      
      const countdown = createCountdown(target1);
      countdown.reset(target2);
      
      const remaining = countdown.getRemaining();
      expect(remaining.totalMilliseconds).toBeGreaterThan(15000);
    });

    it('should call onExpired for expired dates', () => {
      const target = new Date('2020-01-01');
      const onExpired = vi.fn();
      
      const countdown = createCountdown(target, { onExpired });
      countdown.start();
      
      expect(onExpired).toHaveBeenCalled();
    });
  });

  describe('createDeadline', () => {
    it('should create deadline with helper methods', () => {
      const target = new Date('2024-12-31');
      const deadline = createDeadline(target);
      
      expect(deadline.target).toEqual(target);
      expect(typeof deadline.daysRemaining).toBe('function');
      expect(typeof deadline.hoursRemaining).toBe('function');
      expect(typeof deadline.formatRemaining).toBe('function');
    });

    it('should calculate days remaining', () => {
      const target = new Date('2024-01-10');
      vi.setSystemTime(new Date('2024-01-01'));
      
      const deadline = createDeadline(target);
      
      expect(deadline.daysRemaining()).toBe(9);
    });

    it('should format remaining time', () => {
      const target = new Date('2024-01-10');
      vi.setSystemTime(new Date('2024-01-01'));
      
      const deadline = createDeadline(target);
      const formatted = deadline.formatRemaining();
      
      expect(formatted).toContain('d');
    });

    it('should calculate progress from start date', () => {
      const start = new Date('2024-01-01');
      const target = new Date('2024-01-31');
      vi.setSystemTime(new Date('2024-01-16'));
      
      const deadline = createDeadline(target);
      const progress = deadline.progressFrom(start);
      
      expect(progress).toBeCloseTo(50, 0);
    });

    it('should check if expired', () => {
      const target = new Date('2020-01-01');
      const deadline = createDeadline(target);
      
      expect(deadline.isExpired()).toBe(true);
    });
  });
});
