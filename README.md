# ts-time-utils

A lightweight TypeScript utility library for time formatting, calculations, and validation with full tree-shaking support.

## 🚀 Features

- **📦 Lightweight** - Import only what you need with tree-shaking support
- **⚡ Fast** - Zero dependencies, pure JavaScript functions
- **🔧 TypeScript** - Full type safety and IntelliSense support
- **🌳 Tree-shakable** - Import individual functions to minimize bundle size
- **📚 Comprehensive** - 19 utility categories with 150+ functions

### 🔄 Recurrence utilities **(NEW!)**

- RRULE-inspired recurring event patterns
- Daily, weekly, monthly, and yearly recurrences
- Complex recurrence rules with byWeekday, byMonthDay, byMonth
- Get next occurrence, all occurrences, or occurrences within range
- Human-readable recurrence descriptions
- Full support for count and until limits

### ⏲️ Countdown & Timer utilities **(NEW!)**

- Real-time countdown timers with callbacks
- Get remaining time broken down by units
- Format countdowns as human-readable strings
- Check if dates are expired
- Calculate progress percentage between dates
- Deadline tracking with helper methods

### 📊 Date Range utilities **(NEW!)**

- Advanced range operations (overlap, intersection, union)
- Merge overlapping ranges
- Find gaps between ranges
- Split ranges into chunks
- Expand and shrink ranges
- Subtract ranges from each other
- Check containment and sort ranges

### 💬 Natural Language Parsing **(NEW!)**

- Parse human-friendly date strings ("tomorrow", "next Friday", "in 2 weeks")
- Extract dates from text automatically
- Context-aware date suggestions ("end of month", "EOY")
- Support for relative phrases and absolute dates
- Confidence scoring for extracted dates

### ⏱️ Duration utilities

- Immutable Duration class with arithmetic operations
- Create durations from various units and string formats
- Add, subtract, multiply, divide durations
- Compare durations and check relationships
- Format to human-readable strings
- Utility functions for arrays of durations

### 💾 Serialization utilities

- Safe JSON date serialization and deserialization
- Multiple format support (ISO, epoch, object, custom)
- Automatic date reviver and replacer functions
- Timezone-aware serialization options
- Cross-platform date interchange utilities
- Validation for ISO strings and epoch timestamps

### 🎨 Format utilities

- Format milliseconds to human-readable durations
- Get human-friendly "time ago" strings
- Parse duration strings back to milliseconds
- Format time in 12h/24h/ISO formats

### 🧮 Calculation utilities

- Calculate difference between dates in any unit
- Add/subtract time from dates
- Get start/end of time periods
- Business days calculations
- Check if date is between two dates

### ✅ Validation utilities

- Validate dates and time strings
- Check for leap years, weekends, past/future dates
- Compare dates (same day, today, yesterday, etc.)

### 🎂 Age utilities

- Calculate precise age with years, months, and days
- Get life stage classifications (infant, child, adult, etc.)
- Birthday calculations and next birthday finder
- Check if today is someone's birthday

### 📅 Calendar utilities

- ISO week numbers and week-based calculations
- Quarter operations and fiscal year support
- Holiday calculations (Easter, Thanksgiving, etc.)
- Days in month/year calculations

### 🔍 Parse utilities

- Advanced date parsing from multiple formats
- Relative date parsing ("tomorrow", "next week")
- Custom format parsing with flexible patterns
- Smart date interpretation

### ⚡ Performance utilities

- Async utilities (sleep, timeout, retry)
- Performance measurement and benchmarking
- Stopwatch for timing operations
- Function utilities (debounce, throttle, memoize)

### 📏 Interval utilities

- Create and validate intervals
- Overlap, intersection, merge, subtraction
- Split by day and total coverage
- Normalize and compute durations

### 🌐 Timezone utilities

- Validate IANA timezones
- Get offsets and compare zones
- Format in specific timezone
- Convert absolute moment to zone components
- Reinterpret wall-clock times

### 🕘 Working hours utilities

