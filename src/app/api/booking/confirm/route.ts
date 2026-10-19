/**
 * POST /api/booking/confirm — step two of the approved hold-then-confirm flow.
 *
 * The backend reuses the hold's own interval and price. If the hold has lapsed
 * or the interval was taken in the meantime the backend answers 409
 * (HOLD_EXPIRED / RESOURCE_UNAVAILABLE); that reaches the browser as a 409 so
 * the widget can say the slot went and re-fetch availability.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { bookingWritesEnabled, isMvsaApiError, isUuidV4 } from '@/lib/mvsa-api';
import type { ConfirmRequestBody } from '@/lib/booking/contracts';
import { normalizeKenyanPhone } from '@/lib/booking/phone';
import {
  apiErrorResponse,
  badRequest,
  unexpectedError,
  writesDisabled,
} from '@/lib/booking/responses';
import { confirmHeldBooking } from '@/lib/booking/service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!bookingWritesEnabled()) return writesDisabled();

  let body: Partial<ConfirmRequestBody>;
  try {
    body = (await request.json()) as Partial<ConfirmRequestBody>;
  } catch {
    return badRequest('The booking request could not be read.');
  }

  const holdId = (body.hold_id ?? '').trim();
  if (!holdId || holdId.length > 64) {
    return badRequest('That reservation could not be found. Please pick a slot again.');
  }

  const name = (body.name ?? '').trim();
  if (name.length < 2 || name.length > 120) {
    return badRequest('Please enter your full name.');
  }

  const phoneE164 = normalizeKenyanPhone(body.phone ?? '');
  if (!phoneE164) {
    return badRequest('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx).');
  }

  if (
    typeof body.party_size !== 'number' ||
    !Number.isInteger(body.party_size) ||
    body.party_size < 1 ||
    body.party_size > 500
  ) {
    return badRequest('Tell us how many people are coming (1 to 500).');
  }

  const notes = (body.notes ?? '').slice(0, 1000);

  const intentKey = body.intent_key ?? '';
  if (!isUuidV4(intentKey)) {
    return badRequest('The booking request was missing its reference. Please try again.');
  }

  try {
    const result = await confirmHeldBooking({
      holdId,
      name,
      phoneE164,
      partySize: body.party_size,
      notes,
      intentKey,
    });

    return NextResponse.json(result, {
      status: result.outcome === 'confirmed' ? 201 : 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (isMvsaApiError(error)) return apiErrorResponse(error);
    return unexpectedError(error);
  }
}
