# Migrating from Day.js

Converting from Day.js chained API to ts-time-utils functions.

## Why Migrate?

| Feature | Day.js | ts-time-utils |
|---------|--------|---------------|
| Bundle size | 2KB core | ~2KB per module |
| Tree-shaking | Partial (plugins) | ✓ Full |
| Holidays | ✗ | ✓ Built-in (9 countries) |
| Fiscal years | ✗ | ✓ Built-in |
| Cron support | ✗ | ✓ Built-in |
| Recurrence | ✗ | ✓ Built-in |
| Zero deps | ✓ | ✓ |

## Installation

```bash
npm uninstall dayjs
npm install ts-time-utils
```

## API Style Difference

Day.js uses method chaining:
```ts
dayjs('2025-01-15').add(1, 'day').format('YYYY-MM-DD')
```

ts-time-utils uses pure functions:
```ts
formatDate(addTime(parseDate('2025-01-15'), 1, 'days'), 'YYYY-MM-DD')
```

## Function Mapping

### Creating Dates

| Day.js | ts-time-utils |
|--------|---------------|
| `dayjs()` | `new Date()` |
| `dayjs('2025-01-15')` | `parseDate('2025-01-15')` |
| `dayjs(timestamp)` | `new Date(timestamp)` |
| `dayjs.utc()` | `new Date()` (use timezone utils) |

```ts
// Day.js
import dayjs from 'dayjs';
dayjs('2025-01-15');

// ts-time-utils
import { parseDate } from 'ts-time-utils/parse';
parseDate('2025-01-15');
```

### Formatting

| Day.js | ts-time-utils |
|--------|---------------|
| `.format('YYYY-MM-DD')` | `formatDate(date, 'YYYY-MM-DD')` |
| `.format('HH:mm:ss')` | `formatDate(date, 'HH:mm:ss')` |
| `.fromNow()` | `timeAgo(date)` |
| `.toNow()` | `timeAgo(date)` |

```ts
// Day.js
dayjs(date).format('YYYY-MM-DD');
dayjs(date).fromNow();

// ts-time-utils
import { formatDate, timeAgo } from 'ts-time-utils/format';
formatDate(date, 'YYYY-MM-DD');
timeAgo(date);
```

### Arithmetic

| Day.js | ts-time-utils |
|--------|---------------|
| `.add(1, 'day')` | `addTime(date, 1, 'days')` |
| `.add(2, 'month')` | `addTime(date, 2, 'months')` |
| `.add(1, 'year')` | `addTime(date, 1, 'years')` |
| `.subtract(3, 'day')` | `subtractTime(date, 3, 'days')` |
| `.diff(other, 'day')` | `differenceInUnits(date, other, 'days')` |

```ts
// Day.js
dayjs(date).add(5, 'day').subtract(2, 'month');

// ts-time-utils
import { addTime, subtractTime } from 'ts-time-utils/calculate';
subtractTime(addTime(date, 5, 'days'), 2, 'months');
```

### Getters

| Day.js | ts-time-utils |
|--------|---------------|
| `.year()` | `date.getFullYear()` |
| `.month()` | `date.getMonth()` |
| `.date()` | `date.getDate()` |
| `.day()` | `date.getDay()` |
| `.hour()` | `date.getHours()` |
| `.minute()` | `date.getMinutes()` |
| `.second()` | `date.getSeconds()` |

Native Date methods work directly.

### Comparison

| Day.js | ts-time-utils |
|--------|---------------|
| `.isBefore(other)` | `date.getTime() < other.getTime()` |
| `.isAfter(other)` | `date.getTime() > other.getTime()` |
| `.isSame(other)` | `isSameDay(date, other)` |
| `.isSame(other, 'month')` | `isSameMonth(date, other)` |
| `.isValid()` | `isValidDate(date)` |

```ts
// Day.js
dayjs(date).isBefore(other);
dayjs(date).isSame(other, 'month');

// ts-time-utils
import { isSameMonth } from 'ts-time-utils/validate';
date.getTime() < other.getTime();
isSameMonth(date, other);
```

### Start/End

| Day.js | ts-time-utils |
|--------|---------------|
| `.startOf('day')` | `startOf(date, 'day')` |
| `.endOf('day')` | `endOf(date, 'day')` |
| `.startOf('month')` | `startOf(date, 'month')` |
| `.startOf('week')` | `startOf(date, 'week')` |

```ts
// Day.js
dayjs(date).startOf('month').endOf('day');

// ts-time-utils
import { startOf, endOf } from 'ts-time-utils/calculate';
endOf(startOf(date, 'month'), 'day');
```

### Duration Plugin

| Day.js | ts-time-utils |
|--------|---------------|
| `dayjs.duration(ms)` | `Duration.fromMilliseconds(ms)` |
| `duration.hours()` | `duration.hours` |
| `duration.humanize()` | `duration.toString()` |
| `duration.add(other)` | `duration.add(other)` |

```ts
// Day.js (with plugin)
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
dayjs.duration(3600000).humanize();

// ts-time-utils
import { Duration } from 'ts-time-utils/duration';
Duration.fromMilliseconds(3600000).toString();
```

### Timezone Plugin

| Day.js | ts-time-utils |
|--------|---------------|
| `.tz('America/New_York')` | `formatInTimeZone(date, 'America/New_York')` |
| `.utcOffset()` | `getTimezoneOffset(timezone, date)` |

```ts
// Day.js (with plugin)
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs(date).tz('America/New_York').format();

// ts-time-utils
import { formatInTimeZone } from 'ts-time-utils/timezone';
formatInTimeZone(date, 'America/New_York');
```

## Chaining Equivalent

For complex chains, compose functions:

```ts
// Day.js
dayjs('2025-01-15')
  .add(1, 'month')
  .startOf('week')
  .format('YYYY-MM-DD');

// ts-time-utils
import { parseDate } from 'ts-time-utils/parse';
import { addTime, startOf } from 'ts-time-utils/calculate';
import { formatDate } from 'ts-time-utils/format';

const date = parseDate('2025-01-15');
const result = formatDate(startOf(addTime(date!, 1, 'months'), 'week'), 'YYYY-MM-DD');

// Or with pipe helper
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const transform = pipe(
  d => addTime(d, 1, 'months'),
  d => startOf(d, 'week'),
  d => formatDate(d, 'YYYY-MM-DD')
);
transform(parseDate('2025-01-15'));
```

## Features Only in ts-time-utils

### Holidays (no Day.js equivalent)

```ts
import { getHolidays, isHoliday } from 'ts-time-utils/holidays';

getHolidays(2025, 'US');
isHoliday(new Date(), 'UK');
```

### Fiscal Years

```ts
import { getFiscalYear } from 'ts-time-utils/fiscal';

getFiscalYear(new Date(), { startMonth: 7 });
```

### Cron

```ts
import { parseCronExpression, getNextCronDate } from 'ts-time-utils/cron';

getNextCronDate('0 9 * * 1-5');
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
  byWeekday: [1, 3]
}).getAllOccurrences(10);
```

### Natural Language

```ts
import { parseNaturalDate } from 'ts-time-utils/naturalLanguage';

parseNaturalDate('next Friday');
parseNaturalDate('in 2 weeks');
```
