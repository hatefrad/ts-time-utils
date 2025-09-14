# ts-time-utils

A lightweight TypeScript utility library for time formatting, calculations, and validation with full tree-shaking support.

## 🚀 Features

- **📦 Lightweight** - Import only what you need with tree-shaking support
- **⚡ Fast** - Zero dependencies, pure JavaScript functions
- **🔧 TypeScript** - Full type safety and IntelliSense support
- **🌳 Tree-shakable** - Import individual functions to minimize bundle size
- **📚 Comprehensive** - 13 utility categories with 80+ functions

### ⏱️ Duration utilities

- Immutable Duration class with arithmetic operations
- Create durations from various units and string formats
- Add, subtract, multiply, divide durations
- Compare durations and check relationships
- Format to human-readable strings
- Utility functions for arrays of durations

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
```

## 📖 Examples

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
