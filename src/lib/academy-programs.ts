/**
 * ===========================================================================
 *  ACADEMY PROGRAMMES — NO BACKEND ENDPOINT EXISTS FOR THIS DATA YET.
 * ===========================================================================
 *
 * The MVSA backend ("MVSA Backend 1.0.0", src/lib/mvsa-api/openapi.json) has
 * no programmes endpoint and no enrolments endpoint. The nine endpoints it does
 * have are listed in src/lib/mvsa-api/index.ts.
 *
 * So this module is the one and only place the site gets programme data, and it
 * serves checked-in seed data. It is NOT wired to anything live. Nothing here
 * writes, enrols, takes a payment, or claims a place has been reserved: every
 * programme CTA on the site hands the visitor to WhatsApp, which is how
 * enrolment is actually handled today.
 *
 * The seed below is kept consistent with the activity catalogue the backend
 * does serve (GET /v1/activities, booking_mode "enquiry_only" for all of
 * these), so nothing here contradicts the venue's approved facts. Prices are
 * deliberately omitted: programme pricing is not published on the site.
 *
 * WHEN A BACKEND ENDPOINT ARRIVES: replace the two functions at the bottom with
 * calls through src/lib/mvsa-api, keep this module's return shape, and delete
 * the seed. Do not scatter programme fetching across the pages.
 *
 * See docs/backend-migration.md, gaps 2 and 3.
 */

export type AcademyProgramType = 'academy' | 'fitness' | 'arena';

export interface AcademyProgram {
  /** Mirrors the backend activity_id in GET /v1/activities, for a later swap. */
  id: string;
  /**
   * The shareable address: /programs/<slug>. Lowercase words and hyphens, so
   * a link pasted into WhatsApp reads like what it is. Old /programs/<id>
   * links redirect here (see next.config.ts).
   */
  slug: string;
  name: string;
  type: AcademyProgramType;
  /** Human schedule line, as published by the venue. */
  schedule: string;
  age_group: string;
  description: string;
  image_url?: string;
  instructor?: { name: string };
  /** Every programme is enquiry-only: enrolment happens over WhatsApp. */
  booking_mode: 'enquiry_only';
}

/*
 * Facts below come from MVSA/social/brand.md (Programmes, and Campaign facts
 * for November to December 2026). Where brand.md says CONFIRM, the schedule
 * says "ask" rather than guessing a day or a time.
 */
const SEED: AcademyProgram[] = [
  {
    id: 'football_academy',
    slug: 'football-academy',
    name: 'Football Academy',
    image_url: '/images/programs/boots-and-ball.webp',
    type: 'academy',
    schedule: 'Saturdays, 2–4pm',
    age_group: 'Ages 6–16',
    description:
      'Youth football on the Arena every Saturday afternoon: technique, small-sided games and match play, led by the academy coaches.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'holiday_training',
    slug: 'holiday-training',
    name: 'Holiday Training',
    image_url: '/images/arena/corner-flag-line.webp',
    type: 'academy',
    schedule: 'Mon–Sat, 11am–1pm, to 19 December',
    age_group: 'Under 11 to Under 15, and goalkeepers',
    description:
      'School’s out, so the Academy trains six days a week: coached sessions by age group, green kit included, through to Saturday 19 December.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'chess',
    slug: 'chess-club',
    name: 'Chess Club',
    image_url: '/images/programs/chess-boards.webp',
    type: 'academy',
    schedule: 'Saturdays, 10am',
    age_group: 'For children',
    description:
      'Chess for children every Saturday at 10am, with our chess coach. First time? Just come at 10am.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'community_yoga',
    slug: 'community-yoga',
    name: 'Community Yoga',
    image_url: '/images/programs/yoga.webp',
    type: 'fitness',
    schedule: 'Fridays, 9am',
    age_group: 'All levels',
    description: 'A donation-based yoga class on the covered pitch every Friday morning. Give what you can.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'boxing',
    slug: 'boxing',
    name: 'Boxing',
    type: 'fitness',
    schedule: 'Sundays, 3pm',
    age_group: 'Adults',
    description: 'Conditioning, pad work and technique, from a first session to regular training.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'dance',
    slug: 'dance',
    name: 'Dance & Rhythm',
    type: 'academy',
    schedule: 'Ask for class times',
    age_group: 'Ages 6–16',
    description: 'Rhythm, movement and choreography classes for children.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'individual_training',
    slug: 'individual-training',
    name: 'Individual Training',
    image_url: '/images/arena/turf-close.webp',
    type: 'arena',
    schedule: 'Any day, by arrangement',
    age_group: 'One to five players',
    description: 'Your own session on the Arena, for one player or a small group of up to five.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'events',
    slug: 'events',
    name: 'Events',
    image_url: '/images/programs/night-game.webp',
    type: 'arena',
    schedule: 'Any day, 6am to midnight',
    age_group: 'Teams, companies and families',
    description: 'Tournaments, company team days and celebrations on a covered, floodlit pitch, with a PA system on request.',
    booking_mode: 'enquiry_only',
  },
];

/** Seed data, served synchronously. No network call, no database. */
export function getAcademyPrograms(): AcademyProgram[] {
  return SEED;
}

/** Finds a programme by its slug, or by its backend id for old links. */
export function getAcademyProgram(slugOrId: string): AcademyProgram | undefined {
  return SEED.find((program) => program.slug === slugOrId || program.id === slugOrId);
}
