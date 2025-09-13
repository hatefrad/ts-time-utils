/**
 * Time constants for millisecond conversions
 */
export const MILLISECONDS_PER_SECOND = 1000;
export const MILLISECONDS_PER_MINUTE = 60 * MILLISECONDS_PER_SECOND;
export const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
export const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;
export const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;
export const MILLISECONDS_PER_MONTH = 30 * MILLISECONDS_PER_DAY; // Approximate
export const MILLISECONDS_PER_YEAR = 365 * MILLISECONDS_PER_DAY; // Approximate

/**
 * Second-based constants
 */
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
export const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
export const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;

/**
 * Common time units
 */
export type TimeUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

/**
 * Formatting options
 */
export interface FormatOptions {
  /** Include milliseconds in output */
  includeMs?: boolean;
  /** Use short format (e.g., "1h" vs "1 hour") */
  short?: boolean;
  /** Maximum number of units to show */
  maxUnits?: number;
  /** Round to nearest unit instead of floor */
  round?: boolean;
}
