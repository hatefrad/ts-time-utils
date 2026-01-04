# Bundle Sizes

All sizes are brotli-compressed. Tree-shake by importing specific modules.

## Per-Module Sizes

| Module | Size | Import Path |
|--------|------|-------------|
| constants | 189 B | `ts-time-utils/constants` |
| rangePresets | 694 B | `ts-time-utils/rangePresets` |
| age | 801 B | `ts-time-utils/age` |
| interval | 949 B | `ts-time-utils/interval` |
| calculate | 1.11 KB | `ts-time-utils/calculate` |
| validate | 1.15 KB | `ts-time-utils/validate` |
| plugins | 1.20 KB | `ts-time-utils/plugins` |
| performance | 1.35 KB | `ts-time-utils/performance` |
| calendars | 1.45 KB | `ts-time-utils/calendars` |
| workingHours | 1.64 KB | `ts-time-utils/workingHours` |
| precision | 1.85 KB | `ts-time-utils/precision` |
| cron | 1.90 KB | `ts-time-utils/cron` |
| iterate | 1.99 KB | `ts-time-utils/iterate` |
| fiscal | 2.07 KB | `ts-time-utils/fiscal` |
| countdown | 2.11 KB | `ts-time-utils/countdown` |
| duration | 2.23 KB | `ts-time-utils/duration` |
| calendar | 2.37 KB | `ts-time-utils/calendar` |
| dateRange | 2.42 KB | `ts-time-utils/dateRange` |
| serialize | 2.52 KB | `ts-time-utils/serialize` |
| timezone | 2.55 KB | `ts-time-utils/timezone` |
| recurrence | 2.61 KB | `ts-time-utils/recurrence` |
| compare | 2.76 KB | `ts-time-utils/compare` |
| holidays | 2.81 KB | `ts-time-utils/holidays` |
| naturalLanguage | 2.88 KB | `ts-time-utils/naturalLanguage` |
| format | 3.10 KB | `ts-time-utils/format` |
| parse | 3.13 KB | `ts-time-utils/parse` |
| temporal | 3.45 KB | `ts-time-utils/temporal` |
| chain | 4.20 KB | `ts-time-utils/chain` |
| locale | 7.26 KB | `ts-time-utils/locale` |

## Recommendations

**Smallest footprint** (~1 KB): `constants`, `rangePresets`, `age`, `interval`, `plugins`

**Medium** (1-3 KB): Most modules including `format`, `calculate`, `validate`, `calendar`, `timezone`, `calendars`, `precision`

**Larger** (3+ KB): `chain` (4.20 KB), `temporal` (3.45 KB), `locale` (7.26 KB - contains 40+ locale configs)

## Example: Minimal Import

```ts
// Only what you need - 1.11 KB
import { addDays, differenceInDays } from 'ts-time-utils/calculate';

// vs importing everything - much larger
import { addDays, differenceInDays } from 'ts-time-utils';
```

## Running Size Check Locally

```bash
npm run build
npm run size
```
