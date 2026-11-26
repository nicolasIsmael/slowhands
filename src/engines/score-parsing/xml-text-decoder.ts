const CHUNK_CHARACTERS = 64 * 1024;
const DECLARATION_BYTES = 200;

function encodingFromByteOrderMark(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return "utf-16le";
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return "utf-16be";
  }
  return bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? "utf-8" : null;
}

function declaredEncoding(bytes: Uint8Array): string | null {
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, DECLARATION_BYTES));
  return /<\?xml[^>]*encoding\s*=\s*["']([\w.:-]+)["']/i.exec(head)?.[1] ?? null;
}

function decoderFor(bytes: Uint8Array): TextDecoder {
  const label = encodingFromByteOrderMark(bytes) ?? declaredEncoding(bytes) ?? "utf-8";
  try {
    return new TextDecoder(label);
  } catch {
    return new TextDecoder("utf-8");
  }
}

/** Decodes an XML document the way its byte-order mark or declaration says, a piece at a time. */
export function* decodeXmlInPieces(bytes: Uint8Array): Generator<string> {
  const decoder = decoderFor(bytes);
  const pieceBytes = CHUNK_CHARACTERS;
  for (let start = 0; start < bytes.length; start += pieceBytes) {
    yield decoder.decode(bytes.subarray(start, start + pieceBytes), { stream: true });
  }
  yield decoder.decode();
}

export function decodeXmlText(bytes: Uint8Array): string {
  return [...decodeXmlInPieces(bytes)].join("");
}
