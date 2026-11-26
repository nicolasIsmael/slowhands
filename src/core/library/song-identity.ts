export interface IdentityInput {
  readonly title: string | null;
  readonly composer: string | null;
  readonly fileName: string;
}

const normalize = (text: string): string =>
  text.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();

/**
 * The key two songs share when they are "the same piece": title and composer when both are
 * known, otherwise the file name.
 */
export function identityKeyFor({ title, composer, fileName }: IdentityInput): string {
  if (title !== null && composer !== null) {
    return `score:${normalize(title)}\u0000${normalize(composer)}`;
  }
  return `file:${normalize(fileName)}`;
}
