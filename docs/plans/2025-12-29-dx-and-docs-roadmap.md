# ts-time-utils DX & Documentation Roadmap

## Overview

Phased plan to improve developer experience and documentation. No backwards compatibility constraints - library has few users currently.

## Phase 1: Foundation

### 1A: Bundle Size Analysis
- [ ] Add `size-limit` to devDependencies
- [ ] Configure per-subpath size tracking (all 26 exports)
- [ ] Add CI job that fails on size regression
- [ ] Generate `docs/bundle-sizes.md` with breakdown table
- [ ] Add size badges to README

### 1B: Integration Guides
- [ ] Create `docs/guides/` directory
- [ ] `docs/guides/react.md` - hooks wrapper, form validation, relative time display
- [ ] `docs/guides/vue.md` - composables, reactive date handling
- [ ] `docs/guides/node.md` - Express middleware, scheduling patterns
- [ ] `docs/guides/angular.md` - pipes, services

---

## Phase 2: Documentation Completeness

### 2A: Edge Case Documentation
- [ ] Create `docs/edge-cases.md` covering:
  - Date parsing ambiguity (01/02/2025 format detection)
  - DST transitions (missing/duplicate hours)
  - Leap year handling (Feb 29 + 1 year)
  - Month overflow (Jan 31 + 1 month → Feb 28)
  - Timezone gotchas (UTC vs local)
  - Invalid date handling (null returns vs throws)
  - Floating point precision in durations

### 2B: Migration Guides
- [ ] `docs/migrate-from-date-fns.md` - function mapping table
- [ ] `docs/migrate-from-dayjs.md` - chain API equivalents
- [ ] `docs/migrate-from-moment.md` - deprecated patterns → modern

---

## Phase 3: Chain API

- [ ] Create `src/chain.ts` with fluent wrapper class
- [ ] Pattern: `chain(date).add(1, 'day').startOf('month').format('YYYY-MM-DD')`
- [ ] Methods delegate to existing pure functions (no duplication)
- [ ] Full TypeScript support with method chaining types
- [ ] Export as `ts-time-utils/chain` subpath
- [ ] Add `docs/guides/chain-api.md`
- [ ] Add tests in `test/chain.test.ts`

---

## Phase 4: Plugin System

### Architecture
- [ ] Create `src/plugins.ts` with registration mechanism
- [ ] Pattern: `extend(pluginName, pluginFn)` adds methods to chain API
- [ ] Plugin capabilities: new chain methods, custom formatters, locale extensions

### Plugin Interface
```ts
interface Plugin {
  name: string
  methods?: Record<string, Function>
  formatters?: Record<string, (date: Date, ...args: any[]) => string>
}
```

### Deliverables
- [ ] `src/plugins.ts` - core extension mechanism
- [ ] `docs/guides/plugins.md` - how to create plugins
- [ ] `examples/custom-plugin.ts` - example plugin
- [ ] Wrap existing modules as optional plugins (holidays, fiscal, cron)

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
