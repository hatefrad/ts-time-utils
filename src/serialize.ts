import type { DateInput, SerializationOptions, DateObject, EpochTimestamp } from './types.js';

/**
 * Safe JSON date serialization and deserialization utilities
 */

/**
 * Safely serialize a date to JSON with various format options
 */
export function serializeDate(
  date: DateInput,
  options: SerializationOptions = {}
): string | number | DateObject {
  const {
    format = 'iso',
    includeTimezone = false,
    useUTC = false,
    precision = 'milliseconds',
    customFormat
  } = options;

  const dateObj = normalizeDate(date);
  if (!dateObj) {
    throw new Error('Invalid date provided for serialization');
  }

  const workingDate = useUTC ? new Date(dateObj.getTime()) : dateObj;

  switch (format) {
    case 'iso':
      return workingDate.toISOString();
    
    case 'epoch':
      return toEpochTimestamp(workingDate, precision);
    
    case 'object':
      return toDateObject(workingDate, includeTimezone);
    
    case 'custom':
      if (!customFormat) {
        throw new Error('Custom format string required when format is "custom"');
      }
      return formatCustom(workingDate, customFormat);
    
    default:
      return workingDate.toISOString();
  }
}

/**
 * Safely deserialize a date from various formats
 */
export function deserializeDate(
  serializedDate: string | number | DateObject,
  options: SerializationOptions = {}
): Date | null {
  const { useUTC = false } = options;

  try {
    if (typeof serializedDate === 'string') {
      return parseISOString(serializedDate, useUTC);
    }
    
    if (typeof serializedDate === 'number') {
      if (isNaN(serializedDate)) {
        return null;
      }
      return fromEpochTimestamp(serializedDate, options.precision || 'milliseconds');
    }
    
    if (typeof serializedDate === 'object' && serializedDate !== null) {
      try {
        return fromDateObject(serializedDate as DateObject);
      } catch {
        return null;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Create a safe JSON reviver function for automatic date parsing
 */
export function createDateReviver(
  dateKeys: string[] = ['createdAt', 'updatedAt', 'date', 'timestamp'],
  options: SerializationOptions = {}
): (key: string, value: any) => any {
  return (key: string, value: any) => {
    if (dateKeys.includes(key) && (typeof value === 'string' || typeof value === 'number')) {
      const parsed = deserializeDate(value, options);
      return parsed || value; // Return original value if parsing fails
    }
    return value;
  };
}

/**
 * Create a safe JSON replacer function for automatic date serialization
 */
export function createDateReplacer(
  dateKeys: string[] = ['createdAt', 'updatedAt', 'date', 'timestamp'],
  options: SerializationOptions = {}
): (key: string, value: any) => any {
  return (key: string, value: any) => {
    if (dateKeys.includes(key)) {
      if (value instanceof Date) {
        return serializeDate(value, options);
      }
      // Handle case where Date was already converted to ISO string by JSON.stringify
      if (typeof value === 'string' && isValidISODateString(value)) {
        const date = parseISOString(value);
        if (date) {
          return serializeDate(date, options);
        }
      }
    }
    return value;
  };
}

/**
 * Parse ISO string with better error handling
 */
export function parseISOString(isoString: string, useUTC: boolean = false): Date | null {
  if (!isoString || typeof isoString !== 'string') {
    return null;
  }

  // Handle various ISO formats
  const cleanedString = isoString.trim();
  
  // Check for valid ISO format
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoRegex.test(cleanedString)) {
    // Try to parse anyway, but be more forgiving
    const relaxedRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)?$/;
    if (!relaxedRegex.test(cleanedString)) {
      return null;
    }
  }

  try {
    const date = new Date(cleanedString);
    if (isNaN(date.getTime())) {
      return null;
    }

    return useUTC ? new Date(date.getTime() + (date.getTimezoneOffset() * 60000)) : date;
  } catch {
    return null;
  }
}

/**
 * Convert date to epoch timestamp with specified precision
 */
export function toEpochTimestamp(date: DateInput, precision: 'milliseconds' | 'seconds' | 'microseconds' = 'milliseconds'): number {
  const dateObj = normalizeDate(date);
  if (!dateObj) {
    throw new Error('Invalid date provided for epoch conversion');
  }

  const ms = dateObj.getTime();
  
  switch (precision) {
    case 'seconds':
      return Math.floor(ms / 1000);
    case 'microseconds':
      return ms * 1000; // JavaScript doesn't have true microsecond precision
    case 'milliseconds':
    default:
      return ms;
  }
}

/**
 * Create date from epoch timestamp with specified precision
 */
export function fromEpochTimestamp(
  timestamp: number, 
  precision: 'milliseconds' | 'seconds' | 'microseconds' = 'milliseconds'
): Date {
  let ms: number;
  
  switch (precision) {
    case 'seconds':
      ms = timestamp * 1000;
      break;
    case 'microseconds':
      ms = timestamp / 1000;
      break;
    case 'milliseconds':
    default:
      ms = timestamp;
      break;
  }

  return new Date(ms);
}

/**
 * Create epoch timestamp with metadata
 */
export function createEpochTimestamp(
  date: DateInput,
  precision: 'milliseconds' | 'seconds' | 'microseconds' = 'milliseconds',
  timezone?: string
): EpochTimestamp {
  return {
    timestamp: toEpochTimestamp(date, precision),
    precision,
    timezone
  };
}

/**
 * Convert date to safe object representation
 */
export function toDateObject(date: DateInput, includeTimezone: boolean = false): DateObject {
  const dateObj = normalizeDate(date);
  if (!dateObj) {
    throw new Error('Invalid date provided for object conversion');
  }

  const obj: DateObject = {
    year: dateObj.getUTCFullYear(),
    month: dateObj.getUTCMonth() + 1, // Convert to 1-12
    day: dateObj.getUTCDate(),
    hour: dateObj.getUTCHours(),
    minute: dateObj.getUTCMinutes(),
    second: dateObj.getUTCSeconds(),
    millisecond: dateObj.getUTCMilliseconds()
  };

  if (includeTimezone) {
    // Get timezone offset in minutes and convert to string format
    const offset = dateObj.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';
    obj.timezone = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return obj;
}

/**
 * Create date from object representation
 */
export function fromDateObject(dateObj: DateObject): Date {
  // Validate required fields
  if (!dateObj || typeof dateObj !== 'object') {
    throw new Error('Invalid date object provided');
  }

  const { year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0 } = dateObj;

  if (!year || !month || !day) {
    throw new Error('Date object must include year, month, and day');
  }

  // Validate ranges
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }

  if (day < 1 || day > 31) {
    throw new Error('Day must be between 1 and 31');
  }

  if (hour < 0 || hour > 23) {
    throw new Error('Hour must be between 0 and 23');
  }

  if (minute < 0 || minute > 59) {
    throw new Error('Minute must be between 0 and 59');
  }

  if (second < 0 || second > 59) {
    throw new Error('Second must be between 0 and 59');
  }

  if (millisecond < 0 || millisecond > 999) {
    throw new Error('Millisecond must be between 0 and 999');
  }

  return new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
}

/**
 * Check if a string is a valid ISO date string for serialization
 */
export function isValidISODateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const parsed = parseISOString(dateString);
  return parsed !== null;
}

/**
 * Check if a number is a valid epoch timestamp
 */
export function isValidEpochTimestamp(timestamp: number, precision: 'milliseconds' | 'seconds' | 'microseconds' = 'milliseconds'): boolean {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    return false;
  }

  // Check reasonable bounds for timestamps
  const now = Date.now();
  let min: number, max: number;

  switch (precision) {
    case 'seconds':
      min = 0; // Jan 1, 1970
      max = Math.floor(now / 1000) + (50 * 365 * 24 * 60 * 60); // 50 years from now
      break;
    case 'microseconds':
      min = 0;
      max = now * 1000 + (50 * 365 * 24 * 60 * 60 * 1000 * 1000); // 50 years from now
      break;
    case 'milliseconds':
    default:
      min = 0; // Jan 1, 1970
      max = now + (50 * 365 * 24 * 60 * 60 * 1000); // 50 years from now
      break;
  }

  return timestamp >= min && timestamp <= max;
}

