/**
 * Cron expression utilities for scheduling
 */

export interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface ParsedCronField {
  type: 'all' | 'specific' | 'range' | 'step' | 'list';
  values: number[];
}

/**
 * Parse a cron expression into its parts
 * @param expression - cron expression (5 fields: minute hour dayOfMonth month dayOfWeek)
 */
export function parseCronExpression(expression: string): CronParts | null {
  const parts = expression.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    return null;
  }
  
  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };
}

/**
 * Parse a cron field into its numeric values
 * @param field - cron field string (e.g., "star/5", "1-5", "1,2,3", "*")
 * @param min - minimum valid value
 * @param max - maximum valid value
 */
export function parseCronField(field: string, min: number, max: number): ParsedCronField | null {
  const values: number[] = [];
  
  // Handle wildcard
  if (field === '*') {
    for (let i = min; i <= max; i++) {
      values.push(i);
    }
    return { type: 'all', values };
  }
  
  // Handle step values (*/n or range/n)
  if (field.includes('/')) {
    const [range, stepStr] = field.split('/');
    const step = parseInt(stepStr, 10);
    
    if (isNaN(step) || step <= 0) return null;
    
    let start = min;
    let end = max;
    
    if (range !== '*') {
      if (range.includes('-')) {
        const [s, e] = range.split('-').map(Number);
        start = s;
        end = e;
      } else {
        start = parseInt(range, 10);
      }
    }
    
    for (let i = start; i <= end; i += step) {
      values.push(i);
    }
    return { type: 'step', values };
  }
  
  // Handle range (n-m)
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number);
    
    if (isNaN(start) || isNaN(end) || start > end) return null;
    
    for (let i = start; i <= end; i++) {
      values.push(i);
    }
    return { type: 'range', values };
  }
  
  // Handle list (n,m,o)
  if (field.includes(',')) {
    const items = field.split(',').map(Number);
    
    if (items.some(isNaN)) return null;
    
    return { type: 'list', values: items.sort((a, b) => a - b) };
  }
  
  // Handle specific value
  const value = parseInt(field, 10);
  if (isNaN(value) || value < min || value > max) return null;
  
  return { type: 'specific', values: [value] };
}

/**
 * Check if a date matches a cron expression
 * @param date - date to check
 * @param expression - cron expression
 */
export function matchesCron(date: Date, expression: string): boolean {
  const parts = parseCronExpression(expression);
  if (!parts) return false;
  
  const minute = parseCronField(parts.minute, 0, 59);
  const hour = parseCronField(parts.hour, 0, 23);
  const dayOfMonth = parseCronField(parts.dayOfMonth, 1, 31);
  const month = parseCronField(parts.month, 1, 12);
  const dayOfWeek = parseCronField(parts.dayOfWeek, 0, 6);
  
  if (!minute || !hour || !dayOfMonth || !month || !dayOfWeek) {
    return false;
  }
  
  return (
    minute.values.includes(date.getMinutes()) &&
    hour.values.includes(date.getHours()) &&
    dayOfMonth.values.includes(date.getDate()) &&
    month.values.includes(date.getMonth() + 1) &&
    dayOfWeek.values.includes(date.getDay())
  );
}

/**
 * Get the next date that matches a cron expression
 * @param expression - cron expression
 * @param after - start searching after this date (default: now)
 * @param maxIterations - maximum iterations to prevent infinite loops
 */
export function getNextCronDate(
  expression: string,
  after: Date = new Date(),
  maxIterations: number = 525600 // Max 1 year in minutes
): Date | null {
  const parts = parseCronExpression(expression);
  if (!parts) return null;
  
  const minute = parseCronField(parts.minute, 0, 59);
  const hour = parseCronField(parts.hour, 0, 23);
  const dayOfMonth = parseCronField(parts.dayOfMonth, 1, 31);
  const month = parseCronField(parts.month, 1, 12);
  const dayOfWeek = parseCronField(parts.dayOfWeek, 0, 6);
  
  if (!minute || !hour || !dayOfMonth || !month || !dayOfWeek) {
    return null;
  }
  
  const candidate = new Date(after);
  candidate.setSeconds(0, 0);
  candidate.setMinutes(candidate.getMinutes() + 1);
  
  for (let i = 0; i < maxIterations; i++) {
    if (
      minute.values.includes(candidate.getMinutes()) &&
      hour.values.includes(candidate.getHours()) &&
      dayOfMonth.values.includes(candidate.getDate()) &&
      month.values.includes(candidate.getMonth() + 1) &&
      dayOfWeek.values.includes(candidate.getDay())
    ) {
      return candidate;
    }
    
    candidate.setMinutes(candidate.getMinutes() + 1);
  }
  
  return null;
}

/**
 * Get the N next dates that match a cron expression
 * @param expression - cron expression
 * @param count - number of dates to get
 * @param after - start searching after this date
 */
export function getNextCronDates(
  expression: string,
  count: number,
  after: Date = new Date()
): Date[] {
  const dates: Date[] = [];
  let currentAfter = after;
  
  for (let i = 0; i < count; i++) {
    const next = getNextCronDate(expression, currentAfter);
    if (!next) break;
    dates.push(next);
    currentAfter = next;
  }
  
  return dates;
}

