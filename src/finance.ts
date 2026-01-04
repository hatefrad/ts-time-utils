/**
 * @fileoverview Finance utilities for market-aware date calculations
 * Provides US market hours, trading days, settlement dates, and options expiration
 */

import type { DateInput } from './types.js';

/** Supported US stock markets */
export type USMarket = 'NYSE' | 'NASDAQ';

/** Market trading hours configuration */
export interface MarketHours {
  /** Regular market open time */
  open: { hour: number; minute: number };
  /** Regular market close time */
  close: { hour: number; minute: number };
  /** Market timezone */
  timezone: string;
  /** Pre-market open time (optional) */
  preMarket?: { hour: number; minute: number };
  /** After-hours close time (optional) */
  afterHours?: { hour: number; minute: number };
}

/** Options expiration type */
export type OptionsExpirationType = 'monthly' | 'weekly' | 'quarterly';

/** Market hours for US exchanges */
export const MARKET_HOURS: Record<USMarket, MarketHours> = {
  NYSE: {
    open: { hour: 9, minute: 30 },
    close: { hour: 16, minute: 0 },
    timezone: 'America/New_York',
    preMarket: { hour: 4, minute: 0 },
    afterHours: { hour: 20, minute: 0 }
  },
  NASDAQ: {
    open: { hour: 9, minute: 30 },
    close: { hour: 16, minute: 0 },
    timezone: 'America/New_York',
    preMarket: { hour: 4, minute: 0 },
    afterHours: { hour: 20, minute: 0 }
  }
};

/** US market holidays (NYSE/NASDAQ follow same schedule) */
export const US_MARKET_HOLIDAYS = [
  "New Year's Day",
  'Martin Luther King Jr. Day',
  "Presidents' Day",
  'Good Friday',
  'Memorial Day',
  'Juneteenth',
  'Independence Day',
  'Labor Day',
  'Thanksgiving Day',
  'Christmas Day'
] as const;

/**
 * Helper to convert DateInput to Date
 */
function toDate(input: DateInput): Date {
  if (input instanceof Date) return new Date(input);
  return new Date(input);
}

/**
 * Calculate Easter Sunday using the Anonymous Gregorian algorithm
 */
function getEasterSunday(year: number): Date {
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
 * Get nth occurrence of a weekday in a month
 */
function getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  let dayOffset = dayOfWeek - firstWeekday;
  if (dayOffset < 0) dayOffset += 7;
  const date = 1 + dayOffset + (n - 1) * 7;
  return new Date(year, month, date);
}

/**
 * Get last occurrence of a weekday in a month
 */
function getLastWeekdayOfMonth(year: number, month: number, dayOfWeek: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const lastDate = lastDay.getDate();
  const lastWeekday = lastDay.getDay();

  let diff = lastWeekday - dayOfWeek;
  if (diff < 0) diff += 7;

  return new Date(year, month, lastDate - diff);
}

/**
 * Adjust date if it falls on a weekend (observed holiday rules)
 * - If Saturday, observe on Friday
 * - If Sunday, observe on Monday
 */
function adjustForWeekend(date: Date): Date {
  const day = date.getDay();
  if (day === 0) { // Sunday -> Monday
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  } else if (day === 6) { // Saturday -> Friday
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  }
  return date;
}

/**
 * Get all US market holidays for a year
 */
