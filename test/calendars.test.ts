import { describe, it, expect } from 'vitest';
import {
  toHebrewDate,
  toIslamicDate,
  toBuddhistDate,
  toJapaneseDate,
  toPersianDate,
  toChineseDate,
  formatInCalendar,
  getCalendarMonthNames,
  getJapaneseEra,
  getJapaneseEras,
  isHebrewLeapYear,
  getHebrewMonthName,
  getIslamicMonthName,
  getPersianMonthName,
  isPersianLeapYear,
  getChineseZodiac,
  getChineseElement,
  getChineseZodiacFull,
  calendarDateToString,
  compareCalendarDates,
  today,
  isSameCalendarDay,
  getSupportedCalendars
} from '../src/calendars.js';

describe('Non-Gregorian Calendars', () => {
  describe('toHebrewDate', () => {
    it('should convert a date to Hebrew calendar', () => {
      const date = new Date('2024-03-25');
      const hebrew = toHebrewDate(date);

      expect(hebrew.calendar).toBe('hebrew');
      expect(hebrew.year).toBeGreaterThan(5780);
      expect(hebrew.month).toBeGreaterThanOrEqual(1);
      expect(hebrew.day).toBeGreaterThanOrEqual(1);
    });

    it('should handle Passover period', () => {
      // Passover 2024 starts April 22 (Nisan 14, 5784)
      const passover = new Date('2024-04-22');
      const hebrew = toHebrewDate(passover);

      expect(hebrew.year).toBe(5784);
    });
  });

  describe('toIslamicDate', () => {
    it('should convert to Islamic calendar (default umalqura)', () => {
      const date = new Date('2024-03-25');
      const islamic = toIslamicDate(date);

      expect(islamic.calendar).toBe('islamic-umalqura');
      expect(islamic.year).toBeGreaterThan(1440);
      expect(islamic.month).toBeGreaterThanOrEqual(1);
      expect(islamic.day).toBeGreaterThanOrEqual(1);
    });

    it('should support different Islamic calendar variants', () => {
      const date = new Date('2024-03-25');

      const umalqura = toIslamicDate(date, 'islamic-umalqura');
      const civil = toIslamicDate(date, 'islamic-civil');

      expect(umalqura.calendar).toBe('islamic-umalqura');
      expect(civil.calendar).toBe('islamic-civil');
    });

    it('should handle Ramadan period', () => {
      // Ramadan 2024 starts around March 10
      const ramadan = new Date('2024-03-15');
      const islamic = toIslamicDate(ramadan);

      expect(islamic.month).toBe(9); // Ramadan is 9th month
    });
  });

  describe('toBuddhistDate', () => {
    it('should convert to Buddhist calendar', () => {
      const date = new Date('2024-03-25');
      const buddhist = toBuddhistDate(date);

      expect(buddhist.calendar).toBe('buddhist');
      expect(buddhist.year).toBe(2567); // 2024 + 543
      expect(buddhist.month).toBe(3);
      expect(buddhist.day).toBe(25);
    });
  });

  describe('toJapaneseDate', () => {
    it('should convert to Japanese calendar with Reiwa era', () => {
      const date = new Date('2024-03-25');
      const japanese = toJapaneseDate(date);

      expect(japanese.calendar).toBe('japanese');
      expect(japanese.era).toBe('Reiwa');
      expect(japanese.year).toBe(6); // 2024 is Reiwa 6
    });

    it('should handle Heisei era dates', () => {
      const date = new Date('2018-01-01');
      const japanese = toJapaneseDate(date);

      expect(japanese.era).toBe('Heisei');
      expect(japanese.year).toBe(30); // 2018 is Heisei 30
    });
  });

  describe('toPersianDate', () => {
    it('should convert to Persian calendar', () => {
      // Persian New Year (Nowruz) 2024 is around March 20
      const nowruz = new Date('2024-03-20');
      const persian = toPersianDate(nowruz);

      expect(persian.calendar).toBe('persian');
      expect(persian.year).toBe(1403);
      expect(persian.month).toBe(1); // Farvardin
      expect(persian.day).toBe(1);
    });
  });

  describe('toChineseDate', () => {
    it('should convert to Chinese lunar calendar', () => {
      const date = new Date('2024-02-10'); // Chinese New Year 2024
      const chinese = toChineseDate(date);

      expect(chinese.calendar).toBe('chinese');
      expect(chinese.year).toBeGreaterThan(0);
      expect(chinese.month).toBeGreaterThanOrEqual(1);
    });
  });

  describe('formatInCalendar', () => {
    it('should format date in Hebrew calendar', () => {
      const date = new Date('2024-03-25');
      const formatted = formatInCalendar(date, 'hebrew');

      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format in Japanese with era', () => {
      const date = new Date('2024-03-25');
      const formatted = formatInCalendar(date, 'japanese');

      expect(formatted).toContain('Reiwa');
    });

    it('should respect locale parameter', () => {
      const date = new Date('2024-03-25');
      const enFormatted = formatInCalendar(date, 'buddhist', 'en');
      const thFormatted = formatInCalendar(date, 'buddhist', 'th');

      // Both should format but with different representations
      expect(enFormatted).toBeTruthy();
      expect(thFormatted).toBeTruthy();
    });
  });

  describe('getCalendarMonthNames', () => {
    it('should get month names for a calendar', () => {
      const months = getCalendarMonthNames('hebrew');

      expect(months.length).toBeGreaterThanOrEqual(12);
    });

    it('should support different formats', () => {
      const longMonths = getCalendarMonthNames('persian', 'en', 'long');
      const shortMonths = getCalendarMonthNames('persian', 'en', 'short');

      expect(longMonths.length).toBe(12);
      expect(shortMonths.length).toBe(12);
    });
  });

  describe('getJapaneseEra', () => {
    it('should return era name for a date', () => {
      const era = getJapaneseEra(new Date('2024-01-01'));
      expect(era).toBe('Reiwa');
    });

    it('should support different formats', () => {
      const date = new Date('2024-01-01');
      const longEra = getJapaneseEra(date, 'long');
      const shortEra = getJapaneseEra(date, 'short');

      expect(longEra).toBeTruthy();
      expect(shortEra).toBeTruthy();
    });
  });

  describe('getJapaneseEras', () => {
    it('should return list of Japanese eras', () => {
      const eras = getJapaneseEras();

      expect(eras.length).toBe(5);
      expect(eras.map(e => e.name)).toContain('Meiji');
      expect(eras.map(e => e.name)).toContain('Reiwa');
    });

    it('should have correct era start dates', () => {
      const eras = getJapaneseEras();
      const reiwa = eras.find(e => e.name === 'Reiwa');

      expect(reiwa?.start.getFullYear()).toBe(2019);
      expect(reiwa?.start.getMonth()).toBe(4); // May
      expect(reiwa?.start.getDate()).toBe(1);
    });
  });

  describe('isHebrewLeapYear', () => {
    it('should identify Hebrew leap years', () => {
      // Years 3, 6, 8, 11, 14, 17, 19 in the 19-year cycle are leap
      expect(isHebrewLeapYear(5784)).toBe(true); // Leap year
      expect(isHebrewLeapYear(5785)).toBe(false);
    });
  });

  describe('getHebrewMonthName', () => {
    it('should return Hebrew month names', () => {
      expect(getHebrewMonthName(1)).toBe('Nisan');
      expect(getHebrewMonthName(7)).toBe('Tishrei');
      expect(getHebrewMonthName(9)).toBe('Kislev');
    });

    it('should handle Adar in leap years', () => {
      expect(getHebrewMonthName(12, false)).toBe('Adar');
      expect(getHebrewMonthName(12, true)).toBe('Adar I');
      expect(getHebrewMonthName(13, true)).toBe('Adar II');
    });
  });

  describe('getIslamicMonthName', () => {
    it('should return Islamic month names', () => {
      expect(getIslamicMonthName(1)).toBe('Muharram');
      expect(getIslamicMonthName(9)).toBe('Ramadan');
      expect(getIslamicMonthName(12)).toBe('Dhu al-Hijjah');
    });
  });

  describe('getPersianMonthName', () => {
    it('should return Persian month names', () => {
      expect(getPersianMonthName(1)).toBe('Farvardin');
      expect(getPersianMonthName(7)).toBe('Mehr');
      expect(getPersianMonthName(12)).toBe('Esfand');
    });
  });

  describe('isPersianLeapYear', () => {
    it('should identify Persian leap years', () => {
      expect(isPersianLeapYear(1403)).toBe(true);
      expect(isPersianLeapYear(1404)).toBe(false);
    });
  });

  describe('Chinese Zodiac', () => {
    it('should return correct zodiac animal', () => {
      expect(getChineseZodiac(2024)).toBe('Dragon');
      expect(getChineseZodiac(2023)).toBe('Rabbit');
      expect(getChineseZodiac(2025)).toBe('Snake');
    });

    it('should return correct element', () => {
      expect(getChineseElement(2024)).toBe('Wood');
      expect(getChineseElement(2020)).toBe('Metal');
    });

    it('should return full zodiac description', () => {
      expect(getChineseZodiacFull(2024)).toBe('Wood Dragon');
      expect(getChineseZodiacFull(2020)).toBe('Metal Rat');
    });
  });

  describe('calendarDateToString', () => {
    it('should format calendar date as string', () => {
      const hebrew = toHebrewDate(new Date('2024-03-25'));
      const str = calendarDateToString(hebrew);

      expect(str).toContain('hebrew');
      expect(str).toMatch(/\d+\/\d+\/\d+/);
    });

    it('should include era for Japanese dates', () => {
      const japanese = toJapaneseDate(new Date('2024-03-25'));
      const str = calendarDateToString(japanese);

      expect(str).toContain('japanese');
      expect(str).toContain('Reiwa');
    });
  });

  describe('compareCalendarDates', () => {
    it('should compare dates in same calendar', () => {
      const a = toHebrewDate(new Date('2024-03-01'));
      const b = toHebrewDate(new Date('2024-03-15'));

      expect(compareCalendarDates(a, b)).toBeLessThan(0);
      expect(compareCalendarDates(b, a)).toBeGreaterThan(0);
      expect(compareCalendarDates(a, a)).toBe(0);
    });

    it('should throw for different calendars', () => {
      const hebrew = toHebrewDate(new Date('2024-03-25'));
      const islamic = toIslamicDate(new Date('2024-03-25'));

      expect(() => compareCalendarDates(hebrew, islamic as any)).toThrow();
    });
  });

  describe('today', () => {
    it('should return today in specified calendar', () => {
      const todayHebrew = today('hebrew');

      expect(todayHebrew.calendar).toBe('hebrew');
      expect(todayHebrew.year).toBeGreaterThan(5780);
    });

    it('should work with all supported calendars', () => {
      const calendars = getSupportedCalendars();

      calendars.forEach(cal => {
        const todayDate = today(cal);
        expect(todayDate.calendar).toBe(cal);
        expect(todayDate.year).toBeGreaterThan(0);
      });
    });
  });

  describe('isSameCalendarDay', () => {
    it('should compare calendar dates for same day', () => {
      const a = toHebrewDate(new Date('2024-03-25'));
      const b = toHebrewDate(new Date('2024-03-25'));
      const c = toHebrewDate(new Date('2024-03-26'));

      expect(isSameCalendarDay(a, b)).toBe(true);
      expect(isSameCalendarDay(a, c)).toBe(false);
    });

    it('should return false for different calendars', () => {
      const hebrew = toHebrewDate(new Date('2024-03-25'));
      const buddhist = toBuddhistDate(new Date('2024-03-25'));

      expect(isSameCalendarDay(hebrew, buddhist as any)).toBe(false);
    });
  });

  describe('getSupportedCalendars', () => {
    it('should return all supported calendar types', () => {
      const calendars = getSupportedCalendars();

      expect(calendars).toContain('hebrew');
      expect(calendars).toContain('islamic');
      expect(calendars).toContain('islamic-umalqura');
      expect(calendars).toContain('islamic-civil');
      expect(calendars).toContain('buddhist');
      expect(calendars).toContain('japanese');
      expect(calendars).toContain('persian');
      expect(calendars).toContain('chinese');
      expect(calendars.length).toBe(8);
    });
  });
});
