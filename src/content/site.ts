/**
 * Editorial copy for the public site.
 *
 * This used to live in a `site_content` table and was fetched on every render.
 * The MVSA backend has no site-content endpoint and should not get one: this is
 * marketing copy, not venue data. Keeping it here means it is version
 * controlled, reviewable in a pull request, type checked, and renders with no
 * database and no network call.
 *
 * Venue FACTS (address, opening hours, prices, phone) are NOT here. They come
 * from GET /v1/knowledge/facts, which is their approved source of truth.
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
  bookingsPhoneHref: 'tel:0798258950',
  email: 'mtviewsportsarena@gmail.com',
  addressLine: 'Behind Mountain View Mall, Waiyaki Way, Nairobi.',
  channels: [
    { name: 'Arena Bookings (Turf)', value: '0798 258 950', href: 'tel:0798258950' },
    { name: 'Academy & Programs', value: '0116 619 476', href: 'tel:0116619476' },
    { name: 'Secondary Line', value: '0783 209 442', href: 'tel:0783209442' },
    {
      name: 'Official Email',
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

export const home = {
  heroHeadline: 'Home of Football \n& Fitness',
  heroSubheading:
    'Premium synthetic turf. Floodlit nights. Behind Mountain View Mall, Waiyaki Way.',
  heroTextAboveCta:
    'Want to see the arena in action? Follow us on Instagram and TikTok @mtviewsportsarena',
  /** Local asset: keeps the hero out of the Content-Security-Policy img-src list. */
  heroImageUrl: '/images/gallery/shot-01.webp',
  closingCtaHeadline: 'Book Your Slot Today',
  trustCards: [
    {
      title: 'Changing Rooms & Lockers',
      description: 'Private premium changing stalls and secure smart lockers for your gear.',
    },
    {
      title: 'Free WiFi & Water',
      description: 'High-speed clubhouse connection and unlimited filtered hydration station.',
    },
    {
      title: 'Floodlit Until Midnight',
      description:
        'Shadow-free matches under high-intensity lighting, right up to the midnight close.',
    },
  ],
} as const;

export const about = {
  subtitle:
    'A premium recreational sanctuary dedicated to physical mastery, elite training, and community connection.',
  storyTitle: 'Our Mission',
  storyText:
    'Mountain View Sports Arena (MVSA) was born from a simple vision: to create a world-class sports destination in the heart of our community.\n\nWe believe that sports have the power to transform lives—building character in youth, health in adults, and unity in communities. MVSA provides more than just a pitch; we provide an ecosystem where athletes of all levels can thrive and excel.',
  turfSpec: '100% Premium Synthetic Turf',
  securitySpec: '24/7 Monitored Facility Security',
} as const;

export const booking = {
  /** Shown whenever the backend cannot be reached, on any page. */
  unreachableNotice:
    'We cannot reach the arena booking system right now, so live availability is not showing.',
  unreachableAction: 'Call or WhatsApp reception and they will confirm your slot by hand.',
} as const;
