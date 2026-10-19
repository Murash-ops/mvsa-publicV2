/**
 * The website booking path: resolve the customer, hold the interval, confirm
 * the booking. Server-only — it calls the backend with the bearer token.
 *
 * The approved flow (backend docs/booking-rules.md and
 * booking-api-addendum.md) is hold-then-confirm:
 *
 *   1. POST /v1/customers/resolve   holds and bookings both need a customer_id
 *   2. POST /v1/holds              reserves the interval for 15 minutes
 *   3. POST /v1/bookings           confirms, reusing the hold's interval and price
 *
 * A 409 is never papered over. The database exclusion constraint is the final
 * authority on overlap, so RESOURCE_UNAVAILABLE and HOLD_EXPIRED can both
 * happen after availability showed the slot, and the customer is told exactly
 * that.
 *
 * Prices are never computed here. The hold response carries the backend's own
 * quote and the booking response carries the amount due.
 */

import {
  createBooking,
  createHold,
  resolveCustomer,
  type CustomerResolutionData,
} from '@/lib/mvsa-api';
import type { ConfirmResponseBody, HoldResponseBody } from './contracts';
import { deriveIdempotencyKey } from './idempotency';
import { whatsAppProviderUserId } from './phone';

/** Recorded on every booking this site creates. */
const BOOKING_SOURCE = 'mvsa-public-site';

/**
 * ------------------------------------------------------------------------
 *  Website customer resolution is an OPEN CONTRACT ITEM.
 * ------------------------------------------------------------------------
 * POST /v1/customers/resolve fixes `provider` to "meta_cloud" and `channel`
 * to "whatsapp"; there is no website variant, yet holds and bookings both
 * require a customer_id. So a website booking has to be resolved through the
 * WhatsApp provider using the number the visitor typed, which is also the
 * number they will be contacted on.
 *
 * That is why booking writes are off by default (MVSA_BOOKING_WRITES_ENABLED).
 * See docs/backend-migration.md, gap 5: the owner and Owen need to decide
 * whether the contract gains a website channel before this is switched on.
 */
async function resolveWebsiteCustomer(
  phoneE164: string,
  name: string,
  intentKey: string
): Promise<CustomerResolutionData> {
  return resolveCustomer(
    {
      phone_e164: phoneE164,
      provider: 'meta_cloud',
      provider_user_id: whatsAppProviderUserId(phoneE164),
      channel: 'whatsapp',
      profile_name: name,
      create_if_missing: true,
    },
    deriveIdempotencyKey(intentKey, 'customer-resolve')
  );
}

/**
 * The backend flags a phone that matched an existing venue record with no
 * verified identifier. The addendum requires identity confirmation before that
 * record is used, which a public website cannot do, so the booking is handed
 * to a human instead.
 */
const IDENTITY_HANDOVER_MESSAGE =
  'We already hold a booking record for this number, so reception needs to confirm it is you before booking again. Send us a WhatsApp message or call and they will finish it with you.';

export interface HoldInput {
  resourceId: string;
  startAt: string;
  durationMinutes: number;
  partySize: number;
  name: string;
  phoneE164: string;
  intentKey: string;
}

export async function holdSlot(input: HoldInput): Promise<HoldResponseBody> {
  const resolution = await resolveWebsiteCustomer(input.phoneE164, input.name, input.intentKey);

  if (!resolution.customer || resolution.needs_identity_confirmation) {
    return { outcome: 'identity_confirmation_required', message: IDENTITY_HANDOVER_MESSAGE };
  }

  const hold = await createHold(
    {
      resource_id: input.resourceId,
      start_at: input.startAt,
      duration_minutes: input.durationMinutes,
      customer_id: resolution.customer.customer_id,
      party_size: input.partySize,
      ttl_seconds: 900, // the approved 15-minute hold
    },
    deriveIdempotencyKey(input.intentKey, 'hold')
  );

  return {
    outcome: 'held',
    hold_id: hold.hold_id,
    expires_at: hold.expires_at,
    expires_in_seconds: hold.expires_in_seconds,
    price_display: hold.price_quote.display,
    resource_name: hold.selection.resource.name,
    duration_minutes: hold.selection.duration_minutes,
    start_local: hold.selection.local.start_local,
    end_local: hold.selection.local.end_local,
    handover_ends_local: hold.selection.local.handover_ends_local,
  };
}

export interface ConfirmInput {
  holdId: string;
  name: string;
  phoneE164: string;
  partySize: number;
  notes?: string;
  intentKey: string;
}

export async function confirmHeldBooking(
  input: ConfirmInput
): Promise<ConfirmResponseBody | { outcome: 'identity_confirmation_required'; message: string }> {
  // Resolving again replays the stored response for this intent, so the same
  // customer_id is used without ever sending it to the browser.
  const resolution = await resolveWebsiteCustomer(input.phoneE164, input.name, input.intentKey);

  if (!resolution.customer || resolution.needs_identity_confirmation) {
    return { outcome: 'identity_confirmation_required', message: IDENTITY_HANDOVER_MESSAGE };
  }

  const booking = await createBooking(
    {
      customer_id: resolution.customer.customer_id,
      channel: 'website',
      source: BOOKING_SOURCE,
      hold_id: input.holdId,
      party_size: input.partySize,
      notes: input.notes?.trim() ? input.notes.trim() : null,
    },
    deriveIdempotencyKey(input.intentKey, 'booking')
  );

  return {
    outcome: 'confirmed',
    booking_id: booking.booking_id,
    reference: booking.reference,
    amount_due_display: booking.amount_due.display,
    resource_name: booking.selection.resource.name,
    start_local: booking.selection.local.start_local,
    end_local: booking.selection.local.end_local,
  };
}
