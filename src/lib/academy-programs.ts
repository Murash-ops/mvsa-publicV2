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

export type AcademyProgramType = 'academy' | 'fitness';

export interface AcademyProgram {
  /** Mirrors the backend activity_id in GET /v1/activities, for a later swap. */
  id: string;
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

const SEED: AcademyProgram[] = [
  {
    id: 'football_academy',
    name: 'Football Academy',
    type: 'academy',
    schedule: 'Saturday 14:00–16:00',
    age_group: 'Ages 6 - 16',
    description:
      'Structured youth football development on the main arena turf: technique, small-sided games and match play, led by the academy coaching team. Registration includes kit, shoes excluded.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'chess',
    name: 'Chess Club',
    type: 'academy',
    schedule: 'Weekly sessions',
    age_group: 'Ages 4 - 18',
    description:
      'Coached chess sessions in the clubhouse for beginners through to tournament players.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'dance',
    name: 'Dance & Rhythm',
    type: 'academy',
    schedule: 'Weekly sessions',
    age_group: 'Ages 6 - 16',
    description:
      'Rhythm, movement and choreography classes for children, run in the clubhouse hall.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'boxing',
    name: 'Boxing',
    type: 'fitness',
    schedule: 'Sunday 15:00',
    age_group: 'Ages 16+ / Adults',
    description:
      'Conditioning, pad work and technique for adults, from first session to regular training.',
    booking_mode: 'enquiry_only',
  },
  {
    id: 'community_yoga',
    name: 'Community Yoga',
    type: 'fitness',
    schedule: 'Friday 09:00',
    age_group: 'All levels welcome',
    description:
      'A free community yoga session in the clubhouse. Donations welcome, mats provided.',
    booking_mode: 'enquiry_only',
  },
];

/** Seed data, served synchronously. No network call, no database. */
export function getAcademyPrograms(): AcademyProgram[] {
  return SEED;
}

export function getAcademyProgram(id: string): AcademyProgram | undefined {
  return SEED.find((program) => program.id === id);
}
