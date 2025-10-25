import { describe, it, expect } from 'vitest';
import {
  dateRangeOverlap,
  hasOverlappingRanges,
  mergeDateRanges,
  findGaps,
  splitRange,
  containsDate,
  getIntersection,
  getUnion,
  subtractRange,
  getRangeDuration,
  expandRange,
  shrinkRange,
  rangeContains,
  sortRanges
} from '../src/dateRange';

describe('DateRange', () => {
  describe('dateRangeOverlap', () => {
    it('should detect overlapping ranges', () => {
      const range1 = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-10')
      };
      const range2 = {
        start: new Date('2024-01-05'),
        end: new Date('2024-01-15')
      };

      expect(dateRangeOverlap(range1, range2)).toBe(true);
    });

    it('should detect non-overlapping ranges', () => {
      const range1 = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-10')
      };
      const range2 = {
        start: new Date('2024-01-15'),
        end: new Date('2024-01-20')
      };

      expect(dateRangeOverlap(range1, range2)).toBe(false);
    });

    it('should detect adjacent ranges as non-overlapping', () => {
      const range1 = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-10')
      };
      const range2 = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      expect(dateRangeOverlap(range1, range2)).toBe(true); // Inclusive
    });
  });

  describe('hasOverlappingRanges', () => {
    it('should detect overlaps in multiple ranges', () => {
      const ranges = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
        { start: new Date('2024-01-05'), end: new Date('2024-01-15') }
      ];

      expect(hasOverlappingRanges(ranges)).toBe(true);
    });

    it('should return false for non-overlapping ranges', () => {
      const ranges = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
        { start: new Date('2024-01-15'), end: new Date('2024-01-20') }
      ];

      expect(hasOverlappingRanges(ranges)).toBe(false);
    });
  });

  describe('mergeDateRanges', () => {
    it('should merge overlapping ranges', () => {
      const ranges = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
        { start: new Date('2024-01-05'), end: new Date('2024-01-15') }
      ];

      const merged = mergeDateRanges(ranges);

      expect(merged.length).toBe(1);
      expect(merged[0].start).toEqual(new Date('2024-01-01'));
      expect(merged[0].end).toEqual(new Date('2024-01-15'));
    });

    it('should keep non-overlapping ranges separate', () => {
      const ranges = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
        { start: new Date('2024-01-20'), end: new Date('2024-01-30') }
      ];

      const merged = mergeDateRanges(ranges);

      expect(merged.length).toBe(2);
    });

    it('should handle multiple overlapping ranges', () => {
      const ranges = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
        { start: new Date('2024-01-05'), end: new Date('2024-01-15') },
        { start: new Date('2024-01-12'), end: new Date('2024-01-20') }
      ];

      const merged = mergeDateRanges(ranges);

      expect(merged.length).toBe(1);
      expect(merged[0].start).toEqual(new Date('2024-01-01'));
      expect(merged[0].end).toEqual(new Date('2024-01-20'));
    });

    it('should return empty array for empty input', () => {
      expect(mergeDateRanges([])).toEqual([]);
    });
  });

  describe('findGaps', () => {
    it('should find gaps between ranges', () => {
      const ranges = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-05') },
        { start: new Date('2024-01-10'), end: new Date('2024-01-15') }
      ];

      const gaps = findGaps(ranges);

      expect(gaps.length).toBe(1);
      expect(gaps[0].start.getDate()).toBe(6);
      expect(gaps[0].end.getDate()).toBe(9);
    });

    it('should find gaps within bounds', () => {
      const ranges = [
        { start: new Date('2024-01-05'), end: new Date('2024-01-10') }
      ];
      const bounds = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-20')
      };

      const gaps = findGaps(ranges, bounds);

      expect(gaps.length).toBe(2);
      expect(gaps[0].start).toEqual(bounds.start);
      expect(gaps[1].end).toEqual(bounds.end);
    });

    it('should return empty array for continuous ranges', () => {
      const ranges = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
        { start: new Date('2024-01-10'), end: new Date('2024-01-20') }
      ];

      const gaps = findGaps(ranges);

      expect(gaps.length).toBe(0);
    });
  });

  describe('splitRange', () => {
    it('should split range into daily chunks', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-05')
      };

      const chunks = splitRange(range, 1, 'day');

      expect(chunks.length).toBe(5);
      expect(chunks[0].start).toEqual(new Date('2024-01-01'));
    });

    it('should split range into 2-day chunks', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const chunks = splitRange(range, 2, 'day');

      expect(chunks.length).toBe(4); // 2, 2, 2, 1 days
    });

    it('should handle hour chunks', () => {
      const range = {
        start: new Date('2024-01-01T00:00:00'),
        end: new Date('2024-01-01T05:00:00')
      };

      const chunks = splitRange(range, 1, 'hour');

      expect(chunks.length).toBe(6);
    });
  });

  describe('containsDate', () => {
    it('should return true for date within range (inclusive)', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      expect(containsDate(range, new Date('2024-01-15'))).toBe(true);
      expect(containsDate(range, new Date('2024-01-01'))).toBe(true);
      expect(containsDate(range, new Date('2024-01-31'))).toBe(true);
    });

    it('should return false for date outside range', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      expect(containsDate(range, new Date('2024-02-01'))).toBe(false);
      expect(containsDate(range, new Date('2023-12-31'))).toBe(false);
    });

    it('should handle exclusive mode', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      expect(containsDate(range, new Date('2024-01-01'), false)).toBe(false);
      expect(containsDate(range, new Date('2024-01-15'), false)).toBe(true);
      expect(containsDate(range, new Date('2024-01-31'), false)).toBe(false);
    });
  });

  describe('getIntersection', () => {
    it('should get intersection of overlapping ranges', () => {
      const range1 = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15')
      };
      const range2 = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      const intersection = getIntersection(range1, range2);

      expect(intersection).not.toBeNull();
      expect(intersection!.start).toEqual(new Date('2024-01-10'));
      expect(intersection!.end).toEqual(new Date('2024-01-15'));
    });

    it('should return null for non-overlapping ranges', () => {
      const range1 = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-10')
      };
      const range2 = {
        start: new Date('2024-01-15'),
        end: new Date('2024-01-20')
      };

      expect(getIntersection(range1, range2)).toBeNull();
    });
  });

  describe('getUnion', () => {
    it('should get union of ranges', () => {
      const range1 = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15')
      };
      const range2 = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      const union = getUnion(range1, range2);

      expect(union.start).toEqual(new Date('2024-01-01'));
      expect(union.end).toEqual(new Date('2024-01-20'));
    });

    it('should get union of non-overlapping ranges', () => {
      const range1 = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-10')
      };
      const range2 = {
        start: new Date('2024-01-20'),
        end: new Date('2024-01-30')
      };

      const union = getUnion(range1, range2);

      expect(union.start).toEqual(new Date('2024-01-01'));
      expect(union.end).toEqual(new Date('2024-01-30'));
    });
  });

  describe('subtractRange', () => {
    it('should subtract overlapping range from middle', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };
      const subtract = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      const result = subtractRange(range, subtract);

      expect(result.length).toBe(2);
      expect(result[0].end.getDate()).toBe(9);
      expect(result[1].start.getDate()).toBe(21);
    });

    it('should return original range if no overlap', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-10')
      };
      const subtract = {
        start: new Date('2024-01-20'),
        end: new Date('2024-01-30')
      };

      const result = subtractRange(range, subtract);

      expect(result.length).toBe(1);
      expect(result[0]).toEqual(range);
    });

    it('should return empty array if completely subtracted', () => {
      const range = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };
      const subtract = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const result = subtractRange(range, subtract);

      expect(result.length).toBe(0);
    });
  });

  describe('getRangeDuration', () => {
    it('should calculate duration in milliseconds', () => {
      const range = {
        start: new Date('2024-01-01T00:00:00'),
        end: new Date('2024-01-02T00:00:00')
      };

      const duration = getRangeDuration(range);

      expect(duration).toBe(86400000); // 24 hours in ms
    });
  });

  describe('expandRange', () => {
    it('should expand range in both directions', () => {
      const range = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      const expanded = expandRange(range, 5, 'day');

      expect(expanded.start.getDate()).toBe(5);
      expect(expanded.end.getDate()).toBe(25);
    });

    it('should expand range before only', () => {
      const range = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      const expanded = expandRange(range, 5, 'day', { direction: 'before' });

      expect(expanded.start.getDate()).toBe(5);
      expect(expanded.end.getDate()).toBe(20);
    });

    it('should expand range after only', () => {
      const range = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      const expanded = expandRange(range, 5, 'day', { direction: 'after' });

      expect(expanded.start.getDate()).toBe(10);
      expect(expanded.end.getDate()).toBe(25);
    });
  });

  describe('shrinkRange', () => {
    it('should shrink range in both directions', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const shrunk = shrinkRange(range, 5, 'day');

      expect(shrunk).not.toBeNull();
      expect(shrunk!.start.getDate()).toBe(6);
      expect(shrunk!.end.getDate()).toBe(26);
    });

    it('should return null if shrink makes invalid range', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-10')
      };

      const shrunk = shrinkRange(range, 20, 'day');

      expect(shrunk).toBeNull();
    });

    it('should shrink from start only', () => {
      const range = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const shrunk = shrinkRange(range, 5, 'day', { direction: 'start' });

      expect(shrunk).not.toBeNull();
      expect(shrunk!.start.getDate()).toBe(6);
      expect(shrunk!.end.getDate()).toBe(31);
    });
  });

  describe('rangeContains', () => {
    it('should return true if outer contains inner', () => {
      const outer = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };
      const inner = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      expect(rangeContains(outer, inner)).toBe(true);
    });

    it('should return false if not contained', () => {
      const outer = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15')
      };
      const inner = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      };

      expect(rangeContains(outer, inner)).toBe(false);
    });
  });

  describe('sortRanges', () => {
    it('should sort ranges by start date ascending', () => {
      const ranges = [
        { start: new Date('2024-01-15'), end: new Date('2024-01-20') },
        { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
        { start: new Date('2024-01-25'), end: new Date('2024-01-30') }
      ];

      const sorted = sortRanges(ranges);

      expect(sorted[0].start.getDate()).toBe(1);
      expect(sorted[1].start.getDate()).toBe(15);
      expect(sorted[2].start.getDate()).toBe(25);
    });

    it('should sort ranges by start date descending', () => {
      const ranges = [
        { start: new Date('2024-01-15'), end: new Date('2024-01-20') },
        { start: new Date('2024-01-01'), end: new Date('2024-01-10') }
      ];

      const sorted = sortRanges(ranges, 'desc');

      expect(sorted[0].start.getDate()).toBe(15);
      expect(sorted[1].start.getDate()).toBe(1);
    });
  });
});
