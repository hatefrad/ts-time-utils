/**
 * @fileoverview Scheduling and booking utilities
 * Provides slot generation, availability checking, and conflict detection
 */

import type { DateRange, DateInput, WorkingHoursConfig, RecurrenceRule } from './types.js';
import { dateRangeOverlap, mergeDateRanges, findGaps } from './dateRange.js';
import { isWorkingDay, isWorkingTime, DEFAULT_WORKING_HOURS, getWorkDayStart, getWorkDayEnd } from './workingHours.js';
import { getOccurrencesBetween } from './recurrence.js';

/** Configuration for scheduling operations */
export interface SchedulingConfig {
  /** Working hours configuration */
  workingHours?: WorkingHoursConfig;
  /** Buffer time between appointments in minutes */
  bufferMinutes?: number;
  /** Default slot duration in minutes */
  slotDuration?: number;
  /** Holidays to exclude */
  holidays?: Date[];
}

/** A time slot with availability status */
export interface Slot {
  start: Date;
  end: Date;
  available: boolean;
}

/** A booking with optional metadata */
export interface Booking extends DateRange {
  id?: string;
  metadata?: Record<string, unknown>;
}

/** Default scheduling configuration */
export const DEFAULT_SCHEDULING_CONFIG: SchedulingConfig = {
  workingHours: DEFAULT_WORKING_HOURS,
  bufferMinutes: 0,
  slotDuration: 30,
  holidays: []
};

/**
 * Helper to convert DateInput to Date
 */
function toDate(input: DateInput): Date {
  if (input instanceof Date) return new Date(input);
  return new Date(input);
}

/**
 * Check if a date is a holiday
 */
function isHoliday(date: Date, holidays: Date[]): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return holidays.some(h => h.toISOString().split('T')[0] === dateStr);
}

/**
 * Generates time slots for a single day
 * @param date - The date to generate slots for
 * @param config - Scheduling configuration
 * @returns Array of slots for the day
 *
 * @example
 * ```ts
 * const slots = generateSlots(new Date('2024-01-15'), { slotDuration: 30 });
 * // Returns 30-minute slots during working hours
 * ```
 */
export function generateSlots(date: DateInput, config: SchedulingConfig = {}): Slot[] {
  const d = toDate(date);
  const cfg = { ...DEFAULT_SCHEDULING_CONFIG, ...config };
  const workingHours = cfg.workingHours ?? DEFAULT_WORKING_HOURS;

  // Check if it's a working day and not a holiday
  if (!isWorkingDay(d, workingHours)) return [];
  if (cfg.holidays && isHoliday(d, cfg.holidays)) return [];

  const slots: Slot[] = [];
  const slotDuration = cfg.slotDuration ?? 30;

  const dayStart = getWorkDayStart(d, workingHours);
  const dayEnd = getWorkDayEnd(d, workingHours);

  let current = new Date(dayStart);

  while (current < dayEnd) {
    const slotEnd = new Date(current.getTime() + slotDuration * 60 * 1000);

    // Don't create slots that extend past working hours
    if (slotEnd <= dayEnd) {
      // Check if slot is during working time (not during breaks)
      const midpoint = new Date(current.getTime() + (slotDuration * 60 * 1000) / 2);
      const available = isWorkingTime(midpoint, workingHours);

      slots.push({
        start: new Date(current),
        end: new Date(slotEnd),
        available
      });
    }

    current = slotEnd;
  }

  return slots;
}

/**
 * Generates time slots for a date range
 * @param range - The date range to generate slots for
 * @param config - Scheduling configuration
 * @returns Array of slots for all days in range
 *
 * @example
 * ```ts
 * const range = { start: new Date('2024-01-15'), end: new Date('2024-01-17') };
 * const slots = generateSlotsForRange(range, { slotDuration: 60 });
 * ```
 */
export function generateSlotsForRange(range: DateRange, config: SchedulingConfig = {}): Slot[] {
  const slots: Slot[] = [];
  const current = new Date(range.start);
  current.setHours(0, 0, 0, 0);

  const endDate = new Date(range.end);
  endDate.setHours(23, 59, 59, 999);

  while (current <= endDate) {
    const daySlots = generateSlots(current, config);
    slots.push(...daySlots);
    current.setDate(current.getDate() + 1);
  }

  return slots;
}

