import { MILLISECONDS_PER_SECOND, MILLISECONDS_PER_MINUTE, MILLISECONDS_PER_HOUR, MILLISECONDS_PER_DAY, MILLISECONDS_PER_WEEK } from './constants.js';
import type { DurationInput, DurationUnit, DurationComparison } from './types.js';

/**
 * Represents a duration of time with arithmetic and conversion capabilities
 */
export class Duration {
  private readonly _milliseconds: number;

  constructor(input: number | DurationInput | string) {
    if (typeof input === 'number') {
      this._milliseconds = input;
    } else if (typeof input === 'string') {
      this._milliseconds = this.parseString(input);
    } else {
      this._milliseconds = this.calculateMilliseconds(input);
    }
  }

  /**
   * Create Duration from milliseconds
   */
  static fromMilliseconds(ms: number): Duration {
    return new Duration(ms);
  }

  /**
   * Create Duration from seconds
   */
  static fromSeconds(seconds: number): Duration {
    return new Duration(seconds * MILLISECONDS_PER_SECOND);
  }

  /**
   * Create Duration from minutes
   */
  static fromMinutes(minutes: number): Duration {
    return new Duration(minutes * MILLISECONDS_PER_MINUTE);
  }

  /**
   * Create Duration from hours
   */
  static fromHours(hours: number): Duration {
    return new Duration(hours * MILLISECONDS_PER_HOUR);
  }

  /**
   * Create Duration from days
   */
  static fromDays(days: number): Duration {
    return new Duration(days * MILLISECONDS_PER_DAY);
  }

  /**
   * Create Duration from weeks
   */
  static fromWeeks(weeks: number): Duration {
    return new Duration(weeks * MILLISECONDS_PER_WEEK);
  }

  /**
   * Create Duration from a string (e.g., "1h 30m", "2.5 hours", "90 seconds")
   */
  static fromString(str: string): Duration {
    return new Duration(str);
  }

  /**
   * Create Duration between two dates
   */
  static between(start: Date, end: Date): Duration {
    return new Duration(Math.abs(end.getTime() - start.getTime()));
  }

  /**
   * Get duration in milliseconds
   */
  get milliseconds(): number {
    return this._milliseconds;
  }

  /**
   * Get duration in seconds
   */
  get seconds(): number {
    return this._milliseconds / MILLISECONDS_PER_SECOND;
  }

  /**
   * Get duration in minutes
   */
  get minutes(): number {
    return this._milliseconds / MILLISECONDS_PER_MINUTE;
  }

  /**
   * Get duration in hours
   */
  get hours(): number {
    return this._milliseconds / MILLISECONDS_PER_HOUR;
  }

  /**
   * Get duration in days
   */
  get days(): number {
    return this._milliseconds / MILLISECONDS_PER_DAY;
  }

  /**
   * Get duration in weeks
   */
  get weeks(): number {
    return this._milliseconds / MILLISECONDS_PER_WEEK;
  }

  /**
   * Add another duration
   */
  add(other: Duration | number | DurationInput): Duration {
    const otherDuration = this.normalizeToDuration(other);
    return new Duration(this._milliseconds + otherDuration._milliseconds);
  }

  /**
   * Subtract another duration
   */
  subtract(other: Duration | number | DurationInput): Duration {
    const otherDuration = this.normalizeToDuration(other);
    return new Duration(Math.max(0, this._milliseconds - otherDuration._milliseconds));
  }

  /**
   * Multiply duration by a factor
   */
  multiply(factor: number): Duration {
    return new Duration(this._milliseconds * factor);
  }

  /**
   * Divide duration by a factor
   */
  divide(factor: number): Duration {
    if (factor === 0) {
      throw new Error('Cannot divide duration by zero');
    }
    return new Duration(this._milliseconds / factor);
  }

  /**
   * Get absolute duration (always positive)
   */
  abs(): Duration {
    return new Duration(Math.abs(this._milliseconds));
  }

  /**
   * Negate duration
   */
  negate(): Duration {
    return new Duration(-this._milliseconds);
  }

  /**
   * Check if duration equals another
   */
  equals(other: Duration | number): boolean {
    const otherMs = typeof other === 'number' ? other : other._milliseconds;
    return Math.abs(this._milliseconds - otherMs) < 1; // Allow for floating point precision
  }

