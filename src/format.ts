import { 
  MILLISECONDS_PER_SECOND, 
  MILLISECONDS_PER_MINUTE, 
  MILLISECONDS_PER_HOUR, 
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
  MILLISECONDS_PER_MONTH,
  MILLISECONDS_PER_YEAR,
  FormatOptions
} from './constants.js';
import type { DateInput } from './types.js';

/**
 * Convert milliseconds to a human-readable duration.
 * @param ms - milliseconds
 * @param options - formatting options
 */
export function formatDuration(ms: number, options: FormatOptions = {}): string {
  const { 
    includeMs = false, 
    short = false, 
    maxUnits = 2,
    round = false 
  } = options;

  if (ms < 0) return '0' + (short ? 's' : ' seconds');
  
  const mathFn = round ? Math.round : Math.floor;
  const parts: string[] = [];
  
  let remaining = ms;
  
  // Years
  if (remaining >= MILLISECONDS_PER_YEAR) {
    const years = mathFn(remaining / MILLISECONDS_PER_YEAR);
    parts.push(years + (short ? 'y' : ` year${years !== 1 ? 's' : ''}`));
    remaining %= MILLISECONDS_PER_YEAR;
  }
  
  // Months
  if (remaining >= MILLISECONDS_PER_MONTH && parts.length < maxUnits) {
    const months = mathFn(remaining / MILLISECONDS_PER_MONTH);
    parts.push(months + (short ? 'mo' : ` month${months !== 1 ? 's' : ''}`));
    remaining %= MILLISECONDS_PER_MONTH;
  }
  
  // Weeks
  if (remaining >= MILLISECONDS_PER_WEEK && parts.length < maxUnits) {
    const weeks = mathFn(remaining / MILLISECONDS_PER_WEEK);
    parts.push(weeks + (short ? 'w' : ` week${weeks !== 1 ? 's' : ''}`));
    remaining %= MILLISECONDS_PER_WEEK;
  }
  
  // Days
  if (remaining >= MILLISECONDS_PER_DAY && parts.length < maxUnits) {
    const days = mathFn(remaining / MILLISECONDS_PER_DAY);
    parts.push(days + (short ? 'd' : ` day${days !== 1 ? 's' : ''}`));
    remaining %= MILLISECONDS_PER_DAY;
  }
  
  // Hours
  if (remaining >= MILLISECONDS_PER_HOUR && parts.length < maxUnits) {
    const hours = mathFn(remaining / MILLISECONDS_PER_HOUR);
    parts.push(hours + (short ? 'h' : ` hour${hours !== 1 ? 's' : ''}`));
    remaining %= MILLISECONDS_PER_HOUR;
  }
  
  // Minutes
  if (remaining >= MILLISECONDS_PER_MINUTE && parts.length < maxUnits) {
    const minutes = mathFn(remaining / MILLISECONDS_PER_MINUTE);
    parts.push(minutes + (short ? 'm' : ` minute${minutes !== 1 ? 's' : ''}`));
    remaining %= MILLISECONDS_PER_MINUTE;
  }
  
  // Seconds
  if (remaining >= MILLISECONDS_PER_SECOND && parts.length < maxUnits) {
    const seconds = mathFn(remaining / MILLISECONDS_PER_SECOND);
    parts.push(seconds + (short ? 's' : ` second${seconds !== 1 ? 's' : ''}`));
    remaining %= MILLISECONDS_PER_SECOND;
  }
  
  // Milliseconds
  if ((remaining > 0 || parts.length === 0) && includeMs && parts.length < maxUnits) {
    const milliseconds = mathFn(remaining);
    parts.push(milliseconds + (short ? 'ms' : ` millisecond${milliseconds !== 1 ? 's' : ''}`));
  }
  
  if (parts.length === 0) {
    return '0' + (short ? 's' : ' seconds');
  }
  
  return short ? parts.join(' ') : parts.join(', ');
}