- Define working day patterns and breaks
- Check working day/time
- Compute working time between dates
- Add working hours across days
- Find next working time

### 🎯 Range preset utilities

- Today / yesterday / tomorrow
- Last/next N days windows
- This/last/next week, month, quarter, year
- Rolling windows and quarter helpers

### 🌍 Locale utilities

- Multi-language relative time formatting
- Locale-specific date and time formatting
- Support for 40+ locales with built-in configurations
- Auto-detection of system/browser locale
- Custom locale registration
- Internationalization (i18n) support
- **Locale conversions** - Convert between different locales and detect locale from text

### 🧱 Constants

- Milliseconds & seconds per unit
- Time unit and formatting option types

## 📦 Installation

```bash
npm install ts-time-utils
```

## 🔧 Usage

### Import everything (not recommended for production)

```ts
import { formatDuration, timeAgo, isValidDate } from "ts-time-utils";
```

### Import by category (better for tree-shaking)

```ts
import { formatDuration, timeAgo } from "ts-time-utils/format";
import { differenceInUnits, addTime } from "ts-time-utils/calculate";
import { isValidDate, isLeapYear } from "ts-time-utils/validate";
import { calculateAge, getNextBirthday } from "ts-time-utils/age";
import { getWeekNumber, getQuarter } from "ts-time-utils/calendar";
import { parseDate, parseRelativeDate } from "ts-time-utils/parse";
import { sleep, benchmark, Stopwatch } from "ts-time-utils/performance";
import { createInterval, mergeIntervals } from "ts-time-utils/interval";
import { formatInTimeZone } from "ts-time-utils/timezone";
import { isWorkingTime, addWorkingHours } from "ts-time-utils/workingHours";
import { today, lastNDays } from "ts-time-utils/rangePresets";
import { Duration, createDuration } from "ts-time-utils/duration";
import { serializeDate, parseJSONWithDates } from "ts-time-utils/serialize";
import {
  formatRelativeTime,
  formatDateLocale,
  detectLocale,
} from "ts-time-utils/locale";
// New modules!
import { createRecurrence, getNextOccurrence } from "ts-time-utils/recurrence";
import { createCountdown, getRemainingTime } from "ts-time-utils/countdown";
import { mergeDateRanges, findGaps } from "ts-time-utils/dateRange";
import {
  parseNaturalDate,
  extractDatesFromText,
} from "ts-time-utils/naturalLanguage";
```

## 📖 Examples

### Recurrence Utilities (NEW!)

```ts
import { createRecurrence, recurrenceToString } from "ts-time-utils/recurrence";

// Daily recurrence
const daily = createRecurrence({
  frequency: "daily",
  interval: 2,
  startDate: new Date("2024-01-01"),
  count: 10,
});

const next = daily.getNextOccurrence(new Date());
const allOccurrences = daily.getAllOccurrences();

// Weekly on specific days
const weekly = createRecurrence({
  frequency: "weekly",
  interval: 1,
  startDate: new Date("2024-01-01"),
  byWeekday: [1, 3, 5], // Monday, Wednesday, Friday
});

const description = recurrenceToString(weekly.rule);
// "Every week on Monday, Wednesday, Friday"

// Monthly on the 15th
const monthly = createRecurrence({
  frequency: "monthly",
  interval: 1,
  startDate: new Date("2024-01-01"),
  byMonthDay: [15],
  until: new Date("2024-12-31"),
});

const occurrencesInRange = monthly.getOccurrencesBetween(
  new Date("2024-03-01"),
  new Date("2024-06-30")
);
```

### Countdown & Timer Utilities (NEW!)

