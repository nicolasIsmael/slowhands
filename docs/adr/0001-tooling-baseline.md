# 0001 Tooling baseline

- Status: Accepted
- Date: 2026-11-24

## Context

SlowHands is a single-package web app written in TypeScript. It needs a reproducible
toolchain for building, testing and linting, one that works the same on every
contributor's machine and keeps the code readable and small.

## Decision

| Tool                            | Version                             | Problem it solves                                                                                                             | License           |
| ------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Node.js                         | 24 LTS (`engines`, `.node-version`) | Runtime for build, test and tooling scripts. It runs TypeScript scripts directly, so no extra runner is needed.               | MIT               |
| pnpm                            | 12.23.0 (`packageManager`)          | Package manager with a lockfile and strict `node_modules`, which stops accidental use of undeclared packages.                 | MIT               |
| TypeScript                      | 7.0.2                               | Strict static typing with the native compiler (`tsc` only, no legacy compiler).                                               | Apache-2.0        |
| Vite                            | 8.3.8                               | Dev server and production bundler, including workers.                                                                         | MIT               |
| @vitejs/plugin-react            | 6.3.0                               | React transform for Vite.                                                                                                     | MIT               |
| React, React DOM                | 19.3.1                              | UI library; functional components and hooks only.                                                                             | MIT               |
| Tailwind CSS, @tailwindcss/vite | 4.3.5                               | Utility styling with CSS-first configuration.                                                                                 | MIT               |
| shadcn (CLI)                    | 4.23.0                              | Copies accessible UI primitives into the repository, so they are owned code, not a runtime dependency.                        | MIT               |
| Vitest                          | 5.1.1                               | Unit and integration test runner on top of Vite.                                                                              | MIT               |
| Biome                           | 2.6.9                               | One tool for linting and formatting, including the size, import-boundary and accessibility rules described in a later record. | MIT OR Apache-2.0 |

Versions are pinned exactly in `package.json`. Building any of these in-house would cost far
more than adopting them; each is widely maintained. Test libraries, internationalization,
storage, parsing and PWA packages are justified in their own records.

## Alternatives considered

- **npm or Yarn**: no strict dependency isolation by default.
- **Jest**: needs a separate transform pipeline next to Vite.
- **ESLint plus Prettier**: two tools and plugins to reach what Biome does in one.
- **Webpack or Parcel**: slower and heavier than Vite for this project.

## Consequences

- Contributors need Node 24 and pnpm 12; both are declared in the repository.
- TypeScript 7 and Biome 2.6 are recent: if an incompatibility with Vite or Vitest appears, the
  workaround is recorded here under Notes.
- Upgrading a major version of any tool is a deliberate change with its own commit.

## Notes

None yet.
