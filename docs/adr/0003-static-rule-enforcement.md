# 0003 Static rule enforcement

- Status: Accepted
- Date: 2026-11-24

## Context

The project's size limits, layer boundaries and style rules only help if a tool enforces
them. Biome was probed with temporary files before this decision, so each rule below has been
seen to fire.

## Decision

Biome enforces, and `node --run check` runs:

- **File size**: `noExcessiveLinesPerFile` with 200 lines, an inclusive limit (200 passes, 201
  fails).
- **Function size**: `noExcessiveLinesPerFunction` with `maxLines` 23. Biome counts the body
  lines only, so with a one-line signature, 23 body lines plus the signature and the closing
  brace make the 25-line limit exactly. Blank and comment lines inside a body count; trailing
  ones after the last statement do not. Two gaps remain: a signature wrapped over several lines
  lets a function exceed 25 lines, and a component written as an expression-bodied arrow
  (`const A = () => (<div/>)`) is not measured at all. The first gap is covered by a convention
  (a function takes at most three parameters, otherwise one options object) and review. The
  second is closed by a small Biome plugin, `tooling/biome/no-expression-bodied-component.grit`,
  that rejects multi-line parenthesized arrow components.
- **Layers**: `noRestrictedImports` per folder. `src/core` may not import `@ui`, `@engines`,
  `@storage` (nor their relative equivalents) or any third-party package, and may not use
  `document`, `window`, `navigator`, `indexedDB`, `localStorage`, `fetch` or `crypto`. `engines`
  may not import `ui` or `storage`; `storage` may not import `ui` or `engines`. Test files in
  `core` may import the test runner.
- **Cycles**: `noImportCycles`.
- **Core compiles without browser or Node types**: `tsconfig.core.json` uses only the ES2023
  library and no ambient types.
- **Repository checks** (`tooling/checks`, TypeScript run directly by Node): file length for
  files Biome does not measure (JSON, CSS, Markdown), license allowlist, ADR index matching the
  records, and no references to the tooling that helped produce the code. The last check builds
  its patterns from fragments so that neither it nor its tests contain the forbidden text.
- **Commit messages**: `tooling/checks/verify-commit-message.ts` accepts Conventional Commits
  headers of at most 72 characters and rejects messages that contain tooling references. A
  committed hook, `.githooks/commit-msg`, runs it; `node --run hooks:install` activates it.

## Alternatives considered

- **dependency-cruiser** for layers: another dependency for a rule Biome already expresses.
- **ESLint import rules**: a second linter next to Biome.
- **A commit-message library**: adds dependencies for a rule a short script covers.
- **No mechanical enforcement**: rules drift as soon as the codebase grows.

## Consequences

- Breaking a layer rule or a size limit fails `check` before review.
- Wrapped signatures and a few style points still rely on review.
- Upgrading Biome may rename or move a rule; the configuration is the single place to adjust.