```ts
import {
  createCountdown,
  getRemainingTime,
  formatCountdown,
} from "ts-time-utils/countdown";

// Create a countdown timer
const countdown = createCountdown(new Date("2024-12-31T23:59:59"), {
  onTick: (remaining) => {
    console.log(`${remaining.days}d ${remaining.hours}h ${remaining.minutes}m`);
  },
  onComplete: () => {
    console.log("Happy New Year!");
  },
  interval: 1000, // Update every second
});

countdown.start();
// Later...
countdown.stop();

// Get remaining time
const remaining = getRemainingTime(new Date("2024-12-31"));
console.log(`${remaining.days} days, ${remaining.hours} hours remaining`);

// Format countdown
const formatted = formatCountdown(new Date("2024-12-31"), {
  units: ["days", "hours", "minutes"],
  short: true,
});
// "45d 12h 30m"

// Progress tracking
import { getProgressPercentage } from "ts-time-utils/countdown";

const progress = getProgressPercentage(
  new Date("2024-01-01"),
  new Date("2024-12-31"),
  new Date("2024-07-01")
);
console.log(`${progress}% complete`); // ~50%
```

### Date Range Utilities (NEW!)

```ts
import {
  mergeDateRanges,
  findGaps,
  dateRangeOverlap,
  splitRange,
} from "ts-time-utils/dateRange";

// Merge overlapping ranges
const ranges = [
  { start: new Date("2024-01-01"), end: new Date("2024-01-10") },
  { start: new Date("2024-01-05"), end: new Date("2024-01-15") },
  { start: new Date("2024-01-20"), end: new Date("2024-01-25") },
];

const merged = mergeDateRanges(ranges);
// [
//   { start: Date('2024-01-01'), end: Date('2024-01-15') },
//   { start: Date('2024-01-20'), end: Date('2024-01-25') }
// ]

// Find gaps between busy times
const busyTimes = [
  { start: new Date("2024-01-01T09:00"), end: new Date("2024-01-01T11:00") },
  { start: new Date("2024-01-01T14:00"), end: new Date("2024-01-01T16:00") },
];

const gaps = findGaps(busyTimes, {
  start: new Date("2024-01-01T08:00"),
  end: new Date("2024-01-01T18:00"),
});
// Returns available time slots

// Split into chunks
const range = {
  start: new Date("2024-01-01"),
  end: new Date("2024-01-31"),
};

const weeks = splitRange(range, 1, "week");
// Splits January into weekly chunks

// Check overlap
const overlap = dateRangeOverlap(
  { start: new Date("2024-01-01"), end: new Date("2024-01-15") },
  { start: new Date("2024-01-10"), end: new Date("2024-01-20") }
); // true
```

### Natural Language Parsing (NEW!)

```ts
import {
  parseNaturalDate,
  extractDatesFromText,
  suggestDateFromContext,
} from "ts-time-utils/naturalLanguage";

// Parse natural language dates
parseNaturalDate("tomorrow at 3pm");
// Returns Date for tomorrow at 15:00

parseNaturalDate("next Friday");
// Returns Date for next Friday

parseNaturalDate("in 2 weeks");
// Returns Date 2 weeks from now

parseNaturalDate("3 days ago");
// Returns Date 3 days ago

// Extract dates from text
const text = "Meeting tomorrow at 3pm and lunch next Friday at noon";
const dates = extractDatesFromText(text);
// [
//   { date: Date(...), text: 'tomorrow at 3pm', index: 8, confidence: 0.9 },
//   { date: Date(...), text: 'next Friday at noon', index: 35, confidence: 0.85 }
// ]

// Context-aware suggestions
const suggestions = suggestDateFromContext("deadline is end of month");
// [{ date: Date(last day of current month), text: 'end of month', confidence: 0.85 }]

// Supported phrases:
// - "tomorrow", "yesterday", "today"
// - "next Monday", "last Friday"
// - "in 2 hours", "5 days ago"
// - "end of month/week/year" (or EOM/EOW/EOY)
// - "beginning of month/year"
```

### Duration Utilities

