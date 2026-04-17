# Node.js Integration Guide

## Installation

```bash
npm install ts-time-utils
```

## Express Middleware

### Request Timing

```ts
import { Request, Response, NextFunction } from 'express';
import { Stopwatch } from 'ts-time-utils/performance';
import { formatDuration } from 'ts-time-utils/format';

function requestTiming(req: Request, res: Response, next: NextFunction) {
  const stopwatch = new Stopwatch();
  stopwatch.start();

  res.on('finish', () => {
    const elapsed = stopwatch.stop();
    console.log(`${req.method} ${req.path} - ${formatDuration(elapsed)}`);
  });

  next();
}

app.use(requestTiming);
```

### Business Hours Validation

Reject requests outside business hours:

```ts
import { Request, Response, NextFunction } from 'express';
import { isWorkingTime } from 'ts-time-utils/workingHours';

const config = {
  workingDays: [1, 2, 3, 4, 5],
  hours: { start: 9, end: 17 },
  breaks: [{ start: 12, end: 13 }]
};

function businessHoursOnly(req: Request, res: Response, next: NextFunction) {
  if (!isWorkingTime(new Date(), config)) {
    return res.status(503).json({
      error: 'Service available Mon-Fri 9am-5pm'
    });
  }
  next();
}

app.use('/api/support', businessHoursOnly);
```

### Holiday-Aware Scheduling

```ts
import { isHoliday } from 'ts-time-utils/holidays';

function noHolidayProcessing(req: Request, res: Response, next: NextFunction) {
  if (isHoliday(new Date(), 'US')) {
    return res.status(503).json({
      error: 'Processing paused for holiday'
    });
  }
  next();
}
```

## Scheduling Patterns

### Cron Job Validation

```ts
import { parseCronExpression, matchesCron, getNextCronDate } from 'ts-time-utils/cron';

function scheduleJob(cronExpression: string, callback: () => void) {
  const parsed = parseCronExpression(cronExpression);
  if (!parsed) throw new Error('Invalid cron expression');

  const checkAndRun = () => {
    if (matchesCron(new Date(), cronExpression)) {
      callback();
    }
  };

  // Check every minute
  setInterval(checkAndRun, 60000);

  const next = getNextCronDate(cronExpression);
  console.log(`Next run: ${next?.toISOString()}`);
}

// Run every weekday at 9am
scheduleJob('0 9 * * 1-5', () => {
  console.log('Daily report generated');
});
```

### Recurrence Patterns

```ts
import { createRecurrence } from 'ts-time-utils/recurrence';

// Generate next 10 occurrences of weekly meeting
const meetings = createRecurrence({
  frequency: 'weekly',
  interval: 1,
  startDate: new Date(),
  byWeekday: [2, 4]
}).getAllOccurrences(10);

console.log('Upcoming meetings:', meetings.map(d => d.toISOString()));
```

## API Response Formatting

### Date Serialization

```ts
import { serializeDate } from 'ts-time-utils/serialize';

// Consistent ISO format
app.get('/api/events', (req, res) => {
  const events = [
    { name: 'Meeting', date: new Date() }
  ];

  // Explicit date serialization
  res.json(events.map(event => ({
    ...event,
    date: serializeDate(event.date)
  })));
});
```

### Relative Time in Responses

```ts
import { timeAgo } from 'ts-time-utils/format';

app.get('/api/posts', async (req, res) => {
  const posts = await getPosts();

  res.json(posts.map(post => ({
    ...post,
    createdAtRelative: timeAgo(post.createdAt)
  })));
});
```

## Database Patterns

### Fiscal Year Queries

```ts
import { getFiscalYear, getFiscalQuarter } from 'ts-time-utils/fiscal';

async function getQuarterlyRevenue(date: Date) {
  const fiscalYear = getFiscalYear(date, { startMonth: 10 });
  const quarter = getFiscalQuarter(date, { startMonth: 10 });

  return db.query(`
    SELECT SUM(amount) as revenue
    FROM transactions
    WHERE fiscal_year = $1 AND fiscal_quarter = $2
  `, [fiscalYear, quarter]);
}
```

### Working Days Calculation

```ts
import { workingDaysBetween, addWorkingDays } from 'ts-time-utils/workingHours';

function calculateDeliveryDate(orderDate: Date, processingDays: number) {
  const config = {
    workingDays: [1, 2, 3, 4, 5],
    hours: { start: 9, end: 17 }
  };
  return addWorkingDays(orderDate, processingDays, config);
}

function getBusinessDaysRemaining(deadline: Date) {
  const config = {
    workingDays: [1, 2, 3, 4, 5],
    hours: { start: 9, end: 17 }
  };
  return workingDaysBetween(new Date(), deadline, config);
}
```

## Validation Utilities

### API Input Validation

```ts
import { parseDate } from 'ts-time-utils/parse';
import { isValidDate, isFuture } from 'ts-time-utils/validate';

function validateDateInput(input: unknown): Date | null {
  if (typeof input !== 'string') return null;

  const date = parseDate(input);
  if (!date || !isValidDate(date)) return null;

  return date;
}

app.post('/api/bookings', (req, res) => {
  const date = validateDateInput(req.body.date);

  if (!date) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  if (!isFuture(date)) {
    return res.status(400).json({ error: 'Date must be in the future' });
  }

  // Process booking...
});
```

## Performance Utilities

### Retry with Backoff

```ts
import { retry } from 'ts-time-utils/performance';

async function fetchWithRetry(url: string) {
  return retry(
    () => fetch(url).then(r => r.json()),
    { maxAttempts: 3, delayMs: 1000 }
  );
}
```

### Debounced Operations

```ts
import { debounce } from 'ts-time-utils/performance';

const debouncedSave = debounce(async (data: any) => {
  await db.save(data);
}, 500);

// Rapid calls will only trigger one save
debouncedSave({ key: 'value' });
```

## ESM vs CommonJS

```ts
// ESM (recommended)
import { formatDuration } from 'ts-time-utils/format';

// CommonJS
const { formatDuration } = require('ts-time-utils/format');
```
