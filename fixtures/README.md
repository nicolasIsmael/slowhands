# Sample score files

Files used by the tests. Every file was written for this project; none contains third-party
music. They are test data, covered by the project's MIT license, and are exempt from the 200-line limit (see the decision record on
test fixture exceptions in `docs/adr`); code that reads them is not.

## Well-formed scores (`scores/`)

| File                            | What it covers                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `piano-grand-staff.musicxml`    | One piano part on two staves, 8 measures, with title and composer                           |
| `piano-grand-staff.mxl`         | The same score as a compressed `.mxl` archive                                               |
| `single-staff.musicxml`         | One part on one staff, 8 measures                                                           |
| `two-parts.musicxml`            | Two parts (violin and cello)                                                                |
| `orchestral.musicxml`           | Ten parts with treble, bass and alto clefs                                                  |
| `extension-xml.xml`             | A score with the plain `.xml` extension                                                     |
| `no-title-no-composer.musicxml` | No title and no composer, so the file name is used                                          |
| `Café ñandú 🎹.musicxml`        | Accents, non-Latin characters and an emoji in the file name, title and composer             |
| `unsupported-notation.musicxml` | A valid score containing figured bass and harp pedal diagrams, which the viewer cannot draw |
| `long-score.musicxml`           | 300 measures on a grand staff, for timing checks                                            |

## Files that must be rejected (`scores/invalid/`)

| File                        | Why it is rejected                                        |
| --------------------------- | --------------------------------------------------------- |
| `empty.musicxml`            | Zero bytes                                                |
| `truncated.musicxml`        | A score cut off in the middle of a measure                |
| `plain-text.xml`            | Plain text under an XML extension                         |
| `wrong-root.xml`            | Well-formed XML that is not a score                       |
| `corrupt-archive.mxl`       | Starts like a ZIP archive but has no directory            |
| `archive-without-score.mxl` | A valid archive whose container points to a missing score |

## Unsupported types (`scores/unsupported/`)

Tiny files with the real signature of a PDF, a PNG image, a MIDI file and an MP3 file. They check
the "not supported yet" answer.

## How the files were produced

The text scores were generated once with a throwaway script that writes standard MusicXML
(four quarter notes in the upper staff and a whole note in the lower staff per measure). The
archives were assembled with the standard ZIP layout: `piano-grand-staff.mxl` holds
`META-INF/container.xml` and `piano-grand-staff.musicxml`. A file larger than the import limit is
built in memory by the test that needs it and is not stored here.
