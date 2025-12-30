/**
 * @fileoverview High-precision time utilities
 * Handles nanoseconds, BigInt timestamps, sub-millisecond operations
 */

/**
 * Nanosecond precision timestamp
 * Uses BigInt for precision beyond milliseconds
 */
export interface NanosecondTimestamp {
  readonly milliseconds: number;
  readonly nanoseconds: number; // 0-999999 (sub-millisecond nanoseconds)
  readonly totalNanoseconds: bigint;
}

/**
 * High-resolution duration with nanosecond precision
 */
export interface HighResDuration {
  readonly seconds: number;
  readonly nanoseconds: number; // 0-999999999
}

/**
 * Create a nanosecond timestamp from components
 */
export function createNanosecondTimestamp(
  milliseconds: number,
  nanoseconds: number = 0
): NanosecondTimestamp {
  // Normalize: ensure nanoseconds is 0-999999
  const extraMs = Math.floor(nanoseconds / 1000000);
  const normalizedNs = nanoseconds % 1000000;
  const totalMs = milliseconds + extraMs;

  const totalNanoseconds = BigInt(totalMs) * BigInt(1000000) + BigInt(normalizedNs);

  return {
    milliseconds: totalMs,
    nanoseconds: normalizedNs,
    totalNanoseconds,
  };
}

/**
 * Create a nanosecond timestamp from BigInt
 */
export function fromNanoseconds(totalNs: bigint): NanosecondTimestamp {
  const ms = Number(totalNs / BigInt(1000000));
  const ns = Number(totalNs % BigInt(1000000));

  return {
    milliseconds: ms,
    nanoseconds: ns,
    totalNanoseconds: totalNs,
  };
}

/**
 * Create a nanosecond timestamp from a Date
 */
export function dateToNanoseconds(date: Date): NanosecondTimestamp {
  return createNanosecondTimestamp(date.getTime(), 0);
}

/**
 * Convert nanosecond timestamp to Date (loses sub-millisecond precision)
 */
export function nanosecondsToDate(timestamp: NanosecondTimestamp): Date {
  return new Date(timestamp.milliseconds);
}

/**
 * Add two nanosecond timestamps
 */
export function addNanoseconds(
  a: NanosecondTimestamp,
  b: NanosecondTimestamp
): NanosecondTimestamp {
  return fromNanoseconds(a.totalNanoseconds + b.totalNanoseconds);
}

/**
 * Subtract nanosecond timestamps
 */
export function subtractNanoseconds(
  a: NanosecondTimestamp,
  b: NanosecondTimestamp
): NanosecondTimestamp {
  return fromNanoseconds(a.totalNanoseconds - b.totalNanoseconds);
}

/**
 * Compare nanosecond timestamps
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareNanoseconds(
  a: NanosecondTimestamp,
  b: NanosecondTimestamp
): -1 | 0 | 1 {
  if (a.totalNanoseconds < b.totalNanoseconds) return -1;
  if (a.totalNanoseconds > b.totalNanoseconds) return 1;
  return 0;
}

/**
 * Get current time with nanosecond precision (if available)
 * Falls back to millisecond precision if performance.now() not available
 */
export function nowNanoseconds(): NanosecondTimestamp {
  const now = Date.now();

  // Try to get sub-millisecond precision from performance.now()
  if (typeof performance !== 'undefined' && performance.now) {
    const perfNow = performance.now();
    const microSeconds = Math.round((perfNow % 1) * 1000);
    return createNanosecondTimestamp(now, microSeconds * 1000);
  }

  return createNanosecondTimestamp(now, 0);
}

/**
 * Format nanosecond timestamp to ISO string with sub-millisecond precision
 */
export function formatNanoseconds(timestamp: NanosecondTimestamp): string {
  const date = nanosecondsToDate(timestamp);
  const isoBase = date.toISOString().slice(0, -1); // Remove trailing 'Z'

  // Add nanoseconds (6 additional digits after milliseconds)
  const nsStr = timestamp.nanoseconds.toString().padStart(6, '0');
  return `${isoBase}${nsStr}Z`;
}

/**
 * Parse ISO string with nanosecond precision
 */
