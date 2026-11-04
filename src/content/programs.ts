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
  /** Only for content that really is a sequence. */
  steps?: ProgramPoint[];
  /** A week laid out day by day (holiday training). */
  week?: { day: string; who: string }[];
  points: ProgramPoint[];
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
    focal: 'Sat 2–4pm',
    focalLabel: 'Every Saturday',
    lede:
      'Young players learn the game properly on the Arena every Saturday afternoon: first touch, then small-sided games, then match play. Ages 6 to 16, led by the academy coaches.',
    photo: {
      src: '/images/programs/boots-and-ball.webp',
      alt: 'Boots, a ball and training cones on the Arena’s white line',
      treatment: 'duotone',
      position: 'center 40%',
    },
    steps: [
      { title: 'First touch', body: 'Ball mastery, passing and moving: the habits every good player is built on.' },
      { title: 'Small-sided games', body: 'Fewer players per side, so everyone is on the ball and making decisions.' },
      { title: 'Match play', body: 'Positions, teamwork and real games on a covered, floodlit 5-aside pitch.' },
    ],
    points: [
      { title: 'Ages 6 to 16', body: 'Boys and girls, from a first kick to players who already have a team.' },
      { title: 'Green kit', body: 'Registration includes the green kit: jersey, shorts and socks. Bring your own boots.' },
      { title: 'Under the roof', body: 'The Arena is covered and floodlit, behind Mountain View Mall on Waiyaki Way.' },
    ],
    goodToKnow: [
      'Training is on Saturdays from 2pm to 4pm.',
      'Message us to register and we will send everything you need on WhatsApp.',
    ],
    register: {
      heading: 'Start the pathway',
      label: 'Register now',
      message: registerMessage('Football Academy'),
      note: 'Tap to open WhatsApp with your message ready to send. We reply with the details.',
    },
    formUrl: ACADEMY_FORM_URL,
    shareLine: 'Saturdays 2–4pm on the Arena. Ages 6–16.',
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
      'Six days a week of proper football while the schools are closed. Coached sessions by age group, green kit included, from Monday 2 November to Saturday 19 December.',
    photo: {
      src: '/images/arena/corner-flag-line.webp',
      alt: 'The corner of the Arena at turf level, the white line curving away',
      treatment: 'natural',
      position: 'center 70%',
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
      'Message us to register and we will confirm your child’s group on WhatsApp.',
    ],
    register: {
      heading: 'Book their holiday in',
      label: 'Register now',
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
      'Every Saturday at 10am, children sit down at real boards with our chess coach. They learn how the pieces work together, how to plan ahead, and how to win and lose well.',
    photo: {
      src: '/images/programs/chess-boards.webp',
      alt: 'Chess boards set up on the tables, pieces ready',
      treatment: 'natural',
      position: 'center 70%',
    },
    points: [
      { title: 'For children', body: 'The Saturday club is for children, from first moves to their first tournament.' },
      { title: 'Coached', body: 'Led by our chess coach, one board and one idea at a time.' },
      { title: 'Walk-ins welcome', body: 'First time? Just come at 10am.' },
    ],
    goodToKnow: [
      'The club meets every Saturday at 10am.',
      'WhatsApp us for details and we will tell you everything on the chat.',
    ],
    register: {
      heading: 'Take a seat at the board',
      label: 'Register now',
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
    points: [
      { title: 'Every level', body: 'Beginners and regulars on the same pitch, each at their own pace.' },
      { title: 'Under the roof', body: 'Mats on the turf, the open sides letting the morning in.' },
      { title: 'Give what you can', body: 'There is no set price. The class runs on donations.' },
    ],
    goodToKnow: [
      'Bring a mat if you have one. Yoga mats and blocks are also sold at the counter.',
      'Arrive a few minutes early to find your spot.',
    ],
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
    kicker: 'Adults',
    headline: ['Boxing'],
    focal: 'Sun 3pm',
    focalLabel: 'Every Sunday',
    lede:
      'Gloves on, Sunday afternoons. Conditioning, pad work and technique, whether it is your first session or you train every week.',
    points: [
      { title: 'Conditioning', body: 'Rounds that build the fitness the rest of your week will notice.' },
      { title: 'Pad work', body: 'Combinations on the pads, with a partner holding.' },
      { title: 'Technique', body: 'Stance, footwork and defence, built up step by step.' },
    ],
    goodToKnow: ['Sessions are for adults.', 'Message us before your first session and we will tell you what to bring.'],
    register: {
      heading: 'Step in',
      label: 'Register now',
      message: registerMessage('Boxing'),
      note: 'Tap to open WhatsApp with your message ready to send.',
    },
    shareLine: 'Sundays, 3pm. Conditioning, pads and technique.',
  },
  {
    slug: 'dance',
    theme: 'beat',
    kicker: 'Mountain View Sports Academy',
    headline: ['Dance &', 'Rhythm'],
    focal: '6–16',
    focalLabel: 'Ages',
    lede:
      'Rhythm, movement and choreography for children: finding the beat, learning routines and performing them together.',
    points: [
      { title: 'Rhythm', body: 'Counting, clapping and moving on the beat.' },
      { title: 'Movement', body: 'Coordination, balance and the confidence to take up space.' },
      { title: 'Choreography', body: 'Learning routines and dancing them as a group.' },
    ],
    goodToKnow: ['Ask on WhatsApp for the next class time.'],
    register: {
      heading: 'Find the beat',
      label: 'Register now',
      message: registerMessage('Dance & Rhythm'),
      note: 'Tap to open WhatsApp with your message ready to send. We reply with class times.',
    },
    shareLine: 'Rhythm, movement and choreography for ages 6–16.',
  },
  {
    slug: 'individual-training',
    theme: 'drill',
    kicker: 'On the Arena',
    headline: ['Individual', 'Training'],
    focal: '1–5',
    focalLabel: 'Players',
    lede:
      'Your own time on the Arena to work on what your game needs: finishing, first touch, fitness. Come on your own or bring up to four teammates.',
    photo: {
      src: '/images/arena/turf-close.webp',
      alt: 'The Arena turf close up, a white line in the foreground',
      treatment: 'natural',
      position: 'center 75%',
    },
    points: [
      { title: 'Your focus', body: 'Shooting, passing, fitness: you decide what the session is for.' },
      { title: 'Small groups', body: 'One player, or a group of up to five.' },
      { title: 'Any day', body: 'The Arena is open every day, so pick a time that suits you.' },
    ],
    goodToKnow: ['Ask on WhatsApp for free times and the rate for your group.'],
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
    lede:
      'Tournaments, company team days and celebrations on a covered, floodlit pitch. Tell us the day and how many people, and we will set up the Arena.',
    photo: {
      src: '/images/programs/night-game.webp',
      alt: 'An evening game on the Arena under the floodlights',
      treatment: 'natural',
      position: 'center 55%',
    },
    points: [
      { title: 'Covered and floodlit', body: 'Rain or shine, morning or night.' },
      { title: 'Sound', body: 'A PA system is available on request.' },
      { title: 'Room to gather', body: 'Use the meeting room for briefings, prize-giving or a meal.' },
    ],
    goodToKnow: ['Tell us the date, the time and roughly how many people, and we will come back with a plan and a quote.'],
    register: {
      heading: 'Bring everyone',
      label: 'Plan your event',
      message: "Hi MVSA, I'd like to plan an event at the Arena",
      note: 'Tap to open WhatsApp with your message ready to send.',
    },
    shareLine: 'Tournaments, team days and celebrations, open 6am to midnight.',
    ogPhoto: 'night-game.jpg',
  },
];

export function getStory(slug: string): ProgramStory | undefined {
  return stories.find((story) => story.slug === slug);
}
