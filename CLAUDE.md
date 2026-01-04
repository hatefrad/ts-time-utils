# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ts-time-utils is a comprehensive TypeScript utility library for time, dates, durations, and calendar operations. It is designed with tree-shaking support, allowing consumers to import only the functions they need. The library has zero dependencies and provides 430+ functions across 32 utility categories.

## Build Commands

```bash
# Install dependencies
npm install

# Build both CommonJS and ES modules
npm run build

# Build CommonJS only (outputs to dist/)
npm run build:cjs

# Build ES modules only (outputs to dist/esm/)
npm run build:esm

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

## Architecture

### Module Structure

The library follows a modular architecture where each category of utilities is in its own file:

- **Entry Point**: `src/index.ts` re-exports all functions from individual modules
- **Dual Build**: Supports both CommonJS (`dist/`) and ES modules (`dist/esm/`)
- **Package Exports**: `package.json` defines subpath exports for tree-shaking (e.g., `ts-time-utils/format`, `ts-time-utils/calculate`)

### Core Modules

Each `.ts` file in `src/` represents a category of utilities:

1. **format.ts** - Duration formatting, time ago, date formatting
2. **calculate.ts** - Date arithmetic, differences, business days
3. **validate.ts** - Date validation, comparisons, type checks
4. **age.ts** - Age calculations, life stages, birthdays
5. **calendar.ts** - ISO weeks, quarters, holidays, calendar grids
6. **parse.ts** - Date parsing from various formats
7. **performance.ts** - Async utilities, benchmarking, stopwatch
8. **interval.ts** - Time interval operations
9. **timezone.ts** - Timezone conversions, DST handling
10. **workingHours.ts** - Business hours calculations
11. **rangePresets.ts** - Common date range presets
12. **duration.ts** - Immutable Duration class with arithmetic
13. **serialize.ts** - JSON serialization/deserialization
14. **locale.ts** - Internationalization, multi-language formatting
15. **recurrence.ts** - Recurring events (RRULE-inspired)
16. **countdown.ts** - Timer and countdown utilities
17. **dateRange.ts** - Date range operations (overlap, gaps, merge)
18. **naturalLanguage.ts** - Parse human-friendly date strings
19. **cron.ts** - Cron expression parsing and matching
20. **fiscal.ts** - Fiscal year utilities
21. **compare.ts** - Date sorting, grouping, statistical operations
22. **iterate.ts** - Date iteration and counting
23. **holidays.ts** - International holiday calculations (20 countries)
24. **chain.ts** - Fluent chainable API for date operations
25. **plugins.ts** - Plugin system for extending chain API
26. **calendars.ts** - Non-Gregorian calendars (Hebrew, Islamic, etc.)
27. **temporal.ts** - Temporal API compatibility layer
28. **precision.ts** - Nanosecond timestamps, BigInt, DST gap detection
29. **scheduling.ts** - Appointment slots, availability, booking conflicts
30. **finance.ts** - Market hours, trading days, settlement dates
31. **healthcare.ts** - Medication schedules, shifts, on-call rotations
32. **types.ts** - Shared TypeScript types
33. **constants.ts** - Time constants and type definitions

### Testing

- Tests are in the `test/` directory
- Each module has a corresponding `.test.ts` file
- Uses Vitest as the test runner
- Run `npm test` for all tests, `npm run test:watch` for watch mode

### Build Configuration

- **tsconfig.json**: CommonJS build configuration (outputs to `dist/`)
- **tsconfig.esm.json**: ES modules build configuration (outputs to `dist/esm/`)
- Both configs target ES2020 with strict TypeScript settings
- Uses `.js` extensions in import statements for ESM compatibility

## Development Guidelines

### Adding New Utilities

1. Add the function to the appropriate module file (e.g., `src/format.ts`)
2. Export it from that module
3. Add the export to `src/index.ts`
4. Add the export to `package.json` exports if creating a new module
5. Write tests in the corresponding `test/*.test.ts` file
6. Update README.md with examples and API documentation

### Code Style

- TypeScript with strict mode enabled
- No runtime dependencies (keep it zero-dependency)
- Functions should be pure when possible
- Use JSDoc comments for function documentation
- Export types from `types.ts` for shared interfaces

### Module Exports

Each utility category has dual exports in `package.json`:
- Main export: `"."` for importing everything
- Subpath exports: `"./format"`, `"./calculate"`, etc. for tree-shaking

When adding a new module:
1. Create `src/modulename.ts`
2. Add to `package.json` exports with both CJS and ESM paths
3. Export from `src/index.ts`

### Date Handling Philosophy

- Accept flexible inputs (Date objects, strings, numbers)
- Return Date objects or primitives, not wrappers
- Handle timezone-aware operations explicitly
- Default to local timezone unless specified
- Validate inputs and return null/throw for invalid dates

### Locale Support

The library supports 40+ locales with built-in configurations. Locale utilities are in `src/locale.ts` and support:
- Multi-language relative time formatting
- Locale-specific date/time formatting
- Locale conversions and detection

### International Features

- **Holidays**: Supports 20 countries (UK, NL, DE, CA, AU, IT, ES, CN, IN, US, JP, FR, BR, MX, KR, SG, PL, SE, BE, CH)
- **Fiscal Years**: Configurable fiscal year start (calendar, UK/India April, Australia July, US Federal October)
- **Cron**: Standard 5-field cron expression parsing
- **Calendars**: Non-Gregorian calendars (Hebrew, Islamic, Buddhist, Japanese, Persian, Chinese)

### Tree-Shaking Design

The library is designed for optimal tree-shaking:
- Each module is independently importable
- No side effects (`"sideEffects": false` in package.json)
- Use subpath imports to minimize bundle size

Example:
```ts
// Import specific category (better for tree-shaking)
import { formatDuration } from 'ts-time-utils/format';

// Import everything (not recommended for production)
import { formatDuration } from 'ts-time-utils';
```

## Common Patterns

### Duration Class Usage

The `Duration` class is immutable. All operations return new instances:
```ts
const d1 = Duration.fromHours(2);
const d2 = d1.add(Duration.fromMinutes(30)); // Returns new Duration
```

### Working Hours Configuration

Working hours functions accept an optional config object:
```ts
interface WorkingHoursConfig {
  workingDays: number[]; // 1-5 for Mon-Fri
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
  breaks?: Array<{ start: { hour: number; minute: number }, end: { hour: number; minute: number } }>;
  holidays?: Date[];
}
```

### Fiscal Year Configuration

Fiscal utilities accept a config with `startMonth` (1-12):
```ts
const fiscalYear = getFiscalYear(date, { startMonth: 4 }); // UK/India (April start)
```

Use `FISCAL_PRESETS` for common configurations.

### Cron Expressions

Cron utilities support standard 5-field format: `minute hour dayOfMonth month dayOfWeek`
- Use `CRON_PRESETS` for common patterns (DAILY, WEEKLY, MONTHLY, etc.)
- Supports wildcards, ranges, steps, and lists

## Testing Notes

- Tests use Vitest
- Test files mirror source file names in `test/` directory
- Run specific test file: `npx vitest run test/format.test.ts`
- Coverage is important for utility libraries
