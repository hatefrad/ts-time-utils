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
formatDate(addDays(parseDate('2025-01-15'), 1), 'YYYY-MM-DD')
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
| `.fromNow()` | `formatTimeAgo(date)` |
| `.toNow()` | `formatTimeAgo(date)` |

```ts
// Day.js
dayjs(date).format('YYYY-MM-DD');
dayjs(date).fromNow();

// ts-time-utils
import { formatDate, formatTimeAgo } from 'ts-time-utils/format';
formatDate(date, 'YYYY-MM-DD');
formatTimeAgo(date);
```

### Arithmetic

| Day.js | ts-time-utils |
|--------|---------------|
| `.add(1, 'day')` | `addDays(date, 1)` |
| `.add(2, 'month')` | `addMonths(date, 2)` |
| `.add(1, 'year')` | `addYears(date, 1)` |
| `.subtract(3, 'day')` | `addDays(date, -3)` |
| `.diff(other, 'day')` | `differenceInDays(date, other)` |

```ts
// Day.js
dayjs(date).add(5, 'day').subtract(2, 'month');

// ts-time-utils
import { addDays, addMonths } from 'ts-time-utils/calculate';
addMonths(addDays(date, 5), -2);
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
| `.isBefore(other)` | `isBefore(date, other)` |
| `.isAfter(other)` | `isAfter(date, other)` |
| `.isSame(other)` | `isSameDay(date, other)` |
| `.isSame(other, 'month')` | `isSameMonth(date, other)` |
| `.isValid()` | `isValidDate(date)` |

```ts
// Day.js
dayjs(date).isBefore(other);
dayjs(date).isSame(other, 'month');

// ts-time-utils
import { isBefore, isSameMonth } from 'ts-time-utils/validate';
isBefore(date, other);
isSameMonth(date, other);
```

### Start/End

| Day.js | ts-time-utils |
|--------|---------------|
| `.startOf('day')` | `startOfDay(date)` |
| `.endOf('day')` | `endOfDay(date)` |
| `.startOf('month')` | `startOfMonth(date)` |
| `.startOf('week')` | `startOfWeek(date)` |

```ts
// Day.js
dayjs(date).startOf('month').endOf('day');

// ts-time-utils
import { startOfMonth, endOfDay } from 'ts-time-utils/calculate';
endOfDay(startOfMonth(date));
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
| `.tz('America/New_York')` | `formatInTimezone(date, 'America/New_York')` |
| `.utcOffset()` | `getTimezoneOffset(date, timezone)` |

```ts
// Day.js (with plugin)
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs(date).tz('America/New_York').format();

// ts-time-utils
import { formatInTimezone } from 'ts-time-utils/timezone';
formatInTimezone(date, 'America/New_York');
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
import { addMonths, startOfWeek } from 'ts-time-utils/calculate';
import { formatDate } from 'ts-time-utils/format';

const date = parseDate('2025-01-15');
const result = formatDate(startOfWeek(addMonths(date!, 1)), 'YYYY-MM-DD');

// Or with pipe helper
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const transform = pipe(
  d => addMonths(d, 1),
  startOfWeek,
  d => formatDate(d, 'YYYY-MM-DD')
);
transform(parseDate('2025-01-15'));
```

## Features Only in ts-time-utils

### Holidays (no Day.js equivalent)

```ts
import { getHolidaysForYear, isHoliday } from 'ts-time-utils/holidays';

getHolidaysForYear(2025, 'US');
isHoliday(new Date(), 'UK');
```

### Fiscal Years

```ts
import { getFiscalYear, FISCAL_PRESETS } from 'ts-time-utils/fiscal';

getFiscalYear(new Date(), FISCAL_PRESETS.AUSTRALIA);
```

### Cron

```ts
import { parseCron, getNextCronDate } from 'ts-time-utils/cron';

getNextCronDate('0 9 * * 1-5');
```

### Working Hours

```ts
import { isWithinWorkingHours } from 'ts-time-utils/workingHours';

isWithinWorkingHours(new Date(), config);
```

### Recurrence

```ts
import { generateRecurrenceDates } from 'ts-time-utils/recurrence';

generateRecurrenceDates({
  frequency: 'weekly',
  byWeekday: ['MO', 'WE'],
  count: 10
}, new Date());
```

### Natural Language

```ts
import { parseNaturalLanguageDate } from 'ts-time-utils/naturalLanguage';

parseNaturalLanguageDate('next Friday');
parseNaturalLanguageDate('in 2 weeks');
```
