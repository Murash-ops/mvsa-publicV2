/**
 * Presentation details for the two bookable resources.
 *
 * The `turf` identifiers below are the backend's own ids and stay as they are;
 * the name customers see is "the Arena".
 *
 * This replaces the `venues` table, but only the parts the backend does not
 * own. The backend is authoritative for everything that can change or that
 * staff must approve: resource identity (`resource_id`), opening hours, slot
 * availability and price all come from GET /v1/availability and
 * GET /v1/knowledge/facts.
 *
 * What is left here is the site's own marketing name, photograph and blurb for
 * each resource. The API has no media or editorial field for a resource.
 */

export type VenueKind = 'turf' | 'meeting_room';

export interface VenuePresentation {
  /** The backend resource id. These two are the only bookable resources. */
  resourceId: 'res_turf' | 'res_meeting_room';
  /** Marketing name used across the site; the API's own name is `resource_name`. */
  displayName: string;
  /** How a customer's message names it: "I would like to book the Arena". */
  requestName: string;
  kind: VenueKind;
  /** Matches an `activity_id` in GET /v1/knowledge/facts pricing_summary. */
  activityId: string;
  badge: string;
  imageUrl: string;
  blurb: string;
}

export const venues: VenuePresentation[] = [
  {
    resourceId: 'res_turf',
    displayName: 'The Arena',
    requestName: 'the Arena',
    kind: 'turf',
    activityId: 'turf_hire',
    badge: 'Floodlit 5-aside',
    imageUrl: '/images/gallery/shot-03.webp',
    blurb: 'Floodlit 5-aside, open until midnight. From KES 1,500 an hour.',
  },
  {
    resourceId: 'res_meeting_room',
    displayName: 'Meeting Room / Conference Hall',
    requestName: 'the meeting room',
    kind: 'meeting_room',
    activityId: 'meeting_room',
    badge: 'Teams & events',
    imageUrl: '/images/gallery/shot-14.webp',
    blurb: 'A quiet room for team talks, training sessions and small events.',
  },
];

export function findVenue(resourceId: string): VenuePresentation | undefined {
  return venues.find((venue) => venue.resourceId === resourceId);
}

export function venueDisplayName(resourceId: string, fallback: string): string {
  return findVenue(resourceId)?.displayName ?? fallback;
}
