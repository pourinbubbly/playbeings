// Browser-compatible Buffer polyfill
const BrowserBuffer = {
  alloc(size: number): Uint8Array {
    return new Uint8Array(size);
  },

  from(data: string | number[] | Uint8Array | ArrayBuffer, encoding?: string): Uint8Array {
    if (typeof data === "string") {
      const encoder = new TextEncoder();
      if (encoding === "utf-8" || !encoding) {
        return encoder.encode(data);
      }
      if (encoding === "hex") {
        const bytes = new Uint8Array(data.length / 2);
        for (let i = 0; i < data.length; i += 2) {
          bytes[i / 2] = parseInt(data.substr(i, 2), 16);
        }
        return bytes;
      }
      return encoder.encode(data);
    }
    if (Array.isArray(data)) {
      return new Uint8Array(data);
    }
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    return data;
  },
};

// Make Buffer available globally for Solana libraries
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Buffer = BrowserBuffer;
  
  // Polyfill process for Solana libraries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(window as any).process) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).process = { env: {} };
  }
  
  // Make it available on globalThis as well
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(globalThis as any).Buffer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Buffer = BrowserBuffer;
  }
}

export {};
