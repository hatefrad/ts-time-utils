/**
 * @fileoverview Recurring events and pattern-based date generation utilities
 * Provides RRULE-inspired recurrence patterns for creating repeating events
 */

import type { DateInput, RecurrenceRule, RecurrenceFrequency } from './types.js';
import { addTime } from './calculate.js';

/**
 * Creates a recurrence pattern generator
 * @param rule - The recurrence rule defining the pattern
 * @returns An object with methods to work with the recurrence
 * 
 * @example
 * ```ts
 * // Daily recurrence
 * const daily = createRecurrence({
 *   frequency: 'daily',
 *   interval: 1,
 *   startDate: new Date('2024-01-01')
 * });
 * 
 * // Weekly on Monday and Wednesday
 * const weekly = createRecurrence({
 *   frequency: 'weekly',
 *   interval: 1,
 *   startDate: new Date('2024-01-01'),
 *   byWeekday: [1, 3] // Monday = 1, Wednesday = 3
 * });
 * 
 * // Monthly on the 15th
 * const monthly = createRecurrence({
 *   frequency: 'monthly',
 *   interval: 1,
 *   startDate: new Date('2024-01-01'),
 *   byMonthDay: [15]
 * });
 * ```
 */
export function createRecurrence(rule: RecurrenceRule) {
  const startDate = new Date(rule.startDate);
  
  return {
    rule,
    getNextOccurrence: (afterDate?: DateInput) => getNextOccurrence(rule, afterDate),
    getOccurrencesBetween: (start: DateInput, end: DateInput, limit?: number) => 
      getOccurrencesBetween(rule, start, end, limit),
    isRecurrenceDate: (date: DateInput) => isRecurrenceDate(date, rule),
    getAllOccurrences: (limit = 100) => {
      const occurrences: Date[] = [];
      let current = new Date(startDate);
      let count = 0;
      
      while (count < limit) {
        if (rule.until && current > new Date(rule.until)) break;
        if (rule.count && count >= rule.count) break;
        
        const next = getNextOccurrence(rule, current);
        if (!next) break;
        
        occurrences.push(next);
        current = new Date(next.getTime() + 1);
        count++;
      }
      
      return occurrences;
    }
  };
}

/**
 * Gets the next occurrence of a recurring event after a specified date
 * @param rule - The recurrence rule
 * @param afterDate - Date to find next occurrence after (defaults to now)
 * @returns The next occurrence date, or null if no more occurrences
 * 
 * @example
 * ```ts
 * const rule = {
 *   frequency: 'daily',
 *   interval: 2,
 *   startDate: new Date('2024-01-01')
 * };
 * 
 * const next = getNextOccurrence(rule, new Date('2024-01-05'));
 * // Returns Date('2024-01-07') - every other day
 * ```
 */
export function getNextOccurrence(rule: RecurrenceRule, afterDate?: DateInput): Date | null {
  const after = afterDate ? new Date(afterDate) : new Date();
  const start = new Date(rule.startDate);
  
  // If afterDate is before start, check if start matches
  if (after < start) {
    if (matchesRecurrenceRule(start, rule)) {
      return new Date(start);
    }
  }
  
  // Check if we've exceeded count or until date
  if (rule.until && after >= new Date(rule.until)) {
    return null;
  }
  
  // Start searching from the day after 'after'
  // We want strictly greater than after, so start from the next potential occurrence
  let candidate = addTime(after, 1, 'day');
  
  // Preserve time from start date
  candidate.setHours(start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds());
  
  const maxIterations = 1000; // Prevent infinite loops
  let iterations = 0;
  
  while (iterations < maxIterations) {
    if (rule.until && candidate > new Date(rule.until)) {
      return null;
    }
    
    if (matchesRecurrenceRule(candidate, rule)) {
      return new Date(candidate);
    }
    
    // Move to next potential date based on frequency
    candidate = getNextCandidate(candidate, rule);
    iterations++;
  }
  
  return null;
}

/**
 * Gets all occurrences of a recurring event between two dates
 * @param rule - The recurrence rule
 * @param start - Start date of the range
 * @param end - End date of the range
 * @param limit - Maximum number of occurrences to return (default: 1000)
 * @returns Array of dates that match the recurrence pattern
 * 
 * @example
 * ```ts
 * const rule = {
 *   frequency: 'weekly',
 *   interval: 1,
 *   startDate: new Date('2024-01-01'),
 *   byWeekday: [1, 5] // Monday and Friday
 * };
 * 
 * const occurrences = getOccurrencesBetween(
 *   rule,
 *   new Date('2024-01-01'),
 *   new Date('2024-01-31')
 * );
 * // Returns all Mondays and Fridays in January 2024
 * ```
 */
