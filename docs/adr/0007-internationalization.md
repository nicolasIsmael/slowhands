# 0007 Internationalization

- Status: Accepted
- Date: 2026-11-24

## Context

The interface must be offered in English and Spanish. It follows the device language by
default, the person can switch manually, and the manual choice persists. The core domain never
contains user-facing text: it returns typed codes that the interface translates. Messages
need interpolation and plurals, and the app must work offline.

## Decision

- **Library**: i18next 27.2.7 and react-i18next 18.0.3 (both MIT). Plural rules, interpolation
  and a typed key API are needed; rebuilding that is not worth it, and `Intl.PluralRules`
  already supplies the plural categories i18next uses.
- **Catalogs** are JSON files bundled with the app, one file per feature and language under
  `src/ui/i18n/locales/<language>/<namespace>.json`, each under 200 lines. Both languages are
  bundled, so switching needs no network. Keys are lower camel case:
  `<namespace>:<area>.<element>[.<variant>]`. Plural keys use the `_one` and `_other` suffixes,
  plus `_many` in Spanish.
- **Initialization is synchronous** with the bundled resources, and key types come from the
  English catalogs, so an unknown key does not compile.
- **Codes to messages**: core codes (for example import failures) are mapped to message keys by
  exhaustive typed records in the interface layer; a missing mapping does not compile.
- **Detection** is a few lines of our own core code, not a plugin: the first device language
  whose base language is supported wins, otherwise English. A saved choice overrides it.
- **Persistence** is the `language` row in the settings table of the database.
- **No wrong-language flash**: the first render waits until the saved language has been read
  from the database (a single small row), with a safety timeout of 1.5 seconds after which the
  device language is used. The splash screen in `index.html` contains no text.
- **The document's `lang` attribute** is set before the first render and on every change.
- **Automated check**: a test fails when a key exists in only one language, when placeholders
  differ, when a value is empty, or when a plural key lacks a category the locale requires
  (Spanish needs `many`).

## Alternatives considered

- **A browser language-detector plugin**: it reads `localStorage` as well; the settings table is
  the single store and the device language is one line of code.
- **Rendering first and switching when the saved language loads**: a visible flash of the wrong
  language.
- **Mirroring the choice in `localStorage` for an instant read**: a second source of truth.
- **Loading catalogs lazily**: saves a few kilobytes but complicates offline use.

## Consequences

- Adding a language means adding a catalog folder and one entry to the supported list.
- Every new message needs an entry in both languages, or the test fails.
- Manifest metadata (name) is language neutral, because it cannot follow the in-app choice.
