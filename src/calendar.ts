/**
 * Calendar and holiday utilities
 */

/**
 * Get the week number of the year (ISO 8601)
 * @param date - date to get week number for
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get the week of the month (1-6)
 * @param date - date to get week of month for
 */
export function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstWeekday = firstDay.getDay();
  const offsetDate = date.getDate() + firstWeekday - 1;
  return Math.floor(offsetDate / 7) + 1;
}

/**
 * Get the quarter of the year (1-4)
 * @param date - date to get quarter for
 */
export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * Get the day of the year (1-366)
 * @param date - date to get day of year for
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get the number of weeks in a year
 * @param year - year to check
 */
export function getWeeksInYear(year: number): number {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  
  // If Jan 1 is Thu-Sun or Dec 31 is Mon-Wed, there are 53 weeks
  const jan1Day = jan1.getDay();
  const dec31Day = dec31.getDay();
  
  if (jan1Day === 4 || (jan1Day === 3 && dec31Day === 4)) {
    return 53;
  }
  return 52;
}

/**
 * Get the number of days in a month
 * @param year - year
 * @param month - month (0-11)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the number of days in a year
 * @param year - year to check
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Check if a year is a leap year
 * @param year - year to check
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Calculate Easter Sunday for a given year (Western/Gregorian calendar)
 * @param year - year to calculate Easter for
 */
export function getEaster(year: number): Date {
  // Anonymous Gregorian algorithm
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

/**
 * Get all months in a year
 * @param year - year to get months for
 */
export function getMonthsInYear(year: number): Date[] {
  return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
}

/**
 * Get all days in a month
 * @param year - year
 * @param month - month (0-11)
 */
export function getDaysInMonthArray(year: number, month: number): Date[] {
  const daysCount = getDaysInMonth(year, month);
  return Array.from({ length: daysCount }, (_, i) => new Date(year, month, i + 1));
}

/**
 * Get all weekdays in a month
 * @param year - year
 * @param month - month (0-11)
 */
export function getWeekdaysInMonth(year: number, month: number): Date[] {
  return getDaysInMonthArray(year, month).filter(date => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not Sunday or Saturday
  });
}

/**
 * Get the first day of the month
 * @param date - any date in the month
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the last day of the month
 * @param date - any date in the month
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get the first day of the year
 * @param year - year
 */
export function getFirstDayOfYear(year: number): Date {
  return new Date(year, 0, 1);
}

/**
 * Get the last day of the year
 * @param year - year
 */
export function getLastDayOfYear(year: number): Date {
  return new Date(year, 11, 31);
}