# Contributing

Thanks for your interest in contributing to ts-time-utils!

## Quick Start

```bash
git clone https://github.com/hatefrad/ts-time-utils.git
cd ts-time-utils
npm install
npm test
```

## Submitting Changes

1. Fork the repo
2. Create a feature branch (`git checkout -b fix/issue-description`)
3. Make your changes
4. Ensure tests pass (`npm test`) and lint is clean (`npm run lint`)
5. Commit with a clear message
6. Open a PR against `main`

## Code Guidelines

- **Zero dependencies** - don't add external packages
- **Write tests** - add/update tests in `test/` for your changes
- **TypeScript strict** - no `any` unless unavoidable
- **Pure functions** - prefer stateless, side-effect-free functions
- **Tree-shakeable** - export from appropriate module files

## Adding New Functions

1. Add function to the appropriate `src/*.ts` module
2. Export from `src/index.ts`
3. Add tests in `test/*.test.ts`
4. Update README if adding new category or significant feature

## Project Structure

```
src/
  index.ts        # Main entry, re-exports all modules
  format.ts       # Duration/date formatting
  calculate.ts    # Date arithmetic
  validate.ts     # Validation utilities
  ...             # Other modules by category
test/
  *.test.ts       # Tests mirror src/ structure
```

## Running Tests

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run lint       # Check linting
npm run build      # Build CJS + ESM
```

## Questions?

Open an issue for discussion before large changes.
