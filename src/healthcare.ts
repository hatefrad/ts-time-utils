/**
 * @fileoverview Healthcare utilities for medical scheduling and compliance timing
 * Provides medication schedules, shift patterns, on-call rotations, and compliance windows
 */

import type { DateInput, DateRange } from './types.js';
import { Duration } from './duration.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Standard medical abbreviations for medication frequency
 */
export type MedicationFrequency =
  | 'QD'    // once daily
  | 'BID'   // twice daily
  | 'TID'   // three times daily
  | 'QID'   // four times daily
  | 'q4h'   // every 4 hours
  | 'q6h'   // every 6 hours
  | 'q8h'   // every 8 hours
  | 'q12h'  // every 12 hours
  | 'PRN';  // as needed (returns null/empty)

/**
 * Shift duration patterns
 */
export type ShiftPattern = '8hr' | '12hr' | '24hr';

/**
 * Configuration for shift scheduling
 */
export interface ShiftConfig {
  pattern: ShiftPattern;
  startTime: { hour: number; minute: number };
  rotation?: 'fixed' | 'rotating';
}

/**
 * Configuration for medication timing
 */
export interface MedicationConfig {
  wakeTime?: string;   // default '07:00'
  sleepTime?: string;  // default '22:00'
  withMeals?: boolean;
}

/**
 * On-call slot assignment
 */
