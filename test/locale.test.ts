import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerLocale,
  getLocaleConfig,
  getSupportedLocales,
  formatRelativeTime,
  formatDateLocale,
  formatTimeLocale,
  formatDateTimeLocale,
  getMonthNames,
  getDayNames,
  getFirstDayOfWeek,
  isLocaleSupported,
  getBestMatchingLocale,
  detectLocale
} from '../src/locale.js';
import type { LocaleConfig, SupportedLocale } from '../src/types.js';

describe('Locale Module', () => {
  // Use current time as base for more realistic testing
  const now = Date.now();
  const testDate = new Date('2024-01-15T14:30:45Z');
  const pastDate = new Date(now - 2 * 60 * 60 * 1000); // 2 hours ago from now
  const futureDate = new Date(now + 3 * 24 * 60 * 60 * 1000); // 3 days from now

  // Helper to ensure consistent time - no need to mock since we use current time
  const withCurrentTime = (fn: () => void) => {
    fn();
  };

  describe('registerLocale', () => {
    it('should register a custom locale', () => {
      const customLocale: LocaleConfig = {
        locale: 'custom' as SupportedLocale,
        dateFormats: {
          short: 'dd-MM-yyyy',
          medium: 'dd MMM yyyy',
          long: 'dd MMMM yyyy',
          full: 'EEEE, dd MMMM yyyy'
        },
        timeFormats: {
          short: 'HH:mm',
          medium: 'HH:mm:ss',
          long: 'HH:mm:ss z',
          full: 'HH:mm:ss zzzz'
        },
        relativeTime: {
          future: 'in {0}',
          past: '{0} ago',
          units: {
            second: 'sec',
            seconds: 'secs',
            minute: 'min',
            minutes: 'mins',
            hour: 'hr',
            hours: 'hrs',
            day: 'day',
            days: 'days',
            week: 'wk',
            weeks: 'wks',
            month: 'mo',
            months: 'mos',
            year: 'yr',
            years: 'yrs'
          }
        },
        calendar: {
          weekStartsOn: 1,
          monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          monthNamesShort: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
          dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        },
        numbers: {
          decimal: '.',
          thousands: ','
        }
      };

      registerLocale(customLocale);
      expect(isLocaleSupported('custom')).toBe(true);
      
      const config = getLocaleConfig('custom' as SupportedLocale);
      expect(config.locale).toBe('custom');
      expect(config.relativeTime?.units?.second).toBe('sec');
    });

    it('should register base language when registering region-specific locale', () => {
      const regionLocale: LocaleConfig = {
        locale: 'xx-YY' as SupportedLocale,
        dateFormats: {
          short: 'MM/dd/yyyy',
          medium: 'MMM d, yyyy',
          long: 'MMMM d, yyyy',
          full: 'EEEE, MMMM d, yyyy'
        },
        timeFormats: {
          short: 'h:mm a',
          medium: 'h:mm:ss a',
          long: 'h:mm:ss a z',
          full: 'h:mm:ss a zzzz'
        }
      };

      registerLocale(regionLocale);
      expect(isLocaleSupported('xx-YY')).toBe(true);
      expect(isLocaleSupported('xx')).toBe(true);
    });
  });

  describe('getLocaleConfig', () => {
    it('should return English config for unsupported locale', () => {
      const config = getLocaleConfig('unsupported' as SupportedLocale);
      expect(config.locale).toBe('en');
    });

    it('should return base language config for region-specific locale', () => {
      const config = getLocaleConfig('en-US');
      expect(config.locale).toBe('en');
    });

    it('should return supported locale configs', () => {
      const enConfig = getLocaleConfig('en');
      expect(enConfig.locale).toBe('en');
      expect(enConfig.relativeTime?.units?.day).toBe('day');

      const esConfig = getLocaleConfig('es');
      expect(esConfig.locale).toBe('es');
      expect(esConfig.relativeTime?.units?.day).toBe('día');

      const frConfig = getLocaleConfig('fr');
      expect(frConfig.locale).toBe('fr');
      expect(frConfig.relativeTime?.units?.day).toBe('jour');
    });
  });

  describe('getSupportedLocales', () => {
    it('should return array of supported locales', () => {
      const locales = getSupportedLocales();
      expect(Array.isArray(locales)).toBe(true);
      expect(locales).toContain('en');
      expect(locales).toContain('es');
      expect(locales).toContain('fr');
      expect(locales).toContain('de');
      expect(locales).toContain('zh');
      expect(locales).toContain('ja');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time in English', () => {
      const result = formatRelativeTime(pastDate, { locale: 'en' });
      expect(result).toMatch(/2 hours ago/);
    });

    it('should format relative time in Spanish', () => {
      const result = formatRelativeTime(pastDate, { locale: 'es' });
      expect(result).toMatch(/hace 2 horas/);
    });

    it('should format relative time in French', () => {
      const result = formatRelativeTime(pastDate, { locale: 'fr' });
      expect(result).toMatch(/il y a 2 heures/);
    });

    it('should format relative time in German', () => {
      const result = formatRelativeTime(pastDate, { locale: 'de' });
      expect(result).toMatch(/vor 2 Stunden/);
    });

    it('should format future time', () => {
      const result = formatRelativeTime(futureDate, { locale: 'en' });
      expect(result).toMatch(/in 3 days/);
    });

    it('should respect maxUnit option', () => {
      const longPastDate = new Date(now - 400 * 24 * 60 * 60 * 1000); // 400 days ago
      const result = formatRelativeTime(longPastDate, { 
        locale: 'en', 
        maxUnit: 'days' 
      });
      expect(result).toMatch(/400 days ago/);
    });

    it('should respect minUnit option', () => {
      const recentDate = new Date(now - 30 * 1000); // 30 seconds ago
      const result = formatRelativeTime(recentDate, { 
        locale: 'en', 
        minUnit: 'minutes' 
      });
      expect(result).toMatch(/0 minutes ago/);
    });

    it('should respect precision option', () => {
      const result = formatRelativeTime(pastDate, { 
        locale: 'en', 
        precision: 1 
      });
      expect(result).toMatch(/2\.0 hours ago/);
    });

    it('should format short relative time', () => {
      const result = formatRelativeTime(pastDate, { 
        locale: 'en', 
        short: true 
      });
      expect(result).toMatch(/2h ago/);
    });

    it('should handle invalid dates', () => {
      expect(() => {
        formatRelativeTime('invalid date');
      }).toThrow('Invalid date provided for relative time formatting');
    });

    it('should handle numeric="auto" option', () => {
      const yesterdayDate = new Date(now - 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(yesterdayDate, { 
        locale: 'en', 
        numeric: 'auto' 
      });
      expect(result).toBe('yesterday');
    });
  });

  describe('formatDateLocale', () => {
    it('should format date in English', () => {
      const result = formatDateLocale(testDate, 'en', 'medium');
      expect(result).toMatch(/Jan 15, 2024/);
    });

    it('should format date in Spanish', () => {
      const result = formatDateLocale(testDate, 'es', 'medium');
      expect(result).toMatch(/15 ene 2024/);
    });

    it('should format date in different styles', () => {
      const shortResult = formatDateLocale(testDate, 'en', 'short');
      expect(shortResult).toMatch(/1\/15\/2024/);

      const longResult = formatDateLocale(testDate, 'en', 'long');
      expect(longResult).toMatch(/January 15, 2024/);
    });

    it('should handle invalid dates', () => {
      expect(() => {
        formatDateLocale('invalid');
      }).toThrow('Invalid date provided for locale formatting');
    });
  });

  describe('formatTimeLocale', () => {
    it('should format time in English (12-hour)', () => {
      const result = formatTimeLocale(testDate, 'en', 'medium');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it('should format time in Spanish (24-hour)', () => {
      const result = formatTimeLocale(testDate, 'es', 'medium');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should format time in different styles', () => {
      const shortResult = formatTimeLocale(testDate, 'en', 'short');
      expect(shortResult).toMatch(/\d{1,2}:\d{2} [AP]M/);
    });

    it('should handle invalid dates', () => {
      expect(() => {
        formatTimeLocale('invalid');
      }).toThrow('Invalid date provided for time locale formatting');
    });
  });

  describe('formatDateTimeLocale', () => {
    it('should format both date and time', () => {
      const result = formatDateTimeLocale(testDate, 'en', 'medium', 'medium');
      expect(result).toMatch(/Jan 15, 2024 \d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it('should format with different styles', () => {
      const result = formatDateTimeLocale(testDate, 'en', 'short', 'short');
      expect(result).toMatch(/1\/15\/2024 \d{1,2}:\d{2} [AP]M/);
    });
  });

  describe('getMonthNames', () => {
    it('should return English month names', () => {
      const months = getMonthNames('en');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('January');
      expect(months[11]).toBe('December');
    });

    it('should return short English month names', () => {
      const months = getMonthNames('en', true);
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('Jan');
      expect(months[11]).toBe('Dec');
    });

    it('should return Spanish month names', () => {
      const months = getMonthNames('es');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('enero');
      expect(months[11]).toBe('diciembre');
    });

    it('should return French month names', () => {
      const months = getMonthNames('fr');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('janvier');
      expect(months[11]).toBe('décembre');
    });
  });

  describe('getDayNames', () => {
    it('should return English day names', () => {
      const days = getDayNames('en');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('Sunday');
      expect(days[6]).toBe('Saturday');
    });

    it('should return short English day names', () => {
      const days = getDayNames('en', true);
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('Sun');
      expect(days[6]).toBe('Sat');
    });

    it('should return Spanish day names', () => {
      const days = getDayNames('es');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('domingo');
      expect(days[6]).toBe('sábado');
    });

    it('should return German day names', () => {
      const days = getDayNames('de');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('Sonntag');
      expect(days[6]).toBe('Samstag');
    });
  });

  describe('getFirstDayOfWeek', () => {
    it('should return 0 for English (Sunday)', () => {
      expect(getFirstDayOfWeek('en')).toBe(0);
    });

    it('should return 1 for Spanish (Monday)', () => {
      expect(getFirstDayOfWeek('es')).toBe(1);
    });

    it('should return 1 for French (Monday)', () => {
      expect(getFirstDayOfWeek('fr')).toBe(1);
    });

    it('should return 1 for German (Monday)', () => {
      expect(getFirstDayOfWeek('de')).toBe(1);
    });

    it('should return 0 for Japanese (Sunday)', () => {
      expect(getFirstDayOfWeek('ja')).toBe(0);
    });
  });

  describe('isLocaleSupported', () => {
    it('should return true for supported locales', () => {
      expect(isLocaleSupported('en')).toBe(true);
      expect(isLocaleSupported('es')).toBe(true);
      expect(isLocaleSupported('fr')).toBe(true);
      expect(isLocaleSupported('de')).toBe(true);
      expect(isLocaleSupported('zh')).toBe(true);
      expect(isLocaleSupported('ja')).toBe(true);
    });

    it('should return true for base language of region-specific locales', () => {
      expect(isLocaleSupported('en-US')).toBe(true);
      expect(isLocaleSupported('es-ES')).toBe(true);
      expect(isLocaleSupported('fr-FR')).toBe(true);
    });

    it('should return false for unsupported locales', () => {
      expect(isLocaleSupported('xyz')).toBe(false);
      expect(isLocaleSupported('fake-FAKE')).toBe(false);
    });
  });

  describe('getBestMatchingLocale', () => {
    it('should return exact match when available', () => {
      const result = getBestMatchingLocale(['fr', 'en'], 'de');
      expect(result).toBe('fr');
    });

    it('should return base language when exact match not available', () => {
      const result = getBestMatchingLocale(['fr-CA', 'en-GB'], 'de');
      expect(['fr', 'fr-CA'].includes(result)).toBe(true); // Allow either exact or base match
    });

    it('should return fallback when no match found', () => {
      const result = getBestMatchingLocale(['xyz', 'abc'], 'de');
      expect(result).toBe('de');
    });

    it('should handle empty preferences', () => {
      const result = getBestMatchingLocale([], 'en');
      expect(result).toBe('en');
    });
  });

  describe('detectLocale', () => {
    it('should return fallback when no detection available', () => {
      const result = detectLocale('es');
      expect(getSupportedLocales().includes(result)).toBe(true);
    });

    it('should return fallback when detection fails', () => {
      const result = detectLocale();
      expect(getSupportedLocales().includes(result)).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle Date objects in relative time', () => {
      const date = new Date(2024, 0, 15);
      const result = formatRelativeTime(date, { locale: 'en' });
      expect(typeof result).toBe('string');
    });

    it('should handle number timestamps in relative time', () => {
      const timestamp = now - 60000; // 1 minute ago
      const result = formatRelativeTime(timestamp, { locale: 'en' });
      expect(result).toMatch(/1 minute ago/);
    });

    it('should handle string dates in relative time', () => {
      const isoString = new Date(now - 5000).toISOString(); // 5 seconds ago
      const result = formatRelativeTime(isoString, { locale: 'en' });
      expect(result).toMatch(/5 seconds ago/);
    });

    it('should handle missing calendar data gracefully', () => {
      const customLocale: LocaleConfig = {
        locale: 'minimal' as SupportedLocale,
        dateFormats: {
          short: 'MM/dd/yyyy',
          medium: 'MMM d, yyyy',
          long: 'MMMM d, yyyy',
          full: 'EEEE, MMMM d, yyyy'
        },
        timeFormats: {
          short: 'h:mm a',
          medium: 'h:mm:ss a',
          long: 'h:mm:ss a z',
          full: 'h:mm:ss a zzzz'
        }
      };

      registerLocale(customLocale);
      const months = getMonthNames('minimal' as SupportedLocale);
      expect(Array.isArray(months)).toBe(true);
    });

    it('should handle Chinese locale formatting', () => {
      const result = formatRelativeTime(pastDate, { locale: 'zh' });
      expect(result).toMatch(/2小时前/);
    });

    it('should handle Japanese locale formatting', () => {
      const result = formatRelativeTime(pastDate, { locale: 'ja' });
      expect(result).toMatch(/2時間前/);
    });
  });
});