  /**
   * Check if duration is greater than another
   */
  greaterThan(other: Duration | number): boolean {
    const otherMs = typeof other === 'number' ? other : other._milliseconds;
    return this._milliseconds > otherMs;
  }

  /**
   * Check if duration is less than another
   */
  lessThan(other: Duration | number): boolean {
    const otherMs = typeof other === 'number' ? other : other._milliseconds;
    return this._milliseconds < otherMs;
  }

  /**
   * Compare with another duration (-1, 0, 1)
   */
  compareTo(other: Duration): DurationComparison {
    if (this._milliseconds < other._milliseconds) return -1;
    if (this._milliseconds > other._milliseconds) return 1;
    return 0;
  }

  /**
   * Check if duration is zero
   */
  isZero(): boolean {
    return Math.abs(this._milliseconds) < 1;
  }

  /**
   * Check if duration is positive
   */
  isPositive(): boolean {
    return this._milliseconds > 0;
  }

  /**
   * Check if duration is negative
   */
  isNegative(): boolean {
    return this._milliseconds < 0;
  }

  /**
   * Convert to human-readable string
   */
  toString(): string {
    if (this.isZero()) return '0ms';

    const parts: string[] = [];
    let remaining = Math.abs(this._milliseconds);

    const units = [
      { name: 'd', value: MILLISECONDS_PER_DAY },
      { name: 'h', value: MILLISECONDS_PER_HOUR },
      { name: 'm', value: MILLISECONDS_PER_MINUTE },
      { name: 's', value: MILLISECONDS_PER_SECOND },
      { name: 'ms', value: 1 }
    ];

    for (const unit of units) {
      if (remaining >= unit.value) {
        const count = Math.floor(remaining / unit.value);
        parts.push(`${count}${unit.name}`);
        remaining %= unit.value;
      }
    }

    const result = parts.join(' ');
    return this._milliseconds < 0 ? `-${result}` : result;
  }

  /**
   * Convert to detailed object representation
   */
  toObject(): Required<DurationInput> {
    const ms = Math.abs(this._milliseconds);
    
    const days = Math.floor(ms / MILLISECONDS_PER_DAY);
    const hours = Math.floor((ms % MILLISECONDS_PER_DAY) / MILLISECONDS_PER_HOUR);
    const minutes = Math.floor((ms % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE);
    const seconds = Math.floor((ms % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND);
    const milliseconds = ms % MILLISECONDS_PER_SECOND;

    return {
      years: 0, // Years/months require complex calendar calculations
      months: 0,
      weeks: Math.floor(days / 7),
      days: days,
      hours,
      minutes,
      seconds,
      milliseconds
    };
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): number {
    return this._milliseconds;
  }

  /**
   * Create Duration from JSON
   */
  static fromJSON(ms: number): Duration {
    return new Duration(ms);
  }

  private calculateMilliseconds(input: DurationInput): number {
    let total = 0;
    
    if (input.milliseconds) total += input.milliseconds;
    if (input.seconds) total += input.seconds * MILLISECONDS_PER_SECOND;
    if (input.minutes) total += input.minutes * MILLISECONDS_PER_MINUTE;
    if (input.hours) total += input.hours * MILLISECONDS_PER_HOUR;
    if (input.days) total += input.days * MILLISECONDS_PER_DAY;
    if (input.weeks) total += input.weeks * MILLISECONDS_PER_WEEK;
    
    // Approximate conversions for months and years
    if (input.months) total += input.months * MILLISECONDS_PER_DAY * 30.44; // Average month
    if (input.years) total += input.years * MILLISECONDS_PER_DAY * 365.25; // Average year
    
    return total;
  }

  private parseString(str: string): number {
    const normalized = str.toLowerCase().trim();
    
    // Handle simple formats like "1000", "1000ms"
    if (/^\d+(?:ms)?$/.test(normalized)) {
      return parseInt(normalized.replace('ms', ''));
    }

    // Handle complex formats like "1h 30m 45s"
    const patterns = [
      { regex: /(\d+(?:\.\d+)?)\s*y(?:ears?)?(?!\w)/g, multiplier: MILLISECONDS_PER_DAY * 365.25 },
      { regex: /(\d+(?:\.\d+)?)\s*mo(?:nths?)?(?!\w)/g, multiplier: MILLISECONDS_PER_DAY * 30.44 },
      { regex: /(\d+(?:\.\d+)?)\s*w(?:eeks?)?(?!\w)/g, multiplier: MILLISECONDS_PER_WEEK },
      { regex: /(\d+(?:\.\d+)?)\s*d(?:ays?)?(?!\w)/g, multiplier: MILLISECONDS_PER_DAY },
      { regex: /(\d+(?:\.\d+)?)\s*h(?:ours?)?(?!\w)/g, multiplier: MILLISECONDS_PER_HOUR },
      { regex: /(\d+(?:\.\d+)?)\s*min(?:utes?)?(?!\w)/g, multiplier: MILLISECONDS_PER_MINUTE },
      { regex: /(\d+(?:\.\d+)?)\s*m(?!s|o)(?!\w)/g, multiplier: MILLISECONDS_PER_MINUTE },
      { regex: /(\d+(?:\.\d+)?)\s*s(?:ec(?:onds?)?)?(?!\w)/g, multiplier: MILLISECONDS_PER_SECOND },
      { regex: /(\d+(?:\.\d+)?)\s*ms(?!\w)/g, multiplier: 1 }
    ];

    let total = 0;
    let hasMatch = false;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(normalized)) !== null) {
        total += parseFloat(match[1]) * pattern.multiplier;
        hasMatch = true;
      }
      pattern.regex.lastIndex = 0; // Reset regex
    }

