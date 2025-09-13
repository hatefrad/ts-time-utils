import { describe, it, expect } from "vitest";
import {
  calculateAge,
  getAgeInUnits,
  getLifeStage,
  getNextBirthday,
  getDaysUntilBirthday,
  isBirthday
} from "../src/age";

describe("Age utilities", () => {
  const referenceDate = new Date('2025-09-13'); // Saturday, September 13, 2025
  const birthDate = new Date('1990-03-15'); // March 15, 1990

  describe("calculateAge", () => {
    it("calculates detailed age correctly", () => {
      const age = calculateAge(birthDate, referenceDate);
      expect(age.years).toBe(35);
      expect(age.months).toBe(5);
      expect(age.days).toBeGreaterThanOrEqual(28);
      expect(age.totalDays).toBeGreaterThan(12000);
      expect(age.totalMonths).toBe(35 * 12 + 5);
    });

    it("handles edge cases", () => {
      const sameDayAge = calculateAge(referenceDate, referenceDate);
      expect(sameDayAge.years).toBe(0);
      expect(sameDayAge.months).toBe(0);
      expect(sameDayAge.days).toBe(0);
    });
  });

  describe("getAgeInUnits", () => {
    it("returns age in different units", () => {
      expect(getAgeInUnits(birthDate, 'years', referenceDate)).toBe(35);
      expect(getAgeInUnits(birthDate, 'days', referenceDate)).toBeGreaterThan(12000);
      expect(getAgeInUnits(birthDate, 'hours', referenceDate)).toBeGreaterThan(300000);
    });
  });

  describe("getLifeStage", () => {
    it("determines life stages correctly", () => {
      expect(getLifeStage(new Date('2024-01-01'), referenceDate)).toBe('infant');
      expect(getLifeStage(new Date('2015-01-01'), referenceDate)).toBe('child');
      expect(getLifeStage(new Date('2010-01-01'), referenceDate)).toBe('teen');
      expect(getLifeStage(new Date('1990-01-01'), referenceDate)).toBe('adult');
      expect(getLifeStage(new Date('1950-01-01'), referenceDate)).toBe('senior');
    });
  });

  describe("getNextBirthday", () => {
    it("gets next birthday correctly", () => {
      const nextBirthday = getNextBirthday(new Date('1990-03-15'), new Date('2025-01-01'));
      expect(nextBirthday.getFullYear()).toBe(2025);
      expect(nextBirthday.getMonth()).toBe(2); // March (0-indexed)
      expect(nextBirthday.getDate()).toBe(15);
    });

    it("gets next year's birthday if already passed", () => {
      const nextBirthday = getNextBirthday(new Date('1990-03-15'), new Date('2025-06-01'));
      expect(nextBirthday.getFullYear()).toBe(2026);
    });
  });

  describe("getDaysUntilBirthday", () => {
    it("calculates days until next birthday", () => {
      const days = getDaysUntilBirthday(new Date('1990-03-15'), new Date('2025-03-01'));
      expect(days).toBe(14); // March 15 - March 1
    });
  });

  describe("isBirthday", () => {
    it("detects birthdays correctly", () => {
      expect(isBirthday(new Date('1990-03-15'), new Date('2025-03-15'))).toBe(true);
      expect(isBirthday(new Date('1990-03-15'), new Date('2025-03-16'))).toBe(false);
    });
  });
});