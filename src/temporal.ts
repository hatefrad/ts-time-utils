/**
 * @fileoverview Temporal API compatibility layer
 * Provides Temporal-like objects that work with native Date
 * When Temporal ships natively, these become thin wrappers
 */

/**
 * PlainDate - A date without time or timezone
 * Mirrors Temporal.PlainDate
 */
export interface PlainDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly dayOfWeek: number; // 1=Monday, 7=Sunday (ISO)
  readonly dayOfYear: number;
  readonly weekOfYear: number;
  readonly daysInMonth: number;
  readonly daysInYear: number;
  readonly monthsInYear: number;
  readonly inLeapYear: boolean;

  toString(): string;
  toJSON(): string;
  equals(other: PlainDate): boolean;
  compare(other: PlainDate): number;
  add(duration: DurationLike): PlainDate;
  subtract(duration: DurationLike): PlainDate;
  until(other: PlainDate): Duration;
  since(other: PlainDate): Duration;
  with(fields: Partial<{ year: number; month: number; day: number }>): PlainDate;
  toDate(): Date;
}

/**
 * PlainTime - A time without date or timezone
 * Mirrors Temporal.PlainTime
 */
export interface PlainTime {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;

  toString(): string;
  toJSON(): string;
  equals(other: PlainTime): boolean;
  compare(other: PlainTime): number;
  add(duration: DurationLike): PlainTime;
  subtract(duration: DurationLike): PlainTime;
  with(fields: Partial<{ hour: number; minute: number; second: number; millisecond: number }>): PlainTime;
}

/**
 * PlainDateTime - A date and time without timezone
 * Mirrors Temporal.PlainDateTime
 */
export interface PlainDateTime {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
  readonly dayOfWeek: number;
  readonly dayOfYear: number;
  readonly weekOfYear: number;

  toString(): string;
  toJSON(): string;
  equals(other: PlainDateTime): boolean;
  compare(other: PlainDateTime): number;
  add(duration: DurationLike): PlainDateTime;
  subtract(duration: DurationLike): PlainDateTime;
  until(other: PlainDateTime): Duration;
  since(other: PlainDateTime): Duration;
  with(fields: Partial<{
    year: number; month: number; day: number;
    hour: number; minute: number; second: number; millisecond: number;
  }>): PlainDateTime;
  toPlainDate(): PlainDate;
  toPlainTime(): PlainTime;
  toDate(): Date;
}

/**
 * ZonedDateTime - A date and time with timezone
 * Mirrors Temporal.ZonedDateTime
 */
export interface ZonedDateTime {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
  readonly timeZone: string;
  readonly offset: string;
  readonly epochMilliseconds: number;

  toString(): string;
  toJSON(): string;
  equals(other: ZonedDateTime): boolean;
  add(duration: DurationLike): ZonedDateTime;
  subtract(duration: DurationLike): ZonedDateTime;
  with(fields: Partial<{
    year: number; month: number; day: number;
    hour: number; minute: number; second: number; millisecond: number;
  }>): ZonedDateTime;
  toPlainDate(): PlainDate;
  toPlainTime(): PlainTime;
  toPlainDateTime(): PlainDateTime;
  toInstant(): Instant;
  toDate(): Date;
}

/**
 * Instant - A point in time (like Unix timestamp)
 * Mirrors Temporal.Instant
 */
export interface Instant {
  readonly epochMilliseconds: number;
  readonly epochSeconds: number;

  toString(): string;
  toJSON(): string;
  equals(other: Instant): boolean;
  compare(other: Instant): number;
  add(duration: DurationLike): Instant;
  subtract(duration: DurationLike): Instant;
  until(other: Instant): Duration;
  since(other: Instant): Duration;
  toZonedDateTime(timeZone: string): ZonedDateTime;
  toDate(): Date;
}

/**
 * Duration - A length of time
 * Mirrors Temporal.Duration
 */
export interface Duration {
  readonly years: number;
  readonly months: number;
  readonly weeks: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;
  readonly sign: -1 | 0 | 1;
  readonly blank: boolean;

  toString(): string;
  toJSON(): string;
  negated(): Duration;
  abs(): Duration;
  add(other: DurationLike): Duration;
  subtract(other: DurationLike): Duration;
  total(unit: DurationUnit): number;
}

