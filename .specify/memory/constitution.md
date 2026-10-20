<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - III. Maintainability: "simplest design" now means one implementation per
    business rule, not HTML-string screens
- Added sections:
  - IV. Interface
- Removed sections: none
- Renamed sections: none
- Follow-up TODOs: none
- Migration: specs 001–004 are exempt from Principle IV until a later spec
  replaces one of those screens. Exemption ends for each screen when that
  replacement spec is adopted. New specs on or after 2026-10-20 follow
  Principle IV. React, Tailwind, and shadcn already in the project are the
  allowed client interface dependencies.
-->

# My Project Constitution

## Core Principles

### I. Code Quality

Production code MUST be consistent, reviewable, and free of duplicated business
rules. A change is compliant only when all of the following hold:

- Automated formatting and static analysis configured for this repository MUST
  pass before merge.
- Names of modules, functions, and types MUST state their responsibility.
  Abbreviations MUST be defined in the same file or in project documentation.
- A change MUST address one concern. Unrelated edits MUST be split so a reviewer
  can verify behavior from the diff and its tests.
- A business rule MUST have one implementation. Copying that rule into a second
  module is prohibited.
- A comment MUST explain a decision the code cannot express. Comments that
  restate the next line MUST NOT be added.

Rationale: Defects stay visible when every change is uniform, small enough to
review, and has a single source of truth.

### II. Testing

Every behavior change MUST be proven by automated tests. This principle is
non-negotiable.

- A feature or bug fix MUST include tests that assert the observable outcome.
  Tests MUST NOT assert private implementation details.
- A bug fix MUST add a regression test that fails on the unfixed behavior and
  passes after the fix.
- Unit tests MUST cover each public behavior, including error paths. Integration
  tests MUST cover every boundary where modules, services, or stored data meet.
- Tests MUST be deterministic. Time, network, and ordering MUST be explicit
  inputs when behavior depends on them.
- The automated suite MUST pass before merge. Deleting or skipping a failing
  test to force a pass is prohibited unless the guarded behavior is removed and
  the spec records that removal.

Rationale: Tests are the executable specification. A change that cannot fail a
test has not been shown to work.

### III. Maintainability

The codebase MUST stay simple enough that one behavior can change without a
rewrite of unrelated modules.

- Each module MUST have one reason to change. Cross-cutting concerns MUST sit
  behind a narrow interface.
- The implementation MUST use the simplest design that meets the current spec.
  Simplicity means each business rule has one implementation. It does not
  require the client to keep rendering screens as HTML strings. Extra
  complexity MUST be justified in the change description by the constraint that
  required it.
- A public interface MUST stay compatible within a version. A breaking change
  MUST bump the version and list every caller that must migrate.
- Dead code, unused dependencies, and decided feature flags MUST be removed in
  the change that makes them obsolete.
- A decision a later reader cannot recover from the code MUST be recorded beside
  the code or in the feature spec.

Rationale: Safe change depends on narrow modules, explicit breakage, and a
record of decisions the code itself cannot show.

### IV. Interface

Every screen a person can open MUST be described before it is built.

- The feature spec MUST state that screen's structure, where each control sits,
  what the empty state shows, and how the screen arranges itself on a narrow
  viewport.
- Naming a control without placing it MUST NOT satisfy this principle.
- A plan or task that builds a visible screen MUST cite this principle.

Rationale: A behavior spec that only checks whether a control exists does not
define a usable layout.

## Quality Constraints

- A dependency MUST be added only when the language standard library and
  existing project code cannot meet the requirement. The change description
  MUST name the dependency and the requirement it satisfies.
- The client interface MAY use the React, Tailwind, and shadcn dependencies
  already present in this project. A new client dependency still requires the
  justification above.
- The server MUST use the Node.js standard library unless a feature spec
  explicitly requires another dependency and names the requirement it satisfies.
- Generated files MUST be marked as generated and MUST NOT be edited by hand.
- Secrets, credentials, and environment-specific values MUST NOT be committed.
  Configuration MUST be injectable so tests run without production services.
- A failure MUST be returned to the caller with enough context to diagnose it.
  Swallowing an error is prohibited.

## Development Workflow

- Every change MUST be reviewed against these principles before merge. When a
  second reviewer is unavailable, the author MUST complete a written self-review
  that checks each principle above.
- Review MUST reject a change that lacks tests for a behavior change, fails
  static analysis, or adds complexity without the justification required by
  Principle III.
- The default branch MUST stay green. Formatting, static analysis, and the
  automated test suite MUST pass on every commit that lands there.
- A refactor that preserves behavior MUST keep existing tests passing and MUST
  NOT weaken their assertions.

## Governance

This constitution supersedes conflicting habits and informal conventions. Specs,
plans, and tasks MUST conform to these principles.

Amendment procedure:

- Any contributor MAY propose an amendment by editing this file and recording
  the change in a Sync Impact Report at the top of the file.
- The version MUST follow semantic versioning: MAJOR when a principle is
  removed or redefined, MINOR when a principle or section is added or materially
  expanded, PATCH when wording changes do not change obligations.
- An amendment is adopted when it is merged to the default branch. Last Amended
  MUST be that merge date in `YYYY-MM-DD`. Ratified MUST stay the original
  adoption date.
- An amendment that relaxes a MUST obligation MUST include a migration note
  listing in-flight work that is exempt and the date the exemption ends.
- Specs 001 through 004, and the screens they already describe, are exempt from
  Principle IV. The exemption for a screen ends when a later feature spec
  replaces that screen. A feature spec adopted on or after 2026-10-20 MUST
  follow Principle IV.

Compliance review:

- Review of a change MUST verify compliance with Core Principles before
  approval.
- A spec, plan, or task that imposes a quality, testing, maintainability, or
  interface constraint MUST name the principle it enforces.
- A violation found after merge MUST be fixed, or waived by an amendment.
  Silent exceptions are prohibited.

**Version**: 1.1.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-10-20
