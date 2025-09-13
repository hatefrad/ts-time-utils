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
  reinterpretAsZone
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
});
