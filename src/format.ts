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