export function getOccurrencesBetween(
  rule: RecurrenceRule,
  start: DateInput,
  end: DateInput,
  limit = 1000
): Date[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const occurrences: Date[] = [];
  
  let current = new Date(rule.startDate);
  
  // Fast forward to start date if recurrence starts before range
  if (current < startDate) {
    current = new Date(startDate);
  }
  
  let iterations = 0;
  const maxIterations = limit * 10; // Safety limit
  
  while (current <= endDate && occurrences.length < limit && iterations < maxIterations) {
    if (rule.until && current > new Date(rule.until)) {
      break;
    }
    
    if (matchesRecurrenceRule(current, rule) && current >= startDate) {
      occurrences.push(new Date(current));
    }
    
    current = getNextCandidate(current, rule);
    iterations++;
  }
  
  return occurrences;
}

/**
 * Checks if a specific date matches a recurrence rule
 * @param date - The date to check
 * @param rule - The recurrence rule
 * @returns True if the date matches the recurrence pattern
 * 
 * @example
 * ```ts
 * const rule = {
 *   frequency: 'weekly',
 *   interval: 1,
 *   startDate: new Date('2024-01-01'),
 *   byWeekday: [1] // Mondays only
 * };
 * 
 * isRecurrenceDate(new Date('2024-01-08'), rule); // true (Monday)
 * isRecurrenceDate(new Date('2024-01-09'), rule); // false (Tuesday)
 * ```
 */
export function isRecurrenceDate(date: DateInput, rule: RecurrenceRule): boolean {
  const checkDate = new Date(date);
  const start = new Date(rule.startDate);
  
  // Must be on or after start date
  if (checkDate < start) return false;
  
  // Must be before until date if specified
  if (rule.until && checkDate > new Date(rule.until)) return false;
  
  return matchesRecurrenceRule(checkDate, rule);
}

/**
 * Validates a recurrence rule
 * @param rule - The recurrence rule to validate
 * @returns True if the rule is valid
 * 
 * @example
 * ```ts
 * isValidRecurrenceRule({
 *   frequency: 'daily',
 *   interval: 1,
 *   startDate: new Date()
 * }); // true
 * 
 * isValidRecurrenceRule({
 *   frequency: 'daily',
 *   interval: 0, // Invalid
 *   startDate: new Date()
 * }); // false
 * ```
 */
export function isValidRecurrenceRule(rule: Partial<RecurrenceRule>): boolean {
  if (!rule.frequency || !rule.startDate) return false;
  
  const validFrequencies: RecurrenceFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];
  if (!validFrequencies.includes(rule.frequency)) return false;
  
  if (rule.interval !== undefined && rule.interval < 1) return false;
  
  if (rule.count !== undefined && rule.count < 1) return false;
  
  if (rule.until) {
    const until = new Date(rule.until);
    const start = new Date(rule.startDate);
    if (until <= start) return false;
  }
  
  if (rule.byWeekday) {
    if (!Array.isArray(rule.byWeekday)) return false;
    if (!rule.byWeekday.every((d: number) => d >= 0 && d <= 6)) return false;
  }
  
  if (rule.byMonthDay) {
    if (!Array.isArray(rule.byMonthDay)) return false;
    if (!rule.byMonthDay.every((d: number) => d >= 1 && d <= 31)) return false;
  }
  
  if (rule.byMonth) {
    if (!Array.isArray(rule.byMonth)) return false;
    if (!rule.byMonth.every((m: number) => m >= 1 && m <= 12)) return false;
  }
  
  return true;
}

/**
 * Converts a recurrence rule to a human-readable string
 * @param rule - The recurrence rule
 * @returns A human-readable description
 * 
 * @example
 * ```ts
 * const rule = {
 *   frequency: 'weekly',
 *   interval: 2,
 *   startDate: new Date('2024-01-01'),
 *   byWeekday: [1, 3, 5]
 * };
 * 
 * recurrenceToString(rule);
 * // "Every 2 weeks on Monday, Wednesday, Friday"
 * ```
 */
