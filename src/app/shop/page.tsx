import Image from 'next/image';
import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import Marquee from '@/components/arena/Marquee';
import ShopGrid from '@/components/shop/ShopGrid';
import { contact } from '@/content/site';
import { catalogue, counterRanges, draft, shop } from '@/content/shop';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Arena Kit | Mountain View Sports Arena',
  description: 'Hoodies, tees, captain’s armbands and bottles with the Arena’s marks. Order over WhatsApp.',
};

export default function ShopPage() {
  const inStock = catalogue.filter((item) => item.available !== false);
  const reception = whatsappUrl(contact.whatsappNumber);

  return (
    <main className="theme-light relative isolate [clip-path:inset(0)]">
      {/* The pitch behind the whole shop, under a cream wash light enough for
          the photo to show and strong enough for the words to read. It is
          fixed to the screen (and clipped to the shop) so a long page on a
          phone doesn't stretch the photo into a blur. */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
        <Image src="/images/gallery/shot-01.webp" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[rgba(245,242,234,0.8)]" />
      </div>
      <PageHeader eyebrow={shop.eyebrow} titleTop={shop.titleTop} titleBottom={shop.titleBottom} intro={shop.intro} />

      {catalogue.length > 0 ? <Marquee items={['Wear the Arena', 'Bring your squad', 'Arena Kit', 'Drop 01']} /> : null}

      <div className="wrap pt-10 pb-[clamp(56px,7vw,88px)]">
        {catalogue.length === 0 ? (
          /* An empty catalogue says so. It never pretends to be a shop with
             nothing in it today. */
          <section className="flex max-w-2xl flex-col gap-4 border border-white/10 bg-surface p-8">
            <h2 className="display m-0 text-3xl leading-none">{shop.emptyHeading}</h2>
            <p className="m-0 text-base leading-relaxed text-fog">{shop.emptyBody}</p>
            <a href={reception} target="_blank" rel="noopener noreferrer" className="btn btn-gold self-start">
              Message reception
            </a>
          </section>
        ) : (
          <>
            {draft ? (
              /* A draft list says so in plain words, above the grid, so nothing
                 on the page can be mistaken for a published price. */
              <p className="m-0 mb-4 max-w-2xl border-l-2 border-gold pl-4 text-base leading-relaxed text-fog">
                {shop.draftNote}
              </p>
            ) : null}

            <p className="mt-0 mb-8 text-base text-gold">{shop.orderNote}</p>

            <ShopGrid items={inStock} whatsappNumber={contact.whatsappNumber} />

            <p className="mt-6 mb-0 text-sm text-mute">{shop.previewNote}</p>

            {inStock.length < catalogue.length ? (
              <p className="mt-4 text-base text-mute">
                Some items are out of stock and are not listed. Ask reception on {contact.whatsappDisplay}.
              </p>
            ) : null}

            <section className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex max-w-md flex-col gap-2">
                <h2 className="label m-0 text-[13px] tracking-[0.16em] text-gold">Also at the counter</h2>
                <p className="m-0 text-base leading-relaxed text-fog">
                  {counterRanges.join(' · ')}. Not sure of your size? Ask reception on{' '}
                  <span className="text-white">{contact.whatsappDisplay}</span>.
                </p>
              </div>
              <a href={reception} target="_blank" rel="noopener noreferrer" className="btn btn-gold shrink-0">
                Message reception
              </a>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
