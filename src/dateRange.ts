/**
 * @fileoverview Extended date range operations and utilities
 * Provides advanced operations for working with date ranges beyond basic intervals
 */

import type { DateRange, DateInput } from './types.js';
import { addTime } from './calculate.js';

/**
 * Checks if two date ranges overlap
 * @param range1 - First date range
 * @param range2 - Second date range
 * @returns True if the ranges overlap
 * 
 * @example
 * ```ts
 * const range1 = { start: new Date('2024-01-01'), end: new Date('2024-01-10') };
 * const range2 = { start: new Date('2024-01-05'), end: new Date('2024-01-15') };
 * 
 * dateRangeOverlap(range1, range2); // true
 * ```
 */
export function dateRangeOverlap(range1: DateRange, range2: DateRange): boolean {
  return range1.start <= range2.end && range2.start <= range1.end;
}

/**
 * Checks if multiple date ranges have any overlaps
 * @param ranges - Array of date ranges
 * @returns True if any two ranges overlap
 * 
 * @example
 * ```ts
 * const ranges = [
 *   { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
 *   { start: new Date('2024-01-05'), end: new Date('2024-01-15') }
 * ];
 * 
 * hasOverlappingRanges(ranges); // true
 * ```
 */
export function hasOverlappingRanges(ranges: DateRange[]): boolean {
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (dateRangeOverlap(ranges[i], ranges[j])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Merges overlapping or adjacent date ranges
 * @param ranges - Array of date ranges to merge
 * @returns Array of merged, non-overlapping ranges
 * 
 * @example
 * ```ts
 * const ranges = [
 *   { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
 *   { start: new Date('2024-01-05'), end: new Date('2024-01-15') },
 *   { start: new Date('2024-01-20'), end: new Date('2024-01-25') }
 * ];
 * 
 * mergeDateRanges(ranges);
 * // [
 * //   { start: Date('2024-01-01'), end: Date('2024-01-15') },
 * //   { start: Date('2024-01-20'), end: Date('2024-01-25') }
 * // ]
 * ```
 */
export function mergeDateRanges(ranges: DateRange[]): DateRange[] {
  if (ranges.length === 0) return [];
  
  // Sort ranges by start date
  const sorted = [...ranges].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  const merged: DateRange[] = [{ ...sorted[0] }];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const lastMerged = merged[merged.length - 1];
    
    // Check if current range overlaps or is adjacent to last merged range
    if (current.start <= lastMerged.end || 
        current.start.getTime() === lastMerged.end.getTime() + 1) {
      // Merge by extending the end date if needed
      if (current.end > lastMerged.end) {
        lastMerged.end = new Date(current.end);
      }
    } else {
      // No overlap, add as new range
      merged.push({ ...current });
    }
  }
  
  return merged;
}

/**
 * Finds gaps between date ranges within specified bounds
 * @param ranges - Array of date ranges
 * @param bounds - Optional bounds to search within
 * @returns Array of date ranges representing gaps
 * 
 * @example
 * ```ts
 * const ranges = [
 *   { start: new Date('2024-01-01'), end: new Date('2024-01-05') },
 *   { start: new Date('2024-01-10'), end: new Date('2024-01-15') }
 * ];
 * 
 * findGaps(ranges, {
 *   start: new Date('2024-01-01'),
 *   end: new Date('2024-01-20')
 * });
 * // [
 * //   { start: Date('2024-01-06'), end: Date('2024-01-09') },
 * //   { start: Date('2024-01-16'), end: Date('2024-01-20') }
 * // ]
 * ```
 */
export function findGaps(ranges: DateRange[], bounds?: DateRange): DateRange[] {
  if (ranges.length === 0) {
    return bounds ? [{ ...bounds }] : [];
  }
  
  // Merge overlapping ranges first
  const merged = mergeDateRanges(ranges);
  
  // Sort by start date
  const sorted = merged.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  const gaps: DateRange[] = [];
  
  // Check gap before first range if bounds provided
  if (bounds && sorted[0].start > bounds.start) {
    gaps.push({
      start: new Date(bounds.start),
      end: addTime(sorted[0].start, -1, 'millisecond')
    });
  }
  
  // Find gaps between ranges
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].end;
    const nextStart = sorted[i + 1].start;
    
    if (nextStart > currentEnd) {
      gaps.push({
        start: addTime(currentEnd, 1, 'day'),
        end: addTime(nextStart, -1, 'day')
      });
    }
  }
  
  // Check gap after last range if bounds provided
  if (bounds && sorted[sorted.length - 1].end < bounds.end) {
    gaps.push({
      start: addTime(sorted[sorted.length - 1].end, 1, 'millisecond'),
      end: new Date(bounds.end)
    });
  }
  
  return gaps;
}

