import { describe, it, expect } from "vitest";
import { formatDuration, timeAgo, parseDuration, formatTime } from "../src/format";

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
});
