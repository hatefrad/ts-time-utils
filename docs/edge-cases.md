# Edge Cases & Gotchas

Common pitfalls and how ts-time-utils handles them.

## Date Parsing Ambiguity

### Problem: DD/MM vs MM/DD

```ts
parseDate('01/02/2025') // January 2nd or February 1st?
```

### Solution: Use explicit formats

```ts
import { parseDateFormat } from 'ts-time-utils/parse';

// Explicit format removes ambiguity
parseDateFormat('01/02/2025', 'DD/MM/YYYY') // Feb 1st
parseDateFormat('01/02/2025', 'MM/DD/YYYY') // Jan 2nd

// ISO format is unambiguous (recommended)
parseDate('2025-02-01') // Always Feb 1st
```

---

## DST Transitions

### Problem: Missing or duplicate hours

During DST transitions:
- Spring forward: 2:00 AM → 3:00 AM (2:30 AM doesn't exist)
- Fall back: 2:00 AM occurs twice

### Detection

```ts
import { isDSTTransitionDay, getDSTTransitions } from 'ts-time-utils/timezone';

isDSTTransitionDay(new Date('2025-03-09')) // true (US spring forward)

const transitions = getDSTTransitions(2025, 'America/New_York');
// [{ date: Mar 9, type: 'spring' }, { date: Nov 2, type: 'fall' }]
```

### Safe scheduling

```ts
import { addHours } from 'ts-time-utils/calculate';

// Adding hours across DST boundary works correctly
const before = new Date('2025-03-09T01:30:00'); // 1:30 AM
const after = addHours(before, 2); // 4:30 AM (not 3:30 AM)
```

---

## Leap Year Edge Cases

### February 29th handling

```ts
import { addYears, addMonths } from 'ts-time-utils/calculate';

const leapDay = new Date('2024-02-29');

// Adding 1 year clamps to Feb 28
addYears(leapDay, 1) // 2025-02-28

// Adding 12 months also clamps
addMonths(leapDay, 12) // 2025-02-28
```

### Leap year detection

```ts
import { isLeapYear } from 'ts-time-utils/validate';

isLeapYear(2024) // true
isLeapYear(2100) // false (divisible by 100 but not 400)
isLeapYear(2000) // true (divisible by 400)
```

---

## Month Overflow

### Problem: Jan 31 + 1 month = ?

```ts
import { addMonths } from 'ts-time-utils/calculate';

const jan31 = new Date('2025-01-31');
addMonths(jan31, 1) // 2025-02-28 (clamped, not March 3)

const jan30 = new Date('2025-01-30');
addMonths(jan30, 1) // 2025-02-28 (also clamped)
```

### Behavior: Clamp to last valid day

This library clamps to the last valid day of the target month. It does NOT overflow to the next month.

---

## Timezone Gotchas

### UTC vs Local

```ts
const date = new Date('2025-01-15T12:00:00Z'); // UTC noon

// These may differ based on your local timezone
date.getHours()     // Local hours (varies)
date.getUTCHours()  // Always 12
```

### Formatting with timezone

```ts
import { formatInTimezone } from 'ts-time-utils/timezone';

const date = new Date('2025-01-15T12:00:00Z');

formatInTimezone(date, 'America/New_York') // "7:00 AM EST"
formatInTimezone(date, 'Europe/London')    // "12:00 PM GMT"
formatInTimezone(date, 'Asia/Tokyo')       // "9:00 PM JST"
```

### Common mistake: Creating dates from strings

```ts
// These create DIFFERENT dates!
new Date('2025-01-15')           // Midnight UTC
new Date('2025-01-15T00:00:00')  // Midnight LOCAL time
new Date(2025, 0, 15)            // Midnight LOCAL time
```

---

## Invalid Date Handling

### Return values

Most functions return `null` for invalid inputs:

```ts
import { parseDate } from 'ts-time-utils/parse';
import { addDays } from 'ts-time-utils/calculate';

parseDate('not-a-date')  // null
parseDate('')            // null

// Invalid Date objects
addDays(new Date('invalid'), 1) // Invalid Date (propagates)
```

### Validation first

```ts
import { isValidDate } from 'ts-time-utils/validate';

const input = parseDate(userInput);
if (!input || !isValidDate(input)) {
  throw new Error('Invalid date');
}
// Safe to use input
```

---

## Duration Precision

### Floating point in months/years

```ts
import { Duration } from 'ts-time-utils/duration';

// Month = 30.44 days average (2,629,746,000 ms)
const oneMonth = Duration.fromMonths(1);
oneMonth.toMilliseconds() // 2629746000

// Year = 365.25 days average
const oneYear = Duration.fromYears(1);
```

### For exact calculations

Use days/hours/minutes/seconds for precision:

```ts
// Exact: 30 days
Duration.fromDays(30).toMilliseconds()

// Approximate: "1 month" (varies by month)
Duration.fromMonths(1).toMilliseconds()
```

---

## Working Days & Holidays

### Holidays not auto-included

```ts
import { workingDaysBetween } from 'ts-time-utils/workingHours';
import { getHolidaysForYear } from 'ts-time-utils/holidays';

const config = {
  workingDays: [1, 2, 3, 4, 5],
  holidays: getHolidaysForYear(2025, 'US').map(h => h.date)
};

// Now holidays are excluded
workingDaysBetween(start, end, config);
```

### Weekend definition varies

```ts
// US/Europe: Sat-Sun off
const western = { workingDays: [1, 2, 3, 4, 5] };

// Middle East: Fri-Sat off
const middleEast = { workingDays: [0, 1, 2, 3, 4] };
```

---

## Recurrence Edge Cases

### "Last day of month"

```ts
import { generateRecurrenceDates } from 'ts-time-utils/recurrence';

// Monthly on the 31st
const pattern = {
  frequency: 'monthly',
  byMonthDay: [31],
  count: 3
};

// Skips months without 31 days
// Jan 31, Mar 31, May 31 (not Feb, Apr, Jun)
```

### Use negative day for "last day"

```ts
const pattern = {
  frequency: 'monthly',
  byMonthDay: [-1], // Last day of each month
  count: 3
};
// Jan 31, Feb 28, Mar 31
```

---

## Cron Expression Limits

### Day-of-week numbering

```ts
import { parseCron } from 'ts-time-utils/cron';

// Sunday = 0 or 7 (both work)
parseCron('0 9 * * 0')  // Sunday at 9am
parseCron('0 9 * * 7')  // Also Sunday at 9am

// Monday = 1
parseCron('0 9 * * 1')  // Monday at 9am
```

### No seconds field

Standard 5-field format only:
```
minute hour dayOfMonth month dayOfWeek
```

---

## Historical Date Limitations

### Pre-1900 dates

Some functions assume Gregorian calendar throughout. Historical dates before 1582 (Julian calendar) may be inaccurate.

```ts
// Risky: historical calculations
addDays(new Date('1500-01-01'), 100) // May be inaccurate

// Safe: modern dates
addDays(new Date('2025-01-01'), 100) // Accurate
```

---

## Empty Arrays

### Grouping/comparison functions

```ts
import { sortDatesAsc, getMinDate, groupDatesByMonth } from 'ts-time-utils/compare';

sortDatesAsc([])      // []
getMinDate([])        // null
groupDatesByMonth([]) // {}
```

All functions handle empty arrays gracefully.
