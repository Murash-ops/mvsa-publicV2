/**
 * Editorial copy for the public site.
 *
 * This used to live in a `site_content` table and was fetched on every render.
 * The MVSA backend has no site-content endpoint and should not get one: this is
 * marketing copy, not venue data. Keeping it here means it is version
 * controlled, reviewable in a pull request, type checked, and renders with no
 * database and no network call.
 *
 * Naming: the thing people book is "the Arena". Never "the turf" or "turf
 * hire". The surface may be described once as synthetic turf.
 *
 * Only facts the owner has approved appear here: open every day 08:00 to
 * midnight; the Arena from KES 1,500 an hour, whole hours, one hour minimum;
 * the two booking lines, the academy line, the email and the handle. No other
 * price band is ever shown.
 */

export interface ContactChannel {
  name: string;
  value: string;
  href: string;
}

export const contact = {
  /** The venue's WhatsApp line, used by every handover route on the site. */
  whatsappNumber: '254798258950',
  whatsappDisplay: '0798 258 950',
  /** Reception, for anyone who cannot complete a booking online. */
  bookingsPhone: '0798 258 950',
  bookingsPhoneHref: 'tel:+254798258950',
  secondPhone: '0783 209 442',
  secondPhoneHref: 'tel:+254783209442',
  /** The academy line, also on WhatsApp. */
  academyWhatsappNumber: '254116619476',
  academyPhone: '0116 619 476',
  academyPhoneHref: 'tel:+254116619476',
  email: 'mtviewsportsarena@gmail.com',
  addressLine: 'Behind Mountain View Mall, Waiyaki Way, Nairobi',
  hours: 'Every day, 08:00 to midnight',
  channels: [
    { name: 'Arena bookings', value: '0798 258 950', href: 'tel:+254798258950' },
    { name: 'Arena bookings, second line', value: '0783 209 442', href: 'tel:+254783209442' },
    { name: 'Academy & programs', value: '0116 619 476', href: 'tel:+254116619476' },
    {
      name: 'Email',
      value: 'mtviewsportsarena@gmail.com',
      href: 'mailto:mtviewsportsarena@gmail.com',
    },
  ] satisfies ContactChannel[],
  mapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.15647573428!2d36.75!3d-1.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f19f6a6c42171%3A0x6b40e704043f053e!2sMountain%20View%20Mall!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske',
} as const;

export const social = {
  instagram: 'mtviewsportsarena',
  tiktok: 'mountainviewsportsarena',
  facebook: 'mtviewsportsarena',
} as const;

/** The owner's own words, used to close pages. */
export const signature = "Let's meet at the Arena.";

/** Kick-off times offered by the picker. Reception confirms the slot. */
export const kickoffTimes = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] as const;
export const defaultKickoff = '20:00';

