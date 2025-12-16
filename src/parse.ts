/**
 * Advanced date parsing utilities
 */

/**
 * Parse various date formats intelligently
 * @param input - date string, number, or Date object
 */
export function parseDate(input: string | number | Date): Date | null {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  
  if (typeof input === 'number') {
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (typeof input !== 'string') {
    return null;
  }
  
  // Try native Date parsing first, but validate the result
  const nativeDate = new Date(input);
  if (!isNaN(nativeDate.getTime())) {
    // Additional validation for edge cases like "2025-02-30"
    if (input.includes('-') && input.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [year, month, day] = input.split('-').map(Number);
      const testDate = new Date(year, month - 1, day);
      if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
        return null;
      }
    }
    return nativeDate;
  }
  
  // Try common patterns
  const patterns = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // MM-DD-YYYY
    /^(\d{4})(\d{2})(\d{2})$/, // YYYYMMDD
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      const [, first, second, third] = match;
      
      // Try different interpretations based on pattern
      if (pattern.source.includes('(\\d{4})')) {
        // Year first format
        const date = new Date(parseInt(first), parseInt(second) - 1, parseInt(third));
        if (!isNaN(date.getTime())) return date;
      } else {
        // Month/day first format (assuming US format)
        const date = new Date(parseInt(third), parseInt(first) - 1, parseInt(second));
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  
  return null;
}

/**
 * Parse relative date strings like "tomorrow", "next monday", "2 weeks ago"
 * @param input - relative date string
 */
export function parseRelativeDate(input: string): Date | null {
  const now = new Date();
  const lowercaseInput = input.toLowerCase().trim();
  
  // Handle simple cases
  switch (lowercaseInput) {
    case 'now':
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'yesterday':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    case 'tomorrow':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  }
  
  // Handle "X time ago" or "in X time"
  const agoMatch = lowercaseInput.match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/);
  if (agoMatch) {
    const [, amount, unit] = agoMatch;
    return subtractTimeUnits(now, parseInt(amount), unit as any);
  }
  
  const inMatch = lowercaseInput.match(/^in\s+(\d+)\s+(second|minute|hour|day|week|month|year)s?$/);
  if (inMatch) {
    const [, amount, unit] = inMatch;
    return addTimeUnits(now, parseInt(amount), unit as any);
  }
  
  // Handle "next/last weekday"
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const nextWeekdayMatch = lowercaseInput.match(/^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
  if (nextWeekdayMatch) {
    const targetDay = weekdays.indexOf(nextWeekdayMatch[1]);
    const daysUntilTarget = (targetDay - now.getDay() + 7) % 7 || 7;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilTarget);
  }
  
  const lastWeekdayMatch = lowercaseInput.match(/^last\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
  if (lastWeekdayMatch) {
    const targetDay = weekdays.indexOf(lastWeekdayMatch[1]);
    const daysSinceTarget = (now.getDay() - targetDay + 7) % 7 || 7;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceTarget);
  }
  
  return null;
}

/**
 * Parse "time ago" strings like "5 minutes ago", "2 hours ago"
 * @param input - time ago string
 */
export function parseTimeAgo(input: string): Date | null {
  const now = new Date();
  const lowercaseInput = input.toLowerCase().trim();
  
  // Handle simple cases
  if (lowercaseInput === 'just now' || lowercaseInput === 'now') {
    return now;
  }
  
  // Handle "X time ago"
  const match = lowercaseInput.match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/);
  if (match) {
    const [, amount, unit] = match;
    return subtractTimeUnits(now, parseInt(amount), unit as any);
  }
  
  return null;
}

/**
 * Parse custom date format
 * @param dateString - date string to parse
 * @param format - format pattern (e.g., "YYYY-MM-DD", "DD/MM/YYYY")
 */
