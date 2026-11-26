import type { ContentHasher } from "@core/score/content-hasher.ts";

export class WebCryptoContentHasher implements ContentHasher {
  async hash(bytes: Uint8Array): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }
}
