/**
 * Example: Creating a custom plugin for ts-time-utils
 *
 * This file demonstrates how to create and use custom plugins
 * to extend ChainedDate with domain-specific functionality.
 */

import { extend } from '../src/plugins.js';
import { chain, ChainedDate } from '../src/chain.js';

// ============ TypeScript Augmentation ============

// Augment the ChainedDate interface for type safety
declare module '../src/chain.js' {
  interface ChainedDate {
    // Business days methods
    addBusinessDays(days: number, holidays?: Date[]): ChainedDate;
    subtractBusinessDays(days: number, holidays?: Date[]): ChainedDate;
    businessDaysUntil(target: Date, holidays?: Date[]): number;

    // Zodiac methods
    zodiacSign(): string;
    isZodiac(sign: string): boolean;

    // Rounding methods
    roundToNearest(minutes: number): ChainedDate;
    ceilToNearest(minutes: number): ChainedDate;
    floorToNearest(minutes: number): ChainedDate;
  }
}

// ============ Business Days Plugin ============

extend('businessDays', {
  /**
   * Add business days (Mon-Fri) to the date, skipping weekends and optional holidays
   */
  addBusinessDays(this: ChainedDate, days: number, holidays: Date[] = []): ChainedDate {
    if (!Number.isInteger(days) || days < 0) {
      throw new Error('days must be a non-negative integer');
    }

    let current = this.clone();
    let remaining = days;

    while (remaining > 0) {
      current = current.add(1, 'days');
      if (current.isBusinessDay(holidays)) {
        remaining--;
      }
    }

    return current;
  },

  /**
   * Subtract business days (Mon-Fri) from the date, skipping weekends and optional holidays
   */
  subtractBusinessDays(this: ChainedDate, days: number, holidays: Date[] = []): ChainedDate {
    if (!Number.isInteger(days) || days < 0) {
      throw new Error('days must be a non-negative integer');
    }

    let current = this.clone();
    let remaining = days;

    while (remaining > 0) {
      current = current.subtract(1, 'days');
      if (current.isBusinessDay(holidays)) {
        remaining--;
      }
    }

    return current;
  },

  /**
   * Count business days between this date and target date
   */
  businessDaysUntil(this: ChainedDate, target: Date, holidays: Date[] = []): number {
    let count = 0;
    let current = this.clone();
    const end = chain(target);
    const isForward = this.isBefore(target);

    while (isForward ? current.isBefore(end) : current.isAfter(end)) {
      if (current.isBusinessDay(holidays)) {
        count++;
      }
      current = isForward ? current.add(1, 'days') : current.subtract(1, 'days');
    }

    return count;
  }
});

// ============ Zodiac Plugin ============

