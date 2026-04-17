/**
 * Timezone utilities using Intl API with fallbacks
 */

import type { ZonedTime } from './types.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_HOURS = 24;
const YEAR_MONTHS = Array.from({ length: 12 }, (_, month) => month);

type HourInterval = {
  start: number;
  end: number;
};

type SweepEvent = {
  time: number;
  delta: number;
};

function normalizeHourValue(hour: number): number {
  return ((hour % DAY_HOURS) + DAY_HOURS) % DAY_HOURS;
}

function pushSweepInterval(events: SweepEvent[], start: number, end: number): void {
  const clampedStart = Math.max(0, start);
  const clampedEnd = Math.min(DAY_HOURS * 2, end);
  if (clampedStart >= clampedEnd) return;

  events.push({ time: clampedStart, delta: 1 });
  events.push({ time: clampedEnd, delta: -1 });
}

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
 * Uses a yearly-offset heuristic: sample the zone's local year and treat the
 * maximum observed UTC offset as the DST offset for that year.
 * @param date - date to check
 * @param zone - IANA timezone string
 */
export function isDST(date: Date, zone: string): boolean | null {
  if (!isValidTimeZone(zone)) return null;

  const zonedDate = convertDateToZone(date, zone);
  if (!zonedDate) {
    return null;
  }

  const currentOffset = getTimezoneOffset(zone, date);
  if (currentOffset === null) {
    return null;
  }

  const yearlyOffsets = new Set<number>();
  for (const month of YEAR_MONTHS) {
    const sample = new Date(Date.UTC(zonedDate.year, month, 1, 12, 0, 0));
    const offset = getTimezoneOffset(zone, sample);
    if (offset === null) {
      return null;
    }
    yearlyOffsets.add(offset);
  }

  if (yearlyOffsets.size <= 1) {
    return false;
  }

  return currentOffset === Math.max(...yearlyOffsets);
}

/**
 * Get the next DST transition (if any) for a timezone
 * @param date - starting date
 * @param zone - IANA timezone string
 * @returns next DST transition date or null if no DST in that zone
 */
export function getNextDSTTransition(date: Date, zone: string): Date | null {
  if (!isValidTimeZone(zone)) return null;

  const currentOffset = getTimezoneOffset(zone, date);
  if (currentOffset === null) return null;

  const startTime = date.getTime() + 1;
  const searchLimit = startTime + 366 * DAY_MS;

  let low = startTime;
  let high: number | null = null;
  for (let probeTime = startTime + DAY_MS; probeTime <= searchLimit; probeTime += DAY_MS) {
    const probeOffset = getTimezoneOffset(zone, new Date(probeTime));
    if (probeOffset !== null && probeOffset !== currentOffset) {
      low = probeTime - DAY_MS;
      high = probeTime;
      break;
    }
  }

  if (high === null) {
    return null;
  }

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const midOffset = getTimezoneOffset(zone, new Date(mid));
    if (midOffset === currentOffset) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return new Date(high);
}

/**
 * Find overlapping working hours between multiple timezones
 * @param zones - array of IANA timezone strings
 * @param workHoursStart - work hours start (0-24)
 * @param workHoursEnd - work hours end (0-24)
 * @param date - reference date (default: today)
 * @returns one contiguous UTC overlap window, specifically the longest
 * contiguous overlap slice. A full-day overlap is returned as
 * `{ startUTC: 0, endUTC: 24 }`, and wrapped overlaps are returned with
 * `endUTC` normalized back into the 0-24 range and may be less than `startUTC`
 */
export function findCommonWorkingHours(
  zones: string[],
  workHoursStart: number = 9,
  workHoursEnd: number = 17,
  date: Date = new Date()
): { startUTC: number; endUTC: number } | null {
  if (zones.length === 0) return null;

  const endHour = workHoursEnd < workHoursStart ? workHoursEnd + DAY_HOURS : workHoursEnd;
  const duration = endHour - workHoursStart;
  if (duration <= 0) {
    return null;
  }

  const sweepEvents: SweepEvent[] = [];
  for (const zone of zones) {
    const offset = getTimezoneOffset(zone, date);
    if (offset === null) {
      return null;
    }

    if (duration >= DAY_HOURS) {
      pushSweepInterval(sweepEvents, 0, DAY_HOURS * 2);
      continue;
    }

    const startUTC = normalizeHourValue(workHoursStart - (offset / 60));
    pushSweepInterval(sweepEvents, startUTC, startUTC + duration);
    pushSweepInterval(sweepEvents, startUTC + DAY_HOURS, startUTC + DAY_HOURS + duration);
  }

  sweepEvents.sort((a, b) => a.time - b.time || b.delta - a.delta);

  let activeWindows = 0;
  let previousTime = 0;
  let bestOverlap: HourInterval | null = null;

  for (let i = 0; i < sweepEvents.length; ) {
    const currentTime = sweepEvents[i].time;
    if (currentTime > previousTime && activeWindows === zones.length) {
      const candidate = { start: previousTime, end: currentTime };
      if (
        bestOverlap === null ||
        candidate.end - candidate.start > bestOverlap.end - bestOverlap.start ||
        (
          candidate.end - candidate.start === bestOverlap.end - bestOverlap.start &&
          candidate.start < bestOverlap.start
        )
      ) {
        bestOverlap = candidate;
      }
    }

    while (i < sweepEvents.length && sweepEvents[i].time === currentTime) {
      activeWindows += sweepEvents[i].delta;
      i++;
    }

    previousTime = currentTime;
  }

  if (bestOverlap === null) {
    return null;
  }

  const overlapDuration = bestOverlap.end - bestOverlap.start;
  if (overlapDuration >= DAY_HOURS) {
    return { startUTC: 0, endUTC: DAY_HOURS };
  }

  const startUTC = normalizeHourValue(bestOverlap.start);
  const endUTC = normalizeHourValue(bestOverlap.start + overlapDuration);

  return { startUTC, endUTC };
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
