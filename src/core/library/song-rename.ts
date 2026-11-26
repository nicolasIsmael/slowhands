export const MAX_SONG_NAME_LENGTH = 200;

/**
 * The name to store for a rename, or `null` when the person typed nothing worth saving. Names
 * are trimmed and cut at a limit counted in whole characters.
 */
export function normalizeSongName(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") {
    return null;
  }
  return Array.from(trimmed).slice(0, MAX_SONG_NAME_LENGTH).join("").trimEnd();
}
