import { describe, it, expect } from 'vitest';
import {
  getTimezoneOffset,
  formatInTimeZone,
  getZonedTime,
  convertDateToZone,
  isValidTimeZone,
  COMMON_TIMEZONES,
  getLocalOffset,
  compareZoneOffsets,
  reinterpretAsZone,
  isDST,
  getNextDSTTransition,
  findCommonWorkingHours,
  getTimezoneAbbreviation,
  convertBetweenZones,
  getTimezoneDifferenceHours,
  isSameTimezone
} from '../src/timezone';

// Note: Timezone assertions can vary by environment; keep tests resilient

describe('timezone utilities', () => {
  it('validates timezones', () => {
    expect(isValidTimeZone('UTC')).toBe(true);
    expect(isValidTimeZone('Not/AZone')).toBe(false);
  });

  it('gets timezone offset for UTC', () => {
    const off = getTimezoneOffset('UTC', new Date('2025-01-01T00:00:00Z'));
    expect(off).toBe(0);
  });

  it('formats in timezone', () => {
    const str = formatInTimeZone(new Date('2025-01-01T12:34:56Z'), 'UTC', { hour: '2-digit', minute: '2-digit', hour12: false });
    expect(str.includes('12') || str.includes('12:')).toBe(true);
  });

  it('gets zoned time object', () => {
    const z = getZonedTime(new Date(), 'UTC');
    expect(z && z.zone).toBe('UTC');
  });

  it('converts date to zone parts', () => {
    const parts = convertDateToZone(new Date('2025-06-01T00:00:00Z'), 'UTC');
    expect(parts && parts.year).toBe(2025);
  });

  it('lists common timezones', () => {
    expect(COMMON_TIMEZONES).toContain('UTC');
  });

  it('gets local offset', () => {
    const local = getLocalOffset();
    expect(typeof local).toBe('number');
  });

  it('compares offsets', () => {
    const diff = compareZoneOffsets('UTC','UTC', new Date());
    expect(diff).toBe(0);
  });

  it('reinterprets date as zone', () => {
    const date = new Date('2025-01-01T10:00:00Z');
    const re = reinterpretAsZone(date, 'UTC');
    expect(re && re.toISOString()).toBe('2025-01-01T10:00:00.000Z');
  });

  describe('isDST', () => {
    it('returns null for invalid timezone', () => {
      expect(isDST(new Date(), 'Invalid/Zone')).toBeNull();
    });

    it('returns false for UTC (no DST)', () => {
      // UTC doesn't observe DST
      expect(isDST(new Date(), 'UTC')).toBe(false);
    });

    it('tracks DST boundaries in a northern hemisphere zone', () => {
      const before = new Date('2025-03-09T06:59:59Z');
      const after = new Date('2025-03-09T07:00:00Z');

      expect(isDST(before, 'America/New_York')).toBe(false);
      expect(isDST(after, 'America/New_York')).toBe(true);
    });

    it('tracks DST boundaries in a southern hemisphere zone', () => {
      const before = new Date('2025-04-05T15:59:59Z');
      const after = new Date('2025-04-05T16:00:00Z');

      expect(isDST(before, 'Australia/Sydney')).toBe(true);
      expect(isDST(after, 'Australia/Sydney')).toBe(false);
    });
  });

  describe('getNextDSTTransition', () => {
    it('returns null for UTC (no DST)', () => {
      expect(getNextDSTTransition(new Date(), 'UTC')).toBeNull();
    });

    it('returns null for invalid timezone', () => {
      expect(getNextDSTTransition(new Date(), 'Invalid/Zone')).toBeNull();
    });

    it('finds the exact spring transition in New York', () => {
      const transition = getNextDSTTransition(new Date('2025-03-01T00:00:00Z'), 'America/New_York');
      expect(transition?.toISOString()).toBe('2025-03-09T07:00:00.000Z');
    });

    it('finds the exact autumn transition in Sydney', () => {
      const transition = getNextDSTTransition(new Date('2025-03-20T00:00:00Z'), 'Australia/Sydney');
      expect(transition?.toISOString()).toBe('2025-04-05T16:00:00.000Z');
    });
  });

  describe('findCommonWorkingHours', () => {
    it('finds overlapping hours between timezones', () => {
      // UTC and UTC should overlap completely
      const result = findCommonWorkingHours(['UTC', 'UTC']);
      expect(result).not.toBeNull();
      expect(result?.startUTC).toBe(9);
      expect(result?.endUTC).toBe(17);
    });

    it('returns null for empty zones array', () => {
      expect(findCommonWorkingHours([])).toBeNull();
    });

    it('returns null for invalid timezone', () => {
      expect(findCommonWorkingHours(['Invalid/Zone'])).toBeNull();
    });

    it('handles fractional offsets and wraparound across midnight', () => {
      const result = findCommonWorkingHours(
        ['Australia/Adelaide', 'Asia/Kolkata'],
        22,
        4,
        new Date('2025-01-15T00:00:00Z')
      );

      expect(result).toEqual({ startUTC: 16.5, endUTC: 17.5 });
    });
  });

  describe('getTimezoneAbbreviation', () => {
    it('gets timezone abbreviation', () => {
      const abbr = getTimezoneAbbreviation('UTC');
      expect(abbr).toBeTruthy();
    });

    it('returns null for invalid timezone', () => {
      expect(getTimezoneAbbreviation('Invalid/Zone')).toBeNull();
    });
  });

  describe('convertBetweenZones', () => {
    it('converts between same zone', () => {
      const date = new Date('2025-01-15T10:00:00Z');
      const result = convertBetweenZones(date, 'UTC', 'UTC');
      expect(result?.getTime()).toBe(date.getTime());
    });

    it('returns null for invalid timezone', () => {
      expect(convertBetweenZones(new Date(), 'Invalid/Zone', 'UTC')).toBeNull();
      expect(convertBetweenZones(new Date(), 'UTC', 'Invalid/Zone')).toBeNull();
    });
  });

  describe('getTimezoneDifferenceHours', () => {
    it('returns 0 for same timezone', () => {
      expect(getTimezoneDifferenceHours('UTC', 'UTC')).toBe(0);
    });

    it('returns null for invalid timezone', () => {
      expect(getTimezoneDifferenceHours('Invalid/Zone', 'UTC')).toBeNull();
    });
  });

  describe('isSameTimezone', () => {
    it('returns true for same timezone', () => {
      expect(isSameTimezone('UTC', 'UTC')).toBe(true);
    });

    it('returns true for equivalent timezones', () => {
      expect(isSameTimezone('UTC', 'Etc/UTC')).toBe(true);
    });

    it('returns null for invalid timezone', () => {
      expect(isSameTimezone('Invalid/Zone', 'UTC')).toBeNull();
    });
  });
});
