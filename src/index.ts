/**
 * @fileoverview Main entry point for ts-time-utils library
 * Re-exports all functions from individual modules for convenience
 */

// Format utilities
export { 
  formatDuration, 
  timeAgo, 
  formatTime, 
  parseDuration 
} from './format.js';

// Calculation utilities  
export { 
  differenceInUnits, 
  addTime, 
  subtractTime, 
  startOf, 
  endOf, 
  isBetween, 
  businessDaysBetween 
} from './calculate.js';

// Validation utilities
export { 
  isValidDate, 
  isLeapYear, 
  isPast, 
  isFuture, 
  isToday, 
  isYesterday, 
  isTomorrow, 
  isSameDay, 
  isWeekend, 
  isWeekday, 
  isValidTimeString, 
  isValidISOString 
} from './validate.js';

// Age utilities
export {
  calculateAge,
  getAgeInUnits,
  getLifeStage,
  getNextBirthday,
  getDaysUntilBirthday,
  isBirthday
} from './age.js';

// Calendar utilities
export {
  getWeekNumber,
  getWeekOfMonth,
  getQuarter,
  getDayOfYear,
  getWeeksInYear,
  getDaysInMonth,
  getDaysInYear,
  getEaster,
  getMonthsInYear,
  getDaysInMonthArray,
  getWeekdaysInMonth,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getFirstDayOfYear,
  getLastDayOfYear
} from './calendar.js';

// Parse utilities
export {
  parseDate,
  parseRelativeDate,
  parseTimeAgo,
  parseCustomFormat,
  parseManyFormats
} from './parse.js';

// Performance utilities
export {
  sleep,
  timeout,
  debounce,
  throttle,
  retry,
  createStopwatch,
  measureTime,
  measureAsync,
  benchmark,
  Stopwatch
} from './performance.js';

// Interval utilities
export {
  createInterval,
  isValidInterval,
  intervalDuration,
  intervalContains,
  intervalsOverlap,
  intervalIntersection,
  mergeIntervals,
  subtractInterval,
  splitIntervalByDay,
  totalIntervalCoverage,
  normalizeIntervals
} from './interval.js';

// Timezone utilities
export {
  getTimezoneOffset,
  formatInTimeZone,
  getZonedTime,
  convertDateToZone,
  isValidTimeZone,
  COMMON_TIMEZONES,
  getLocalOffset,
  compareZoneOffsets,
  reinterpretAsZone
} from './timezone.js';

// Working hours utilities
export {
  DEFAULT_WORKING_HOURS,
  isWorkingDay,
  isWorkingTime,
  nextWorkingTime,
  workingTimeBetween,
  addWorkingHours
} from './workingHours.js';

// Range preset utilities
export {
  today,
  yesterday,
  tomorrow,
  lastNDays,
  nextNDays,
  thisWeek,
  lastWeek,
  nextWeek,
  thisMonth,
  lastMonth,
  nextMonth,
  thisYear,
  lastYear,
  nextYear,
  rollingWindowDays,
  quarterRange,
  lastQuarter,
  nextQuarter,
  RANGE_PRESETS
} from './rangePresets.js';

// Duration utilities
export {
  Duration,
  createDuration,
  isValidDuration,
  parseDurationString,
  formatDurationString,
  maxDuration,
  minDuration,
  sumDurations,
  averageDuration
} from './duration.js';

// Serialization utilities
export {
  serializeDate,
  deserializeDate,
  createDateReviver,
  createDateReplacer,
  parseISOString,
  toEpochTimestamp,
  fromEpochTimestamp,
  createEpochTimestamp,
  toDateObject,
  fromDateObject,
  isValidISODateString,
  isValidEpochTimestamp,
  cloneDate,
  datesEqual,
  now,
  parseJSONWithDates,
  stringifyWithDates
} from './serialize.js';

// Locale utilities  
export {
  registerLocale,
  getLocaleConfig,
  getSupportedLocales,
  formatRelativeTime,
  formatDateLocale,
  formatTimeLocale,
  formatDateTimeLocale,
  getMonthNames,
  getDayNames,
  getFirstDayOfWeek,
  isLocaleSupported,
  getBestMatchingLocale,
  detectLocale,
  // Conversion utilities
  convertRelativeTime,
  detectLocaleFromRelativeTime,
  convertFormatPattern,
  convertFormattedDate,
  convertRelativeTimeArray,
  compareLocaleFormats
} from './locale.js';

// Recurrence utilities
export {
  createRecurrence,
  getNextOccurrence,
  getOccurrencesBetween,
  isRecurrenceDate,
  isValidRecurrenceRule,
  recurrenceToString
} from './recurrence.js';

// Countdown utilities
export {
  createCountdown,
  getRemainingTime,
  formatCountdown,
  isExpired,
  getProgressPercentage,
  getTimeUntil,
  createDeadline,
  type Countdown,
  type RemainingTime,
  type CountdownOptions
} from './countdown.js';

// Date range utilities
export {
  dateRangeOverlap,
  hasOverlappingRanges,
  mergeDateRanges,
  findGaps,
  splitRange,
  containsDate,
  getIntersection,
  getUnion,
  subtractRange,
  getRangeDuration,
  expandRange,
  shrinkRange,
  rangeContains,
  sortRanges
} from './dateRange.js';

// Natural language parsing utilities
export {
  parseNaturalDate,
  parseRelativePhrase,
  extractDatesFromText,
  suggestDateFromContext,
  type NaturalParseOptions,
  type ExtractedDate
} from './naturalLanguage.js';

// Constants and types
export { 
  MILLISECONDS_PER_SECOND,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
  MILLISECONDS_PER_MONTH,
  MILLISECONDS_PER_YEAR,
  SECONDS_PER_MINUTE,
  SECONDS_PER_HOUR,
  SECONDS_PER_DAY,
  SECONDS_PER_WEEK,
  type TimeUnit,
  type FormatOptions 
} from './constants.js';

// Shared types
export type {
  DateInput,
  DateRange,
  ParseOptions,
  WorkingHoursConfig,
  AgeResult,
  ZonedTime,
  Interval,
  BenchmarkResult,
  RecurrencePattern,
  RecurrenceRule,
  RecurrenceFrequency,
  LocaleFormatOptions,
  BusinessConfig,
  DateValidator,
  DateTransformer,
  TimeUtilsError,
  ParseError,
  ValidationError,
  DurationUnit,
  DurationInput,
  DurationComparison,
  SerializationOptions,
  DateObject,
  EpochTimestamp,
  SupportedLocale,
  LocaleConfig,
  RelativeTimeOptions,
  RelativeTimeUnit
} from './types.js';
