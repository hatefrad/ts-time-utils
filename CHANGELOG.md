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

No unreleased changes.

## [v4.4.0] - 2026-04-17

### Fixed

- Corrected timezone overlap handling for wrapped, mixed-day, and full-day working-window cases.
- Ensured recurrence generators include the configured `startDate` when collecting all occurrences.
- Tightened the natural-language option surface to match the implemented parser behavior.
- Removed the unsupported `WorkingHoursConfig.timezone` contract from the public type surface.

### Changed

- Replaced hidden global plugin registration with an explicit module-level contract.
- Added deterministic cross-module and built-package integration coverage for real consumer import paths.
- Standardized CI and publish workflows around the shared `npm run release:verify` sequence.

### Docs

- Added release hygiene documentation and maintenance scaffolding.
- Aligned README, contributing guidance, and update checklist with the current 32-module export surface.
- Clarified timezone overlap semantics and consumer-facing working-hours expectations.
- Refreshed framework guides and migration docs to use exported APIs only.
- Added module-selection guidance and a brief “when not to use this library” section to the README.
- Added versioned release notes for `v4.2.0`, `v4.3.0`, and `v4.4.0`.
