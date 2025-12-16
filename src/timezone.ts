/**
 * Timezone utilities using Intl API with fallbacks
 */

import type { ZonedTime } from './types.js';

/** Get offset (minutes) for a zone at a given date */
export function getTimezoneOffset(zone: string, date: Date = new Date()): number | null {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset', hour: '2-digit' });
    const parts = dtf.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (!tzPart) return null;
    // Examples: "GMT+2", "UTC-05:00"
    const match = tzPart.value.match(/([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (!match) return 0; // could be GMT or UTC with no offset
    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2],10);
    const mins = match[3] ? parseInt(match[3],10) : 0;
    return sign * (hours * 60 + mins);
  } catch {
    return null;
  }
}

/** Format date/time in a zone */
export function formatInTimeZone(date: Date, zone: string, options: Intl.DateTimeFormatOptions = {}): string {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: zone, ...options });
  return fmt.format(date);
}

/** Get a lightweight ZonedTime object */
export function getZonedTime(date: Date, zone: string): ZonedTime | null {
  const offset = getTimezoneOffset(zone, date);
  if (offset == null) return null;
  return { date: new Date(date), zone, offsetMinutes: offset };
}

/** Convert a date (treated as absolute moment) to another zone's clock components */
export function convertDateToZone(date: Date, zone: string): { year: number; month: number; day: number; hour: number; minute: number; second: number; } | null {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const parts = fmt.formatToParts(date);
    const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    return {
      year: get('year'),
      month: get('month'),
      day: get('day'),
      hour: get('hour'),
      minute: get('minute'),
      second: get('second')
    };
  } catch {
    return null;
  }
}

/** Check if provided zone string is a valid IANA zone */
export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** List a subset of common timezones (cannot enumerate all via API) */
export const COMMON_TIMEZONES = [
  'UTC','Etc/UTC','Europe/London','Europe/Paris','Europe/Berlin','Europe/Madrid','Europe/Rome',
  'America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Toronto','America/Sao_Paulo',
  'Asia/Tehran','Asia/Dubai','Asia/Tokyo','Asia/Shanghai','Asia/Singapore','Asia/Kolkata','Asia/Hong_Kong',
  'Australia/Sydney','Pacific/Auckland'
];

/** Get current local offset in minutes */
export function getLocalOffset(): number {
  return -new Date().getTimezoneOffset();
}

/** Compare two timezones offset at given date */
export function compareZoneOffsets(zoneA: string, zoneB: string, date: Date = new Date()): number | null {
  const a = getTimezoneOffset(zoneA, date);
  const b = getTimezoneOffset(zoneB, date);
  if (a == null || b == null) return null;
  return a - b; // positive if A ahead of B
}

/** Shift a date by target zone offset difference relative to current local zone.
 * This does not change the absolute moment; instead returns a new Date representing
 * the same wall clock time in the target zone interpreted as local.
 * For example useful for naive scheduling.
 */
export function reinterpretAsZone(date: Date, targetZone: string): Date | null {
  const target = convertDateToZone(date, targetZone);
  if (!target) return null;
  return new Date(Date.UTC(target.year, target.month - 1, target.day, target.hour, target.minute, target.second));
}

/**
 * Check if a date is in Daylight Saving Time for a given timezone
 * @param date - date to check
 * @param zone - IANA timezone string
 */
export function isDST(date: Date, zone: string): boolean | null {
  if (!isValidTimeZone(zone)) return null;
  
  // Compare offset in January vs July - the one with larger offset is DST
  const january = new Date(date.getFullYear(), 0, 1);
  const july = new Date(date.getFullYear(), 6, 1);
  
  const janOffset = getTimezoneOffset(zone, january);
  const julOffset = getTimezoneOffset(zone, july);
  const currentOffset = getTimezoneOffset(zone, date);
  
  if (janOffset === null || julOffset === null || currentOffset === null) {
    return null;
  }
  
  // If offsets are the same, no DST in this zone
  if (janOffset === julOffset) {
    return false;
  }
  
  // In northern hemisphere, summer (July) has larger offset
  // In southern hemisphere, summer (January) has larger offset
  // DST is whichever is the "larger" offset
  const maxOffset = Math.max(janOffset, julOffset);
  
  return currentOffset === maxOffset;
}

/**
 * Get the next DST transition (if any) for a timezone
 * @param date - starting date
 * @param zone - IANA timezone string
 * @returns next DST transition date or null if no DST in that zone
 */
