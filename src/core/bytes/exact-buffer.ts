/** The bytes as an ArrayBuffer that holds nothing else, so it can be transferred between threads. */
export function exactBuffer(bytes: Uint8Array): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = bytes;
  if (buffer instanceof ArrayBuffer && byteOffset === 0 && byteLength === buffer.byteLength) {
    return buffer;
  }
  return bytes.slice().buffer;
}
