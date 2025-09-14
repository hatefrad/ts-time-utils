/**
 * Shared types and interfaces used across ts-time-utils modules
 */

/** Input that can be converted to a Date */
export type DateInput = string | number | Date;

/** A date range with start and end dates */
export interface DateRange {
  start: Date;
  end: Date;
}

/** Options for parsing operations */
export interface ParseOptions {
  /** Whether to use strict parsing (reject ambiguous formats) */
  strict?: boolean;
  /** Timezone to use for parsing */
  timezone?: string;
  /** Default locale for parsing */
  locale?: string;
}

/** Options for formatting operations */
export interface FormatOptions {
  /** Use short format (abbreviated units) */
  short?: boolean;
  /** Maximum number of units to display */
  maxUnits?: number;
  /** Round fractional units */
  round?: boolean;
  /** Include milliseconds in output */
  includeMs?: boolean;
  /** Locale for formatting */
  locale?: string;
}

/** Time units supported across the library */
export type TimeUnit = 
  | 'millisecond' | 'milliseconds' | 'ms'
  | 'second' | 'seconds' | 's'
  | 'minute' | 'minutes' | 'm'
  | 'hour' | 'hours' | 'h'
  | 'day' | 'days' | 'd'
  | 'week' | 'weeks' | 'w'
  | 'month' | 'months' | 'M'
  | 'year' | 'years' | 'y';

/** Standardized error types */
export class TimeUtilsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TimeUtilsError';
  }
}

export class ParseError extends TimeUtilsError {
  constructor(message: string, public input?: unknown) {
    super(message, 'PARSE_ERROR');
    this.name = 'ParseError';
  }
}

export class ValidationError extends TimeUtilsError {
  constructor(message: string, public value?: unknown) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/** Common validation function type */
export type DateValidator = (date: Date) => boolean;

/** Common date transformation function type */
export type DateTransformer = (date: Date) => Date;

/** Options for working hours calculations */
export interface WorkingHoursConfig {
  /** Working days (0=Sunday, 1=Monday, etc.) */
  workingDays: number[];
  /** Working hours range */
  hours: { start: number; end: number };
  /** Break periods during working hours */
  breaks?: { start: number; end: number }[];
  /** Timezone for working hours calculation */
  timezone?: string;
}

/** Result of age calculation */
export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
}

/** Timezone information */
export interface ZonedTime {
  date: Date;
  zone: string;
  offsetMinutes: number;
}

/** Interval between two points in time */
export interface Interval {
  start: Date;
  end: Date;
}

/** Performance benchmarking result */
export interface BenchmarkResult {
  average: number;
  min: number;
  max: number;
  total: number;
  totalTime: number;
  iterations: number;
}

/** Calendar event recurrence pattern */
export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  byWeekDay?: number[];
  byMonthDay?: number[];
  byMonth?: number[];
  count?: number;
  until?: Date;
}

/** Locale-specific formatting options */
export interface LocaleFormatOptions extends FormatOptions {
  /** Calendar system to use */
  calendar?: 'gregory' | 'islamic' | 'hebrew' | 'persian' | 'chinese';
  /** Number system to use */
  numberingSystem?: 'arab' | 'arabext' | 'bali' | 'beng' | 'latn';
}

/** Business calendar configuration */
export interface BusinessConfig {
  /** Fiscal year start month (1-12) */
  fiscalYearStart?: number;
  /** Custom holidays */
  holidays?: Date[];
  /** Trading days override */
  tradingDays?: number[];
  /** Country code for built-in holidays */
  country?: string;
}

/** Duration unit types */
export type DurationUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

/** Duration input configuration */
export interface DurationInput {
  milliseconds?: number;
  seconds?: number;
  minutes?: number;
  hours?: number;
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
}

/** Duration comparison result */
export type DurationComparison = -1 | 0 | 1;

/** Serialization format options */
export interface SerializationOptions {
  /** Include timezone information */
  includeTimezone?: boolean;
  /** Use UTC for serialization */
  useUTC?: boolean;
  /** Custom date format */
  format?: 'iso' | 'epoch' | 'object' | 'custom';
  /** Precision for epoch timestamps */
  precision?: 'milliseconds' | 'seconds' | 'microseconds';
  /** Custom format string when format is 'custom' */
  customFormat?: string;
}

/** Date object representation for safe serialization */
export interface DateObject {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  timezone?: string;
}

/** Epoch timestamp with metadata */
export interface EpochTimestamp {
  timestamp: number;
  precision: 'milliseconds' | 'seconds' | 'microseconds';
  timezone?: string;
}