export type DurationUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';

export interface DurationLike {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

// Helper functions
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function compareDates(a: Date, b: Date): -1 | 0 | 1 {
  const diff = a.getTime() - b.getTime();
  return diff < 0 ? -1 : diff > 0 ? 1 : 0;
}

// Duration implementation
class DurationImpl implements Duration {
  readonly years: number;
  readonly months: number;
  readonly weeks: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;

  constructor(fields: DurationLike = {}) {
    this.years = fields.years || 0;
    this.months = fields.months || 0;
    this.weeks = fields.weeks || 0;
    this.days = fields.days || 0;
    this.hours = fields.hours || 0;
    this.minutes = fields.minutes || 0;
    this.seconds = fields.seconds || 0;
    this.milliseconds = fields.milliseconds || 0;
  }

  get sign(): -1 | 0 | 1 {
    const total = this.years + this.months + this.weeks + this.days +
                  this.hours + this.minutes + this.seconds + this.milliseconds;
    return total < 0 ? -1 : total > 0 ? 1 : 0;
  }

  get blank(): boolean {
    return this.sign === 0;
  }

  toString(): string {
    if (this.blank) return 'PT0S';

    let result = this.sign < 0 ? '-P' : 'P';
    if (this.years) result += `${Math.abs(this.years)}Y`;
    if (this.months) result += `${Math.abs(this.months)}M`;
    if (this.weeks) result += `${Math.abs(this.weeks)}W`;
    if (this.days) result += `${Math.abs(this.days)}D`;

    const hasTime = this.hours || this.minutes || this.seconds || this.milliseconds;
    if (hasTime) {
      result += 'T';
      if (this.hours) result += `${Math.abs(this.hours)}H`;
      if (this.minutes) result += `${Math.abs(this.minutes)}M`;
      if (this.seconds || this.milliseconds) {
        const secs = Math.abs(this.seconds) + Math.abs(this.milliseconds) / 1000;
        result += `${secs}S`;
      }
    }

    return result;
  }

  toJSON(): string {
    return this.toString();
  }

  negated(): Duration {
    return new DurationImpl({
      years: -this.years,
      months: -this.months,
      weeks: -this.weeks,
      days: -this.days,
      hours: -this.hours,
      minutes: -this.minutes,
      seconds: -this.seconds,
      milliseconds: -this.milliseconds,
    });
  }

  abs(): Duration {
    return new DurationImpl({
      years: Math.abs(this.years),
      months: Math.abs(this.months),
      weeks: Math.abs(this.weeks),
      days: Math.abs(this.days),
      hours: Math.abs(this.hours),
      minutes: Math.abs(this.minutes),
      seconds: Math.abs(this.seconds),
      milliseconds: Math.abs(this.milliseconds),
    });
  }

  add(other: DurationLike): Duration {
    return new DurationImpl({
      years: this.years + (other.years || 0),
      months: this.months + (other.months || 0),
      weeks: this.weeks + (other.weeks || 0),
      days: this.days + (other.days || 0),
      hours: this.hours + (other.hours || 0),
      minutes: this.minutes + (other.minutes || 0),
      seconds: this.seconds + (other.seconds || 0),
      milliseconds: this.milliseconds + (other.milliseconds || 0),
    });
  }

  subtract(other: DurationLike): Duration {
    return new DurationImpl({
      years: this.years - (other.years || 0),
      months: this.months - (other.months || 0),
      weeks: this.weeks - (other.weeks || 0),
      days: this.days - (other.days || 0),
      hours: this.hours - (other.hours || 0),
      minutes: this.minutes - (other.minutes || 0),
      seconds: this.seconds - (other.seconds || 0),
      milliseconds: this.milliseconds - (other.milliseconds || 0),
    });
  }

