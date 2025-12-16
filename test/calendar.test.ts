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
  getLastDayOfYear,
  getNthDayOfMonth,
  getNewYearsDay,
  getMLKDay,
  getPresidentsDay,
  getMemorialDay,
  getIndependenceDay,
  getLaborDay,
  getColumbusDay,
  getVeteransDay,
  getThanksgivingDay,
  getChristmasDay,
  getGoodFriday,
  getUSHolidays,
  isUSHoliday,
  getUSHolidayName,
  getStartOfWeek,
  getEndOfWeek,
  getWeeksInMonth
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

  describe("getNthDayOfMonth", () => {
    it("returns nth occurrence of a day", () => {
      // 2nd Monday of January 2025
      const secondMonday = getNthDayOfMonth(2025, 0, 1, 2);
      expect(secondMonday?.getDate()).toBe(13);
      expect(secondMonday?.getDay()).toBe(1); // Monday
      
      // Last Friday of January 2025
      const lastFriday = getNthDayOfMonth(2025, 0, 5, -1);
      expect(lastFriday?.getDate()).toBe(31);
      expect(lastFriday?.getDay()).toBe(5); // Friday
    });

    it("returns null for invalid occurrences", () => {
      expect(getNthDayOfMonth(2025, 0, 1, 0)).toBeNull();
      expect(getNthDayOfMonth(2025, 0, 1, 6)).toBeNull(); // No 6th Monday
    });
  });

  describe("US Holiday functions", () => {
    it("getNewYearsDay returns January 1", () => {
      const newYears = getNewYearsDay(2025);
      expect(newYears.getMonth()).toBe(0);
      expect(newYears.getDate()).toBe(1);
    });

    it("getMLKDay returns 3rd Monday of January", () => {
      const mlk = getMLKDay(2025);
      expect(mlk?.getMonth()).toBe(0);
      expect(mlk?.getDay()).toBe(1); // Monday
      expect(mlk?.getDate()).toBe(20);
    });

    it("getPresidentsDay returns 3rd Monday of February", () => {
      const presidents = getPresidentsDay(2025);
      expect(presidents?.getMonth()).toBe(1);
      expect(presidents?.getDay()).toBe(1); // Monday
    });

    it("getMemorialDay returns last Monday of May", () => {
      const memorial = getMemorialDay(2025);
      expect(memorial?.getMonth()).toBe(4);
      expect(memorial?.getDay()).toBe(1); // Monday
      expect(memorial?.getDate()).toBe(26);
    });

    it("getIndependenceDay returns July 4", () => {
      const july4 = getIndependenceDay(2025);
      expect(july4.getMonth()).toBe(6);
      expect(july4.getDate()).toBe(4);
    });

    it("getLaborDay returns 1st Monday of September", () => {
      const labor = getLaborDay(2025);
      expect(labor?.getMonth()).toBe(8);
      expect(labor?.getDay()).toBe(1); // Monday
      expect(labor?.getDate()).toBe(1);
    });

    it("getThanksgivingDay returns 4th Thursday of November", () => {
      const thanksgiving = getThanksgivingDay(2025);
      expect(thanksgiving?.getMonth()).toBe(10);
      expect(thanksgiving?.getDay()).toBe(4); // Thursday
      expect(thanksgiving?.getDate()).toBe(27);
    });

    it("getChristmasDay returns December 25", () => {
      const christmas = getChristmasDay(2025);
      expect(christmas.getMonth()).toBe(11);
      expect(christmas.getDate()).toBe(25);
    });

    it("getGoodFriday returns Friday before Easter", () => {
      const goodFriday = getGoodFriday(2025);
      const easter = getEaster(2025);
      expect(goodFriday.getDay()).toBe(5); // Friday
      expect(easter.getTime() - goodFriday.getTime()).toBe(2 * 24 * 60 * 60 * 1000); // 2 days
    });

    it("getUSHolidays returns all federal holidays", () => {
      const holidays = getUSHolidays(2025);
      expect(holidays.length).toBeGreaterThanOrEqual(10);
      expect(holidays.some(h => h.name === "Thanksgiving Day")).toBe(true);
      expect(holidays.some(h => h.name === "Christmas Day")).toBe(true);
    });

    it("isUSHoliday detects holidays", () => {
      expect(isUSHoliday(new Date(2025, 11, 25))).toBe(true); // Christmas
      expect(isUSHoliday(new Date(2025, 5, 15))).toBe(false); // Random June day
    });

    it("getUSHolidayName returns holiday name", () => {
      expect(getUSHolidayName(new Date(2025, 11, 25))).toBe("Christmas Day");
      expect(getUSHolidayName(new Date(2025, 5, 15))).toBeNull();
    });
  });

  describe("Week functions", () => {
    it("getStartOfWeek returns Monday", () => {
      const wednesday = new Date(2025, 0, 8); // Wednesday
      const start = getStartOfWeek(wednesday);
      expect(start.getDay()).toBe(1); // Monday
      expect(start.getDate()).toBe(6);
    });

    it("getEndOfWeek returns Sunday", () => {
      const wednesday = new Date(2025, 0, 8); // Wednesday
      const end = getEndOfWeek(wednesday);
      expect(end.getDay()).toBe(0); // Sunday
      expect(end.getDate()).toBe(12);
    });

    it("getWeeksInMonth returns complete weeks", () => {
      const weeks = getWeeksInMonth(2025, 0); // January 2025
      expect(weeks.length).toBeGreaterThanOrEqual(4);
      weeks.forEach(week => {
        expect(week.length).toBe(7);
      });
    });
  });
});