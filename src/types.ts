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

/** Supported locales for internationalization */
export type SupportedLocale = 
  | 'en' | 'en-US' | 'en-GB' | 'en-CA' | 'en-AU'
  | 'es' | 'es-ES' | 'es-MX' | 'es-AR'
  | 'fr' | 'fr-FR' | 'fr-CA'
  | 'de' | 'de-DE' | 'de-AT' | 'de-CH'
  | 'it' | 'it-IT'
  | 'pt' | 'pt-PT' | 'pt-BR'
  | 'ru' | 'ru-RU'
  | 'zh' | 'zh-CN' | 'zh-TW'
  | 'ja' | 'ja-JP'
  | 'ko' | 'ko-KR'
  | 'ar' | 'ar-SA'
  | 'hi' | 'hi-IN'
  | 'tr' | 'tr-TR'
  | 'pl' | 'pl-PL'
  | 'nl' | 'nl-NL'
  | 'sv' | 'sv-SE'
  | 'da' | 'da-DK'
  | 'no' | 'no-NO'
  | 'fi' | 'fi-FI';

/** Relative time units for localization */
export type RelativeTimeUnit = 
  | 'second' | 'seconds'
  | 'minute' | 'minutes'
  | 'hour' | 'hours'
  | 'day' | 'days'
  | 'week' | 'weeks'
  | 'month' | 'months'
  | 'year' | 'years';

/** Locale-specific configuration */
export interface LocaleConfig {
  /** Locale identifier */
  locale: SupportedLocale;
  /** Date format patterns */
  dateFormats?: {
    short?: string;
    medium?: string;  
    long?: string;
    full?: string;
  };
  /** Time format patterns */
  timeFormats?: {
    short?: string;
    medium?: string;
    long?: string;
    full?: string;
  };
  /** Relative time translations */
  relativeTime?: {
    future?: string; // "{0} from now"
    past?: string;   // "{0} ago"
    units?: Partial<Record<RelativeTimeUnit, string>>;
  };
  /** Calendar-specific settings */
  calendar?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
    monthNames?: string[];
    monthNamesShort?: string[];
    dayNames?: string[];
    dayNamesShort?: string[];
  };
  /** Number formatting */
  numbers?: {
    decimal?: string;
    thousands?: string;
  };
}

/** Relative time formatting options */
export interface RelativeTimeOptions {
  /** Locale to use for formatting */
  locale?: SupportedLocale;
  /** Maximum unit to display (e.g., don't show years) */
  maxUnit?: RelativeTimeUnit;
  /** Minimum unit to display (e.g., don't show seconds) */
  minUnit?: RelativeTimeUnit;
  /** Number of decimal places for precise units */
  precision?: number;
  /** Use short forms (1h vs 1 hour) */
  short?: boolean;
  /** Use numeric format when possible */
  numeric?: 'always' | 'auto';
  /** Custom formatting style */
  style?: 'long' | 'short' | 'narrow';
}