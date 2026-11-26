# 0008 PWA, offline use and updates

- Status: Proposed
- Date: 2026-11-24

## Context

The app promises that every imported song can be listed, opened and read with no connection,
that importing also works offline, and that it can be installed on a phone. Nothing may leave the
device, and an application update must never put the person's library at risk or interrupt an
import that is saving songs.

Service workers need HTTPS (`localhost` is exempt) and a production build, so offline behavior
cannot be exercised by the development server.

## Decision

- **vite-plugin-pwa 1.3.0** (MIT) generates the service worker with Workbox's `generateSW`.
  Version 2.0.0 exists; moving to it is a later, separate upgrade, like OSMD 3. `workbox-window`
  7.4.1 (MIT) is the small browser-side helper the plugin uses to register the worker and to learn
  that a new one is waiting.
- **Precache only.** Every file of the build is precached, including the score worker chunk and
  the drawing library chunk. There is no runtime caching, because the app makes no network
  requests of its own. Navigations fall back to `index.html`, and `cleanupOutdatedCaches` removes
  the files of older versions.
- **Updates are offered, never forced.** The worker is registered with `registerType: 'prompt'`.
  When a new version is waiting, a small "update available" action appears. Applying it is
  disabled while an import is running, because reloading then could stop a batch between files.
  Applying it activates the waiting worker and reloads the page.
- **Library data is outside the cache.** Songs live in IndexedDB, never in Cache Storage, so
  updating or discarding the worker cannot lose them. The database connection closes itself when
  another tab upgrades the schema (`versionchange`), and the app asks that tab's person to reload.
- **Start URL.** The manifest has `start_url` and `scope` set to `/`, `display` `standalone` and
  `orientation` `any`, with 192 px, 512 px and maskable 512 px icons. Launching the app always
  shows the song list, as the first screen does in a normal tab.
- **Install.** Where the browser raises `beforeinstallprompt` (Chrome on Android), the app keeps
  the event and shows an install button; elsewhere nothing is shown.
- **Hosting.** Any static HTTPS host works. `index.html` and the service worker file must be
  served with `Cache-Control: no-cache` so a new version is noticed; hashed assets can be cached
  for a long time.

Offline behavior is tested against the production build (`vite preview`): wait until the worker
controls the page, import, go offline, reload, open every song and import a new file. Whether the
browser offers installation cannot be raised from Playwright, so a unit test checks the manifest
fields and a manual check on a real Android phone confirms installation and launch.

## Alternatives considered

- **`autoUpdate`**: reloads the page as soon as a new worker is ready, which can interrupt an
  import and break the rule that no song is ever half saved.
- **`injectManifest` with a hand-written worker**: more code and more to test, with no need yet.
- **Runtime caching of scores**: the scores already live in IndexedDB; a second copy would only
  add a place where data can go stale.
- **Hand-written manifest and worker**: more moving parts than a maintained plugin for the same
  result.

## Consequences

- The first visit must be online and complete before offline use is possible; the app does not
  claim to be offline-ready earlier than that.
- A person with the app open in two tabs may be asked to reload after an update. Their library is
  never changed by that.
- The production bundle is precached in full, so the first visit downloads the drawing library
  even for a person who has not opened a score yet. The library is already loaded while idle, so
  the offline promise holds from the first reload.
- This record stays Proposed until installation has been checked on a real phone, then it is
  Accepted.