  total(unit: DurationUnit): number {
    // Convert everything to milliseconds first
    const MS_PER_SECOND = 1000;
    const MS_PER_MINUTE = 60 * MS_PER_SECOND;
    const MS_PER_HOUR = 60 * MS_PER_MINUTE;
    const MS_PER_DAY = 24 * MS_PER_HOUR;
    const MS_PER_WEEK = 7 * MS_PER_DAY;
    // Approximate month/year (not calendar-accurate)
    const MS_PER_MONTH = 30 * MS_PER_DAY;
    const MS_PER_YEAR = 365 * MS_PER_DAY;

    const totalMs =
      this.milliseconds +
      this.seconds * MS_PER_SECOND +
      this.minutes * MS_PER_MINUTE +
      this.hours * MS_PER_HOUR +
      this.days * MS_PER_DAY +
      this.weeks * MS_PER_WEEK +
      this.months * MS_PER_MONTH +
      this.years * MS_PER_YEAR;

    switch (unit) {
      case 'milliseconds': return totalMs;
      case 'seconds': return totalMs / MS_PER_SECOND;
      case 'minutes': return totalMs / MS_PER_MINUTE;
      case 'hours': return totalMs / MS_PER_HOUR;
      case 'days': return totalMs / MS_PER_DAY;
      case 'weeks': return totalMs / MS_PER_WEEK;
      case 'months': return totalMs / MS_PER_MONTH;
      case 'years': return totalMs / MS_PER_YEAR;
    }
  }
}

// PlainDate implementation
class PlainDateImpl implements PlainDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  get dayOfWeek(): number {
    const d = new Date(this.year, this.month - 1, this.day);
    return d.getDay() === 0 ? 7 : d.getDay(); // ISO: 1=Monday, 7=Sunday
  }

  get dayOfYear(): number {
    return getDayOfYear(new Date(this.year, this.month - 1, this.day));
  }

  get weekOfYear(): number {
    return getWeekNumber(new Date(this.year, this.month - 1, this.day));
  }

  get daysInMonth(): number {
    return getDaysInMonth(this.year, this.month);
  }

  get daysInYear(): number {
    return getDaysInYear(this.year);
  }

  get monthsInYear(): number {
    return 12;
  }

  get inLeapYear(): boolean {
    return isLeapYear(this.year);
  }

  toString(): string {
    const y = this.year.toString().padStart(4, '0');
    const m = this.month.toString().padStart(2, '0');
    const d = this.day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  toJSON(): string {
    return this.toString();
  }

  equals(other: PlainDate): boolean {
    return this.year === other.year && this.month === other.month && this.day === other.day;
  }

  compare(other: PlainDate): number {
    const otherDate = new Date(other.year, other.month - 1, other.day);
    return compareDates(this.toDate(), otherDate);
  }

  add(duration: DurationLike): PlainDate {
    const date = this.toDate();
    if (duration.years) date.setFullYear(date.getFullYear() + duration.years);
    if (duration.months) date.setMonth(date.getMonth() + duration.months);
    if (duration.weeks) date.setDate(date.getDate() + duration.weeks * 7);
    if (duration.days) date.setDate(date.getDate() + duration.days);
    return toPlainDate(date);
  }

  subtract(duration: DurationLike): PlainDate {
    return this.add({
      years: -(duration.years || 0),
      months: -(duration.months || 0),
      weeks: -(duration.weeks || 0),
      days: -(duration.days || 0),
    });
  }

  until(other: PlainDate): Duration {
    const otherDate = new Date(other.year, other.month - 1, other.day);
    const diffMs = otherDate.getTime() - this.toDate().getTime();
    const days = Math.floor(diffMs / 86400000);
    return createDuration({ days });
  }

  since(other: PlainDate): Duration {
    const otherImpl = new PlainDateImpl(other.year, other.month, other.day);
    return otherImpl.until(this);
  }

  with(fields: Partial<{ year: number; month: number; day: number }>): PlainDate {
    return new PlainDateImpl(
      fields.year ?? this.year,
      fields.month ?? this.month,
      fields.day ?? this.day
    );
  }

  toDate(): Date {
    return new Date(this.year, this.month - 1, this.day);
  }
}

// PlainTime implementation
class PlainTimeImpl implements PlainTime {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;

  constructor(hour: number = 0, minute: number = 0, second: number = 0, millisecond: number = 0) {
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.millisecond = millisecond;
  }

