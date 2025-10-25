/**
 * @fileoverview Countdown and timer utilities for tracking time until/since a target date
 * Provides countdown timers, remaining time calculations, and progress tracking
 */

import type { DateInput } from './types.js';

/**
 * Represents the remaining time broken down by units
 */
export interface RemainingTime {
  /** Total milliseconds remaining */
  totalMilliseconds: number;
  /** Total seconds remaining */
  totalSeconds: number;
  /** Total minutes remaining */
  totalMinutes: number;
  /** Total hours remaining */
  totalHours: number;
  /** Total days remaining */
  totalDays: number;
  /** Milliseconds component (0-999) */
  milliseconds: number;
  /** Seconds component (0-59) */
  seconds: number;
  /** Minutes component (0-59) */
  minutes: number;
  /** Hours component (0-23) */
  hours: number;
  /** Days component */
  days: number;
  /** Weeks component */
  weeks: number;
  /** Whether the target date has passed */
  isExpired: boolean;
}

/**
 * Options for countdown creation
 */
export interface CountdownOptions {
  /** Callback fired on each tick */
  onTick?: (remaining: RemainingTime) => void;
  /** Callback fired when countdown reaches zero */
  onComplete?: () => void;
  /** Callback fired if target date is in the past */
  onExpired?: () => void;
  /** Tick interval in milliseconds (default: 1000) */
  interval?: number;
  /** Whether to fire onTick immediately (default: true) */
  immediate?: boolean;
}

/**
 * Countdown timer instance
 */
export interface Countdown {
  /** Start the countdown */
  start: () => void;
  /** Stop the countdown */
  stop: () => void;
  /** Reset countdown with a new target date */
  reset: (targetDate: DateInput) => void;
  /** Get current remaining time */
  getRemaining: () => RemainingTime;
  /** Check if countdown is running */
  isRunning: () => boolean;
  /** Check if target date has passed */
  isExpired: () => boolean;
}

/**
 * Creates a countdown timer to a target date
 * @param targetDate - The date to count down to
 * @param options - Countdown options and callbacks
 * @returns A countdown instance with control methods
 * 
 * @example
 * ```ts
 * const countdown = createCountdown(
 *   new Date('2024-12-31T23:59:59'),
 *   {
 *     onTick: (remaining) => {
 *       console.log(`${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`);
 *     },
 *     onComplete: () => {
 *       console.log('Happy New Year!');
 *     }
 *   }
 * );
 * 
 * countdown.start();
 * // Later...
 * countdown.stop();
 * ```
 */
