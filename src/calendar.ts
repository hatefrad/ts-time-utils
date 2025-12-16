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

/**
 * Get the nth occurrence of a day in a month (e.g., 2nd Monday)
 * @param year - year
 * @param month - month (0-11)
 * @param dayOfWeek - day of week (0=Sunday, 6=Saturday)
 * @param n - occurrence (1-5, or -1 for last)
 */
export function getNthDayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date | null {
  if (n === 0 || n < -1 || n > 5) return null;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  if (n === -1) {
    // Last occurrence
    let date = lastDay.getDate();
    while (date > 0) {
      const d = new Date(year, month, date);
      if (d.getDay() === dayOfWeek) return d;
      date--;
    }
    return null;
  }
  
  // Find nth occurrence
  let count = 0;
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const d = new Date(year, month, date);
    if (d.getDay() === dayOfWeek) {
      count++;
      if (count === n) return d;
    }
  }
  
  return null;
}

/**
 * US Holiday type
 */
export interface USHoliday {
  name: string;
  date: Date;
  type: 'federal' | 'observance';
}

/**
 * Get New Year's Day
 * @param year - year
 */
export function getNewYearsDay(year: number): Date {
  return new Date(year, 0, 1);
}

/**
 * Get Martin Luther King Jr. Day (3rd Monday of January)
 * @param year - year
 */
export function getMLKDay(year: number): Date | null {
  return getNthDayOfMonth(year, 0, 1, 3);
}

/**
 * Get Presidents' Day (3rd Monday of February)
 * @param year - year
 */
export function getPresidentsDay(year: number): Date | null {
  return getNthDayOfMonth(year, 1, 1, 3);
}

/**
 * Get Memorial Day (last Monday of May)
 * @param year - year
 */
export function getMemorialDay(year: number): Date | null {
  return getNthDayOfMonth(year, 4, 1, -1);
}

/**
 * Get Independence Day (July 4th)
 * @param year - year
 */
export function getIndependenceDay(year: number): Date {
  return new Date(year, 6, 4);
}

/**
 * Get Labor Day (1st Monday of September)
 * @param year - year
 */
export function getLaborDay(year: number): Date | null {
  return getNthDayOfMonth(year, 8, 1, 1);
}

/**
 * Get Columbus Day (2nd Monday of October)
 * @param year - year
 */
export function getColumbusDay(year: number): Date | null {
  return getNthDayOfMonth(year, 9, 1, 2);
}

/**
 * Get Veterans Day (November 11th)
 * @param year - year
 */
export function getVeteransDay(year: number): Date {
  return new Date(year, 10, 11);
}

/**
 * Get Thanksgiving Day (4th Thursday of November)
 * @param year - year
 */
export function getThanksgivingDay(year: number): Date | null {
  return getNthDayOfMonth(year, 10, 4, 4);
}

/**
 * Get Christmas Day (December 25th)
 * @param year - year
 */
export function getChristmasDay(year: number): Date {
  return new Date(year, 11, 25);
}

/**
 * Get Good Friday (Friday before Easter)
 * @param year - year
 */
export function getGoodFriday(year: number): Date {
  const easter = getEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  return goodFriday;
}

/**
 * Get all US federal holidays for a year
 * @param year - year
 */
export function getUSHolidays(year: number): USHoliday[] {
  const holidays: USHoliday[] = [];
  
  holidays.push({ name: "New Year's Day", date: getNewYearsDay(year), type: 'federal' });
  
  const mlk = getMLKDay(year);
  if (mlk) holidays.push({ name: "Martin Luther King Jr. Day", date: mlk, type: 'federal' });
  
  const presidents = getPresidentsDay(year);
  if (presidents) holidays.push({ name: "Presidents' Day", date: presidents, type: 'federal' });
  
  const memorial = getMemorialDay(year);
  if (memorial) holidays.push({ name: "Memorial Day", date: memorial, type: 'federal' });
  
  holidays.push({ name: "Independence Day", date: getIndependenceDay(year), type: 'federal' });
  
  const labor = getLaborDay(year);
  if (labor) holidays.push({ name: "Labor Day", date: labor, type: 'federal' });
  
  const columbus = getColumbusDay(year);
  if (columbus) holidays.push({ name: "Columbus Day", date: columbus, type: 'federal' });
  
  holidays.push({ name: "Veterans Day", date: getVeteransDay(year), type: 'federal' });
  
  const thanksgiving = getThanksgivingDay(year);
  if (thanksgiving) holidays.push({ name: "Thanksgiving Day", date: thanksgiving, type: 'federal' });
  
  holidays.push({ name: "Christmas Day", date: getChristmasDay(year), type: 'federal' });
  
  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Check if a date is a US federal holiday
 * @param date - date to check
 */
export function isUSHoliday(date: Date): boolean {
  const holidays = getUSHolidays(date.getFullYear());
  return holidays.some(h => 
    h.date.getFullYear() === date.getFullYear() &&
    h.date.getMonth() === date.getMonth() &&
    h.date.getDate() === date.getDate()
  );
}

/**
 * Get the name of a US holiday for a given date
 * @param date - date to check
 * @returns holiday name or null if not a holiday
 */
export function getUSHolidayName(date: Date): string | null {
  const holidays = getUSHolidays(date.getFullYear());
  const holiday = holidays.find(h => 
    h.date.getFullYear() === date.getFullYear() &&
    h.date.getMonth() === date.getMonth() &&
    h.date.getDate() === date.getDate()
  );
  return holiday ? holiday.name : null;
}

/**
 * Get the start of the week for a date (Monday)
 * @param date - any date
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week for a date (Sunday)
 * @param date - any date
 */
export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get all weeks in a month as arrays of dates
 * @param year - year
 * @param month - month (0-11)
 */
export function getWeeksInMonth(year: number, month: number): Date[][] {
  const weeks: Date[][] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let currentWeek: Date[] = [];
  const startDayOfWeek = firstDay.getDay() || 7; // Convert Sunday from 0 to 7 for ISO
  
  // Add days from previous month to fill the first week
  for (let i = 1; i < startDayOfWeek; i++) {
    const prevDate = new Date(year, month, 1 - (startDayOfWeek - i));
    currentWeek.push(prevDate);
  }
  
  // Add days of the current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(new Date(year, month, day));
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Add days from next month to fill the last week
  if (currentWeek.length > 0) {
    let nextDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(year, month + 1, nextDay++));
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}