import { describe, it, expect } from 'vitest';
import {
  serializeDate,
  deserializeDate,
  createDateReviver,
  createDateReplacer,
  parseISOString,
  toEpochTimestamp,
  fromEpochTimestamp,
  createEpochTimestamp,
  toDateObject,
  fromDateObject,
  isValidISODateString,
  isValidEpochTimestamp,
  cloneDate,
  datesEqual,
  now,
  parseJSONWithDates,
  stringifyWithDates
} from '../src/serialize.js';

describe('Serialize', () => {
  const testDate = new Date('2025-09-14T12:30:45.123Z');

  describe('serializeDate and deserializeDate', () => {
    it('should serialize and deserialize ISO format', () => {
      const serialized = serializeDate(testDate, { format: 'iso' });
      expect(typeof serialized).toBe('string');
      expect(serialized).toBe('2025-09-14T12:30:45.123Z');

      const deserialized = deserializeDate(serialized as string);
      expect(deserialized).toEqual(testDate);
    });

    it('should serialize and deserialize epoch format', () => {
      const serialized = serializeDate(testDate, { format: 'epoch', precision: 'milliseconds' });
      expect(typeof serialized).toBe('number');
      expect(serialized).toBe(testDate.getTime());

      const deserialized = deserializeDate(serialized as number, { precision: 'milliseconds' });
      expect(deserialized).toEqual(testDate);
    });

    it('should serialize and deserialize object format', () => {
      const serialized = serializeDate(testDate, { format: 'object' });
      expect(typeof serialized).toBe('object');
      
      const expected = {
        year: 2025,
        month: 9,
        day: 14,
        hour: 12,
        minute: 30,
        second: 45,
        millisecond: 123
      };
      expect(serialized).toEqual(expected);

      const deserialized = deserializeDate(serialized);
      expect(deserialized?.getTime()).toBe(testDate.getTime());
    });

    it('should handle custom format', () => {
      const serialized = serializeDate(testDate, { 
        format: 'custom', 
        customFormat: 'YYYY-MM-DD HH:mm:ss' 
      });
      expect(serialized).toBe('2025-09-14 12:30:45');
    });

    it('should include timezone when requested', () => {
      const serialized = serializeDate(testDate, { 
        format: 'object', 
        includeTimezone: true 
      });
      expect(serialized).toHaveProperty('timezone');
    });

    it('should handle useUTC option', () => {
      const localDate = new Date('2025-09-14T12:30:45.123');
      const serializedUTC = serializeDate(localDate, { format: 'iso', useUTC: true });
      const serializedLocal = serializeDate(localDate, { format: 'iso', useUTC: false });
      
      // Both should return ISO strings (useUTC affects internal processing)
      expect(typeof serializedUTC).toBe('string');
      expect(typeof serializedLocal).toBe('string');
    });

    it('should throw error for invalid date', () => {
      expect(() => serializeDate(new Date('invalid'))).toThrow('Invalid date provided for serialization');
    });

    it('should return null for invalid deserialization', () => {
      expect(deserializeDate('invalid-date')).toBe(null);
      expect(deserializeDate(NaN)).toBe(null);
      expect(deserializeDate({} as any)).toBe(null);
    });
  });

  describe('createDateReviver and createDateReplacer', () => {
    it('should create working reviver function', () => {
      const reviver = createDateReviver(['createdAt', 'updatedAt']);
      
      expect(reviver('createdAt', '2025-09-14T12:30:45.123Z')).toEqual(testDate);
      expect(reviver('normalField', 'normal value')).toBe('normal value');
      expect(reviver('createdAt', 'invalid-date')).toBe('invalid-date'); // Returns original on failure
    });

    it('should create working replacer function', () => {
      const replacer = createDateReplacer(['createdAt', 'updatedAt']);
      
      expect(replacer('createdAt', testDate)).toBe('2025-09-14T12:30:45.123Z');
      expect(replacer('normalField', 'normal value')).toBe('normal value');
      expect(replacer('createdAt', 'not a date')).toBe('not a date');
    });

    it('should work with custom options', () => {
      const replacer = createDateReplacer(['timestamp'], { format: 'epoch' });
      expect(replacer('timestamp', testDate)).toBe(testDate.getTime());
    });
  });

  describe('parseISOString', () => {
    it('should parse valid ISO strings', () => {
      expect(parseISOString('2025-09-14T12:30:45.123Z')).toEqual(testDate);
      expect(parseISOString('2025-09-14T12:30:45Z')).toEqual(new Date('2025-09-14T12:30:45Z'));
    });

    it('should handle invalid inputs', () => {
      expect(parseISOString('')).toBe(null);
      expect(parseISOString('invalid')).toBe(null);
      expect(parseISOString('2025-13-45')).toBe(null);
    });

    it('should handle useUTC option', () => {
      const isoString = '2025-09-14T12:30:45.123Z';
      const normalParse = parseISOString(isoString, false);
      const utcParse = parseISOString(isoString, true);
      
      expect(normalParse).toEqual(testDate);
      // UTC parsing should adjust for timezone offset
      if (testDate.getTimezoneOffset() !== 0) {
        const expectedUTC = new Date(testDate.getTime() + (testDate.getTimezoneOffset() * 60000));
        expect(utcParse).toEqual(expectedUTC);
      } else {
        expect(utcParse).toEqual(testDate);
      }
    });
  });

  describe('epoch timestamp functions', () => {
    it('should convert to epoch with different precisions', () => {
      const ms = toEpochTimestamp(testDate, 'milliseconds');
      const s = toEpochTimestamp(testDate, 'seconds');
      const us = toEpochTimestamp(testDate, 'microseconds');

      expect(ms).toBe(testDate.getTime());
      expect(s).toBe(Math.floor(testDate.getTime() / 1000));
      expect(us).toBe(testDate.getTime() * 1000);
    });

    it('should convert from epoch with different precisions', () => {
      const timestamp = testDate.getTime();
      
      expect(fromEpochTimestamp(timestamp, 'milliseconds')).toEqual(testDate);
      expect(fromEpochTimestamp(Math.floor(timestamp / 1000), 'seconds')).toEqual(
        new Date(Math.floor(timestamp / 1000) * 1000)
      );
      expect(fromEpochTimestamp(timestamp * 1000, 'microseconds')).toEqual(testDate);
    });

    it('should create epoch timestamp with metadata', () => {
      const epochObj = createEpochTimestamp(testDate, 'milliseconds', 'UTC');
      
      expect(epochObj).toEqual({
        timestamp: testDate.getTime(),
        precision: 'milliseconds',
        timezone: 'UTC'
      });
    });

    it('should validate epoch timestamps', () => {
      expect(isValidEpochTimestamp(testDate.getTime(), 'milliseconds')).toBe(true);
      expect(isValidEpochTimestamp(Math.floor(testDate.getTime() / 1000), 'seconds')).toBe(true);
      expect(isValidEpochTimestamp(NaN)).toBe(false);
      expect(isValidEpochTimestamp(-1)).toBe(false);
      expect(isValidEpochTimestamp(Date.now() + (100 * 365 * 24 * 60 * 60 * 1000))).toBe(false); // Too far in future
    });
  });

  describe('date object functions', () => {
    it('should convert to and from date objects', () => {
      const dateObj = toDateObject(testDate);
      const expected = {
        year: 2025,
        month: 9,
        day: 14,
        hour: 12,
        minute: 30,
        second: 45,
        millisecond: 123
      };
      
      expect(dateObj).toEqual(expected);
      
      const reconstructed = fromDateObject(dateObj);
      expect(reconstructed.getTime()).toBe(testDate.getTime());
    });

    it('should include timezone when requested', () => {
      const dateObj = toDateObject(testDate, true);
      expect(dateObj).toHaveProperty('timezone');
      expect(typeof dateObj.timezone).toBe('string');
    });

    it('should validate date object fields', () => {
      expect(() => fromDateObject({} as any)).toThrow('Date object must include year, month, and day');
      expect(() => fromDateObject({ year: 2025, month: 13, day: 1 } as any)).toThrow('Month must be between 1 and 12');
      expect(() => fromDateObject({ year: 2025, month: 1, day: 32 } as any)).toThrow('Day must be between 1 and 31');
      expect(() => fromDateObject({ year: 2025, month: 1, day: 1, hour: 25, minute: 0, second: 0, millisecond: 0 })).toThrow('Hour must be between 0 and 23');
    });

    it('should handle partial date objects', () => {
      const partialObj = { year: 2025, month: 9, day: 14, hour: 0, minute: 0, second: 0, millisecond: 0 };
      const date = fromDateObject(partialObj);
      
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(8); // 0-based
      expect(date.getDate()).toBe(14);
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
    });
  });

  describe('validation functions', () => {
    it('should validate ISO date strings', () => {
      expect(isValidISODateString('2025-09-14T12:30:45.123Z')).toBe(true);
      expect(isValidISODateString('2025-09-14T12:30:45Z')).toBe(true);
      expect(isValidISODateString('invalid')).toBe(false);
      expect(isValidISODateString('')).toBe(false);
    });
  });

  describe('utility functions', () => {
    it('should clone dates', () => {
      const cloned = cloneDate(testDate);
      expect(cloned).toEqual(testDate);
      expect(cloned).not.toBe(testDate); // Different reference
      
      expect(cloneDate(new Date('invalid'))).toBe(null);
      expect(cloneDate('2025-09-14T12:30:45.123Z')).toEqual(testDate);
    });

    it('should compare dates with different precisions', () => {
      const date1 = new Date('2025-09-14T12:30:45.123Z');
      const date2 = new Date('2025-09-14T12:30:45.456Z');
      const date3 = new Date('2025-09-14T12:30:46.123Z');

      expect(datesEqual(date1, date2, 'milliseconds')).toBe(false);
      expect(datesEqual(date1, date2, 'seconds')).toBe(true);
      expect(datesEqual(date1, date3, 'seconds')).toBe(false);
      expect(datesEqual(date1, date3, 'minutes')).toBe(true);
    });

    it('should get current time in various formats', () => {
      const nowDate = now('date') as Date;
      const nowISO = now('iso') as string;
      const nowEpochMs = now('epoch-ms') as number;
      const nowEpochS = now('epoch-s') as number;

      expect(nowDate).toBeInstanceOf(Date);
      expect(typeof nowISO).toBe('string');
      expect(typeof nowEpochMs).toBe('number');
      expect(typeof nowEpochS).toBe('number');
      expect(nowEpochS).toBe(Math.floor(nowEpochMs / 1000));
    });
  });

  describe('JSON utilities', () => {
    it('should parse JSON with automatic date conversion', () => {
      const jsonString = JSON.stringify({
        name: 'Test',
        createdAt: testDate.toISOString(),
        updatedAt: testDate.getTime(),
        normalField: 'value'
      });

      const parsed = parseJSONWithDates(jsonString, ['createdAt', 'updatedAt']);
      
      expect(parsed.name).toBe('Test');
      expect(parsed.createdAt).toEqual(testDate);
      expect(parsed.updatedAt).toEqual(testDate);
      expect(parsed.normalField).toBe('value');
    });

    it('should stringify JSON with automatic date conversion', () => {
      const obj = {
        name: 'Test',
        createdAt: testDate,
        updatedAt: testDate,
        normalField: 'value'
      };

      const jsonString = stringifyWithDates(obj, ['createdAt', 'updatedAt']);
      const parsed = JSON.parse(jsonString);
      
      expect(parsed.name).toBe('Test');
      expect(parsed.createdAt).toBe(testDate.toISOString());
      expect(parsed.updatedAt).toBe(testDate.toISOString());
      expect(parsed.normalField).toBe('value');
    });

    it('should handle JSON errors gracefully', () => {
      expect(() => parseJSONWithDates('invalid json')).toThrow('Failed to parse JSON');
      
      const circularObj = {} as any;
      circularObj.self = circularObj;
      expect(() => stringifyWithDates(circularObj)).toThrow('Failed to stringify JSON');
    });

    it('should work with custom serialization options', () => {
      const obj = { timestamp: testDate };
      const jsonString = stringifyWithDates(obj, ['timestamp'], { format: 'epoch' });
      const parsed = JSON.parse(jsonString);
      
      expect(parsed.timestamp).toBe(testDate.getTime());
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined inputs', () => {
      expect(deserializeDate(null as any)).toBe(null);
      expect(deserializeDate(undefined as any)).toBe(null);
      expect(cloneDate(null as any)).toBe(null);
      expect(cloneDate(undefined as any)).toBe(null);
    });

    it('should handle invalid date inputs', () => {
      expect(() => serializeDate(new Date('invalid'))).toThrow();
      expect(() => toEpochTimestamp(new Date('invalid'))).toThrow();
      expect(() => toDateObject(new Date('invalid'))).toThrow();
    });

    it('should require custom format string', () => {
      expect(() => serializeDate(testDate, { format: 'custom' })).toThrow('Custom format string required');
    });

    it('should handle string and number date inputs', () => {
      expect(cloneDate('2025-09-14T12:30:45.123Z')).toEqual(testDate);
      expect(cloneDate(testDate.getTime())).toEqual(testDate);
      expect(cloneDate('invalid')).toBe(null);
    });
  });
});