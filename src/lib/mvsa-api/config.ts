/**
 * Server-only configuration for the MVSA backend client.
 *
 * MVSA_API_TOKEN is a bearer credential for the venue's booking database. It is
 * read here, on the server, and nowhere else. Do not add a NEXT_PUBLIC_ alias
 * for any value in this file: that prefix inlines the value into the browser
 * bundle. If you need backend data in a client component, call one of this
 * site's own route handlers under /api instead.
 */

export const CONTRACT_VERSION = '1.0.0';

export interface MvsaApiConfig {
  baseUrl: string;
  token: string;
  tenantId: string;
  timeoutMs: number;
}

function assertServerSide(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'The MVSA backend client is server-only. Import it from a server component or a route handler.'
    );
  }
}

/** Null when the environment is not configured, so callers can degrade honestly. */
export function readApiConfig(): MvsaApiConfig | null {
  assertServerSide();

  const baseUrl = process.env.MVSA_API_BASE_URL?.trim().replace(/\/+$/, '');
  const token = process.env.MVSA_API_TOKEN?.trim();
  if (!baseUrl || !token) return null;

  const parsedTimeout = Number.parseInt(process.env.MVSA_API_TIMEOUT_MS ?? '', 10);

  return {
    baseUrl,
    token,
    tenantId: process.env.MVSA_API_TENANT_ID?.trim() || 'mvsa',
    timeoutMs: Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 8000,
  };
}

export function isApiConfigured(): boolean {
  return readApiConfig() !== null;
}

/**
 * Booking writes (customer resolution, holds, bookings) stay off until the
 * owner turns them on. See docs/backend-migration.md: the backend has no
 * website channel for POST /v1/customers/resolve, and nothing on Vercel can
 * reach the backend yet.
 */
export function bookingWritesEnabled(): boolean {
  assertServerSide();
  return process.env.MVSA_BOOKING_WRITES_ENABLED?.trim().toLowerCase() === 'true';
}
