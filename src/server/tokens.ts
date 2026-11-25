import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const ACCESS_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const SHA256_HEX = /^[a-f0-9]{64}$/;

export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function matchesAccessToken(token: string, expectedHash: string | null): boolean {
  if (!ACCESS_TOKEN.test(token) || !expectedHash || !SHA256_HEX.test(expectedHash)) return false;
  const actual = Buffer.from(hashAccessToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return timingSafeEqual(actual, expected);
}