/**
 * Return a human-readable "time ago" string.
 * @param date - past or future date
 * @param options - formatting options
 */
export function timeAgo(date: Date, options: FormatOptions = {}): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const { short = false } = options;
  
  const isFuture = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);
  
  if (absDiffMs < MILLISECONDS_PER_MINUTE) {
    const seconds = Math.floor(absDiffMs / MILLISECONDS_PER_SECOND);
    const unit = short ? 's' : ` second${seconds !== 1 ? 's' : ''}`;
    return isFuture ? `in ${seconds}${unit}` : `${seconds}${unit} ago`;
  }
  
  if (absDiffMs < MILLISECONDS_PER_HOUR) {
    const minutes = Math.floor(absDiffMs / MILLISECONDS_PER_MINUTE);
    const unit = short ? 'm' : ` minute${minutes !== 1 ? 's' : ''}`;
    return isFuture ? `in ${minutes}${unit}` : `${minutes}${unit} ago`;
  }
  
  if (absDiffMs < MILLISECONDS_PER_DAY) {
    const hours = Math.floor(absDiffMs / MILLISECONDS_PER_HOUR);
    const unit = short ? 'h' : ` hour${hours !== 1 ? 's' : ''}`;
    return isFuture ? `in ${hours}${unit}` : `${hours}${unit} ago`;
  }
  
  if (absDiffMs < MILLISECONDS_PER_WEEK) {
    const days = Math.floor(absDiffMs / MILLISECONDS_PER_DAY);
    const unit = short ? 'd' : ` day${days !== 1 ? 's' : ''}`;
    return isFuture ? `in ${days}${unit}` : `${days}${unit} ago`;
  }
  
  if (absDiffMs < MILLISECONDS_PER_MONTH) {
    const weeks = Math.floor(absDiffMs / MILLISECONDS_PER_WEEK);
    const unit = short ? 'w' : ` week${weeks !== 1 ? 's' : ''}`;
    return isFuture ? `in ${weeks}${unit}` : `${weeks}${unit} ago`;
  }
  
  if (absDiffMs < MILLISECONDS_PER_YEAR) {
    const months = Math.floor(absDiffMs / MILLISECONDS_PER_MONTH);
    const unit = short ? 'mo' : ` month${months !== 1 ? 's' : ''}`;
    return isFuture ? `in ${months}${unit}` : `${months}${unit} ago`;
  }
  
  const years = Math.floor(absDiffMs / MILLISECONDS_PER_YEAR);
  const unit = short ? 'y' : ` year${years !== 1 ? 's' : ''}`;
  return isFuture ? `in ${years}${unit}` : `${years}${unit} ago`;
}

/**
 * Format a date to a human-readable time string
 * @param date - date to format
 * @param format - format type
 */
export function formatTime(date: Date, format: '12h' | '24h' | 'iso' = '24h'): string {
  switch (format) {
    case '12h':
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    case 'iso':
      return date.toISOString();
    case '24h':
    default:
      return date.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
  }
}

/**
 * Parse a duration string like "1h 30m" into milliseconds
 * @param duration - duration string (e.g., "1h 30m", "2d", "45s")
 */
