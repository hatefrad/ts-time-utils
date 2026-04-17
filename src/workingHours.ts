/**
 * Working hours utilities for business time calculations
 */

import type { WorkingHoursConfig } from './types.js';

export const DEFAULT_WORKING_HOURS: WorkingHoursConfig = {
  workingDays: [1,2,3,4,5],
  hours: { start: 9, end: 17 },
  breaks: [{ start: 12, end: 13 }]
};

/** Check if a date is a configured working day */
export function isWorkingDay(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): boolean {
  return config.workingDays.includes(date.getDay());
}

/** Convert date to fractional hour */
function toHourFraction(date: Date): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds()/3600;
}

/** Check if inside working hours (excluding breaks) */
export function isWorkingTime(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): boolean {
  if (!isWorkingDay(date, config)) return false;
  const h = toHourFraction(date);
  if (h < config.hours.start || h >= config.hours.end) return false;
  if (config.breaks) {
    for (const b of config.breaks) {
      if (h >= b.start && h < b.end) return false;
    }
  }
  return true;
}

/** Move date forward to next working minute */
export function nextWorkingTime(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  const d = new Date(date);
  while (!isWorkingTime(d, config)) {
    d.setMinutes(d.getMinutes() + 1);
  }
  return d;
}

/** Clamp a date into working window of its day */
function clampToWorkingWindow(date: Date, config: WorkingHoursConfig): Date | null {
  if (!isWorkingDay(date, config)) return null;
  const start = new Date(date); start.setHours(config.hours.start,0,0,0);
  const end = new Date(date); end.setHours(config.hours.end,0,0,0);
  if (date < start) return start;
  if (date > end) return null;
  return date;
}

/** Compute working time (ms) between two dates */
export function workingTimeBetween(start: Date, end: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): number {
  if (end <= start) return 0;
  let total = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    if (isWorkingDay(cursor, config)) {
      const windowStart = new Date(cursor); windowStart.setHours(config.hours.start,0,0,0);
      const windowEnd = new Date(cursor); windowEnd.setHours(config.hours.end,0,0,0);
      const rangeStart = cursor > windowStart ? cursor : windowStart;
      const rangeEnd = end < windowEnd ? end : windowEnd;
      if (rangeStart < rangeEnd) {
        let segment = (rangeEnd.getTime() - rangeStart.getTime()) / 1000 / 60 / 60; // hours
        // subtract breaks
        if (config.breaks) {
          for (const b of config.breaks) {
            const bStart = new Date(rangeStart); bStart.setHours(Math.floor(b.start), (b.start%1)*60,0,0);
            const bEnd = new Date(rangeStart); bEnd.setHours(Math.floor(b.end), (b.end%1)*60,0,0);
            const overlapStart = bStart > rangeStart ? bStart : rangeStart;
            const overlapEnd = bEnd < rangeEnd ? bEnd : rangeEnd;
            if (overlapStart < overlapEnd) {
              segment -= (overlapEnd.getTime() - overlapStart.getTime()) / 1000 / 60 / 60;
            }
          }
        }
        total += segment;
      }
    }
    // advance to next day start
    cursor.setHours(24,0,0,0);
  }
  return total * 60 * 60 * 1000; // ms
}

/** Advance by working hours amount (simple iterative approach) */
export function addWorkingHours(start: Date, hours: number, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  if (hours <= 0) return new Date(start);
  let remaining = hours * 60; // minutes
  let cursor = new Date(start);
  cursor = nextWorkingTime(cursor, config);
  while (remaining > 0) {
    if (isWorkingTime(cursor, config)) {
      cursor.setMinutes(cursor.getMinutes() + 1);
      remaining -= 1;
    } else {
      cursor = nextWorkingTime(cursor, config);
    }
  }
  return cursor;
}

/**
 * Add working days to a date
 * @param start - start date
 * @param days - number of working days to add
 * @param config - working hours configuration
 */
export function addWorkingDays(start: Date, days: number, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  if (days === 0) return new Date(start);
  
  const result = new Date(start);
  const direction = days > 0 ? 1 : -1;
  let remaining = Math.abs(days);
  
  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    if (isWorkingDay(result, config)) {
      remaining--;
    }
  }
  
  return result;
}

/**
 * Subtract working days from a date
 * @param start - start date
 * @param days - number of working days to subtract
 * @param config - working hours configuration
 */
export function subtractWorkingDays(start: Date, days: number, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  return addWorkingDays(start, -days, config);
}

/**
 * Get the next working day from a given date
 * @param date - start date
 * @param config - working hours configuration
 */
export function getNextWorkingDay(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);
  
  while (!isWorkingDay(result, config)) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
}

/**
 * Get the previous working day from a given date
 * @param date - start date
 * @param config - working hours configuration
 */
export function getPreviousWorkingDay(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - 1);
  
  while (!isWorkingDay(result, config)) {
    result.setDate(result.getDate() - 1);
  }
  
  return result;
}

/**
 * Get the number of working days in a month
 * @param year - year
 * @param month - month (0-11)
 * @param config - working hours configuration
 */
export function getWorkingDaysInMonth(year: number, month: number, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (isWorkingDay(date, config)) {
      count++;
    }
  }
  
  return count;
}

/**
 * Get all working days in a month as an array of dates
 * @param year - year
 * @param month - month (0-11)
 * @param config - working hours configuration
 */
export function getWorkingDaysInMonthArray(year: number, month: number, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const workingDays: Date[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (isWorkingDay(date, config)) {
      workingDays.push(date);
    }
  }
  
  return workingDays;
}

/**
 * Get working days between two dates (inclusive)
 * @param start - start date
 * @param end - end date
 * @param config - working hours configuration
 */
export function workingDaysBetween(start: Date, end: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): number {
  if (end < start) return 0;
  
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  
  while (current <= endDate) {
    if (isWorkingDay(current, config)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Check if a date is during work break
 * @param date - date to check
 * @param config - working hours configuration
 */
export function isBreakTime(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): boolean {
  if (!isWorkingDay(date, config)) return false;
  if (!config.breaks || config.breaks.length === 0) return false;
  
  const h = toHourFraction(date);
  for (const b of config.breaks) {
    if (h >= b.start && h < b.end) return true;
  }
  return false;
}

/**
 * Get the start of the work day for a given date
 * @param date - date to get work start for
 * @param config - working hours configuration
 */
export function getWorkDayStart(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  const result = new Date(date);
  result.setHours(config.hours.start, 0, 0, 0);
  return result;
}

/**
 * Get the end of the work day for a given date
 * @param date - date to get work end for
 * @param config - working hours configuration
 */
export function getWorkDayEnd(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  const result = new Date(date);
  result.setHours(config.hours.end, 0, 0, 0);
  return result;
}

/**
 * Get the total working hours per day (excluding breaks)
 * @param config - working hours configuration
 */
export function getWorkingHoursPerDay(config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): number {
  let hours = config.hours.end - config.hours.start;
  
  if (config.breaks) {
    for (const b of config.breaks) {
      hours -= (b.end - b.start);
    }
  }
  
  return hours;
}