function getUSMarketHolidays(year: number): Date[] {
  const holidays: Date[] = [];

  // New Year's Day (January 1, or observed)
  holidays.push(adjustForWeekend(new Date(year, 0, 1)));

  // Martin Luther King Jr. Day (3rd Monday of January)
  holidays.push(getNthWeekdayOfMonth(year, 0, 1, 3));

  // Presidents' Day (3rd Monday of February)
  holidays.push(getNthWeekdayOfMonth(year, 1, 1, 3));

  // Good Friday (2 days before Easter)
  const easter = getEasterSunday(year);
  holidays.push(new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2));

  // Memorial Day (last Monday of May)
  holidays.push(getLastWeekdayOfMonth(year, 4, 1));

  // Juneteenth (June 19, or observed)
  holidays.push(adjustForWeekend(new Date(year, 5, 19)));

  // Independence Day (July 4, or observed)
  holidays.push(adjustForWeekend(new Date(year, 6, 4)));

  // Labor Day (1st Monday of September)
  holidays.push(getNthWeekdayOfMonth(year, 8, 1, 1));

  // Thanksgiving Day (4th Thursday of November)
  holidays.push(getNthWeekdayOfMonth(year, 10, 4, 4));

  // Christmas Day (December 25, or observed)
  holidays.push(adjustForWeekend(new Date(year, 11, 25)));

  return holidays;
}

/**
 * Compare two dates by year, month, day only (ignoring time)
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Check if a date is a US market holiday
 * @param date - Date to check
 * @param market - Market (default: NYSE)
 * @returns True if the date is a market holiday
 *
 * @example
 * ```ts
 * isMarketHoliday(new Date('2024-12-25')); // true (Christmas)
 * isMarketHoliday(new Date('2024-01-02')); // false
 * ```
 */
export function isMarketHoliday(date: DateInput, market: USMarket = 'NYSE'): boolean {
  const d = toDate(date);
  const year = d.getFullYear();
  const holidays = getUSMarketHolidays(year);

  return holidays.some(h => isSameDay(d, h));
}

/**
 * Check if a date is a trading day (weekday and not a market holiday)
 * @param date - Date to check
 * @param market - Market (default: NYSE)
 * @returns True if the date is a trading day
 *
 * @example
 * ```ts
 * isTradingDay(new Date('2024-01-15')); // true (Monday)
 * isTradingDay(new Date('2024-01-13')); // false (Saturday)
 * ```
 */
export function isTradingDay(date: DateInput, market: USMarket = 'NYSE'): boolean {
  const d = toDate(date);
  const day = d.getDay();

  // Weekend check
  if (day === 0 || day === 6) return false;

  // Holiday check
  return !isMarketHoliday(d, market);
}

/**
 * Check if the market is currently open
 * @param date - Date/time to check
 * @param market - Market (default: NYSE)
 * @returns True if market is open at the specified time
 *
 * @example
 * ```ts
 * // Check if NYSE is open now
 * isMarketOpen(new Date(), 'NYSE');
 *
 * // Check specific time
 * isMarketOpen(new Date('2024-01-15T10:30:00-05:00')); // true
 * ```
 */
export function isMarketOpen(date: DateInput, market: USMarket = 'NYSE'): boolean {
  const d = toDate(date);

  // First check if it's a trading day
  if (!isTradingDay(d, market)) return false;

  const hours = MARKET_HOURS[market];

  // Convert to market timezone for comparison
  // For simplicity, we assume the input is already in market timezone
  // or we compare hours directly
  const hour = d.getHours();
  const minute = d.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  const openInMinutes = hours.open.hour * 60 + hours.open.minute;
  const closeInMinutes = hours.close.hour * 60 + hours.close.minute;

  return timeInMinutes >= openInMinutes && timeInMinutes < closeInMinutes;
}

/**
 * Get market hours configuration
 * @param market - Market (default: NYSE)
 * @returns Market hours configuration (deep copy)
 *
 * @example
 * ```ts
 * const hours = getMarketHours('NASDAQ');
 * console.log(hours.open); // { hour: 9, minute: 30 }
 * ```
 */
export function getMarketHours(market: USMarket = 'NYSE'): MarketHours {
  const source = MARKET_HOURS[market];
  return {
    open: { ...source.open },
    close: { ...source.close },
    timezone: source.timezone,
    preMarket: source.preMarket ? { ...source.preMarket } : undefined,
    afterHours: source.afterHours ? { ...source.afterHours } : undefined
  };
}

/**
 * Get market open time for a specific date
 * @param date - Date to get market open for
 * @param market - Market (default: NYSE)
 * @returns Date set to market open time
 *
 * @example
 * ```ts
 * const open = getMarketOpen(new Date('2024-01-15'));
 * console.log(open); // 2024-01-15T09:30:00
 * ```
 */