  toString(): string {
    const h = this.hour.toString().padStart(2, '0');
    const m = this.minute.toString().padStart(2, '0');
    const s = this.second.toString().padStart(2, '0');
    if (this.millisecond) {
      const ms = this.millisecond.toString().padStart(3, '0');
      return `${h}:${m}:${s}.${ms}`;
    }
    return `${h}:${m}:${s}`;
  }

  toJSON(): string {
    return this.toString();
  }

  equals(other: PlainTime): boolean {
    return this.hour === other.hour && this.minute === other.minute &&
           this.second === other.second && this.millisecond === other.millisecond;
  }

  compare(other: PlainTime): number {
    const a = this.hour * 3600000 + this.minute * 60000 + this.second * 1000 + this.millisecond;
    const b = other.hour * 3600000 + other.minute * 60000 + other.second * 1000 + other.millisecond;
    return a < b ? -1 : a > b ? 1 : 0;
  }

  add(duration: DurationLike): PlainTime {
    let totalMs = this.hour * 3600000 + this.minute * 60000 + this.second * 1000 + this.millisecond;
    if (duration.hours) totalMs += duration.hours * 3600000;
    if (duration.minutes) totalMs += duration.minutes * 60000;
    if (duration.seconds) totalMs += duration.seconds * 1000;
    if (duration.milliseconds) totalMs += duration.milliseconds;

    // Wrap around 24 hours
    totalMs = ((totalMs % 86400000) + 86400000) % 86400000;

    const hour = Math.floor(totalMs / 3600000);
    const minute = Math.floor((totalMs % 3600000) / 60000);
    const second = Math.floor((totalMs % 60000) / 1000);
    const millisecond = totalMs % 1000;

    return new PlainTimeImpl(hour, minute, second, millisecond);
  }

  subtract(duration: DurationLike): PlainTime {
    return this.add({
      hours: -(duration.hours || 0),
      minutes: -(duration.minutes || 0),
      seconds: -(duration.seconds || 0),
      milliseconds: -(duration.milliseconds || 0),
    });
  }

  with(fields: Partial<{ hour: number; minute: number; second: number; millisecond: number }>): PlainTime {
    return new PlainTimeImpl(
      fields.hour ?? this.hour,
      fields.minute ?? this.minute,
      fields.second ?? this.second,
      fields.millisecond ?? this.millisecond
    );
  }
}

// PlainDateTime implementation
class PlainDateTimeImpl implements PlainDateTime {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;

  constructor(
    year: number, month: number, day: number,
    hour: number = 0, minute: number = 0, second: number = 0, millisecond: number = 0
  ) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.millisecond = millisecond;
  }

  get dayOfWeek(): number {
    const d = new Date(this.year, this.month - 1, this.day);
    return d.getDay() === 0 ? 7 : d.getDay();
  }

  get dayOfYear(): number {
    return getDayOfYear(new Date(this.year, this.month - 1, this.day));
  }

  get weekOfYear(): number {
    return getWeekNumber(new Date(this.year, this.month - 1, this.day));
  }

  toString(): string {
    const date = this.toPlainDate().toString();
    const time = this.toPlainTime().toString();
    return `${date}T${time}`;
  }

  toJSON(): string {
    return this.toString();
  }

  equals(other: PlainDateTime): boolean {
    return this.toPlainDate().equals(other.toPlainDate()) &&
           this.toPlainTime().equals(other.toPlainTime());
  }

  compare(other: PlainDateTime): number {
    const otherDate = new Date(other.year, other.month - 1, other.day, other.hour, other.minute, other.second, other.millisecond);
    return compareDates(this.toDate(), otherDate);
  }

  add(duration: DurationLike): PlainDateTime {
    const date = this.toDate();
    if (duration.years) date.setFullYear(date.getFullYear() + duration.years);
    if (duration.months) date.setMonth(date.getMonth() + duration.months);
    if (duration.weeks) date.setDate(date.getDate() + duration.weeks * 7);
    if (duration.days) date.setDate(date.getDate() + duration.days);
    if (duration.hours) date.setHours(date.getHours() + duration.hours);
    if (duration.minutes) date.setMinutes(date.getMinutes() + duration.minutes);
    if (duration.seconds) date.setSeconds(date.getSeconds() + duration.seconds);
    if (duration.milliseconds) date.setMilliseconds(date.getMilliseconds() + duration.milliseconds);
    return toPlainDateTime(date);
  }

