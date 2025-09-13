/**
 * Timezone utilities (rely on Intl API, fallbacks where possible)
 */

export interface ZonedTime {
  date: Date;
  zone: string; // IANA name
  offsetMinutes: number; // offset from UTC in minutes
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
