import { describe, it, expect } from 'vitest';
import {
  getHolidays,
  isHoliday,
  getHolidayName,
  getNextHoliday,
  getUpcomingHolidays,
  getSupportedCountries,
  getUKHolidays,
  getNetherlandsHolidays,
  getGermanyHolidays,
  getCanadaHolidays,
  getAustraliaHolidays,
  getItalyHolidays,
  getSpainHolidays,
  getChinaHolidays,
  getIndiaHolidays,
} from '../src/holidays.js';

describe('International Holidays', () => {
  describe('UK Holidays', () => {
    it('should return all UK bank holidays for 2024', () => {
      const holidays = getUKHolidays(2024);
      expect(holidays.length).toBeGreaterThanOrEqual(8);
      expect(holidays.every(h => h.countryCode === 'UK')).toBe(true);
    });

    it('should include New Year\'s Day', () => {
      const holidays = getUKHolidays(2024);
      const newYear = holidays.find(h => h.name === "New Year's Day");
      expect(newYear).toBeDefined();
      expect(newYear!.date.getMonth()).toBe(0); // January
    });

    it('should include Easter Monday', () => {
      const holidays = getUKHolidays(2024);
      const easterMonday = holidays.find(h => h.name === 'Easter Monday');
      expect(easterMonday).toBeDefined();
    });

    it('should include Early May Bank Holiday', () => {
      const holidays = getUKHolidays(2024);
      const mayBank = holidays.find(h => h.name === 'Early May Bank Holiday');
      expect(mayBank).toBeDefined();
      expect(mayBank!.date.getDay()).toBe(1); // Monday
    });

    it('should include Summer Bank Holiday', () => {
      const holidays = getUKHolidays(2024);
      const summerBank = holidays.find(h => h.name === 'Summer Bank Holiday');
      expect(summerBank).toBeDefined();
      expect(summerBank!.date.getMonth()).toBe(7); // August
      expect(summerBank!.date.getDay()).toBe(1); // Monday
    });

    it('should include Christmas and Boxing Day', () => {
      const holidays = getUKHolidays(2024);
      const christmas = holidays.find(h => h.name === 'Christmas Day');
      const boxing = holidays.find(h => h.name === 'Boxing Day');
      expect(christmas).toBeDefined();
      expect(boxing).toBeDefined();
    });
  });

  describe('Netherlands Holidays', () => {
    it('should return all Netherlands holidays for 2024', () => {
      const holidays = getNetherlandsHolidays(2024);
      expect(holidays.length).toBeGreaterThanOrEqual(10);
      expect(holidays.every(h => h.countryCode === 'NL')).toBe(true);
    });

    it('should include King\'s Day', () => {
      const holidays = getNetherlandsHolidays(2024);
      const kingsDay = holidays.find(h => h.name === "King's Day");
      expect(kingsDay).toBeDefined();
      expect(kingsDay!.date.getMonth()).toBe(3); // April
    });

    it('should include Liberation Day', () => {
      const holidays = getNetherlandsHolidays(2024);
      const liberationDay = holidays.find(h => h.name === 'Liberation Day');
      expect(liberationDay).toBeDefined();
      expect(liberationDay!.date.getDate()).toBe(5);
      expect(liberationDay!.date.getMonth()).toBe(4); // May
    });
  });

  describe('Germany Holidays', () => {
    it('should return all Germany holidays for 2024', () => {
      const holidays = getGermanyHolidays(2024);
      expect(holidays.length).toBeGreaterThanOrEqual(9);
      expect(holidays.every(h => h.countryCode === 'DE')).toBe(true);
    });

    it('should include German Unity Day', () => {
      const holidays = getGermanyHolidays(2024);
      const unityDay = holidays.find(h => h.name === 'German Unity Day');
      expect(unityDay).toBeDefined();
      expect(unityDay!.date.getDate()).toBe(3);
      expect(unityDay!.date.getMonth()).toBe(9); // October
    });

    it('should include Labour Day', () => {
      const holidays = getGermanyHolidays(2024);
      const labourDay = holidays.find(h => h.name === 'Labour Day');
      expect(labourDay).toBeDefined();
      expect(labourDay!.date.getDate()).toBe(1);
      expect(labourDay!.date.getMonth()).toBe(4); // May
    });
  });

  describe('Canada Holidays', () => {
    it('should return all Canada holidays for 2024', () => {
      const holidays = getCanadaHolidays(2024);
      expect(holidays.length).toBeGreaterThanOrEqual(9);
      expect(holidays.every(h => h.countryCode === 'CA')).toBe(true);
    });

    it('should include Canada Day', () => {
      const holidays = getCanadaHolidays(2024);
      const canadaDay = holidays.find(h => h.name === 'Canada Day');
      expect(canadaDay).toBeDefined();
      expect(canadaDay!.date.getMonth()).toBe(6); // July
      expect(canadaDay!.date.getDate()).toBe(1);
    });

    it('should include Victoria Day (Monday before May 25)', () => {
      const holidays = getCanadaHolidays(2024);
      const victoriaDay = holidays.find(h => h.name === 'Victoria Day');
      expect(victoriaDay).toBeDefined();
      expect(victoriaDay!.date.getDay()).toBe(1); // Monday
      expect(victoriaDay!.date.getMonth()).toBe(4); // May
    });

    it('should include Thanksgiving (second Monday in October)', () => {
      const holidays = getCanadaHolidays(2024);
      const thanksgiving = holidays.find(h => h.name === 'Thanksgiving');
      expect(thanksgiving).toBeDefined();
      expect(thanksgiving!.date.getDay()).toBe(1); // Monday
      expect(thanksgiving!.date.getMonth()).toBe(9); // October
    });
  });

  describe('Australia Holidays', () => {
    it('should return all Australia holidays for 2024', () => {
      const holidays = getAustraliaHolidays(2024);
      expect(holidays.length).toBeGreaterThanOrEqual(9);
      expect(holidays.every(h => h.countryCode === 'AU')).toBe(true);
    });

    it('should include Australia Day', () => {
      const holidays = getAustraliaHolidays(2024);
      const ausDay = holidays.find(h => h.name === 'Australia Day');
      expect(ausDay).toBeDefined();
      expect(ausDay!.date.getMonth()).toBe(0); // January
      expect(ausDay!.date.getDate()).toBe(26);
    });

    it('should include Anzac Day', () => {
      const holidays = getAustraliaHolidays(2024);
      const anzacDay = holidays.find(h => h.name === 'Anzac Day');
      expect(anzacDay).toBeDefined();
      expect(anzacDay!.date.getDate()).toBe(25);
      expect(anzacDay!.date.getMonth()).toBe(3); // April
    });

    it('should include Easter Saturday', () => {
      const holidays = getAustraliaHolidays(2024);
      const easterSat = holidays.find(h => h.name === 'Easter Saturday');
      expect(easterSat).toBeDefined();
    });
  });

  describe('Italy Holidays', () => {
    it('should return all Italy holidays for 2024', () => {
      const holidays = getItalyHolidays(2024);
      expect(holidays.length).toBeGreaterThanOrEqual(11);
      expect(holidays.every(h => h.countryCode === 'IT')).toBe(true);
    });

    it('should include Epiphany', () => {
      const holidays = getItalyHolidays(2024);
      const epiphany = holidays.find(h => h.name === 'Epiphany');
      expect(epiphany).toBeDefined();
      expect(epiphany!.date.getDate()).toBe(6);
      expect(epiphany!.date.getMonth()).toBe(0); // January
    });

    it('should include Republic Day', () => {
      const holidays = getItalyHolidays(2024);
      const republicDay = holidays.find(h => h.name === 'Republic Day');
      expect(republicDay).toBeDefined();
      expect(republicDay!.date.getDate()).toBe(2);
      expect(republicDay!.date.getMonth()).toBe(5); // June
    });

    it('should include Assumption of Mary', () => {
      const holidays = getItalyHolidays(2024);
      const assumption = holidays.find(h => h.name === 'Assumption of Mary');
      expect(assumption).toBeDefined();
      expect(assumption!.date.getDate()).toBe(15);
      expect(assumption!.date.getMonth()).toBe(7); // August
    });
  });

  describe('Spain Holidays', () => {
    it('should return all Spain holidays for 2024', () => {
      const holidays = getSpainHolidays(2024);
      expect(holidays.length).toBeGreaterThanOrEqual(10);
      expect(holidays.every(h => h.countryCode === 'ES')).toBe(true);
    });

    it('should include National Day of Spain', () => {
      const holidays = getSpainHolidays(2024);
      const nationalDay = holidays.find(h => h.name === 'National Day of Spain');
      expect(nationalDay).toBeDefined();
      expect(nationalDay!.date.getDate()).toBe(12);
      expect(nationalDay!.date.getMonth()).toBe(9); // October
    });

    it('should include Constitution Day', () => {
      const holidays = getSpainHolidays(2024);
      const constitutionDay = holidays.find(h => h.name === 'Constitution Day');
      expect(constitutionDay).toBeDefined();
      expect(constitutionDay!.date.getDate()).toBe(6);
      expect(constitutionDay!.date.getMonth()).toBe(11); // December
    });
  });

  describe('China Holidays', () => {
    it('should return China holidays for 2024', () => {
      const holidays = getChinaHolidays(2024);
      expect(holidays.length).toBeGreaterThan(0);
      expect(holidays.every(h => h.countryCode === 'CN')).toBe(true);
    });

    it('should include National Day', () => {
      const holidays = getChinaHolidays(2024);
      const nationalDay = holidays.find(h => h.name === 'National Day');
      expect(nationalDay).toBeDefined();
      expect(nationalDay!.date.getDate()).toBe(1);
      expect(nationalDay!.date.getMonth()).toBe(9); // October
    });
  });

  describe('India Holidays', () => {
    it('should return India holidays for 2024', () => {
      const holidays = getIndiaHolidays(2024);
      expect(holidays.length).toBeGreaterThan(0);
      expect(holidays.every(h => h.countryCode === 'IN')).toBe(true);
    });

    it('should include Republic Day', () => {
      const holidays = getIndiaHolidays(2024);
      const republicDay = holidays.find(h => h.name === 'Republic Day');
      expect(republicDay).toBeDefined();
      expect(republicDay!.date.getDate()).toBe(26);
      expect(republicDay!.date.getMonth()).toBe(0); // January
    });

    it('should include Independence Day', () => {
      const holidays = getIndiaHolidays(2024);
      const independenceDay = holidays.find(h => h.name === 'Independence Day');
      expect(independenceDay).toBeDefined();
      expect(independenceDay!.date.getDate()).toBe(15);
      expect(independenceDay!.date.getMonth()).toBe(7); // August
    });

    it('should include Gandhi Jayanti', () => {
      const holidays = getIndiaHolidays(2024);
      const gandhiJayanti = holidays.find(h => h.name === 'Gandhi Jayanti');
      expect(gandhiJayanti).toBeDefined();
      expect(gandhiJayanti!.date.getDate()).toBe(2);
      expect(gandhiJayanti!.date.getMonth()).toBe(9); // October
    });
  });

  describe('Unified API', () => {
    describe('getHolidays', () => {
      it('should get holidays for UK', () => {
        const holidays = getHolidays(2024, 'UK');
        expect(holidays.length).toBeGreaterThan(0);
        expect(holidays.every(h => h.countryCode === 'UK')).toBe(true);
      });

      it('should get holidays for all supported countries', () => {
        const countries = getSupportedCountries();
        countries.forEach(country => {
          if (country !== 'US') { // US holidays in calendar module
            const holidays = getHolidays(2024, country);
            expect(holidays.length).toBeGreaterThan(0);
          }
        });
      });
    });

    describe('isHoliday', () => {
      it('should detect Christmas Day in UK', () => {
        expect(isHoliday(new Date('2024-12-25'), 'UK')).toBe(true);
      });

      it('should detect Canada Day', () => {
        expect(isHoliday(new Date('2024-07-01'), 'CA')).toBe(true);
      });

      it('should return false for non-holiday', () => {
        expect(isHoliday(new Date('2024-03-20'), 'UK')).toBe(false);
      });
    });

    describe('getHolidayName', () => {
      it('should return holiday name for UK Christmas', () => {
        const name = getHolidayName(new Date('2024-12-25'), 'UK');
        expect(name).toBe('Christmas Day');
      });

      it('should return null for non-holiday', () => {
        const name = getHolidayName(new Date('2024-03-20'), 'UK');
        expect(name).toBeNull();
      });
    });

    describe('getNextHoliday', () => {
      it('should get next UK holiday after a date', () => {
        const next = getNextHoliday(new Date('2024-01-15'), 'UK');
        expect(next).toBeDefined();
        expect(next!.date > new Date('2024-01-15')).toBe(true);
      });

      it('should get next holiday across year boundary', () => {
        const next = getNextHoliday(new Date('2024-12-30'), 'UK');
        expect(next).toBeDefined();
        expect(next!.date.getFullYear()).toBe(2025);
      });
    });

    describe('getUpcomingHolidays', () => {
      it('should get holidays in next 90 days', () => {
        const upcoming = getUpcomingHolidays(new Date('2024-01-01'), 90, 'UK');
        expect(upcoming.length).toBeGreaterThan(0);
        upcoming.forEach(h => {
          expect(h.date > new Date('2024-01-01')).toBe(true);
        });
      });

      it('should return empty array if no holidays in range', () => {
        const upcoming = getUpcomingHolidays(new Date('2024-02-01'), 1, 'UK');
        expect(upcoming.length).toBe(0);
      });
    });

    describe('getSupportedCountries', () => {
      it('should return array of country codes', () => {
        const countries = getSupportedCountries();
        expect(countries).toContain('UK');
        expect(countries).toContain('CA');
        expect(countries).toContain('AU');
        expect(countries).toContain('DE');
        expect(countries).toContain('NL');
        expect(countries).toContain('IT');
        expect(countries).toContain('ES');
        expect(countries).toContain('CN');
        expect(countries).toContain('IN');
        expect(countries.length).toBe(10);
      });
    });
  });
});
