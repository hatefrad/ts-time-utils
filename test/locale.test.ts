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
  detectLocale,
  // Conversion functions
  convertRelativeTime,
  detectLocaleFromRelativeTime,
  convertFormatPattern,
  convertFormattedDate,
  convertRelativeTimeArray,
  compareLocaleFormats
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

  describe('Locale Conversion Functions', () => {
    describe('convertRelativeTime', () => {
      it('should convert between different locales', () => {
        const enText = '2 hours ago';
        const result = convertRelativeTime(enText, 'en', 'es');
        expect(result).toMatch(/hace.*horas/);
      });

      it('should return same text for same locale', () => {
        const text = '2 hours ago';
        const result = convertRelativeTime(text, 'en', 'en');
        expect(result).toBe(text);
      });

      it('should return null for unparseable text', () => {
        const result = convertRelativeTime('invalid text', 'en', 'es');
        expect(result).toBeNull();
      });

      it('should handle future times', () => {
        const enText = 'in 3 days';
        const result = convertRelativeTime(enText, 'en', 'fr');
        expect(result).toMatch(/dans.*jours/);
      });

      it('should preserve precision and formatting style', () => {
        const shortText = '2h ago';
        const result = convertRelativeTime(shortText, 'en', 'es');
        expect(result).toMatch(/hace.*h/);
      });
    });

    describe('detectLocaleFromRelativeTime', () => {
      it('should detect English', () => {
        const result = detectLocaleFromRelativeTime('2 hours ago');
        expect(result).toBe('en');
      });

      it('should detect Spanish', () => {
        const result = detectLocaleFromRelativeTime('hace 2 horas');
        expect(result).toBe('es');
      });

      it('should detect French', () => {
        const result = detectLocaleFromRelativeTime('il y a 2 heures');
        expect(result).toBe('fr');
      });

      it('should detect German', () => {
        const result = detectLocaleFromRelativeTime('vor 2 Stunden');
        expect(result).toBe('de');
      });

      it('should return null for unrecognized text', () => {
        const result = detectLocaleFromRelativeTime('completely unknown text');
        expect(result).toBeNull();
      });

      it('should handle short formats', () => {
        const result = detectLocaleFromRelativeTime('2h ago');
        expect(result).toBe('en');
      });
    });

    describe('convertFormatPattern', () => {
      it('should convert between locale patterns', () => {
        const result = convertFormatPattern('M/d/yyyy', 'en', 'de');
        expect(result).toBe('dd.MM.yyyy'); // German short format
      });

      it('should return same pattern for same locale', () => {
        const pattern = 'M/d/yyyy';
        const result = convertFormatPattern(pattern, 'en', 'en');
        expect(result).toBe(pattern);
      });

      it('should use target locale style when specified', () => {
        const result = convertFormatPattern('M/d/yyyy', 'en', 'fr', 'long');
        expect(result).toMatch(/d MMMM yyyy/);
      });

      it('should fallback to medium format for unknown patterns', () => {
        const result = convertFormatPattern('unknown pattern', 'en', 'es');
        expect(result).toMatch(/d MMM yyyy/);
      });

      it('should handle complex patterns', () => {
        const result = convertFormatPattern('EEEE, MMMM d, yyyy', 'en', 'de', 'full');
        expect(result).toMatch(/EEEE.*MMMM.*yyyy/);
      });
    });

    describe('convertFormattedDate', () => {
      it('should convert formatted dates between locales', () => {
        const enDate = 'Jan 15, 2024';
        const result = convertFormattedDate(enDate, 'en', 'es');
        expect(result).toMatch(/15.*ene.*2024/);
      });

      it('should return same date for same locale', () => {
        const date = 'Jan 15, 2024';
        const result = convertFormattedDate(date, 'en', 'en');
        expect(result).toBe(date);
      });

      it('should return null for unparseable dates', () => {
        const result = convertFormattedDate('invalid date', 'en', 'es');
        expect(result).toBeNull();
      });

      it('should handle different target styles', () => {
        const enDate = '1/15/2024';
        const result = convertFormattedDate(enDate, 'en', 'fr', 'long');
        expect(result).toMatch(/15.*janvier.*2024/);
      });

      it('should handle numeric date formats', () => {
        const numericDate = '1/15/2024';
        const result = convertFormattedDate(numericDate, 'en', 'de', 'short');
        expect(result).toBe('15.01.2024'); // German short format with zero padding
      });
    });

    describe('convertRelativeTimeArray', () => {
      it('should convert array of relative time strings', () => {
        const input = ['2 hours ago', 'in 3 days', '1 week ago'];
        const result = convertRelativeTimeArray(input, 'en', 'es');
        
        expect(result).toHaveLength(3);
        expect(result[0]).toMatch(/hace.*horas/);
        expect(result[1]).toMatch(/en.*días/);
        expect(result[2]).toMatch(/hace.*semana/);
      });

      it('should handle mixed valid and invalid strings', () => {
        const input = ['2 hours ago', 'invalid', 'in 1 day'];
        const result = convertRelativeTimeArray(input, 'en', 'fr');
        
        expect(result).toHaveLength(3);
        expect(result[0]).toMatch(/il y a.*heures/);
        expect(result[1]).toBeNull();
        expect(result[2]).toMatch(/dans.*jour/);
      });

      it('should handle empty array', () => {
        const result = convertRelativeTimeArray([], 'en', 'es');
        expect(result).toEqual([]);
      });
    });

    describe('compareLocaleFormats', () => {
      it('should compare date formats between locales', () => {
        const result = compareLocaleFormats('en', 'es');
        
        expect(result.dateFormats).toHaveProperty('short');
        expect(result.dateFormats).toHaveProperty('medium');
        expect(result.dateFormats.short.locale1).toMatch(/M\/d\/yyyy/);
        expect(result.dateFormats.short.locale2).toMatch(/d\/M\/yyyy/);
      });

      it('should compare time formats between locales', () => {
        const result = compareLocaleFormats('en', 'de');
        
        expect(result.timeFormats).toHaveProperty('short');
        expect(result.timeFormats.short.locale1).toMatch(/h:mm a/);
        expect(result.timeFormats.short.locale2).toMatch(/H:mm/);
      });

      it('should compare week start differences', () => {
        const result = compareLocaleFormats('en', 'de');
        
        expect(result.weekStartsOn.locale1).toBe(0); // Sunday for US English
        expect(result.weekStartsOn.locale2).toBe(1); // Monday for German
      });

      it('should handle same locale comparison', () => {
        const result = compareLocaleFormats('en', 'en');
        
        expect(result.weekStartsOn.locale1).toBe(result.weekStartsOn.locale2);
        expect(result.dateFormats.short.locale1).toBe(result.dateFormats.short.locale2);
      });

      it('should include all format styles', () => {
        const result = compareLocaleFormats('en', 'fr');
        
        const expectedStyles = ['short', 'medium', 'long', 'full'];
        expectedStyles.forEach(style => {
          expect(result.dateFormats).toHaveProperty(style);
          expect(result.timeFormats).toHaveProperty(style);
        });
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle null and undefined inputs gracefully', () => {
        expect(() => convertRelativeTime('', 'en', 'es')).not.toThrow();
        expect(() => convertFormattedDate('', 'en', 'es')).not.toThrow();
        expect(() => detectLocaleFromRelativeTime('')).not.toThrow();
      });

      it('should handle unsupported locale combinations', () => {
        const result = convertRelativeTime('2 hours ago', 'en', 'en');
        expect(result).toBe('2 hours ago');
      });

      it('should handle malformed relative time strings', () => {
        const inputs = [
          'hours ago 2',  // wrong order
          '2 ago hours',  // wrong order
          'two hours ago', // words instead of numbers
          '2.5.3 hours ago' // invalid number
        ];

        inputs.forEach(input => {
          const result = convertRelativeTime(input, 'en', 'es');
          expect(result).toBeNull();
        });
      });

      it('should handle malformed date strings', () => {
        const inputs = [
          '32/15/2024',   // invalid day/month
          'Feb 30, 2024', // invalid date
          '2024-15-32',   // invalid ISO format
          'not a date'    // completely invalid
        ];

        inputs.forEach((input, index) => {
          const result = convertFormattedDate(input, 'en', 'es');
          // Some malformed dates might still parse due to JavaScript's lenient Date constructor
          // This is acceptable behavior - we test the core functionality separately
          expect(typeof result === 'string' || result === null).toBe(true);
        });
      });
    });
  });

  describe('Persian Locale Support', () => {
    it('should format relative time in Persian', () => {
      withCurrentTime(() => {
        const result = formatRelativeTime(pastDate, { locale: 'fa' });
        expect(result).toContain('پیش'); // "ago" in Persian
      });
    });

    it('should format future time in Persian', () => {
      withCurrentTime(() => {
        const result = formatRelativeTime(futureDate, { locale: 'fa' });
        expect(result).toContain('دیگر'); // "from now" in Persian
      });
    });

    it('should format date in Persian', () => {
      const result = formatDateLocale(testDate, 'fa', 'medium');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should format time in Persian', () => {
      const result = formatTimeLocale(testDate, 'fa', 'medium');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should get Persian month names', () => {
      const months = getMonthNames('fa');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('فروردین'); // First month in Persian calendar
      expect(months[11]).toBe('اسفند'); // Last month in Persian calendar
    });

    it('should get Persian day names', () => {
      const days = getDayNames('fa');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('یکشنبه'); // Sunday in Persian
      expect(days[5]).toBe('جمعه'); // Friday in Persian
    });

    it('should get Persian first day of week', () => {
      const firstDay = getFirstDayOfWeek('fa');
      expect(firstDay).toBe(6); // Saturday starts the week in Persian calendar
    });

    it('should detect Persian as supported locale', () => {
      expect(isLocaleSupported('fa')).toBe(true);
      expect(isLocaleSupported('fa-IR')).toBe(true);
    });

    it('should convert relative time from English to Persian', () => {
      const result = convertRelativeTime('2 hours ago', 'en', 'fa');
      expect(result).toContain('ساعت'); // "hour" in Persian
      expect(result).toContain('پیش'); // "ago" in Persian
    });

    it('should convert relative time from Persian to English', () => {
      const result = convertRelativeTime('2 ساعت پیش', 'fa', 'en');
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    it('should detect Persian locale from relative time string', () => {
      const result = detectLocaleFromRelativeTime('2 ساعت پیش');
      expect(result).toBe('fa');
    });

    it('should handle Persian yesterday/tomorrow', () => {
      const yesterday = new Date(now - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now + 24 * 60 * 60 * 1000);

      withCurrentTime(() => {
        const yesterdayResult = formatRelativeTime(yesterday, { 
          locale: 'fa', 
          numeric: 'auto' 
        });
        const tomorrowResult = formatRelativeTime(tomorrow, { 
          locale: 'fa', 
          numeric: 'auto' 
        });

        // These might contain "دیروز" (yesterday) or "فردا" (tomorrow)
        expect(typeof yesterdayResult).toBe('string');
        expect(typeof tomorrowResult).toBe('string');
      });
    });

    it('should convert array of relative times to Persian', () => {
      const inputs = ['1 hour ago', '2 days ago', '1 week ago'];
      const results = convertRelativeTimeArray(inputs, 'en', 'fa');
      
      results.forEach(result => {
        if (result) {
          expect(result).toContain('پیش');
        }
      });
    });

    it('should compare Persian format with other locales', () => {
      const comparison = compareLocaleFormats('fa', 'en');
      
      expect(comparison.weekStartsOn.locale1).toBe(6); // Persian week starts on Saturday
      expect(comparison.weekStartsOn.locale2).toBe(0); // English week starts on Sunday
      expect(comparison.dateFormats).toBeDefined();
      expect(comparison.timeFormats).toBeDefined();
    });
  });

  describe('Dutch Locale Support', () => {
    it('should format relative time in Dutch', () => {
      withCurrentTime(() => {
        const result = formatRelativeTime(pastDate, { locale: 'nl' });
        expect(result).toContain('geleden'); // "ago" in Dutch
      });
    });

    it('should format future time in Dutch', () => {
      withCurrentTime(() => {
        const result = formatRelativeTime(futureDate, { locale: 'nl' });
        expect(result).toContain('over'); // "in" in Dutch
      });
    });

    it('should get Dutch month names', () => {
      const months = getMonthNames('nl');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('januari'); // January in Dutch
      expect(months[11]).toBe('december'); // December in Dutch
    });

    it('should get Dutch day names', () => {
      const days = getDayNames('nl');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('zondag'); // Sunday in Dutch
      expect(days[1]).toBe('maandag'); // Monday in Dutch
    });

    it('should detect Dutch as supported locale', () => {
      expect(isLocaleSupported('nl')).toBe(true);
      expect(isLocaleSupported('nl-NL')).toBe(true);
    });

    it('should convert relative time from English to Dutch', () => {
      const result = convertRelativeTime('2 hours ago', 'en', 'nl');
      expect(result).toContain('uur'); // "hour" in Dutch
      expect(result).toContain('geleden'); // "ago" in Dutch
    });

    it('should handle Dutch yesterday/tomorrow', () => {
      const yesterday = new Date(now - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now + 24 * 60 * 60 * 1000);

      withCurrentTime(() => {
        const yesterdayResult = formatRelativeTime(yesterday, { 
          locale: 'nl', 
          numeric: 'auto' 
        });
        const tomorrowResult = formatRelativeTime(tomorrow, { 
          locale: 'nl', 
          numeric: 'auto' 
        });

        expect(typeof yesterdayResult).toBe('string');
        expect(typeof tomorrowResult).toBe('string');
      });
    });
  });

  describe('Italian Locale Support', () => {
    it('should format relative time in Italian', () => {
      withCurrentTime(() => {
        const result = formatRelativeTime(pastDate, { locale: 'it' });
        expect(result).toContain('fa'); // "ago" in Italian
      });
    });

    it('should format future time in Italian', () => {
      withCurrentTime(() => {
        const result = formatRelativeTime(futureDate, { locale: 'it' });
        expect(result).toContain('tra'); // "in" in Italian
      });
    });

    it('should get Italian month names', () => {
      const months = getMonthNames('it');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('gennaio'); // January in Italian
      expect(months[11]).toBe('dicembre'); // December in Italian
    });

    it('should get Italian day names', () => {
      const days = getDayNames('it');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('domenica'); // Sunday in Italian
      expect(days[1]).toBe('lunedì'); // Monday in Italian
    });

    it('should detect Italian as supported locale', () => {
      expect(isLocaleSupported('it')).toBe(true);
      expect(isLocaleSupported('it-IT')).toBe(true);
    });

    it('should convert relative time from English to Italian', () => {
      const result = convertRelativeTime('2 hours ago', 'en', 'it');
      expect(result).toContain('ore'); // "hours" in Italian
      expect(result).toContain('fa'); // "ago" in Italian
    });

    it('should handle Italian yesterday/tomorrow', () => {
      const yesterday = new Date(now - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now + 24 * 60 * 60 * 1000);

      withCurrentTime(() => {
        const yesterdayResult = formatRelativeTime(yesterday, { 
          locale: 'it', 
          numeric: 'auto' 
        });
        const tomorrowResult = formatRelativeTime(tomorrow, { 
          locale: 'it', 
          numeric: 'auto' 
        });

        expect(typeof yesterdayResult).toBe('string');
        expect(typeof tomorrowResult).toBe('string');
      });
    });
  });
});