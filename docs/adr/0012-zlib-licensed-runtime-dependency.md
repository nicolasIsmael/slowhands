# 0012 Zlib-licensed runtime dependency

- Status: Accepted
- Date: 2026-11-24

## Context

Dependencies must be licensed MIT, BSD, Apache-2.0, ISC or LGPL, and the record on dependency
license exceptions covers only packages used while building or testing. The score renderer
(OpenSheetMusicDisplay) depends on `jszip`, which depends on `pako` 1.0.11, licensed
`MIT AND Zlib`. Unlike the earlier exceptions, `pako` is part of the bundle that reaches
people's devices.

## Decision

`pako` is accepted as a documented runtime exception. The zlib license is a short permissive
license approved by the Open Source Initiative, with conditions no stricter than those of the
BSD licenses: keep the notice, do not misrepresent the origin of the software. It has no
copyleft clause. The dependency cannot be avoided without dropping the renderer.

The license check lists the package in `tooling/checks/license-exceptions.json` with the exact
license `(MIT AND Zlib)`, so a change of license is flagged again.

## Alternatives considered

- **Replace the renderer**: far more work than the license difference justifies.
- **Remove `jszip` from the renderer's path by loading only unpacked scores**: the renderer
  would still bundle the code; the app already unpacks scores itself and hands over plain XML,
  but the package remains a dependency.
- **Widen the allowed list to every permissive license**: would admit future runtime
  dependencies without a decision.

## Consequences

- The attribution notice for `pako` must be kept in the distributed bundle and in any list of
  third-party notices the project publishes.
- Any other runtime dependency under a license outside the allowed set still needs its own
  record.
