# React Integration Guide

## Installation

```bash
npm install ts-time-utils
```

## Hooks

### useRelativeTime

Auto-updating relative time display:

```tsx
import { useState, useEffect } from 'react';
import { timeAgo } from 'ts-time-utils/format';

function useRelativeTime(date: Date, intervalMs = 60000) {
  const [text, setText] = useState(() => timeAgo(date));

  useEffect(() => {
    const id = setInterval(() => setText(timeAgo(date)), intervalMs);
    return () => clearInterval(id);
  }, [date, intervalMs]);

  return text;
}

// Usage
function Comment({ createdAt }: { createdAt: Date }) {
  const timeAgo = useRelativeTime(createdAt);
  return <span>{timeAgo}</span>; // "5 minutes ago"
}
```

### useCountdown

Countdown timer with callbacks:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { getRemainingTime } from 'ts-time-utils/countdown';

function useCountdown(targetDate: Date) {
  const [remaining, setRemaining] = useState(() => getRemainingTime(targetDate));

  useEffect(() => {
    const id = setInterval(() => {
      const r = getRemainingTime(targetDate);
      setRemaining(r);
      if (r.totalMilliseconds <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return remaining;
}

// Usage
function SaleCountdown({ endsAt }: { endsAt: Date }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endsAt);

  if (isExpired) return <span>Sale ended</span>;
  return <span>{days}d {hours}h {minutes}m {seconds}s</span>;
}
```

### useDateValidation

Form validation hook:

```tsx
import { useState, useCallback } from 'react';
import { isValidDate, isFuture, isPast } from 'ts-time-utils/validate';
import { parseDate } from 'ts-time-utils/parse';

function useDateValidation(rules: { required?: boolean; future?: boolean; past?: boolean }) {
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((value: string) => {
    if (!value && rules.required) {
      setError('Date is required');
      return false;
    }

    const date = parseDate(value);
    if (!date || !isValidDate(date)) {
      setError('Invalid date format');
      return false;
    }

    if (rules.future && !isFuture(date)) {
      setError('Date must be in the future');
      return false;
    }

    if (rules.past && !isPast(date)) {
      setError('Date must be in the past');
      return false;
    }

    setError(null);
    return true;
  }, [rules]);

  return { error, validate };
}

// Usage
function BookingForm() {
  const { error, validate } = useDateValidation({ required: true, future: true });

  return (
    <div>
      <input type="date" onChange={e => validate(e.target.value)} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

## Components

### FormattedDate

Locale-aware date display:

```tsx
import { formatDateLocale } from 'ts-time-utils/locale';

interface FormattedDateProps {
  date: Date;
  locale?: string;
  format?: 'short' | 'medium' | 'long' | 'full';
}

function FormattedDate({ date, locale = 'en-US', format = 'medium' }: FormattedDateProps) {
  const formatted = formatDateLocale(date, locale, format);
  return <time dateTime={date.toISOString()}>{formatted}</time>;
}
```

### BusinessHoursIndicator

Show if currently open:

```tsx
import { isWorkingTime, nextWorkingTime } from 'ts-time-utils/workingHours';
import { timeAgo } from 'ts-time-utils/format';

const config = {
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  hours: { start: 9, end: 17 },
  breaks: [{ start: 12, end: 13 }]
};

function BusinessHoursIndicator() {
  const now = new Date();
  const isOpen = isWorkingTime(now, config);
  const nextOpen = !isOpen ? nextWorkingTime(now, config) : null;

  return (
    <div>
      <span className={isOpen ? 'open' : 'closed'}>
        {isOpen ? 'Open' : 'Closed'}
      </span>
      {nextOpen && <span>Opens {timeAgo(nextOpen)}</span>}
    </div>
  );
}
```

## Form Integration

### React Hook Form

```tsx
import { Controller, useForm } from 'react-hook-form';
import { parseDate } from 'ts-time-utils/parse';
import { isValidDate, isFuture } from 'ts-time-utils/validate';

function EventForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="eventDate"
        control={control}
        rules={{
          validate: {
            validDate: v => isValidDate(parseDate(v)) || 'Invalid date',
            futureDate: v => isFuture(parseDate(v)!) || 'Must be future date'
          }
        }}
        render={({ field, fieldState }) => (
          <>
            <input type="date" {...field} />
            {fieldState.error && <span>{fieldState.error.message}</span>}
          </>
        )}
      />
    </form>
  );
}
```

## Tree-Shaking Tips

Import only what you need:

```tsx
// Good - only imports format module (~3KB)
import { timeAgo } from 'ts-time-utils/format';

// Avoid - imports entire library
import { timeAgo } from 'ts-time-utils';
```
