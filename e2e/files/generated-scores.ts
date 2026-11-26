import { MAX_SCORE_FILE_BYTES } from "../../src/core/score/limits.ts";
import { type FilePayload, fixturePayload } from "./fixture-payload.ts";

const MEASURE = /^ {4}<measure number="\d+">[\s\S]*?^ {4}<\/measure>\n/gm;

/** A file one byte over the import limit, built in memory instead of being committed. */
export function oversizedScore(): FilePayload {
  return {
    name: "too-large.musicxml",
    mimeType: "",
    buffer: Buffer.alloc(MAX_SCORE_FILE_BYTES + 1, 0x20),
  };
}

/** The long sample score cut down (or repeated) to exactly `count` measures, under its own title. */
export function scoreWithMeasures(
  count: number,
  name = `${count}-measures.musicxml`,
  title = "Long Study",
): FilePayload {
  const original = fixturePayload("long-score.musicxml").buffer.toString("utf8");
  const source = original.replace(
    "<work-title>Long Study</work-title>",
    `<work-title>${title}</work-title>`,
  );
  const blocks = source.match(MEASURE) ?? [];
  const numbered = Array.from({ length: count }, (_, index) =>
    (blocks[index % blocks.length] ?? "").replace(/number="\d+"/, `number="${index + 1}"`),
  );
  const start = source.indexOf(blocks[0] ?? "");
  const end = source.lastIndexOf("  </part>");
  return {
    name,
    mimeType: "",
    buffer: Buffer.from(source.slice(0, start) + numbered.join("") + source.slice(end)),
  };
}

/** A score of about `bytes` that stops in the middle, so it can only be recognized as damaged by reading it all. */
export function truncatedScore(bytes: number, name = "cut-off.musicxml"): FilePayload {
  const head = scoreWithMeasures(1).buffer.toString("utf8");
  const opening = head.slice(0, head.indexOf("</measure>") + "</measure>\n".length);
  const repeated = opening.slice(opening.indexOf("<measure"));
  const body = repeated.repeat(Math.ceil(bytes / repeated.length));
  return {
    name,
    mimeType: "",
    buffer: Buffer.from(opening.slice(0, opening.indexOf("<measure")) + body.slice(0, bytes)),
  };
}