    if (!hasMatch) {
      throw new Error(`Invalid duration format: ${str}`);
    }

    return total;
  }

  private normalizeToDuration(input: Duration | number | DurationInput): Duration {
    if (input instanceof Duration) {
      return input;
    }
    return new Duration(input);
  }
}

/**
 * Create a new Duration instance
 */
export function createDuration(input: number | DurationInput | string): Duration {
  return new Duration(input);
}

/**
 * Check if a value is a valid duration
 */
export function isValidDuration(value: any): value is Duration {
  return value instanceof Duration;
}

/**
 * Parse duration from various formats
 */
export function parseDurationString(input: string | number | DurationInput): Duration {
  return new Duration(input);
}

/**
 * Format duration to human-readable string
 */
export function formatDurationString(duration: Duration | number, options?: { 
  long?: boolean; 
  precision?: number;
}): string {
  const d = typeof duration === 'number' ? new Duration(duration) : duration;
  
  if (options?.long) {
    const obj = d.toObject();
    const parts: string[] = [];
    
    const units = [
      { key: 'days' as keyof DurationInput, singular: 'day', plural: 'days' },
      { key: 'hours' as keyof DurationInput, singular: 'hour', plural: 'hours' },
      { key: 'minutes' as keyof DurationInput, singular: 'minute', plural: 'minutes' },
      { key: 'seconds' as keyof DurationInput, singular: 'second', plural: 'seconds' }
    ];

    for (const unit of units) {
      const value = obj[unit.key] as number;
      if (value > 0) {
        parts.push(`${value} ${value === 1 ? unit.singular : unit.plural}`);
      }
    }

    return parts.length > 0 ? parts.join(', ') : '0 seconds';
  }
  
  return d.toString();
}

/**
 * Get the maximum duration from an array
 */
export function maxDuration(...durations: Duration[]): Duration | null {
  if (durations.length === 0) return null;
  
  return durations.reduce((max, current) => 
    current.greaterThan(max) ? current : max
  );
}

/**
 * Get the minimum duration from an array
 */
export function minDuration(...durations: Duration[]): Duration | null {
  if (durations.length === 0) return null;
  
  return durations.reduce((min, current) => 
    current.lessThan(min) ? current : min
  );
}

/**
 * Sum multiple durations
 */
export function sumDurations(...durations: Duration[]): Duration {
  return durations.reduce((sum, current) => sum.add(current), new Duration(0));
}

/**
 * Get average duration from an array
 */
export function averageDuration(...durations: Duration[]): Duration | null {
  if (durations.length === 0) return null;
  
  const sum = sumDurations(...durations);
  return sum.divide(durations.length);
}