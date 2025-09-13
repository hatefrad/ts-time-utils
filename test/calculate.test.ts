import { describe, it, expect } from "vitest";
import {
  differenceInUnits,
  addTime,
  subtractTime,
  startOf,
  endOf,
  businessDaysBetween,
  isBetween
} from "../src/calculate";

describe("Calculate utilities", () => {
  describe("differenceInUnits", () => {
    it("calculates differences in various units", () => {
      const d1 = new Date("2025-09-01");
      const d2 = new Date("2025-09-11");
      expect(differenceInUnits(d1, d2, "days")).toBeCloseTo(10);
      expect(differenceInUnits(d1, d2, "hours")).toBeCloseTo(240);
    });
    it("returns integers when precise is false", () => {
      const d1 = new Date("2025-09-01T12:00:00");
      const d2 = new Date("2025-09-02T06:00:00");
      expect(differenceInUnits(d1, d2, "days", false)).toBe(0);
      expect(differenceInUnits(d1, d2, "days", true)).toBeCloseTo(0.75);
    });
  });

  describe("addTime and subtractTime", () => {
    it("adds time correctly", () => {
      const date = new Date('2025-09-13');
      const result = addTime(date, 5, 'days');
      expect(result.getDate()).toBe(18);
    });
    it("subtracts time correctly", () => {
      const date = new Date('2025-09-13T15:30:00');
      const result = subtractTime(date, 3, 'hours');
      expect(result.getHours()).toBe(12); // 15 - 3 = 12
    });
  });

  describe("startOf and endOf", () => {
    it("gets start of day", () => {
      const date = new Date('2025-09-13T15:30:45');
      const start = startOf(date, 'day');
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
    });
    it("gets end of day", () => {
      const date = new Date('2025-09-13T15:30:45');
      const end = endOf(date, 'day');
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });
  });

  describe("businessDaysBetween", () => {
    it("calculates business days correctly", () => {
      const start = new Date('2025-09-08'); // Monday
      const end = new Date('2025-09-12'); // Friday
      expect(businessDaysBetween(start, end)).toBe(5);
    });
  });

  describe("isBetween", () => {
    it("checks if date is between two dates", () => {
      const date = new Date('2025-09-10');
      const start = new Date('2025-09-05');
      const end = new Date('2025-09-15');
      expect(isBetween(date, start, end)).toBe(true);
      expect(isBetween(start, date, end)).toBe(false);
    });
  });
});