export const home = {
  hero: {
    titleTop: 'Lights on.',
    titleBottom: 'Game on.',
    body:
      'Floodlit 5-aside on synthetic turf, behind Mountain View Mall on Waiyaki Way. Book an hour, bring your squad, play until midnight.',
    imageAlt: 'The synthetic pitch at Mountain View Sports Arena, lines running toward the goal',
  },
  /**
   * The headline Arena price, set by the owner as marketing copy. The home
   * page leads with KES 1,500 and never lists any other band.
   */
  pricing: {
    eyebrow: 'Arena hire',
    name: 'The Arena',
    headline: 'From KES 1,500',
    unit: 'per hour',
    terms: 'whole hours',
    note: 'Full-day hire, meeting room and events: call or WhatsApp reception.',
  },
  marquee: ['Play', 'Compete', 'Connect', 'Floodlit 5-aside', 'Open until midnight', 'Waiyaki Way'],
  kickoff: {
    titleTop: 'Pick your',
    titleBottom: 'kick-off',
    body: 'Choose a time and we’ll open WhatsApp with your request ready to send. Reception confirms the slot.',
    markerCaption: 'Your squad’s hour',
  },
  bento: {
    titleTop: 'Built for',
    titleBottom: 'match night',
    tiles: [
      {
        tag: 'Under the lights',
        title: 'Floodlit to midnight',
        body: 'Shadow-free light across the whole pitch, so the late kick-off plays like the first.',
        cols: 2,
        rows: 2,
        size: 'lg',
        img: '/images/gallery/shot-01.webp',
      },
      { tag: 'Kit', title: 'Changing rooms & lockers', body: 'Change on site and lock your gear away.', cols: 2, rows: 1, size: 'md' },
      { tag: 'Between games', title: 'Free Wi-Fi & water', body: 'Stay connected and refill whenever you need.', cols: 1, rows: 1, size: 'sm' },
      { tag: 'Flexible', title: '1 hour minimum', body: 'Whole hours, 08:00 to midnight.', cols: 1, rows: 1, size: 'sm' },
      { tag: 'Teams & events', title: 'Meeting room', body: 'Team talks, training sessions and small events. Ask reception.', cols: 2, rows: 1, size: 'md' },
      { tag: 'Arena shop', title: 'Kit & balls', body: 'Tees, jerseys, trainers, yoga kit and balls. Ask what’s in today.', cols: 2, rows: 1, size: 'md' },
    ],
  },
  week: {
    titleTop: 'This week',
    titleBottom: 'at the Arena',
    body: 'The Arena is open every day. Regular sessions run on Saturdays.',
    fixtures: [
      { day: 'Daily', time: '08:00 – 00:00', what: 'The Arena is open for bookings', cta: 'Book', line: 'bookings' },
      { day: 'Sat', time: '10:00', what: 'Chess Club', cta: 'Join', line: 'academy' },
      { day: 'Sat', time: '14:00 – 16:00', what: 'Football Academy', cta: 'Join', line: 'academy' },
      { day: 'Any day', time: 'On request', what: 'Full-day hire & events', cta: 'Ask', line: 'bookings' },
    ],
  },
  programs: {
    titleTop: 'More than',
    titleBottom: 'a pitch',
  },
  photos: [
    { src: '/images/gallery/shot-01.webp', alt: 'The full pitch under the arena roof' },
    { src: '/images/gallery/shot-18.webp', alt: 'Corner line on the synthetic turf' },
    { src: '/images/gallery/shot-08.webp', alt: 'Low view across the pitch' },
    { src: '/images/gallery/shot-02.webp', alt: 'Floodlights and seating beside the pitch' },
  ],
  closing: {
    titleTop: 'Let’s meet at',
    titleBottom: 'the Arena',
  },
} as const;

export type BentoTile = (typeof home.bento.tiles)[number];

export const about = {
  eyebrow: 'About the Arena',
  titleTop: 'Play. Compete.',
  titleBottom: 'Connect.',
  intro:
    'Mountain View Sports Arena is a floodlit 5-aside pitch behind Mountain View Mall on Waiyaki Way, open every day from 08:00 to midnight.',
  story: [
    'We built the Arena so the neighbourhood has a proper place to play: a synthetic pitch under floodlights, somewhere to change, and a team at reception who know your squad by name.',
    'Book an hour for your five-a-side, bring the children to the academy on a Saturday, or use the meeting room for a team talk. Whatever brings you, the lights stay on until midnight.',
  ],
  amenities: [
    { title: 'Floodlit to midnight', body: 'Play late, every day of the week.' },
    { title: 'Changing rooms & lockers', body: 'Change on site and lock your gear away.' },
    { title: 'Free Wi-Fi & water', body: 'Stay connected and refill whenever you need.' },
    { title: 'Meeting room', body: 'Team talks, training sessions and small events. Ask reception.' },
  ],
  photos: [
    { src: '/images/gallery/shot-03.webp', alt: 'The pitch end to end, goals in frame' },
    { src: '/images/gallery/shot-16.webp', alt: 'The pitch at ground level, a white line running out' },
    { src: '/images/gallery/shot-13.webp', alt: 'The pitch from the far line' },
    { src: '/images/gallery/shot-22.webp', alt: 'The goalmouth and the centre circle' },
  ],
  partner: {
    title: 'Partner with the Arena',
    body: 'Businesses that want to support the academy or put their name beside the pitch can talk to us directly.',
    message: 'Hi MVSA, I would like to talk about partnering with the Arena.',
  },
} as const;

export const booking = {
  eyebrow: 'Book the Arena',
  titleTop: 'Book',
  titleBottom: 'the Arena',
  intro: 'The Arena from KES 1,500 an hour. Whole hours, one hour minimum, every day 08:00 to midnight.',
  /** The one calm block shown while online booking is not available. */
  offline: {
    title: 'Book on WhatsApp or by phone',
    body: 'Pick a kick-off and we’ll open WhatsApp with your request ready to send. Reception checks the diary and confirms your slot.',
    coming: 'Online booking is coming. Until then, reception books every slot by hand.',
    retry: 'Check for live times',
  },
} as const;