export function parseNanoseconds(isoString: string): NanosecondTimestamp | null {
  // Match ISO format: 2024-03-25T14:30:45.123456789Z
  const match = isoString.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3,9})Z?$/
  );

  if (!match) {
    // Try standard parsing
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;
    return dateToNanoseconds(date);
  }

  const [, year, month, day, hour, minute, second, fraction] = match;

  // Build base date with milliseconds
  const ms = parseInt(fraction.slice(0, 3).padEnd(3, '0'), 10);
  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
    parseInt(second, 10),
    ms
  );

  // Calculate nanoseconds beyond milliseconds
  const nsFraction = fraction.slice(3).padEnd(6, '0');
  const nanoseconds = parseInt(nsFraction, 10);

  return createNanosecondTimestamp(date.getTime(), nanoseconds);
}

// ============= High-Resolution Duration =============

/**
 * Create a high-resolution duration
 */
export function createHighResDuration(
  seconds: number,
  nanoseconds: number = 0
): HighResDuration {
  // Normalize: carry over extra seconds from nanoseconds
  const extraSeconds = Math.floor(nanoseconds / 1000000000);
  const normalizedNs = nanoseconds % 1000000000;

  return {
    seconds: seconds + extraSeconds,
    nanoseconds: normalizedNs,
  };
}

/**
 * Add two high-resolution durations
 */
export function addHighResDuration(
  a: HighResDuration,
  b: HighResDuration
): HighResDuration {
  const totalNs = a.nanoseconds + b.nanoseconds;
  const extraSeconds = Math.floor(totalNs / 1000000000);
  const ns = totalNs % 1000000000;

  return {
    seconds: a.seconds + b.seconds + extraSeconds,
    nanoseconds: ns,
  };
}

/**
 * Subtract high-resolution durations
 */
export function subtractHighResDuration(
  a: HighResDuration,
  b: HighResDuration
): HighResDuration {
  let totalNs = a.nanoseconds - b.nanoseconds;
  let seconds = a.seconds - b.seconds;

  if (totalNs < 0) {
    seconds -= 1;
    totalNs += 1000000000;
  }

  return { seconds, nanoseconds: totalNs };
}

/**
 * Convert high-resolution duration to milliseconds
 */
export function highResDurationToMs(duration: HighResDuration): number {
  return duration.seconds * 1000 + duration.nanoseconds / 1000000;
}

/**
 * Convert milliseconds to high-resolution duration
 */
export function msToHighResDuration(ms: number): HighResDuration {
  const seconds = Math.floor(ms / 1000);
  const nanoseconds = Math.round((ms % 1000) * 1000000);
  return { seconds, nanoseconds };
}

// ============= BigInt Timestamp Support =============

/**
 * Convert Unix epoch milliseconds to BigInt
 */
export function toBigIntMs(date: Date): bigint {
  return BigInt(date.getTime());
}

/**
 * Convert BigInt milliseconds to Date
 */
export function fromBigIntMs(ms: bigint): Date {
  return new Date(Number(ms));
}

/**
 * Convert Unix epoch seconds to BigInt
 */
export function toBigIntSeconds(date: Date): bigint {
  return BigInt(Math.floor(date.getTime() / 1000));
}

/**
 * Convert BigInt seconds to Date
 */
export function fromBigIntSeconds(seconds: bigint): Date {
  return new Date(Number(seconds) * 1000);
}

/**
 * Add milliseconds (as BigInt) to a date
 */
export function addBigIntMs(date: Date, ms: bigint): Date {
  const current = toBigIntMs(date);
  return fromBigIntMs(current + ms);
}

/**
 * Subtract milliseconds (as BigInt) from a date
 */
export function subtractBigIntMs(date: Date, ms: bigint): Date {
  const current = toBigIntMs(date);
  return fromBigIntMs(current - ms);
}

/**
 * Calculate difference between dates in BigInt milliseconds
 */
export function diffBigIntMs(a: Date, b: Date): bigint {
  return toBigIntMs(a) - toBigIntMs(b);
}

// ============= DST Transition Handling =============

/**
 * DST transition info
 */
export interface DSTTransition {
  /** Transition date/time (UTC) */
  readonly utc: Date;
  /** Transition date/time (local) */
  readonly local: Date;
  /** Whether transitioning to DST */
  readonly toDST: boolean;
  /** Offset before transition (minutes) */
  readonly offsetBefore: number;
  /** Offset after transition (minutes) */
  readonly offsetAfter: number;
  /** Gap or overlap duration (minutes) */
  readonly adjustmentMinutes: number;
}

/**
 * Check if a date falls in a DST transition gap (skipped time)
 * @param date - Date to check
 * @param timeZone - IANA timezone (optional, uses local if not provided)
 */
