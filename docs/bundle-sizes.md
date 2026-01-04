# Bundle Sizes

All sizes are brotli-compressed. Tree-shake by importing specific modules.

## Per-Module Sizes

| Module          | Size    | Import Path                     |
| --------------- | ------- | ------------------------------- | --- | --------- | ------- | ------------------------- |
| constants       | 189 B   | `ts-time-utils/constants`       |
| rangePresets    | 694 B   | `ts-time-utils/rangePresets`    |
| age             | 801 B   | `ts-time-utils/age`             |
| interval        | 949 B   | `ts-time-utils/interval`        |
| validate        | 1.31 KB | `ts-time-utils/validate`        |
| performance     | 1.35 KB | `ts-time-utils/performance`     |
| plugins         | 1.39 KB | `ts-time-utils/plugins`         |
| calculate       | 1.55 KB | `ts-time-utils/calculate`       |
| workingHours    | 1.64 KB | `ts-time-utils/workingHours`    |
| cron            | 1.90 KB | `ts-time-utils/cron`            |
| fiscal          | 2.07 KB | `ts-time-utils/fiscal`          |
| countdown       | 2.11 KB | `ts-time-utils/countdown`       |
| chain           | 2.21 KB | `ts-time-utils/chain`           |
| duration        | 2.23 KB | `ts-time-utils/duration`        |
| iterate         | 2.40 KB | `ts-time-utils/iterate`         |
| dateRange       | 2.42 KB | `ts-time-utils/dateRange`       |
| serialize       | 2.52 KB | `ts-time-utils/serialize`       |
| timezone        | 2.55 KB | `ts-time-utils/timezone`        |
| recurrence      | 2.61 KB | `ts-time-utils/recurrence`      |
| calendar        | 2.69 KB | `ts-time-utils/calendar`        |
| calendars       | 2.86 KB | `ts-time-utils/calendars`       |
| naturalLanguage | 2.88 KB | `ts-time-utils/naturalLanguage` |
| compare         | 3.09 KB | `ts-time-utils/compare`         |
| format          | 3.10 KB | `ts-time-utils/format`          |
| parse           | 3.13 KB | `ts-time-utils/parse`           |     | precision | 3.55 KB | `ts-time-utils/precision` |
| temporal        | 3.85 KB | `ts-time-utils/temporal`        |
| holidays        | 4.07 KB | `ts-time-utils/holidays`        |
| locale          | 8.23 KB | `ts-time-utils/locale`          |

## Recommendations

**Smallest footprint** (~1 KB): `constants`, `rangePresets`, `age`, `interval`, `validate`, `plugins`

**Medium** (1-3 KB): Most modules including `calculate`, `chain`, `calendar`, `calendars`, `timezone`, `format`

**Larger** (3+ KB): `precision`, `temporal`, `holidays`, `locale` (8.23 KB - contains 40+ locale configs)

## Example: Minimal Import

```ts
// Only what you need - 1.11 KB
import { addDays, differenceInDays } from "ts-time-utils/calculate";

// vs importing everything - much larger
import { addDays, differenceInDays } from "ts-time-utils";
```

## Running Size Check Locally

```bash
npm run build
npm run size
```
