import { describe, it, expect } from "vitest";
import {
  getWeekNumber,
  getWeekOfMonth,
  getQuarter,
  getDayOfYear,
  getWeeksInYear,
  getDaysInMonth,
  getDaysInYear,
  getEaster,
  getMonthsInYear,
  getDaysInMonthArray,
  getWeekdaysInMonth,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getFirstDayOfYear,
  getLastDayOfYear
} from "../src/calendar";

describe("Calendar utilities", () => {
  const testDate = new Date('2025-09-13'); // Saturday, September 13, 2025

  describe("getWeekNumber", () => {
    it("returns correct ISO week number", () => {
      expect(getWeekNumber(new Date('2025-01-01'))).toBe(1);
      expect(getWeekNumber(new Date('2025-12-31'))).toBe(1); // First week of 2026
      expect(getWeekNumber(testDate)).toBeGreaterThan(30);
    });
  });

  describe("getWeekOfMonth", () => {
    it("returns correct week of month", () => {
      expect(getWeekOfMonth(new Date('2025-09-01'))).toBe(1);
      expect(getWeekOfMonth(new Date('2025-09-07'))).toBe(2);
      expect(getWeekOfMonth(testDate)).toBe(2);
    });
  });

  describe("getQuarter", () => {
    it("returns correct quarter", () => {
      expect(getQuarter(new Date('2025-01-01'))).toBe(1);
      expect(getQuarter(new Date('2025-04-01'))).toBe(2);
      expect(getQuarter(new Date('2025-07-01'))).toBe(3);
      expect(getQuarter(testDate)).toBe(3);
    });
  });

  describe("getDayOfYear", () => {
    it("returns correct day of year", () => {
      expect(getDayOfYear(new Date('2025-01-01'))).toBe(1);
      expect(getDayOfYear(new Date('2025-12-31'))).toBe(365);
      expect(getDayOfYear(testDate)).toBeGreaterThan(250);
    });
  });

  describe("getWeeksInYear", () => {
    it("returns correct number of weeks", () => {
      expect(getWeeksInYear(2025)).toBe(52);
      // Some years have 53 weeks
      expect([52, 53]).toContain(getWeeksInYear(2024));
    });
  });

  describe("getDaysInMonth", () => {
    it("returns correct days in month", () => {
      expect(getDaysInMonth(2025, 0)).toBe(31); // January
      expect(getDaysInMonth(2025, 1)).toBe(28); // February (not leap year)
      expect(getDaysInMonth(2024, 1)).toBe(29); // February (leap year)
      expect(getDaysInMonth(2025, 8)).toBe(30); // September
    });
  });

  describe("getDaysInYear", () => {
    it("returns correct days in year", () => {
      expect(getDaysInYear(2025)).toBe(365);
      expect(getDaysInYear(2024)).toBe(366); // Leap year
    });
  });

  describe("getEaster", () => {
    it("calculates Easter correctly", () => {
      const easter2025 = getEaster(2025);
      expect(easter2025.getFullYear()).toBe(2025);
      expect(easter2025.getMonth()).toBe(3); // April (0-indexed)
      expect(easter2025.getDate()).toBe(20);
    });
  });

  describe("getMonthsInYear", () => {
    it("returns all months in year", () => {
      const months = getMonthsInYear(2025);
      expect(months).toHaveLength(12);
      expect(months[0].getMonth()).toBe(0); // January
      expect(months[11].getMonth()).toBe(11); // December
    });
  });

  describe("getDaysInMonthArray", () => {
    it("returns all days in month", () => {
      const days = getDaysInMonthArray(2025, 8); // September
      expect(days).toHaveLength(30);
      expect(days[0].getDate()).toBe(1);
      expect(days[29].getDate()).toBe(30);
    });
  });

  describe("getWeekdaysInMonth", () => {
    it("returns only weekdays", () => {
      const weekdays = getWeekdaysInMonth(2025, 8); // September
      expect(weekdays.length).toBeLessThan(30);
      weekdays.forEach(day => {
        const dayOfWeek = day.getDay();
        expect(dayOfWeek).not.toBe(0); // Not Sunday
        expect(dayOfWeek).not.toBe(6); // Not Saturday
      });
    });
  });

  describe("getFirstDayOfMonth", () => {
    it("returns first day of month", () => {
      const firstDay = getFirstDayOfMonth(testDate);
      expect(firstDay.getDate()).toBe(1);
      expect(firstDay.getMonth()).toBe(testDate.getMonth());
    });
  });

  describe("getLastDayOfMonth", () => {
    it("returns last day of month", () => {
      const lastDay = getLastDayOfMonth(testDate);
      expect(lastDay.getDate()).toBe(30); // September has 30 days
      expect(lastDay.getMonth()).toBe(testDate.getMonth());
    });
  });

  describe("getFirstDayOfYear", () => {
    it("returns first day of year", () => {
      const firstDay = getFirstDayOfYear(2025);
      expect(firstDay.getMonth()).toBe(0); // January
      expect(firstDay.getDate()).toBe(1);
    });
  });

  describe("getLastDayOfYear", () => {
    it("returns last day of year", () => {
      const lastDay = getLastDayOfYear(2025);
      expect(lastDay.getMonth()).toBe(11); // December
      expect(lastDay.getDate()).toBe(31);
    });
  });
});