export function isInDSTGap(date: Date, timeZone?: string): boolean {
  if (timeZone) {
    // For specific timezone, we need to check around this time
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour12: false,
    });

    // Get 1 minute before and after
    const before = new Date(date.getTime() - 60000);
    const after = new Date(date.getTime() + 60000);

    const beforeParts = formatter.formatToParts(before);
    const afterParts = formatter.formatToParts(after);

    const getMinuteValue = (parts: Intl.DateTimeFormatPart[]) => {
      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      return h * 60 + m;
    };

    // If there's a jump of more than 2 minutes between 1 min before and 1 min after,
    // we're likely in a gap
    const beforeMinute = getMinuteValue(beforeParts);
    const afterMinute = getMinuteValue(afterParts);
    const diff = afterMinute - beforeMinute;

    // Account for day boundary
    const adjustedDiff = diff < 0 ? diff + 1440 : diff;
    return adjustedDiff > 62; // Allow 2 minute variance + DST gap (typically 60 min)
  }

  // For local timezone, compare UTC offset around this time
  const before = new Date(date.getTime() - 60000);
  const after = new Date(date.getTime() + 60000);

  const offsetBefore = before.getTimezoneOffset();
  const offsetAfter = after.getTimezoneOffset();

  // If offset changes and goes from larger to smaller (spring forward), it's a gap
  return offsetBefore > offsetAfter;
}

/**
 * Check if a date falls in a DST overlap (ambiguous time)
 * @param date - Date to check
 * @param timeZone - IANA timezone (optional, uses local if not provided)
 */
export function isInDSTOverlap(date: Date, timeZone?: string): boolean {
  if (timeZone) {
    // Similar approach as isInDSTGap but for fall-back
    // This is harder to detect accurately without full TZ database
    return false; // Simplified: would need TZ data for accurate detection
  }

  // For local timezone
  const before = new Date(date.getTime() - 60000);
  const after = new Date(date.getTime() + 60000);

  const offsetBefore = before.getTimezoneOffset();
  const offsetAfter = after.getTimezoneOffset();

  // If offset goes from smaller to larger (fall back), it's an overlap
  return offsetBefore < offsetAfter;
}

/**
 * Find DST transitions in a year for local timezone
 */
export function getDSTTransitionsInYear(year: number): DSTTransition[] {
  const transitions: DSTTransition[] = [];

  let prevOffset = new Date(year, 0, 1).getTimezoneOffset();

  // Check each day of the year
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const currentOffset = date.getTimezoneOffset();

      if (currentOffset !== prevOffset) {
        // Found a transition - now find exact hour
        for (let hour = 0; hour < 24; hour++) {
          const hourDate = new Date(year, month, day, hour);
          const hourOffset = hourDate.getTimezoneOffset();

          if (hourOffset !== prevOffset) {
            const toDST = hourOffset < prevOffset;
            const adjustmentMinutes = Math.abs(hourOffset - prevOffset);

            transitions.push({
              utc: new Date(Date.UTC(year, month, day, hour)),
              local: hourDate,
              toDST,
              offsetBefore: -prevOffset, // Convert to positive = UTC+X
              offsetAfter: -hourOffset,
              adjustmentMinutes,
            });

            prevOffset = hourOffset;
            break;
          }
        }
      }
      prevOffset = currentOffset;
    }
  }

  return transitions;
}

/**
 * Resolve ambiguous time in DST overlap
 * @param date - Potentially ambiguous date
 * @param prefer - Prefer 'earlier' or 'later' interpretation
 */
export function resolveAmbiguousTime(
  date: Date,
  prefer: 'earlier' | 'later' = 'earlier'
): Date {
  if (!isInDSTOverlap(date)) {
    return date;
  }

  // During overlap, the same local time occurs twice
  // The 'earlier' occurrence is DST (smaller offset)
  // The 'later' occurrence is standard time (larger offset)
  const offset = date.getTimezoneOffset();

  if (prefer === 'earlier') {
    // Return DST interpretation (typically 1 hour earlier in UTC)
    return new Date(date.getTime() - 60 * 60 * 1000);
  } else {
    // Return standard time interpretation
    return date;
  }
}

// ============= Invalid Date Handling =============

/**
 * Validated Date wrapper that guarantees a valid date
 */
export class ValidDate {
  private readonly _date: Date;

  private constructor(date: Date) {
    this._date = date;
  }

