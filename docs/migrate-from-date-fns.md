# Migrating from date-fns

Function mapping from date-fns to ts-time-utils.

## Why Migrate?

| Feature | date-fns | ts-time-utils |
|---------|----------|---------------|
| Tree-shaking | ✓ | ✓ |
| Zero deps | ✓ | ✓ |
| Holidays | ✗ (external) | ✓ Built-in (9 countries) |
| Fiscal years | ✗ | ✓ Built-in |
| Cron support | ✗ | ✓ Built-in |
| Recurrence | ✗ (external) | ✓ Built-in |
| Working hours | ✗ | ✓ Built-in |

## Installation

```bash
npm uninstall date-fns
npm install ts-time-utils
```

## Function Mapping

### Formatting

| date-fns | ts-time-utils |
|----------|---------------|
| `format(date, 'yyyy-MM-dd')` | `formatDate(date, 'YYYY-MM-DD')` |
| `formatDistance(date, base)` | `formatTimeAgo(date)` |
| `formatDuration({ hours: 2 })` | `formatDuration(7200000)` |
| `formatRelative(date, base)` | `formatTimeAgo(date)` |

```ts
// date-fns
import { format, formatDistance } from 'date-fns';
format(new Date(), 'yyyy-MM-dd');
formatDistance(date, new Date());

// ts-time-utils
import { formatDate, formatTimeAgo } from 'ts-time-utils/format';
formatDate(new Date(), 'YYYY-MM-DD');
formatTimeAgo(date);
```

### Parsing

| date-fns | ts-time-utils |
|----------|---------------|
| `parse(str, 'yyyy-MM-dd', new Date())` | `parseDateFormat(str, 'YYYY-MM-DD')` |
| `parseISO(str)` | `parseDate(str)` |
| `isValid(date)` | `isValidDate(date)` |

```ts
// date-fns
import { parse, parseISO, isValid } from 'date-fns';
parse('2025-01-15', 'yyyy-MM-dd', new Date());
parseISO('2025-01-15T12:00:00Z');

// ts-time-utils
import { parseDateFormat, parseDate } from 'ts-time-utils/parse';
import { isValidDate } from 'ts-time-utils/validate';
parseDateFormat('2025-01-15', 'YYYY-MM-DD');
parseDate('2025-01-15T12:00:00Z');
```

### Arithmetic

| date-fns | ts-time-utils |
|----------|---------------|
| `addDays(date, 5)` | `addDays(date, 5)` |
| `addMonths(date, 2)` | `addMonths(date, 2)` |
| `addYears(date, 1)` | `addYears(date, 1)` |
| `subDays(date, 5)` | `addDays(date, -5)` |
| `differenceInDays(a, b)` | `differenceInDays(a, b)` |
| `differenceInMonths(a, b)` | `differenceInMonths(a, b)` |

```ts
// date-fns
import { addDays, subDays, differenceInDays } from 'date-fns';
addDays(date, 5);
subDays(date, 3);
differenceInDays(end, start);

// ts-time-utils
import { addDays, differenceInDays } from 'ts-time-utils/calculate';
addDays(date, 5);
addDays(date, -3); // subtract
differenceInDays(end, start);
```

### Comparison

| date-fns | ts-time-utils |
|----------|---------------|
| `isBefore(a, b)` | `isBefore(a, b)` |
| `isAfter(a, b)` | `isAfter(a, b)` |
| `isEqual(a, b)` | `isSameDay(a, b)` |
| `isSameDay(a, b)` | `isSameDay(a, b)` |
| `isSameMonth(a, b)` | `isSameMonth(a, b)` |
| `isToday(date)` | `isToday(date)` |
| `isFuture(date)` | `isFutureDate(date)` |
| `isPast(date)` | `isPastDate(date)` |

```ts
// date-fns
import { isBefore, isAfter, isToday, isFuture } from 'date-fns';

// ts-time-utils
import { isBefore, isAfter, isToday, isFutureDate } from 'ts-time-utils/validate';
```

### Start/End of Period

| date-fns | ts-time-utils |
|----------|---------------|
| `startOfDay(date)` | `startOfDay(date)` |
| `endOfDay(date)` | `endOfDay(date)` |
| `startOfWeek(date)` | `startOfWeek(date)` |
| `startOfMonth(date)` | `startOfMonth(date)` |
| `startOfYear(date)` | `startOfYear(date)` |

```ts
// date-fns
import { startOfDay, endOfDay, startOfMonth } from 'date-fns';

// ts-time-utils
import { startOfDay, endOfDay, startOfMonth } from 'ts-time-utils/calculate';
```

### Intervals

| date-fns | ts-time-utils |
|----------|---------------|
| `eachDayOfInterval({ start, end })` | `iterateDays(start, end)` |
| `eachWeekOfInterval({ start, end })` | `iterateWeeks(start, end)` |
| `eachMonthOfInterval({ start, end })` | `iterateMonths(start, end)` |
| `areIntervalsOverlapping(a, b)` | `rangesOverlap(a, b)` |

```ts
// date-fns
import { eachDayOfInterval } from 'date-fns';
eachDayOfInterval({ start, end });

// ts-time-utils
import { iterateDays } from 'ts-time-utils/iterate';
[...iterateDays(start, end)]; // Returns generator
```

### Calendar

| date-fns | ts-time-utils |
|----------|---------------|
| `getISOWeek(date)` | `getISOWeek(date)` |
| `getQuarter(date)` | `getQuarter(date)` |
| `getDaysInMonth(date)` | `getDaysInMonth(date)` |
| `isLeapYear(date)` | `isLeapYear(date.getFullYear())` |

```ts
// date-fns
import { getISOWeek, getQuarter, isLeapYear } from 'date-fns';

// ts-time-utils
import { getISOWeek, getQuarter } from 'ts-time-utils/calendar';
import { isLeapYear } from 'ts-time-utils/validate';
```

## Format String Differences

| date-fns | ts-time-utils | Meaning |
|----------|---------------|---------|
| `yyyy` | `YYYY` | 4-digit year |
| `yy` | `YY` | 2-digit year |
| `MM` | `MM` | Month (01-12) |
| `dd` | `DD` | Day (01-31) |
| `HH` | `HH` | Hour 24h (00-23) |
| `hh` | `hh` | Hour 12h (01-12) |
| `mm` | `mm` | Minutes (00-59) |
| `ss` | `ss` | Seconds (00-59) |

## Features Only in ts-time-utils

### Holidays

```ts
import { getHolidaysForYear, isHoliday } from 'ts-time-utils/holidays';

getHolidaysForYear(2025, 'US');
isHoliday(new Date(), 'UK');
```

### Fiscal Years

```ts
import { getFiscalYear, FISCAL_PRESETS } from 'ts-time-utils/fiscal';

getFiscalYear(new Date(), FISCAL_PRESETS.UK);
```

### Cron

```ts
import { parseCron, getNextCronDate } from 'ts-time-utils/cron';

getNextCronDate('0 9 * * 1-5'); // Next weekday 9am
```

### Working Hours

```ts
import { isWithinWorkingHours } from 'ts-time-utils/workingHours';

isWithinWorkingHours(new Date(), {
  workingDays: [1, 2, 3, 4, 5],
  startTime: { hour: 9, minute: 0 },
  endTime: { hour: 17, minute: 0 }
});
```

### Recurrence

```ts
import { generateRecurrenceDates } from 'ts-time-utils/recurrence';

generateRecurrenceDates({
  frequency: 'weekly',
  byWeekday: ['MO', 'WE', 'FR'],
  count: 10
}, new Date());
```
