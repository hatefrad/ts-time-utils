import { describe, expect, it } from 'vitest';
import { parseDate } from '../../src/parse';
import { isValidDate } from '../../src/validate';
import { differenceInUnits, startOf } from '../../src/calculate';
import { createRecurrence } from '../../src/recurrence';
import { formatDateRange } from '../../src/format';
import { DEFAULT_WORKING_HOURS, isWorkingTime, nextWorkingTime } from '../../src/workingHours';
import { convertDateToZone } from '../../src/timezone';

describe('cross-module integration', () => {
  it('parses a date, validates it, and feeds it into calculate helpers', () => {
    const parsed = parseDate('09/13/2025 14:30:00');

    expect(parsed).not.toBeNull();
    expect(isValidDate(parsed!)).toBe(true);

    const dayStart = startOf(parsed!, 'day');
    expect(dayStart.getHours()).toBe(0);
    expect(differenceInUnits(parsed!, dayStart, 'hours')).toBe(14.5);
  });

  it('keeps recurrence output aligned with downstream range formatting', () => {
    const recurrence = createRecurrence({
      frequency: 'daily',
      interval: 1,
      startDate: new Date('2024-01-01T09:00:00Z'),
      count: 3,
    });

    const occurrences = recurrence.getAllOccurrences(3);

    expect(occurrences).toHaveLength(3);
    expect(occurrences[0]).toEqual(new Date('2024-01-01T09:00:00Z'));
    expect(formatDateRange(occurrences[0], occurrences[2], { separator: ' to ' })).toBe(
      'Jan 1 to Jan 3, 2024',
    );
  });

  it('treats working-hours checks in the configured timezone', () => {
    const instant = new Date('2025-01-13T16:30:00Z');
    const newYorkClock = convertDateToZone(instant, 'America/New_York');

    expect(newYorkClock).toMatchObject({
      hour: 11,
      minute: 30,
    });

    const localWorkingInstant = new Date('2025-01-13T11:30:00');

    expect(isWorkingTime(localWorkingInstant, DEFAULT_WORKING_HOURS)).toBe(true);
    expect(nextWorkingTime(localWorkingInstant, DEFAULT_WORKING_HOURS)).toEqual(localWorkingInstant);
  });
});