/**
 * Gets available slots for a day, excluding existing bookings
 * @param date - The date to check
 * @param bookings - Existing bookings
 * @param config - Scheduling configuration
 * @returns Array of available slots
 *
 * @example
 * ```ts
 * const bookings = [{ start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }];
 * const available = getAvailableSlots(new Date('2024-01-15'), bookings);
 * ```
 */
export function getAvailableSlots(
  date: DateInput,
  bookings: Booking[],
  config: SchedulingConfig = {}
): Slot[] {
  const cfg = { ...DEFAULT_SCHEDULING_CONFIG, ...config };
  const slots = generateSlots(date, cfg);
  const bufferMs = (cfg.bufferMinutes ?? 0) * 60 * 1000;

  return slots.map(slot => {
    // Expand slot by buffer for conflict checking
    const checkRange: DateRange = {
      start: new Date(slot.start.getTime() - bufferMs),
      end: new Date(slot.end.getTime() + bufferMs)
    };

    const hasConflict = bookings.some(booking => dateRangeOverlap(checkRange, booking));

    return {
      ...slot,
      available: slot.available && !hasConflict
    };
  });
}

/**
 * Finds the next available slot of specified duration
 * @param after - Start searching after this date
 * @param bookings - Existing bookings
 * @param duration - Required slot duration in minutes
 * @param config - Scheduling configuration
 * @returns Next available slot or null if none found within 30 days
 *
 * @example
 * ```ts
 * const nextSlot = findNextAvailable(new Date(), bookings, 60);
 * if (nextSlot) console.log(`Next 1-hour slot at ${nextSlot.start}`);
 * ```
 */
export function findNextAvailable(
  after: DateInput,
  bookings: Booking[],
  duration: number,
  config: SchedulingConfig = {}
): Slot | null {
  const startDate = toDate(after);
  const cfg = { ...DEFAULT_SCHEDULING_CONFIG, ...config, slotDuration: duration };

  // Search up to 30 days ahead
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + dayOffset);

    const availableSlots = getAvailableSlots(checkDate, bookings, cfg);

    for (const slot of availableSlots) {
      if (slot.available && slot.start >= startDate) {
        return slot;
      }
    }
  }

  return null;
}

/**
 * Checks if a slot is available (no conflicts with existing bookings)
 * @param slot - The slot to check
 * @param bookings - Existing bookings
 * @returns True if slot is available
 *
 * @example
 * ```ts
 * const slot = { start: new Date('2024-01-15T14:00'), end: new Date('2024-01-15T15:00') };
 * if (isSlotAvailable(slot, existingBookings)) {
 *   // Book the slot
 * }
 * ```
 */
export function isSlotAvailable(slot: DateRange, bookings: Booking[]): boolean {
  return !bookings.some(booking => dateRangeOverlap(slot, booking));
}

/**
 * Finds bookings that conflict with a proposed time range
 * @param bookings - Existing bookings
 * @param proposed - Proposed time range
 * @returns Array of conflicting bookings
 *
 * @example
 * ```ts
 * const conflicts = findConflicts(existingBookings, { start: propStart, end: propEnd });
 * if (conflicts.length > 0) {
 *   console.log('Conflicts with:', conflicts);
 * }
 * ```
 */
export function findConflicts(bookings: Booking[], proposed: DateRange): Booking[] {
  return bookings.filter(booking => dateRangeOverlap(booking, proposed));
}

/**
 * Checks if a proposed time range has any conflicts
 * @param bookings - Existing bookings
 * @param proposed - Proposed time range
 * @returns True if there are conflicts
 *
 * @example
 * ```ts
 * if (hasConflict(existingBookings, proposedMeeting)) {
 *   console.log('Time slot not available');
 * }
 * ```
 */
export function hasConflict(bookings: Booking[], proposed: DateRange): boolean {
  return bookings.some(booking => dateRangeOverlap(booking, proposed));
}

