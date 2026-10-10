/**
 * Normalised failures for every MVSA backend call.
 *
 * The rest of the site never sees a raw fetch rejection or a raw HTTP status:
 * it sees one of these, so that pages and route handlers can tell the
 * difference between "the venue's system is down" and "that slot just went".
 */

export type MvsaApiErrorKind =
  /** MVSA_API_BASE_URL / MVSA_API_TOKEN are missing in this environment. */
  | 'not_configured'
  /** DNS, TCP, TLS or the request never completed. */
  | 'unreachable'
  /** The request exceeded the configured timeout. */
  | 'timeout'
  /** 401 — the bearer token is missing or wrong. */
  | 'unauthorized'
  /** 403 — tenant or resource access denied. */
  | 'forbidden'
  /** 400 — the request did not satisfy the contract. */
  | 'validation'
  /** 404 — the hold, customer or resource does not exist. */
  | 'not_found'
  /** 409 — the interval went while the customer was deciding, or the hold expired. */
  | 'conflict'
  /** 5xx, including the 503 the backend returns when venue facts are unconfigured. */
  | 'server'
  /** 2xx with a body that does not match the contract. */
  | 'malformed_response';

export interface MvsaApiErrorOptions {
  kind: MvsaApiErrorKind;
  message: string;
  status?: number;
  /** Backend error code, e.g. RESOURCE_UNAVAILABLE, HOLD_EXPIRED, VALIDATION_ERROR. */
  code?: string;
  /** Backend request id, for matching a customer report against service logs. */
  requestId?: string;
  retryable?: boolean;
  cause?: unknown;
}

export class MvsaApiError extends Error {
  readonly kind: MvsaApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly retryable: boolean;

  constructor(options: MvsaApiErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = 'MvsaApiError';
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.retryable = options.retryable ?? false;
  }

  /**
   * True when nothing the customer did caused this and the venue simply cannot
   * be reached or answered. The booking UI must say so and offer phone or
   * WhatsApp — it must never render an empty slot list instead.
   */
  get isVenueUnreachable(): boolean {
    return (
      this.kind === 'not_configured' ||
      this.kind === 'unreachable' ||
      this.kind === 'timeout' ||
      this.kind === 'server' ||
      this.kind === 'unauthorized' ||
      this.kind === 'forbidden' ||
      this.kind === 'malformed_response'
    );
  }

  /**
   * True when the requested interval is gone or the 15-minute hold lapsed.
   * The database exclusion constraint is the final authority here, so this can
   * happen even though availability showed the slot a moment earlier.
   */
  get isSlotGone(): boolean {
    return (
      this.kind === 'conflict' &&
      (this.code === 'RESOURCE_UNAVAILABLE' || this.code === 'HOLD_EXPIRED')
    );
  }
}

export function isMvsaApiError(error: unknown): error is MvsaApiError {
  return error instanceof MvsaApiError;
}

/** Shape returned to the browser by this site's own route handlers. */
export interface PublicApiError {
  error: {
    kind: MvsaApiErrorKind | 'writes_disabled' | 'bad_request';
    code?: string;
    message: string;
    retryable: boolean;
  };
}

/**
 * Customer-facing copy for a failure. Deliberately plain: it never repeats
 * internal messages, SQL, hostnames or the bearer token.
 */
export function publicMessageFor(error: MvsaApiError): string {
  if (error.isSlotGone) {
    return 'That time was taken while you were deciding. Pick another slot — the list has been refreshed.';
  }
  switch (error.kind) {
    case 'validation':
      return 'Those booking details were not accepted. Check the date, time and party size and try again.';
    case 'not_found':
      return 'That slot or booking could not be found any more. Please pick a time again.';
    default:
      return 'We cannot reach the arena booking system right now.';
  }
}

export function toPublicError(error: MvsaApiError): PublicApiError {
  return {
    error: {
      kind: error.kind,
      code: error.code,
      message: publicMessageFor(error),
      retryable: error.retryable,
    },
  };
}
