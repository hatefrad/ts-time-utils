# ts-time-utils DX & Documentation Roadmap

## Overview

Phased plan to improve developer experience and documentation. No backwards compatibility constraints - library has few users currently.

## Phase 1: Foundation ✅

### 1A: Bundle Size Analysis
- [x] Add `size-limit` to devDependencies
- [x] Configure per-subpath size tracking (all 29 exports)
- [x] Add CI job that fails on size regression
- [x] Generate `docs/bundle-sizes.md` with breakdown table
- [x] ~~Add size badges to README~~ (deferred - npm badge sufficient)

### 1B: Integration Guides
- [x] Create `docs/guides/` directory
- [x] `docs/guides/react.md` - hooks wrapper, form validation, relative time display
- [x] `docs/guides/vue.md` - composables, reactive date handling
- [x] `docs/guides/node.md` - Express middleware, scheduling patterns
- [x] `docs/guides/angular.md` - pipes, services

---

## Phase 2: Documentation Completeness ✅

### 2A: Edge Case Documentation
- [x] Create `docs/edge-cases.md` covering:
  - Date parsing ambiguity (01/02/2025 format detection)
  - DST transitions (missing/duplicate hours)
  - Leap year handling (Feb 29 + 1 year)
  - Month overflow (Jan 31 + 1 month → Feb 28)
  - Timezone gotchas (UTC vs local)
  - Invalid date handling (null returns vs throws)
  - Floating point precision in durations

### 2B: Migration Guides
- [x] `docs/migrate-from-date-fns.md` - function mapping table
- [x] `docs/migrate-from-dayjs.md` - chain API equivalents
- [x] `docs/migrate-from-moment.md` - deprecated patterns → modern

---

## Phase 3: Chain API ✅

- [x] Create `src/chain.ts` with fluent wrapper class
- [x] Pattern: `chain(date).add(1, 'day').startOf('month').format('YYYY-MM-DD')`
- [x] Methods delegate to existing pure functions (no duplication)
- [x] Full TypeScript support with method chaining types
- [x] Export as `ts-time-utils/chain` subpath
- [x] Add `docs/guides/chain-api.md`
- [x] Add tests in `test/chain.test.ts`

---

## Phase 4: Plugin System ✅

### Architecture
- [x] Create `src/plugins.ts` with registration mechanism
- [x] Pattern: `extend(pluginName, pluginFn)` adds methods to chain API
- [x] Plugin capabilities: new chain methods, custom formatters, locale extensions

### Plugin Interface
```ts
interface Plugin {
  [methodName: string]: PluginFunction
}
type PluginFunction = (this: ChainedDate, ...args: any[]) => any
```

### Deliverables
- [x] `src/plugins.ts` - core extension mechanism with method preservation
- [x] `docs/guides/plugins.md` - comprehensive guide with examples
- [x] `examples/custom-plugin.ts` - business days, zodiac, rounding plugins
- [x] 17 tests covering plugin registration, uninstall, real-world scenarios

---

## Phase Summary

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Foundation | Bundle analysis, integration guides |
| 2 | Docs | Edge cases, migration guides |
| 3 | Chain API | Fluent interface wrapper |
| 4 | Plugins | Extension system |

---

## Unresolved Questions

1. Chain API - return unwrapped Date or keep wrapped for chaining? (recommend: `.toDate()` method to unwrap)
2. Plugin system - should plugins be lazy-loaded or bundled?
3. Size-limit thresholds - what's acceptable regression (5%? 10%)?
4. Integration guides - include SSR considerations for React/Vue?
