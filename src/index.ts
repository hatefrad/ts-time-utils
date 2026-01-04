/**
 * @fileoverview Main entry point for ts-time-utils library
 * Re-exports all functions from individual modules for convenience
 */

// Format utilities
export { 
  formatDuration, 
  timeAgo, 
  formatTime, 
  parseDuration,
  formatDate,
  formatDateRange,
  formatOrdinal,
  formatDayOrdinal,
  formatDurationCompact,
  formatCalendarDate
} from './format.js';

// Calculation utilities
export {
  differenceInUnits,
  addTime,
  subtractTime,
  startOf,
  endOf,
  isBetween,
  businessDaysBetween,
  roundToNearestUnit,
  ceilDate,
  floorDate
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
  isSameWeek,
  isSameMonth,
  isSameYear,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isWeekend,
  isWeekday,
  isBusinessDay,
  isInLastNDays,
  isInNextNDays,
  isValidTimeString,
  isValidISOString,
  isSameHour,
  isSameMinute,
  isSameSecond,
  isInQuarter,
  isSameQuarter
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
  getLastDayOfYear,
  getNthDayOfMonth,
  getNewYearsDay,
  getMLKDay,
  getPresidentsDay,
  getMemorialDay,
  getIndependenceDay,
  getLaborDay,
  getColumbusDay,
  getVeteransDay,
  getThanksgivingDay,
  getChristmasDay,
  getGoodFriday,
  getUSHolidays,
  isUSHoliday,
  getUSHolidayName,
  getStartOfWeek,
  getEndOfWeek,
  getWeeksInMonth,
  getWeekYear,
  lastDayOfDecade,
  firstDayOfDecade,
  lastDayOfCentury,
  getStartOfQuarter,
  getEndOfQuarter
} from './calendar.js';

export type { USHoliday } from './calendar.js';

// Parse utilities
export {
  parseDate,
  parseRelativeDate,
  parseTimeAgo,
  parseCustomFormat,
  parseManyFormats,
  parseISO8601Duration,
  parseISO8601DurationToMs,
  parseTime,
  guessDateFormat,
  parseAutoFormat,
  parseRangeEndpoint
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
  reinterpretAsZone,
  isDST,
  getNextDSTTransition,
  findCommonWorkingHours,
  getTimezoneAbbreviation,
  convertBetweenZones,
  getTimezoneDifferenceHours,
  isSameTimezone
} from './timezone.js';