export function parseDuration(duration: string): number {
  const regex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/g;
  let totalMs = 0;
  let match;
  
  while ((match = regex.exec(duration)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'ms':
      case 'millisecond':
      case 'milliseconds':
        totalMs += value;
        break;
      case 's':
      case 'sec':
      case 'second':
      case 'seconds':
        totalMs += value * MILLISECONDS_PER_SECOND;
        break;
      case 'm':
      case 'min':
      case 'minute':
      case 'minutes':
        totalMs += value * MILLISECONDS_PER_MINUTE;
        break;
      case 'h':
      case 'hr':
      case 'hour':
      case 'hours':
        totalMs += value * MILLISECONDS_PER_HOUR;
        break;
      case 'd':
      case 'day':
      case 'days':
        totalMs += value * MILLISECONDS_PER_DAY;
        break;
      case 'w':
      case 'week':
      case 'weeks':
        totalMs += value * MILLISECONDS_PER_WEEK;
        break;
      case 'mo':
      case 'month':
      case 'months':
        totalMs += value * MILLISECONDS_PER_MONTH;
        break;
      case 'y':
      case 'year':
      case 'years':
        totalMs += value * MILLISECONDS_PER_YEAR;
        break;
    }
  }
  
  return totalMs;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format a date using a pattern string
 * @param date - date to format
 * @param pattern - format pattern (e.g., "YYYY-MM-DD", "MMM D, YYYY")
 * 
 * Supported tokens:
 * - YYYY: 4-digit year
 * - YY: 2-digit year
 * - MMMM: Full month name (January)
 * - MMM: Short month name (Jan)
 * - MM: Month with leading zero (01-12)
 * - M: Month (1-12)
 * - DDDD: Full day name (Monday)
 * - DDD: Short day name (Mon)
 * - DD: Day with leading zero (01-31)
 * - D: Day (1-31)
 * - HH: Hours 24h with leading zero (00-23)
 * - H: Hours 24h (0-23)
 * - hh: Hours 12h with leading zero (01-12)
 * - h: Hours 12h (1-12)
 * - mm: Minutes with leading zero (00-59)
 * - ss: Seconds with leading zero (00-59)
 * - SSS: Milliseconds (000-999)
 * - A: AM/PM
 * - a: am/pm
 */
export function formatDate(date: Date, pattern: string): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  
  const hours12 = hours % 12 || 12;
  const ampm = hours < 12 ? 'AM' : 'PM';
  
  const pad = (n: number, len: number = 2): string => String(n).padStart(len, '0');
  
  // Token mapping - order matters for replacements
  const tokens: [RegExp, string][] = [
    [/YYYY/g, String(year)],
    [/YY/g, String(year).slice(-2)],
    [/MMMM/g, MONTH_NAMES[month]],
    [/MMM/g, MONTH_NAMES_SHORT[month]],
    [/MM/g, pad(month + 1)],
    [/\bM\b/g, String(month + 1)], // Word boundary to avoid matching M in other tokens
    [/DDDD/g, DAY_NAMES[dayOfWeek]],
    [/DDD/g, DAY_NAMES_SHORT[dayOfWeek]],
    [/DD/g, pad(day)],
    [/\bD\b/g, String(day)],
    [/HH/g, pad(hours)],
    [/\bH\b/g, String(hours)],
    [/hh/g, pad(hours12)],
    [/\bh\b/g, String(hours12)],
    [/mm/g, pad(minutes)],
    [/ss/g, pad(seconds)],
    [/SSS/g, pad(milliseconds, 3)],
    [/\bA\b/g, ampm],
    [/\ba\b/g, ampm.toLowerCase()],
  ];
  
  let result = pattern;
  for (const [regex, replacement] of tokens) {
    result = result.replace(regex, replacement);
  }
  
  return result;
}

/**
 * Format a relative time string (e.g., "in 2 days", "3 hours ago")
 * @param date - target date
 * @param baseDate - base date (default: now)
 */
