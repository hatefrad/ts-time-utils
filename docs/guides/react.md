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
import { formatTimeAgo } from 'ts-time-utils/format';

function useRelativeTime(date: Date, intervalMs = 60000) {
  const [text, setText] = useState(() => formatTimeAgo(date));

  useEffect(() => {
    const id = setInterval(() => setText(formatTimeAgo(date)), intervalMs);
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
import { getTimeRemaining } from 'ts-time-utils/countdown';

function useCountdown(targetDate: Date) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(targetDate));

  useEffect(() => {
    const id = setInterval(() => {
      const r = getTimeRemaining(targetDate);
      setRemaining(r);
      if (r.total <= 0) clearInterval(id);
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
import { isValidDate, isFutureDate, isPastDate } from 'ts-time-utils/validate';
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

    if (rules.future && !isFutureDate(date)) {
      setError('Date must be in the future');
      return false;
    }

    if (rules.past && !isPastDate(date)) {
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
  const formatted = formatDateLocale(date, locale, { dateStyle: format });
  return <time dateTime={date.toISOString()}>{formatted}</time>;
}
```

### BusinessHoursIndicator

Show if currently open:

```tsx
import { isWithinWorkingHours, getNextWorkingHourStart } from 'ts-time-utils/workingHours';
import { formatTimeAgo } from 'ts-time-utils/format';

const config = {
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  startTime: { hour: 9, minute: 0 },
  endTime: { hour: 17, minute: 0 }
};

function BusinessHoursIndicator() {
  const isOpen = isWithinWorkingHours(new Date(), config);
  const nextOpen = !isOpen ? getNextWorkingHourStart(new Date(), config) : null;

  return (
    <div>
      <span className={isOpen ? 'open' : 'closed'}>
        {isOpen ? 'Open' : 'Closed'}
      </span>
      {nextOpen && <span>Opens {formatTimeAgo(nextOpen)}</span>}
    </div>
  );
}
```

## Form Integration

### React Hook Form

```tsx
import { Controller, useForm } from 'react-hook-form';
import { parseDate, parseDateFormat } from 'ts-time-utils/parse';
import { isValidDate, isFutureDate } from 'ts-time-utils/validate';

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
            futureDate: v => isFutureDate(parseDate(v)!) || 'Must be future date'
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
import { formatTimeAgo } from 'ts-time-utils/format';

// Avoid - imports entire library
import { formatTimeAgo } from 'ts-time-utils';
```
