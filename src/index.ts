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
  isBirthday,
  type AgeResult
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
  Stopwatch,
  type BenchmarkResult
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
  normalizeIntervals,
  type Interval
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
  type ZonedTime
} from './timezone.js';

// Working hours utilities
export {
  DEFAULT_WORKING_HOURS,
  isWorkingDay,
  isWorkingTime,
  nextWorkingTime,
  workingTimeBetween,
  addWorkingHours,
  type WorkingHoursConfig
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
  RANGE_PRESETS,
  type DateRange
} from './rangePresets.js';

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