/**
 * Splits a date range into smaller chunks
 * @param range - The date range to split
 * @param chunkSize - Size of each chunk
 * @param unit - Unit for chunk size
 * @returns Array of date ranges
 * 
 * @example
 * ```ts
 * const range = {
 *   start: new Date('2024-01-01'),
 *   end: new Date('2024-01-10')
 * };
 * 
 * splitRange(range, 3, 'day');
 * // Returns 4 ranges: 3 days, 3 days, 3 days, 1 day
 * ```
 */
export function splitRange(
  range: DateRange,
  chunkSize: number,
  unit: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
): DateRange[] {
  const chunks: DateRange[] = [];
  let current = new Date(range.start);
  const rangeEnd = new Date(range.end);
  
  // Keep looping while current hasn't passed the end
  while (current.getTime() <= rangeEnd.getTime()) {
    const chunkEnd = addTime(current, chunkSize, unit);
    
    // Don't go past the range end
    const effectiveEnd = chunkEnd > rangeEnd ? new Date(rangeEnd) : new Date(chunkEnd);
    
    chunks.push({
      start: new Date(current),
      end: effectiveEnd
    });
    
    // Move to the next chunk
    current = chunkEnd;
    
    // If the next chunk would start after the range end, we're done
    if (current.getTime() > rangeEnd.getTime()) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Checks if a date falls within a date range
 * @param range - The date range
 * @param date - The date to check
 * @param inclusive - Whether to include boundary dates (default: true)
 * @returns True if date is within range
 * 
 * @example
 * ```ts
 * const range = {
 *   start: new Date('2024-01-01'),
 *   end: new Date('2024-01-31')
 * };
 * 
 * containsDate(range, new Date('2024-01-15')); // true
 * containsDate(range, new Date('2024-02-01')); // false
 * ```
 */
export function containsDate(
  range: DateRange,
  date: DateInput,
  inclusive = true
): boolean {
  const checkDate = new Date(date);
  
  if (inclusive) {
    return checkDate >= range.start && checkDate <= range.end;
  }
  
  return checkDate > range.start && checkDate < range.end;
}

/**
 * Gets the intersection of two date ranges
 * @param range1 - First date range
 * @param range2 - Second date range
 * @returns The overlapping range, or null if no overlap
 * 
 * @example
 * ```ts
 * const range1 = { start: new Date('2024-01-01'), end: new Date('2024-01-15') };
 * const range2 = { start: new Date('2024-01-10'), end: new Date('2024-01-20') };
 * 
 * getIntersection(range1, range2);
 * // { start: Date('2024-01-10'), end: Date('2024-01-15') }
 * ```
 */
export function getIntersection(range1: DateRange, range2: DateRange): DateRange | null {
  if (!dateRangeOverlap(range1, range2)) {
    return null;
  }
  
  return {
    start: new Date(Math.max(range1.start.getTime(), range2.start.getTime())),
    end: new Date(Math.min(range1.end.getTime(), range2.end.getTime()))
  };
}

/**
 * Gets the union (combined coverage) of two date ranges
 * @param range1 - First date range
 * @param range2 - Second date range
 * @returns The combined range covering both inputs
 * 
 * @example
 * ```ts
 * const range1 = { start: new Date('2024-01-01'), end: new Date('2024-01-15') };
 * const range2 = { start: new Date('2024-01-10'), end: new Date('2024-01-20') };
 * 
 * getUnion(range1, range2);
 * // { start: Date('2024-01-01'), end: Date('2024-01-20') }
 * ```
 */
export function getUnion(range1: DateRange, range2: DateRange): DateRange {
  return {
    start: new Date(Math.min(range1.start.getTime(), range2.start.getTime())),
    end: new Date(Math.max(range1.end.getTime(), range2.end.getTime()))
  };
}

/**
 * Subtracts one date range from another
 * @param range - The range to subtract from
 * @param subtract - The range to subtract
 * @returns Array of remaining date ranges (0-2 ranges)
 * 
 * @example
 * ```ts
 * const range = { start: new Date('2024-01-01'), end: new Date('2024-01-31') };
 * const subtract = { start: new Date('2024-01-10'), end: new Date('2024-01-20') };
 * 
 * subtractRange(range, subtract);
 * // [
 * //   { start: Date('2024-01-01'), end: Date('2024-01-09') },
 * //   { start: Date('2024-01-21'), end: Date('2024-01-31') }
 * // ]
 * ```
 */
export function subtractRange(range: DateRange, subtract: DateRange): DateRange[] {
  // No overlap, return original range
  if (!dateRangeOverlap(range, subtract)) {
    return [{ ...range }];
  }
  
  const result: DateRange[] = [];
  
  // Check if there's a range before the subtraction
  if (range.start < subtract.start) {
    result.push({
      start: new Date(range.start),
      end: addTime(subtract.start, -1, 'day')
    });
  }
  
  // Check if there's a range after the subtraction
  if (range.end > subtract.end) {
    result.push({
      start: addTime(subtract.end, 1, 'day'),
      end: new Date(range.end)
    });
  }
  
  return result;
}

/**
 * Calculates the duration of a date range in milliseconds
 * @param range - The date range
 * @returns Duration in milliseconds
 * 
 * @example
 * ```ts
 * const range = {
 *   start: new Date('2024-01-01'),
 *   end: new Date('2024-01-02')
 * };
 * 
 * getRangeDuration(range); // 86400000 (1 day in ms)
 * ```
 */
export function getRangeDuration(range: DateRange): number {
  return range.end.getTime() - range.start.getTime();
}

/**
 * Expands a date range by a specified amount
 * @param range - The date range to expand
 * @param amount - Amount to expand by
 * @param unit - Unit for expansion
 * @param options - Expansion options
 * @returns Expanded date range
 * 
 * @example
 * ```ts
 * const range = {
 *   start: new Date('2024-01-10'),
 *   end: new Date('2024-01-20')
 * };
 * 
 * expandRange(range, 5, 'day');
 * // { start: Date('2024-01-05'), end: Date('2024-01-25') }
 * 
 * expandRange(range, 5, 'day', { direction: 'before' });
 * // { start: Date('2024-01-05'), end: Date('2024-01-20') }
 * ```
 */
export function expandRange(
  range: DateRange,
  amount: number,
  unit: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
  options: {
    direction?: 'both' | 'before' | 'after'
  } = {}
): DateRange {
  const { direction = 'both' } = options;
  
  let newStart = new Date(range.start);
  let newEnd = new Date(range.end);
  
  if (direction === 'both' || direction === 'before') {
    newStart = addTime(newStart, -amount, unit);
  }
  
  if (direction === 'both' || direction === 'after') {
    newEnd = addTime(newEnd, amount, unit);
  }
  
  return {
    start: newStart,
    end: newEnd
  };
}

/**
 * Shrinks a date range by a specified amount
 * @param range - The date range to shrink
 * @param amount - Amount to shrink by
 * @param unit - Unit for shrinking
 * @param options - Shrink options
 * @returns Shrunk date range, or null if result would be invalid
 * 
 * @example
 * ```ts
 * const range = {
 *   start: new Date('2024-01-01'),
 *   end: new Date('2024-01-31')
 * };
 * 
 * shrinkRange(range, 5, 'day');
 * // { start: Date('2024-01-06'), end: Date('2024-01-26') }
 * ```
 */
export function shrinkRange(
  range: DateRange,
  amount: number,
  unit: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
  options: {
    direction?: 'both' | 'start' | 'end'
  } = {}
): DateRange | null {
  const { direction = 'both' } = options;
  
  let newStart = new Date(range.start);
  let newEnd = new Date(range.end);
  
  if (direction === 'both' || direction === 'start') {
    newStart = addTime(newStart, amount, unit);
  }
  
  if (direction === 'both' || direction === 'end') {
    newEnd = addTime(newEnd, -amount, unit);
  }
  
  // Check if result is valid
  if (newStart >= newEnd) {
    return null;
  }
  
  return {
    start: newStart,
    end: newEnd
  };
}

/**
 * Checks if one date range completely contains another
 * @param outer - The potentially containing range
 * @param inner - The potentially contained range
 * @returns True if outer completely contains inner
 * 
 * @example
 * ```ts
 * const outer = { start: new Date('2024-01-01'), end: new Date('2024-01-31') };
 * const inner = { start: new Date('2024-01-10'), end: new Date('2024-01-20') };
 * 
 * rangeContains(outer, inner); // true
 * ```
 */
export function rangeContains(outer: DateRange, inner: DateRange): boolean {
  return outer.start <= inner.start && outer.end >= inner.end;
}

/**
 * Sorts an array of date ranges by start date
 * @param ranges - Array of date ranges
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array of date ranges
 * 
 * @example
 * ```ts
 * const ranges = [
 *   { start: new Date('2024-01-15'), end: new Date('2024-01-20') },
 *   { start: new Date('2024-01-01'), end: new Date('2024-01-10') }
 * ];
 * 
 * sortRanges(ranges); // Sorted by start date ascending
 * ```
 */
export function sortRanges(ranges: DateRange[], order: 'asc' | 'desc' = 'asc'): DateRange[] {
  const sorted = [...ranges].sort((a, b) => {
    const diff = a.start.getTime() - b.start.getTime();
    return order === 'asc' ? diff : -diff;
  });
  
  return sorted;
}
