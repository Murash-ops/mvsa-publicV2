/**
 * The contract between this site's browser code and this site's own route
 * handlers under /api. Types only — safe to import from a client component.
 *
 * The browser never talks to the MVSA backend directly: the bearer token for
 * it must never reach a browser bundle.
 */

import type { AvailabilitySlot } from '@/lib/mvsa-api/types';

export type { AvailabilitySlot };

/** Whole hours only: the approved minimum is one hour and duration changes in whole hours. */
export const ALLOWED_DURATION_MINUTES = [60, 120, 180, 240, 300, 360, 420, 480, 540, 600] as const;

export type AllowedDuration = (typeof ALLOWED_DURATION_MINUTES)[number];

export interface AvailabilityResponseBody {
  timezone: string;
  resource_id: string;
  duration_minutes: number;
  date: string;
  slots: AvailabilitySlot[];
}

export interface HoldRequestBody {
  resource_id: string;
  start_at: string;
  duration_minutes: number;
  party_size: number;
  name: string;
  phone: string;
  /** Canonical UUIDv4 generated once per customer intent and reused on retry. */
  intent_key: string;
}

export interface HeldSlotBody {
  outcome: 'held';
  hold_id: string;
  expires_at: string;
  expires_in_seconds: number;
  price_display: string;
  resource_name: string;
  duration_minutes: number;
  start_local: string;
  end_local: string;
  handover_ends_local: string;
}

/**
 * The backend asked for the customer's identity to be confirmed before their
 * record is used (match_type "existing_record_unverified"). The website cannot
 * do that, so the booking goes to a human instead of guessing.
 */
export interface IdentityHandoverBody {
  outcome: 'identity_confirmation_required';
  message: string;
}

export type HoldResponseBody = HeldSlotBody | IdentityHandoverBody;

export interface ConfirmRequestBody {
  hold_id: string;
  name: string;
  phone: string;
  party_size: number;
  notes?: string;
  intent_key: string;
}

export interface ConfirmResponseBody {
  outcome: 'confirmed';
  booking_id: string;
  reference: string;
  amount_due_display: string;
  resource_name: string;
  start_local: string;
  end_local: string;
}
