/**
 * Idempotency keys for backend mutations. Server-only.
 *
 * The contract requires a canonical UUIDv4 on every mutation, reused for every
 * retry of the same intent. The backend fingerprints (method, path, body) per
 * key, so the same key on a different endpoint is rejected with
 * IDEMPOTENCY_KEY_CONFLICT — each step of a booking therefore needs its own
 * key, but each must still be stable across retries.
 *
 * So one browser intent key is expanded into a stable key per step by hashing
 * it with the step name and forcing the UUIDv4 version and variant bits.
 */

import { createHash } from 'node:crypto';

export type BookingStep = 'customer-resolve' | 'hold' | 'booking';

export function deriveIdempotencyKey(intentKey: string, step: BookingStep): string {
  const digest = createHash('sha256').update(`${intentKey}:${step}`).digest();
  const bytes = Uint8Array.prototype.slice.call(digest, 0, 16);

  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
