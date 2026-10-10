/**
 * MVSA backend client — the whole API surface this site is allowed to use.
 *
 * The backend exposes exactly these endpoints (see ./openapi.json):
 *   GET  /v1/activities        GET  /v1/availability
 *   GET  /v1/info              GET  /v1/knowledge/facts
 *   GET  /v1/health            POST /v1/holds
 *   POST /v1/bookings          POST /v1/customers/resolve
 *   POST /v1/conversations/messages   (WhatsApp gateway only; unused here)
 *
 * There is no programmes, enrolments, site-content or inquiries endpoint. Do
 * not add a function for one — see docs/backend-migration.md.
 *
 * Server-only. Client components must go through this site's /api route
 * handlers so the bearer token stays on the server.
 */

import { bookingWritesEnabled, isApiConfigured } from './config';
import { newIdempotencyKey, request } from './http';
import type {
  ActivitiesData,
  AvailabilityData,
  AvailabilityQuery,
  BookingData,
  CreateBookingRequest,
  CreateHoldRequest,
  CustomerResolutionData,
  FactsData,
  HealthResponse,
  HoldData,
  ResolveCustomerRequest,
  ServiceInfo,
} from './types';

export { MvsaApiError, isMvsaApiError, publicMessageFor, toPublicError } from './errors';
export type { MvsaApiErrorKind, PublicApiError } from './errors';
export { isUuidV4, newIdempotencyKey } from './http';
export { bookingWritesEnabled, isApiConfigured } from './config';
export type * from './types';

/* ------------------------------- reads ----------------------------------- */

/** GET /v1/health — the only unauthenticated endpoint; returns no envelope. */
export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>({
    method: 'GET',
    path: '/v1/health',
    publicEndpoint: true,
  });
}

/** GET /v1/info — service identity only (service name and build). */
export function getServiceInfo(): Promise<ServiceInfo> {
  return request<ServiceInfo>({ method: 'GET', path: '/v1/info' });
}

/** GET /v1/knowledge/facts — approved venue facts: address, hours, prices. */
export function getVenueFacts(): Promise<FactsData> {
  return request<FactsData>({ method: 'GET', path: '/v1/knowledge/facts' });
}

/** GET /v1/activities — the approved activity catalogue and booking modes. */
export function getActivities(): Promise<ActivitiesData> {
  return request<ActivitiesData>({ method: 'GET', path: '/v1/activities' });
}

/**
 * GET /v1/availability — flexible interval slots for one resource and one
 * paid duration. Each slot carries its own price and its own
 * occupied_until_at, including the turf handover. The site displays those
 * figures and never computes a price itself.
 */
export function getAvailability(query: AvailabilityQuery): Promise<AvailabilityData> {
  return request<AvailabilityData>({
    method: 'GET',
    path: '/v1/availability',
    query: {
      from: query.from,
      to: query.to,
      resource_id: query.resource_id,
      duration_minutes: query.duration_minutes,
      only_bookable: query.only_bookable,
    },
  });
}

/* ------------------------------- writes ---------------------------------- */

/**
 * POST /v1/customers/resolve — first step of a booking, because holds and
 * bookings both require a customer_id.
 *
 * The contract fixes `provider` to "meta_cloud" and `channel` to "whatsapp":
 * there is no website variant. See docs/backend-migration.md, gap 5.
 */
export function resolveCustomer(
  body: ResolveCustomerRequest,
  idempotencyKey: string = newIdempotencyKey()
): Promise<CustomerResolutionData> {
  return request<CustomerResolutionData>({
    method: 'POST',
    path: '/v1/customers/resolve',
    body,
    idempotencyKey,
  });
}

/**
 * POST /v1/holds — reserves the interval for 15 minutes. The database
 * exclusion constraint is the final authority, so this can fail with 409
 * RESOURCE_UNAVAILABLE even for a slot availability just listed.
 */
export function createHold(
  body: CreateHoldRequest,
  idempotencyKey: string = newIdempotencyKey()
): Promise<HoldData> {
  return request<HoldData>({
    method: 'POST',
    path: '/v1/holds',
    body,
    idempotencyKey,
  });
}

/**
 * POST /v1/bookings — confirms a booking. With `hold_id` the backend reuses
 * the hold's own interval and price; a lapsed hold fails with 409 HOLD_EXPIRED
 * and a taken interval with 409 RESOURCE_UNAVAILABLE.
 */
export function createBooking(
  body: CreateBookingRequest,
  idempotencyKey: string = newIdempotencyKey()
): Promise<BookingData> {
  return request<BookingData>({
    method: 'POST',
    path: '/v1/bookings',
    body,
    idempotencyKey,
  });
}
