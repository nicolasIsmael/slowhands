# SlowHands

[Leer en español](README.es.md)

SlowHands is a modern, open-source, local-first web app (PWA) that helps people practice
piano from their own MusicXML scores: split a piece into sections, practice each hand
separately, slow the tempo, loop, get finger suggestions and score a performance with a MIDI
keyboard or the microphone.

The first feature in this repository is the **song library and score viewer**: import
MusicXML files (`.musicxml`, `.xml`, `.mxl`), keep them on your device and read them on a
phone propped next to the piano, with or without internet.

## Principles

- **Local-first and private**: no accounts, no telemetry. Scores never leave your device.
- **Offline**: after the first visit everything works without a connection.
- **Mobile-first**: designed for a phone first (Android Chrome), scaled up to desktop.
- **English and Spanish**: the interface follows the device language and can be switched.

## Stack

TypeScript, React 19, Vite 8, Tailwind CSS 4, shadcn/ui, i18next, OpenSheetMusicDisplay, Dexie
(IndexedDB), vite-plugin-pwa, Vitest, Testing Library and Playwright. Each choice is recorded
in [docs/adr](docs/adr/README.md).

## Getting started

Requirements: Node.js 24 and pnpm 12.

```sh
pnpm install
pnpm hooks:install   # enable the commit-message check
pnpm dev             # start the dev server
```

| Command | What it does |
|---------|--------------|
| `pnpm check` | Type check, lint, repository checks and unit tests; run before every commit |
| `pnpm test` | Unit and component tests |
| `pnpm build && pnpm test:e2e` | Production build and the browser flows |

## Folder structure

```text
src/
  core/       pure domain code: no DOM, no React, no third-party packages, no UI text
    score/  library/  import/  viewer/  settings/  app/
    time/  identity/  reactive/  bytes/    (small interfaces and helpers)
  engines/    adapters that implement core interfaces (parsing, rendering, workers, browser)
    score-parsing/  score-worker/  osmd-renderer/  browser-files/  browser-platform/
  storage/    database, schema, migrations and repositories
    database/  library/  settings/
  ui/         React components, screens, translations and the composition root
    app/  library/  import/  viewer/  settings/  pwa/  i18n/  primitives/  styling/  testing/
e2e/          browser tests: flows/ and page objects in pages/
fixtures/     sample score files used by tests (written for this project, MIT like the code)
public/       icons of the installable app
docs/adr/     architecture decision records and their index
tooling/      repository checks and lint plugin
```

Dependencies point one way: `ui` to `engines` and `storage`, and those to `core`. `engines`
and `storage` never import each other. Lint enforces this.

## Rules in brief

- Files stay within 200 lines and functions within 25 lines; split instead of exceeding.
- Modules are named after what they do; there are no "utils" or "helpers" folders.
- Core code has tests, written first; user flows are covered by browser tests.
- Every significant decision gets an architecture decision record; new dependencies are
  justified in writing and must use permissive licenses (MIT, BSD, Apache-2.0, ISC) or LGPL.
- Commits follow Conventional Commits, in English.

## Hosting and offline use

The app is a static site, so any static host works, as long as it serves the site over HTTPS
(service workers and persistent storage need it; `localhost` is exempt).

- Serve `index.html` and `sw.js` with `Cache-Control: no-cache`, so a new version is noticed.
  Files under `assets/` have hashed names and can be cached for a long time.
- The first visit must be online. After it, the app and every imported song work with no
  connection. Songs live in the browser's storage on the device and nothing is sent anywhere.
- On Android Chrome the app can be installed from its "Install app" button, or from the browser
  menu, and then opens like any other app, at the song list.
- A new version is offered with an "Update now" button and is never applied during an import.
- Offline behavior only exists in the production build: use `node --run build` and
  `node --run preview`, not the development server.

## Release checklist

Before the first publicly reachable deployment or published release, project export and
import must exist.
