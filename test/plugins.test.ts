import { describe, it, expect, beforeEach } from 'vitest';
import { extend, uninstall, getRegisteredPlugins, getPluginMethods, isPluginRegistered } from '../src/plugins.js';
import { chain, ChainedDate } from '../src/chain.js';

describe('Plugin system', () => {
  // Clean up plugins between tests
  beforeEach(() => {
    const plugins = getRegisteredPlugins();
    plugins.forEach(name => {
      try {
        uninstall(name);
      } catch (e) {
        // Ignore if already uninstalled
      }
    });
  });

  describe('extend', () => {
    it('adds method to ChainedDate prototype', () => {
      extend('test', {
        customMethod(this: ChainedDate): string {
          return 'custom';
        }
      });

      const result = (chain() as any).customMethod();
      expect(result).toBe('custom');
    });

    it('allows chaining after custom method', () => {
      extend('test', {
        addWeek(this: ChainedDate): ChainedDate {
          return this.add(7, 'days');
        }
      });

      const date = new Date('2025-01-15');
      const result = (chain(date) as any).addWeek().format('YYYY-MM-DD');
      expect(result).toBe('2025-01-22');
    });

    it('provides access to ChainedDate methods via this', () => {
      extend('test', {
        nextMonday(this: ChainedDate): ChainedDate {
          const day = this.weekday();
          const daysUntilMonday = day === 0 ? 1 : 8 - day;
          return this.add(daysUntilMonday, 'days');
        }
      });

      const friday = new Date('2025-01-17'); // Friday
      const result = (chain(friday) as any).nextMonday().weekday();
      expect(result).toBe(1); // Monday
    });

    it('allows multiple methods in one plugin', () => {
      extend('math', {
        double(this: ChainedDate): number {
          return this.valueOf() * 2;
        },
        triple(this: ChainedDate): number {
          return this.valueOf() * 3;
        }
      });

      const time = chain().valueOf();
      expect((chain() as any).double()).toBe(time * 2);
      expect((chain() as any).triple()).toBe(time * 3);
    });

    it('throws if plugin name already registered', () => {
      extend('duplicate', { method() {} });
      expect(() => extend('duplicate', { other() {} }))
        .toThrow('Plugin "duplicate" is already registered');
    });

    it('warns if method already exists (console.warn)', () => {
      const warnings: string[] = [];
      const originalWarn = console.warn;
      console.warn = (msg: string) => warnings.push(msg);

      extend('override', {
        format(this: ChainedDate): string {
          return 'overridden';
        }
      });

      console.warn = originalWarn;

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('format');
      expect(warnings[0]).toContain('already exists');
    });
  });

  describe('uninstall', () => {
    it('removes methods from prototype', () => {
      extend('temp', {
        tempMethod(this: ChainedDate): string {
          return 'temp';
        }
      });

      expect((chain() as any).tempMethod()).toBe('temp');

      uninstall('temp');

      expect((chain() as any).tempMethod).toBeUndefined();
    });

    it('removes plugin from registry', () => {
      extend('temp', { method() {} });
      expect(isPluginRegistered('temp')).toBe(true);

      uninstall('temp');
      expect(isPluginRegistered('temp')).toBe(false);
    });

    it('throws if plugin not registered', () => {
      expect(() => uninstall('nonexistent'))
        .toThrow('Plugin "nonexistent" is not registered');
    });
  });

  describe('getRegisteredPlugins', () => {
    it('returns empty array when no plugins', () => {
      expect(getRegisteredPlugins()).toEqual([]);
    });

    it('returns all registered plugin names', () => {
      extend('plugin1', { method1() {} });
      extend('plugin2', { method2() {} });

      const plugins = getRegisteredPlugins();
      expect(plugins).toContain('plugin1');
      expect(plugins).toContain('plugin2');
      expect(plugins.length).toBe(2);
    });
  });

  describe('getPluginMethods', () => {
    it('returns empty array for unregistered plugin', () => {
      expect(getPluginMethods('nonexistent')).toEqual([]);
    });

    it('returns all method names for plugin', () => {
      extend('multi', {
        method1() {},
        method2() {},
        method3() {}
      });

      const methods = getPluginMethods('multi');
      expect(methods).toContain('method1');
      expect(methods).toContain('method2');
      expect(methods).toContain('method3');
      expect(methods.length).toBe(3);
    });
  });

  describe('isPluginRegistered', () => {
    it('returns false for unregistered plugin', () => {
      expect(isPluginRegistered('nonexistent')).toBe(false);
    });

    it('returns true for registered plugin', () => {
      extend('exists', { method() {} });
      expect(isPluginRegistered('exists')).toBe(true);
    });
  });

  describe('Real-world example: Business days plugin', () => {
    it('adds business days correctly', () => {
      extend('businessDays', {
        addBusinessDays(this: ChainedDate, days: number): ChainedDate {
          let current = this.clone();
          let remaining = days;

          while (remaining > 0) {
            current = current.add(1, 'days');
            if (current.isWeekday()) remaining--;
          }

          return current;
        },
        subtractBusinessDays(this: ChainedDate, days: number): ChainedDate {
          let current = this.clone();
          let remaining = days;

          while (remaining > 0) {
            current = current.subtract(1, 'days');
            if (current.isWeekday()) remaining--;
          }

          return current;
        }
      });

      // Friday + 3 business days = Wednesday
      const friday = new Date('2025-01-17');
      const result = (chain(friday) as any).addBusinessDays(3).format('YYYY-MM-DD');
      expect(result).toBe('2025-01-22'); // Wednesday

      // Monday - 3 business days = Wednesday previous week
      const monday = new Date('2025-01-20');
      const result2 = (chain(monday) as any).subtractBusinessDays(3).format('YYYY-MM-DD');
      expect(result2).toBe('2025-01-15'); // Wednesday
    });
  });

  describe('Real-world example: Zodiac signs', () => {
    it('returns correct zodiac sign', () => {
      extend('zodiac', {
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
        }
      });

      expect((chain(new Date('2025-01-15')) as any).zodiacSign()).toBe('Capricorn');
      expect((chain(new Date('2025-03-21')) as any).zodiacSign()).toBe('Aries');
      expect((chain(new Date('2025-07-23')) as any).zodiacSign()).toBe('Leo');
      expect((chain(new Date('2025-12-25')) as any).zodiacSign()).toBe('Capricorn');
    });
  });
});