export function recurrenceToString(rule: RecurrenceRule): string {
  const interval = rule.interval || 1;
  let result = interval === 1 ? 'Every' : `Every ${interval}`;
  
  switch (rule.frequency) {
    case 'daily':
      result += interval === 1 ? ' day' : ' days';
      break;
    case 'weekly':
      result += interval === 1 ? ' week' : ' weeks';
      if (rule.byWeekday && rule.byWeekday.length > 0) {
        const days = rule.byWeekday.map((d: number) => 
          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]
        );
        result += ` on ${days.join(', ')}`;
      }
      break;
    case 'monthly':
      result += interval === 1 ? ' month' : ' months';
      if (rule.byMonthDay && rule.byMonthDay.length > 0) {
        result += ` on day ${rule.byMonthDay.join(', ')}`;
      }
      break;
    case 'yearly':
      result += interval === 1 ? ' year' : ' years';
      if (rule.byMonth && rule.byMonth.length > 0) {
        const months = rule.byMonth.map((m: number) => 
          ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December'][m - 1]
        );
        result += ` in ${months.join(', ')}`;
      }
      if (rule.byMonthDay && rule.byMonthDay.length > 0) {
        result += ` on day ${rule.byMonthDay.join(', ')}`;
      }
      break;
  }
  
  if (rule.count) {
    result += ` (${rule.count} times)`;
  } else if (rule.until) {
    result += ` until ${new Date(rule.until).toLocaleDateString()}`;
  }
  
  return result;
}

// Helper functions

function matchesRecurrenceRule(date: Date, rule: RecurrenceRule): boolean {
  const start = new Date(rule.startDate);
  start.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const interval = rule.interval || 1;
  
  // Check if date matches the frequency and interval
  switch (rule.frequency) {
    case 'daily': {
      // Calculate days difference more reliably
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysDiff = Math.round((checkDate.getTime() - start.getTime()) / msPerDay);
      if (daysDiff < 0) return false;
      if (daysDiff % interval !== 0) return false;
      break;
    }
    case 'weekly': {
      // If byWeekday is specified, check if current day matches
      if (rule.byWeekday && rule.byWeekday.length > 0) {
        if (!rule.byWeekday.includes(date.getDay())) {
          return false;
        }
      } else {
        // No specific weekdays - match same day of week as start
        if (date.getDay() !== start.getDay()) return false;
      }
      
      // Check interval
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysDiff = Math.round((checkDate.getTime() - start.getTime()) / msPerDay);
      const weeksDiff = Math.floor(daysDiff / 7);
      if (weeksDiff % interval !== 0) return false;
      break;
    }
    case 'monthly': {
      const monthsDiff = 
        (date.getFullYear() - start.getFullYear()) * 12 + 
        (date.getMonth() - start.getMonth());
      if (monthsDiff < 0) return false;
      if (monthsDiff % interval !== 0) return false;
      
      if (rule.byMonthDay && !rule.byMonthDay.includes(date.getDate())) {
        return false;
      }
      break;
    }
    case 'yearly': {
      const yearsDiff = date.getFullYear() - start.getFullYear();
      if (yearsDiff < 0) return false;
      if (yearsDiff % interval !== 0) return false;
      
      if (rule.byMonth && !rule.byMonth.includes(date.getMonth() + 1)) {
        return false;
      }
      
      if (rule.byMonthDay && !rule.byMonthDay.includes(date.getDate())) {
        return false;
      }
      break;
    }
  }
  
  return true;
}

function getNextCandidate(date: Date, rule: RecurrenceRule): Date {
  const interval = rule.interval || 1;
  
  switch (rule.frequency) {
    case 'daily':
      // For daily recurrence, always increment by 1 day to check each day
      // matchesRecurrenceRule will filter based on interval
      return addTime(date, 1, 'day');
    case 'weekly':
      // If we have specific weekdays, try next day, otherwise skip full interval
      if (rule.byWeekday && rule.byWeekday.length > 0) {
        return addTime(date, 1, 'day');
      }
      return addTime(date, interval * 7, 'day');
    case 'monthly':
      // If we have specific days of month, try next day, otherwise skip full interval
      if (rule.byMonthDay && rule.byMonthDay.length > 0) {
        return addTime(date, 1, 'day');
      }
      return addTime(date, interval, 'month');
    case 'yearly':
      // If we have specific months or days, try next day, otherwise skip full interval
      if ((rule.byMonth && rule.byMonth.length > 0) || 
          (rule.byMonthDay && rule.byMonthDay.length > 0)) {
        return addTime(date, 1, 'day');
      }
      return addTime(date, interval, 'year');
    default:
      return addTime(date, 1, 'day');
  }
}
