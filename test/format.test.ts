import { describe, it, expect } from "vitest";
import { 
  formatDuration, 
  timeAgo, 
  parseDuration, 
  formatTime,
  formatDate,
  formatRelativeTime,
  formatDateRange,
  formatOrdinal,
  formatDayOrdinal,
  formatDurationCompact,
  formatCalendarDate
} from "../src/format";

describe("Format utilities", () => {
  describe("formatDuration", () => {
    it("formats basic durations correctly", () => {
      expect(formatDuration(5000)).toBe("5 seconds");
      expect(formatDuration(65000)).toBe("1 minute, 5 seconds");
      expect(formatDuration(3661000)).toBe("1 hour, 1 minute");
    });
    it("supports short format", () => {
      expect(formatDuration(5000, { short: true })).toBe("5s");
      expect(formatDuration(65000, { short: true })).toBe("1m 5s");
      expect(formatDuration(3661000, { short: true })).toBe("1h 1m");
    });
    it("respects maxUnits option", () => {
      expect(formatDuration(90061000, { maxUnits: 1 })).toBe("1 day");
      expect(formatDuration(90061000, { maxUnits: 3 })).toBe("1 day, 1 hour, 1 minute");
    });
    it("includes milliseconds when requested", () => {
      expect(formatDuration(1500, { includeMs: true })).toBe("1 second, 500 milliseconds");
    });
  });

  describe("timeAgo", () => {
    it("handles past dates", () => {
      const past = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago
      expect(timeAgo(past)).toMatch(/5 minutes ago/);
    });
    it("handles future dates", () => {
      const future = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes from now
      expect(timeAgo(future)).toMatch(/in 30 minutes/);
    });
    it("supports short format", () => {
      const past = new Date(Date.now() - 1000 * 60 * 5);
      expect(timeAgo(past, { short: true })).toMatch(/5m ago/);
    });
  });

  describe("parseDuration", () => {
    it("parses simple duration strings", () => {
      expect(parseDuration("5s")).toBe(5000);
      expect(parseDuration("1m 30s")).toBe(90000);
      expect(parseDuration("2h")).toBe(7200000);
    });
    it("handles various unit formats", () => {
      expect(parseDuration("1 hour 30 minutes")).toBe(5400000);
      expect(parseDuration("2d 3h")).toBe(183600000);
    });
  });

  describe("formatTime", () => {
    it("formats time in different formats", () => {
      const date = new Date('2025-09-13T14:30:00Z');
      expect(formatTime(date, '24h')).toMatch(/\d{2}:\d{2}/);
      expect(formatTime(date, '12h')).toMatch(/\d{1,2}:\d{2} [AP]M/);
      expect(formatTime(date, 'iso')).toBe('2025-09-13T14:30:00.000Z');
    });
  });

  describe("formatDate", () => {
    it("formats dates with pattern strings", () => {
      const date = new Date(2025, 0, 15, 14, 30, 45, 123); // Jan 15, 2025, 2:30:45.123 PM
      
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2025-01-15');
      expect(formatDate(date, 'MMM D, YYYY')).toBe('Jan 15, 2025');
      expect(formatDate(date, 'MMMM D, YYYY')).toBe('January 15, 2025');
      expect(formatDate(date, 'DD/MM/YYYY')).toBe('15/01/2025');
      expect(formatDate(date, 'M/D/YY')).toBe('1/15/25');
    });

    it("formats times with pattern strings", () => {
      const date = new Date(2025, 0, 15, 14, 30, 45, 123);
      
      expect(formatDate(date, 'HH:mm:ss')).toBe('14:30:45');
      expect(formatDate(date, 'h:mm A')).toBe('2:30 PM');
      expect(formatDate(date, 'hh:mm a')).toBe('02:30 pm');
    });

    it("formats day names", () => {
      const date = new Date(2025, 0, 15); // Wednesday
      
      expect(formatDate(date, 'DDDD')).toBe('Wednesday');
      expect(formatDate(date, 'DDD')).toBe('Wed');
    });
  });

  describe("formatRelativeTime", () => {
    it("formats past times", () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(yesterday, now)).toBe('yesterday');
    });

    it("formats future times", () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(tomorrow, now)).toBe('tomorrow');
    });
  });

  describe("formatDateRange", () => {
    it("formats same-day ranges", () => {
      const start = new Date(2025, 0, 15);
      const end = new Date(2025, 0, 15);
      expect(formatDateRange(start, end)).toMatch(/Jan 15, 2025/);
    });

    it("formats same-year ranges", () => {
      const start = new Date(2025, 0, 15);
      const end = new Date(2025, 0, 20);
      const result = formatDateRange(start, end);
      expect(result).toMatch(/Jan 15/);
      expect(result).toMatch(/Jan 20/);
    });

    it("formats cross-year ranges", () => {
      const start = new Date(2024, 11, 25);
      const end = new Date(2025, 0, 5);
      const result = formatDateRange(start, end);
      expect(result).toMatch(/Dec 25/);
      expect(result).toMatch(/Jan 5/);
    });
  });

  describe("formatOrdinal", () => {
    it("formats ordinals correctly", () => {
      expect(formatOrdinal(1)).toBe('1st');
      expect(formatOrdinal(2)).toBe('2nd');
      expect(formatOrdinal(3)).toBe('3rd');
      expect(formatOrdinal(4)).toBe('4th');
      expect(formatOrdinal(11)).toBe('11th');
      expect(formatOrdinal(12)).toBe('12th');
      expect(formatOrdinal(13)).toBe('13th');
      expect(formatOrdinal(21)).toBe('21st');
      expect(formatOrdinal(22)).toBe('22nd');
      expect(formatOrdinal(23)).toBe('23rd');
    });
  });

  describe("formatDayOrdinal", () => {
    it("formats day of month as ordinal", () => {
      expect(formatDayOrdinal(new Date(2025, 0, 1))).toBe('1st');
      expect(formatDayOrdinal(new Date(2025, 0, 15))).toBe('15th');
    });
  });

  describe("formatDurationCompact", () => {
    it("formats duration in HH:MM:SS format", () => {
      expect(formatDurationCompact(3661000)).toBe('01:01:01');
      expect(formatDurationCompact(61000)).toBe('00:01:01');
      expect(formatDurationCompact(5000)).toBe('00:00:05');
    });

    it("can hide hours when zero", () => {
      expect(formatDurationCompact(61000, false)).toBe('01:01');
    });
  });

  describe("formatCalendarDate", () => {
    it("formats today", () => {
      expect(formatCalendarDate(new Date())).toBe('Today');
    });

    it("formats yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatCalendarDate(yesterday)).toBe('Yesterday');
    });

    it("formats tomorrow", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatCalendarDate(tomorrow)).toBe('Tomorrow');
    });

    it("formats upcoming days of week", () => {
      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);
      expect(formatCalendarDate(inThreeDays)).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });
  });
});