export function createCountdown(
  targetDate: DateInput,
  options: CountdownOptions = {}
): Countdown {
  let target = new Date(targetDate);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let running = false;
  
  const {
    onTick,
    onComplete,
    onExpired,
    interval = 1000,
    immediate = true
  } = options;
  
  const getRemaining = (): RemainingTime => {
    return getRemainingTime(target);
  };
  
  const tick = () => {
    const remaining = getRemaining();
    
    if (onTick) {
      onTick(remaining);
    }
    
    if (remaining.isExpired) {
      stop();
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  const start = () => {
    if (running) return;
    
    const remaining = getRemaining();
    if (remaining.totalMilliseconds < 0) {
      if (onExpired) {
        onExpired();
      }
      return;
    }
    
    running = true;
    
    if (immediate) {
      tick();
    }
    
    intervalId = setInterval(tick, interval);
  };
  
  const stop = () => {
    if (!running) return;
    
    running = false;
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  const reset = (newTarget: DateInput) => {
    stop();
    target = new Date(newTarget);
  };
  
  const isRunning = () => running;
  
  const isExpiredCheck = () => {
    return getRemaining().isExpired;
  };
  
  return {
    start,
    stop,
    reset,
    getRemaining,
    isRunning,
    isExpired: isExpiredCheck
  };
}

/**
 * Gets the remaining time until/since a target date
 * @param targetDate - The target date
 * @param fromDate - The date to calculate from (defaults to now)
 * @returns Object with remaining time broken down by units
 * 
 * @example
 * ```ts
 * const remaining = getRemainingTime(new Date('2024-12-31'));
 * console.log(`${remaining.days} days, ${remaining.hours} hours remaining`);
 * 
 * // Check if expired
 * if (remaining.isExpired) {
 *   console.log('Target date has passed');
 * }
 * ```
 */
export function getRemainingTime(
  targetDate: DateInput,
  fromDate: DateInput = new Date()
): RemainingTime {
  const target = new Date(targetDate);
  const from = new Date(fromDate);
  
  const totalMilliseconds = target.getTime() - from.getTime();
  const isExpired = totalMilliseconds <= 0;
  
  // Use absolute values for calculations
  const absTotalMs = Math.abs(totalMilliseconds);
  
  const totalSeconds = Math.floor(absTotalMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  
  const milliseconds = Math.floor(absTotalMs % 1000);
  const seconds = totalSeconds % 60;
  const minutes = totalMinutes % 60;
  const hours = totalHours % 24;
  const days = totalDays % 7;
  const weeks = Math.floor(totalDays / 7);
  
  return {
    totalMilliseconds,
    totalSeconds: totalMilliseconds >= 0 ? totalSeconds : -totalSeconds,
    totalMinutes: totalMilliseconds >= 0 ? totalMinutes : -totalMinutes,
    totalHours: totalMilliseconds >= 0 ? totalHours : -totalHours,
    totalDays: totalMilliseconds >= 0 ? totalDays : -totalDays,
    milliseconds,
    seconds,
    minutes,
    hours,
    days,
    weeks,
    isExpired
  };
}

/**
 * Formats the remaining time as a human-readable string
 * @param targetDate - The target date
 * @param options - Formatting options
 * @returns Formatted countdown string
 * 
 * @example
 * ```ts
 * formatCountdown(new Date('2024-12-31'));
 * // "45d 12h 30m 15s"
 * 
 * formatCountdown(new Date('2024-12-31'), { units: ['days', 'hours'] });
 * // "45 days, 12 hours"
 * 
 * formatCountdown(new Date('2024-12-31'), { short: false });
 * // "45 days 12 hours 30 minutes 15 seconds"
 * ```
 */
export function formatCountdown(
  targetDate: DateInput,
  options: {
    /** Units to include in output */
    units?: ('weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds')[];
    /** Use short format (d, h, m, s) */
    short?: boolean;
    /** Maximum number of units to show */
    maxUnits?: number;
    /** Show zero values */
    showZero?: boolean;
    /** Separator between units */
    separator?: string;
  } = {}
): string {
  const {
    units = ['days', 'hours', 'minutes', 'seconds'],
    short = true,
    maxUnits,
    showZero = false,
    separator = ' '
  } = options;
  
  const remaining = getRemainingTime(targetDate);
  
  if (remaining.isExpired) {
    return 'Expired';
  }
  
  const parts: string[] = [];
  
  for (const unit of units) {
    const value = remaining[unit];
    
    if (value === 0 && !showZero && parts.length === 0) {
      continue;
    }
    
    if (value === 0 && !showZero) {
      continue;
    }
    
    if (maxUnits && parts.length >= maxUnits) {
      break;
    }
    
    if (short) {
      const shortUnit = unit[0];
      parts.push(`${value}${shortUnit}`);
    } else {
      const unitName = value === 1 ? unit.slice(0, -1) : unit;
      parts.push(`${value} ${unitName}`);
    }
  }
  
  return parts.length > 0 ? parts.join(separator) : '0s';
}

/**
 * Checks if a date has expired (is in the past)
 * @param date - The date to check
 * @param fromDate - The reference date (defaults to now)
 * @returns True if the date is in the past
 * 
 * @example
 * ```ts
 * isExpired(new Date('2020-01-01')); // true
 * isExpired(new Date('2030-01-01')); // false
 * ```
 */
export function isExpired(date: DateInput, fromDate: DateInput = new Date()): boolean {
  const checkDate = new Date(date);
  const from = new Date(fromDate);
  return checkDate.getTime() < from.getTime();
}

/**
 * Calculates the progress percentage between two dates
 * @param startDate - The start date
 * @param endDate - The end date
 * @param currentDate - The current date (defaults to now)
 * @returns Progress percentage (0-100), clamped to range
 * 
 * @example
 * ```ts
 * const progress = getProgressPercentage(
 *   new Date('2024-01-01'),
 *   new Date('2024-12-31'),
 *   new Date('2024-07-01')
 * );
 * console.log(`${progress}% complete`); // ~50% complete
 * ```
 */
export function getProgressPercentage(
  startDate: DateInput,
  endDate: DateInput,
  currentDate: DateInput = new Date()
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const current = new Date(currentDate).getTime();
  
  if (start >= end) {
    throw new Error('Start date must be before end date');
  }
  
  const total = end - start;
  const elapsed = current - start;
  
  const percentage = (elapsed / total) * 100;
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Gets time until a target date in a specific unit
 * @param targetDate - The target date
 * @param unit - The unit to return
 * @param fromDate - The date to calculate from (defaults to now)
 * @returns Time remaining in the specified unit
 * 
 * @example
 * ```ts
 * getTimeUntil(new Date('2024-12-31'), 'days'); // 45.5
 * getTimeUntil(new Date('2024-12-31'), 'hours'); // 1092
 * getTimeUntil(new Date('2024-12-31'), 'weeks'); // 6.5
 * ```
 */
export function getTimeUntil(
  targetDate: DateInput,
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks',
  fromDate: DateInput = new Date()
): number {
  const remaining = getRemainingTime(targetDate, fromDate);
  
  switch (unit) {
    case 'milliseconds':
      return remaining.totalMilliseconds;
    case 'seconds':
      return remaining.totalSeconds;
    case 'minutes':
      return remaining.totalMinutes;
    case 'hours':
      return remaining.totalHours;
    case 'days':
      return remaining.totalDays;
    case 'weeks':
      return remaining.totalDays / 7;
    default:
      return remaining.totalMilliseconds;
  }
}

/**
 * Creates a deadline object with useful methods
 * @param targetDate - The deadline date
 * @returns An object with deadline-related methods
 * 
 * @example
 * ```ts
 * const deadline = createDeadline(new Date('2024-12-31'));
 * 
 * deadline.isExpired(); // false
 * deadline.daysRemaining(); // 45
 * deadline.hoursRemaining(); // 1092
 * deadline.formatRemaining(); // "45d 12h 30m"
 * deadline.progressFrom(new Date('2024-01-01')); // 67.5%
 * ```
 */
export function createDeadline(targetDate: DateInput) {
  const target = new Date(targetDate);
  
  return {
    target,
    isExpired: () => isExpired(target),
    getRemaining: () => getRemainingTime(target),
    daysRemaining: () => getTimeUntil(target, 'days'),
    hoursRemaining: () => getTimeUntil(target, 'hours'),
    minutesRemaining: () => getTimeUntil(target, 'minutes'),
    secondsRemaining: () => getTimeUntil(target, 'seconds'),
    formatRemaining: (options?: Parameters<typeof formatCountdown>[1]) => 
      formatCountdown(target, options),
    progressFrom: (startDate: DateInput) => 
      getProgressPercentage(startDate, target),
    countdown: (options?: CountdownOptions) => 
      createCountdown(target, options)
  };
}
