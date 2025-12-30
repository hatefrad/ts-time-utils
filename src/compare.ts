/**
 * @fileoverview Date comparison, sorting, and array manipulation utilities
 */

/**
 * Compare two dates for sorting
 * @param a - First date
 * @param b - Second date
 * @returns Negative if a < b, positive if a > b, 0 if equal
 * @example
 * [date3, date1, date2].sort(compareDates) // [date1, date2, date3]
 */
export function compareDates(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

/**
 * Compare two dates in reverse order for sorting
 * @param a - First date
 * @param b - Second date
 * @returns Positive if a < b, negative if a > b, 0 if equal
 * @example
 * [date1, date3, date2].sort(compareDatesDesc) // [date3, date2, date1]
 */
export function compareDatesDesc(a: Date, b: Date): number {
  return b.getTime() - a.getTime();
}

/**
 * Sort an array of dates
 * @param dates - Array of dates to sort
 * @param direction - Sort direction: 'asc' (oldest first) or 'desc' (newest first)
 * @returns New sorted array (does not mutate original)
 * @example
 * sortDates([date3, date1, date2]) // [date1, date2, date3]
 * sortDates([date1, date2, date3], 'desc') // [date3, date2, date1]
 */
export function sortDates(
  dates: Date[],
  direction: 'asc' | 'desc' = 'asc'
): Date[] {
  const sorted = [...dates];
  sorted.sort(direction === 'asc' ? compareDates : compareDatesDesc);
  return sorted;
}

/**
 * Find the minimum (earliest) date in an array
 * @param dates - Array of dates
 * @returns The earliest date, or undefined if array is empty
 * @example
 * minDate([date2, date1, date3]) // date1
 */
export function minDate(dates: Date[]): Date | undefined {
  if (dates.length === 0) return undefined;
  return dates.reduce((min, date) => (date < min ? date : min));
}

/**
 * Find the maximum (latest) date in an array
 * @param dates - Array of dates
 * @returns The latest date, or undefined if array is empty
 * @example
 * maxDate([date1, date3, date2]) // date3
 */
export function maxDate(dates: Date[]): Date | undefined {
  if (dates.length === 0) return undefined;
  return dates.reduce((max, date) => (date > max ? date : max));
}

/**
 * Find the date range (min and max) in an array
 * @param dates - Array of dates
 * @returns Object with min and max dates, or undefined if array is empty
 * @example
 * dateRange([date2, date1, date3]) // { min: date1, max: date3 }
 */
export function dateExtent(dates: Date[]): { min: Date; max: Date } | undefined {
  if (dates.length === 0) return undefined;

  let min = dates[0];
  let max = dates[0];

  for (const date of dates) {
    if (date < min) min = date;
    if (date > max) max = date;
  }

  return { min, max };
}

/**
 * Remove duplicate dates from an array
 * @param dates - Array of dates
 * @param precision - Precision for comparison: 'ms' (exact), 'second', 'minute', 'hour', 'day'
 * @returns New array with duplicates removed (preserves first occurrence)
 * @example
 * uniqueDates([date1, date1Copy, date2]) // [date1, date2]
 */
export function uniqueDates(
  dates: Date[],
  precision: 'ms' | 'second' | 'minute' | 'hour' | 'day' = 'ms'
): Date[] {
  const seen = new Set<number>();
  const result: Date[] = [];

  for (const date of dates) {
    const key = getDateKey(date, precision);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(date);
    }
  }

  return result;
}

/**
 * Get a numeric key for a date based on precision
 */
function getDateKey(date: Date, precision: 'ms' | 'second' | 'minute' | 'hour' | 'day'): number {
  switch (precision) {
    case 'ms':
      return date.getTime();
    case 'second':
      return Math.floor(date.getTime() / 1000);
    case 'minute':
      return Math.floor(date.getTime() / 60000);
    case 'hour':
      return Math.floor(date.getTime() / 3600000);
    case 'day':
      return Math.floor(date.getTime() / 86400000);
  }
}