extend('zodiac', {
  /**
   * Get the zodiac sign for the date
   */
  zodiacSign(this: ChainedDate): string {
    const month = this.month();
    const day = this.day();

    const signs = [
      { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
      { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
      { sign: 'Pisces', start: [2, 19], end: [3, 20] },
      { sign: 'Aries', start: [3, 21], end: [4, 19] },
      { sign: 'Taurus', start: [4, 20], end: [5, 20] },
      { sign: 'Gemini', start: [5, 21], end: [6, 20] },
      { sign: 'Cancer', start: [6, 21], end: [7, 22] },
      { sign: 'Leo', start: [7, 23], end: [8, 22] },
      { sign: 'Virgo', start: [8, 23], end: [9, 22] },
      { sign: 'Libra', start: [9, 23], end: [10, 22] },
      { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
      { sign: 'Sagittarius', start: [11, 22], end: [12, 21] }
    ];

    for (const { sign, start, end } of signs) {
      if (
        (month === start[0] && day >= start[1]) ||
        (month === end[0] && day <= end[1])
      ) {
        return sign;
      }
    }

    return 'Unknown';
  },

  /**
   * Check if the date is under a specific zodiac sign
   */
  isZodiac(this: ChainedDate, sign: string): boolean {
    return this.zodiacSign().toLowerCase() === sign.toLowerCase();
  }
});

// ============ Rounding Plugin ============

extend('rounding', {
  /**
   * Round to the nearest N minutes
   */
  roundToNearest(this: ChainedDate, minutes: number): ChainedDate {
    if (minutes <= 0) {
      throw new Error('minutes must be positive');
    }
    const ms = minutes * 60 * 1000;
    const rounded = Math.round(this.valueOf() / ms) * ms;
    return chain(rounded);
  },

  /**
   * Round up to the nearest N minutes
   */
  ceilToNearest(this: ChainedDate, minutes: number): ChainedDate {
    if (minutes <= 0) {
      throw new Error('minutes must be positive');
    }
    const ms = minutes * 60 * 1000;
    const ceiled = Math.ceil(this.valueOf() / ms) * ms;
    return chain(ceiled);
  },

  /**
   * Round down to the nearest N minutes
   */
  floorToNearest(this: ChainedDate, minutes: number): ChainedDate {
    if (minutes <= 0) {
      throw new Error('minutes must be positive');
    }
    const ms = minutes * 60 * 1000;
    const floored = Math.floor(this.valueOf() / ms) * ms;
    return chain(floored);
  }
});

// ============ Usage Examples ============

console.log('\n=== Business Days Plugin ===\n');

const friday = chain('2025-01-17'); // Friday
console.log(`Start: ${friday.format('dddd, MMMM D, YYYY')}`);

const afterBusinessDays = friday.addBusinessDays(3);
console.log(`After 3 business days: ${afterBusinessDays.format('dddd, MMMM D, YYYY')}`);
// Expected: Wednesday, January 22, 2025

const beforeBusinessDays = friday.subtractBusinessDays(2);
console.log(`Before 2 business days: ${beforeBusinessDays.format('dddd, MMMM D, YYYY')}`);
// Expected: Wednesday, January 15, 2025

const monday = chain('2025-01-20');
const businessDaysBetween = friday.businessDaysUntil(monday.toDate());
console.log(`Business days from Friday to Monday: ${businessDaysBetween}`);
// Expected: 1

console.log('\n=== Zodiac Plugin ===\n');

const birthday = chain('1990-07-23');
console.log(`Birthday: ${birthday.format('MMMM D, YYYY')}`);
console.log(`Zodiac sign: ${birthday.zodiacSign()}`);
// Expected: Leo
console.log(`Is Leo? ${birthday.isZodiac('Leo')}`);
// Expected: true

const newYear = chain('2025-01-01');
console.log(`New Year zodiac: ${newYear.zodiacSign()}`);
// Expected: Capricorn

console.log('\n=== Rounding Plugin ===\n');

const now = chain('2025-01-20T14:37:42');
console.log(`Original time: ${now.formatTime()}`);
// 14:37:42

console.log(`Rounded to 15 min: ${now.roundToNearest(15).formatTime()}`);
// 14:45:00

console.log(`Ceiled to 15 min: ${now.ceilToNearest(15).formatTime()}`);
// 14:45:00

console.log(`Floored to 15 min: ${now.floorToNearest(15).formatTime()}`);
// 14:30:00

console.log(`Rounded to 30 min: ${now.roundToNearest(30).formatTime()}`);
// 14:30:00

console.log('\n=== Chaining Multiple Plugins ===\n');

const result = chain('2025-01-17T09:17:00')
  .addBusinessDays(5)
  .roundToNearest(30)
  .format('dddd, MMMM D, YYYY [at] HH:mm');

console.log(`5 business days + rounding: ${result}`);
// Expected: Thursday, January 23, 2025 at 09:30

console.log('\n=== Plugin Registry ===\n');

import { getRegisteredPlugins, getPluginMethods } from '../src/plugins.js';

console.log('Registered plugins:', getRegisteredPlugins());
// ['businessDays', 'zodiac', 'rounding']

console.log('Business days methods:', getPluginMethods('businessDays'));
// ['addBusinessDays', 'subtractBusinessDays', 'businessDaysUntil']

console.log('\nDone! ✓');
