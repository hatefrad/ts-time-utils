/**
 * @fileoverview Date iteration utilities for generating date sequences
 */

/**
 * Generate an array of dates for each day in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Array of dates, one per day
 * @example
 * eachDay(new Date('2024-01-01'), new Date('2024-01-05'))
 * // [Jan 1, Jan 2, Jan 3, Jan 4, Jan 5]
 */
export function eachDay(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDate) {
    result.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Generate an array of dates for each weekday (Mon-Fri) in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Array of weekday dates
 * @example
 * eachWeekday(new Date('2024-01-01'), new Date('2024-01-07'))
 * // [Jan 1 (Mon), Jan 2 (Tue), Jan 3 (Wed), Jan 4 (Thu), Jan 5 (Fri)]
 */
export function eachWeekday(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      result.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Generate an array of dates for each weekend day (Sat-Sun) in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Array of weekend dates
 */
export function eachWeekend(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDate) {
    const day = current.getDay();
    if (day === 0 || day === 6) {
      result.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Generate an array of dates for each week start in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @param weekStartsOn - Day week starts on (0=Sunday, 1=Monday, default: 0)
 * @returns Array of week start dates
 * @example
 * eachWeek(new Date('2024-01-01'), new Date('2024-01-31'))
 * // [Jan 7, Jan 14, Jan 21, Jan 28] (Sundays)
 */
export function eachWeek(
  start: Date,
  end: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): Date[] {
  const result: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  // Move to first week start on or after start date
  const dayDiff = (current.getDay() - weekStartsOn + 7) % 7;
  if (dayDiff > 0) {
    current.setDate(current.getDate() + (7 - dayDiff));
  }

  while (current <= endDate) {
    result.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return result;
}

/**
 * Generate an array of dates for the first day of each month in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Array of first-of-month dates
 * @example
 * eachMonth(new Date('2024-01-15'), new Date('2024-04-15'))
 * // [Feb 1, Mar 1, Apr 1]
 */
export function eachMonth(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDate) {
    result.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

/**
 * Generate an array of dates for the first day of each quarter in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Array of quarter start dates
 */
export function eachQuarter(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  
  // Start from beginning of next quarter after start date
  const startMonth = start.getMonth();
  const nextQuarterMonth = Math.ceil((startMonth + 1) / 3) * 3;
  const current = new Date(
    nextQuarterMonth > 11 ? start.getFullYear() + 1 : start.getFullYear(),
    nextQuarterMonth % 12,
    1
  );
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDate) {
    result.push(new Date(current));
    current.setMonth(current.getMonth() + 3);
  }

  return result;
}

/**
 * Generate an array of dates for January 1st of each year in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Array of year start dates
 */
export function eachYear(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const startYear = start.getMonth() === 0 && start.getDate() === 1 
    ? start.getFullYear() 
    : start.getFullYear() + 1;
  const endYear = end.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    result.push(new Date(year, 0, 1));
  }

  return result;
}

/**
 * Generate an array of dates at regular hour intervals
 * @param start - Start date/time (inclusive)
 * @param end - End date/time (inclusive)
 * @param step - Hour interval (default: 1)
 * @returns Array of dates at each interval
 * @example
 * eachHour(new Date('2024-01-01T09:00'), new Date('2024-01-01T12:00'))
 * // [9:00, 10:00, 11:00, 12:00]
 */
export function eachHour(start: Date, end: Date, step: number = 1): Date[] {
  const result: Date[] = [];
  const current = new Date(start);
  current.setMinutes(0, 0, 0);

  while (current <= end) {
    result.push(new Date(current));
    current.setHours(current.getHours() + step);
  }

  return result;
}

/**
 * Generate an array of dates at regular minute intervals
 * @param start - Start date/time (inclusive)
 * @param end - End date/time (inclusive)
 * @param step - Minute interval (default: 1)
 * @returns Array of dates at each interval
 * @example
 * eachMinute(new Date('2024-01-01T09:00'), new Date('2024-01-01T09:05'))
 * // [9:00, 9:01, 9:02, 9:03, 9:04, 9:05]
 */
export function eachMinute(start: Date, end: Date, step: number = 1): Date[] {
  const result: Date[] = [];
  const current = new Date(start);
  current.setSeconds(0, 0);

  while (current <= end) {
    result.push(new Date(current));
    current.setMinutes(current.getMinutes() + step);
  }

  return result;
}

/**
 * Generate an array of dates for a specific day of the week in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @param dayOfWeek - Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @returns Array of dates for that day of week
 * @example
 * eachDayOfWeek(new Date('2024-01-01'), new Date('2024-01-31'), 1)
 * // All Mondays in January 2024
 */
export function eachDayOfWeek(
  start: Date,
  end: Date,
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
): Date[] {
  const result: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  // Move to first occurrence of dayOfWeek
  const diff = (dayOfWeek - current.getDay() + 7) % 7;
  current.setDate(current.getDate() + diff);

  while (current <= endDate) {
    result.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return result;
}

/**
 * Generate dates at a custom interval
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @param interval - Interval configuration
 * @returns Array of dates at each interval
 * @example
 * eachInterval(start, end, { days: 3 }) // Every 3 days
 * eachInterval(start, end, { weeks: 2 }) // Every 2 weeks
 * eachInterval(start, end, { hours: 6 }) // Every 6 hours
 */
export function eachInterval(
  start: Date,
  end: Date,
  interval: {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }
): Date[] {
  const result: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    result.push(new Date(current));

    if (interval.years) {
      current.setFullYear(current.getFullYear() + interval.years);
    }
    if (interval.months) {
      current.setMonth(current.getMonth() + interval.months);
    }
    if (interval.weeks) {
      current.setDate(current.getDate() + interval.weeks * 7);
    }
    if (interval.days) {
      current.setDate(current.getDate() + interval.days);
    }
    if (interval.hours) {
      current.setHours(current.getHours() + interval.hours);
    }
    if (interval.minutes) {
      current.setMinutes(current.getMinutes() + interval.minutes);
    }
    if (interval.seconds) {
      current.setSeconds(current.getSeconds() + interval.seconds);
    }
  }

  return result;
}

/**
 * Count the number of days in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Number of days
 */
export function countDays(start: Date, end: Date): number {
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endDay.getTime() - startDay.getTime()) / 86400000) + 1;
}

/**
 * Count the number of weekdays in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Number of weekdays
 */
export function countWeekdays(start: Date, end: Date): number {
  return eachWeekday(start, end).length;
}

/**
 * Count the number of weekend days in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Number of weekend days
 */
export function countWeekendDays(start: Date, end: Date): number {
  return eachWeekend(start, end).length;
}

/**
 * Count the number of weeks (complete or partial) in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Number of weeks
 */
export function countWeeks(start: Date, end: Date): number {
  const days = countDays(start, end);
  return Math.ceil(days / 7);
}

/**
 * Count the number of months in a range
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @returns Number of months (partial months count as 1)
 */
export function countMonths(start: Date, end: Date): number {
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  return yearDiff * 12 + monthDiff + 1;
}

/**
 * Iterator for lazy date generation (memory efficient for large ranges)
 * @param start - Start date (inclusive)
 * @param end - End date (inclusive)
 * @param step - Step function to advance the date
 * @yields Date objects
 */
export function* iterateDates(
  start: Date,
  end: Date,
  step: (current: Date) => void = (d) => d.setDate(d.getDate() + 1)
): Generator<Date, void, unknown> {
  const current = new Date(start);

  while (current <= end) {
    yield new Date(current);
    step(current);
  }
}

/**
 * Create a lazy day iterator
 * @param start - Start date
 * @param end - End date
 * @yields Each day in the range
 */
export function* iterateDays(start: Date, end: Date): Generator<Date, void, unknown> {
  yield* iterateDates(start, end, (d) => d.setDate(d.getDate() + 1));
}

/**
 * Create a lazy weekday iterator
 * @param start - Start date
 * @param end - End date
 * @yields Each weekday in the range
 */
export function* iterateWeekdays(start: Date, end: Date): Generator<Date, void, unknown> {
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      yield new Date(current);
    }
    current.setDate(current.getDate() + 1);
  }
}

