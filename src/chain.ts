/**
 * Fluent chain API for ts-time-utils
 *
 * Provides a chainable interface for date operations:
 * ```ts
 * chain(new Date())
 *   .add(1, 'day')
 *   .startOf('month')
 *   .format('YYYY-MM-DD')
 * ```
 */

import type { TimeUnit, DateInput, FormatOptions } from './types.js';
import { addTime, subtractTime, startOf, endOf, differenceInUnits, isBetween } from './calculate.js';
import { formatDate, formatDuration, timeAgo, formatTime, formatCalendarDate, formatOrdinal } from './format.js';
import {
  isValidDate, isToday, isYesterday, isTomorrow, isPast, isFuture,
  isWeekend, isWeekday, isSameDay, isSameWeek, isSameMonth, isSameYear,
  isThisWeek, isThisMonth, isThisYear, isBusinessDay, isLeapYear
} from './validate.js';

/** Units accepted by startOf/endOf */
type StartOfUnit = 'day' | 'week' | 'month' | 'year' | 'hour' | 'minute';

/**
 * Immutable chainable date wrapper
 * All transformation methods return a new ChainedDate instance
 */
export class ChainedDate {
  private readonly _date: Date;

  constructor(date: DateInput = new Date()) {
    if (date instanceof Date) {
      this._date = new Date(date.getTime());
    } else if (typeof date === 'number') {
      this._date = new Date(date);
    } else {
      this._date = new Date(date);
    }
  }

  // ============ Transformations (return new ChainedDate) ============

  /**
   * Add time to the date
   * @example chain(date).add(1, 'day').add(2, 'hours')
   */
  add(amount: number, unit: TimeUnit): ChainedDate {
    return new ChainedDate(addTime(this._date, amount, unit));
  }

  /**
   * Subtract time from the date
   * @example chain(date).subtract(1, 'week')
   */
  subtract(amount: number, unit: TimeUnit): ChainedDate {
    return new ChainedDate(subtractTime(this._date, amount, unit));
  }

  /**
   * Get the start of a time period
   * @example chain(date).startOf('month')
   */
  startOf(unit: StartOfUnit): ChainedDate {
    return new ChainedDate(startOf(this._date, unit));
  }

  /**
   * Get the end of a time period
   * @example chain(date).endOf('day')
   */
  endOf(unit: StartOfUnit): ChainedDate {
    return new ChainedDate(endOf(this._date, unit));
  }

  /**
   * Set specific date/time components
   * @example chain(date).set({ year: 2025, month: 1 })
   */
  set(values: {
    year?: number;
    month?: number;
    day?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  }): ChainedDate {
    const d = new Date(this._date.getTime());
    if (values.year !== undefined) d.setFullYear(values.year);
    if (values.month !== undefined) d.setMonth(values.month - 1); // 1-indexed input
    if (values.day !== undefined) d.setDate(values.day);
    if (values.hours !== undefined) d.setHours(values.hours);
    if (values.minutes !== undefined) d.setMinutes(values.minutes);
    if (values.seconds !== undefined) d.setSeconds(values.seconds);
    if (values.milliseconds !== undefined) d.setMilliseconds(values.milliseconds);
    return new ChainedDate(d);
  }

  /**
   * Clone the ChainedDate
   */
  clone(): ChainedDate {
    return new ChainedDate(this._date);
  }

  // ============ Formatters (return string) ============

  /**
   * Format date using pattern string
   * @example chain(date).format('YYYY-MM-DD') // "2025-01-15"
   */
  format(pattern: string): string {
    return formatDate(this._date, pattern);
  }

  /**
   * Format time in 12h, 24h, or ISO format
   * @example chain(date).formatTime('12h') // "2:30 PM"
   */
  formatTime(fmt: '12h' | '24h' | 'iso' = '24h'): string {
    return formatTime(this._date, fmt);
  }

  /**
   * Format as calendar date (Today, Yesterday, Monday, etc.)
   * @example chain(date).calendar() // "Tomorrow"
   */
  calendar(): string {
    return formatCalendarDate(this._date);
  }

  /**
   * Get relative time string
   * @example chain(pastDate).ago() // "3 hours ago"
   */
  ago(options?: FormatOptions): string {
    return timeAgo(this._date, options);
  }

  /**
   * Get ISO string
   */
  toISOString(): string {
    return this._date.toISOString();
  }

  /**
   * Get locale string
   */
  toLocaleString(locale?: string, options?: Intl.DateTimeFormatOptions): string {
    return this._date.toLocaleString(locale, options);
  }

  /**
   * Format day as ordinal
   * @example chain(date).dayOrdinal() // "15th"
   */
  dayOrdinal(): string {
    return formatOrdinal(this._date.getDate());
  }

  // ============ Comparisons (return boolean) ============

  /**
   * Check if date is valid
   */
  isValid(): boolean {
    return isValidDate(this._date);
  }

  /**
   * Check if date is today
   */
  isToday(): boolean {
    return isToday(this._date);
  }

  /**
   * Check if date is yesterday
   */
  isYesterday(): boolean {
    return isYesterday(this._date);
  }

  /**
   * Check if date is tomorrow
   */
  isTomorrow(): boolean {
    return isTomorrow(this._date);
  }

  /**
   * Check if date is in the past
   */
  isPast(): boolean {
    return isPast(this._date);
  }

  /**
   * Check if date is in the future
   */
  isFuture(): boolean {
    return isFuture(this._date);
  }

  /**
   * Check if date is a weekend
   */
  isWeekend(): boolean {
    return isWeekend(this._date);
  }

  /**
   * Check if date is a weekday
   */
  isWeekday(): boolean {
    return isWeekday(this._date);
  }

