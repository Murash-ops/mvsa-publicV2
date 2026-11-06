/**
 * Each programme's own page: its theme, its voice and its words.
 *
 * The facts (when, who) come from src/lib/academy-programs.ts. This file is the
 * editorial layer on top: what makes chess feel like chess and yoga feel like
 * yoga, while every page stays one family (same fonts, same green, paper and
 * brass, same register block).
 *
 * House rules that apply to every word below (MVSA/social/brand.md):
 * - No Academy or chess prices, fees, Till numbers or payment instructions.
 *   Those are shared on WhatsApp only.
 * - Yoga is donation-based. Never "free".
 * - "Chess Club" leads the chess headline. No wordplay headlines.
 * - No child's face in any photograph.
 */

export type ProgramTheme = 'pathway' | 'holiday' | 'board' | 'breath' | 'ring' | 'beat' | 'drill' | 'event';

export interface ProgramPoint {
  title: string;
  body: string;
}

export interface ProgramPhoto {
  src: string;
  alt: string;
  /**
   * duotone: forest-to-cream, used whenever children could be in frame so
   * nobody can be made out. natural: the photo's own colour.
   */
  treatment: 'duotone' | 'natural';
  position?: string;
}

/**
 * The one section only this programme's page has: the Academy's pathway,
 * a first Saturday at Chess Club, a day at holiday training, and so on.
 * Only facts from brand.md; otherwise it describes the experience.
 */
export interface ProgramFeature {
  title: string;
  /** steps: a real sequence, numbered. timeline: times down the side. cards: side by side. */
  kind: 'steps' | 'timeline' | 'cards';
  items: { label?: string; title: string; body: string }[];
}

export interface ProgramStory {
  slug: string;
  theme: ProgramTheme;
  /** The tag that sits tilted above the name. */
  kicker: string;
  /** The name, broken where it should break on the page. */
  headline: string[];
  /** The one big thing you read first after the name: the time. */
  focal: string;
  focalLabel: string;
  lede: string;
  photo?: ProgramPhoto;
  feature?: ProgramFeature;
  /** A week laid out day by day (holiday training). */
  week?: { day: string; who: string }[];
  points?: ProgramPoint[];
  goodToKnow: string[];
  register: {
    heading: string;
    /** The button. */
    label: string;
    /** The WhatsApp message, pre-filled. */
    message: string;
    note: string;
  };
  /** An approved online form, shown as a second way in. */
  formUrl?: string;
  /** One line for the share preview card. */
  shareLine: string;
  /** A duotone photo in assets/og-photos for the share card. */
  ogPhoto?: string;
}

const registerMessage = (name: string) => `Hi MVSA, I'd like to register for ${name}`;

export const ACADEMY_FORM_URL = 'https://forms.gle/GpmVs2tDkw2MLuDD7';