/**
 * Find the closest date to a target from an array of candidates
 * @param target - The target date
 * @param candidates - Array of candidate dates
 * @returns The closest date, or undefined if candidates is empty
 * @example
 * closestDate(targetDate, [date1, date2, date3]) // closest to target
 */
export function closestDate(target: Date, candidates: Date[]): Date | undefined {
  if (candidates.length === 0) return undefined;

  const targetTime = target.getTime();
  let closest = candidates[0];
  let minDiff = Math.abs(closest.getTime() - targetTime);

  for (const candidate of candidates) {
    const diff = Math.abs(candidate.getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = candidate;
    }
  }

  return closest;
}

/**
 * Find the closest future date to a target
 * @param target - The target date
 * @param candidates - Array of candidate dates
 * @returns The closest future date, or undefined if none found
 */
export function closestFutureDate(target: Date, candidates: Date[]): Date | undefined {
  const targetTime = target.getTime();
  const futureDates = candidates.filter(d => d.getTime() > targetTime);
  return minDate(futureDates);
}

/**
 * Find the closest past date to a target
 * @param target - The target date
 * @param candidates - Array of candidate dates
 * @returns The closest past date, or undefined if none found
 */
export function closestPastDate(target: Date, candidates: Date[]): Date | undefined {
  const targetTime = target.getTime();
  const pastDates = candidates.filter(d => d.getTime() < targetTime);
  return maxDate(pastDates);
}

/**
 * Clamp a date to be within a range
 * @param date - The date to clamp
 * @param min - Minimum allowed date
 * @param max - Maximum allowed date
 * @returns The clamped date
 * @example
 * clampDate(earlyDate, minDate, maxDate) // returns minDate
 * clampDate(lateDate, minDate, maxDate) // returns maxDate
 * clampDate(middleDate, minDate, maxDate) // returns middleDate
 */
export function clampDate(date: Date, min: Date, max: Date): Date {
  if (date < min) return new Date(min);
  if (date > max) return new Date(max);
  return new Date(date);
}

/**
 * Check if a date is within a range (inclusive)
 * @param date - The date to check
 * @param min - Start of range
 * @param max - End of range
 * @returns True if date is within range
 */
export function isDateInRange(date: Date, min: Date, max: Date): boolean {
  const time = date.getTime();
  return time >= min.getTime() && time <= max.getTime();
}

/**
 * Filter dates to only those within a range
 * @param dates - Array of dates
 * @param min - Start of range
 * @param max - End of range
 * @returns New array with only dates in range
 */
export function filterDatesInRange(dates: Date[], min: Date, max: Date): Date[] {
  return dates.filter(date => isDateInRange(date, min, max));
}

/**
 * Group dates by a key function
 * @param dates - Array of dates
 * @param keyFn - Function to generate group key from date
 * @returns Map of key to array of dates
 * @example
 * groupDates(dates, d => d.getFullYear()) // Map { 2023 => [...], 2024 => [...] }
 * groupDates(dates, d => d.toISOString().slice(0, 7)) // Group by month
 */
export function groupDates<K>(
  dates: Date[],
  keyFn: (date: Date) => K
): Map<K, Date[]> {
  const groups = new Map<K, Date[]>();

  for (const date of dates) {
    const key = keyFn(date);
    const group = groups.get(key);
    if (group) {
      group.push(date);
    } else {
      groups.set(key, [date]);
    }
  }

  return groups;
}

/**
 * Group dates by year
 * @param dates - Array of dates
 * @returns Map of year to array of dates
 */
export function groupDatesByYear(dates: Date[]): Map<number, Date[]> {
  return groupDates(dates, d => d.getFullYear());
}

/**
 * Group dates by month (YYYY-MM format)
 * @param dates - Array of dates
 * @returns Map of month key to array of dates
 */