export function getMarketOpen(date: DateInput, market: USMarket = 'NYSE'): Date {
  const d = toDate(date);
  const hours = MARKET_HOURS[market];

  const result = new Date(d);
  result.setHours(hours.open.hour, hours.open.minute, 0, 0);

  return result;
}

/**
 * Get market close time for a specific date
 * @param date - Date to get market close for
 * @param market - Market (default: NYSE)
 * @returns Date set to market close time
 *
 * @example
 * ```ts
 * const close = getMarketClose(new Date('2024-01-15'));
 * console.log(close); // 2024-01-15T16:00:00
 * ```
 */
export function getMarketClose(date: DateInput, market: USMarket = 'NYSE'): Date {
  const d = toDate(date);
  const hours = MARKET_HOURS[market];

  const result = new Date(d);
  result.setHours(hours.close.hour, hours.close.minute, 0, 0);

  return result;
}

/**
 * Get next market open time after a given date
 * @param after - Start searching after this date
 * @param market - Market (default: NYSE)
 * @returns Next market open date/time
 *
 * @example
 * ```ts
 * // If it's Friday evening, returns Monday 9:30 AM
 * const nextOpen = getNextMarketOpen(new Date('2024-01-12T17:00:00'));
 * ```
 */
export function getNextMarketOpen(after: DateInput, market: USMarket = 'NYSE'): Date {
  const d = toDate(after);
  const hours = MARKET_HOURS[market];

  // Start with current day's open
  let candidate = getMarketOpen(d, market);

  // If we're past today's open, start from tomorrow
  if (d >= candidate) {
    candidate.setDate(candidate.getDate() + 1);
  }

  // Find next trading day
  while (!isTradingDay(candidate, market)) {
    candidate.setDate(candidate.getDate() + 1);
  }

  // Set to market open time
  candidate.setHours(hours.open.hour, hours.open.minute, 0, 0);

  return candidate;
}

/**
 * Get next market close time after a given date
 * @param after - Start searching after this date
 * @param market - Market (default: NYSE)
 * @returns Next market close date/time
 *
 * @example
 * ```ts
 * const nextClose = getNextMarketClose(new Date('2024-01-15T10:00:00'));
 * // Returns 2024-01-15T16:00:00 (same day close)
 * ```
 */
export function getNextMarketClose(after: DateInput, market: USMarket = 'NYSE'): Date {
  const d = toDate(after);
  const hours = MARKET_HOURS[market];

  // Start with current day's close
  let candidate = getMarketClose(d, market);

  // If we're past today's close or not a trading day, go to next trading day
  if (d >= candidate || !isTradingDay(d, market)) {
    candidate.setDate(candidate.getDate() + 1);
    while (!isTradingDay(candidate, market)) {
      candidate.setDate(candidate.getDate() + 1);
    }
  }

  // Set to market close time
  candidate.setHours(hours.close.hour, hours.close.minute, 0, 0);

  return candidate;
}

/**
 * Calculate settlement date (T+N) from trade date
 * @param tradeDate - Trade date
 * @param days - Number of business days for settlement (e.g., 1 for T+1, 2 for T+2)
 * @param market - Market (default: NYSE)
 * @returns Settlement date
 *
 * @example
 * ```ts
 * // T+2 settlement
 * const settlement = getSettlementDate(new Date('2024-01-15'), 2);
 * // Returns 2024-01-17 (skipping weekends/holidays)
 * ```
 */
export function getSettlementDate(tradeDate: DateInput, days: number, market: USMarket = 'NYSE'): Date {
  const d = toDate(tradeDate);
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);

  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isTradingDay(result, market)) {
      remaining--;
    }
  }

  return result;
}

/**
 * Calculate trade date from settlement date (reverse T+N)
 * @param settlementDate - Settlement date
 * @param days - Number of business days for settlement
 * @param market - Market (default: NYSE)
 * @returns Trade date
 *
 * @example
 * ```ts
 * const tradeDate = getTradeDateFromSettlement(new Date('2024-01-17'), 2);
 * // Returns 2024-01-15
 * ```
 */