```ts
import {
  Duration,
  createDuration,
  formatDurationString,
} from "ts-time-utils/duration";

// Create durations
const duration1 = Duration.fromHours(2.5); // 2.5 hours
const duration2 = new Duration({ hours: 1, minutes: 30 }); // 1.5 hours
const duration3 = Duration.fromString("1h 30m 45s"); // Parse from string
const duration4 = Duration.between(startDate, endDate); // From date range

// Arithmetic operations
const sum = duration1.add(duration2); // 4 hours
const diff = duration1.subtract(duration2); // 1 hour
const doubled = duration1.multiply(2); // 5 hours
const half = duration1.divide(2); // 1.25 hours

// Comparisons
duration1.equals(duration2); // false
duration1.greaterThan(duration2); // true
duration1.compareTo(duration2); // 1

// Conversions and formatting
duration1.hours; // 2.5
duration1.minutes; // 150
duration1.toString(); // "2h 30m"
formatDurationString(duration1, { long: true }); // "2 hours, 30 minutes"

// Utility functions with arrays
const durations = [duration1, duration2, duration3];
const max = maxDuration(...durations);
const total = sumDurations(...durations);
const average = averageDuration(...durations);
```

### Serialization Utilities

```ts
import {
  serializeDate,
  deserializeDate,
  parseJSONWithDates,
  stringifyWithDates,
  toEpochTimestamp,
  fromEpochTimestamp,
  toDateObject,
  fromDateObject,
} from "ts-time-utils/serialize";

// Serialize dates in different formats
const date = new Date("2025-09-14T12:30:45.123Z");

const isoString = serializeDate(date, { format: "iso" }); // "2025-09-14T12:30:45.123Z"
const epochMs = serializeDate(date, { format: "epoch" }); // 1757853045123
const dateObj = serializeDate(date, { format: "object" }); // {year: 2025, month: 9, ...}
const custom = serializeDate(date, {
  format: "custom",
  customFormat: "YYYY-MM-DD HH:mm:ss",
}); // "2025-09-14 12:30:45"

// Deserialize from various formats
const fromISO = deserializeDate("2025-09-14T12:30:45.123Z");
const fromEpoch = deserializeDate(1757853045123);
const fromObj = deserializeDate({
  year: 2025,
  month: 9,
  day: 14,
  hour: 12,
  minute: 30,
  second: 45,
  millisecond: 123,
});

// Safe JSON handling with automatic date conversion
const data = {
  name: "User",
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: "other data",
};

// Stringify with automatic date serialization
const jsonString = stringifyWithDates(data, ["createdAt", "updatedAt"], {
  format: "epoch",
});
// {"name":"User","createdAt":1757853045123,"updatedAt":1757853045123,"metadata":"other data"}

// Parse with automatic date restoration
const parsed = parseJSONWithDates(jsonString, ["createdAt", "updatedAt"]);
// parsed.createdAt and parsed.updatedAt are Date objects

// Epoch timestamp utilities
const timestamp = toEpochTimestamp(date, "seconds"); // 1757853045
const restoredDate = fromEpochTimestamp(timestamp, "seconds");

// Date object utilities (UTC-based)
const dateObject = toDateObject(date, true); // includes timezone
const reconstructed = fromDateObject(dateObject);
```

### Format Utilities

```ts
import { formatDuration, timeAgo, parseDuration } from "ts-time-utils/format";

// Format durations
formatDuration(65000); // "1 minute, 5 seconds"
formatDuration(65000, { short: true }); // "1m 5s"
formatDuration(90061000, { maxUnits: 2 }); // "1 day, 1 hour"

// Time ago strings
timeAgo(new Date(Date.now() - 60000)); // "1 minute ago"
timeAgo(new Date(Date.now() + 60000)); // "in 1 minute"

// Parse duration strings
parseDuration("1h 30m"); // 5400000 (milliseconds)
parseDuration("2 days 3 hours"); // 183600000
```

### Calculate Utilities

```ts
import { differenceInUnits, addTime, startOf } from "ts-time-utils/calculate";

// Date calculations
differenceInUnits(new Date("2025-09-01"), new Date("2025-09-11"), "days"); // 10

addTime(new Date(), 5, "hours"); // 5 hours from now
startOf(new Date(), "day"); // Start of today (00:00:00)
```

