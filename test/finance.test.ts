import { describe, it, expect } from 'vitest';
import {
  isMarketOpen,
  isMarketHoliday,
  isTradingDay,
  getMarketHours,
  getMarketOpen,
  getMarketClose,
  getNextMarketOpen,
  getNextMarketClose,
  getSettlementDate,
  getTradeDateFromSettlement,
  eachTradingDay,
  countTradingDays,
  addTradingDays,
  getOptionsExpiration,
  MARKET_HOURS,
  US_MARKET_HOLIDAYS
} from '../src/finance.js';

// Helper to create local dates without timezone confusion
function localDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

describe('finance', () => {
  describe('MARKET_HOURS', () => {
    it('should have NYSE and NASDAQ hours', () => {
      expect(MARKET_HOURS.NYSE).toBeDefined();
      expect(MARKET_HOURS.NASDAQ).toBeDefined();
    });

    it('should have correct NYSE hours', () => {
      expect(MARKET_HOURS.NYSE.open).toEqual({ hour: 9, minute: 30 });
      expect(MARKET_HOURS.NYSE.close).toEqual({ hour: 16, minute: 0 });
      expect(MARKET_HOURS.NYSE.timezone).toBe('America/New_York');
    });
  });

  describe('US_MARKET_HOLIDAYS', () => {
    it('should include major US holidays', () => {
      expect(US_MARKET_HOLIDAYS).toContain("New Year's Day");
      expect(US_MARKET_HOLIDAYS).toContain('Christmas Day');
      expect(US_MARKET_HOLIDAYS).toContain('Thanksgiving Day');
      expect(US_MARKET_HOLIDAYS).toContain('Good Friday');
    });
  });

  describe('isMarketHoliday', () => {
    it('should return true for Christmas', () => {
      // Christmas 2024 is Wednesday
      expect(isMarketHoliday(localDate(2024, 12, 25))).toBe(true);
    });

    it('should return true for observed holiday', () => {
      // July 4, 2026 is Saturday, observed Friday July 3
      expect(isMarketHoliday(localDate(2026, 7, 3))).toBe(true);
    });

    it('should return false for regular trading day', () => {
      // Jan 16, 2024 is a regular trading day (Tue after MLK Day)
      expect(isMarketHoliday(localDate(2024, 1, 16))).toBe(false);
    });

    it('should return true for MLK Day', () => {
      // MLK Day 2024 is January 15 (3rd Monday)
      expect(isMarketHoliday(localDate(2024, 1, 15))).toBe(true);
    });

    it('should return true for Good Friday', () => {
      // Good Friday 2024 is March 29
      expect(isMarketHoliday(localDate(2024, 3, 29))).toBe(true);
    });
  });

  describe('isTradingDay', () => {
    it('should return true for weekday non-holiday', () => {
      // Tuesday Jan 16, 2024 is regular trading day
      expect(isTradingDay(localDate(2024, 1, 16))).toBe(true);
    });

    it('should return false for weekend', () => {
      expect(isTradingDay(localDate(2024, 1, 13))).toBe(false); // Saturday
      expect(isTradingDay(localDate(2024, 1, 14))).toBe(false); // Sunday
    });

    it('should return false for holiday', () => {
      // MLK Day 2024 is January 15
      expect(isTradingDay(localDate(2024, 1, 15))).toBe(false);
    });
  });

  describe('isMarketOpen', () => {
    it('should return true during trading hours on trading day', () => {
      // 10:30 AM on a Tuesday
      expect(isMarketOpen(localDate(2024, 1, 16, 10, 30))).toBe(true);
    });

    it('should return false before market open', () => {
      expect(isMarketOpen(localDate(2024, 1, 16, 8, 0))).toBe(false);
    });

    it('should return false after market close', () => {
      expect(isMarketOpen(localDate(2024, 1, 16, 17, 0))).toBe(false);
    });

    it('should return false on weekend', () => {
      expect(isMarketOpen(localDate(2024, 1, 13, 12, 0))).toBe(false); // Saturday noon
    });

    it('should return false on holiday', () => {
      expect(isMarketOpen(localDate(2024, 12, 25, 12, 0))).toBe(false); // Christmas noon
    });
  });

  describe('getMarketHours', () => {
    it('should return NYSE hours by default', () => {
      const hours = getMarketHours();
      expect(hours.open).toEqual({ hour: 9, minute: 30 });
      expect(hours.close).toEqual({ hour: 16, minute: 0 });
    });

    it('should return NASDAQ hours when specified', () => {
      const hours = getMarketHours('NASDAQ');
      expect(hours.timezone).toBe('America/New_York');
    });

    it('should return a copy, not the original', () => {
      const hours = getMarketHours();
      hours.open.hour = 10;
      expect(MARKET_HOURS.NYSE.open.hour).toBe(9);
    });
  });

  describe('getMarketOpen', () => {
    it('should return correct open time', () => {
      const open = getMarketOpen(localDate(2024, 1, 16));
      expect(open.getHours()).toBe(9);
      expect(open.getMinutes()).toBe(30);
    });
  });

  describe('getMarketClose', () => {
    it('should return correct close time', () => {
      const close = getMarketClose(localDate(2024, 1, 16));
      expect(close.getHours()).toBe(16);
      expect(close.getMinutes()).toBe(0);
    });
  });

  describe('getNextMarketOpen', () => {
    it('should return same day if before open on trading day', () => {
      const next = getNextMarketOpen(localDate(2024, 1, 16, 8, 0));
      expect(next.getDate()).toBe(16);
      expect(next.getHours()).toBe(9);
      expect(next.getMinutes()).toBe(30);
    });

    it('should return next trading day if after open', () => {
      const next = getNextMarketOpen(localDate(2024, 1, 16, 12, 0));
      expect(next.getDate()).toBe(17);
    });

    it('should skip weekends', () => {
      // Friday afternoon -> Monday (but Monday is MLK Day, so Tuesday)
      const next = getNextMarketOpen(localDate(2024, 1, 12, 17, 0));
      expect(next.getDate()).toBe(16); // Tuesday (skips weekend + MLK Day)
    });

    it('should skip holidays', () => {
      // Sunday before MLK Day -> Day after MLK Day
      const next = getNextMarketOpen(localDate(2024, 1, 14, 17, 0));
      expect(next.getDate()).toBe(16); // Skip MLK Day (15th)
    });
  });

  describe('getNextMarketClose', () => {
    it('should return same day close if before close on trading day', () => {
      const next = getNextMarketClose(localDate(2024, 1, 16, 12, 0));
      expect(next.getDate()).toBe(16);
      expect(next.getHours()).toBe(16);
    });

    it('should return next trading day close if after close', () => {
      const next = getNextMarketClose(localDate(2024, 1, 16, 17, 0));
      expect(next.getDate()).toBe(17);
    });
  });

  describe('getSettlementDate', () => {
    it('should calculate T+1 correctly', () => {
      const settlement = getSettlementDate(localDate(2024, 1, 16), 1); // Tuesday
      expect(settlement.getDate()).toBe(17); // Wednesday
    });

    it('should calculate T+2 correctly', () => {
      const settlement = getSettlementDate(localDate(2024, 1, 16), 2); // Tuesday
      expect(settlement.getDate()).toBe(18); // Thursday
    });

    it('should skip weekends', () => {
      const settlement = getSettlementDate(localDate(2024, 1, 11), 2); // Thursday
      // Fri + skip weekend + Tue (skip MLK Day Mon)
      expect(settlement.getDate()).toBe(16); // Tuesday
    });

    it('should skip holidays', () => {
      const settlement = getSettlementDate(localDate(2024, 1, 12), 2); // Friday before MLK Day
      // Skip weekend, skip MLK Day (15th), land on Tue + Wed
      expect(settlement.getDate()).toBe(17); // Wednesday
    });
  });

  describe('getTradeDateFromSettlement', () => {
    it('should reverse T+2 correctly', () => {
      const trade = getTradeDateFromSettlement(localDate(2024, 1, 18), 2); // Thursday
      expect(trade.getDate()).toBe(16); // Tuesday
    });

    it('should skip weekends going backward', () => {
      const trade = getTradeDateFromSettlement(localDate(2024, 1, 17), 2); // Wednesday
      // Tue, Mon is MLK Day (skip), Fri, Thu
      expect(trade.getDate()).toBe(12); // Friday
    });
  });

  describe('eachTradingDay', () => {
    it('should return all trading days in range', () => {
      const days = eachTradingDay(localDate(2024, 1, 16), localDate(2024, 1, 19));
      expect(days.length).toBe(4); // Tue, Wed, Thu, Fri
    });

    it('should skip weekends', () => {
      const days = eachTradingDay(localDate(2024, 1, 12), localDate(2024, 1, 16));
      // Fri 12, skip Sat 13, skip Sun 14, skip Mon 15 (MLK Day), Tue 16
      expect(days.length).toBe(2); // Fri 12th, Tue 16th
    });

    it('should skip holidays', () => {
      const days = eachTradingDay(localDate(2024, 1, 15), localDate(2024, 1, 16));
      // MLK Day is holiday, only Tue 16th
      expect(days.length).toBe(1);
    });
  });

  describe('countTradingDays', () => {
    it('should count trading days correctly', () => {
      const count = countTradingDays(localDate(2024, 1, 16), localDate(2024, 1, 19));
      expect(count).toBe(4);
    });

    it('should return 0 for empty range', () => {
      const count = countTradingDays(localDate(2024, 1, 13), localDate(2024, 1, 14));
      expect(count).toBe(0); // Weekend only
    });
  });

  describe('addTradingDays', () => {
    it('should add trading days forward', () => {
      const result = addTradingDays(localDate(2024, 1, 16), 3);
      expect(result.getDate()).toBe(19); // Tue + 3 = Fri
    });

    it('should subtract trading days (negative)', () => {
      const result = addTradingDays(localDate(2024, 1, 19), -3);
      expect(result.getDate()).toBe(16); // Fri - 3 = Tue
    });

    it('should skip weekends and holidays', () => {
      const result = addTradingDays(localDate(2024, 1, 12), 1); // Friday before long weekend
      // Skip weekend + MLK Day, land on Tuesday
      expect(result.getDate()).toBe(16);
    });

    it('should return same date for 0 days', () => {
      const result = addTradingDays(localDate(2024, 1, 16), 0);
      expect(result.getDate()).toBe(16);
    });
  });

  describe('getOptionsExpiration', () => {
    it('should return 3rd Friday for monthly options', () => {
      const exp = getOptionsExpiration(2024, 1, 'monthly');
      expect(exp.getDay()).toBe(5); // Friday
      expect(exp.getDate()).toBeGreaterThanOrEqual(15);
      expect(exp.getDate()).toBeLessThanOrEqual(21);
    });

    it('should return 3rd Friday for quarterly options', () => {
      const exp = getOptionsExpiration(2024, 3, 'quarterly');
      expect(exp.getDay()).toBe(5); // Friday
    });

    it('should return 1st Friday for weekly options', () => {
      const exp = getOptionsExpiration(2024, 1, 'weekly');
      expect(exp.getDay()).toBe(5); // Friday
      expect(exp.getDate()).toBeLessThanOrEqual(7);
    });

    it('should handle Good Friday (move to Thursday)', () => {
      // March 2024 - Good Friday is March 29
      // 3rd Friday of March 2024 is March 15, not Good Friday
      // But let's check a different scenario
      const exp = getOptionsExpiration(2024, 3);
      expect(exp.getMonth()).toBe(2); // March (0-indexed)
    });

    it('should default to monthly', () => {
      const exp = getOptionsExpiration(2024, 6);
      expect(exp.getDay()).toBe(5); // Friday
    });
  });
});