  subtract(duration: DurationLike): PlainDateTime {
    return this.add({
      years: -(duration.years || 0),
      months: -(duration.months || 0),
      weeks: -(duration.weeks || 0),
      days: -(duration.days || 0),
      hours: -(duration.hours || 0),
      minutes: -(duration.minutes || 0),
      seconds: -(duration.seconds || 0),
      milliseconds: -(duration.milliseconds || 0),
    });
  }

  until(other: PlainDateTime): Duration {
    const otherDate = new Date(other.year, other.month - 1, other.day, other.hour, other.minute, other.second, other.millisecond);
    const diffMs = otherDate.getTime() - this.toDate().getTime();
    const days = Math.floor(diffMs / 86400000);
    const remainingMs = diffMs % 86400000;
    const hours = Math.floor(remainingMs / 3600000);
    const minutes = Math.floor((remainingMs % 3600000) / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    const milliseconds = remainingMs % 1000;
    return createDuration({ days, hours, minutes, seconds, milliseconds });
  }

  since(other: PlainDateTime): Duration {
    const otherImpl = new PlainDateTimeImpl(other.year, other.month, other.day, other.hour, other.minute, other.second, other.millisecond);
    return otherImpl.until(this);
  }

  with(fields: Partial<{
    year: number; month: number; day: number;
    hour: number; minute: number; second: number; millisecond: number;
  }>): PlainDateTime {
    return new PlainDateTimeImpl(
      fields.year ?? this.year,
      fields.month ?? this.month,
      fields.day ?? this.day,
      fields.hour ?? this.hour,
      fields.minute ?? this.minute,
      fields.second ?? this.second,
      fields.millisecond ?? this.millisecond
    );
  }

  toPlainDate(): PlainDate {
    return new PlainDateImpl(this.year, this.month, this.day);
  }

  toPlainTime(): PlainTime {
    return new PlainTimeImpl(this.hour, this.minute, this.second, this.millisecond);
  }

  toDate(): Date {
    return new Date(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond);
  }
}

// ZonedDateTime implementation
class ZonedDateTimeImpl implements ZonedDateTime {
  private readonly _date: Date;
  readonly timeZone: string;

  constructor(epochMs: number, timeZone: string) {
    this._date = new Date(epochMs);
    this.timeZone = timeZone;
  }

  private get _parts(): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(this._date);
    const result: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        result[part.type] = parseInt(part.value, 10);
      }
    }
    return {
      year: result.year,
      month: result.month,
      day: result.day,
      hour: result.hour === 24 ? 0 : result.hour, // Handle midnight
      minute: result.minute,
      second: result.second,
    };
  }

  get year(): number { return this._parts.year; }
  get month(): number { return this._parts.month; }
  get day(): number { return this._parts.day; }
  get hour(): number { return this._parts.hour; }
  get minute(): number { return this._parts.minute; }
  get second(): number { return this._parts.second; }
  get millisecond(): number { return this._date.getMilliseconds(); }
  get epochMilliseconds(): number { return this._date.getTime(); }

  get offset(): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timeZone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(this._date);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart?.value.replace('GMT', '') || '+00:00';
  }

  toString(): string {
    const dt = `${this.toPlainDateTime().toString()}`;
    return `${dt}${this.offset}[${this.timeZone}]`;
  }

  toJSON(): string {
    return this.toString();
  }

  equals(other: ZonedDateTime): boolean {
    return this.epochMilliseconds === other.epochMilliseconds && this.timeZone === other.timeZone;
  }

  add(duration: DurationLike): ZonedDateTime {
    const dt = this.toPlainDateTime().add(duration);
    return toZonedDateTime(dt.toDate(), this.timeZone);
  }

  subtract(duration: DurationLike): ZonedDateTime {
    const dt = this.toPlainDateTime().subtract(duration);
    return toZonedDateTime(dt.toDate(), this.timeZone);
  }

  with(fields: Partial<{
    year: number; month: number; day: number;
    hour: number; minute: number; second: number; millisecond: number;
  }>): ZonedDateTime {
    const dt = this.toPlainDateTime().with(fields);
    return toZonedDateTime(dt.toDate(), this.timeZone);
  }

  toPlainDate(): PlainDate {
    const p = this._parts;
    return new PlainDateImpl(p.year, p.month, p.day);
  }

  toPlainTime(): PlainTime {
    const p = this._parts;
    return new PlainTimeImpl(p.hour, p.minute, p.second, this.millisecond);
  }

  toPlainDateTime(): PlainDateTime {
    const p = this._parts;
    return new PlainDateTimeImpl(p.year, p.month, p.day, p.hour, p.minute, p.second, this.millisecond);
  }

  toInstant(): Instant {
    return new InstantImpl(this.epochMilliseconds);
  }

  toDate(): Date {
    return new Date(this._date.getTime());
  }
}

