# Changelog

All notable changes to `ts-time-utils` are recorded here.

## Format

- Keep unreleased work at the top under `## [Unreleased]`.
- Use version headings in the form `## [vX.Y.Z] - YYYY-MM-DD`.
- Group entries under `Added`, `Changed`, `Fixed`, `Docs`, and `Security` when relevant.
- Call out any release-time checks or workflow changes that affect consumers.
- Pair each release entry with a matching note in `docs/releases/vX.Y.Z.md`.
- Verify `npm run release:verify` before tagging a release.

## [Unreleased]

### Docs

- Release notes and workflow alignment updates for the `v4.4.0` productization pass.

## [v4.2.0] - 2026-04-16

### Docs

- Added release hygiene documentation and maintenance scaffolding.
- Aligned README, contributing guidance, and update checklist with the current 32-module export surface.
- Documented the package-contract verification step now enforced by CI and publish workflows.

## [v4.3.0] - 2026-04-17

### Fixed

- Corrected timezone overlap handling for wrapped, mixed-day, and full-day working-window cases.
- Ensured recurrence generators include the configured `startDate` when collecting all occurrences.
- Narrowed the working-hours public contract to match the implemented local-clock semantics.

### Changed

- Added deterministic cross-module and built-package integration coverage for real consumer import paths.
- Tightened the public type surface by removing the unsupported `WorkingHoursConfig.timezone` field.

### Docs

- Clarified timezone edge-case semantics and the single-window overlap contract.

## [v4.4.0] - 2026-04-17

### Docs

- Refreshed framework guides and migration docs to use exported APIs only.
- Added module-selection guidance and a brief “when not to use this library” section to the README.
- Added versioned release notes for `v4.2.0`, `v4.3.0`, and `v4.4.0`.

### Changed

- Standardized CI and publish workflows around the shared `npm run release:verify` sequence.
