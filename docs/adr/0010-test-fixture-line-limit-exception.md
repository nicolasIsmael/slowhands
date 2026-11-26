# 0010 Test fixture line-limit exception

- Status: Accepted
- Date: 2026-11-24

## Context

Files in this repository do not exceed 200 lines. Realistic MusicXML is verbose: even a short
piece needs more than 200 lines when pretty-printed, and the tests need real score files,
including a long one for performance checks and some deliberately broken ones.

## Decision

Sample score files under `fixtures/scores/` are test data, not code, and are exempt from the
200-line limit. Everything else keeps the limit: tests, page objects, tooling and any script that
reads the fixtures.

- Fixtures are committed as real files so tests exercise the same bytes a person would import.
- Every fixture is written for this project; none contains third-party music. Their origin and
  how the binary ones were produced is recorded in `fixtures/README.md`.
- Individual fixtures stay small (the long-score fixture is under about 1 MB). A file larger
  than the import limit, which would bloat the repository, is built in memory by the test that
  needs it instead of being committed.
- The repository line-length check and the lint configuration skip `fixtures/scores/`.

## Alternatives considered

- **Generating every fixture from code at test time**: complies without an exception, but tests
  would no longer use files shaped like real scores, and the builders become a second
  MusicXML writer to maintain.
- **Minifying fixtures onto one line**: passes the limit but makes them unreadable.

## Consequences

- Reviewers can open a fixture as an ordinary file.
- The exemption is narrow: a long file anywhere else still fails the check.