  /**
   * Check if date is in this week
   */
  isThisWeek(): boolean {
    return isThisWeek(this._date);
  }

  /**
   * Check if date is in this month
   */
  isThisMonth(): boolean {
    return isThisMonth(this._date);
  }

  /**
   * Check if date is in this year
   */
  isThisYear(): boolean {
    return isThisYear(this._date);
  }

  /**
   * Check if year is a leap year
   */
  isLeapYear(): boolean {
    return isLeapYear(this._date.getFullYear());
  }

  /**
   * Check if date is a business day
   */
  isBusinessDay(holidays?: Date[]): boolean {
    return isBusinessDay(this._date, holidays);
  }

  /**
   * Check if date is same day as another
   */
  isSameDay(other: DateInput): boolean {
    return isSameDay(this._date, toDate(other));
  }

  /**
   * Check if date is same week as another
   */
  isSameWeek(other: DateInput): boolean {
    return isSameWeek(this._date, toDate(other));
  }

  /**
   * Check if date is same month as another
   */
  isSameMonth(other: DateInput): boolean {
    return isSameMonth(this._date, toDate(other));
  }

  /**
   * Check if date is same year as another
   */
  isSameYear(other: DateInput): boolean {
    return isSameYear(this._date, toDate(other));
  }

  /**
   * Check if date is before another
   */
  isBefore(other: DateInput): boolean {
    return this._date.getTime() < toDate(other).getTime();
  }

  /**
   * Check if date is after another
   */
  isAfter(other: DateInput): boolean {
    return this._date.getTime() > toDate(other).getTime();
  }

  /**
   * Check if date is between two dates
   */
  isBetween(start: DateInput, end: DateInput, inclusive?: boolean): boolean {
    return isBetween(this._date, toDate(start), toDate(end), inclusive);
  }

  // ============ Getters (return number) ============

  /**
   * Get difference from another date
   * @example chain(date).diff(other, 'days') // 5
   */
  diff(other: DateInput, unit: TimeUnit = 'milliseconds', precise: boolean = true): number {
    return differenceInUnits(this._date, toDate(other), unit, precise);
  }

  /**
   * Get the timestamp (milliseconds since epoch)
   */
  valueOf(): number {
    return this._date.getTime();
  }

  /**
   * Get year
   */
  year(): number {
    return this._date.getFullYear();
  }

  /**
   * Get month (1-12)
   */
  month(): number {
    return this._date.getMonth() + 1;
  }

  /**
   * Get day of month (1-31)
   */
  day(): number {
    return this._date.getDate();
  }

  /**
   * Get day of week (0-6, 0=Sunday)
   */
  weekday(): number {
    return this._date.getDay();
  }

  /**
   * Get hours (0-23)
   */
  hours(): number {
    return this._date.getHours();
  }

  /**
   * Get minutes (0-59)
   */
  minutes(): number {
    return this._date.getMinutes();
  }

  /**
   * Get seconds (0-59)
   */
  seconds(): number {
    return this._date.getSeconds();
  }

  /**
   * Get milliseconds (0-999)
   */
  milliseconds(): number {
    return this._date.getMilliseconds();
  }

  /**
   * Get day of year (1-366)
   */
  dayOfYear(): number {
    const start = new Date(this._date.getFullYear(), 0, 0);
    const diff = this._date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * Get ISO week number (1-53)
   */
  week(): number {
    const d = new Date(Date.UTC(this._date.getFullYear(), this._date.getMonth(), this._date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Get quarter (1-4)
   */
  quarter(): number {
    return Math.floor(this._date.getMonth() / 3) + 1;
  }

  /**
   * Get days in month
   */
  daysInMonth(): number {
    return new Date(this._date.getFullYear(), this._date.getMonth() + 1, 0).getDate();
  }

  // ============ Conversion ============

  /**
   * Get the underlying Date object
   */
  toDate(): Date {
    return new Date(this._date.getTime());
  }

  /**
   * Get Unix timestamp (seconds)
   */
  unix(): number {
    return Math.floor(this._date.getTime() / 1000);
  }

  /**
   * Convert to array [year, month, day, hours, minutes, seconds, ms]
   */
  toArray(): [number, number, number, number, number, number, number] {
    return [
      this._date.getFullYear(),
      this._date.getMonth() + 1,
      this._date.getDate(),
      this._date.getHours(),
      this._date.getMinutes(),
      this._date.getSeconds(),
      this._date.getMilliseconds()
    ];
  }

  /**
   * Convert to object
   */
  toObject(): {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  } {
    return {
      year: this._date.getFullYear(),
      month: this._date.getMonth() + 1,
      day: this._date.getDate(),
      hours: this._date.getHours(),
      minutes: this._date.getMinutes(),
      seconds: this._date.getSeconds(),
      milliseconds: this._date.getMilliseconds()
    };
  }
}

/**
 * Helper to convert DateInput to Date
 */
function toDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

/**
 * Create a chainable date wrapper
 * @example
 * chain(new Date()).add(1, 'day').format('YYYY-MM-DD')
 * chain('2025-01-15').startOf('month').toDate()
 * chain().add(1, 'week').isWeekend()
 */
export function chain(date?: DateInput): ChainedDate {
  return new ChainedDate(date);
}

/**
 * Format a duration in milliseconds
 * Convenience export for use with chain().diff()
 * @example formatMs(chain(a).diff(b)) // "2 days, 3 hours"
 */
export function formatMs(ms: number, options?: FormatOptions): string {
  return formatDuration(ms, options);
}

// Initialize plugin system if it's available
// This allows plugins to extend ChainedDate
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__chainedDateClass = ChainedDate;
}
