import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const HASH_KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, HASH_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedValue: string) {
  const [salt, hash] = hashedValue.split(":");
  if (!salt || !hash) {
    return false;
  }

  const passwordHash = scryptSync(password, salt, HASH_KEY_LENGTH);
  const storedHash = Buffer.from(hash, "hex");
  if (passwordHash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(passwordHash, storedHash);
}
