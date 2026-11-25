import { createHash } from "node:crypto";

export function contentVersionFor(edition: unknown, recipient?: unknown): string {
  const privateContent = recipient && typeof recipient === "object"
    ? Object.fromEntries(Object.entries(recipient).filter(([key]) => key !== "tokenHash" && key !== "active"))
    : recipient ?? null;
  return createHash("sha256")
    .update(JSON.stringify({ edition, recipient: privateContent }))
    .digest("hex");
}
