const SIGNATURE = "Nos vemos en 2027.";

export function splitClosingMessage(raw: string): { body: string; sign: string } {
  const parts = raw.trim().split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  if (/^nos vemos/i.test(last)) return { body: parts.slice(0, -1).join(" "), sign: last };
  return { body: parts.join(" "), sign: SIGNATURE };
}