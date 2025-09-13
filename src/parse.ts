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