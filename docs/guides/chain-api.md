# Chain API

Fluent interface for date operations, similar to day.js/moment.js syntax.

## Installation

```ts
// Import the chain function
import { chain } from 'ts-time-utils/chain';

// Or from main package
import { chain } from 'ts-time-utils';
```

## Basic Usage

```ts
import { chain } from 'ts-time-utils/chain';

// Create from Date, string, timestamp, or nothing (now)
chain(new Date())
chain('2025-01-15')
chain(1705276800000)
chain() // now

// Chain operations
const formatted = chain(new Date())
  .add(1, 'day')
  .startOf('month')
  .format('YYYY-MM-DD');
```

## API Reference

### Transformations

All transformations return a new `ChainedDate` (immutable).

```ts
chain(date).add(1, 'day')         // add time
chain(date).subtract(1, 'week')   // subtract time
chain(date).startOf('month')      // start of period
chain(date).endOf('day')          // end of period
chain(date).set({ year: 2030 })   // set components
chain(date).clone()               // explicit clone
```

**Units for add/subtract:**
`milliseconds` | `seconds` | `minutes` | `hours` | `days` | `weeks` | `months` | `years`

**Units for startOf/endOf:**
`minute` | `hour` | `day` | `week` | `month` | `year`

### Formatting

```ts
chain(date).format('YYYY-MM-DD')     // "2025-01-15"
chain(date).format('MMM D, YYYY')    // "Jan 15, 2025"
chain(date).formatTime('12h')        // "2:30 PM"
chain(date).formatTime('24h')        // "14:30"
chain(date).calendar()               // "Tomorrow" / "Yesterday" / "Monday"
chain(date).ago()                    // "3 hours ago"
chain(date).toISOString()            // ISO 8601 string
chain(date).dayOrdinal()             // "15th"
```

### Comparisons

```ts
chain(date).isValid()
chain(date).isToday()
chain(date).isYesterday()
chain(date).isTomorrow()
chain(date).isPast()
chain(date).isFuture()
chain(date).isWeekend()
chain(date).isWeekday()
chain(date).isThisWeek()
chain(date).isThisMonth()
chain(date).isThisYear()
chain(date).isLeapYear()
chain(date).isBusinessDay(holidays?)

// Compare with other dates
chain(date).isSameDay(other)
chain(date).isSameWeek(other)
chain(date).isSameMonth(other)
chain(date).isSameYear(other)
chain(date).isBefore(other)
chain(date).isAfter(other)
chain(date).isBetween(start, end, inclusive?)
```

### Getters

```ts
chain(date).year()          // 2025
chain(date).month()         // 1-12
chain(date).day()           // 1-31
chain(date).weekday()       // 0-6 (0=Sunday)
chain(date).hours()         // 0-23
chain(date).minutes()       // 0-59
chain(date).seconds()       // 0-59
chain(date).milliseconds()  // 0-999
chain(date).dayOfYear()     // 1-366
chain(date).week()          // ISO week 1-53
chain(date).quarter()       // 1-4
chain(date).daysInMonth()   // 28-31
```

### Difference

```ts
chain(a).diff(b)                    // milliseconds
chain(a).diff(b, 'days')            // 10
chain(a).diff(b, 'days', true)      // 10.5 (precise)

// Format the difference
import { formatMs } from 'ts-time-utils/chain';
formatMs(chain(a).diff(b))          // "2 days, 3 hours"
```

### Conversions

```ts
chain(date).toDate()       // Date object
chain(date).valueOf()      // timestamp (ms)
chain(date).unix()         // unix timestamp (seconds)
chain(date).toArray()      // [year, month, day, hours, minutes, seconds, ms]
chain(date).toObject()     // { year, month, day, hours, minutes, seconds, milliseconds }
```

## Examples

### Add business days

```ts
function addBusinessDays(date: Date, days: number): Date {
  let c = chain(date);
  let added = 0;

  while (added < days) {
    c = c.add(1, 'day');
    if (c.isWeekday()) added++;
  }

  return c.toDate();
}
```

### Get month boundaries

```ts
const monthStart = chain(new Date()).startOf('month');
const monthEnd = chain(new Date()).endOf('month');

console.log(`Month: ${monthStart.format('MMM D')} - ${monthEnd.format('MMM D')}`);
```

### Date comparisons

```ts
const deadline = chain('2025-03-01');

if (chain().isAfter(deadline.toDate())) {
  console.log('Deadline passed!');
} else {
  console.log(`Days remaining: ${Math.floor(chain().diff(deadline.toDate(), 'days'))}`);
}
```

### Format date ranges

```ts
const start = chain(new Date()).startOf('week');
const end = start.add(6, 'days');

console.log(`${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`);
```

## Immutability

All operations are immutable. The original date and ChainedDate are never modified:

```ts
const original = new Date(2025, 0, 15);
const c = chain(original);
const c2 = c.add(1, 'day');

console.log(c.day());   // 15 (unchanged)
console.log(c2.day());  // 16 (new instance)
console.log(original.getDate()); // 15 (unchanged)
```

## Tree-shaking

Import from `ts-time-utils/chain` for optimal bundle size:

```ts
// Good - only imports chain module
import { chain } from 'ts-time-utils/chain';

// Less optimal - imports everything
import { chain } from 'ts-time-utils';
```

## Comparison with day.js

| day.js | ts-time-utils |
|--------|---------------|
| `dayjs()` | `chain()` |
| `dayjs().add(1, 'day')` | `chain().add(1, 'day')` |
| `dayjs().format('YYYY')` | `chain().format('YYYY')` |
| `dayjs().startOf('month')` | `chain().startOf('month')` |
| `dayjs().diff(other, 'days')` | `chain().diff(other, 'days')` |
| `dayjs().isSame(other, 'day')` | `chain().isSameDay(other)` |
| `dayjs().toDate()` | `chain().toDate()` |
| `dayjs().valueOf()` | `chain().valueOf()` |

Key differences:
- ts-time-utils `chain()` returns `ChainedDate` class
- `month()` returns 1-12 (not 0-11)
- No plugin system (all features built-in)
- Delegates to optimized standalone functions