  /**
   * Create a ValidDate, throws if invalid
   */
  static from(date: Date): ValidDate {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid Date');
    }
    return new ValidDate(date);
  }

  /**
   * Create a ValidDate, returns null if invalid
   */
  static tryFrom(date: Date): ValidDate | null {
    if (isNaN(date.getTime())) {
      return null;
    }
    return new ValidDate(date);
  }

  /**
   * Create from timestamp, throws if invalid
   */
  static fromTimestamp(ms: number): ValidDate {
    const date = new Date(ms);
    return ValidDate.from(date);
  }

  /**
   * Create from ISO string, throws if invalid
   */
  static fromISO(isoString: string): ValidDate {
    const date = new Date(isoString);
    return ValidDate.from(date);
  }

  /**
   * Get the underlying Date object
   */
  get value(): Date {
    return new Date(this._date.getTime()); // Return copy for immutability
  }

  /**
   * Get timestamp
   */
  get time(): number {
    return this._date.getTime();
  }

  /**
   * Format to ISO string
   */
  toISOString(): string {
    return this._date.toISOString();
  }

  /**
   * Format to locale string
   */
  toLocaleString(locale?: string, options?: Intl.DateTimeFormatOptions): string {
    return this._date.toLocaleString(locale, options);
  }
}

/**
 * Ensure a date is valid, with fallback
 */
export function ensureValidDate(date: Date, fallback: Date = new Date()): Date {
  return isNaN(date.getTime()) ? fallback : date;
}

/**
 * Parse date with validation
 */
export function parseValidDate(input: string | number | Date): Date | null {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Assert date is valid, throws if not
 */
export function assertValidDate(date: Date, message?: string): asserts date is Date & { getTime(): number } {
  if (isNaN(date.getTime())) {
    throw new Error(message || 'Invalid Date');
  }
}

// ============= Leap Second Awareness =============

/**
 * Known leap seconds (added at end of these dates, 23:59:60 UTC)
 * List from https://www.ietf.org/timezones/data/leap-seconds.list
 */
export const LEAP_SECONDS: readonly Date[] = [
  new Date('1972-06-30T23:59:59Z'),
  new Date('1972-12-31T23:59:59Z'),
  new Date('1973-12-31T23:59:59Z'),
  new Date('1974-12-31T23:59:59Z'),
  new Date('1975-12-31T23:59:59Z'),
  new Date('1976-12-31T23:59:59Z'),
  new Date('1977-12-31T23:59:59Z'),
  new Date('1978-12-31T23:59:59Z'),
  new Date('1979-12-31T23:59:59Z'),
  new Date('1981-06-30T23:59:59Z'),
  new Date('1982-06-30T23:59:59Z'),
  new Date('1983-06-30T23:59:59Z'),
  new Date('1985-06-30T23:59:59Z'),
  new Date('1987-12-31T23:59:59Z'),
  new Date('1989-12-31T23:59:59Z'),
  new Date('1990-12-31T23:59:59Z'),
  new Date('1992-06-30T23:59:59Z'),
  new Date('1993-06-30T23:59:59Z'),
  new Date('1994-06-30T23:59:59Z'),
  new Date('1995-12-31T23:59:59Z'),
  new Date('1997-06-30T23:59:59Z'),
  new Date('1998-12-31T23:59:59Z'),
  new Date('2005-12-31T23:59:59Z'),
  new Date('2008-12-31T23:59:59Z'),
  new Date('2012-06-30T23:59:59Z'),
  new Date('2015-06-30T23:59:59Z'),
  new Date('2016-12-31T23:59:59Z'),
] as const;

/**
 * Get number of leap seconds between two dates
 */
export function leapSecondsBetween(start: Date, end: Date): number {
  let count = 0;
  for (const ls of LEAP_SECONDS) {
    if (ls >= start && ls < end) {
      count++;
    }
  }
  return count;
}

/**
 * Check if a date is near a leap second (within 1 second)
 */
export function isNearLeapSecond(date: Date): boolean {
  const time = date.getTime();
  return LEAP_SECONDS.some(ls => Math.abs(ls.getTime() - time) <= 1000);
}

/**
 * Convert TAI (International Atomic Time) to UTC
 * TAI = UTC + accumulated leap seconds + 10 (initial offset)
 */
export function taiToUtc(taiMs: number): Date {
  // Count leap seconds before this TAI time
  const utcApprox = new Date(taiMs);
  const leapSeconds = leapSecondsBetween(new Date(0), utcApprox);
  // TAI started 10 seconds ahead of UTC at Unix epoch
  return new Date(taiMs - (leapSeconds + 10) * 1000);
}

/**
 * Convert UTC to TAI
 */
export function utcToTai(date: Date): number {
  const leapSeconds = leapSecondsBetween(new Date(0), date);
  return date.getTime() + (leapSeconds + 10) * 1000;
}