export function getTradeDateFromSettlement(settlementDate: DateInput, days: number, market: USMarket = 'NYSE'): Date {
  const d = toDate(settlementDate);
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);

  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() - 1);
    if (isTradingDay(result, market)) {
      remaining--;
    }
  }

  return result;
}

/**
 * Iterate through each trading day in a range
 * @param start - Start date
 * @param end - End date
 * @param market - Market (default: NYSE)
 * @returns Array of trading days
 *
 * @example
 * ```ts
 * const days = eachTradingDay(new Date('2024-01-15'), new Date('2024-01-19'));
 * // Returns Mon, Tue, Wed, Thu, Fri (if no holidays)
 * ```
 */
export function eachTradingDay(start: DateInput, end: DateInput, market: USMarket = 'NYSE'): Date[] {
  const startDate = toDate(start);
  const endDate = toDate(end);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (isTradingDay(current, market)) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Count trading days between two dates
 * @param start - Start date
 * @param end - End date
 * @param market - Market (default: NYSE)
 * @returns Number of trading days
 *
 * @example
 * ```ts
 * const count = countTradingDays(new Date('2024-01-15'), new Date('2024-01-19'));
 * // Returns 5 (Mon-Fri if no holidays)
 * ```
 */
export function countTradingDays(start: DateInput, end: DateInput, market: USMarket = 'NYSE'): number {
  return eachTradingDay(start, end, market).length;
}

/**
 * Add trading days to a date
 * @param date - Start date
 * @param days - Number of trading days to add (can be negative)
 * @param market - Market (default: NYSE)
 * @returns Resulting date
 *
 * @example
 * ```ts
 * const result = addTradingDays(new Date('2024-01-15'), 5);
 * // Returns 5 trading days later
 * ```
 */
export function addTradingDays(date: DateInput, days: number, market: USMarket = 'NYSE'): Date {
  const d = toDate(date);
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);

  if (days === 0) return result;

  const direction = days > 0 ? 1 : -1;
  let remaining = Math.abs(days);

  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    if (isTradingDay(result, market)) {
      remaining--;
    }
  }

  return result;
}

/**
 * Get options expiration date
 * @param year - Year
 * @param month - Month (1-12)
 * @param type - Expiration type (default: 'monthly')
 * @returns Options expiration date
 *
 * @example
 * ```ts
 * // Monthly options expire on 3rd Friday
 * const exp = getOptionsExpiration(2024, 1, 'monthly');
 *
 * // Weekly options expire every Friday
 * const weekly = getOptionsExpiration(2024, 1, 'weekly');
 *
 * // Quarterly options expire on 3rd Friday of Mar, Jun, Sep, Dec
 * const quarterly = getOptionsExpiration(2024, 3, 'quarterly');
 * ```
 */
export function getOptionsExpiration(year: number, month: number, type: OptionsExpirationType = 'monthly'): Date {
  // Adjust month to 0-indexed
  const monthIndex = month - 1;

  switch (type) {
    case 'monthly':
    case 'quarterly': {
      // 3rd Friday of the month
      const thirdFriday = getNthWeekdayOfMonth(year, monthIndex, 5, 3);

      // If it's a holiday, move to Thursday
      if (isMarketHoliday(thirdFriday)) {
        thirdFriday.setDate(thirdFriday.getDate() - 1);
      }

      return thirdFriday;
    }

    case 'weekly': {
      // First Friday of the month for weekly
      const firstFriday = getNthWeekdayOfMonth(year, monthIndex, 5, 1);

      // If it's a holiday, move to Thursday
      if (isMarketHoliday(firstFriday)) {
        firstFriday.setDate(firstFriday.getDate() - 1);
      }

      return firstFriday;
    }

    default:
      return getNthWeekdayOfMonth(year, monthIndex, 5, 3);
  }
}
