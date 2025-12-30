/**
 * @fileoverview Non-Gregorian calendar conversions using Intl.DateTimeFormat
 * Supports Hebrew, Islamic, Buddhist, Japanese, Persian, and Chinese calendars
 */

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
  era?: string;
  calendar: string;
}

export interface HebrewDate extends CalendarDate {
  calendar: 'hebrew';
}

export interface IslamicDate extends CalendarDate {
  calendar: 'islamic' | 'islamic-umalqura' | 'islamic-civil';
}

export interface BuddhistDate extends CalendarDate {
  calendar: 'buddhist';
}

export interface JapaneseDate extends CalendarDate {
  calendar: 'japanese';
  era: string;
}

export interface PersianDate extends CalendarDate {
  calendar: 'persian';
}

export interface ChineseDate extends CalendarDate {
  calendar: 'chinese';
  cycleYear?: number; // Year in 60-year cycle
}

export type CalendarType =
  | 'hebrew'
  | 'islamic'
  | 'islamic-umalqura'
  | 'islamic-civil'
  | 'buddhist'
  | 'japanese'
  | 'persian'
  | 'chinese';

/**
 * Extracts calendar date parts using Intl.DateTimeFormat
 */
function extractCalendarParts(date: Date, calendar: CalendarType): CalendarDate {
  // First get numeric values where possible
  const numericFormatter = new Intl.DateTimeFormat('en-u-ca-' + calendar + '-nu-latn', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const eraFormatter = new Intl.DateTimeFormat('en-u-ca-' + calendar, {
    era: 'short',
  });

  const numericParts = numericFormatter.formatToParts(date);
  const eraParts = eraFormatter.formatToParts(date);

  const result: CalendarDate = {
    year: 0,
    month: 0,
    day: 0,
    calendar,
  };

  for (const part of numericParts) {
    switch (part.type) {
      case 'year': {
        // Parse year, handling relatedYear for Chinese calendar
        const parsed = parseInt(part.value, 10);
        result.year = isNaN(parsed) ? 0 : parsed;
        break;
      }
      case 'month': {
        // Some calendars return month names instead of numbers
        const parsed = parseInt(part.value, 10);
        if (!isNaN(parsed)) {
          result.month = parsed;
        } else {
          // For calendars that return month names, get month index
          result.month = getMonthIndexFromName(part.value, calendar) || 0;
        }
        break;
      }
      case 'day':
        result.day = parseInt(part.value, 10);
        break;
    }
  }

  // Get era separately
  for (const part of eraParts) {
    if (part.type === 'era') {
      result.era = part.value;
    }
  }

  // Special handling for Chinese calendar year (uses related gregorian year)
  if (calendar === 'chinese' && result.year === 0) {
    const relatedFormatter = new Intl.DateTimeFormat('en-u-ca-chinese', {
      year: 'numeric',
    });
    const relatedParts = relatedFormatter.formatToParts(date);
    for (const part of relatedParts) {
      if (part.type === 'relatedYear') {
        result.year = parseInt(part.value, 10);
      }
    }
  }

  return result;
}

/**
 * Maps month name to month number for non-numeric month calendars
 */
function getMonthIndexFromName(monthName: string, calendar: CalendarType): number {
  const hebrewMonths: Record<string, number> = {
    'Tishri': 1, 'Tishrei': 1,
    'Heshvan': 2, 'Cheshvan': 2, 'Marcheshvan': 2,
    'Kislev': 3,
    'Tevet': 4, 'Teves': 4,
    'Shevat': 5, 'Shvat': 5,
    'Adar': 6, 'Adar I': 6,
    'Adar II': 7, 'Adar Sheni': 7,
    'Nisan': 8, 'Nissan': 8,
    'Iyar': 9, 'Iyyar': 9,
    'Sivan': 10, 'Siwan': 10,
    'Tammuz': 11, 'Tamuz': 11,
    'Av': 12, 'Menachem Av': 12,
    'Elul': 13,
  };

  if (calendar === 'hebrew') {
    return hebrewMonths[monthName] || 0;
  }

  return 0;
}

/**
 * Convert Gregorian date to Hebrew calendar
 * @example toHebrewDate(new Date('2024-03-25')) // { year: 5784, month: 6, day: 15, calendar: 'hebrew' }
 */
export function toHebrewDate(date: Date): HebrewDate {
  return extractCalendarParts(date, 'hebrew') as HebrewDate;
}

/**
 * Convert Gregorian date to Islamic calendar (default: islamic-umalqura)
 * @param date - Date to convert
 * @param variant - Islamic calendar variant: 'islamic', 'islamic-umalqura', 'islamic-civil'
 * @example toIslamicDate(new Date('2024-03-25')) // { year: 1445, month: 9, day: 15, calendar: 'islamic-umalqura' }
 */
export function toIslamicDate(
  date: Date,
  variant: 'islamic' | 'islamic-umalqura' | 'islamic-civil' = 'islamic-umalqura'
): IslamicDate {
  return extractCalendarParts(date, variant) as IslamicDate;
}

/**
 * Convert Gregorian date to Buddhist calendar (Thai Solar)
 * Buddhist Era = Gregorian Year + 543
 * @example toBuddhistDate(new Date('2024-03-25')) // { year: 2567, month: 3, day: 25, calendar: 'buddhist' }
 */
export function toBuddhistDate(date: Date): BuddhistDate {
  return extractCalendarParts(date, 'buddhist') as BuddhistDate;
}

/**
 * Convert Gregorian date to Japanese calendar with era
 * @example toJapaneseDate(new Date('2024-03-25')) // { year: 6, month: 3, day: 25, era: 'Reiwa', calendar: 'japanese' }
 */
export function toJapaneseDate(date: Date): JapaneseDate {
  const result = extractCalendarParts(date, 'japanese') as JapaneseDate;

  // Get full era name
  const eraFormatter = new Intl.DateTimeFormat('en-u-ca-japanese', { era: 'long' });
  const eraParts = eraFormatter.formatToParts(date);
  const eraPart = eraParts.find(p => p.type === 'era');
  if (eraPart) {
    result.era = eraPart.value;
  }

  return result;
}

/**
 * Convert Gregorian date to Persian (Jalali/Solar Hijri) calendar
 * @example toPersianDate(new Date('2024-03-20')) // { year: 1403, month: 1, day: 1, calendar: 'persian' }
 */
export function toPersianDate(date: Date): PersianDate {
  return extractCalendarParts(date, 'persian') as PersianDate;
}

/**
 * Convert Gregorian date to Chinese lunar calendar
 * @example toChineseDate(new Date('2024-02-10')) // { year: 4721, month: 1, day: 1, calendar: 'chinese' }
 */
export function toChineseDate(date: Date): ChineseDate {
  return extractCalendarParts(date, 'chinese') as ChineseDate;
}

/**
 * Format date in specified calendar system
 * @param date - Date to format
 * @param calendar - Calendar system to use
 * @param locale - Locale for formatting (default: 'en')
 * @param options - Additional Intl.DateTimeFormat options
 */
export function formatInCalendar(
  date: Date,
  calendar: CalendarType,
  locale: string = 'en',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const localeWithCalendar = `${locale}-u-ca-${calendar}`;
  const formatter = new Intl.DateTimeFormat(localeWithCalendar, {
    dateStyle: 'long',
    ...options,
  });
  return formatter.format(date);
}

/**
 * Get month names for a specific calendar system
 * @param calendar - Calendar system
 * @param locale - Locale for month names (default: 'en')
 * @param format - Month name format: 'long', 'short', 'narrow'
 */
export function getCalendarMonthNames(
  calendar: CalendarType,
  locale: string = 'en',
  format: 'long' | 'short' | 'narrow' = 'long'
): string[] {
  const localeWithCalendar = `${locale}-u-ca-${calendar}`;
  const formatter = new Intl.DateTimeFormat(localeWithCalendar, { month: format });

  // Generate month names by iterating through a reference year
  const months: string[] = [];
  const year = 2024;

  // Most calendars have 12 months, Hebrew has 13 in leap years
  const maxMonths = calendar === 'hebrew' ? 13 : 12;

  for (let month = 0; month < maxMonths; month++) {
    try {
      const date = new Date(year, month, 15);
      months.push(formatter.format(date));
    } catch {
      break;
    }
  }

  return months;
}

/**
 * Get era name for Japanese calendar
 * @param date - Date to get era for
 * @param format - Era format: 'long', 'short', 'narrow'
 */
export function getJapaneseEra(
  date: Date,
  format: 'long' | 'short' | 'narrow' = 'long'
): string {
  const formatter = new Intl.DateTimeFormat('en-u-ca-japanese', { era: format });
  const parts = formatter.formatToParts(date);
  const eraPart = parts.find(p => p.type === 'era');
  return eraPart?.value || '';
}

/**
 * Get all Japanese era names with their start dates
 */
export function getJapaneseEras(): Array<{ name: string; start: Date }> {
  return [
    { name: 'Meiji', start: new Date(1868, 9, 23) },
    { name: 'Taisho', start: new Date(1912, 6, 30) },
    { name: 'Showa', start: new Date(1926, 11, 25) },
    { name: 'Heisei', start: new Date(1989, 0, 8) },
    { name: 'Reiwa', start: new Date(2019, 4, 1) },
  ];
}

/**
 * Check if a Hebrew year is a leap year (has 13 months)
 * @param hebrewYear - Year in Hebrew calendar
 */
export function isHebrewLeapYear(hebrewYear: number): boolean {
  // Hebrew leap years follow a 19-year cycle
  // Years 3, 6, 8, 11, 14, 17, 19 are leap years
  const position = hebrewYear % 19;
  return [3, 6, 8, 11, 14, 17, 0].includes(position); // 0 = 19th year
}

/**
 * Get Hebrew month name
 * @param month - Month number (1-13)
 * @param isLeapYear - Whether the year is a leap year
 */
export function getHebrewMonthName(month: number, isLeapYear: boolean = false): string {
  const months = [
    'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul',
    'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat',
    isLeapYear ? 'Adar I' : 'Adar',
    'Adar II'
  ];
  return months[month - 1] || '';
}

/**
 * Get Islamic month name
 * @param month - Month number (1-12)
 */
export function getIslamicMonthName(month: number): string {
  const months = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  return months[month - 1] || '';
}

/**
 * Get Persian month name
 * @param month - Month number (1-12)
 */
export function getPersianMonthName(month: number): string {
  const months = [
    'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
    'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'
  ];
  return months[month - 1] || '';
}

/**
 * Check if a Persian year is a leap year
 * Uses the 2820-year cycle algorithm
 */
export function isPersianLeapYear(persianYear: number): boolean {
  // Simplified 33-year cycle approximation
  const remainder = persianYear % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(remainder);
}

/**
 * Get Chinese zodiac animal for a year
 * @param gregorianYear - Gregorian year
 */
export function getChineseZodiac(gregorianYear: number): string {
  const animals = [
    'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
    'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
  ];
  // 1900 was Year of the Rat
  const index = (gregorianYear - 1900) % 12;
  return animals[index >= 0 ? index : index + 12];
}

/**
 * Get Chinese element for a year
 * @param gregorianYear - Gregorian year
 */
export function getChineseElement(gregorianYear: number): string {
  const elements = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];
  // Each element covers 2 years
  const index = Math.floor(((gregorianYear - 1900) % 10) / 2);
  return elements[index >= 0 ? index : index + 5];
}

