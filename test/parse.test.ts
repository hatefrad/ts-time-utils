import { describe, it, expect } from "vitest";
import {
  parseDate,
  parseRelativeDate,
  parseTimeAgo,
  parseCustomFormat,
  parseManyFormats,
  parseISO8601Duration,
  parseISO8601DurationToMs,
  parseTime,
  guessDateFormat,
  parseAutoFormat,
  parseRangeEndpoint
} from "../src/parse";

describe("Parse utilities", () => {
  describe("parseDate", () => {
    it("parses valid dates", () => {
      expect(parseDate('2025-09-13')).toEqual(new Date('2025-09-13'));
      expect(parseDate('09/13/2025')).toEqual(new Date('09/13/2025'));
      expect(parseDate(1726200000000)).toEqual(new Date(1726200000000));
      expect(parseDate(new Date('2025-09-13'))).toEqual(new Date('2025-09-13'));
    });

    it("returns null for invalid dates", () => {
      expect(parseDate('invalid date')).toBeNull();
      expect(parseDate('not a date')).toBeNull();
      expect(parseDate('2025-02-30')).toBeNull(); // February 30th doesn't exist
    });

    it("handles various formats", () => {
      expect(parseDate('20250913')).not.toBeNull();
      expect(parseDate('13-09-2025')).not.toBeNull();
    });
  });

  describe("parseRelativeDate", () => {
    it("parses simple relative dates", () => {
      const today = new Date();
      const todayParsed = parseRelativeDate('today');
      expect(todayParsed?.getDate()).toBe(today.getDate());
      expect(todayParsed?.getMonth()).toBe(today.getMonth());
      expect(todayParsed?.getFullYear()).toBe(today.getFullYear());

      const tomorrow = parseRelativeDate('tomorrow');
      expect(tomorrow?.getDate()).toBe(today.getDate() + 1);

      const yesterday = parseRelativeDate('yesterday');
      expect(yesterday?.getDate()).toBe(today.getDate() - 1);
    });

    it("parses time ago format", () => {
      const result = parseRelativeDate('5 days ago');
      expect(result).not.toBeNull();
      
      const result2 = parseRelativeDate('in 3 hours');
      expect(result2).not.toBeNull();
    });

    it("parses next/last weekday", () => {
      const nextMonday = parseRelativeDate('next monday');
      expect(nextMonday).not.toBeNull();
      expect(nextMonday?.getDay()).toBe(1); // Monday

      const lastFriday = parseRelativeDate('last friday');
      expect(lastFriday).not.toBeNull();
      expect(lastFriday?.getDay()).toBe(5); // Friday
    });

    it("returns null for unrecognized formats", () => {
      expect(parseRelativeDate('unknown format')).toBeNull();
    });
  });

  describe("parseTimeAgo", () => {
    it("parses time ago strings", () => {
      const result = parseTimeAgo('5 minutes ago');
      expect(result).not.toBeNull();
      
      const result2 = parseTimeAgo('2 hours ago');
      expect(result2).not.toBeNull();
    });

    it("handles 'just now'", () => {
      const result = parseTimeAgo('just now');
      expect(result).not.toBeNull();
    });

    it("returns null for invalid formats", () => {
      expect(parseTimeAgo('invalid')).toBeNull();
      expect(parseTimeAgo('in 5 minutes')).toBeNull(); // Future time
    });
  });

  describe("parseCustomFormat", () => {
    it("parses YYYY-MM-DD format", () => {
      const result = parseCustomFormat('2025-09-13', 'YYYY-MM-DD');
      expect(result).toEqual(new Date(2025, 8, 13)); // Month is 0-indexed
    });

    it("parses DD/MM/YYYY format", () => {
      const result = parseCustomFormat('13/09/2025', 'DD/MM/YYYY');
      expect(result).toEqual(new Date(2025, 8, 13));
    });

    it("parses MM/DD/YYYY format", () => {
      const result = parseCustomFormat('09/13/2025', 'MM/DD/YYYY');
      expect(result).toEqual(new Date(2025, 8, 13));
    });

    it("returns null for unsupported formats", () => {
      expect(parseCustomFormat('2025-09-13', 'UNSUPPORTED')).toBeNull();
    });

    it("returns null for invalid dates", () => {
      expect(parseCustomFormat('2025-02-30', 'YYYY-MM-DD')).toBeNull(); // February 30th doesn't exist
    });
  });

  describe("parseManyFormats", () => {
    it("tries multiple formats until one works", () => {
      const formats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
      
      expect(parseManyFormats('13/09/2025', formats)).toEqual(new Date(2025, 8, 13));
      expect(parseManyFormats('2025-09-13', formats)).toEqual(new Date(2025, 8, 13));
    });

    it("returns null if no format works", () => {
      const formats = ['DD/MM/YYYY', 'MM/DD/YYYY'];
      expect(parseManyFormats('invalid date', formats)).toBeNull();
    });
  });

  describe("parseISO8601Duration", () => {
    it("parses simple durations", () => {
      const result = parseISO8601Duration('P1Y');
      expect(result).toEqual({
        years: 1, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0
      });
    });

    it("parses complex durations", () => {
      const result = parseISO8601Duration('P1Y2M3DT4H5M6S');
      expect(result).toEqual({
        years: 1, months: 2, weeks: 0, days: 3, hours: 4, minutes: 5, seconds: 6
      });
    });

    it("parses week format", () => {
      const result = parseISO8601Duration('P3W');
      expect(result?.weeks).toBe(3);
    });

    it("parses time-only durations", () => {
      const result = parseISO8601Duration('PT1H30M');
      expect(result).toEqual({
        years: 0, months: 0, weeks: 0, days: 0, hours: 1, minutes: 30, seconds: 0
      });
    });

    it("returns null for invalid durations", () => {
      expect(parseISO8601Duration('invalid')).toBeNull();
      expect(parseISO8601Duration('1Y2M3D')).toBeNull(); // Missing P prefix
    });
  });

  describe("parseISO8601DurationToMs", () => {
    it("converts durations to milliseconds", () => {
      expect(parseISO8601DurationToMs('PT1H')).toBe(3600000);
      expect(parseISO8601DurationToMs('PT1M')).toBe(60000);
      expect(parseISO8601DurationToMs('PT1S')).toBe(1000);
      expect(parseISO8601DurationToMs('P1D')).toBe(86400000);
    });

    it("returns null for invalid input", () => {
      expect(parseISO8601DurationToMs('invalid')).toBeNull();
    });
  });

  describe("parseTime", () => {
    it("parses 24-hour format", () => {
      expect(parseTime('14:30')).toEqual({ hours: 14, minutes: 30, seconds: 0 });
      expect(parseTime('14:30:45')).toEqual({ hours: 14, minutes: 30, seconds: 45 });
      expect(parseTime('00:00')).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });

    it("parses 12-hour format", () => {
      expect(parseTime('2:30 PM')).toEqual({ hours: 14, minutes: 30, seconds: 0 });
      expect(parseTime('12:00 AM')).toEqual({ hours: 0, minutes: 0, seconds: 0 });
      expect(parseTime('12:00 PM')).toEqual({ hours: 12, minutes: 0, seconds: 0 });
    });

    it("returns null for invalid times", () => {
      expect(parseTime('25:00')).toBeNull();
      expect(parseTime('12:60')).toBeNull();
      expect(parseTime('invalid')).toBeNull();
    });
  });

  describe("guessDateFormat", () => {
    it("detects YYYY-MM-DD format", () => {
      expect(guessDateFormat('2025-09-13')).toBe('YYYY-MM-DD');
    });

    it("detects slash-separated formats", () => {
      expect(guessDateFormat('25/09/2025')).toBe('DD/MM/YYYY'); // 25 > 12, must be day first
      expect(guessDateFormat('09/25/2025')).toBe('MM/DD/YYYY'); // 25 > 12, must be day second
    });

    it("detects ISO 8601 with time", () => {
      expect(guessDateFormat('2025-09-13T14:30:00Z')).toBe('ISO8601');
    });

    it("returns null for unrecognized formats", () => {
      expect(guessDateFormat('invalid')).toBeNull();
    });
  });

  describe("parseAutoFormat", () => {
    it("auto-detects and parses dates", () => {
      expect(parseAutoFormat('2025-09-13')).toEqual(new Date(2025, 8, 13));
      expect(parseAutoFormat('20250913')).toEqual(new Date(2025, 8, 13));
    });
  });

  describe("parseRangeEndpoint", () => {
    it("parses start of periods", () => {
      const now = new Date();
      
      const startOfMonth = parseRangeEndpoint('start of month');
      expect(startOfMonth?.getDate()).toBe(1);
      expect(startOfMonth?.getHours()).toBe(0);
      
      const startOfYear = parseRangeEndpoint('start of year');
      expect(startOfYear?.getMonth()).toBe(0);
      expect(startOfYear?.getDate()).toBe(1);
    });

    it("parses end of periods", () => {
      const endOfMonth = parseRangeEndpoint('end of month');
      expect(endOfMonth?.getHours()).toBe(23);
      expect(endOfMonth?.getMinutes()).toBe(59);
      
      const endOfYear = parseRangeEndpoint('end of year');
      expect(endOfYear?.getMonth()).toBe(11);
      expect(endOfYear?.getDate()).toBe(31);
    });

    it("returns null for unrecognized input", () => {
      expect(parseRangeEndpoint('invalid')).toBeNull();
    });
  });
});