export interface OnCallSlot {
  staff: string;
  start: Date;
  end: Date;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Number of doses per day for each frequency
 */
export const MEDICATION_FREQUENCIES: Record<MedicationFrequency, number | null> = {
  'QD': 1,
  'BID': 2,
  'TID': 3,
  'QID': 4,
  'q4h': 6,
  'q6h': 4,
  'q8h': 3,
  'q12h': 2,
  'PRN': null
};

/**
 * Hours per shift pattern
 */
export const SHIFT_DURATIONS: Record<ShiftPattern, number> = {
  '8hr': 8,
  '12hr': 12,
  '24hr': 24
};

/**
 * Default medication timing config
 */
export const DEFAULT_MEDICATION_CONFIG: Required<MedicationConfig> = {
  wakeTime: '07:00',
  sleepTime: '22:00',
  withMeals: false
};

// ============================================================================
// Helper Functions
// ============================================================================

function toDate(input: DateInput): Date {
  if (input instanceof Date) return new Date(input.getTime());
  return new Date(input);
}

function parseTimeString(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

function setTimeOnDate(date: Date, hour: number, minute: number): Date {
  const result = new Date(date.getTime());
  result.setHours(hour, minute, 0, 0);
  return result;
}

// ============================================================================
// Medication Scheduling Functions
// ============================================================================

/**
 * Get medication administration times for a given date and frequency
 *
 * @param date - The date to get medication times for
 * @param frequency - Medical frequency abbreviation (QD, BID, TID, etc.)
 * @param config - Optional configuration for wake/sleep times
 * @returns Array of Date objects for each dose, empty array for PRN
 *
 * @example
 * ```ts
 * const times = getMedicationTimes(new Date('2024-01-15'), 'BID');
 * // Returns [7:00 AM, 7:00 PM] (twice daily)
 *
 * const customTimes = getMedicationTimes(new Date('2024-01-15'), 'TID', {
 *   wakeTime: '06:00',
 *   sleepTime: '21:00'
 * });
 * // Returns [6:00 AM, 1:30 PM, 9:00 PM] (three times daily)
 * ```
 */
export function getMedicationTimes(
  date: DateInput,
  frequency: MedicationFrequency,
  config?: MedicationConfig
): Date[] {
  const d = toDate(date);
  const cfg = { ...DEFAULT_MEDICATION_CONFIG, ...config };
  const doses = MEDICATION_FREQUENCIES[frequency];

  if (doses === null) {
    return []; // PRN - as needed
  }

  const wake = parseTimeString(cfg.wakeTime);
  const sleep = parseTimeString(cfg.sleepTime);

  // Calculate awake hours
  let awakeMinutes = (sleep.hour * 60 + sleep.minute) - (wake.hour * 60 + wake.minute);
  if (awakeMinutes <= 0) awakeMinutes += 24 * 60; // Handle overnight

  const times: Date[] = [];

  if (doses === 1) {
    // QD: morning dose
    times.push(setTimeOnDate(d, wake.hour, wake.minute));
  } else {
    // Distribute evenly across waking hours
    const interval = awakeMinutes / doses;

    for (let i = 0; i < doses; i++) {
      const minutesFromWake = Math.round(i * interval);
      let totalMinutes = wake.hour * 60 + wake.minute + minutesFromWake;

      // Handle day rollover
      if (totalMinutes >= 24 * 60) {
        totalMinutes -= 24 * 60;
      }

      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      times.push(setTimeOnDate(d, hour, minute));
    }
  }

  return times;
}

/**
 * Get the next medication time after a given date/time
 *
 * @param after - The date/time to find the next medication time after
 * @param frequency - Medical frequency abbreviation
 * @param config - Optional configuration
 * @returns Next medication Date, or null for PRN
 *
 * @example
 * ```ts
 * const next = getNextMedicationTime(new Date('2024-01-15T10:00:00'), 'BID');
 * // Returns 7:00 PM on same day (next BID dose after 10 AM)
 * ```
 */
export function getNextMedicationTime(
  after: DateInput,
  frequency: MedicationFrequency,
  config?: MedicationConfig
): Date | null {
  if (frequency === 'PRN') {
    return null;
  }

  const afterDate = toDate(after);

  // Check today's doses first
  const todayTimes = getMedicationTimes(afterDate, frequency, config);
  for (const time of todayTimes) {
    if (time.getTime() > afterDate.getTime()) {
      return time;
    }
  }

  // Get first dose tomorrow
  const tomorrow = new Date(afterDate.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = getMedicationTimes(tomorrow, frequency, config);

  return tomorrowTimes[0] || null;
}

/**
 * Parse a medication frequency string to MedicationFrequency type
 *
 * @param freq - String to parse (case-insensitive)
 * @returns MedicationFrequency or null if invalid
 *
 * @example
 * ```ts
 * parseMedicationFrequency('bid'); // 'BID'
 * parseMedicationFrequency('q8h'); // 'q8h'
 * parseMedicationFrequency('invalid'); // null
 * ```
 */
export function parseMedicationFrequency(freq: string): MedicationFrequency | null {
  const normalized = freq.toLowerCase();

  const mapping: Record<string, MedicationFrequency> = {
    'qd': 'QD',
    'od': 'QD',
    'once daily': 'QD',
    'bid': 'BID',
    'twice daily': 'BID',
    'tid': 'TID',
    'three times daily': 'TID',
    'qid': 'QID',
    'four times daily': 'QID',
    'q4h': 'q4h',
    'every 4 hours': 'q4h',
    'q6h': 'q6h',
    'every 6 hours': 'q6h',
    'q8h': 'q8h',
    'every 8 hours': 'q8h',
    'q12h': 'q12h',
    'every 12 hours': 'q12h',
    'prn': 'PRN',
    'as needed': 'PRN'
  };

  return mapping[normalized] || null;
}

// ============================================================================
// Shift Scheduling Functions
// ============================================================================

/**
 * Generate shift schedule for a date range
 *
 * @param start - Start of range
 * @param end - End of range
 * @param config - Shift configuration
 * @returns Array of DateRange objects representing shifts
 *
 * @example
 * ```ts
 * const shifts = generateShiftSchedule(
 *   new Date('2024-01-15'),
 *   new Date('2024-01-17'),
 *   { pattern: '12hr', startTime: { hour: 7, minute: 0 } }
 * );
 * // Returns 4 shifts: day/night on 15th, day/night on 16th
 * ```
 */
export function generateShiftSchedule(
  start: DateInput,
  end: DateInput,
  config: ShiftConfig
): DateRange[] {
  const startDate = toDate(start);
  const endDate = toDate(end);
  const shiftHours = SHIFT_DURATIONS[config.pattern];
  const shiftsPerDay = 24 / shiftHours;

  const shifts: DateRange[] = [];
  const current = new Date(startDate.getTime());
  current.setHours(config.startTime.hour, config.startTime.minute, 0, 0);

  // If start time is after the input start, go back one shift cycle
  if (current.getTime() > startDate.getTime()) {
    current.setTime(current.getTime() - shiftHours * 60 * 60 * 1000);
  }

  while (current.getTime() < endDate.getTime()) {
    const shiftStart = new Date(current.getTime());
    const shiftEnd = new Date(current.getTime() + shiftHours * 60 * 60 * 1000);

    // Only include shifts that overlap with the requested range
    if (shiftEnd.getTime() > startDate.getTime() && shiftStart.getTime() < endDate.getTime()) {
      shifts.push({ start: shiftStart, end: shiftEnd });
    }

    current.setTime(current.getTime() + shiftHours * 60 * 60 * 1000);
  }

  return shifts;
}

/**
 * Get the shift containing a specific time
 *
 * @param date - The date/time to check
 * @param config - Shift configuration
 * @returns DateRange of the shift containing the time
 *
 * @example
 * ```ts
 * const shift = getShiftForTime(
 *   new Date('2024-01-15T14:00:00'),
 *   { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
 * );
 * // Returns { start: 7:00 AM, end: 3:00 PM } (day shift)
 * ```
 */
export function getShiftForTime(date: DateInput, config: ShiftConfig): DateRange {
  const d = toDate(date);
  const shiftHours = SHIFT_DURATIONS[config.pattern];
  const shiftMs = shiftHours * 60 * 60 * 1000;

  // Find the shift start that contains this time
  const dayStart = new Date(d.getTime());
  dayStart.setHours(config.startTime.hour, config.startTime.minute, 0, 0);

  // Calculate how many shift cycles from dayStart
  let diff = d.getTime() - dayStart.getTime();
  if (diff < 0) {
    // Time is before today's first shift start
    diff += 24 * 60 * 60 * 1000;
    dayStart.setTime(dayStart.getTime() - 24 * 60 * 60 * 1000);
  }

  const shiftIndex = Math.floor(diff / shiftMs);
  const shiftStart = new Date(dayStart.getTime() + shiftIndex * shiftMs);
  const shiftEnd = new Date(shiftStart.getTime() + shiftMs);

  return { start: shiftStart, end: shiftEnd };
}

/**
 * Check if a date/time is during a specific shift
 *
 * @param date - The date/time to check
 * @param shiftStart - When the shift started
 * @param config - Shift configuration
 * @returns true if the time is during the shift
 *
 * @example
 * ```ts
 * isOnShift(
 *   new Date('2024-01-15T10:00:00'),
 *   new Date('2024-01-15T07:00:00'),
 *   { pattern: '8hr', startTime: { hour: 7, minute: 0 } }
 * ); // true (10 AM is during 7 AM - 3 PM shift)
 * ```
 */
export function isOnShift(date: DateInput, shiftStart: DateInput, config: ShiftConfig): boolean {
  const d = toDate(date);
  const start = toDate(shiftStart);
  const shiftHours = SHIFT_DURATIONS[config.pattern];
  const shiftEnd = new Date(start.getTime() + shiftHours * 60 * 60 * 1000);

  return d.getTime() >= start.getTime() && d.getTime() < shiftEnd.getTime();
}

// ============================================================================
// On-Call Rotation Functions
// ============================================================================

/**
 * Create an on-call rotation schedule
 *
 * @param start - Start of rotation period
 * @param end - End of rotation period
 * @param staff - Array of staff names to rotate through
 * @param hoursPerShift - Hours per on-call shift (default 24)
 * @returns Array of OnCallSlot assignments
 *
 * @example
 * ```ts
 * const rotation = createOnCallRotation(
 *   new Date('2024-01-15'),
 *   new Date('2024-01-18'),
 *   ['Dr. Smith', 'Dr. Jones', 'Dr. Brown'],
 *   24
 * );
 * // Returns 3 slots, one per doctor per day
 * ```
 */
export function createOnCallRotation(
  start: DateInput,
  end: DateInput,
  staff: string[],
  hoursPerShift: number = 24
): OnCallSlot[] {
  if (staff.length === 0) {
    return [];
  }

  const startDate = toDate(start);
  const endDate = toDate(end);
  const shiftMs = hoursPerShift * 60 * 60 * 1000;

  const slots: OnCallSlot[] = [];
  const current = new Date(startDate.getTime());
  current.setHours(0, 0, 0, 0); // Start at midnight

  let staffIndex = 0;

  while (current.getTime() < endDate.getTime()) {
    const slotEnd = new Date(Math.min(current.getTime() + shiftMs, endDate.getTime()));

    slots.push({
      staff: staff[staffIndex % staff.length],
      start: new Date(current.getTime()),
      end: slotEnd
    });

    staffIndex++;
    current.setTime(current.getTime() + shiftMs);
  }

  return slots;
}

/**
 * Get the staff member on call at a specific time
 *
 * @param date - The date/time to check
 * @param rotation - The on-call rotation schedule
 * @returns Staff name or null if no one is on call
 *
 * @example
 * ```ts
 * const onCall = getOnCallStaff(new Date('2024-01-16T03:00:00'), rotation);
 * // Returns 'Dr. Jones' (whoever is on call at 3 AM on the 16th)
 * ```
 */
export function getOnCallStaff(date: DateInput, rotation: OnCallSlot[]): string | null {
  const d = toDate(date);

  for (const slot of rotation) {
    if (d.getTime() >= slot.start.getTime() && d.getTime() < slot.end.getTime()) {
      return slot.staff;
    }
  }

  return null;
}

// ============================================================================
// Compliance Window Functions
// ============================================================================

/**
 * Check if an event occurred within its compliance window
 *
 * @param event - When the event occurred
 * @param deadline - The compliance deadline
 * @returns true if event is before or at deadline
 *
 * @example
 * ```ts
 * isWithinComplianceWindow(
 *   new Date('2024-01-15T10:00:00'),
 *   new Date('2024-01-15T12:00:00')
 * ); // true (event occurred before deadline)
 * ```
 */
export function isWithinComplianceWindow(event: DateInput, deadline: DateInput): boolean {
  const eventDate = toDate(event);
  const deadlineDate = toDate(deadline);

  return eventDate.getTime() <= deadlineDate.getTime();
}

/**
 * Calculate the compliance deadline from an event
 *
 * @param event - The triggering event
 * @param windowHours - Hours until deadline
 * @returns Deadline Date
 *
 * @example
 * ```ts
 * const deadline = getComplianceDeadline(
 *   new Date('2024-01-15T08:00:00'),
 *   72
 * );
 * // Returns 2024-01-18T08:00:00 (72 hours later)
 * ```
 */
export function getComplianceDeadline(event: DateInput, windowHours: number): Date {
  const eventDate = toDate(event);
  return new Date(eventDate.getTime() + windowHours * 60 * 60 * 1000);
}

/**
 * Calculate time remaining until a compliance deadline
 *
 * @param event - Current time or event time
 * @param deadline - The compliance deadline
 * @returns Duration until deadline, or null if already past
 *
 * @example
 * ```ts
 * const remaining = timeUntilDeadline(
 *   new Date('2024-01-15T10:00:00'),
 *   new Date('2024-01-16T10:00:00')
 * );
 * // Returns Duration of 24 hours
 * ```
 */
export function timeUntilDeadline(event: DateInput, deadline: DateInput): Duration | null {
  const eventDate = toDate(event);
  const deadlineDate = toDate(deadline);

  const diff = deadlineDate.getTime() - eventDate.getTime();

  if (diff < 0) {
    return null; // Already past deadline
  }

  return Duration.fromMilliseconds(diff);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate rest hours between two shifts
 *
 * @param shift1End - End of first shift
 * @param shift2Start - Start of second shift
 * @returns Hours of rest between shifts
 *
 * @example
 * ```ts
 * const rest = calculateRestBetweenShifts(
 *   new Date('2024-01-15T19:00:00'),
 *   new Date('2024-01-16T07:00:00')
 * );
 * // Returns 12 (hours of rest)
 * ```
 */
export function calculateRestBetweenShifts(shift1End: DateInput, shift2Start: DateInput): number {
  const end = toDate(shift1End);
  const start = toDate(shift2Start);

  const diffMs = start.getTime() - end.getTime();
  return diffMs / (60 * 60 * 1000);
}