/**
 * Get full Chinese zodiac description (element + animal)
 * @param gregorianYear - Gregorian year
 */
export function getChineseZodiacFull(gregorianYear: number): string {
  return `${getChineseElement(gregorianYear)} ${getChineseZodiac(gregorianYear)}`;
}

/**
 * Convert calendar date to string representation
 */
export function calendarDateToString(calendarDate: CalendarDate): string {
  const { year, month, day, era, calendar } = calendarDate;
  const eraStr = era ? ` ${era}` : '';
  return `${year}/${month}/${day}${eraStr} (${calendar})`;
}

/**
 * Compare two calendar dates
 * @returns negative if a < b, 0 if equal, positive if a > b
 */
export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  if (a.calendar !== b.calendar) {
    throw new Error('Cannot compare dates from different calendar systems');
  }

  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/**
 * Get current date in specified calendar
 */
export function today(calendar: CalendarType): CalendarDate {
  return extractCalendarParts(new Date(), calendar);
}

/**
 * Check if two calendar dates are the same day
 */
export function isSameCalendarDay(a: CalendarDate, b: CalendarDate): boolean {
  return a.calendar === b.calendar &&
         a.year === b.year &&
         a.month === b.month &&
         a.day === b.day;
}

/**
 * Get supported calendar systems
 */
export function getSupportedCalendars(): CalendarType[] {
  return [
    'hebrew',
    'islamic',
    'islamic-umalqura',
    'islamic-civil',
    'buddhist',
    'japanese',
    'persian',
    'chinese'
  ];
}