export function groupDatesByMonth(dates: Date[]): Map<string, Date[]> {
  return groupDates(dates, d => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
}

/**
 * Group dates by day (YYYY-MM-DD format)
 * @param dates - Array of dates
 * @returns Map of day key to array of dates
 */
export function groupDatesByDay(dates: Date[]): Map<string, Date[]> {
  return groupDates(dates, d => d.toISOString().slice(0, 10));
}

/**
 * Group dates by day of week (0-6, Sunday-Saturday)
 * @param dates - Array of dates
 * @returns Map of day of week to array of dates
 */
export function groupDatesByDayOfWeek(dates: Date[]): Map<number, Date[]> {
  return groupDates(dates, d => d.getDay());
}

/**
 * Calculate the median date from an array
 * @param dates - Array of dates
 * @returns The median date, or undefined if array is empty
 */
export function medianDate(dates: Date[]): Date | undefined {
  if (dates.length === 0) return undefined;

  const sorted = sortDates(dates);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Average of two middle values
    const time1 = sorted[mid - 1].getTime();
    const time2 = sorted[mid].getTime();
    return new Date((time1 + time2) / 2);
  }

  return new Date(sorted[mid]);
}

/**
 * Calculate the average/mean date from an array
 * @param dates - Array of dates
 * @returns The average date, or undefined if array is empty
 */
export function averageDate(dates: Date[]): Date | undefined {
  if (dates.length === 0) return undefined;

  const sum = dates.reduce((acc, date) => acc + date.getTime(), 0);
  return new Date(sum / dates.length);
}

/**
 * Round a date to the nearest unit
 * @param date - The date to round
 * @param unit - Unit to round to
 * @returns New rounded date
 * @example
 * roundDate(new Date('2024-03-15T14:37:00'), 'hour') // 2024-03-15T15:00:00
 * roundDate(new Date('2024-03-15T14:22:00'), 'hour') // 2024-03-15T14:00:00
 */
export function roundDate(
  date: Date,
  unit: 'minute' | 'hour' | 'day'
): Date {
  const d = new Date(date);

  switch (unit) {
    case 'minute':
      if (d.getSeconds() >= 30) {
        d.setMinutes(d.getMinutes() + 1);
      }
      d.setSeconds(0, 0);
      break;
    case 'hour':
      if (d.getMinutes() >= 30) {
        d.setHours(d.getHours() + 1);
      }
      d.setMinutes(0, 0, 0);
      break;
    case 'day':
      if (d.getHours() >= 12) {
        d.setDate(d.getDate() + 1);
      }
      d.setHours(0, 0, 0, 0);
      break;
  }

  return d;
}

/**
 * Snap a date to a grid interval
 * @param date - The date to snap
 * @param intervalMinutes - Interval in minutes (e.g., 15 for quarter-hour)
 * @param mode - Snap mode: 'floor' (down), 'ceil' (up), or 'round' (nearest)
 * @returns New snapped date
 * @example
 * snapDate(new Date('2024-03-15T14:37:00'), 15) // 2024-03-15T14:30:00
 * snapDate(new Date('2024-03-15T14:37:00'), 15, 'ceil') // 2024-03-15T14:45:00
 */
export function snapDate(
  date: Date,
  intervalMinutes: number,
  mode: 'floor' | 'ceil' | 'round' = 'round'
): Date {
  const ms = date.getTime();
  const intervalMs = intervalMinutes * 60 * 1000;

  let snapped: number;
  switch (mode) {
    case 'floor':
      snapped = Math.floor(ms / intervalMs) * intervalMs;
      break;
    case 'ceil':
      snapped = Math.ceil(ms / intervalMs) * intervalMs;
      break;
    case 'round':
      snapped = Math.round(ms / intervalMs) * intervalMs;
      break;
  }

  return new Date(snapped);
}

