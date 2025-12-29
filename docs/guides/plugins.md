# Plugin System Guide

The plugin system allows you to extend `ChainedDate` with custom methods tailored to your specific use cases.

## Table of Contents

- [Quick Start](#quick-start)
- [Creating a Plugin](#creating-a-plugin)
- [TypeScript Support](#typescript-support)
- [Plugin Examples](#plugin-examples)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Quick Start

```ts
import { extend } from 'ts-time-utils/plugins';
import { chain, ChainedDate } from 'ts-time-utils/chain';

// Define plugin
extend('businessDays', {
  addBusinessDays(this: ChainedDate, days: number): ChainedDate {
    let current = this.clone();
    let remaining = days;

    while (remaining > 0) {
      current = current.add(1, 'days');
      if (current.isWeekday()) remaining--;
    }

    return current;
  }
});

// Use plugin
const result = chain('2025-01-17').addBusinessDays(5).format('YYYY-MM-DD');
console.log(result); // "2025-01-24"
```

## Creating a Plugin

### Basic Structure

Plugins are objects mapping method names to functions:

```ts
extend('pluginName', {
  methodName(this: ChainedDate, ...args): ReturnType {
    // Your implementation
    // Access ChainedDate methods via `this`
    return result;
  }
});
```

### Plugin Methods

Plugin methods receive the `ChainedDate` instance as `this` and can:

1. **Return ChainedDate** for chainable transformations:
```ts
extend('custom', {
  nextMonday(this: ChainedDate): ChainedDate {
    const day = this.weekday();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    return this.add(daysUntilMonday, 'days');
  }
});

chain().nextMonday().format('dddd'); // "Monday"
```

2. **Return primitives** for getters:
```ts
extend('custom', {
  isWorkday(this: ChainedDate, holidays: Date[] = []): boolean {
    return this.isWeekday() && !this.isBusinessDay(holidays);
  }
});

chain('2025-01-20').isWorkday(); // true (Monday)
```

3. **Return strings** for formatters:
```ts
extend('custom', {
  toFriendly(this: ChainedDate): string {
    return `${this.format('dddd, MMMM D')} at ${this.formatTime('12h')}`;
  }
});

chain('2025-01-20T14:30').toFriendly(); // "Monday, January 20 at 2:30 PM"
```

### Accessing Built-in Methods

Use `this` to access all `ChainedDate` methods:

```ts
extend('advanced', {
  businessDaysUntil(this: ChainedDate, target: Date): number {
    let count = 0;
    let current = this.clone();
    const end = chain(target);

    while (current.isBefore(end)) {
      if (current.isWeekday()) count++;
      current = current.add(1, 'days');
    }

    return count;
  }
});
```

## TypeScript Support

### Module Augmentation

For full type safety, augment the `ChainedDate` interface:

```ts
// my-plugin.ts
import { extend } from 'ts-time-utils/plugins';
import { ChainedDate } from 'ts-time-utils/chain';

// Augment types
declare module 'ts-time-utils/chain' {
  interface ChainedDate {
    addBusinessDays(days: number): ChainedDate;
    subtractBusinessDays(days: number): ChainedDate;
  }
}

// Register plugin
extend('businessDays', {
  addBusinessDays(this: ChainedDate, days: number): ChainedDate {
    // Implementation
  },
  subtractBusinessDays(this: ChainedDate, days: number): ChainedDate {
    // Implementation
  }
});
```

Now TypeScript knows about your methods:

```ts
import './my-plugin.js';
import { chain } from 'ts-time-utils/chain';

chain().addBusinessDays(5); // ✓ Type-safe
```

### Without Augmentation

If you skip module augmentation, cast to `any`:

```ts
(chain() as any).addBusinessDays(5);
```

## Plugin Examples

### Business Days

```ts
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
  },

  businessDaysUntil(this: ChainedDate, target: Date): number {
    let count = 0;
    let current = this.clone();
    const end = chain(target);

    while (current.isBefore(end)) {
      if (current.isWeekday()) count++;
      current = current.add(1, 'days');
    }

    return count;
  }
});
```

### Zodiac Signs

```ts
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

chain('1990-07-23').zodiacSign(); // "Leo"
```

### Rounding

```ts
extend('rounding', {
  roundToNearest(this: ChainedDate, minutes: number): ChainedDate {
    const ms = minutes * 60 * 1000;
    const rounded = Math.round(this.valueOf() / ms) * ms;
    return chain(rounded);
  },

  ceilToNearest(this: ChainedDate, minutes: number): ChainedDate {
    const ms = minutes * 60 * 1000;
    const ceiled = Math.ceil(this.valueOf() / ms) * ms;
    return chain(ceiled);
  },

  floorToNearest(this: ChainedDate, minutes: number): ChainedDate {
    const ms = minutes * 60 * 1000;
    const floored = Math.floor(this.valueOf() / ms) * ms;
    return chain(floored);
  }
});

chain('2025-01-20T14:37:00').roundToNearest(15).formatTime();
// "14:45:00"
```

## API Reference

### `extend(pluginName, methods)`

Register a plugin and add its methods to `ChainedDate`.

- **pluginName** `string` - Unique identifier for the plugin
- **methods** `Record<string, PluginFunction>` - Map of method names to functions
- **Throws** if plugin name already registered

```ts
extend('myPlugin', {
  myMethod(this: ChainedDate): ChainedDate {
    return this.add(1, 'day');
  }
});
```

### `uninstall(pluginName)`

Remove a plugin and its methods from `ChainedDate`.

- **pluginName** `string` - Name of the plugin to remove
- **Throws** if plugin not registered

```ts
uninstall('myPlugin');
```

### `getRegisteredPlugins()`

Get list of all registered plugin names.

- **Returns** `string[]` - Array of plugin names

```ts
getRegisteredPlugins(); // ['businessDays', 'zodiac']
```

### `getPluginMethods(pluginName)`

Get list of methods provided by a plugin.

- **pluginName** `string` - Name of the plugin
- **Returns** `string[]` - Array of method names (empty if plugin not found)

```ts
getPluginMethods('businessDays');
// ['addBusinessDays', 'subtractBusinessDays', 'businessDaysUntil']
```

### `isPluginRegistered(pluginName)`

Check if a plugin is registered.

- **pluginName** `string` - Name of the plugin
- **Returns** `boolean` - True if registered

```ts
isPluginRegistered('businessDays'); // true
```

## Best Practices

### 1. Use Unique Plugin Names

Avoid conflicts with other plugins:

```ts
// ✓ Good - namespaced
extend('@mycompany/dates', { ... });

// ✗ Bad - generic name
extend('utils', { ... });
```

### 2. Validate Inputs

```ts
extend('safe', {
  addBusinessDays(this: ChainedDate, days: number): ChainedDate {
    if (!Number.isInteger(days) || days < 0) {
      throw new Error('days must be a non-negative integer');
    }
    // Implementation
  }
});
```

### 3. Return New Instances for Transformations

Follow the immutability pattern:

```ts
// ✓ Good - returns new instance
nextDay(this: ChainedDate): ChainedDate {
  return this.add(1, 'day');
}

// ✗ Bad - mutates (not possible with ChainedDate, but don't try)
nextDay(this: ChainedDate): ChainedDate {
  // ChainedDate is immutable, so this pattern doesn't apply
  // But always return new instances
}
```

### 4. Document Your Plugins

Include JSDoc comments:

```ts
extend('businessDays', {
  /**
   * Add business days (Mon-Fri) to the date
   * @param days - Number of business days to add
   * @returns New ChainedDate advanced by the specified business days
   * @example
   * chain('2025-01-17').addBusinessDays(3) // 2025-01-22 (Fri -> Wed)
   */
  addBusinessDays(this: ChainedDate, days: number): ChainedDate {
    // Implementation
  }
});
```

### 5. Keep Plugins Focused

One plugin = one responsibility:

```ts
// ✓ Good - focused
extend('businessDays', { addBusinessDays, subtractBusinessDays });
extend('zodiac', { zodiacSign, nextZodiacDate });

// ✗ Bad - too broad
extend('everything', { addBusinessDays, zodiacSign, randomMethod });
```

### 6. Test Your Plugins

```ts
import { describe, it, expect } from 'vitest';

describe('businessDays plugin', () => {
  it('adds business days correctly', () => {
    const result = chain('2025-01-17').addBusinessDays(3);
    expect(result.format('YYYY-MM-DD')).toBe('2025-01-22');
  });
});
```

## Plugin Distribution

If you create a useful plugin, consider publishing it as an npm package:

```bash
npm init -y
npm install --save-dev ts-time-utils
```

```ts
// index.ts
import { extend } from 'ts-time-utils/plugins';
import { ChainedDate } from 'ts-time-utils/chain';

declare module 'ts-time-utils/chain' {
  interface ChainedDate {
    addBusinessDays(days: number): ChainedDate;
  }
}

extend('businessDays', {
  addBusinessDays(this: ChainedDate, days: number): ChainedDate {
    // Implementation
  }
});
```

```json
{
  "name": "ts-time-utils-business-days",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "ts-time-utils": "^2.0.0"
  }
}
```

Users can then:

```ts
import 'ts-time-utils-business-days';
import { chain } from 'ts-time-utils/chain';

chain().addBusinessDays(5); // Works!
```
