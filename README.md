# ts-time-utils

A comprehensive TypeScript utility library for time, dates, durations, and calendar operations. Zero dependencies, full tree-shaking support, 320+ functions across 26 categories.

[![npm version](https://img.shields.io/npm/v/ts-time-utils.svg)](https://www.npmjs.com/package/ts-time-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**[Live Playground & Docs](https://ts-time-utils.h8frad.work)** | [GitHub](https://github.com/hatefrad/ts-time-utils)

## Features

- **Lightweight** — Import only what you need with tree-shaking support
- **Zero dependencies** — Pure TypeScript, no external packages
- **Type-safe** — Full TypeScript support with IntelliSense
- **Comprehensive** — 320+ functions across 26 utility categories
- **Fluent API** — Chain operations with the `chain()` API
- **Extensible** — Plugin system for custom functionality

## Installation

```bash
npm install ts-time-utils
```

## Quick Start

```ts
import { formatDuration, timeAgo, Duration } from 'ts-time-utils';

// Format milliseconds to readable duration
formatDuration(3661000); // "1 hour, 1 minute, 1 second"

// Get "time ago" strings
timeAgo(new Date(Date.now() - 3600000)); // "1 hour ago"

// Duration arithmetic
const meeting = Duration.fromMinutes(45);
const buffer = Duration.fromMinutes(15);
meeting.add(buffer).toString(); // "1h"
```

### Tree-shaking (recommended)

```ts
import { formatDuration } from 'ts-time-utils/format';
import { differenceInUnits } from 'ts-time-utils/calculate';
import { isValidDate } from 'ts-time-utils/validate';
```

---

## Utility Categories

### Format

Format durations, time ago strings, and custom date formats.

```ts
import { formatDuration, timeAgo, parseDuration } from 'ts-time-utils/format';

formatDuration(65000);                    // "1 minute, 5 seconds"
formatDuration(65000, { short: true });   // "1m 5s"
timeAgo(new Date(Date.now() - 60000));    // "1 minute ago"
parseDuration('1h 30m');                  // 5400000 (ms)
```

### Calculate

Date arithmetic, differences, and business day calculations.

```ts
import { differenceInUnits, addTime, startOf, endOf } from 'ts-time-utils/calculate';

differenceInUnits(date1, date2, 'days');  // 10
addTime(new Date(), 5, 'hours');          // 5 hours from now
startOf(new Date(), 'day');               // 00:00:00 today
endOf(new Date(), 'month');               // Last moment of month
```

### Validate

Date validation, checks, and comparisons.

```ts
import { isValidDate, isLeapYear, isWeekend, isSameDay } from 'ts-time-utils/validate';

isValidDate(new Date('2025-13-01'));      // false
isLeapYear(2024);                         // true
isWeekend(new Date('2025-09-13'));        // true (Saturday)
isSameDay(date1, date2);                  // boolean
```

### Duration

Immutable Duration class with arithmetic operations.

```ts
import { Duration } from 'ts-time-utils/duration';

const d1 = Duration.fromHours(2.5);
const d2 = Duration.fromString('1h 30m 45s');
const d3 = Duration.between(startDate, endDate);

d1.add(d2).toString();        // "4h 0m 45s"
d1.greaterThan(d2);           // true
d1.multiply(2).hours;         // 5
```

### Chain API

Fluent chainable API for date operations.

```ts
import { chain } from 'ts-time-utils/chain';

chain(new Date())
  .startOf('day')
  .add(9, 'hours')
  .add(30, 'minutes')
  .toDate();  // Today at 9:30am

chain(new Date())
  .add(1, 'week')
  .startOf('week')
  .format('YYYY-MM-DD');  // Next week Monday
```

### Timezone

Timezone conversions, DST handling, and zone comparisons.

```ts
import { formatInTimeZone, isDST, convertTimezone } from 'ts-time-utils/timezone';

formatInTimeZone(date, 'America/New_York');
isDST(new Date('2025-07-14'), 'America/New_York');  // true
convertTimezone(date, 'UTC', 'Asia/Tokyo');
```

### Calendar

ISO weeks, quarters, holidays, and calendar grids.

```ts
import { getWeekNumber, getQuarter, getEaster, getUSHolidays } from 'ts-time-utils/calendar';

getWeekNumber(new Date('2025-09-14'));    // 37
getQuarter(new Date('2025-07-15'));       // 3
getEaster(2025);                          // Easter Sunday 2025
getUSHolidays(2025);                      // Array of US federal holidays
```

### Date Range

Date range operations: overlap, gaps, merge, split.

```ts
import { mergeDateRanges, findGaps, dateRangeOverlap } from 'ts-time-utils/dateRange';

const ranges = [
  { start: new Date('2024-01-01'), end: new Date('2024-01-10') },
  { start: new Date('2024-01-05'), end: new Date('2024-01-15') },
];

mergeDateRanges(ranges);  // Merged into single range
findGaps(busyTimes, workday);  // Available time slots
dateRangeOverlap(range1, range2);  // true/false
```

### Recurrence

RRULE-inspired recurring event patterns.

```ts
import { createRecurrence, recurrenceToString } from 'ts-time-utils/recurrence';

const weekly = createRecurrence({
  frequency: 'weekly',
  interval: 1,
  startDate: new Date('2025-01-01'),
  byWeekday: [1, 3, 5],  // Mon, Wed, Fri
});

weekly.getNextOccurrence(new Date());
weekly.getAllOccurrences();
recurrenceToString(weekly.rule);  // "Every week on Monday, Wednesday, Friday"
```

### Cron

Parse and match cron expressions.

```ts
import { matchesCron, getNextCronDate, describeCron, CRON_PRESETS } from 'ts-time-utils/cron';

matchesCron('0 9 * * 1-5', date);         // true if weekday 9am
getNextCronDate('0 9 * * *');             // Next 9am
describeCron('0 9 * * 1-5');              // "At 09:00 on Monday through Friday"
CRON_PRESETS.DAILY;                       // "0 0 * * *"
```

### Fiscal Year

Fiscal year utilities with configurable start month.

```ts
import { getFiscalYear, getFiscalQuarter, FISCAL_PRESETS } from 'ts-time-utils/fiscal';

getFiscalYear(date, FISCAL_PRESETS.UK_INDIA);     // April start
getFiscalYear(date, FISCAL_PRESETS.AUSTRALIA);   // July start
getFiscalYear(date, FISCAL_PRESETS.US_FEDERAL);  // October start
getFiscalQuarter(date, { startMonth: 4 });       // Q2 for UK fiscal
```

### Compare & Sort

Sort, group, and analyze date arrays.

```ts
import { sortDates, closestDate, groupDatesByMonth, snapDate } from 'ts-time-utils/compare';

sortDates(dates, 'desc');
closestDate(target, candidates);
groupDatesByMonth(dates);  // Map by YYYY-MM
snapDate(date, 15, 'minutes');  // Snap to 15-min grid
```

### Iterate

Iterate through date sequences and count dates.

```ts
import { eachDay, eachWeekday, countWeekdays, filterDays } from 'ts-time-utils/iterate';

eachDay(start, end);       // Array of each day
eachWeekday(start, end);   // Weekdays only (Mon-Fri)
countWeekdays(start, end); // Number of weekdays
filterDays(start, end, d => d.getDate() === 15);  // 15th of each month
```

### Natural Language

Parse human-friendly date strings.

```ts
import { parseNaturalDate, extractDatesFromText } from 'ts-time-utils/naturalLanguage';

parseNaturalDate('tomorrow');
parseNaturalDate('next Friday');
parseNaturalDate('in 2 weeks');
parseNaturalDate('end of month');

extractDatesFromText('Meeting tomorrow at 3pm');
// [{ date: Date, text: 'tomorrow at 3pm', confidence: 0.9 }]
```

### International Holidays

Public holidays for 10 countries.

```ts
import { getHolidays, isHoliday, getNextHoliday } from 'ts-time-utils/holidays';

getHolidays(2025, 'UK');      // UK bank holidays
getHolidays(2025, 'DE');      // German holidays
isHoliday(date, 'CA');        // Is Canadian holiday?
getNextHoliday(date, 'AU');   // Next Australian holiday

// Supported: UK, NL, DE, CA, AU, IT, ES, CN, IN, US
```

### Locale

Multi-language formatting with 40+ locales.

```ts
import { formatRelativeTime, formatDateLocale, detectLocale } from 'ts-time-utils/locale';

formatRelativeTime(pastDate, { locale: 'es' });  // "hace 2 horas"
formatRelativeTime(pastDate, { locale: 'de' });  // "vor 2 Stunden"
formatDateLocale(date, 'fr', 'long');            // "15 janvier 2024"
detectLocale();                                   // Auto-detect system locale
```

### Working Hours

Business hours calculations with break support.

```ts
import { isWorkingTime, addWorkingDays, workingDaysBetween } from 'ts-time-utils/workingHours';

isWorkingTime(date, config);
addWorkingDays(date, 5, config);
workingDaysBetween(start, end, config);
```

### Serialization

Safe JSON date serialization and deserialization.

```ts
import { serializeDate, parseJSONWithDates, stringifyWithDates } from 'ts-time-utils/serialize';

serializeDate(date, { format: 'iso' });    // "2025-09-14T12:30:45.123Z"
serializeDate(date, { format: 'epoch' });  // 1757853045123

const json = stringifyWithDates(data, ['createdAt']);
const parsed = parseJSONWithDates(json, ['createdAt']);
```

### Performance

Async utilities, benchmarking, and timing.

```ts
import { sleep, benchmark, Stopwatch, debounce } from 'ts-time-utils/performance';

await sleep(1000);
await benchmark(() => heavyOperation(), 10);

const stopwatch = new Stopwatch();
stopwatch.start();
// ... operations
stopwatch.getElapsed();

const debouncedFn = debounce(fn, 300);
```

### Age

Age calculations and birthday utilities.

```ts
import { calculateAge, getLifeStage, getNextBirthday } from 'ts-time-utils/age';

calculateAge(new Date('1990-05-15'));  // { years: 34, months: 4, days: 2 }
getLifeStage(25);                      // "adult"
getNextBirthday(birthDate);            // Next birthday date
```

### Countdown

Timer and countdown utilities.

```ts
import { createCountdown, getRemainingTime, formatCountdown } from 'ts-time-utils/countdown';

const countdown = createCountdown(targetDate, {
  onTick: (remaining) => console.log(remaining.days, 'd'),
  onComplete: () => console.log('Done!'),
});
countdown.start();

getRemainingTime(targetDate);  // { days, hours, minutes, seconds }
formatCountdown(targetDate, { units: ['days', 'hours'] });  // "45d 12h"
```

### Interval

Time interval operations.

```ts
import { createInterval, intervalsOverlap, mergeIntervals } from 'ts-time-utils/interval';

const a = createInterval('2025-01-01', '2025-01-05');
const b = createInterval('2025-01-04', '2025-01-10');
intervalsOverlap(a, b);  // true
mergeIntervals([a, b]);  // Single merged interval
```

### Range Presets

Common date range presets.

```ts
import { today, lastNDays, thisWeek, thisMonth } from 'ts-time-utils/rangePresets';

today();        // { start, end } for today
lastNDays(7);   // Last 7 days
thisWeek();     // Current week
thisMonth();    // Current month
```

### Parse

Date parsing from various formats.

```ts
import { parseDate, parseTime, autoDetectFormat } from 'ts-time-utils/parse';

parseDate('Dec 25, 2025');
parseDate('25/12/2025', 'DD/MM/YYYY');
parseTime('2:30 PM');  // { hour: 14, minute: 30 }
autoDetectFormat('2025-09-14');  // 'YYYY-MM-DD'
```

---

## Plugin System

Extend ChainedDate with custom functionality.

```ts
import { chain, registerPlugin, createPlugin } from 'ts-time-utils/chain';

const businessPlugin = createPlugin('business', {
  addBusinessDays(days: number) {
    // Implementation
    return this;
  },
  isBusinessDay() {
    const day = this.toDate().getDay();
    return day !== 0 && day !== 6;
  }
});

registerPlugin(businessPlugin);

chain(new Date())
  .addBusinessDays(5)
  .isBusinessDay();  // true/false
```

---

## API Reference

For complete API documentation, see the [Playground & Docs](https://ts-time-utils.h8frad.work).

### All Modules

| Module | Description |
|--------|-------------|
| `format` | Duration formatting, time ago, date patterns |
| `calculate` | Date arithmetic, differences, period boundaries |
| `validate` | Date validation, comparisons, type checks |
| `duration` | Immutable Duration class with arithmetic |
| `chain` | Fluent chainable API |
| `timezone` | Timezone conversions, DST handling |
| `calendar` | ISO weeks, quarters, holidays, grids |
| `dateRange` | Range operations: overlap, gaps, merge |
| `recurrence` | RRULE-inspired recurring patterns |
| `cron` | Cron expression parsing and matching |
| `fiscal` | Fiscal year utilities |
| `compare` | Date sorting, grouping, statistics |
| `iterate` | Date iteration and counting |
| `naturalLanguage` | Natural language date parsing |
| `holidays` | International holiday calculations |
| `locale` | Multi-language formatting (40+ locales) |
| `workingHours` | Business hours calculations |
| `serialize` | JSON date serialization |
| `performance` | Async utilities, benchmarking |
| `age` | Age calculations, birthdays |
| `countdown` | Timer and countdown utilities |
| `interval` | Time interval operations |
| `rangePresets` | Common date range presets |
| `parse` | Date parsing from various formats |
| `plugins` | Plugin system for extensions |
| `constants` | Time constants and types |

---

## Development

```bash
npm install      # Install dependencies
npm run build    # Build both CJS and ESM
npm test         # Run tests
npm run lint     # Lint code
```

## License

MIT
