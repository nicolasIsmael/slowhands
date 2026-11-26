import type { ScoreNotice } from "./score-notice.ts";
import type { XmlEvent } from "./xml-event-source.ts";

/**
 * MusicXML elements the score renderer is known not to draw. The renderer reports nothing for
 * them, so they are found by scanning the score. Extend the list when a new case is found.
 */
const UNDRAWABLE_ELEMENTS = new Set([
  "figured-bass",
  "harp-pedals",
  "accordion-registration",
  "scordatura",
  "staff-divide",
  "symbol",
  "percussion",
  "other-direction",
]);

export class UndrawableNotationScanner {
  scan(events: Iterable<XmlEvent>): ScoreNotice[] {
    for (const event of events) {
      if (event.type === "start" && UNDRAWABLE_ELEMENTS.has(event.name)) {
        return ["some-symbols-not-displayed"];
      }
    }
    return [];
  }
}