// Working hours utilities
export {
  DEFAULT_WORKING_HOURS,
  isWorkingDay,
  isWorkingTime,
  nextWorkingTime,
  workingTimeBetween,
  addWorkingHours,
  addWorkingDays,
  subtractWorkingDays,
  getNextWorkingDay,
  getPreviousWorkingDay,
  getWorkingDaysInMonth,
  getWorkingDaysInMonthArray,
  workingDaysBetween,
  isBreakTime,
  getWorkDayStart,
  getWorkDayEnd,
  getWorkingHoursPerDay
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
  compareLocaleFormats,
  // Week info utilities
  getWeekInfo,
  getLocaleWeekStartsOn,
  getLocaleWeekendDays,
  intlFormat,
  formatISODate,
  formatISOTime,
  formatDistanceStrict
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

// Cron expression utilities
export {
  parseCronExpression,
  parseCronField,
  matchesCron,
  getNextCronDate,
  getNextCronDates,
  getPreviousCronDate,
  isValidCron,
  describeCron,
  CRON_PRESETS
} from './cron.js';

export type { CronParts, ParsedCronField } from './cron.js';

// Fiscal year utilities
export {
  getFiscalYear,
  getFiscalQuarter,
  getFiscalYearStart,
  getFiscalYearEnd,
  getFiscalQuarterStart,
  getFiscalQuarterEnd,
  isSameFiscalYear,
  isSameFiscalQuarter,
  getFiscalMonth,
  getDaysRemainingInFiscalYear,
  getDaysElapsedInFiscalYear,
  getFiscalYearProgress,
  getFiscalWeek,
  formatFiscalYear,
  formatFiscalQuarter,
  getFiscalPeriodInfo,
  FISCAL_PRESETS
} from './fiscal.js';

export type { FiscalConfig } from './fiscal.js';

// Date comparison and sorting utilities
export {
  compareDates,
  compareDatesDesc,
  sortDates,
  minDate,
  maxDate,
  dateExtent,
  uniqueDates,
  closestDate,
  closestFutureDate,
  closestPastDate,
  clampDate,
  isDateInRange,
  filterDatesInRange,
  groupDates,
  groupDatesByYear,
  groupDatesByMonth,
  groupDatesByDay,
  groupDatesByDayOfWeek,
  medianDate,
  averageDate,
  roundDate,
  snapDate,
  isChronological,
  dateSpan,
  partitionDates,
  nthDate,
  closestIndexTo,
  getOverlappingDaysInIntervals
} from './compare.js';

// Date iteration utilities
export {
  eachDay,
  eachWeekday,
  eachWeekend,
  eachWeek,
  eachMonth,
  eachQuarter,
  eachYear,
  eachHour,
  eachMinute,
  eachDayOfWeek,
  eachInterval,
  countDays,
  countWeekdays,
  countWeekendDays,
  countWeeks,
  countMonths,
  iterateDates,
  iterateDays,
  iterateWeekdays,
  iterateMonths,
  filterDays,
  eachMonthEnd,
  eachNthDayOfMonth,
  eachWeekendOfMonth,
  eachWeekendOfYear,
  previousDay,
  nextDay,
  previousSunday,
  previousMonday,
  previousTuesday,
  previousWednesday,
  previousThursday,
  previousFriday,
  previousSaturday,
  nextSunday,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday
} from './iterate.js';

// International holidays utilities
export {
  getUKHolidays,
  getNetherlandsHolidays,
  getGermanyHolidays,
  getCanadaHolidays,
  getAustraliaHolidays,
  getItalyHolidays,
  getSpainHolidays,
  getChinaHolidays,
  getIndiaHolidays,
  getJapanHolidays,
  getFranceHolidays,
  getBrazilHolidays,
  getMexicoHolidays,
  getSouthKoreaHolidays,
  getSingaporeHolidays,
  getPolandHolidays,
  getSwedenHolidays,
  getBelgiumHolidays,
  getSwitzerlandHolidays,
  getHolidays,
  isHoliday,
  getHolidayName,
  getNextHoliday,
  getUpcomingHolidays,
  getSupportedCountries
} from './holidays.js';

// Export types
export type { CountryCode, Holiday } from './holidays.js';

// Chain API (fluent interface)
export { chain, ChainedDate, formatMs } from './chain.js';

// Plugin system for extending ChainedDate
export { extend, uninstall, getRegisteredPlugins, getPluginMethods, isPluginRegistered } from './plugins.js';
export type { PluginFunction, Plugin } from './plugins.js';

// Non-Gregorian calendar utilities
export {
  toHebrewDate,
  toIslamicDate,
  toBuddhistDate,
  toJapaneseDate,
  toPersianDate,
  toChineseDate,
  formatInCalendar,
  getCalendarMonthNames,
  getJapaneseEra,
  getJapaneseEras,
  isHebrewLeapYear,
  getHebrewMonthName,
  getIslamicMonthName,
  getPersianMonthName,
  isPersianLeapYear,
  getChineseZodiac,
  getChineseElement,
  getChineseZodiacFull,
  calendarDateToString,
  compareCalendarDates,
  today as calendarToday,
  isSameCalendarDay,
  getSupportedCalendars
} from './calendars.js';

export type {
  CalendarDate,
  HebrewDate,
  IslamicDate,
  BuddhistDate,
  JapaneseDate,
  PersianDate,
  ChineseDate,
  CalendarType
} from './calendars.js';

// Temporal API compatibility layer
export {
  toPlainDate,
  toPlainTime,
  toPlainDateTime,
  toZonedDateTime,
  toInstant,
  createDuration as createTemporalDuration,
  parseDuration as parseTemporalDuration,
  nowInstant,
  nowPlainDateTime,
  nowPlainDate,
  nowPlainTime,
  nowZonedDateTime,
  fromTemporal
} from './temporal.js';

export type {
  PlainDate,
  PlainTime,
  PlainDateTime,
  ZonedDateTime,
  Instant,
  Duration as TemporalDuration,
  DurationLike,
  DurationUnit as TemporalDurationUnit
} from './temporal.js';

// Finance utilities
export {
  isMarketOpen,
  isMarketHoliday,
  isTradingDay,
  getMarketHours,
  getMarketOpen,
  getMarketClose,
  getNextMarketOpen,
  getNextMarketClose,
  getSettlementDate,
  getTradeDateFromSettlement,
  eachTradingDay,
  countTradingDays,
  addTradingDays,
  getOptionsExpiration,
  MARKET_HOURS,
  US_MARKET_HOLIDAYS
} from './finance.js';

export type {
  USMarket,
  MarketHours,
  OptionsExpirationType
} from './finance.js';

// Scheduling utilities
export {
  generateSlots,
  generateSlotsForRange,
  getAvailableSlots,
  findNextAvailable,
  isSlotAvailable,
  findConflicts,
  hasConflict,
  addBuffer,
  removeBuffer,
  expandRecurringAvailability,
  mergeBookings,
  splitSlot,
  DEFAULT_SCHEDULING_CONFIG
} from './scheduling.js';

export type {
  SchedulingConfig,
  Slot,
  Booking
} from './scheduling.js';

// High-precision utilities
export {
  createNanosecondTimestamp,
  fromNanoseconds,
  dateToNanoseconds,
  nanosecondsToDate,
  addNanoseconds,
  subtractNanoseconds,
  compareNanoseconds,
  nowNanoseconds,
  formatNanoseconds,
  parseNanoseconds,
  createHighResDuration,
  addHighResDuration,
  subtractHighResDuration,
  highResDurationToMs,
  msToHighResDuration,
  toBigIntMs,
  fromBigIntMs,
  toBigIntSeconds,
  fromBigIntSeconds,
  addBigIntMs,
  subtractBigIntMs,
  diffBigIntMs,
  isInDSTGap,
  isInDSTOverlap,
  getDSTTransitionsInYear,
  resolveAmbiguousTime,
  ValidDate,
  ensureValidDate,
  parseValidDate,
  assertValidDate,
  LEAP_SECONDS,
  leapSecondsBetween,
  isNearLeapSecond,
  taiToUtc,
  utcToTai
} from './precision.js';

export type {
  NanosecondTimestamp,
  HighResDuration,
  DSTTransition
} from './precision.js';
