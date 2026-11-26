import { type FilePayload, fixturePayload } from "./fixture-payload.ts";
import { oversizedScore } from "./generated-scores.ts";

export interface UnusableFile {
  file: () => FilePayload;
  english: string;
  spanish: string;
}

const UNSUPPORTED = [
  "This file type is not supported yet",
  "Este tipo de archivo aún no es compatible",
] as const;
const DAMAGED = [
  "The file is damaged or incomplete",
  "El archivo está dañado o incompleto",
] as const;

export const UNUSABLE_FILES: UnusableFile[] = [
  {
    file: () => fixturePayload("invalid/empty.musicxml"),
    english: "The file is empty",
    spanish: "El archivo está vacío",
  },
  {
    file: () => fixturePayload("invalid/truncated.musicxml"),
    english: DAMAGED[0],
    spanish: DAMAGED[1],
  },
  {
    file: () => fixturePayload("invalid/plain-text.xml"),
    english: DAMAGED[0],
    spanish: DAMAGED[1],
  },
  {
    file: () => fixturePayload("invalid/wrong-root.xml"),
    english: "This is not a MusicXML score",
    spanish: "Esto no es una partitura MusicXML",
  },
  {
    file: () => fixturePayload("invalid/corrupt-archive.mxl"),
    english: "The compressed file is damaged",
    spanish: "El archivo comprimido está dañado",
  },
  {
    file: () => fixturePayload("invalid/archive-without-score.mxl"),
    english: "No score was found inside the compressed file",
    spanish: "No se encontró ninguna partitura dentro del archivo comprimido",
  },
  {
    file: () => fixturePayload("unsupported/score.pdf"),
    english: UNSUPPORTED[0],
    spanish: UNSUPPORTED[1],
  },
  {
    file: () => fixturePayload("unsupported/cover.png"),
    english: UNSUPPORTED[0],
    spanish: UNSUPPORTED[1],
  },
  {
    file: () => fixturePayload("unsupported/tune.mid"),
    english: UNSUPPORTED[0],
    spanish: UNSUPPORTED[1],
  },
  {
    file: () => fixturePayload("unsupported/song.mp3"),
    english: UNSUPPORTED[0],
    spanish: UNSUPPORTED[1],
  },
  {
    file: oversizedScore,
    english: "The file is too large",
    spanish: "El archivo es demasiado grande",
  },
];
