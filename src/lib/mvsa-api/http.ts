/**
 * The single place where this site talks to the MVSA backend.
 *
 * It owns the base URL, the bearer token, the protected headers the contract
 * requires on every call, timeouts, retries and error normalisation. Nothing
 * else in the repository may call the backend directly.
 *
 * Server-only: see ./config.ts.
 */

import { CONTRACT_VERSION, readApiConfig, type MvsaApiConfig } from './config';
import { MvsaApiError, type MvsaApiErrorKind } from './errors';
import type { Envelope } from './types';

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  query?: Query;
  body?: unknown;
  /**
   * Canonical UUIDv4, required by the contract on every mutation and reused
   * for every retry of the same customer intent.
   */
  idempotencyKey?: string;
  /** Skip auth and protected headers (GET /v1/health only). */
  publicEndpoint?: boolean;
}

/** Retries are for idempotent GETs only. A mutation is never replayed here. */
const GET_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = [200, 600];

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function isUuidV4(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function buildUrl(config: MvsaApiConfig, path: string, query?: Query): string {
  const url = new URL(`${config.baseUrl}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function kindForStatus(status: number): MvsaApiErrorKind {
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  return 'server';
}

interface BackendErrorBody {
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
    request_id?: string;
  };
}

async function readErrorBody(response: Response): Promise<BackendErrorBody> {
  try {
    return (await response.json()) as BackendErrorBody;
  } catch {
    return {};
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attempt<T>(
  config: MvsaApiConfig,
  options: RequestOptions
): Promise<Envelope<T> | T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (!options.publicEndpoint) {
    headers.Authorization = `Bearer ${config.token}`;
    headers['X-Tenant-Id'] = config.tenantId;
    headers['X-Request-Id'] = crypto.randomUUID();
    headers['X-Contract-Version'] = CONTRACT_VERSION;
  }
  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  let response: Response;
  try {
    response = await fetch(buildUrl(config, options.path, options.query), {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
      signal: controller.signal,
      redirect: 'error',
    });
  } catch (cause) {
    const aborted = controller.signal.aborted;
    throw new MvsaApiError({
      kind: aborted ? 'timeout' : 'unreachable',
      message: aborted
        ? `The backend did not answer ${options.method} ${options.path} within ${config.timeoutMs}ms.`
        : `The backend could not be reached for ${options.method} ${options.path}.`,
      retryable: true,
      cause,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new MvsaApiError({
      kind: kindForStatus(response.status),
      status: response.status,
      code: body.error?.code,
      requestId: body.error?.request_id ?? response.headers.get('X-Request-Id') ?? undefined,
      retryable: body.error?.retryable ?? response.status >= 500,
      message:
        body.error?.message ??
        `The backend answered ${response.status} for ${options.method} ${options.path}.`,
    });
  }

  try {
    return (await response.json()) as Envelope<T> | T;
  } catch (cause) {
    throw new MvsaApiError({
      kind: 'malformed_response',
      status: response.status,
      message: `The backend returned a body that is not JSON for ${options.method} ${options.path}.`,
      cause,
    });
  }
}

/** Unwraps the { data, meta } envelope and normalises every failure. */
export async function request<T>(options: RequestOptions): Promise<T> {
  const config = readApiConfig();
  if (!config) {
    throw new MvsaApiError({
      kind: 'not_configured',
      message:
        'MVSA_API_BASE_URL and MVSA_API_TOKEN are not set, so the backend cannot be called.',
    });
  }

  const maxAttempts = options.method === 'GET' ? GET_ATTEMPTS : 1;
  let lastError: MvsaApiError | undefined;

  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const payload = await attempt<T>(config, options);
      if (options.publicEndpoint) return payload as T;

      if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as Envelope<T>).data;
      }
      throw new MvsaApiError({
        kind: 'malformed_response',
        message: `The backend response for ${options.method} ${options.path} had no data envelope.`,
      });
    } catch (error) {
      if (!(error instanceof MvsaApiError)) throw error;
      lastError = error;

      const worthRetrying =
        error.kind === 'unreachable' || error.kind === 'timeout' || error.kind === 'server';
      if (!worthRetrying || i === maxAttempts - 1) throw error;

      await sleep(RETRY_BACKOFF_MS[Math.min(i, RETRY_BACKOFF_MS.length - 1)]);
    }
  }

  // Unreachable: the loop either returns or throws.
  throw (
    lastError ??
    new MvsaApiError({ kind: 'unreachable', message: 'The backend call did not complete.' })
  );
}
