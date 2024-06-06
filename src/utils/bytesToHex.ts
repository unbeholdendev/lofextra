function isBytes(a: unknown): a is Uint8Array {
  return (
    a instanceof Uint8Array ||
    (a != null && typeof a === "object" && a.constructor.name === "Uint8Array")
  );
}

function assertBytes(b: Uint8Array | undefined, ...lengths: number[]) {
  if (!isBytes(b)) throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(
      `Uint8Array expected of length ${lengths}, not of length=${b.length}`
    );
}

// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, "0")
);

export function bytesToHex(bytes: Uint8Array): string {
  assertBytes(bytes);
  // pre-caching improves the speed 6x
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