/**
 * Adds buffer time around a slot
 * @param slot - The original slot
 * @param bufferMinutes - Buffer time in minutes
 * @returns New slot with buffer added
 *
 * @example
 * ```ts
 * const slot = { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') };
 * const buffered = addBuffer(slot, 15);
 * // buffered.start = 09:45, buffered.end = 11:15
 * ```
 */
export function addBuffer(slot: DateRange, bufferMinutes: number): DateRange {
  const bufferMs = bufferMinutes * 60 * 1000;
  return {
    start: new Date(slot.start.getTime() - bufferMs),
    end: new Date(slot.end.getTime() + bufferMs)
  };
}

/**
 * Removes buffer time from a slot
 * @param slot - The buffered slot
 * @param bufferMinutes - Buffer time in minutes to remove
 * @returns New slot with buffer removed
 *
 * @example
 * ```ts
 * const bufferedSlot = { start: new Date('2024-01-15T09:45'), end: new Date('2024-01-15T11:15') };
 * const original = removeBuffer(bufferedSlot, 15);
 * // original.start = 10:00, original.end = 11:00
 * ```
 */
export function removeBuffer(slot: DateRange, bufferMinutes: number): DateRange {
  const bufferMs = bufferMinutes * 60 * 1000;
  return {
    start: new Date(slot.start.getTime() + bufferMs),
    end: new Date(slot.end.getTime() - bufferMs)
  };
}

/**
 * Expands recurring availability pattern into concrete slots
 * @param pattern - Recurrence pattern
 * @param range - Date range to expand within
 * @param config - Scheduling configuration
 * @returns Array of slots from the recurring pattern
 *
 * @example
 * ```ts
 * const pattern = {
 *   frequency: 'weekly',
 *   startDate: new Date('2024-01-01'),
 *   byWeekday: [1, 3, 5], // Mon, Wed, Fri
 *   until: new Date('2024-12-31')
 * };
 * const slots = expandRecurringAvailability(pattern, range);
 * ```
 */
export function expandRecurringAvailability(
  pattern: RecurrenceRule,
  range: DateRange,
  config: SchedulingConfig = {}
): Slot[] {
  const occurrences = getOccurrencesBetween(pattern, range.start, range.end);
  const slots: Slot[] = [];

  for (const occurrence of occurrences) {
    const daySlots = generateSlots(occurrence, config);
    slots.push(...daySlots);
  }

  return slots;
}

/**
 * Merges adjacent or overlapping bookings
 * @param bookings - Array of bookings to merge
 * @returns Array of merged bookings
 *
 * @example
 * ```ts
 * const bookings = [
 *   { start: new Date('2024-01-15T09:00'), end: new Date('2024-01-15T10:00') },
 *   { start: new Date('2024-01-15T10:00'), end: new Date('2024-01-15T11:00') }
 * ];
 * const merged = mergeBookings(bookings);
 * // [{ start: 09:00, end: 11:00 }]
 * ```
 */
export function mergeBookings(bookings: Booking[]): Booking[] {
  if (bookings.length === 0) return [];

  const ranges = mergeDateRanges(bookings);

  return ranges.map(range => ({
    start: range.start,
    end: range.end
  }));
}

/**
 * Splits a slot at a specific time
 * @param slot - The slot to split
 * @param at - The time to split at
 * @returns Tuple of two slots, or null if split point is outside slot
 *
 * @example
 * ```ts
 * const slot = { start: new Date('2024-01-15T09:00'), end: new Date('2024-01-15T11:00'), available: true };
 * const [before, after] = splitSlot(slot, new Date('2024-01-15T10:00'));
 * // before: 09:00-10:00, after: 10:00-11:00
 * ```
 */
export function splitSlot(slot: Slot, at: DateInput): [Slot, Slot] | null {
  const splitTime = toDate(at);

  if (splitTime <= slot.start || splitTime >= slot.end) {
    return null;
  }

  return [
    {
      start: new Date(slot.start),
      end: new Date(splitTime),
      available: slot.available
    },
    {
      start: new Date(splitTime),
      end: new Date(slot.end),
      available: slot.available
    }
  ];
}
