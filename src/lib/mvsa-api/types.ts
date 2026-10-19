/**
 * Types for the MVSA backend contract ("MVSA Backend 1.0.0").
 *
 * The checked-in contract this mirrors is ./openapi.json. Where the contract
 * declares an untyped 201 body (POST /v1/holds, POST /v1/bookings) the shape
 * below is the one the service actually returns; those two are marked.
 *
 * Every protected response is enveloped as { data, meta }.
 */

export interface ResponseMeta {
  request_id: string;
  contract_version: string;
}

export interface Envelope<T> {
  data: T;
  meta: ResponseMeta;
}

/* -------------------------------------------------------------------------- */
/* GET /v1/health (public, no auth, no envelope)                              */
/* -------------------------------------------------------------------------- */

export interface HealthResponse {
  status: string;
  service: string;
  contract_version: string;
  build: string;
  started_at: string;
  checks: Record<string, string>;
}

/* -------------------------------------------------------------------------- */
/* GET /v1/info                                                               */
/* -------------------------------------------------------------------------- */

export interface ServiceInfo {
  service: string;
  build: string;
}

/* -------------------------------------------------------------------------- */
/* GET /v1/knowledge/facts                                                    */
/* -------------------------------------------------------------------------- */

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface OpeningHours {
  day: WeekDay;
  open_local: string;
  close_local: string;
}

export interface Closure {
  date: string;
  reason: string;
  all_day?: boolean;
}

export interface PricingSummaryItem {
  activity_id: string;
  label: string;
  display: string;
}

export interface VenueFacts {
  venue_name: string;
  address: string;
  maps_url: string;
  phone_display: string;
  timezone: string;
  opening_hours: OpeningHours[];
  closures: Closure[];
  pricing_summary: PricingSummaryItem[];
  hours_note?: string | null;
  standard_open_local?: string | null;
  last_bookable_start_local?: string | null;
}

export interface FactsData {
  facts: VenueFacts;
  updated_at: string;
}

/* -------------------------------------------------------------------------- */
/* GET /v1/activities                                                         */
/* -------------------------------------------------------------------------- */

export interface Activity {
  activity_id: string;
  name: string;
  category: string;
  booking_mode: string;
  price_display?: string | null;
  schedule_display?: string | null;
}

export interface ActivitiesData {
  activities: Activity[];
  updated_at: string;
}

/* -------------------------------------------------------------------------- */
/* GET /v1/availability                                                       */
/* -------------------------------------------------------------------------- */

export interface AvailabilityLocalTime {
  timezone: string;
  start_local: string;
  end_local: string;
  handover_ends_local: string;
  display: string;
}

export interface AvailabilityPrice {
  amount_minor: number;
  currency: string;
  display: string;
  rule_id: string;
  per?: string;
}

export interface AvailabilitySlot {
  slot_id: string;
  resource_id: string;
  resource_name: string;
  /** UTC start of paid play. */
  start_at: string;
  /** UTC end of paid play. */
  end_at: string;
  /** UTC end of the reserved interval, including the turf handover. */
  occupied_until_at: string;
  duration_minutes: number;
  handover_minutes: number;
  local: AvailabilityLocalTime;
  /** The price the backend quotes for this slot and duration. Never recomputed here. */
  price: AvailabilityPrice;
  bookable: boolean;
  unbookable_reason: string | null;
}

export interface AvailabilityQueryEcho {
  from: string;
  to: string;
  timezone: string;
  resource_id: string;
  duration_minutes: number;
}

export interface AvailabilityData {
  query: AvailabilityQueryEcho;
  slots: AvailabilitySlot[];
  next_cursor?: null;
}

export interface AvailabilityQuery {
  from: string;
  to: string;
  resource_id?: string;
  duration_minutes?: number;
  only_bookable?: boolean;
}

/* -------------------------------------------------------------------------- */
/* POST /v1/customers/resolve                                                 */
/* -------------------------------------------------------------------------- */

export type CustomerMatchType =
  | 'known_identifier'
  | 'existing_record_unverified'
  | 'created'
  | 'none';

export interface ResolvedCustomer {
  customer_id: string;
  display_name: string | null;
  status: 'active' | 'blocked' | 'archived';
  created_at: string;
  stats: { total_bookings: number; upcoming_bookings: number };
}

export interface CustomerResolutionData {
  customer: ResolvedCustomer | null;
  match_type: CustomerMatchType;
  is_new: boolean;
  needs_identity_confirmation: boolean;
}

/**
 * The contract fixes `provider` to "meta_cloud" and `channel` to "whatsapp".
 * There is no website variant — see docs/backend-migration.md, gap 5.
 */
export interface ResolveCustomerRequest {
  phone_e164: string;
  provider: 'meta_cloud';
  provider_user_id: string;
  channel: 'whatsapp';
  profile_name?: string | null;
  create_if_missing?: boolean;
}

/* -------------------------------------------------------------------------- */
/* POST /v1/holds and POST /v1/bookings                                       */
/* -------------------------------------------------------------------------- */

export interface CreateHoldRequest {
  resource_id: string;
  /** ISO 8601 with offset, taken from an availability slot. */
  start_at: string;
  duration_minutes: number;
  customer_id: string;
  party_size?: number;
  conversation_id?: string | null;
  /** Maximum 900 (the approved 15-minute hold). */
  ttl_seconds?: number;
}

export interface CreateBookingRequest {
  customer_id: string;
  channel: 'whatsapp' | 'staff' | 'website';
  source: string;
  /** Confirming a hold reuses the hold's own interval and price. */
  hold_id?: string | null;
  resource_id?: string | null;
  start_at?: string | null;
  duration_minutes?: number | null;
  party_size?: number;
  notes?: string | null;
  conversation_id?: string | null;
}

/** Shared selection block on hold and booking responses. */
export interface BookingSelection {
  resource: { resource_id: string; name: string };
  start_at: string;
  end_at: string;
  occupied_until_at: string;
  duration_minutes: number;
  handover_minutes: number;
  local: {
    timezone: string;
    start_local: string;
    end_local: string;
    handover_ends_local: string;
  };
}

/** POST /v1/holds 201 body. The contract declares this response untyped. */
export interface HoldData {
  hold_id: string;
  customer_id: string;
  party_size: number;
  status: string;
  expires_at: string;
  expires_in_seconds: number;
  selection: BookingSelection;
  price_quote: { amount_minor: number; currency: string; display: string };
}

/** POST /v1/bookings 201 body. The contract declares this response untyped. */
export interface BookingData {
  booking_id: string;
  reference: string;
  status: string;
  customer_id: string;
  party_size: number;
  selection: BookingSelection;
  amount_due: { amount_minor: number; currency: string; display: string };
  payment_status: string;
  actions: { can_cancel: boolean; can_reschedule: boolean };
  created_at: string;
}
