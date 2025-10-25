import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseNaturalDate,
  parseRelativePhrase,
  extractDatesFromText,
  suggestDateFromContext
} from '../src/naturalLanguage';

describe('NaturalLanguage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  describe('parseNaturalDate', () => {
    it('should parse "tomorrow"', () => {
      const result = parseNaturalDate('tomorrow');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(16);
    });

    it('should parse "yesterday"', () => {
      const result = parseNaturalDate('yesterday');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(14);
    });

    it('should parse "today"', () => {
      const result = parseNaturalDate('today');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(15);
    });

    it('should parse "next Monday"', () => {
      const result = parseNaturalDate('next Monday');
      expect(result).not.toBeNull();
      expect(result!.getDay()).toBe(1); // Monday
    });

    it('should parse "last Friday"', () => {
      const result = parseNaturalDate('last Friday');
      expect(result).not.toBeNull();
      expect(result!.getDay()).toBe(5); // Friday
      expect(result!.getTime()).toBeLessThan(new Date('2024-01-15').getTime());
    });

    it('should parse "in 2 weeks"', () => {
      const result = parseNaturalDate('in 2 weeks');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(29);
    });

    it('should parse "3 days ago"', () => {
      const result = parseNaturalDate('3 days ago');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(12);
    });

    it('should return null for unparseable input', () => {
      const result = parseNaturalDate('not a date');
      expect(result).toBeNull();
    });
  });

  describe('parseRelativePhrase', () => {
    it('should parse "in 2 hours"', () => {
      const result = parseRelativePhrase('in 2 hours');
      expect(result).not.toBeNull();
      expect(result!.getHours()).toBe(14);
    });

    it('should parse "5 minutes ago"', () => {
      const result = parseRelativePhrase('5 minutes ago');
      expect(result).not.toBeNull();
      expect(result!.getMinutes()).toBe(55);
    });

    it('should parse "2 weeks from now"', () => {
      const result = parseRelativePhrase('2 weeks from now');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(29);
    });

    it('should parse "now"', () => {
      const result = parseRelativePhrase('now');
      expect(result).not.toBeNull();
      expect(result!.getTime()).toBe(new Date('2024-01-15T12:00:00').getTime());
    });

    it('should parse "next week"', () => {
      const result = parseRelativePhrase('next week');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(22);
    });

    it('should parse "last month"', () => {
      const result = parseRelativePhrase('last month');
      expect(result).not.toBeNull();
      expect(result!.getMonth()).toBe(11); // December (0-indexed)
    });

    it('should parse "next year"', () => {
      const result = parseRelativePhrase('next year');
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(2025);
    });

    it('should return null for invalid phrase', () => {
      const result = parseRelativePhrase('invalid phrase');
      expect(result).toBeNull();
    });

    it('should handle custom reference date', () => {
      const reference = new Date('2024-06-01');
      const result = parseRelativePhrase('in 1 week', reference);
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(8);
      expect(result!.getMonth()).toBe(5); // June
    });
  });

  describe('extractDatesFromText', () => {
    it('should extract "tomorrow" from text', () => {
      const text = 'Meeting tomorrow at the office';
      const dates = extractDatesFromText(text);

      expect(dates.length).toBeGreaterThan(0);
      expect(dates[0].text.toLowerCase()).toContain('tomorrow');
    });

    it('should extract multiple dates', () => {
      const text = 'Meeting tomorrow and lunch next Friday';
      const dates = extractDatesFromText(text);

      expect(dates.length).toBeGreaterThanOrEqual(2);
    });

    it('should extract "next week"', () => {
      const text = 'Project due next week';
      const dates = extractDatesFromText(text);

      expect(dates.length).toBeGreaterThan(0);
    });

    it('should extract "in 2 days"', () => {
      const text = 'Deadline in 2 days';
      const dates = extractDatesFromText(text);

      expect(dates.length).toBeGreaterThan(0);
      expect(dates[0].date.getDate()).toBe(17);
    });

    it('should include index and type information', () => {
      const text = 'Meeting tomorrow at 3pm';
      const dates = extractDatesFromText(text);

      expect(dates[0].index).toBeGreaterThanOrEqual(0);
      expect(dates[0].type).toBeDefined();
      expect(dates[0].confidence).toBeGreaterThan(0);
    });

    it('should return empty array for text with no dates', () => {
      const text = 'No dates here';
      const dates = extractDatesFromText(text);

      expect(dates).toEqual([]);
    });

    it('should extract dates in order of appearance', () => {
      const text = 'Start yesterday, meeting today, deadline tomorrow';
      const dates = extractDatesFromText(text);

      expect(dates.length).toBeGreaterThanOrEqual(2);
      expect(dates[0].index).toBeLessThan(dates[1].index);
    });
  });

  describe('suggestDateFromContext', () => {
    it('should suggest end of month', () => {
      const suggestions = suggestDateFromContext('deadline is end of month');

      expect(suggestions.length).toBeGreaterThan(0);
      const eom = suggestions.find(s => s.text === 'end of month');
      expect(eom).toBeDefined();
      expect(eom!.date.getDate()).toBe(31);
      expect(eom!.confidence).toBeGreaterThan(0.5);
    });

    it('should suggest beginning of month', () => {
      const suggestions = suggestDateFromContext('starts beginning of month');

      expect(suggestions.length).toBeGreaterThan(0);
      const bom = suggestions.find(s => s.text === 'beginning of month');
      expect(bom).toBeDefined();
      expect(bom!.date.getDate()).toBe(1);
    });

    it('should suggest end of year', () => {
      const suggestions = suggestDateFromContext('report due end of year');

      expect(suggestions.length).toBeGreaterThan(0);
      const eoy = suggestions.find(s => s.text === 'end of year');
      expect(eoy).toBeDefined();
      expect(eoy!.date.getMonth()).toBe(11); // December
      expect(eoy!.date.getDate()).toBe(31);
    });

    it('should suggest beginning of year', () => {
      const suggestions = suggestDateFromContext('starts beginning of year');

      expect(suggestions.length).toBeGreaterThan(0);
      const boy = suggestions.find(s => s.text === 'beginning of year');
      expect(boy).toBeDefined();
      expect(boy!.date.getMonth()).toBe(0); // January
      expect(boy!.date.getDate()).toBe(1);
    });

    it('should suggest end of week', () => {
      const suggestions = suggestDateFromContext('submit by end of week');

      expect(suggestions.length).toBeGreaterThan(0);
      const eow = suggestions.find(s => s.text === 'end of week');
      expect(eow).toBeDefined();
      expect(eow!.date.getDay()).toBe(6); // Saturday
    });

    it('should extract explicit dates from context', () => {
      const suggestions = suggestDateFromContext('meeting tomorrow and next week');

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should sort suggestions by confidence', () => {
      const suggestions = suggestDateFromContext('deadline end of month or maybe tomorrow');

      expect(suggestions.length).toBeGreaterThan(0);
      // Should be sorted by confidence (descending)
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].confidence).toBeGreaterThanOrEqual(suggestions[i].confidence);
      }
    });

    it('should handle EOM abbreviation', () => {
      const suggestions = suggestDateFromContext('target EOM');

      const eom = suggestions.find(s => s.text === 'end of month');
      expect(eom).toBeDefined();
    });

    it('should handle EOY abbreviation', () => {
      const suggestions = suggestDateFromContext('complete by EOY');

      const eoy = suggestions.find(s => s.text === 'end of year');
      expect(eoy).toBeDefined();
    });

    it('should handle EOW abbreviation', () => {
      const suggestions = suggestDateFromContext('status update EOW');

      const eow = suggestions.find(s => s.text === 'end of week');
      expect(eow).toBeDefined();
    });

    it('should return empty array for context with no dates', () => {
      const suggestions = suggestDateFromContext('just some random text');

      expect(suggestions).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('should handle case insensitivity', () => {
      expect(parseNaturalDate('TOMORROW')).not.toBeNull();
      expect(parseNaturalDate('Tomorrow')).not.toBeNull();
      expect(parseRelativePhrase('NEXT WEEK')).not.toBeNull();
    });

    it('should handle extra whitespace', () => {
      expect(parseNaturalDate('  tomorrow  ')).not.toBeNull();
      expect(parseRelativePhrase('  in  2  days  ')).not.toBeNull();
    });

    it('should handle plurals correctly', () => {
      expect(parseRelativePhrase('in 1 day')).not.toBeNull();
      expect(parseRelativePhrase('in 2 days')).not.toBeNull();
    });
  });
});
