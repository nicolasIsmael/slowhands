export type View = { readonly name: "list" } | { readonly name: "viewer"; readonly songId: string };

export const LIST_VIEW: View = { name: "list" };

export function viewFromHistoryState(state: unknown): View {
  if (typeof state === "object" && state !== null) {
    const candidate = state as { name?: unknown; songId?: unknown };
    if (candidate.name === "viewer" && typeof candidate.songId === "string") {
      return { name: "viewer", songId: candidate.songId };
    }
  }
  return LIST_VIEW;
}