/**
 * Clone a date safely (avoids reference issues)
 */
export function cloneDate(date: DateInput): Date | null {
  const dateObj = normalizeDate(date);
  return dateObj ? new Date(dateObj.getTime()) : null;
}

/**
 * Compare two dates for equality (ignoring milliseconds if specified)
 */
export function datesEqual(
  date1: DateInput,
  date2: DateInput,
  precision: 'milliseconds' | 'seconds' | 'minutes' = 'milliseconds'
): boolean {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);

  if (!d1 || !d2) {
    return false;
  }

  let time1 = d1.getTime();
  let time2 = d2.getTime();

  switch (precision) {
    case 'seconds':
      time1 = Math.floor(time1 / 1000);
      time2 = Math.floor(time2 / 1000);
      break;
    case 'minutes':
      time1 = Math.floor(time1 / 60000);
      time2 = Math.floor(time2 / 60000);
      break;
  }

  return time1 === time2;
}

/**
 * Get current timestamp in various formats
 */
export function now(format: 'date' | 'iso' | 'epoch-ms' | 'epoch-s' = 'date'): Date | string | number {
  const current = new Date();

  switch (format) {
    case 'iso':
      return current.toISOString();
    case 'epoch-ms':
      return current.getTime();
    case 'epoch-s':
      return Math.floor(current.getTime() / 1000);
    case 'date':
    default:
      return current;
  }
}

/**
 * Safely handle JSON parsing with date conversion
 */
export function parseJSONWithDates(
  jsonString: string,
  dateKeys?: string[],
  options?: SerializationOptions
): any {
  try {
    return JSON.parse(jsonString, createDateReviver(dateKeys, options));
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Safely handle JSON stringification with date conversion
 */
export function stringifyWithDates(
  obj: any,
  dateKeys?: string[],
  options?: SerializationOptions,
  space?: string | number
): string {
  try {
    return JSON.stringify(obj, createDateReplacer(dateKeys, options), space);
  } catch (error) {
    throw new Error(`Failed to stringify JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions

function normalizeDate(date: DateInput): Date | null {
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  if (typeof date === 'number') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

function formatCustom(date: Date, format: string): string {
  // Simple custom formatter - can be extended
  const formatMap: Record<string, string> = {
    'YYYY': date.getUTCFullYear().toString(),
    'MM': (date.getUTCMonth() + 1).toString().padStart(2, '0'),
    'DD': date.getUTCDate().toString().padStart(2, '0'),
    'HH': date.getUTCHours().toString().padStart(2, '0'),
    'mm': date.getUTCMinutes().toString().padStart(2, '0'),
    'ss': date.getUTCSeconds().toString().padStart(2, '0'),
    'SSS': date.getUTCMilliseconds().toString().padStart(3, '0')
  };

  let result = format;
  for (const [token, value] of Object.entries(formatMap)) {
    result = result.replace(new RegExp(token, 'g'), value);
  }

  return result;
}