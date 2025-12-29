# Angular Integration Guide

## Installation

```bash
npm install ts-time-utils
```

## Pipes

### RelativeTimePipe

```ts
// pipes/relative-time.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { formatTimeAgo } from 'ts-time-utils/format';

@Pipe({ name: 'relativeTime', pure: false })
export class RelativeTimePipe implements PipeTransform {
  transform(date: Date | string | number): string {
    const d = date instanceof Date ? date : new Date(date);
    return formatTimeAgo(d);
  }
}
```

```html
<span>{{ post.createdAt | relativeTime }}</span>
<!-- "5 minutes ago" -->
```

### DurationPipe

```ts
// pipes/duration.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { formatDuration } from 'ts-time-utils/format';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(ms: number, format: 'short' | 'long' = 'short'): string {
    return formatDuration(ms, { format });
  }
}
```

```html
<span>{{ elapsedMs | duration }}</span>
<!-- "2h 30m" -->
```

### LocaleDatePipe

```ts
// pipes/locale-date.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { formatDateLocale } from 'ts-time-utils/locale';

@Pipe({ name: 'localeDate' })
export class LocaleDatePipe implements PipeTransform {
  transform(
    date: Date,
    locale = 'en-US',
    style: 'short' | 'medium' | 'long' | 'full' = 'medium'
  ): string {
    return formatDateLocale(date, locale, { dateStyle: style });
  }
}
```

```html
<span>{{ event.date | localeDate:'de-DE':'long' }}</span>
<!-- "29. Dezember 2025" -->
```

## Services

### CountdownService

```ts
// services/countdown.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, takeUntil, Subject } from 'rxjs';
import { getTimeRemaining, TimeRemaining } from 'ts-time-utils/countdown';

@Injectable({ providedIn: 'root' })
export class CountdownService implements OnDestroy {
  private destroy$ = new Subject<void>();

  createCountdown(targetDate: Date) {
    const remaining$ = new BehaviorSubject<TimeRemaining>(
      getTimeRemaining(targetDate)
    );

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const r = getTimeRemaining(targetDate);
        remaining$.next(r);
        if (r.isExpired) remaining$.complete();
      });

    return remaining$.asObservable();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

```ts
// component usage
@Component({
  selector: 'app-sale-countdown',
  template: `
    <ng-container *ngIf="remaining$ | async as r">
      <span *ngIf="!r.isExpired">
        {{ r.days }}d {{ r.hours }}h {{ r.minutes }}m {{ r.seconds }}s
      </span>
      <span *ngIf="r.isExpired">Sale ended</span>
    </ng-container>
  `
})
export class SaleCountdownComponent implements OnInit {
  remaining$!: Observable<TimeRemaining>;

  constructor(private countdown: CountdownService) {}

  ngOnInit() {
    this.remaining$ = this.countdown.createCountdown(
      new Date('2025-12-31')
    );
  }
}
```

### BusinessHoursService

```ts
// services/business-hours.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, map, startWith } from 'rxjs';
import {
  isWithinWorkingHours,
  getNextWorkingHourStart,
  WorkingHoursConfig
} from 'ts-time-utils/workingHours';
import { formatTimeAgo } from 'ts-time-utils/format';

@Injectable({ providedIn: 'root' })
export class BusinessHoursService {
  private config: WorkingHoursConfig = {
    workingDays: [1, 2, 3, 4, 5],
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 17, minute: 0 }
  };

  readonly status$ = interval(60000).pipe(
    startWith(0),
    map(() => {
      const now = new Date();
      const isOpen = isWithinWorkingHours(now, this.config);
      const nextOpen = !isOpen
        ? getNextWorkingHourStart(now, this.config)
        : null;

      return {
        isOpen,
        nextOpenText: nextOpen ? `Opens ${formatTimeAgo(nextOpen)}` : null
      };
    })
  );
}
```

## Validators

### Custom Date Validators

```ts
// validators/date.validators.ts
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { parseDate } from 'ts-time-utils/parse';
import { isValidDate, isFutureDate, isPastDate } from 'ts-time-utils/validate';

export class DateValidators {
  static validDate(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const date = parseDate(control.value);
      return date && isValidDate(date) ? null : { invalidDate: true };
    };
  }

  static futureDate(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const date = parseDate(control.value);
      if (!date) return { invalidDate: true };

      return isFutureDate(date) ? null : { notFutureDate: true };
    };
  }

  static pastDate(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const date = parseDate(control.value);
      if (!date) return { invalidDate: true };

      return isPastDate(date) ? null : { notPastDate: true };
    };
  }

  static minDate(minDate: Date): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const date = parseDate(control.value);
      if (!date) return { invalidDate: true };

      return date >= minDate ? null : { minDate: { min: minDate, actual: date } };
    };
  }
}
```

```ts
// Usage in component
this.form = this.fb.group({
  birthDate: ['', [Validators.required, DateValidators.pastDate()]],
  appointmentDate: ['', [Validators.required, DateValidators.futureDate()]]
});
```

## Reactive Forms Integration

```ts
// booking-form.component.ts
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DateValidators } from './validators/date.validators';
import { parseDate } from 'ts-time-utils/parse';
import { addDays } from 'ts-time-utils/calculate';

@Component({
  selector: 'app-booking-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label>Booking Date</label>
        <input type="date" formControlName="date" />
        <span *ngIf="form.get('date')?.errors?.['notFutureDate']">
          Must be a future date
        </span>
      </div>

      <button type="submit" [disabled]="form.invalid">Book</button>
    </form>
  `
})
export class BookingFormComponent {
  form = this.fb.group({
    date: ['', [Validators.required, DateValidators.futureDate()]]
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    const date = parseDate(this.form.value.date!);
    console.log('Booking for:', date);
  }
}
```

## Module Setup

```ts
// shared/time-utils.module.ts
import { NgModule } from '@angular/core';
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { DurationPipe } from './pipes/duration.pipe';
import { LocaleDatePipe } from './pipes/locale-date.pipe';

@NgModule({
  declarations: [RelativeTimePipe, DurationPipe, LocaleDatePipe],
  exports: [RelativeTimePipe, DurationPipe, LocaleDatePipe]
})
export class TimeUtilsModule {}
```

## Tree-Shaking Tips

```ts
// Good - only imports format module (~3KB)
import { formatTimeAgo } from 'ts-time-utils/format';

// Avoid - imports entire library
import { formatTimeAgo } from 'ts-time-utils';
```

Angular's build optimizer will tree-shake unused exports when using subpath imports.
