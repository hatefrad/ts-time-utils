# Migrating from Moment.js

Moment.js is in maintenance mode. Here's how to migrate to ts-time-utils.

## Why Migrate?

| Feature | Moment.js | ts-time-utils |
|---------|-----------|---------------|
| Bundle size | 300KB+ | ~2KB per module |
| Maintenance | Legacy mode | Active |
| Tree-shaking | ✗ | ✓ Full |
| Mutability | Mutable | Immutable |
| TypeScript | Partial | ✓ Full |
| Holidays | ✗ | ✓ Built-in |
| Cron | ✗ | ✓ Built-in |

## Installation

```bash
npm uninstall moment moment-timezone
npm install ts-time-utils
```

## Key Difference: Immutability

**Moment mutates:**
```ts
const m = moment();
m.add(1, 'day'); // Mutates m!
```

**ts-time-utils returns new values:**
```ts
const date = new Date();
const tomorrow = addDays(date, 1); // date unchanged
```

## Function Mapping

### Creating Dates

| Moment.js | ts-time-utils |
|-----------|---------------|
| `moment()` | `new Date()` |
| `moment('2025-01-15')` | `parseDate('2025-01-15')` |
| `moment(timestamp)` | `new Date(timestamp)` |
| `moment.utc()` | `new Date()` + timezone utils |
| `moment.invalid()` | `null` or `new Date('invalid')` |

```ts
// Moment
moment('2025-01-15');
moment.utc('2025-01-15');

// ts-time-utils
import { parseDate } from 'ts-time-utils/parse';
parseDate('2025-01-15');
```

### Formatting

| Moment.js | ts-time-utils |
|-----------|---------------|
| `.format('YYYY-MM-DD')` | `formatDate(date, 'YYYY-MM-DD')` |
| `.format('LLL')` | `formatDateLocale(date, locale)` |
| `.fromNow()` | `formatTimeAgo(date)` |
| `.toNow()` | `formatTimeAgo(date)` |
| `.calendar()` | `formatTimeAgo(date)` |

```ts
// Moment
moment(date).format('MMMM Do YYYY');
moment(date).fromNow();

// ts-time-utils
import { formatDate, formatTimeAgo } from 'ts-time-utils/format';
formatDate(date, 'MMMM Do YYYY');
formatTimeAgo(date);
```

### Arithmetic

| Moment.js | ts-time-utils |
|-----------|---------------|
| `.add(1, 'days')` | `addDays(date, 1)` |
| `.add(2, 'months')` | `addMonths(date, 2)` |
| `.add(1, 'years')` | `addYears(date, 1)` |
| `.subtract(3, 'days')` | `addDays(date, -3)` |
| `.diff(other, 'days')` | `differenceInDays(date, other)` |

```ts
// Moment (mutates!)
const m = moment(date);
m.add(5, 'days');
m.subtract(2, 'months');

// ts-time-utils (immutable)
import { addDays, addMonths } from 'ts-time-utils/calculate';
const result = addMonths(addDays(date, 5), -2);
```

### Getters/Setters

| Moment.js | ts-time-utils |
|-----------|---------------|
| `.year()` | `date.getFullYear()` |
| `.month()` | `date.getMonth()` |
| `.date()` | `date.getDate()` |
| `.day()` | `date.getDay()` |
| `.hours()` | `date.getHours()` |
| `.minutes()` | `date.getMinutes()` |

Use native Date methods - no wrapper needed.

### Comparison

| Moment.js | ts-time-utils |
|-----------|---------------|
| `.isBefore(other)` | `isBefore(date, other)` |
| `.isAfter(other)` | `isAfter(date, other)` |
| `.isSame(other)` | `isSameDay(date, other)` |
| `.isSame(other, 'month')` | `isSameMonth(date, other)` |
| `.isBetween(a, b)` | `isWithinRange(date, a, b)` |
| `.isValid()` | `isValidDate(date)` |

```ts
// Moment
moment(date).isBefore(other);
moment(date).isBetween(start, end);

// ts-time-utils
import { isBefore, isWithinRange } from 'ts-time-utils/validate';
isBefore(date, other);
isWithinRange(date, start, end);
```

### Start/End

