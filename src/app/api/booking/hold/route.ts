/**
 * POST /api/booking/hold — step one of the approved hold-then-confirm flow.
 *
 * Off unless MVSA_BOOKING_WRITES_ENABLED=true, in which case the widget hands
 * the customer to WhatsApp or the phone instead and says plainly that nothing
 * was reserved. See docs/backend-migration.md, gap 5.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { bookingWritesEnabled, isMvsaApiError, isUuidV4 } from '@/lib/mvsa-api';
import { venues } from '@/content/venues';
import { ALLOWED_DURATION_MINUTES, type HoldRequestBody } from '@/lib/booking/contracts';
import { normalizeKenyanPhone } from '@/lib/booking/phone';
import {
  apiErrorResponse,
  badRequest,
  unexpectedError,
  writesDisabled,
} from '@/lib/booking/responses';
import { holdSlot } from '@/lib/booking/service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!bookingWritesEnabled()) return writesDisabled();

  let body: Partial<HoldRequestBody>;
  try {
    body = (await request.json()) as Partial<HoldRequestBody>;
  } catch {
    return badRequest('The booking request could not be read.');
  }

  if (!venues.some((venue) => venue.resourceId === body.resource_id)) {
    return badRequest('Unknown venue.');
  }
  if (typeof body.start_at !== 'string' || Number.isNaN(Date.parse(body.start_at))) {
    return badRequest('Pick a start time from the list of slots.');
  }
  if (Date.parse(body.start_at) <= Date.now()) {
    return badRequest('That start time has already passed. Pick another slot.');
  }
  if (!ALLOWED_DURATION_MINUTES.includes(body.duration_minutes as never)) {
    return badRequest('Bookings are made in whole hours, from one to ten.');
  }
  if (
    typeof body.party_size !== 'number' ||
    !Number.isInteger(body.party_size) ||
    body.party_size < 1 ||
    body.party_size > 500
  ) {
    return badRequest('Tell us how many people are coming (1 to 500).');
  }

  const name = (body.name ?? '').trim();
  if (name.length < 2 || name.length > 120) {
    return badRequest('Please enter your full name.');
  }

  const phoneE164 = normalizeKenyanPhone(body.phone ?? '');
  if (!phoneE164) {
    return badRequest('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx).');
  }

  const intentKey = body.intent_key ?? '';
  if (!isUuidV4(intentKey)) {
    return badRequest('The booking request was missing its reference. Please try again.');
  }

  try {
    const result = await holdSlot({
      resourceId: body.resource_id as string,
      startAt: body.start_at,
      durationMinutes: body.duration_minutes as number,
      partySize: body.party_size,
      name,
      phoneE164,
      intentKey,
    });

    return NextResponse.json(result, {
      status: result.outcome === 'held' ? 201 : 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (isMvsaApiError(error)) return apiErrorResponse(error);
    return unexpectedError(error);
  }
}