### Validation Utilities

```ts
import { isValidDate, isLeapYear, isWeekend } from "ts-time-utils/validate";

// Validations
isValidDate(new Date("2025-13-01")); // false
isLeapYear(2024); // true
isWeekend(new Date("2025-09-13")); // true (Saturday)
```

### Age Utilities

```ts
import {
  calculateAge,
  getLifeStage,
  getNextBirthday,
  isBirthday,
} from "ts-time-utils/age";

// Age calculations
calculateAge(new Date("1990-05-15")); // { years: 34, months: 4, days: 2 }
getLifeStage(25); // "adult"
getNextBirthday(new Date("1990-05-15")); // Next May 15th
isBirthday(new Date("1990-05-15"), new Date("2025-05-15")); // true
```

### Calendar Utilities

```ts
import {
  getWeekNumber,
  getQuarter,
  getEaster,
  getDaysInMonth,
} from "ts-time-utils/calendar";

// Calendar operations
getWeekNumber(new Date("2025-01-15")); // 3
getQuarter(new Date("2025-07-15")); // 3
getEaster(2025); // Date object for Easter Sunday 2025
getDaysInMonth(2, 2024); // 29 (leap year)
```

### Parse Utilities

```ts
import {
  parseDate,
  parseRelativeDate,
  parseCustomFormat,
} from "ts-time-utils/parse";

// Advanced parsing
parseDate("2025-02-30"); // null (invalid date)
parseDate("Dec 25, 2025"); // Date object
parseRelativeDate("tomorrow"); // Date for tomorrow
parseCustomFormat("25/12/2025", "DD/MM/YYYY"); // Date object
```

### Performance Utilities

```ts
import {
  sleep,
  timeout,
  benchmark,
  Stopwatch,
  debounce,
} from "ts-time-utils/performance";

// Async utilities
await sleep(1000); // Wait 1 second
await timeout(promise, 5000); // Timeout after 5 seconds

// Performance measurement
const result = await benchmark(() => heavyOperation(), 10); // Run 10 times
const stopwatch = new Stopwatch();
stopwatch.start();
// ... operations
console.log(stopwatch.getElapsed()); // Get elapsed time

// Function utilities
const debouncedFn = debounce(() => console.log("Called!"), 300);
```

### Interval Utilities

```ts
import {
  createInterval,
  intervalsOverlap,
  mergeIntervals,
} from "ts-time-utils/interval";

const a = createInterval("2025-01-01", "2025-01-05");
const b = createInterval("2025-01-04", "2025-01-10");
intervalsOverlap(a!, b!); // true
const merged = mergeIntervals([a!, b!]);
```

### Timezone Utilities

```ts
import { formatInTimeZone, getTimezoneOffset } from "ts-time-utils/timezone";
formatInTimeZone(new Date(), "Europe/Paris", {
  hour: "2-digit",
  minute: "2-digit",
});
getTimezoneOffset("America/New_York"); // e.g. -300 (minutes)
```

### Working Hours Utilities

```ts
import { isWorkingTime, addWorkingHours } from "ts-time-utils/workingHours";

isWorkingTime(new Date()); // depends on config
addWorkingHours(new Date(), 10); // adds 10 working hours, skipping off-hours
```

### Range Preset Utilities

```ts
import { lastNDays, thisWeek, quarterRange } from "ts-time-utils/rangePresets";

const last7 = lastNDays(7);
const week = thisWeek();
const quarter = quarterRange();
```

### Locale Utilities

