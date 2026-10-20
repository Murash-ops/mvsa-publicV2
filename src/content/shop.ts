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
  /** Which shelf it sits on, for the filter. */
  category?: ShopCategory;
  /** Which of the two approved marks it carries. */
  mark?: 'classic' | 'helmets';
};

export type ShopCategory = 'hoodies' | 'tees' | 'gear';

export const categories: { id: ShopCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All kit' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'tees', label: 'Tees' },
  { id: 'gear', label: 'Gear' },
];

/**
 * True until the real names, prices and photographs are in. It gates the
 * navigation link and puts a notice on the page, so a half-filled catalogue
 * can never go out as if it were finished.
 */
export const draft = false;

/**
 * Arena Kit, drop 01: the merchandise, each piece carrying one of the two
 * approved marks. The photographs are design previews made from the real
 * logo artwork, and the page says so. Prices and sizes are confirmed on
 * WhatsApp while `draft` is true.
 */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const catalogue: ShopItem[] = [
  {
    id: 'floodlit-hoodie',
    name: 'Floodlit Hoodie',
    description: 'Heavyweight black hoodie with the classic emblem in gold across the chest.',
    image: { src: '/images/shop/floodlit-hoodie.webp', w: 1200, h: 1200 },
    options: SIZES,
    category: 'hoodies',
    mark: 'classic',
  },
  {
    id: 'pitch-hoodie',
    name: 'Pitch Hoodie',
    description: 'Pitch-green hoodie with the helmets in white. Warm-ups, cold evenings, the walk home.',
    image: { src: '/images/shop/pitch-hoodie.webp', w: 1200, h: 1200 },
    options: SIZES,
    category: 'hoodies',
    mark: 'helmets',
  },
  {
    id: 'classic-tee',
    name: 'Classic Tee',
    description: 'White cotton tee with the classic emblem in black.',
    image: { src: '/images/shop/classic-tee.webp', w: 1200, h: 1200 },
    options: SIZES,
    category: 'tees',
    mark: 'classic',
  },
  {
    id: 'helmet-tee',
    name: 'Helmet Tee',
    description: 'Black training tee with the gold helmets on the chest.',
    image: { src: '/images/shop/helmet-tee.webp', w: 1200, h: 1200 },
    options: SIZES,
    category: 'tees',
    mark: 'helmets',
  },
  {
    id: 'captains-armband',
    name: 'Captain’s Armband',
    description: 'Elastic captain’s band in black with the gold helmets. Lead the squad.',
    image: { src: '/images/shop/captains-armband.webp', w: 1200, h: 1200 },
    options: ['Junior', 'Senior'],
    category: 'gear',
    mark: 'helmets',
  },
  {
    id: 'arena-bottle',
    name: 'Arena Bottle',
    description: 'Insulated steel bottle, matte black with the gold helmets. Cold through a full session.',
    image: { src: '/images/shop/arena-bottle.webp', w: 1200, h: 1200 },
    category: 'gear',
    mark: 'helmets',
  },
  {
    id: 'squad-bottle',
    name: 'Squad Bottle',
    description: 'Squeeze bottle for the bench, frosted with the classic emblem.',
    image: { src: '/images/shop/squad-bottle.webp', w: 1200, h: 1200 },
    category: 'gear',
    mark: 'classic',
  },
];

/** What reception also sells at the counter, without photographs. */
export const counterRanges = ['Match and training balls', 'Trainers', 'Yoga mats and blocks', 'Match jerseys'];

export const shop = {
  eyebrow: 'Arena Kit · Drop 01',
  title: 'Arena Shop',
  titleTop: 'Wear',
  titleBottom: 'the Arena',
  intro:
    'Hoodies, tees, captain’s armbands and bottles with the Arena’s marks. Pick your size and send us a message: we confirm stock and price on WhatsApp, and you pay at the counter or on M-Pesa.',
  /** Said under the grid: the photographs are previews, not product shots. */
  previewNote: 'Photos are design previews of the kit.',
  /** Shown instead of the grid while the catalogue is empty. */
  emptyHeading: 'The shop is being set up',
  emptyBody:
    'There is nothing listed yet. Ask at reception for kit and match essentials, or send us a message and we will tell you what is in.',
  /** Said once, near the ordering buttons, so nobody expects a checkout. */
  orderNote: 'Prices on WhatsApp: pick your size, tap Order, and reception confirms the price and stock. Nothing is bought on this page.',
  /** Shown while `draft` is true, in place of the ordering note. */
  draftNote:
    'Draft. Arena Kit is new: prices and stock are being confirmed, so ask on WhatsApp for what is in today.',
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
export function orderMessage(item: ShopItem, option?: string): string {
  const price = item.priceKes === undefined ? '' : ` (${formatKes(item.priceKes)})`;
  // Only an option the item really offers goes in the message.
  const valid = option !== undefined && item.options?.includes(option);
  const choice = valid ? `, ${SIZES.includes(option) ? `size ${option}` : option}` : '';
  return `Hi MVSA, I would like to order: ${item.name}${choice}${price}. My name is `;
}

export function orderUrl(whatsappNumber: string, item: ShopItem, option?: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage(item, option))}`;
}
