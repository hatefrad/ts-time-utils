/**
 * Check if a date is valid
 * @param date - date to validate
 */
export function isValidDate(date: Date | string | number): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  if (typeof date === 'string' || typeof date === 'number') {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  
  return false;
}

/**
 * Check if a year is a leap year
 * @param year - year to check
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Check if a date is in the past
 * @param date - date to check
 */
export function isPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Check if a date is in the future
 * @param date - date to check
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > new Date().getTime();
}

/**
 * Check if a date is today
 * @param date - date to check
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 * @param date - date to check
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if a date is tomorrow
 * @param date - date to check
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if two dates are the same day
 * @param date1 - first date
 * @param date2 - second date
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - date to check
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

/**
 * Check if a date is a weekday (Monday through Friday)
 * @param date - date to check
 */
export function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Check if a time string is valid (HH:MM or HH:MM:SS format)
 * @param time - time string to validate
 */
export function isValidTimeString(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  return timeRegex.test(time);
}

/**
 * Check if a date string is valid ISO 8601 format
 * @param dateString - date string to validate
 */
export function isValidISOString(dateString: string): boolean {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoRegex.test(dateString) && isValidDate(dateString);
}

/**
 * Check if two dates are in the same week (ISO week, Monday-Sunday)
 * @param date1 - first date
 * @param date2 - second date
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const getWeekStart = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  
  return getWeekStart(date1).getTime() === getWeekStart(date2).getTime();
}

/**
 * Check if two dates are in the same month
 * @param date1 - first date
 * @param date2 - second date
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Check if two dates are in the same year
 * @param date1 - first date
 * @param date2 - second date
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

/**
 * Check if a date is in the current week
 * @param date - date to check
 */
export function isThisWeek(date: Date): boolean {
  return isSameWeek(date, new Date());
}

/**
 * Check if a date is in the current month
 * @param date - date to check
 */
export function isThisMonth(date: Date): boolean {
  return isSameMonth(date, new Date());
}

/**
 * Check if a date is in the current year
 * @param date - date to check
 */
export function isThisYear(date: Date): boolean {
  return isSameYear(date, new Date());
}

/**
 * Check if a date is a business day (weekday, optionally excluding holidays)
 * @param date - date to check
 * @param holidays - optional array of holiday dates to exclude
 */
export function isBusinessDay(date: Date, holidays: Date[] = []): boolean {
  if (isWeekend(date)) return false;
  
  return !holidays.some(holiday => isSameDay(date, holiday));
}

/**
 * Check if a date is in the last N days (including today)
 * @param date - date to check
 * @param n - number of days
 */
export function isInLastNDays(date: Date, n: number): boolean {
  const now = new Date();
  const nDaysAgo = new Date(now);
  nDaysAgo.setDate(nDaysAgo.getDate() - n);
  nDaysAgo.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  
  return date >= nDaysAgo && date <= endOfToday;
}

/**
 * Check if a date is in the next N days (including today)
 * @param date - date to check
 * @param n - number of days
 */
export function isInNextNDays(date: Date, n: number): boolean {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  const nDaysFromNow = new Date(now);
  nDaysFromNow.setDate(nDaysFromNow.getDate() + n);
  nDaysFromNow.setHours(23, 59, 59, 999);
  
  return date >= startOfToday && date <= nDaysFromNow;
}