```ts
import {
  formatRelativeTime,
  formatDateLocale,
  formatTimeLocale,
  formatDateTimeLocale,
  registerLocale,
  getLocaleConfig,
  detectLocale,
  getSupportedLocales,
} from "ts-time-utils/locale";

// Relative time formatting in multiple languages
const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
formatRelativeTime(pastDate, { locale: "en" }); // "2 hours ago"
formatRelativeTime(pastDate, { locale: "es" }); // "hace 2 horas"
formatRelativeTime(pastDate, { locale: "fr" }); // "il y a 2 heures"
formatRelativeTime(pastDate, { locale: "de" }); // "vor 2 Stunden"
formatRelativeTime(pastDate, { locale: "nl" }); // "2 uur geleden"
formatRelativeTime(pastDate, { locale: "it" }); // "2 ore fa"
formatRelativeTime(pastDate, { locale: "zh" }); // "2小时前"
formatRelativeTime(pastDate, { locale: "ja" }); // "2時間前"
formatRelativeTime(pastDate, { locale: "fa" }); // "2 ساعت پیش"

// Future dates
const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
formatRelativeTime(futureDate, { locale: "en" }); // "in 3 days"
formatRelativeTime(futureDate, { locale: "es" }); // "en 3 días"
formatRelativeTime(futureDate, { locale: "nl" }); // "over 3 dagen"
formatRelativeTime(futureDate, { locale: "it" }); // "tra 3 giorni"
formatRelativeTime(futureDate, { locale: "fa" }); // "3 روز دیگر"

// Relative time options
formatRelativeTime(pastDate, {
  locale: "en",
  maxUnit: "days", // Don't use units larger than days
  minUnit: "minutes", // Don't use units smaller than minutes
  precision: 1, // Show 1 decimal place: "2.0 hours ago"
  short: true, // Use abbreviated format: "2h ago"
  numeric: "auto", // Use words when appropriate: "yesterday"
});

// Date formatting
const date = new Date("2024-01-15T14:30:45Z");
formatDateLocale(date, "en", "medium"); // "Jan 15, 2024"
formatDateLocale(date, "es", "medium"); // "15 ene 2024"
formatDateLocale(date, "fr", "long"); // "15 janvier 2024"
formatDateLocale(date, "de", "short"); // "15.1.2024"

// Time formatting
formatTimeLocale(date, "en", "short"); // "2:30 PM"
formatTimeLocale(date, "de", "medium"); // "14:30:45"
formatTimeLocale(date, "fr", "long"); // "14:30:45 UTC"

// Combined date and time
formatDateTimeLocale(date, "en"); // "Jan 15, 2024 2:30:45 PM"

// Auto-detect locale from browser/system
const userLocale = detectLocale(); // e.g., 'en-US' or 'fr-FR'
formatRelativeTime(pastDate, { locale: userLocale });

// Get supported locales
const locales = getSupportedLocales();
// ['en', 'es', 'fr', 'de', 'zh', 'ja', ...]

// Register custom locale
registerLocale("custom", {
  locale: "custom",
  dateFormats: {
    short: "M/d/yyyy",
    medium: "MMM d, yyyy",
    long: "MMMM d, yyyy",
    full: "EEEE, MMMM d, yyyy",
  },
  timeFormats: {
    short: "h:mm a",
    medium: "h:mm:ss a",
    long: "h:mm:ss a z",
    full: "h:mm:ss a zzzz",
  },
  relativeTime: {
    future: "in {0}",
    past: "{0} ago",
    units: {
      second: "sec",
      seconds: "secs",
      minute: "min",
      minutes: "mins",
      hour: "hr",
      hours: "hrs",
      day: "day",
      days: "days",
      week: "wk",
      weeks: "wks",
      month: "mo",
      months: "mos",
      year: "yr",
      years: "yrs",
    },
  },
  calendar: {
    weekStartsOn: 0, // Sunday
    monthNames: ["Jan", "Feb", "Mar" /* ... */],
    monthNamesShort: ["J", "F", "M" /* ... */],
    dayNames: ["Sun", "Mon", "Tue" /* ... */],
    dayNamesShort: ["S", "M", "T" /* ... */],
  },
  numbers: {
    decimal: ".",
    thousands: ",",
  },
});

// Locale Conversion Utilities
import {
  convertRelativeTime,
  detectLocaleFromRelativeTime,
  convertFormatPattern,
  convertFormattedDate,
  convertRelativeTimeArray,
  compareLocaleFormats,
} from "ts-time-utils/locale";

// Convert relative time between locales
convertRelativeTime("2 hours ago", "en", "es"); // "hace 2 horas"
convertRelativeTime("hace 3 días", "es", "fr"); // "il y a 3 jours"
convertRelativeTime("2h ago", "en", "de"); // "vor 2h"
convertRelativeTime("2 hours ago", "en", "nl"); // "2 uur geleden"
convertRelativeTime("2 hours ago", "en", "it"); // "2 ore fa"
convertRelativeTime("2 hours ago", "en", "fa"); // "2 ساعت پیش"
convertRelativeTime("2 ساعت پیش", "fa", "en"); // "2 hours ago"

// Detect locale from formatted text
detectLocaleFromRelativeTime("2 hours ago"); // "en"
detectLocaleFromRelativeTime("hace 2 horas"); // "es"
detectLocaleFromRelativeTime("il y a 2 heures"); // "fr"
detectLocaleFromRelativeTime("2 uur geleden"); // "nl"
detectLocaleFromRelativeTime("2 ore fa"); // "it"
detectLocaleFromRelativeTime("2 ساعت پیش"); // "fa"
detectLocaleFromRelativeTime("vor 2 Stunden"); // "de"

// Convert date format patterns between locales
convertFormatPattern("M/d/yyyy", "en", "de"); // "dd.MM.yyyy"
convertFormatPattern("MMM d, yyyy", "en", "fr", "long"); // "d MMMM yyyy"

// Convert formatted dates between locales
convertFormattedDate("Jan 15, 2024", "en", "es"); // "15 ene 2024"
convertFormattedDate("15. Januar 2024", "de", "en"); // "Jan 15, 2024"

// Bulk conversion of relative time arrays
const englishTimes = ["2 hours ago", "in 3 days", "1 week ago"];
convertRelativeTimeArray(englishTimes, "en", "es");
// ["hace 2 horas", "en 3 días", "hace 1 semana"]

// Compare format differences between locales
const comparison = compareLocaleFormats("en", "de");
console.log(comparison.dateFormats.short);
// { locale1: "M/d/yyyy", locale2: "dd.MM.yyyy" }
console.log(comparison.weekStartsOn);
// { locale1: 0, locale2: 1 } // Sunday vs Monday
```