| Moment.js | ts-time-utils |
|-----------|---------------|
| `.startOf('day')` | `startOfDay(date)` |
| `.endOf('day')` | `endOfDay(date)` |
| `.startOf('month')` | `startOfMonth(date)` |
| `.startOf('week')` | `startOfWeek(date)` |
| `.startOf('quarter')` | `startOfQuarter(date)` |

```ts
// Moment (mutates!)
moment(date).startOf('month');

// ts-time-utils (returns new Date)
import { startOfMonth } from 'ts-time-utils/calculate';
const result = startOfMonth(date);
```

### Duration

| Moment.js | ts-time-utils |
|-----------|---------------|
| `moment.duration(ms)` | `Duration.fromMilliseconds(ms)` |
| `moment.duration(2, 'hours')` | `Duration.fromHours(2)` |
| `duration.asHours()` | `duration.totalHours` |
| `duration.humanize()` | `duration.toString()` |
| `duration.add(other)` | `duration.add(other)` |

```ts
// Moment
const d = moment.duration(2, 'hours');
d.add(30, 'minutes');
d.humanize();

// ts-time-utils
import { Duration } from 'ts-time-utils/duration';
const d = Duration.fromHours(2).add(Duration.fromMinutes(30));
d.toString();
```

### Timezone (moment-timezone)

| Moment.js | ts-time-utils |
|-----------|---------------|
| `.tz('America/New_York')` | `formatInTimezone(date, tz)` |
| `.utcOffset()` | `getTimezoneOffset(date, tz)` |
| `moment.tz.names()` | `COMMON_TIMEZONES` |

```ts
// Moment-timezone
moment(date).tz('America/New_York').format();

// ts-time-utils
import { formatInTimezone } from 'ts-time-utils/timezone';
formatInTimezone(date, 'America/New_York');
```

### Locale

| Moment.js | ts-time-utils |
|-----------|---------------|
| `moment.locale('fr')` | Pass locale to function |
| `.format('LLLL')` | `formatDateLocale(date, 'fr-FR')` |

```ts
// Moment (global state)
moment.locale('fr');
moment(date).format('LLLL');

// ts-time-utils (explicit locale)
import { formatDateLocale } from 'ts-time-utils/locale';
formatDateLocale(date, 'fr-FR', { dateStyle: 'full' });
```

## Common Patterns

### Replacing `.clone()`

```ts
// Moment
const clone = original.clone();

// ts-time-utils (Dates are already values)
const clone = new Date(original);
```

### Replacing `.toDate()`

```ts
// Moment
const date = moment(str).toDate();

// ts-time-utils (already returns Date)
const date = parseDate(str);
```

### Replacing Chained Mutations

```ts
// Moment
moment()
  .add(1, 'month')
  .startOf('month')
  .add(14, 'days')
  .format('YYYY-MM-DD');

// ts-time-utils
import { addMonths, addDays, startOfMonth } from 'ts-time-utils/calculate';
import { formatDate } from 'ts-time-utils/format';

const result = formatDate(
  addDays(startOfMonth(addMonths(new Date(), 1)), 14),
  'YYYY-MM-DD'
);
```

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

getNextCronDate('0 9 * * 1-5');
```

### Working Hours

```ts
import { isWithinWorkingHours, workingDaysBetween } from 'ts-time-utils/workingHours';

isWithinWorkingHours(new Date(), config);
```

### Recurrence

```ts
import { generateRecurrenceDates } from 'ts-time-utils/recurrence';

generateRecurrenceDates({
  frequency: 'monthly',
  byMonthDay: [1, 15],
  count: 10
}, new Date());
```

### Natural Language

```ts
import { parseNaturalLanguageDate } from 'ts-time-utils/naturalLanguage';

parseNaturalLanguageDate('next Monday');
parseNaturalLanguageDate('in 3 weeks');
```

## Bundle Size Reduction

Moment.js: ~300KB (with locales)

ts-time-utils imports:
```ts
// Only what you need - about 5KB total
import { formatDate, formatTimeAgo } from 'ts-time-utils/format';
import { addDays, startOfMonth } from 'ts-time-utils/calculate';
import { parseDate } from 'ts-time-utils/parse';
```

## Gradual Migration

You can migrate incrementally:

```ts
// Keep moment for complex cases temporarily
import moment from 'moment';

// Use ts-time-utils for new code
import { addDays } from 'ts-time-utils/calculate';

// Interop
const date = addDays(new Date(), 5);
const m = moment(date); // Works fine
```