// Instant implementation
class InstantImpl implements Instant {
  readonly epochMilliseconds: number;

  constructor(epochMs: number) {
    this.epochMilliseconds = epochMs;
  }

  get epochSeconds(): number {
    return Math.floor(this.epochMilliseconds / 1000);
  }

  toString(): string {
    return new Date(this.epochMilliseconds).toISOString();
  }

  toJSON(): string {
    return this.toString();
  }

  equals(other: Instant): boolean {
    return this.epochMilliseconds === other.epochMilliseconds;
  }

  compare(other: Instant): number {
    const diff = this.epochMilliseconds - other.epochMilliseconds;
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  }

  add(duration: DurationLike): Instant {
    let ms = this.epochMilliseconds;
    if (duration.days) ms += duration.days * 86400000;
    if (duration.hours) ms += duration.hours * 3600000;
    if (duration.minutes) ms += duration.minutes * 60000;
    if (duration.seconds) ms += duration.seconds * 1000;
    if (duration.milliseconds) ms += duration.milliseconds;
    return new InstantImpl(ms);
  }

  subtract(duration: DurationLike): Instant {
    return this.add({
      days: -(duration.days || 0),
      hours: -(duration.hours || 0),
      minutes: -(duration.minutes || 0),
      seconds: -(duration.seconds || 0),
      milliseconds: -(duration.milliseconds || 0),
    });
  }

  until(other: Instant): Duration {
    const diffMs = other.epochMilliseconds - this.epochMilliseconds;
    return createDuration({ milliseconds: diffMs });
  }

  since(other: Instant): Duration {
    const otherImpl = new InstantImpl(other.epochMilliseconds);
    return otherImpl.until(this);
  }

  toZonedDateTime(timeZone: string): ZonedDateTime {
    return new ZonedDateTimeImpl(this.epochMilliseconds, timeZone);
  }

  toDate(): Date {
    return new Date(this.epochMilliseconds);
  }
}

// Factory functions

/**
 * Create a PlainDate from a Date object or components
 */
export function toPlainDate(date: Date): PlainDate;
export function toPlainDate(year: number, month: number, day: number): PlainDate;
export function toPlainDate(dateOrYear: Date | number | PlainDate, month?: number, day?: number): PlainDate {
  if (dateOrYear instanceof Date) {
    return new PlainDateImpl(dateOrYear.getFullYear(), dateOrYear.getMonth() + 1, dateOrYear.getDate());
  }
  if (typeof dateOrYear === 'object' && 'year' in dateOrYear) {
    return new PlainDateImpl(dateOrYear.year, dateOrYear.month, dateOrYear.day);
  }
  return new PlainDateImpl(dateOrYear, month!, day!);
}

/**
 * Create a PlainTime from a Date object or components
 */
export function toPlainTime(date: Date): PlainTime;
export function toPlainTime(hour: number, minute?: number, second?: number, millisecond?: number): PlainTime;
export function toPlainTime(dateOrHour: Date | number | PlainTime, minute?: number, second?: number, millisecond?: number): PlainTime {
  if (dateOrHour instanceof Date) {
    return new PlainTimeImpl(dateOrHour.getHours(), dateOrHour.getMinutes(), dateOrHour.getSeconds(), dateOrHour.getMilliseconds());
  }
  if (typeof dateOrHour === 'object' && 'hour' in dateOrHour) {
    return new PlainTimeImpl(dateOrHour.hour, dateOrHour.minute, dateOrHour.second, dateOrHour.millisecond);
  }
  return new PlainTimeImpl(dateOrHour, minute, second, millisecond);
}