/**
 * Get the previous date that matched a cron expression
 * @param expression - cron expression
 * @param before - start searching before this date
 * @param maxIterations - maximum iterations to prevent infinite loops
 */
export function getPreviousCronDate(
  expression: string,
  before: Date = new Date(),
  maxIterations: number = 525600
): Date | null {
  const parts = parseCronExpression(expression);
  if (!parts) return null;
  
  const minute = parseCronField(parts.minute, 0, 59);
  const hour = parseCronField(parts.hour, 0, 23);
  const dayOfMonth = parseCronField(parts.dayOfMonth, 1, 31);
  const month = parseCronField(parts.month, 1, 12);
  const dayOfWeek = parseCronField(parts.dayOfWeek, 0, 6);
  
  if (!minute || !hour || !dayOfMonth || !month || !dayOfWeek) {
    return null;
  }
  
  const candidate = new Date(before);
  candidate.setSeconds(0, 0);
  candidate.setMinutes(candidate.getMinutes() - 1);
  
  for (let i = 0; i < maxIterations; i++) {
    if (
      minute.values.includes(candidate.getMinutes()) &&
      hour.values.includes(candidate.getHours()) &&
      dayOfMonth.values.includes(candidate.getDate()) &&
      month.values.includes(candidate.getMonth() + 1) &&
      dayOfWeek.values.includes(candidate.getDay())
    ) {
      return candidate;
    }
    
    candidate.setMinutes(candidate.getMinutes() - 1);
  }
  
  return null;
}

/**
 * Validate a cron expression
 * @param expression - cron expression to validate
 */
export function isValidCron(expression: string): boolean {
  const parts = parseCronExpression(expression);
  if (!parts) return false;
  
  const minute = parseCronField(parts.minute, 0, 59);
  const hour = parseCronField(parts.hour, 0, 23);
  const dayOfMonth = parseCronField(parts.dayOfMonth, 1, 31);
  const month = parseCronField(parts.month, 1, 12);
  const dayOfWeek = parseCronField(parts.dayOfWeek, 0, 6);
  
  return !!(minute && hour && dayOfMonth && month && dayOfWeek);
}

/**
 * Convert a cron expression to a human-readable description
 * @param expression - cron expression
 */
export function describeCron(expression: string): string | null {
  const parts = parseCronExpression(expression);
  if (!parts) return null;
  
  const descriptions: string[] = [];
  
  // Handle common patterns
  if (expression === '* * * * *') {
    return 'Every minute';
  }
  
  if (expression === '0 * * * *') {
    return 'Every hour';
  }
  
  if (expression === '0 0 * * *') {
    return 'Every day at midnight';
  }
  
  if (expression === '0 0 * * 0') {
    return 'Every Sunday at midnight';
  }
  
  if (expression === '0 0 1 * *') {
    return 'First day of every month at midnight';
  }
  
  // Build description
  const minute = parts.minute;
  const hour = parts.hour;
  
  if (minute === '0' && hour !== '*') {
    if (hour.includes('/')) {
      const step = hour.split('/')[1];
      descriptions.push(`Every ${step} hours`);
    } else if (hour.includes('-')) {
      descriptions.push(`Every hour from ${hour} at minute 0`);
    } else {
      descriptions.push(`At ${hour}:00`);
    }
  } else if (minute !== '*' && hour === '*') {
    descriptions.push(`At minute ${minute} of every hour`);
  } else if (minute.includes('/')) {
    const step = minute.split('/')[1];
    descriptions.push(`Every ${step} minutes`);
  }
  
  if (parts.dayOfMonth !== '*') {
    descriptions.push(`on day ${parts.dayOfMonth} of the month`);
  }
  
  if (parts.month !== '*') {
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNum = parseInt(parts.month, 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      descriptions.push(`in ${monthNames[monthNum]}`);
    } else {
      descriptions.push(`in month ${parts.month}`);
    }
  }
  
  if (parts.dayOfWeek !== '*') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNum = parseInt(parts.dayOfWeek, 10);
    if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
      descriptions.push(`on ${dayNames[dayNum]}`);
    } else {
      descriptions.push(`on day of week ${parts.dayOfWeek}`);
    }
  }
  
  return descriptions.join(' ') || expression;
}

/**
 * Common cron expressions
 */
export const CRON_PRESETS = {
  everyMinute: '* * * * *',
  everyHour: '0 * * * *',
  everyDay: '0 0 * * *',
  everyDayAt9am: '0 9 * * *',
  everyDayAt6pm: '0 18 * * *',
  everyWeek: '0 0 * * 0',
  everyMonth: '0 0 1 * *',
  everyYear: '0 0 1 1 *',
  weekdays: '0 0 * * 1-5',
  weekends: '0 0 * * 0,6',
  every5Minutes: '*/5 * * * *',
  every15Minutes: '*/15 * * * *',
  every30Minutes: '*/30 * * * *',
} as const;
