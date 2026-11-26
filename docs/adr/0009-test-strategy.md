# 0009 Test strategy

- Status: Accepted
- Date: 2026-11-24

## Context

The domain logic is intricate (parsing, duplicate rules, batch import) and the product is used
on phones, offline, in two languages. Tests must make changes safe, run fast, and exercise
the real browser where only a browser can answer.

## Decision

| Layer   | Tool                           | What it covers                                                               |
| ------- | ------------------------------ | ---------------------------------------------------------------------------- |
| core    | Vitest, written test first     | Parsers, rules and the batch import, using in-memory fakes of the interfaces |
| storage | Vitest with fake-indexeddb     | Real database code: atomic writes, ordering, migrations, quota errors        |
| engines | Vitest                         | Parsing and archive adapters on real score files                             |
| ui      | Vitest, Testing Library, jsdom | Components and flows found by role and label                                 |
| flows   | Playwright (Chromium)          | Import, reopen, rename, delete, duplicates, language, offline, timing        |

Rules:

- Tests are flat `test("describes behavior")` calls with no `describe` wrapper. A wrapper would be
  one function holding every test and would break the 25-line function limit; behavior groups are
  expressed by file names instead. Each test file stays under 200 lines.
- Test names describe behavior and never contain requirement, task or story identifiers.
- Unit and component tests sit beside their source; Playwright specs live in `e2e/`, page objects
  are named after screens, and sample score files live in `fixtures/`.
- Playwright runs against the production build served by `vite preview`, because the service
  worker only exists in a build. Projects: a Pixel 7 profile and desktop Chromium.
- Time limits are measured in Chromium with a 4x CPU throttle on the Pixel 7 profile. This is the
  stand-in for a mid-range Android phone; each limit is also confirmed once on a real Android
  phone through Chrome remote debugging.
- Accessibility is checked with Biome's accessibility rules, role and label queries, keyboard-only
  Playwright runs and a contrast test over the color tokens. Automated rule engines under
  licenses outside the allowed set are not used.

Dependencies and why they are not built in-house:

| Package                     | Version | Role                                                               | License    |
| --------------------------- | ------- | ------------------------------------------------------------------ | ---------- |
| @testing-library/react      | 16.3.3  | Render components and query them like a person would               | MIT        |
| @testing-library/user-event | 14.6.13 | Realistic keyboard and pointer interaction                         | MIT        |
| jsdom                       | 31.0.1  | DOM implementation for component tests                             | MIT        |
| fake-indexeddb              | 6.2.8   | IndexedDB in Node so the real storage code is tested               | Apache-2.0 |
| @playwright/test            | 1.65.1  | Real-browser flows, offline mode, CPU throttling, viewport changes | Apache-2.0 |

## Alternatives considered

- **Cypress**: no first-class offline and CPU throttling control comparable to Playwright's.
- **Mocking the database**: hides schema and transaction bugs that fake-indexeddb exposes.
- **Browser-mode unit tests only**: slower, and the core must run without a browser anyway.
- **happy-dom instead of jsdom**: faster, but less complete for the DOM behaviors the dialogs use.

## Consequences

- Every behavior has a place: core rules in fast tests, browser-only facts in Playwright.
- Flat tests mean more files but simpler files.
- The CPU throttle is a proxy, so a real-phone confirmation stays a manual step.
