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
 * Only facts the owner has approved appear here: open every day 06:00 to
 * midnight; the Arena from KSH 1,500 an hour, whole hours, one hour minimum;
 * the two booking lines, the academy line, the email and the handle. No other
 * price band is ever shown.
 */

/**
 * The public address of the site, used for share links and share cards.
 * Previews on Vercel still share the live address on purpose: that is the
 * link people should pass on.
 */
export const siteOrigin = 'https://www.mvsa.co.ke';

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
  hours: 'Every day, 06:00 to midnight',
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
export const signature = 'Bring your squad.';

/**
 * Kick-off times offered by the picker: every hour from opening at 06:00 to
 * 23:00, the last hour that ends by midnight. Reception confirms the slot.
 */
export const kickoffGroups = [
  { label: 'Morning', times: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'] },
  { label: 'Afternoon', times: ['12:00', '13:00', '14:00', '15:00', '16:00'] },
  { label: 'Evening', times: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'] },
] as const;
export const defaultKickoff = '20:00';

export const home = {
  hero: {
    titleTop: 'Your home of',
    titleBottom: 'football and fitness',
    body:
      'A covered, floodlit 5-aside pitch behind Mountain View Mall on Waiyaki Way, with the Academy, Chess Club, yoga, a meeting room and our own kit. Open every day.',
    imageAlt: 'The covered pitch at Mountain View Sports Arena from a corner: the roof, the goals and the centre circle',
  },
  /**
   * The headline Arena price, set by the owner as marketing copy. The home
   * page leads with KSH 1,500 and never lists any other band.
   */
  pricing: {
    eyebrow: 'Arena hire',
    name: 'The Arena',
    headline: 'From KSH 1,500',
    unit: 'per hour',
    terms: 'whole hours',
    note: 'Full-day hire, meeting room and events: call or WhatsApp reception.',
  },
  marquee: ['Play', 'Compete', 'Connect', 'Covered & floodlit', 'Open every day', 'Waiyaki Way'],
  whatsOn: {
    title: 'What’s on',
    body: 'Offers, the holiday programme and the regular sessions at the Arena right now.',
    empty: 'Nothing special this week: the Arena is open every day for bookings, and the regular sessions carry on.',
  },
  programs: {
    titleTop: 'More than',
    titleBottom: 'a pitch',
    body: 'Football, chess, yoga, boxing and dance, for children and adults. Every programme has its own page you can share.',
  },
  bento: {
    titleTop: 'Built for',
    titleBottom: 'match day',
    tiles: [
      {
        tag: 'Under the roof',
        title: 'Covered and floodlit',
        body: 'Rain or sun, morning or late: the pitch plays the same under the roof and the lights.',
        cols: 2,
        rows: 2,
        size: 'lg',
        img: '/images/arena/pitch-corner.webp',
      },
      { tag: 'Kit', title: 'Changing rooms & lockers', body: 'Change on site and lock your gear away.', cols: 2, rows: 1, size: 'md' },
      { tag: 'Between games', title: 'Free Wi-Fi & water', body: 'Stay connected and refill whenever you need.', cols: 1, rows: 1, size: 'sm' },
      { tag: 'Flexible', title: '1 hour minimum', body: 'Whole hours, every day.', cols: 1, rows: 1, size: 'sm' },
    ],
  },
  meetingRoom: {
    titleTop: 'Need a room',
    titleBottom: 'to think in?',
    body: 'The Arena’s meeting room is quiet, bright and ready for meetings, interviews, trainings and small workshops.',
    cta: 'See the meeting room',
  },
  shop: {
    titleTop: 'Wear',
    titleBottom: 'the Arena',
    body: 'Hoodies, tees, captain’s armbands and bottles with the Arena’s marks. Pick your size and order on WhatsApp.',
    cta: 'Visit the shop',
  },
  photos: [
    { src: '/images/arena/morning-turf.webp', alt: 'Morning light across the turf to the stand' },
    { src: '/images/gallery/shot-18.webp', alt: 'Corner line on the synthetic turf' },
    { src: '/images/arena/touchline.webp', alt: 'The touchline running the length of the covered pitch' },
    { src: '/images/gallery/shot-02.webp', alt: 'Floodlights and seating beside the pitch' },
  ],
  closing: {
    titleTop: 'Bring your',
    titleBottom: 'squad',
  },
} as const;

export type BentoTile = (typeof home.bento.tiles)[number];

export const about = {
  eyebrow: 'About the Arena',
  titleTop: 'Play. Compete.',
  titleBottom: 'Connect.',
  intro:
    'Mountain View Sports Arena is a floodlit 5-aside pitch behind Mountain View Mall on Waiyaki Way, open every day from 06:00 to midnight.',
  story: [
    'We built the Arena so the neighbourhood has a proper place to play: a synthetic pitch under floodlights, somewhere to change, and a reception team to sort out your booking.',
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
  eyebrow: 'Bookings',
  titleTop: 'Book the Arena',
  titleBottom: 'or the room',
  intro: 'The Arena from KSH 1,500 an hour, whole hours, one hour minimum, every day 06:00 to midnight. Or book the meeting room for your next meeting, interview or training.',
  /** The one calm block shown while online booking is not available. */
  offline: {
    title: 'Book on WhatsApp or by phone',
    body: 'Pick a kick-off and we’ll open WhatsApp with your request ready to send. Reception checks the diary and confirms your slot.',
    coming: 'Online booking is coming. Until then, reception books every slot by hand.',
    retry: 'Check for live times',
  },
} as const;

/**
 * The meeting room. No capacity figure and no price are published: the room
 * is set up for the group, and reception quotes on WhatsApp.
 */
export const meetingRoom = {
  eyebrow: 'Meeting room',
  titleTop: 'A quiet room',
  titleBottom: 'at the Arena',
  lede:
    'Bright, calm and away from the office: rows of chairs, a table up front, a whiteboard and a long wall of windows. Bring your team, your candidates or your class.',
  photoAlt: 'The meeting room: rows of green chairs facing a table and a whiteboard, windows along one wall',
  uses: [
    { id: 'meeting', label: 'Meeting', body: 'Planning days, board meetings and team talks.' },
    { id: 'interview', label: 'Interview', body: 'A private, quiet room to meet candidates.' },
    { id: 'training', label: 'Training', body: 'Chairs in rows, a whiteboard, a table up front.' },
    { id: 'workshop', label: 'Workshop', body: 'Small hands-on groups with room to move.' },
  ],
  features: ['Whiteboard', 'Daylight from a wall of windows', 'Table at the front', 'Seating for a group', 'Free Wi-Fi'],
  combo: 'Make a day of it: meet in the room, then play on the pitch.',
  note: 'Tell us the day, the time and how many people. Reception sets the room up and confirms on WhatsApp.',
} as const;
