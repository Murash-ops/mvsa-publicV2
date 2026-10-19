/**
 * The shop catalogue.
 *
 * Orders are not taken on this website. Every item hands over to WhatsApp
 * with the item named in the message, and reception confirms stock, size and
 * payment there. That is deliberate: a real checkout needs stock control,
 * payment capture, refunds and reconciliation, none of which exist, and a
 * page that takes money it cannot account for is worse than no shop.
 *
 * While `draft` is true the list is a placeholder for review. The item names
 * are the real ranges, but no price, size or photograph is published, because
 * a price on a public page is a price the venue has to honour. The page is
 * reachable at /shop and stays out of the navigation until the list is real.
 *
 * Prices are whole shillings, written the way the rest of the site writes
 * money: `KES 1,500`. Keep them in step with what reception charges - there
 * is no backend to check them against, so this file is the only record.
 */

export type ShopItem = {
  /** Stable, lowercase, hyphenated. Used in the URL and the order message. */
  id: string;
  name: string;
  /** One line. What it is, not how wonderful it is. */
  description: string;
  /** Whole shillings, e.g. 1500. Omit when the price depends on the order. */
  priceKes?: number;
  /** A photograph in /public/images/shop. Omit until one exists. */
  image?: { src: string; w: number; h: number };
  /** Sizes, colours or variants reception will ask about. */
  options?: string[];
  /** False when it is out of stock but still worth showing. */
  available?: boolean;
};

/**
 * True until the real names, prices and photographs are in. It gates the
 * navigation link and puts a notice on the page, so a half-filled catalogue
 * can never go out as if it were finished.
 */
export const draft = true;

/**
 * The ranges the arena sells. Prices and sizes are deliberately absent while
 * `draft` is true - every card asks the customer to check on WhatsApp, which
 * is true today and will stay true for anything that varies.
 */
export const catalogue: ShopItem[] = [
  {
    id: 'club-tee',
    name: 'Mountain View T-Shirt',
    description: 'The arena tee, worn on and off the pitch.',
  },
  {
    id: 'jersey',
    name: 'Match Jersey',
    description: 'Playing jersey in the club colours, for teams and for keeping.',
  },
  {
    id: 'trainers',
    name: 'Trainers',
    description: 'Footwear for turf and for the gym floor.',
  },
  {
    id: 'yoga-kit',
    name: 'Yoga Equipment',
    description: 'Mats, blocks and straps for the studio sessions.',
  },
  {
    id: 'balls',
    name: 'Balls',
    description: 'Match and training balls, sized for the five-a-side pitch.',
  },
];

export const shop = {
  title: 'Arena Shop',
  intro:
    'Kit and essentials, sold at the arena. Pick what you want and send us a message - we confirm stock and price on WhatsApp, and you pay at the counter or on M-Pesa.',
  /** Shown instead of the grid while the catalogue is empty. */
  emptyHeading: 'The shop is being set up',
  emptyBody:
    'There is nothing listed yet. Ask at reception for kit and match essentials, or send us a message and we will tell you what is in.',
  /** Said once, near the ordering buttons, so nobody expects a checkout. */
  orderNote: 'Nothing is bought on this page. The button opens WhatsApp with your item filled in.',
  /** Shown while `draft` is true, in place of the ordering note. */
  draftNote:
    'Draft. These are the ranges we stock - prices, sizes and photographs are still being confirmed, so ask on WhatsApp for what is in today.',
} as const;

/** The navigation lists the shop only once the real list is in. */
export const shopIsListed = !draft && catalogue.length > 0;

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

/**
 * The message the customer sends. It names the item so reception does not
 * have to ask what the message is about, and leaves the quantity and name to
 * the customer rather than inventing either.
 */
export function orderMessage(item: ShopItem): string {
  const price = item.priceKes === undefined ? '' : ` (${formatKes(item.priceKes)})`;
  return `Hi MVSA, I would like to order: ${item.name}${price}. My name is `;
}

export function orderUrl(whatsappNumber: string, item: ShopItem): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage(item))}`;
}