export const stories: ProgramStory[] = [
  {
    slug: 'football-academy',
    theme: 'pathway',
    kicker: 'Mountain View Sports Academy',
    headline: ['Football', 'Academy'],
    focal: 'Sat & Sun',
    focalLabel: 'Every weekend',
    lede:
      'Players aged 6 to 17 learn the game properly on the Arena every Saturday and Sunday: first touch, then small-sided games, then match play, with the academy coaches.',
    photo: {
      src: '/images/programs/boots-and-ball.webp',
      alt: 'Boots, a ball and training cones on the Arena’s white line',
      treatment: 'duotone',
      position: 'center 40%',
    },
    feature: {
      title: 'The pathway',
      kind: 'steps',
      items: [
        { title: 'First touch', body: 'Ball mastery, passing and moving: the habits every good player is built on.' },
        { title: 'Small-sided games', body: 'Fewer players per side, so everyone is on the ball and making decisions.' },
        { title: 'Match play', body: 'Positions, teamwork and real games on a covered, floodlit 5-aside pitch.' },
      ],
    },
    points: [
      { title: 'Green kit', body: 'Registration includes the green kit: jersey, shorts and socks. Bring your own boots.' },
      { title: 'Covered and floodlit', body: 'The Arena is roofed and lit, behind Mountain View Mall on Waiyaki Way.' },
    ],
    goodToKnow: ['For ages 6 to 17. Training is on Saturdays and Sundays; WhatsApp us for session times.', 'WhatsApp us to register and we will send you the details.'],
    register: {
      heading: 'Start the pathway',
      label: 'WhatsApp us to register',
      message: registerMessage('Football Academy'),
      note: 'Tap to open WhatsApp with your message ready to send. We reply with the details.',
    },
    formUrl: ACADEMY_FORM_URL,
    shareLine: 'Ages 6–17. Saturdays and Sundays on the Arena.',
    ogPhoto: 'boots-and-ball.jpg',
  },
  {
    slug: 'holiday-training',
    theme: 'holiday',
    kicker: 'School’s out',
    headline: ['Holiday', 'Training'],
    focal: '11am–1pm',
    focalLabel: 'Monday to Saturday',
    lede:
      'Six days a week of proper football while the schools are closed. Coached sessions by age group, green kit included, until Saturday 19 December.',
    photo: {
      src: '/images/arena/corner-flag-line.webp',
      alt: 'The corner of the Arena at turf level, the white line curving away',
      treatment: 'natural',
      position: 'center 70%',
    },
    feature: {
      title: 'A day at holiday training',
      kind: 'timeline',
      items: [
        { label: '11am', title: 'Kick-off', body: 'Kit on, boots laced. Your group’s coach starts the session.' },
        { label: '11am–1pm', title: 'Two hours on the pitch', body: 'Each day has its own groups and its own focus: see the week below.' },
        { label: '1pm', title: 'Home time', body: 'Sessions end at 1pm, Monday to Saturday, until 19 December.' },
      ],
    },
    week: [
      { day: 'Mon', who: 'Strength & conditioning, all groups' },
      { day: 'Tue', who: 'Under 11 & goalkeepers' },
      { day: 'Wed', who: 'Under 13 & Under 15' },
      { day: 'Thu', who: 'Under 11 & goalkeepers' },
      { day: 'Fri', who: 'Under 13 & Under 15' },
      { day: 'Sat', who: 'All groups' },
    ],
    points: [
      { title: 'Coached', body: 'Every session is run by the Academy coaches.' },
      { title: 'By age group', body: 'Each group has its own days, so children train with players their age.' },
      { title: 'Green kit included', body: 'Jersey, shorts and socks. Bring your own boots.' },
    ],
    goodToKnow: [
      'Sessions run from 11am to 1pm, Monday to Saturday, until Saturday 19 December 2026.',
      'WhatsApp us to register and we will confirm your child’s group.',
    ],
    register: {
      heading: 'Book their holiday in',
      label: 'WhatsApp us to register',
      message: registerMessage('Holiday Training'),
      note: 'Tap to open WhatsApp with your message ready to send. We reply with the details.',
    },
    shareLine: 'Mon–Sat, 11am–1pm, to 19 December. Green kit included.',
    ogPhoto: 'corner-flag-line.jpg',
  },
  {
    slug: 'chess-club',
    theme: 'board',
    kicker: 'Mountain View Sports Academy',
    headline: ['Chess', 'Club'],
    focal: 'Sat 10am',
    focalLabel: 'Every Saturday',
    lede:
      'Chess Club is for children, every Saturday at 10am, at real boards with our chess coach: how the pieces work together, how to plan ahead, and how to win and lose well.',
    photo: {
      src: '/images/programs/chess-boards.webp',
      alt: 'Chess boards set up on the tables, pieces ready',
      treatment: 'natural',
      position: 'center 70%',
    },
    feature: {
      title: 'Your first Saturday',
      kind: 'timeline',
      items: [
        { label: 'Before 10am', title: 'Just come', body: 'First time? Just come at 10am. Walk-ins are welcome.' },
        { label: '10am', title: 'Chess Club starts', body: 'Children sit down at the boards with our chess coach.' },
        { label: 'After', title: 'Keep playing', body: 'WhatsApp us for details and we will tell you everything on the chat.' },
      ],
    },
    goodToKnow: ['Chess Club is for children.', 'First time? Just come at 10am.'],
    register: {
      heading: 'Chess Club, every Saturday at 10am',
      label: 'WhatsApp us for details',
      message: registerMessage('Chess Club'),
      note: 'Tap to open WhatsApp with your message ready to send. We reply with the details.',
    },
    shareLine: 'Every Saturday, 10am. First time? Just come at 10am.',
    ogPhoto: 'chess-boards.jpg',
  },
  {
    slug: 'community-yoga',
    theme: 'breath',
    kicker: 'Donation-based',
    headline: ['Community', 'Yoga'],
    focal: 'Fri 9am',
    focalLabel: 'Every Friday',
    lede:
      'Slow down before the weekend. A yoga class on the covered pitch every Friday at 9am, open to every level. It is donation-based: give what you can.',
    photo: {
      src: '/images/programs/yoga.webp',
      alt: 'A yoga class on mats on the covered pitch',
      treatment: 'natural',
      position: 'center 55%',
    },
    feature: {
      title: 'What a session is like',
      kind: 'cards',
      items: [
        { title: 'Mats on the turf', body: 'The class is on the covered pitch, under the roof, with the morning coming in through the open sides.' },
        { title: 'Your own pace', body: 'Beginners and regulars side by side, each going as far as feels right.' },
        { title: 'Give what you can', body: 'There is no set price. The class runs on donations.' },
      ],
    },
    goodToKnow: ['Every Friday at 9am.', 'Donation-based: give what you can.'],
    register: {
      heading: 'Join us on Friday',
      label: 'Save me a spot',
      message: registerMessage('Community Yoga'),
      note: 'Tap to open WhatsApp with your message ready to send.',
    },
    shareLine: 'Every Friday, 9am, on the covered pitch. Donation-based.',
    ogPhoto: 'yoga.jpg',
  },
  {
    slug: 'boxing',
    theme: 'ring',
    kicker: 'Sundays',
    headline: ['Boxing'],
    focal: 'Sun 3pm',
    focalLabel: 'Every Sunday',
    lede: 'Boxing at the Arena, Sundays at 3pm. WhatsApp us for details.',
    goodToKnow: ['Sundays at 3pm.', 'WhatsApp us for details.'],
    register: {
      heading: 'Sundays, 3pm',
      label: 'WhatsApp us for details',
      message: "Hi MVSA, I'd like details about Boxing",
      note: 'Tap to open WhatsApp with your message ready to send.',
    },
    shareLine: 'Sundays, 3pm. WhatsApp us for details.',
  },
  {
    slug: 'dance',
    theme: 'beat',
    kicker: 'Coming soon',
    headline: ['Dance &', 'Rhythm'],
    focal: 'Soon',
    focalLabel: 'Coming',
    lede: 'Dance & Rhythm is coming to the Arena. WhatsApp us and we will tell you first when classes start.',
    goodToKnow: ['Classes have not started yet.', 'WhatsApp us and we will let you know first.'],
    register: {
      heading: 'Hear it first',
      label: 'Ask us',
      message: "Hi MVSA, please tell me when Dance & Rhythm starts",
      note: 'Tap to open WhatsApp with your message ready to send.',
    },
    shareLine: 'Coming soon to the Arena. WhatsApp us to hear first.',
  },
  {
    slug: 'individual-training',
    theme: 'drill',
    kicker: 'On the Arena',
    headline: ['Individual', 'Training'],
    focal: '1–5',
    focalLabel: 'Players',
    lede:
      'Your own time on the Arena to work on what your game needs. Come on your own or bring up to four teammates.',
    photo: {
      src: '/images/arena/turf-close.webp',
      alt: 'The Arena turf close up, a white line in the foreground',
      treatment: 'natural',
      position: 'center 75%',
    },
    feature: {
      title: 'How a session works',
      kind: 'steps',
      items: [
        { title: 'Tell us', body: 'WhatsApp us the day and how many of you are coming, from one player to five.' },
        { title: 'We confirm', body: 'Reception finds a free hour on the Arena and confirms on WhatsApp.' },
        { title: 'Train', body: 'Finishing, first touch, fitness: the session is for whatever your game needs.' },
      ],
    },
    goodToKnow: ['For one to five players.', 'Ask on WhatsApp for free times and the rate for your group.'],
    register: {
      heading: 'Put in the work',
      label: 'Ask for a session',
      message: registerMessage('Individual Training'),
      note: 'Tap to open WhatsApp with your message ready to send.',
    },
    shareLine: 'Your own session on the Arena, for one to five players.',
    ogPhoto: 'turf-close.jpg',
  },
  {
    slug: 'events',
    theme: 'event',
    kicker: 'Host it at the Arena',
    headline: ['Events'],
    focal: '6am–midnight',
    focalLabel: 'Every day',
    lede: 'Events on a covered, floodlit pitch. Tell us the day and how many people, and we will plan it with you.',
    photo: {
      src: '/images/programs/night-game.webp',
      alt: 'An evening game on the Arena under the floodlights',
      treatment: 'natural',
      position: 'center 55%',
    },
    feature: {
      title: 'What we can host',
      kind: 'cards',
      items: [
        { title: 'Tournaments', body: 'Bring the teams. The pitch is covered and floodlit, morning or night.' },
        { title: 'Team days', body: 'A game for the office or the group, with the meeting room for the briefing.' },
        { title: 'Get-togethers', body: 'Mark the occasion around a game on the Arena.' },
      ],
    },
    points: [{ title: 'Sound', body: 'A PA system is available on request.' }],
    goodToKnow: ['Tell us the date, the time and roughly how many people, and we will come back with a plan and a quote.'],
    register: {
      heading: 'Bring everyone',
      label: 'Plan your event',
      message: "Hi MVSA, I'd like to plan an event at the Arena",
      note: 'Tap to open WhatsApp with your message ready to send.',
    },
    shareLine: 'Events on a covered, floodlit pitch, open 6am to midnight.',
    ogPhoto: 'night-game.jpg',
  },
];

export function getStory(slug: string): ProgramStory | undefined {
  return stories.find((story) => story.slug === slug);
}
