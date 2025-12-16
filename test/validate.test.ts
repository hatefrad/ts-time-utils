import { describe, it, expect } from "vitest";
import {
  isValidDate,
  isLeapYear,
  isToday,
  isWeekend,
  isFuture,
  isPast,
  isYesterday,
  isTomorrow,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isBusinessDay,
  isInLastNDays,
  isInNextNDays,
  isWeekday,
  isValidTimeString,
  isValidISOString
} from "../src/validate";

describe("Validation utilities", () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  describe("isValidDate", () => {
    it("validates dates correctly", () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('2025-09-13')).toBe(true);
      expect(isValidDate('not a date')).toBe(false);
    });
  });

  describe("isLeapYear", () => {
    it("identifies leap years correctly", () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe("isToday", () => {
    it("identifies today correctly", () => {
      expect(isToday(today)).toBe(true);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe("isWeekend", () => {
    it("identifies weekends correctly", () => {
      const saturday = new Date('2025-09-13'); // Saturday
      const monday = new Date('2025-09-08'); // Monday
      expect(isWeekend(saturday)).toBe(true);
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe("isPast and isFuture", () => {
    it("detects past and future dates", () => {
      expect(isPast(yesterday)).toBe(true);
      expect(isPast(tomorrow)).toBe(false);
      expect(isFuture(tomorrow)).toBe(true);
      expect(isFuture(yesterday)).toBe(false);
    });
  });

  describe("isYesterday and isTomorrow", () => {
    it("detects yesterday and tomorrow", () => {
      expect(isYesterday(yesterday)).toBe(true);
      expect(isYesterday(today)).toBe(false);
      expect(isTomorrow(tomorrow)).toBe(true);
      expect(isTomorrow(today)).toBe(false);
    });
  });

  describe("isSameDay", () => {
    it("detects same day", () => {
      expect(isSameDay(today, new Date(today))).toBe(true);
      expect(isSameDay(today, yesterday)).toBe(false);
    });
  });

  describe("isWeekday", () => {
    it("detects weekdays", () => {
      const monday = new Date('2025-09-08'); // Monday
      const saturday = new Date('2025-09-13'); // Saturday
      expect(isWeekday(monday)).toBe(true);
      expect(isWeekday(saturday)).toBe(false);
    });
  });

  describe("isValidTimeString", () => {
    it("validates time strings", () => {
      expect(isValidTimeString("23:59")).toBe(true);
      expect(isValidTimeString("00:00:00")).toBe(true);
      expect(isValidTimeString("24:00")).toBe(false);
      expect(isValidTimeString("12:60")).toBe(false);
    });
  });

  describe("isValidISOString", () => {
    it("validates ISO strings", () => {
      expect(isValidISOString("2025-09-13T14:30:00.000Z")).toBe(true);
      expect(isValidISOString("2025-09-13T14:30:00Z")).toBe(true);
      expect(isValidISOString("2025-09-13 14:30:00")).toBe(false);
    });
  });

  describe("isSameWeek", () => {
    it("detects same week (ISO Monday-Sunday)", () => {
      // Monday and Friday of same week
      const monday = new Date('2025-01-06'); // Monday
      const friday = new Date('2025-01-10'); // Friday same week
      expect(isSameWeek(monday, friday)).toBe(true);

      // Sunday and next Monday are different weeks
      const sunday = new Date('2025-01-12'); // Sunday
      const nextMonday = new Date('2025-01-13'); // Next Monday
      expect(isSameWeek(sunday, nextMonday)).toBe(false);
    });
  });

  describe("isSameMonth", () => {
    it("detects same month", () => {
      expect(isSameMonth(new Date('2025-01-01'), new Date('2025-01-31'))).toBe(true);
      expect(isSameMonth(new Date('2025-01-31'), new Date('2025-02-01'))).toBe(false);
      // Same month different years
      expect(isSameMonth(new Date('2025-01-15'), new Date('2024-01-15'))).toBe(false);
    });
  });

  describe("isSameYear", () => {
    it("detects same year", () => {
      expect(isSameYear(new Date('2025-01-01'), new Date('2025-12-31'))).toBe(true);
      expect(isSameYear(new Date('2025-12-31'), new Date('2026-01-01'))).toBe(false);
    });
  });

  describe("isThisWeek", () => {
    it("detects current week", () => {
      expect(isThisWeek(today)).toBe(true);
      // A date 2 weeks ago should not be this week
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);
      expect(isThisWeek(twoWeeksAgo)).toBe(false);
    });
  });

  describe("isThisMonth", () => {
    it("detects current month", () => {
      expect(isThisMonth(today)).toBe(true);
      // A date from a different year same month should not be this month
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      expect(isThisMonth(lastYear)).toBe(false);
    });
  });

  describe("isThisYear", () => {
    it("detects current year", () => {
      expect(isThisYear(today)).toBe(true);
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      expect(isThisYear(lastYear)).toBe(false);
    });
  });

  describe("isBusinessDay", () => {
    it("detects business days (weekdays)", () => {
      const monday = new Date('2025-01-06'); // Monday
      const saturday = new Date('2025-01-11'); // Saturday
      expect(isBusinessDay(monday)).toBe(true);
      expect(isBusinessDay(saturday)).toBe(false);
    });

    it("excludes holidays", () => {
      const monday = new Date('2025-01-06'); // Monday
      const holidays = [new Date('2025-01-06')]; // Same Monday is a holiday
      expect(isBusinessDay(monday, holidays)).toBe(false);
    });
  });

  describe("isInLastNDays", () => {
    it("detects dates in last N days", () => {
      expect(isInLastNDays(today, 7)).toBe(true);
      expect(isInLastNDays(yesterday, 7)).toBe(true);
      
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);
      expect(isInLastNDays(twoWeeksAgo, 7)).toBe(false);
    });
  });

  describe("isInNextNDays", () => {
    it("detects dates in next N days", () => {
      expect(isInNextNDays(today, 7)).toBe(true);
      expect(isInNextNDays(tomorrow, 7)).toBe(true);
      
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(today.getDate() + 14);
      expect(isInNextNDays(twoWeeksFromNow, 7)).toBe(false);
    });
  });
});