## 📊 API Reference

### Duration Functions

- `Duration` class - Immutable duration with full arithmetic support
- `createDuration(input)` - Create duration from number, object, or string
- `Duration.fromHours/Minutes/Seconds/Days/Weeks(n)` - Create from specific units
- `Duration.fromString(str)` - Parse from string like "1h 30m 45s"
- `Duration.between(start, end)` - Create from date range
- `duration.add/subtract/multiply/divide()` - Arithmetic operations
- `duration.equals/greaterThan/lessThan()` - Comparison methods
- `formatDurationString(duration, options?)` - Format to readable string
- `maxDuration/minDuration(...durations)` - Find extremes
- `sumDurations/averageDuration(...durations)` - Aggregate operations

### Serialization Functions

- `serializeDate(date, options?)` - Serialize date to various formats (ISO, epoch, object, custom)
- `deserializeDate(serialized, options?)` - Deserialize from string, number, or object
- `parseJSONWithDates(jsonString, dateKeys?, options?)` - Parse JSON with automatic date conversion
- `stringifyWithDates(obj, dateKeys?, options?)` - Stringify JSON with automatic date serialization
- `createDateReviver/createDateReplacer(dateKeys?, options?)` - Create JSON reviver/replacer functions
- `toEpochTimestamp/fromEpochTimestamp(input, precision?)` - Convert to/from epoch timestamps
- `toDateObject/fromDateObject(input)` - Convert to/from safe object representation
- `isValidISODateString/isValidEpochTimestamp(input)` - Validation utilities
- `cloneDate(date)` - Safe date cloning
- `datesEqual(date1, date2, precision?)` - Compare dates with precision control

### Format Functions

