import { describe, it, expect } from 'vitest';
import {
  compareDates,
  compareDatesDesc,
  sortDates,
  minDate,
  maxDate,
  dateExtent,
  uniqueDates,
  closestDate,
  closestFutureDate,
  closestPastDate,
  clampDate,
  isDateInRange,
  filterDatesInRange,
  groupDates,
  groupDatesByYear,
  groupDatesByMonth,
  groupDatesByDay,
  groupDatesByDayOfWeek,
  medianDate,
  averageDate,
  roundDate,
  snapDate,
  isChronological,
  dateSpan,
  partitionDates,
  nthDate,
} from '../src/compare.js';

describe('Date comparison utilities', () => {
  const date1 = new Date('2024-01-15');
  const date2 = new Date('2024-06-15');
  const date3 = new Date('2024-12-15');

  describe('compareDates', () => {
    it('should return negative for earlier date first', () => {
      expect(compareDates(date1, date2)).toBeLessThan(0);
    });

    it('should return positive for later date first', () => {
      expect(compareDates(date2, date1)).toBeGreaterThan(0);
    });

    it('should return 0 for equal dates', () => {
      expect(compareDates(date1, new Date(date1))).toBe(0);
    });
  });

  describe('compareDatesDesc', () => {
    it('should return positive for earlier date first', () => {
      expect(compareDatesDesc(date1, date2)).toBeGreaterThan(0);
    });
  });

  describe('sortDates', () => {
    it('should sort ascending by default', () => {
      const sorted = sortDates([date3, date1, date2]);
      expect(sorted[0].getTime()).toBe(date1.getTime());
      expect(sorted[2].getTime()).toBe(date3.getTime());
    });

    it('should sort descending when specified', () => {
      const sorted = sortDates([date1, date3, date2], 'desc');
      expect(sorted[0].getTime()).toBe(date3.getTime());
      expect(sorted[2].getTime()).toBe(date1.getTime());
    });

    it('should not mutate original array', () => {
      const original = [date3, date1, date2];
      sortDates(original);
      expect(original[0].getTime()).toBe(date3.getTime());
    });
  });

  describe('minDate', () => {
    it('should find earliest date', () => {
      expect(minDate([date2, date3, date1])?.getTime()).toBe(date1.getTime());
    });

    it('should return undefined for empty array', () => {
      expect(minDate([])).toBeUndefined();
    });
  });

  describe('maxDate', () => {
    it('should find latest date', () => {
      expect(maxDate([date2, date1, date3])?.getTime()).toBe(date3.getTime());
    });

    it('should return undefined for empty array', () => {
      expect(maxDate([])).toBeUndefined();
    });
  });

  describe('dateExtent', () => {
    it('should return min and max', () => {
      const extent = dateExtent([date2, date1, date3]);
      expect(extent?.min.getTime()).toBe(date1.getTime());
      expect(extent?.max.getTime()).toBe(date3.getTime());
    });

    it('should return undefined for empty array', () => {
      expect(dateExtent([])).toBeUndefined();
    });
  });

  describe('uniqueDates', () => {
    it('should remove duplicate dates', () => {
      const dates = [date1, new Date(date1), date2];
      const unique = uniqueDates(dates);
      expect(unique.length).toBe(2);
    });

    it('should support day precision', () => {
      const d1 = new Date('2024-01-15T10:00:00');
      const d2 = new Date('2024-01-15T14:00:00');
      const unique = uniqueDates([d1, d2], 'day');
      expect(unique.length).toBe(1);
    });
  });

  describe('closestDate', () => {
    it('should find closest date', () => {
      const target = new Date('2024-05-01');
      const closest = closestDate(target, [date1, date2, date3]);
      expect(closest?.getTime()).toBe(date2.getTime());
    });

    it('should return undefined for empty array', () => {
      expect(closestDate(date1, [])).toBeUndefined();
    });
  });

  describe('closestFutureDate', () => {
    it('should find closest future date', () => {
      const target = new Date('2024-03-01');
      const closest = closestFutureDate(target, [date1, date2, date3]);
      expect(closest?.getTime()).toBe(date2.getTime());
    });
  });

  describe('closestPastDate', () => {
    it('should find closest past date', () => {
      const target = new Date('2024-08-01');
      const closest = closestPastDate(target, [date1, date2, date3]);
      expect(closest?.getTime()).toBe(date2.getTime());
    });
  });

  describe('clampDate', () => {
    it('should return min if date is before range', () => {
      const clamped = clampDate(new Date('2023-01-01'), date1, date3);
      expect(clamped.getTime()).toBe(date1.getTime());
    });

    it('should return max if date is after range', () => {
      const clamped = clampDate(new Date('2025-01-01'), date1, date3);
      expect(clamped.getTime()).toBe(date3.getTime());
    });

    it('should return date if within range', () => {
      const clamped = clampDate(date2, date1, date3);
      expect(clamped.getTime()).toBe(date2.getTime());
    });
  });

  describe('isDateInRange', () => {
    it('should return true for date in range', () => {
      expect(isDateInRange(date2, date1, date3)).toBe(true);
    });

    it('should return false for date outside range', () => {
      expect(isDateInRange(new Date('2023-01-01'), date1, date3)).toBe(false);
    });
  });

  describe('filterDatesInRange', () => {
    it('should filter dates in range', () => {
      const dates = [
        new Date('2023-01-01'),
        date1,
        date2,
        date3,
        new Date('2025-01-01'),
      ];
      const filtered = filterDatesInRange(dates, date1, date3);
      expect(filtered.length).toBe(3);
    });
  });

  describe('groupDates', () => {
    it('should group by custom key', () => {
      const dates = [date1, date2, date3];
      const grouped = groupDates(dates, d => d.getFullYear());
      expect(grouped.get(2024)?.length).toBe(3);
    });
  });

  describe('groupDatesByYear', () => {
    it('should group by year', () => {
      const dates = [
        new Date('2023-06-15'),
        new Date('2024-01-15'),
        new Date('2024-06-15'),
      ];
      const grouped = groupDatesByYear(dates);
      expect(grouped.get(2023)?.length).toBe(1);
      expect(grouped.get(2024)?.length).toBe(2);
    });
  });

  describe('groupDatesByMonth', () => {
    it('should group by month', () => {
      const dates = [date1, date2, new Date('2024-01-20')];
      const grouped = groupDatesByMonth(dates);
      expect(grouped.get('2024-01')?.length).toBe(2);
      expect(grouped.get('2024-06')?.length).toBe(1);
    });
  });

  describe('groupDatesByDay', () => {
    it('should group by day', () => {
      const dates = [
        new Date('2024-01-15T10:00'),
        new Date('2024-01-15T14:00'),
        new Date('2024-01-16T10:00'),
      ];
      const grouped = groupDatesByDay(dates);
      expect(grouped.get('2024-01-15')?.length).toBe(2);
    });
  });

  describe('groupDatesByDayOfWeek', () => {
    it('should group by day of week', () => {
      const monday1 = new Date('2024-01-15'); // Monday
      const monday2 = new Date('2024-01-22'); // Monday
      const tuesday = new Date('2024-01-16'); // Tuesday
      const grouped = groupDatesByDayOfWeek([monday1, monday2, tuesday]);
      expect(grouped.get(1)?.length).toBe(2); // Mondays
      expect(grouped.get(2)?.length).toBe(1); // Tuesday
    });
  });

  describe('medianDate', () => {
    it('should find median of odd count', () => {
      const median = medianDate([date1, date2, date3]);
      expect(median?.getTime()).toBe(date2.getTime());
    });

    it('should average middle two for even count', () => {
      const median = medianDate([date1, date3]);
      expect(median).toBeDefined();
      expect(median!.getTime()).toBeGreaterThan(date1.getTime());
      expect(median!.getTime()).toBeLessThan(date3.getTime());
    });

    it('should return undefined for empty array', () => {
      expect(medianDate([])).toBeUndefined();
    });
  });

  describe('averageDate', () => {
    it('should calculate average date', () => {
      const avg = averageDate([date1, date3]);
      expect(avg).toBeDefined();
      expect(avg!.getTime()).toBeGreaterThan(date1.getTime());
      expect(avg!.getTime()).toBeLessThan(date3.getTime());
    });

    it('should return undefined for empty array', () => {
      expect(averageDate([])).toBeUndefined();
    });
  });

  describe('roundDate', () => {
    it('should round to nearest minute', () => {
      const rounded = roundDate(new Date('2024-01-15T10:30:45'), 'minute');
      expect(rounded.getSeconds()).toBe(0);
      expect(rounded.getMinutes()).toBe(31);
    });

    it('should round to nearest hour', () => {
      const rounded = roundDate(new Date('2024-01-15T10:45:00'), 'hour');
      expect(rounded.getMinutes()).toBe(0);
      expect(rounded.getHours()).toBe(11);
    });

    it('should round to nearest day', () => {
      const rounded = roundDate(new Date('2024-01-15T14:00:00'), 'day');
      expect(rounded.getHours()).toBe(0);
      expect(rounded.getDate()).toBe(16);
    });
  });

  describe('snapDate', () => {
    it('should snap to 15 minute intervals', () => {
      const snapped = snapDate(new Date('2024-01-15T10:37:00'), 15);
      expect(snapped.getMinutes()).toBe(30);
    });

    it('should snap up with ceil mode', () => {
      const snapped = snapDate(new Date('2024-01-15T10:31:00'), 15, 'ceil');
      expect(snapped.getMinutes()).toBe(45);
    });

    it('should snap down with floor mode', () => {
      const snapped = snapDate(new Date('2024-01-15T10:44:00'), 15, 'floor');
      expect(snapped.getMinutes()).toBe(30);
    });
  });

  describe('isChronological', () => {
    it('should return true for sorted dates', () => {
      expect(isChronological([date1, date2, date3])).toBe(true);
    });

    it('should return false for unsorted dates', () => {
      expect(isChronological([date2, date1, date3])).toBe(false);
    });

    it('should handle strict mode', () => {
      const duplicate = new Date(date1);
      expect(isChronological([date1, duplicate], false)).toBe(true);
      expect(isChronological([date1, duplicate], true)).toBe(false);
    });
  });

  describe('dateSpan', () => {
    it('should calculate span in milliseconds', () => {
      const span = dateSpan([date1, date3]);
      expect(span).toBeGreaterThan(0);
    });

    it('should return 0 for empty array', () => {
      expect(dateSpan([])).toBe(0);
    });
  });

  describe('partitionDates', () => {
    it('should partition by predicate', () => {
      const [past, future] = partitionDates(
        [date1, date2, date3],
        d => d < new Date('2024-06-01')
      );
      expect(past.length).toBe(1);
      expect(future.length).toBe(2);
    });
  });

  describe('nthDate', () => {
    it('should get nth date', () => {
      const dates = [date3, date1, date2];
      expect(nthDate(dates, 0)?.getTime()).toBe(date1.getTime());
      expect(nthDate(dates, 2)?.getTime()).toBe(date3.getTime());
    });

    it('should support negative indices', () => {
      const dates = [date3, date1, date2];
      expect(nthDate(dates, -1)?.getTime()).toBe(date3.getTime());
    });

    it('should return undefined for out of bounds', () => {
      expect(nthDate([date1], 5)).toBeUndefined();
    });
  });
});
