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
});
