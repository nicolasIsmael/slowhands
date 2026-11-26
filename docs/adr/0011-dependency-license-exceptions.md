# 0011 Dependency license exceptions

- Status: Accepted
- Date: 2026-11-24

## Context

Dependencies must be licensed MIT, BSD, Apache-2.0, ISC or LGPL, and never GPL or AGPL. A
check reads the license of every installed package. Besides the packages we chose, build tools
pull in transitive packages under other licenses. All of the ones below are used only while
building or testing; none is bundled into the app that ships to people's devices.

| Package                                                                       | License       | Why it is present                                                                                      | Why it is acceptable                                                                                                                |
| ----------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| minimatch, lru-cache, isexe, graceful-fs                                      | BlueOak-1.0.0 | Transitive dependencies of build and test tools                                                        | A permissive license with terms comparable to MIT and ISC                                                                           |
| glob, jackspeak, minipass, path-scurry, package-json-from-dist, @isaacs/cliui | BlueOak-1.0.0 | Transitive dependencies of the service worker generator (vite-plugin-pwa through Workbox's build tool) | The same permissive license as above; used only while building, never shipped to devices                                            |
| caniuse-lite                                                                  | CC-BY-4.0     | Browser-support data read by the CSS and build tooling                                                 | Data, not code; only requires attribution, which the package carries                                                                |
| lightningcss and its per-platform binaries                                    | MPL-2.0       | CSS processing inside Tailwind CSS 4, which has no alternative engine                                  | File-level copyleft that only applies if we modify and distribute its files; it is a build tool and is not distributed with the app |

## Decision

These packages are accepted as documented exceptions. The license check reads an explicit
list, `tooling/checks/license-exceptions.json`, where each entry names the package pattern,
the exact license and the reason. A package is only excused while its license matches the
listed one, so a change of license is flagged again. Anything not listed still fails the
check, and GPL and AGPL are never excusable.

## Alternatives considered

- **Widen the allowed list to BlueOak and MPL-2.0 for everything**: would also admit future
  runtime dependencies under those licenses without a decision.
- **Drop Tailwind CSS**: loses the styling system the project is built on, only to avoid a
  build-time MPL-2.0 binary.
- **Leave the check failing**: a permanently red check hides real problems.

## Consequences

- Adding a runtime dependency under a license outside the allowed set still needs its own decision.
- Upgrading tools may bring new transitive licenses; the check names them and this record is
  extended in a new commit.
