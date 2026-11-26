import type { IdGenerator } from "@core/identity/id-generator.ts";

export class WebCryptoIdGenerator implements IdGenerator {
  next(): string {
    return crypto.randomUUID();
  }
}