export function parseCustomFormat(dateString: string, format: string): Date | null {
  // Simple implementation for common patterns
  const formatMap: Record<string, RegExp> = {
    'YYYY-MM-DD': /^(\d{4})-(\d{2})-(\d{2})$/,
    'DD/MM/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
    'MM/DD/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
    'DD-MM-YYYY': /^(\d{2})-(\d{2})-(\d{4})$/,
    'MM-DD-YYYY': /^(\d{2})-(\d{2})-(\d{4})$/,
  };
  
  const regex = formatMap[format];
  if (!regex) return null;
  
  const match = dateString.match(regex);
  if (!match) return null;
  
  const [, first, second, third] = match;
  
  let year: number, month: number, day: number;
  
  switch (format) {
    case 'YYYY-MM-DD':
      year = parseInt(first);
      month = parseInt(second) - 1;
      day = parseInt(third);
      break;
    case 'DD/MM/YYYY':
    case 'DD-MM-YYYY':
      day = parseInt(first);
      month = parseInt(second) - 1;
      year = parseInt(third);
      break;
    case 'MM/DD/YYYY':
    case 'MM-DD-YYYY':
      month = parseInt(first) - 1;
      day = parseInt(second);
      year = parseInt(third);
      break;
    default:
      return null;
  }
  
  const date = new Date(year, month, day);
  
  // Validate that the date components match what was parsed
  // This catches cases like February 30th which JS converts to March 2nd
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Try parsing with multiple formats
 * @param dateString - date string to parse
 * @param formats - array of format patterns to try
 */
export function parseManyFormats(dateString: string, formats: string[]): Date | null {
  for (const format of formats) {
    const result = parseCustomFormat(dateString, format);
    if (result) return result;
  }
  return null;
}

// Helper functions
function addTimeUnits(date: Date, amount: number, unit: string): Date {
  const result = new Date(date);
  
  switch (unit) {
    case 'second':
      result.setSeconds(result.getSeconds() + amount);
      break;
    case 'minute':
      result.setMinutes(result.getMinutes() + amount);
      break;
    case 'hour':
      result.setHours(result.getHours() + amount);
      break;
    case 'day':
      result.setDate(result.getDate() + amount);
      break;
    case 'week':
      result.setDate(result.getDate() + (amount * 7));
      break;
    case 'month':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'year':
      result.setFullYear(result.getFullYear() + amount);
      break;
  }
  
  return result;
}

function subtractTimeUnits(date: Date, amount: number, unit: string): Date {
  return addTimeUnits(date, -amount, unit);
}

/**
 * Parse an ISO 8601 duration string (e.g., "P1Y2M3DT4H5M6S")
 * @param duration - ISO 8601 duration string
 * @returns object with parsed components
 */
export function parseISO8601Duration(duration: string): {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} | null {
  // ISO 8601 duration format: P[n]Y[n]M[n]DT[n]H[n]M[n]S or P[n]W
  const result = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  
  const normalized = duration.toUpperCase().trim();
  
  if (!normalized.startsWith('P')) {
    return null;
  }
  
  // Handle week format: P[n]W
  const weekMatch = normalized.match(/^P(\d+)W$/);
  if (weekMatch) {
    result.weeks = parseInt(weekMatch[1]);
    return result;
  }
  
  // Full format: P[n]Y[n]M[n]DT[n]H[n]M[n]S
  const fullMatch = normalized.match(
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/
  );
  
  if (!fullMatch) {
    return null;
  }
  
  const [, years, months, days, hours, minutes, seconds] = fullMatch;
  
  if (years) result.years = parseInt(years);
  if (months) result.months = parseInt(months);
  if (days) result.days = parseInt(days);
  if (hours) result.hours = parseInt(hours);
  if (minutes) result.minutes = parseInt(minutes);
  if (seconds) result.seconds = parseFloat(seconds);
  
  return result;
}

/**
 * Convert ISO 8601 duration to milliseconds (approximate for months/years)
 * @param duration - ISO 8601 duration string
 */
export function parseISO8601DurationToMs(duration: string): number | null {
  const parsed = parseISO8601Duration(duration);
  if (!parsed) return null;
  
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const MS_PER_WEEK = 7 * MS_PER_DAY;
  const MS_PER_MONTH = 30 * MS_PER_DAY; // Approximate
  const MS_PER_YEAR = 365 * MS_PER_DAY; // Approximate
  
  return (
    parsed.years * MS_PER_YEAR +
    parsed.months * MS_PER_MONTH +
    parsed.weeks * MS_PER_WEEK +
    parsed.days * MS_PER_DAY +
    parsed.hours * MS_PER_HOUR +
    parsed.minutes * MS_PER_MINUTE +
    parsed.seconds * MS_PER_SECOND
  );
}

/**
 * Parse a time string (e.g., "14:30", "2:30 PM", "14:30:45")
 * @param timeString - time string to parse
 * @returns object with hours, minutes, seconds, or null if invalid
 */
export function parseTime(timeString: string): {
  hours: number;
  minutes: number;
  seconds: number;
} | null {
  const normalized = timeString.trim();
  
  // 24-hour format: HH:MM or HH:MM:SS
  const match24 = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    const hours = parseInt(match24[1]);
    const minutes = parseInt(match24[2]);
    const seconds = match24[3] ? parseInt(match24[3]) : 0;
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59) {
      return { hours, minutes, seconds };
    }
    return null;
  }
  
  // 12-hour format: H:MM AM/PM or HH:MM AM/PM
  const match12 = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1]);
    const minutes = parseInt(match12[2]);
    const seconds = match12[3] ? parseInt(match12[3]) : 0;
    const isPM = match12[4].toLowerCase() === 'pm';
    
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return null;
    }
    
    // Convert to 24-hour format
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }
    
    return { hours, minutes, seconds };
  }
  
  return null;
}

