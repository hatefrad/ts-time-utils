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
| `formatDistance(date, base)` | `timeAgo(date)` |
| `formatDuration({ hours: 2 })` | `formatDuration(7200000)` |
| `formatRelative(date, base)` | `timeAgo(date)` |

```ts
// date-fns
import { format, formatDistance } from 'date-fns';
format(new Date(), 'yyyy-MM-dd');
formatDistance(date, new Date());

// ts-time-utils
import { formatDate, timeAgo } from 'ts-time-utils/format';
formatDate(new Date(), 'YYYY-MM-DD');
timeAgo(date);
```

### Parsing

| date-fns | ts-time-utils |
|----------|---------------|
| `parse(str, 'yyyy-MM-dd', new Date())` | `parseCustomFormat(str, 'YYYY-MM-DD')` |
| `parseISO(str)` | `parseDate(str)` |
| `isValid(date)` | `isValidDate(date)` |

```ts
// date-fns
import { parse, parseISO, isValid } from 'date-fns';
parse('2025-01-15', 'yyyy-MM-dd', new Date());
parseISO('2025-01-15T12:00:00Z');

// ts-time-utils
import { parseCustomFormat, parseDate } from 'ts-time-utils/parse';
import { isValidDate } from 'ts-time-utils/validate';
parseCustomFormat('2025-01-15', 'YYYY-MM-DD');
parseDate('2025-01-15T12:00:00Z');
```

### Arithmetic

| date-fns | ts-time-utils |
|----------|---------------|
| `addDays(date, 5)` | `addTime(date, 5, 'days')` |
| `addMonths(date, 2)` | `addTime(date, 2, 'months')` |
| `addYears(date, 1)` | `addTime(date, 1, 'years')` |
| `subDays(date, 5)` | `subtractTime(date, 5, 'days')` |
| `differenceInDays(a, b)` | `differenceInUnits(a, b, 'days')` |
| `differenceInMonths(a, b)` | `differenceInUnits(a, b, 'months')` |

```ts
// date-fns
import { addDays, subDays, differenceInDays } from 'date-fns';
addDays(date, 5);
subDays(date, 3);
differenceInDays(end, start);

// ts-time-utils
import { addTime, subtractTime, differenceInUnits } from 'ts-time-utils/calculate';
addTime(date, 5, 'days');
subtractTime(date, 3, 'days');
differenceInUnits(end, start, 'days');
```

### Comparison

| date-fns | ts-time-utils |
|----------|---------------|
| `isBefore(a, b)` | `a.getTime() < b.getTime()` |
| `isAfter(a, b)` | `a.getTime() > b.getTime()` |
| `isEqual(a, b)` | `a.getTime() === b.getTime()` |
| `isSameDay(a, b)` | `isSameDay(a, b)` |
| `isSameMonth(a, b)` | `isSameMonth(a, b)` |
| `isToday(date)` | `isToday(date)` |
| `isFuture(date)` | `isFuture(date)` |
| `isPast(date)` | `isPast(date)` |

```ts
// date-fns
import { isBefore, isAfter, isToday, isFuture } from 'date-fns';

// ts-time-utils
import { isToday, isFuture, isPast } from 'ts-time-utils/validate';
const date1 = new Date();
const date2 = new Date(Date.now() + 1000);
const isEarlier = date1.getTime() < date2.getTime();
const isLater = date1.getTime() > date2.getTime();
isToday(date);
isFuture(date);
isPast(date);
```

### Start/End of Period

| date-fns | ts-time-utils |
|----------|---------------|
| `startOfDay(date)` | `startOf(date, 'day')` |
| `endOfDay(date)` | `endOf(date, 'day')` |
| `startOfWeek(date)` | `startOf(date, 'week')` |
| `startOfMonth(date)` | `startOf(date, 'month')` |
| `startOfYear(date)` | `startOf(date, 'year')` |

```ts
// date-fns
import { startOfDay, endOfDay, startOfMonth } from 'date-fns';

// ts-time-utils
import { startOf, endOf } from 'ts-time-utils/calculate';
startOf(new Date(), 'day');
endOf(new Date(), 'day');
```

### Intervals

| date-fns | ts-time-utils |
|----------|---------------|
| `eachDayOfInterval({ start, end })` | `splitIntervalByDay(createInterval(start, end)!)` |
| `areIntervalsOverlapping(a, b)` | `intervalsOverlap(a, b)` |
| `mergeIntervals(intervals)` | `mergeIntervals(intervals)` |

```ts
// date-fns
import { eachDayOfInterval } from 'date-fns';
eachDayOfInterval({ start, end });

// ts-time-utils
import { createInterval, splitIntervalByDay } from 'ts-time-utils/interval';
const parts = splitIntervalByDay(createInterval(start, end)!);
```

### Calendar

| date-fns | ts-time-utils |
|----------|---------------|
| `getISOWeek(date)` | `getWeekNumber(date)` |
| `getQuarter(date)` | `getQuarter(date)` |
| `getDaysInMonth(date)` | `getDaysInMonth(date)` |
| `isLeapYear(date)` | `isLeapYear(date.getFullYear())` |

```ts
// date-fns
import { getISOWeek, getQuarter, isLeapYear } from 'date-fns';

// ts-time-utils
import { getWeekNumber, getQuarter, getDaysInMonth } from 'ts-time-utils/calendar';
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
import { getHolidays, isHoliday } from 'ts-time-utils/holidays';

getHolidays(2025, 'US');
isHoliday(new Date(), 'UK');
```

### Fiscal Years

```ts
import { getFiscalYear } from 'ts-time-utils/fiscal';

getFiscalYear(new Date(), { startMonth: 4 });
```

### Cron

```ts
import { getNextCronDate } from 'ts-time-utils/cron';

getNextCronDate('0 9 * * 1-5'); // Next weekday 9am
```

### Working Hours

```ts
import { isWorkingTime } from 'ts-time-utils/workingHours';

isWorkingTime(new Date(), {
  workingDays: [1, 2, 3, 4, 5],
  hours: { start: 9, end: 17 }
});
```

### Recurrence

```ts
import { createRecurrence } from 'ts-time-utils/recurrence';

createRecurrence({
  frequency: 'weekly',
  startDate: new Date(),
  byWeekday: [1, 3, 5]
}).getAllOccurrences(10);
```
