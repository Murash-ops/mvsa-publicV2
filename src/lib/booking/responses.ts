/**
 * Shared responses for this site's booking route handlers. Server-only.
 *
 * Every failure reaches the browser in the same shape, with a status that says
 * whose problem it is, so the widget can be honest about it:
 *   502 — the venue's system could not be reached or answered
 *   503 — this site is configured not to write bookings
 *   409 — the slot or hold went while the customer was deciding
 *   400 — the request was not valid
 */

import { NextResponse } from 'next/server';
import { MvsaApiError, publicMessageFor, type PublicApiError } from '@/lib/mvsa-api';

function statusFor(error: MvsaApiError): number {
  switch (error.kind) {
    case 'validation':
      return 400;
    case 'not_found':
      return 404;
    case 'conflict':
      return 409;
    default:
      // not_configured, unreachable, timeout, unauthorized, forbidden, server,
      // malformed_response: all of these are the venue side, not the customer.
      return 502;
  }
}

export function apiErrorResponse(error: MvsaApiError): NextResponse<PublicApiError> {
  // Logged server-side only: the message may name the host or the endpoint.
  console.error('[mvsa-api]', error.kind, error.code ?? '-', error.message, {
    requestId: error.requestId,
  });

  return NextResponse.json(
    {
      error: {
        kind: error.kind,
        code: error.code,
        message: publicMessageFor(error),
        retryable: error.retryable,
      },
    },
    { status: statusFor(error) }
  );
}

export function badRequest(message: string): NextResponse<PublicApiError> {
  return NextResponse.json(
    { error: { kind: 'bad_request' as const, message, retryable: false } },
    { status: 400 }
  );
}

export function writesDisabled(): NextResponse<PublicApiError> {
  return NextResponse.json(
    {
      error: {
        kind: 'writes_disabled' as const,
        message:
          'Online slot holds are switched off on this site, so nothing has been reserved. Send your request on WhatsApp or call reception and they will confirm the slot for you.',
        retryable: false,
      },
    },
    { status: 503 }
  );
}

/** Any non-MvsaApiError is a bug here, not a venue outage. */
export function unexpectedError(error: unknown): NextResponse<PublicApiError> {
  console.error('[booking-route] unexpected failure', error);
  return NextResponse.json(
    {
      error: {
        kind: 'server' as const,
        message: 'Something went wrong on our side. Please try again or contact reception.',
        retryable: true,
      },
    },
    { status: 500 }
  );
}
