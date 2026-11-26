# 0002 Layered structure

- Status: Accepted
- Date: 2026-11-24

## Context

The app will grow with sound, MIDI and scoring features. Rendering, audio, storage and
analysis must be replaceable, and a newcomer must be able to guess where any file lives.

## Decision

One package, with one folder per layer under `src/`, and feature folders inside each layer:

- `core`: pure TypeScript domain (classes and interfaces). It imports nothing from the other
  layers and no third-party package, and uses no DOM, React or browser API. It never contains
  user-facing text: it returns typed codes.
- `engines`: adapters to the outside world (renderer, parsing libraries, workers, browser
  platform). They implement interfaces defined in `core`.
- `storage`: the database, its schema and migrations, and repositories that implement
  interfaces defined in `core`.
- `ui`: React components, hooks, screens, translations and the composition root that wires
  engines and storage to the core interfaces.

Dependencies point one way: `ui` to `engines` and `storage`, and those to `core`. `engines`
and `storage` never import each other. Cross-layer imports use the aliases `@core`,
`@engines`, `@storage` and `@ui`. Small unit and component tests sit beside their source;
end-to-end tests, test data and tooling live outside `src`.

## Alternatives considered

- **Folders by feature only**: layers blur and the domain starts depending on the browser.
- **A multi-package workspace**: stronger isolation, but more configuration than a project of
  this size needs; the import rules below give the same guarantee.
- **Shared "utils" or "common" folders**: rejected, they become dumping grounds; every module
  is named after what it does.

## Consequences

- The layer rule is enforced mechanically by lint configuration (see the record on static rule
  enforcement), not by convention.
- New code needs an interface in `core` before an adapter exists, which adds a little
  ceremony and makes every adapter swappable and testable.
- The folder tree is documented in both README files and updated whenever it changes.