export function getNextDSTTransition(date: Date, zone: string): Date | null {
  if (!isValidTimeZone(zone)) return null;
  
  const january = new Date(date.getFullYear(), 0, 1);
  const july = new Date(date.getFullYear(), 6, 1);
  
  const janOffset = getTimezoneOffset(zone, january);
  const julOffset = getTimezoneOffset(zone, july);
  
  if (janOffset === null || julOffset === null) return null;
  
  // No DST if offsets are the same
  if (janOffset === julOffset) return null;
  
  // Binary search for the transition within the next year
  const currentOffset = getTimezoneOffset(zone, date);
  if (currentOffset === null) return null;
  
  // Check day by day for up to 366 days
  const searchDate = new Date(date);
  for (let i = 1; i <= 366; i++) {
    searchDate.setDate(searchDate.getDate() + 1);
    const newOffset = getTimezoneOffset(zone, searchDate);
    if (newOffset !== null && newOffset !== currentOffset) {
      // Found a transition, now narrow it down
      const prevDay = new Date(searchDate);
      prevDay.setDate(prevDay.getDate() - 1);
      
      // Binary search within the day
      let low = prevDay.getTime();
      let high = searchDate.getTime();
      
      while (high - low > 60000) { // 1 minute precision
        const mid = Math.floor((low + high) / 2);
        const midDate = new Date(mid);
        const midOffset = getTimezoneOffset(zone, midDate);
        
        if (midOffset === currentOffset) {
          low = mid;
        } else {
          high = mid;
        }
      }
      
      return new Date(high);
    }
  }
  
  return null;
}

/**
 * Find overlapping working hours between multiple timezones
 * @param zones - array of IANA timezone strings
 * @param workHoursStart - work hours start (0-24)
 * @param workHoursEnd - work hours end (0-24)
 * @param date - reference date (default: today)
 * @returns array of overlapping hour ranges in UTC, or null if no overlap
 */
export function findCommonWorkingHours(
  zones: string[],
  workHoursStart: number = 9,
  workHoursEnd: number = 17,
  date: Date = new Date()
): { startUTC: number; endUTC: number } | null {
  if (zones.length === 0) return null;
  
  // Convert each zone's work hours to UTC
  const utcRanges = zones.map(zone => {
    const offset = getTimezoneOffset(zone, date);
    if (offset === null) return null;
    
    // Offset is in minutes, positive means ahead of UTC
    // So to convert local time to UTC, we subtract the offset
    const startUTC = workHoursStart - (offset / 60);
    const endUTC = workHoursEnd - (offset / 60);
    
    return { startUTC, endUTC };
  });
  
  if (utcRanges.some(r => r === null)) return null;
  
  const validRanges = utcRanges as { startUTC: number; endUTC: number }[];
  
  // Find intersection of all ranges
  let overlapStart = Math.max(...validRanges.map(r => r.startUTC));
  let overlapEnd = Math.min(...validRanges.map(r => r.endUTC));
  
  if (overlapStart >= overlapEnd) {
    return null; // No overlap
  }
  
  return { startUTC: overlapStart, endUTC: overlapEnd };
}

/**
 * Get all timezone abbreviations for a zone on a given date
 * @param zone - IANA timezone string
 * @param date - reference date
 */
export function getTimezoneAbbreviation(zone: string, date: Date = new Date()): string | null {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'short'
    });
    const parts = fmt.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value || null;
  } catch {
    return null;
  }
}

/**
 * Convert a wall clock time from one timezone to another
 * @param date - date with time in source timezone
 * @param fromZone - source timezone
 * @param toZone - target timezone
 */
export function convertBetweenZones(date: Date, fromZone: string, toZone: string): Date | null {
  // First, interpret the date as being in fromZone
  const fromOffset = getTimezoneOffset(fromZone, date);
  const toOffset = getTimezoneOffset(toZone, date);
  
  if (fromOffset === null || toOffset === null) return null;
  
  // Calculate the difference in minutes
  const diffMinutes = toOffset - fromOffset;
  
  // Apply the difference
  const result = new Date(date.getTime() + diffMinutes * 60 * 1000);
  return result;
}

/**
 * Get the time difference between two timezones in hours
 * @param zoneA - first timezone
 * @param zoneB - second timezone
 * @param date - reference date
 */
export function getTimezoneDifferenceHours(zoneA: string, zoneB: string, date: Date = new Date()): number | null {
  const diff = compareZoneOffsets(zoneA, zoneB, date);
  if (diff === null) return null;
  return diff / 60;
}

/**
 * Check if two timezones have the same offset at a given date
 * @param zoneA - first timezone
 * @param zoneB - second timezone  
 * @param date - reference date
 */
export function isSameTimezone(zoneA: string, zoneB: string, date: Date = new Date()): boolean | null {
  const diff = compareZoneOffsets(zoneA, zoneB, date);
  if (diff === null) return null;
  return diff === 0;
}