/**
 * Create a PlainDateTime from a Date object or components
 */
export function toPlainDateTime(date: Date): PlainDateTime;
export function toPlainDateTime(
  year: number, month: number, day: number,
  hour?: number, minute?: number, second?: number, millisecond?: number
): PlainDateTime;
export function toPlainDateTime(
  dateOrYear: Date | number | PlainDateTime,
  month?: number, day?: number,
  hour?: number, minute?: number, second?: number, millisecond?: number
): PlainDateTime {
  if (dateOrYear instanceof Date) {
    return new PlainDateTimeImpl(
      dateOrYear.getFullYear(), dateOrYear.getMonth() + 1, dateOrYear.getDate(),
      dateOrYear.getHours(), dateOrYear.getMinutes(), dateOrYear.getSeconds(), dateOrYear.getMilliseconds()
    );
  }
  if (typeof dateOrYear === 'object' && 'year' in dateOrYear) {
    return new PlainDateTimeImpl(
      dateOrYear.year, dateOrYear.month, dateOrYear.day,
      dateOrYear.hour, dateOrYear.minute, dateOrYear.second, dateOrYear.millisecond
    );
  }
  return new PlainDateTimeImpl(dateOrYear, month!, day!, hour, minute, second, millisecond);
}

/**
 * Create a ZonedDateTime from a Date object and timezone
 */
export function toZonedDateTime(date: Date, timeZone: string): ZonedDateTime {
  return new ZonedDateTimeImpl(date.getTime(), timeZone);
}

/**
 * Create an Instant from a Date object or epoch milliseconds
 */
export function toInstant(date: Date): Instant;
export function toInstant(epochMs: number): Instant;
export function toInstant(dateOrEpoch: Date | number | Instant): Instant {
  if (dateOrEpoch instanceof Date) {
    return new InstantImpl(dateOrEpoch.getTime());
  }
  if (typeof dateOrEpoch === 'object' && 'epochMilliseconds' in dateOrEpoch) {
    return new InstantImpl(dateOrEpoch.epochMilliseconds);
  }
  return new InstantImpl(dateOrEpoch);
}

/**
 * Create a Duration from components
 */
export function createDuration(fields: DurationLike = {}): Duration {
  return new DurationImpl(fields);
}

/**
 * Parse an ISO 8601 duration string
 */
export function parseDuration(str: string): Duration {
  const match = str.match(/^(-)?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
  if (!match) throw new Error(`Invalid duration: ${str}`);

  const sign = match[1] === '-' ? -1 : 1;
  const seconds = match[8] ? parseFloat(match[8]) : 0;
  const wholeSeconds = Math.floor(seconds);
  const milliseconds = Math.round((seconds - wholeSeconds) * 1000);

  return new DurationImpl({
    years: sign * (parseInt(match[2], 10) || 0),
    months: sign * (parseInt(match[3], 10) || 0),
    weeks: sign * (parseInt(match[4], 10) || 0),
    days: sign * (parseInt(match[5], 10) || 0),
    hours: sign * (parseInt(match[6], 10) || 0),
    minutes: sign * (parseInt(match[7], 10) || 0),
    seconds: sign * wholeSeconds,
    milliseconds: sign * milliseconds,
  });
}

/**
 * Get current instant
 */
export function nowInstant(): Instant {
  return new InstantImpl(Date.now());
}

/**
 * Get current PlainDateTime in local timezone
 */
export function nowPlainDateTime(): PlainDateTime {
  return toPlainDateTime(new Date());
}

/**
 * Get current PlainDate in local timezone
 */
export function nowPlainDate(): PlainDate {
  return toPlainDate(new Date());
}

/**
 * Get current PlainTime in local timezone
 */
export function nowPlainTime(): PlainTime {
  return toPlainTime(new Date());
}

/**
 * Get current ZonedDateTime in specified timezone
 */
export function nowZonedDateTime(timeZone: string): ZonedDateTime {
  return toZonedDateTime(new Date(), timeZone);
}

/**
 * Convert Temporal-like object back to Date
 */
export function fromTemporal(temporal: PlainDate | PlainDateTime | ZonedDateTime | Instant): Date {
  return temporal.toDate();
}
