/** Working hours utilities */

export interface WorkingHoursConfig {
  workingDays: number[]; // 0=Sunday..6
  hours: { start: number; end: number }; // e.g. 9 -> 17 (24h clock, end exclusive)
  breaks?: { start: number; end: number }[]; // optional breaks in hour decimals (e.g. 12 -> 13)
  timezone?: string; // reserved for future expansion
}

export const DEFAULT_WORKING_HOURS: WorkingHoursConfig = {
  workingDays: [1,2,3,4,5],
  hours: { start: 9, end: 17 },
  breaks: [{ start: 12, end: 13 }]
};

/** Check if a date is a configured working day */
export function isWorkingDay(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): boolean {
  return config.workingDays.includes(date.getDay());
}

/** Convert date to fractional hour */
function toHourFraction(date: Date): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds()/3600;
}

/** Check if inside working hours (excluding breaks) */
export function isWorkingTime(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): boolean {
  if (!isWorkingDay(date, config)) return false;
  const h = toHourFraction(date);
  if (h < config.hours.start || h >= config.hours.end) return false;
  if (config.breaks) {
    for (const b of config.breaks) {
      if (h >= b.start && h < b.end) return false;
    }
  }
  return true;
}

/** Move date forward to next working minute */
export function nextWorkingTime(date: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  const d = new Date(date);
  while (!isWorkingTime(d, config)) {
    d.setMinutes(d.getMinutes() + 1);
  }
  return d;
}

/** Clamp a date into working window of its day */
function clampToWorkingWindow(date: Date, config: WorkingHoursConfig): Date | null {
  if (!isWorkingDay(date, config)) return null;
  const start = new Date(date); start.setHours(config.hours.start,0,0,0);
  const end = new Date(date); end.setHours(config.hours.end,0,0,0);
  if (date < start) return start;
  if (date > end) return null;
  return date;
}

/** Compute working time (ms) between two dates */
export function workingTimeBetween(start: Date, end: Date, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): number {
  if (end <= start) return 0;
  let total = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    if (isWorkingDay(cursor, config)) {
      const windowStart = new Date(cursor); windowStart.setHours(config.hours.start,0,0,0);
      const windowEnd = new Date(cursor); windowEnd.setHours(config.hours.end,0,0,0);
      const rangeStart = cursor > windowStart ? cursor : windowStart;
      const rangeEnd = end < windowEnd ? end : windowEnd;
      if (rangeStart < rangeEnd) {
        let segment = (rangeEnd.getTime() - rangeStart.getTime()) / 1000 / 60 / 60; // hours
        // subtract breaks
        if (config.breaks) {
          for (const b of config.breaks) {
            const bStart = new Date(rangeStart); bStart.setHours(Math.floor(b.start), (b.start%1)*60,0,0);
            const bEnd = new Date(rangeStart); bEnd.setHours(Math.floor(b.end), (b.end%1)*60,0,0);
            const overlapStart = bStart > rangeStart ? bStart : rangeStart;
            const overlapEnd = bEnd < rangeEnd ? bEnd : rangeEnd;
            if (overlapStart < overlapEnd) {
              segment -= (overlapEnd.getTime() - overlapStart.getTime()) / 1000 / 60 / 60;
            }
          }
        }
        total += segment;
      }
    }
    // advance to next day start
    cursor.setHours(24,0,0,0);
  }
  return total * 60 * 60 * 1000; // ms
}

/** Advance by working hours amount (simple iterative approach) */
export function addWorkingHours(start: Date, hours: number, config: WorkingHoursConfig = DEFAULT_WORKING_HOURS): Date {
  if (hours <= 0) return new Date(start);
  let remaining = hours * 60; // minutes
  let cursor = new Date(start);
  cursor = nextWorkingTime(cursor, config);
  while (remaining > 0) {
    if (isWorkingTime(cursor, config)) {
      cursor.setMinutes(cursor.getMinutes() + 1);
      remaining -= 1;
    } else {
      cursor = nextWorkingTime(cursor, config);
    }
  }
  return cursor;
}
