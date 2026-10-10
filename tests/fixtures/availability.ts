/**
 * Mock payloads shaped like the real backend responses, so the specs exercise
 * the widget without a backend, a token or network access.
 *
 * The slot shape is taken from GET /v1/availability in
 * src/lib/mvsa-api/openapi.json: each slot carries its own start, its own
 * price for the requested duration, and an occupied_until_at that includes the
 * turf handover.
 */

const DATE = '2026-10-11';
const NAIROBI_OFFSET_MINUTES = 180;

function instantFrom(startLocal: string, addMinutes: number) {
  const [hours, minutes] = startLocal.split(':').map(Number);
  const utc = Date.UTC(2026, 9, 11, hours, minutes) - NAIROBI_OFFSET_MINUTES * 60_000;
  return new Date(utc + addMinutes * 60_000);
}

function utcString(value: Date) {
  return `${value.toISOString().slice(0, 19)}Z`;
}

function localString(value: Date) {
  const local = new Date(value.getTime() + NAIROBI_OFFSET_MINUTES * 60_000);
  return `${local.toISOString().slice(0, 19)}+03:00`;
}

export interface MockSlotOptions {
  startLocal: string;
  durationMinutes?: number;
  bookable?: boolean;
  unbookableReason?: string | null;
  priceDisplay?: string;
}

export function mockSlot(index: number, options: MockSlotOptions) {
  const { startLocal, durationMinutes = 60, bookable = true, unbookableReason = null } = options;

  const start = instantFrom(startLocal, 0);
  const end = instantFrom(startLocal, durationMinutes);
  const occupiedUntil = instantFrom(startLocal, durationMinutes + 20);

  return {
    slot_id: `slot_mock_${index}`,
    resource_id: 'res_turf',
    resource_name: 'Turf',
    start_at: utcString(start),
    end_at: utcString(end),
    occupied_until_at: utcString(occupiedUntil),
    duration_minutes: durationMinutes,
    handover_minutes: 20,
    local: {
      timezone: 'Africa/Nairobi',
      start_local: localString(start),
      end_local: localString(end),
      handover_ends_local: localString(occupiedUntil),
      display: `Sun 11 Oct, ${startLocal}`,
    },
    price: {
      amount_minor: 120000,
      currency: 'KES',
      per: 'booking',
      display: options.priceDisplay ?? 'KES 1,200',
      rule_id: 'turf_early',
    },
    bookable,
    unbookable_reason: unbookableReason,
  };
}

export type MockSlot = ReturnType<typeof mockSlot>;

export function mockAvailability(slots: MockSlot[]) {
  return {
    timezone: 'Africa/Nairobi',
    resource_id: 'res_turf',
    duration_minutes: 60,
    date: DATE,
    slots,
  };
}

/**
 * Three starts, the third already taken. The prices deliberately differ to
 * prove the widget shows each slot's own quoted price rather than one rate for
 * the whole diary.
 */
export const THREE_SLOTS = mockAvailability([
  mockSlot(1, { startLocal: '08:00' }),
  mockSlot(2, { startLocal: '08:20', priceDisplay: 'KES 1,500' }),
  mockSlot(3, { startLocal: '08:40', bookable: false, unbookableReason: 'already_booked' }),
]);

/** The shape this site's route handlers use for every failure. */
export function mockFailure(kind: string, message: string, code?: string) {
  return { error: { kind, code, message, retryable: kind !== 'validation' } };
}

/** A held slot, as POST /api/booking/hold returns it. */
export function mockHold(expiresInSeconds = 900) {
  return {
    outcome: 'held' as const,
    hold_id: 'hold_mock_1',
    expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    expires_in_seconds: expiresInSeconds,
    price_display: 'KES 1,200',
    resource_name: 'Turf',
    duration_minutes: 60,
    start_local: `${DATE}T08:00:00+03:00`,
    end_local: `${DATE}T09:00:00+03:00`,
    handover_ends_local: `${DATE}T09:20:00+03:00`,
  };
}

/** A confirmed booking, as POST /api/booking/confirm returns it. */
export const MOCK_BOOKING = {
  outcome: 'confirmed' as const,
  booking_id: 'bkg_mock_1',
  reference: 'MVSA-7F3K2',
  amount_due_display: 'KES 1,200',
  resource_name: 'Turf',
  start_local: `${DATE}T08:00:00+03:00`,
  end_local: `${DATE}T09:00:00+03:00`,
};
