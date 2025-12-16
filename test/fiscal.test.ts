import { describe, it, expect } from 'vitest';
import {
  getFiscalYear,
  getFiscalQuarter,
  getFiscalYearStart,
  getFiscalYearEnd,
  getFiscalQuarterStart,
  getFiscalQuarterEnd,
  isSameFiscalYear,
  isSameFiscalQuarter,
  getFiscalMonth,
  getDaysRemainingInFiscalYear,
  getDaysElapsedInFiscalYear,
  getFiscalYearProgress,
  getFiscalWeek,
  formatFiscalYear,
  formatFiscalQuarter,
  getFiscalPeriodInfo,
  FISCAL_PRESETS,
} from '../src/fiscal.js';

describe('Fiscal Year utilities', () => {
  describe('getFiscalYear', () => {
    it('should return calendar year for default config', () => {
      expect(getFiscalYear(new Date('2024-01-15'))).toBe(2024);
      expect(getFiscalYear(new Date('2024-06-15'))).toBe(2024);
      expect(getFiscalYear(new Date('2024-12-15'))).toBe(2024);
    });

    it('should handle April fiscal year (UK/India)', () => {
      const config = { startMonth: 4 };
      expect(getFiscalYear(new Date('2024-03-15'), config)).toBe(2023);
      expect(getFiscalYear(new Date('2024-04-01'), config)).toBe(2024);
      expect(getFiscalYear(new Date('2024-12-15'), config)).toBe(2024);
    });

    it('should handle July fiscal year (Australia)', () => {
      const config = { startMonth: 7 };
      expect(getFiscalYear(new Date('2024-06-30'), config)).toBe(2023);
      expect(getFiscalYear(new Date('2024-07-01'), config)).toBe(2024);
    });

    it('should handle October fiscal year (US Federal)', () => {
      const config = FISCAL_PRESETS.US_FEDERAL;
      // Sep 30, 2024 is before Oct, so it's still FY2023 (which started Oct 2023)
      expect(getFiscalYear(new Date('2024-09-30'), config)).toBe(2023);
      // Oct 1, 2024 starts FY2024
      expect(getFiscalYear(new Date('2024-10-01'), config)).toBe(2024);
    });
  });

  describe('getFiscalQuarter', () => {
    it('should return quarter for calendar year', () => {
      expect(getFiscalQuarter(new Date('2024-01-15'))).toBe(1);
      expect(getFiscalQuarter(new Date('2024-04-15'))).toBe(2);
      expect(getFiscalQuarter(new Date('2024-07-15'))).toBe(3);
      expect(getFiscalQuarter(new Date('2024-10-15'))).toBe(4);
    });

    it('should handle April fiscal year', () => {
      const config = { startMonth: 4 };
      expect(getFiscalQuarter(new Date('2024-04-15'), config)).toBe(1);
      expect(getFiscalQuarter(new Date('2024-07-15'), config)).toBe(2);
      expect(getFiscalQuarter(new Date('2024-10-15'), config)).toBe(3);
      expect(getFiscalQuarter(new Date('2024-01-15'), config)).toBe(4);
    });
  });

  describe('getFiscalYearStart', () => {
    it('should return Jan 1 for calendar year', () => {
      const start = getFiscalYearStart(2024);
      expect(start.getFullYear()).toBe(2024);
      expect(start.getMonth()).toBe(0);
      expect(start.getDate()).toBe(1);
    });

    it('should handle April fiscal year', () => {
      const start = getFiscalYearStart(2024, { startMonth: 4 });
      expect(start.getFullYear()).toBe(2024);
      expect(start.getMonth()).toBe(3); // April
      expect(start.getDate()).toBe(1);
    });
  });

  describe('getFiscalYearEnd', () => {
    it('should return Dec 31 for calendar year', () => {
      const end = getFiscalYearEnd(2024);
      expect(end.getFullYear()).toBe(2024);
      expect(end.getMonth()).toBe(11);
      expect(end.getDate()).toBe(31);
    });

    it('should handle April fiscal year', () => {
      const end = getFiscalYearEnd(2024, { startMonth: 4 });
      expect(end.getFullYear()).toBe(2025);
      expect(end.getMonth()).toBe(2); // March
      expect(end.getDate()).toBe(31);
    });
  });

  describe('getFiscalQuarterStart', () => {
    it('should return correct quarter starts', () => {
      const q1 = getFiscalQuarterStart(2024, 1);
      expect(q1.getMonth()).toBe(0); // January

      const q2 = getFiscalQuarterStart(2024, 2);
      expect(q2.getMonth()).toBe(3); // April
    });

    it('should throw for invalid quarter', () => {
      expect(() => getFiscalQuarterStart(2024, 0)).toThrow();
      expect(() => getFiscalQuarterStart(2024, 5)).toThrow();
    });
  });

  describe('getFiscalQuarterEnd', () => {
    it('should return correct quarter ends', () => {
      const q1End = getFiscalQuarterEnd(2024, 1);
      expect(q1End.getMonth()).toBe(2); // March
      expect(q1End.getDate()).toBe(31);

      const q2End = getFiscalQuarterEnd(2024, 2);
      expect(q2End.getMonth()).toBe(5); // June
      expect(q2End.getDate()).toBe(30);
    });
  });

  describe('isSameFiscalYear', () => {
    it('should detect same fiscal year', () => {
      expect(isSameFiscalYear(
        new Date('2024-03-15'),
        new Date('2024-11-15')
      )).toBe(true);
    });

    it('should detect different fiscal years', () => {
      expect(isSameFiscalYear(
        new Date('2024-03-15'),
        new Date('2024-05-15'),
        { startMonth: 4 }
      )).toBe(false);
    });
  });

  describe('isSameFiscalQuarter', () => {
    it('should detect same fiscal quarter', () => {
      expect(isSameFiscalQuarter(
        new Date('2024-01-15'),
        new Date('2024-02-15')
      )).toBe(true);
    });

    it('should detect different fiscal quarters', () => {
      expect(isSameFiscalQuarter(
        new Date('2024-01-15'),
        new Date('2024-04-15')
      )).toBe(false);
    });
  });

  describe('getFiscalMonth', () => {
    it('should return fiscal month number', () => {
      expect(getFiscalMonth(new Date('2024-01-15'))).toBe(1);
      expect(getFiscalMonth(new Date('2024-12-15'))).toBe(12);
    });

    it('should handle April fiscal year', () => {
      expect(getFiscalMonth(new Date('2024-04-15'), { startMonth: 4 })).toBe(1);
      expect(getFiscalMonth(new Date('2024-03-15'), { startMonth: 4 })).toBe(12);
    });
  });

  describe('getDaysRemainingInFiscalYear', () => {
    it('should calculate days remaining', () => {
      const days = getDaysRemainingInFiscalYear(new Date('2024-12-30'));
      expect(days).toBeGreaterThanOrEqual(1);
      expect(days).toBeLessThanOrEqual(2);
    });
  });

  describe('getDaysElapsedInFiscalYear', () => {
    it('should calculate days elapsed', () => {
      const days = getDaysElapsedInFiscalYear(new Date('2024-01-10'));
      expect(days).toBe(10);
    });
  });

  describe('getFiscalYearProgress', () => {
    it('should return progress percentage', () => {
      const progress = getFiscalYearProgress(new Date('2024-07-01'));
      expect(progress).toBeGreaterThan(45);
      expect(progress).toBeLessThan(55);
    });
  });

  describe('getFiscalWeek', () => {
    it('should return fiscal week number', () => {
      const week = getFiscalWeek(new Date('2024-01-14'));
      expect(week).toBe(2);
    });
  });

  describe('formatFiscalYear', () => {
    it('should format as FY2024 by default', () => {
      expect(formatFiscalYear(2024)).toBe('FY2024');
    });

    it('should format long style for non-calendar years', () => {
      expect(formatFiscalYear(2024, { startMonth: 4 }, 'long')).toBe('FY2023/24');
    });
  });

  describe('formatFiscalQuarter', () => {
    it('should format quarter', () => {
      expect(formatFiscalQuarter(2024, 1)).toBe('Q1 FY2024');
      expect(formatFiscalQuarter(2024, 3)).toBe('Q3 FY2024');
    });
  });

  describe('getFiscalPeriodInfo', () => {
    it('should return comprehensive fiscal info', () => {
      const info = getFiscalPeriodInfo(new Date('2024-06-15'));
      
      expect(info.fiscalYear).toBe(2024);
      expect(info.fiscalQuarter).toBe(2);
      expect(info.fiscalMonth).toBe(6);
      expect(info.yearStart).toBeInstanceOf(Date);
      expect(info.yearEnd).toBeInstanceOf(Date);
      expect(info.quarterStart).toBeInstanceOf(Date);
      expect(info.quarterEnd).toBeInstanceOf(Date);
      expect(info.daysElapsed).toBeGreaterThan(0);
      expect(info.daysRemaining).toBeGreaterThan(0);
      expect(info.progress).toBeGreaterThan(0);
    });
  });

  describe('FISCAL_PRESETS', () => {
    it('should have correct preset values', () => {
      expect(FISCAL_PRESETS.CALENDAR.startMonth).toBe(1);
      expect(FISCAL_PRESETS.UK_INDIA.startMonth).toBe(4);
      expect(FISCAL_PRESETS.AUSTRALIA.startMonth).toBe(7);
      expect(FISCAL_PRESETS.US_FEDERAL.startMonth).toBe(10);
    });
  });
});
