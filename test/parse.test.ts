import { describe, it, expect } from "vitest";
import {
  parseDate,
  parseRelativeDate,
  parseTimeAgo,
  parseCustomFormat,
  parseManyFormats
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
});