export function formatRelativeTime(date: Date, baseDate: Date = new Date()): string {
  const diffMs = date.getTime() - baseDate.getTime();
  const isFuture = diffMs > 0;
  const absDiffMs = Math.abs(diffMs);
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  
  if (absDiffMs < MILLISECONDS_PER_MINUTE) {
    const seconds = Math.round(absDiffMs / MILLISECONDS_PER_SECOND);
    return rtf.format(isFuture ? seconds : -seconds, 'second');
  }
  
  if (absDiffMs < MILLISECONDS_PER_HOUR) {
    const minutes = Math.round(absDiffMs / MILLISECONDS_PER_MINUTE);
    return rtf.format(isFuture ? minutes : -minutes, 'minute');
  }
  
  if (absDiffMs < MILLISECONDS_PER_DAY) {
    const hours = Math.round(absDiffMs / MILLISECONDS_PER_HOUR);
    return rtf.format(isFuture ? hours : -hours, 'hour');
  }
  
  if (absDiffMs < MILLISECONDS_PER_WEEK) {
    const days = Math.round(absDiffMs / MILLISECONDS_PER_DAY);
    return rtf.format(isFuture ? days : -days, 'day');
  }
  
  if (absDiffMs < MILLISECONDS_PER_MONTH) {
    const weeks = Math.round(absDiffMs / MILLISECONDS_PER_WEEK);
    return rtf.format(isFuture ? weeks : -weeks, 'week');
  }
  
  if (absDiffMs < MILLISECONDS_PER_YEAR) {
    const months = Math.round(absDiffMs / MILLISECONDS_PER_MONTH);
    return rtf.format(isFuture ? months : -months, 'month');
  }
  
  const years = Math.round(absDiffMs / MILLISECONDS_PER_YEAR);
  return rtf.format(isFuture ? years : -years, 'year');
}

/**
 * Format a date range (e.g., "Jan 5 - Jan 10, 2025")
 * @param start - start date
 * @param end - end date
 * @param options - formatting options
 */
export function formatDateRange(
  start: Date,
  end: Date,
  options: {
    separator?: string;
    includeTime?: boolean;
    format?: 'short' | 'medium' | 'long';
  } = {}
): string {
  const { separator = ' - ', includeTime = false, format = 'medium' } = options;
  
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const sameDay = sameMonth && start.getDate() === end.getDate();
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: format === 'short' ? 'short' : format === 'long' ? 'long' : 'short',
    day: 'numeric',
  };
  
  if (!sameYear || format === 'long') {
    formatOptions.year = 'numeric';
  }
  
  if (includeTime) {
    formatOptions.hour = 'numeric';
    formatOptions.minute = '2-digit';
  }
  
  if (sameDay && !includeTime) {
    return start.toLocaleDateString('en-US', { ...formatOptions, year: 'numeric' });
  }
  
  const startStr = start.toLocaleDateString('en-US', formatOptions);
  const endStr = end.toLocaleDateString('en-US', { ...formatOptions, year: 'numeric' });
  
  return `${startStr}${separator}${endStr}`;
}

/**
 * Format a number as an ordinal (1st, 2nd, 3rd, etc.)
 * @param n - number to format
 */
export function formatOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Format a day of month as an ordinal (1st, 2nd, 3rd, etc.)
 * @param date - date to format
 */
export function formatDayOrdinal(date: Date): string {
  return formatOrdinal(date.getDate());
}

/**
 * Format a duration in a compact form (e.g., "02:30:45")
 * @param ms - milliseconds
 * @param showHours - always show hours even if 0
 */
export function formatDurationCompact(ms: number, showHours: boolean = true): string {
  const hours = Math.floor(ms / MILLISECONDS_PER_HOUR);
  const minutes = Math.floor((ms % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE);
  const seconds = Math.floor((ms % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND);
  
  const pad = (n: number): string => String(n).padStart(2, '0');
  
  if (showHours || hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format a date/time for display in a calendar
 * @param date - date to format
 */
export function formatCalendarDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((dateOnly.getTime() - today.getTime()) / MILLISECONDS_PER_DAY);
  
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  
  if (diffDays > 1 && diffDays < 7) {
    return DAY_NAMES[date.getDay()];
  }
  
  if (diffDays >= -6 && diffDays < 0) {
    return `Last ${DAY_NAMES[date.getDay()]}`;
  }
  
  // Same year, show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return formatDate(date, 'MMM D');
  }
  
  return formatDate(date, 'MMM D, YYYY');
}