/**
 * Create a lazy month iterator
 * @param start - Start date
 * @param end - End date
 * @yields First day of each month in the range
 */
export function* iterateMonths(start: Date, end: Date): Generator<Date, void, unknown> {
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    yield new Date(current);
    current.setMonth(current.getMonth() + 1);
  }
}

/**
 * Generate dates by applying a filter to a range
 * @param start - Start date
 * @param end - End date
 * @param filter - Filter function (return true to include date)
 * @returns Array of filtered dates
 * @example
 * // Get all 15th days of each month
 * filterDays(start, end, d => d.getDate() === 15)
 */
export function filterDays(
  start: Date,
  end: Date,
  filter: (date: Date) => boolean
): Date[] {
  const result: Date[] = [];

  for (const date of iterateDays(start, end)) {
    if (filter(date)) {
      result.push(date);
    }
  }

  return result;
}

/**
 * Generate the last day of each month in a range
 * @param start - Start date
 * @param end - End date
 * @returns Array of last-of-month dates
 */
export function eachMonthEnd(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDate) {
    result.push(new Date(current));
    current.setMonth(current.getMonth() + 2);
    current.setDate(0); // Last day of previous month
  }

  return result;
}

/**
 * Generate specific day of each month in a range
 * @param start - Start date
 * @param end - End date
 * @param dayOfMonth - Day of month (1-31, will cap at month's max)
 * @returns Array of dates
 * @example
 * eachNthDayOfMonth(start, end, 15) // 15th of each month
 * eachNthDayOfMonth(start, end, 31) // Last day of short months, 31st otherwise
 */
export function eachNthDayOfMonth(
  start: Date,
  end: Date,
  dayOfMonth: number
): Date[] {
  const result: Date[] = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDate) {
    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const actualDay = Math.min(dayOfMonth, daysInMonth);
    const date = new Date(current.getFullYear(), current.getMonth(), actualDay);

    if (date >= start && date <= endDate) {
      result.push(date);
    }

    current.setMonth(current.getMonth() + 1);
  }

  return result;
}
