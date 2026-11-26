# 0004 Score renderer abstraction

- Status: Accepted
- Date: 2026-11-24

## Context

Scores are drawn with OpenSheetMusicDisplay (OSMD), a library that engraves MusicXML into SVG.
Later features (sound, a cursor, hand colors) will depend on the drawing engine, and the
renderer, the audio engine and the performance analyzer must be swappable. OSMD needs the DOM,
so it cannot live in the core.

## Decision

- The core defines an interface, `ScoreRenderer<Surface>`, that shows a score in a surface,
  re-fits it to the surface width, sets a zoom factor and releases its resources. `Surface` is a
  type parameter, so the core never names a DOM type. It also defines the report the renderer
  returns (rendered or failed, plus notices).
- OSMD 2.3.1 (BSD-3-Clause) lives only in `src/engines/osmd-renderer`, behind that interface.
  Version 3.0.0 appeared days before this decision and is a later, separate upgrade.
  OSMD brings `jszip` (MIT OR GPL, used under MIT) and `vexflow` (MIT) as dependencies.
- The renderer receives the score as XML bytes. Unpacking a compressed `.mxl` happens before,
  in a worker, so the main thread only decodes text and draws.
- OSMD is used with `autoResize: false`, the SVG backend and the title shown. Fit to width is
  done by us: when the container width changes we call `render()` again, and the SVG takes the
  container width. Zoom is the `zoom` property followed by `render()`, bounded to 0.5 to 3.0.
- Native page zoom is never disabled.
- The library is loaded on demand the first time a score is shown, and preloaded while the app is
  idle after start, which keeps the first screen light: the main bundle is about 470 KB (150 KB
  compressed) and the library is a separate 1.4 MB chunk.

Findings from a spike (Chromium, Pixel 7 viewport, container 360 px wide, grand-staff piano
score, load plus render):

| Score                | No throttle | CPU throttled 4x |
| -------------------- | ----------- | ---------------- |
| 8 measures           | 0.11 s      | 0.16 s           |
| 100 measures         | 0.28 s      | 1.0 s            |
| 300 measures         | 0.43 s      | 3.0 s            |
| 800 measures         | 0.87 s      | 9.0 s            |
| 10 parts, 8 measures | 0.06 s      | 0.52 s           |

- The whole score is one SVG with about 52 DOM nodes per measure (5 k for 100 measures, 42 k for
  800), so memory grows with length.
- Re-fit at 100 measures under the 4x throttle takes 0.7 s (wider) to 1.0 s (narrower), and a
  zoom change 1.2 to 1.6 s, because each is a full re-render. A re-fit within one second is
  therefore tight on slow phones for long scores.
- **OSMD does not report notation it cannot draw.** Figured bass, harp pedal diagrams, accordion
  registers, scordatura, staff dividers, SMuFL symbols, percussion pictograms and
  `other-direction` load with no message and leave the render unchanged; words and chord symbols
  do change it. Invalid values (for example a note step that does not exist) throw during load.
- **Consequence for the "some symbols are not displayed" notice**: detection cannot come from the
  renderer. The core scans the score for a curated list of the elements above while it prepares
  the view and passes the notices on. The list covers known cases, not every possibility, so the
  notice says some symbols _may_ not be displayed. It is extended whenever a new case is found.
- A load or render exception is reported as a rendering failure; the interface explains it.
- Measured in the finished app (production build, Pixel 7 profile, 4x CPU throttle, a 100-measure
  score, from choosing the file to the score on screen): median 3.5 s over several runs, with
  the first, cold import between 4.6 and 9 s on a noisy machine. Of that, reading and unpacking take
  under 0.1 s and drawing takes the rest, so the drawing library dominates and its options (title,
  measure numbers, compact layout) change little. A real mid-range phone must confirm the figure;
  drawing a first screenful before the rest is the fallback if it does not.

## Alternatives considered

- **VexFlow directly**: lower level; we would write the layout engine OSMD already provides.
- **Verovio**: a capable engraver under LGPL, which is allowed, but much larger and not the
  baseline choice.
- **OSMD 3.0.0**: too new to know its breaking changes.
- **Reading OSMD logs for unsupported notation**: the spike shows it logs nothing.

## Consequences

- Swapping the engine means writing another adapter for one interface.
- Long scores are slow on phones: a loading state is shown before heavy work, and drawing by
  measure ranges is the fallback if real devices need it.
- The undrawable-notation list is a maintenance item, kept in one file in the core.