/**
 * Check if dates are in chronological order
 * @param dates - Array of dates
 * @param strict - If true, requires strictly increasing (no duplicates)
 * @returns True if dates are in order
 */
export function isChronological(dates: Date[], strict: boolean = false): boolean {
  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1].getTime();
    const curr = dates[i].getTime();

    if (strict ? curr <= prev : curr < prev) {
      return false;
    }
  }
  return true;
}

/**
 * Get the span (duration) between min and max dates
 * @param dates - Array of dates
 * @returns Duration in milliseconds, or 0 if less than 2 dates
 */
export function dateSpan(dates: Date[]): number {
  const extent = dateExtent(dates);
  if (!extent) return 0;
  return extent.max.getTime() - extent.min.getTime();
}

/**
 * Partition dates into buckets based on a predicate
 * @param dates - Array of dates
 * @param predicate - Function that returns true for dates in first partition
 * @returns Tuple of [matching, non-matching] date arrays
 */
export function partitionDates(
  dates: Date[],
  predicate: (date: Date) => boolean
): [Date[], Date[]] {
  const matching: Date[] = [];
  const nonMatching: Date[] = [];

  for (const date of dates) {
    if (predicate(date)) {
      matching.push(date);
    } else {
      nonMatching.push(date);
    }
  }

  return [matching, nonMatching];
}

/**
 * Get the nth date from an array (supports negative indices)
 * @param dates - Array of dates (will be sorted)
 * @param n - Index (0-based, negative counts from end)
 * @returns The nth date, or undefined if out of bounds
 * @example
 * nthDate(dates, 0) // earliest
 * nthDate(dates, -1) // latest
 * nthDate(dates, 2) // third earliest
 */
export function nthDate(dates: Date[], n: number): Date | undefined {
  if (dates.length === 0) return undefined;

  const sorted = sortDates(dates);
  const index = n < 0 ? sorted.length + n : n;

  if (index < 0 || index >= sorted.length) return undefined;
  return sorted[index];
}

/**
 * Find the index of the closest date to a target in an array
 * @param dates - Array of candidate dates
 * @param target - The target date
 * @returns Index of the closest date, or -1 if array is empty
 * @example
 * closestIndexTo([date1, date2, date3], targetDate) // 1
 */
export function closestIndexTo(dates: Date[], target: Date): number {
  if (dates.length === 0) return -1;

  const targetTime = target.getTime();
  let closestIndex = 0;
  let minDiff = Math.abs(dates[0].getTime() - targetTime);

  for (let i = 1; i < dates.length; i++) {
    const diff = Math.abs(dates[i].getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }

  return closestIndex;
}

/**
 * Get the number of overlapping days between two date ranges
 * @param range1 - First range { start, end }
 * @param range2 - Second range { start, end }
 * @returns Number of overlapping days (0 if no overlap)
 * @example
 * getOverlappingDaysInIntervals(
 *   { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
 *   { start: new Date('2024-01-05'), end: new Date('2024-01-15') }
 * ) // 6 (Jan 5-10 inclusive)
 */
export function getOverlappingDaysInIntervals(
  range1: { start: Date; end: Date },
  range2: { start: Date; end: Date }
): number {
  const start1 = new Date(range1.start.getFullYear(), range1.start.getMonth(), range1.start.getDate());
  const end1 = new Date(range1.end.getFullYear(), range1.end.getMonth(), range1.end.getDate());
  const start2 = new Date(range2.start.getFullYear(), range2.start.getMonth(), range2.start.getDate());
  const end2 = new Date(range2.end.getFullYear(), range2.end.getMonth(), range2.end.getDate());

  const overlapStart = start1 > start2 ? start1 : start2;
  const overlapEnd = end1 < end2 ? end1 : end2;

  if (overlapStart > overlapEnd) return 0;

  const diffMs = overlapEnd.getTime() - overlapStart.getTime();
  return Math.floor(diffMs / 86400000) + 1;
}
