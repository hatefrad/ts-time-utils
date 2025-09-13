import { 
  MILLISECONDS_PER_SECOND, 
  MILLISECONDS_PER_MINUTE, 
  MILLISECONDS_PER_HOUR, 
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
  MILLISECONDS_PER_MONTH,
  MILLISECONDS_PER_YEAR,
  TimeUnit
} from './constants.js';

/**
 * Calculate difference between two dates in specified unit
 * @param date1 - first date
 * @param date2 - second date
 * @param unit - unit to return the difference in
 * @param precise - if true, returns decimal values; if false, returns integers
 */
export function differenceInUnits(
  date1: Date,
  date2: Date,
  unit: TimeUnit = 'milliseconds',
  precise: boolean = true
): number {
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  
  let result: number;
  
  switch (unit) {
    case 'years':
      result = diffMs / MILLISECONDS_PER_YEAR;
      break;
    case 'months':
      result = diffMs / MILLISECONDS_PER_MONTH;
      break;
    case 'weeks':
      result = diffMs / MILLISECONDS_PER_WEEK;
      break;
    case 'days':
      result = diffMs / MILLISECONDS_PER_DAY;
      break;
    case 'hours':
      result = diffMs / MILLISECONDS_PER_HOUR;
      break;
    case 'minutes':
      result = diffMs / MILLISECONDS_PER_MINUTE;
      break;
    case 'seconds':
      result = diffMs / MILLISECONDS_PER_SECOND;
      break;
    case 'milliseconds':
    default:
      result = diffMs;
      break;
  }
  
  return precise ? result : Math.floor(result);
}

/**
 * Add time to a date
 * @param date - base date
 * @param amount - amount to add
 * @param unit - unit of the amount
 */
export function addTime(date: Date, amount: number, unit: TimeUnit): Date {
  const result = new Date(date);
  
  let milliseconds: number;
  
  switch (unit) {
    case 'years':
      milliseconds = amount * MILLISECONDS_PER_YEAR;
      break;
    case 'months':
      milliseconds = amount * MILLISECONDS_PER_MONTH;
      break;
    case 'weeks':
      milliseconds = amount * MILLISECONDS_PER_WEEK;
      break;
    case 'days':
      milliseconds = amount * MILLISECONDS_PER_DAY;
      break;
    case 'hours':
      milliseconds = amount * MILLISECONDS_PER_HOUR;
      break;
    case 'minutes':
      milliseconds = amount * MILLISECONDS_PER_MINUTE;
      break;
    case 'seconds':
      milliseconds = amount * MILLISECONDS_PER_SECOND;
      break;
    case 'milliseconds':
    default:
      milliseconds = amount;
      break;
  }
  
  result.setTime(result.getTime() + milliseconds);
  return result;
}

/**
 * Subtract time from a date
 * @param date - base date
 * @param amount - amount to subtract
 * @param unit - unit of the amount
 */
export function subtractTime(date: Date, amount: number, unit: TimeUnit): Date {
  return addTime(date, -amount, unit);
}

/**
 * Get the start of a time period for a given date
 * @param date - input date
 * @param unit - time unit to get the start of
 */
export function startOf(date: Date, unit: 'day' | 'week' | 'month' | 'year' | 'hour' | 'minute'): Date {
  const result = new Date(date);
  
  switch (unit) {
    case 'minute':
      result.setSeconds(0, 0);
      break;
    case 'hour':
      result.setMinutes(0, 0, 0);
      break;
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week':
      result.setHours(0, 0, 0, 0);
      result.setDate(result.getDate() - result.getDay());
      break;
    case 'month':
      result.setHours(0, 0, 0, 0);
      result.setDate(1);
      break;
    case 'year':
      result.setHours(0, 0, 0, 0);
      result.setMonth(0, 1);
      break;
  }
  
  return result;
}

/**
 * Get the end of a time period for a given date
 * @param date - input date
 * @param unit - time unit to get the end of
 */
export function endOf(date: Date, unit: 'day' | 'week' | 'month' | 'year' | 'hour' | 'minute'): Date {
  const result = new Date(date);
  
  switch (unit) {
    case 'minute':
      result.setSeconds(59, 999);
      break;
    case 'hour':
      result.setMinutes(59, 59, 999);
      break;
    case 'day':
      result.setHours(23, 59, 59, 999);
      break;
    case 'week':
      result.setHours(23, 59, 59, 999);
      result.setDate(result.getDate() + (6 - result.getDay()));
      break;
    case 'month':
      result.setHours(23, 59, 59, 999);
      result.setMonth(result.getMonth() + 1, 0);
      break;
    case 'year':
      result.setHours(23, 59, 59, 999);
      result.setMonth(11, 31);
      break;
  }
  
  return result;
}

/**
 * Check if a date is between two other dates
 * @param date - date to check
 * @param start - start date (inclusive)
 * @param end - end date (inclusive)
 */
export function isBetween(date: Date, start: Date, end: Date): boolean {
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

/**
 * Get the number of business days between two dates (excludes weekends)
 * @param startDate - start date
 * @param endDate - end date
 */
export function businessDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