- `formatDuration(ms, options?)` - Format milliseconds to readable duration
- `timeAgo(date, options?)` - Get "time ago" string for past/future dates
- `formatTime(date, format?)` - Format time as 12h/24h/ISO
- `parseDuration(duration)` - Parse duration string to milliseconds

### Calculate Functions

- `differenceInUnits(date1, date2, unit?, precise?)` - Calculate difference between dates
- `addTime(date, amount, unit)` - Add time to a date
- `subtractTime(date, amount, unit)` - Subtract time from a date
- `startOf(date, unit)` - Get start of time period
- `endOf(date, unit)` - Get end of time period
- `isBetween(date, start, end)` - Check if date is between two dates
- `businessDaysBetween(start, end)` - Count business days between dates

### Validation Functions

- `isValidDate(date)` - Check if date is valid
- `isLeapYear(year)` - Check if year is leap year
- `isPast(date)` / `isFuture(date)` - Check if date is past/future
- `isToday(date)` / `isYesterday(date)` / `isTomorrow(date)` - Date comparisons
- `isSameDay(date1, date2)` - Check if dates are same day
- `isWeekend(date)` / `isWeekday(date)` - Check day type
- `isValidTimeString(time)` - Validate HH:MM time format
- `isValidISOString(dateString)` - Validate ISO 8601 date string

### Locale Functions

- `formatRelativeTime(date, options?)` - Format relative time with locale support
  - Options: `locale`, `maxUnit`, `minUnit`, `precision`, `short`, `numeric`, `style`
  - Supports 30+ locales: en, es, fr, de, it, pt, nl, sv, da, no, fi, pl, cs, sk, hu, ro, bg, hr, sl, et, lv, lt, ru, uk, tr, ar, he, hi, th, ko, zh, ja
- `formatDateLocale(date, locale?, style?)` - Format date in locale-specific format
  - Styles: 'short', 'medium', 'long', 'full'
- `formatTimeLocale(date, locale?, style?)` - Format time in locale-specific format
- `formatDateTimeLocale(date, locale?, dateStyle?, timeStyle?)` - Format both date and time
- `registerLocale(locale, config)` - Register a custom locale configuration
- `getLocaleConfig(locale)` - Get configuration for a specific locale
- `detectLocale(fallback?)` - Auto-detect system/browser locale
- `getSupportedLocales()` - Get array of all supported locale codes
- `getMonthNames(locale?, short?)` - Get localized month names
- `getDayNames(locale?, short?)` - Get localized day names
- `getBestMatchingLocale(preferences, fallback?)` - Find best matching locale from preferences

#### Locale Conversion Functions

- `convertRelativeTime(text, fromLocale, toLocale)` - Convert relative time between locales
  - Example: `convertRelativeTime("2 hours ago", "en", "es")` → `"hace 2 horas"`
  - Example: `convertRelativeTime("2 hours ago", "en", "nl")` → `"2 uur geleden"`
  - Example: `convertRelativeTime("2 hours ago", "en", "it")` → `"2 ore fa"`
  - Example: `convertRelativeTime("2 hours ago", "en", "fa")` → `"2 ساعت پیش"`
- `detectLocaleFromRelativeTime(text)` - Detect locale from relative time string
  - Returns most likely locale or null if detection fails
- `convertFormatPattern(pattern, fromLocale, toLocale, style?)` - Convert date format patterns
  - Maps common patterns between locales or uses target locale's style
- `convertFormattedDate(formattedDate, fromLocale, toLocale, targetStyle?)` - Convert formatted dates
  - Parses date in source locale and reformats in target locale
- `convertRelativeTimeArray(array, fromLocale, toLocale)` - Bulk convert relative time arrays
  - Returns array with same length, null for unparseable strings
- `compareLocaleFormats(locale1, locale2)` - Compare format differences between locales
  - Returns object with dateFormats, timeFormats, and weekStartsOn comparisons

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build (both CommonJS and ES modules)
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

## 📄 License

MIT