/**
 * Guess the date format of a date string
 * @param dateString - date string to analyze
 * @returns detected format pattern or null
 */
export function guessDateFormat(dateString: string): string | null {
  const normalized = dateString.trim();
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return 'YYYY-MM-DD';
  }
  
  // DD/MM/YYYY or MM/DD/YYYY - need to analyze values
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    const [first, second] = normalized.split('/').map(Number);
    if (first > 12) return 'DD/MM/YYYY'; // First must be day
    if (second > 12) return 'MM/DD/YYYY'; // Second must be day
    // Ambiguous - default to US format
    return 'MM/DD/YYYY';
  }
  
  // DD-MM-YYYY or MM-DD-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(normalized)) {
    const [first, second] = normalized.split('-').map(Number);
    if (first > 12) return 'DD-MM-YYYY';
    if (second > 12) return 'MM-DD-YYYY';
    return 'MM-DD-YYYY';
  }
  
  // YYYYMMDD
  if (/^\d{8}$/.test(normalized)) {
    return 'YYYYMMDD';
  }
  
  // ISO 8601 with time
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(normalized)) {
    return 'ISO8601';
  }
  
  return null;
}

/**
 * Parse a date string using auto-detected format
 * @param dateString - date string to parse
 */
export function parseAutoFormat(dateString: string): Date | null {
  const format = guessDateFormat(dateString);
  
  if (!format) {
    return parseDate(dateString);
  }
  
  if (format === 'ISO8601') {
    return parseDate(dateString);
  }
  
  if (format === 'YYYYMMDD') {
    const year = parseInt(dateString.slice(0, 4));
    const month = parseInt(dateString.slice(4, 6)) - 1;
    const day = parseInt(dateString.slice(6, 8));
    return new Date(year, month, day);
  }
  
  return parseCustomFormat(dateString, format);
}

/**
 * Parse a date from a natural language date range endpoint
 * @param input - string like "end of month", "start of year", "beginning of week"
 */
export function parseRangeEndpoint(input: string): Date | null {
  const now = new Date();
  const lowercaseInput = input.toLowerCase().trim();
  
  // Start/beginning of period
  if (lowercaseInput.match(/^(start|beginning)\s+of\s+(this\s+)?(day|today)$/)) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }
  
  if (lowercaseInput.match(/^(start|beginning)\s+of\s+(this\s+)?week$/)) {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
  }
  
  if (lowercaseInput.match(/^(start|beginning)\s+of\s+(this\s+)?month$/)) {
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }
  
  if (lowercaseInput.match(/^(start|beginning)\s+of\s+(this\s+)?year$/)) {
    return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  }
  
  // End of period
  if (lowercaseInput.match(/^end\s+of\s+(this\s+)?(day|today)$/)) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }
  
  if (lowercaseInput.match(/^end\s+of\s+(this\s+)?week$/)) {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? 0 : 7); // Sunday
    return new Date(now.getFullYear(), now.getMonth(), diff, 23, 59, 59, 999);
  }
  
  if (lowercaseInput.match(/^end\s+of\s+(this\s+)?month$/)) {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  
  if (lowercaseInput.match(/^end\s+of\s+(this\s+)?year$/)) {
    return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
  
  return null;
}