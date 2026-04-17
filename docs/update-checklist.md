# Documentation Update Checklist

When adding a new module to ts-time-utils, ensure these files are updated:

## Release Preparation Checklist

- [ ] Update `CHANGELOG.md` with the release summary
- [ ] Confirm README module counts match `package.json` exports
- [ ] Confirm version references point at the current release baseline
- [ ] Run `npm run lint`, `npm test`, `npm run build`, and `npm run test:package`
- [ ] Verify release instructions still match `.github/workflows/ci.yml` and `.github/workflows/publish.yml`

## 1. README.md

- [ ] Update feature count in main description (line ~14)
- [ ] Add module description in the most relevant README feature or module section
- [ ] Add import example in usage section
- [ ] Add detailed examples section for the module
- [ ] Add API reference section for the module

## 2. package.json

- [ ] Add module to exports section
- [ ] Update description if it's a major addition
- [ ] Add relevant keywords if applicable

## 3. src/index.ts

- [ ] Add module exports
- [ ] Add shared type exports if applicable

## 4. src/types.ts

- [ ] Add any shared interfaces or types for the module

## Module Template Sections for README.md:

### Feature Description Template:

```
### 🔁 [Module Name] utilities

- Brief feature 1
- Brief feature 2
- Brief feature 3
- Brief feature 4
```

### Import Example Template:

```ts
import { function1, function2 } from "ts-time-utils/[module]";
```

### Usage Example Template:

````ts
### [Module Name] Utilities

```ts
import { mainClass, utilFunction } from "ts-time-utils/[module]";

// Basic usage
const instance = new mainClass(params);
const result = utilFunction(input);

// Advanced usage
// ... more examples
```

````

### API Reference Template:
```

### [Module Name] Functions

- `MainClass` - Primary class with full functionality
- `createFunction(input)` - Factory function
- `utilFunction(params)` - Utility function
- `helperFunction(options?)` - Helper with options

```

## Current Module Status (v4.2.0):

All 32 public modules complete:
- format, calculate, validate, constants, age, calendar, parse, performance
- interval, timezone, workingHours, rangePresets, duration, serialize
- locale, recurrence, countdown, dateRange, naturalLanguage, cron
- fiscal, compare, iterate, holidays, chain, plugins
- calendars, temporal, precision, scheduling, finance, healthcare
```
