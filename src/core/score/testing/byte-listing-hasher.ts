import type { ContentHasher } from "../content-hasher.ts";

/** A hasher whose "hash" is the byte values themselves: equal bytes give equal hashes. */
export class ByteListingHasher implements ContentHasher {
  async hash(bytes: Uint8Array): Promise<string> {
    return bytes.join("-");
  }
}
