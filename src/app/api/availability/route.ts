/**
 * GET /api/availability — live slots for the booking widget.
 *
 * The widget cannot call the backend itself: the bearer token stays on the
 * server. This handler validates the query against what the venue actually
 * offers, calls GET /v1/availability and returns the slots unchanged, prices
 * included, so the site never second-guesses the backend's figures.
 *
 * `only_bookable=false` is deliberate. An unbookable slot comes back with a
 * reason, which the widget shows; an empty list then means genuinely nothing,
 * never "we could not reach the venue".
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAvailability, isMvsaApiError } from '@/lib/mvsa-api';
import { venues } from '@/content/venues';
import { ALLOWED_DURATION_MINUTES, type AvailabilityResponseBody } from '@/lib/booking/contracts';
import { apiErrorResponse, badRequest, unexpectedError } from '@/lib/booking/responses';

export const dynamic = 'force-dynamic';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const date = params.get('date') ?? '';
  if (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) {
    return badRequest('A date in YYYY-MM-DD form is required.');
  }

  const resourceId = params.get('resource_id') ?? '';
  if (!venues.some((venue) => venue.resourceId === resourceId)) {
    return badRequest('Unknown venue.');
  }

  const durationMinutes = Number.parseInt(params.get('duration_minutes') ?? '60', 10);
  if (!ALLOWED_DURATION_MINUTES.includes(durationMinutes as never)) {
    return badRequest('Bookings are made in whole hours, from one to ten.');
  }

  try {
    const availability = await getAvailability({
      from: date,
      to: date,
      resource_id: resourceId,
      duration_minutes: durationMinutes,
      only_bookable: false,
    });

    const body: AvailabilityResponseBody = {
      timezone: availability.query.timezone,
      resource_id: availability.query.resource_id,
      duration_minutes: availability.query.duration_minutes,
      date,
      slots: availability.slots,
    };

    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (isMvsaApiError(error)) return apiErrorResponse(error);
    return unexpectedError(error);
  }
}
