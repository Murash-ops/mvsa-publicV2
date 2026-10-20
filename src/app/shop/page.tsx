import Image from 'next/image';
import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import { contact } from '@/content/site';
import { catalogue, draft, formatKes, orderUrl, shop } from '@/content/shop';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Shop | Mountain View Sports Arena',
  description: 'Kit and match essentials sold at the Arena. Order over WhatsApp.',
};

export default function ShopPage() {
  const inStock = catalogue.filter((item) => item.available !== false);
  const reception = whatsappUrl(contact.whatsappNumber);

  return (
    <main>
      <PageHeader eyebrow="Arena shop" titleTop={shop.title} intro={shop.intro} />

      <div className="wrap pb-[clamp(56px,7vw,88px)]">
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
              <p className="m-0 max-w-2xl border-l-2 border-gold pl-4 text-base leading-relaxed text-fog">
                {shop.draftNote}
              </p>
            ) : null}

            <p className="mt-8 mb-0 text-base text-gold">{shop.orderNote}</p>

            <div className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {inStock.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col border border-t-4 border-white/10 border-t-grass bg-surface"
                >
                  {item.image ? (
                    <div className="photo relative aspect-[4/3]">
                      <Image
                        src={item.image.src}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col gap-3 px-6 py-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="display m-0 text-[24px] leading-[0.95]">{item.name}</h2>
                      {item.priceKes === undefined ? (
                        <span className="label text-[13px] whitespace-nowrap text-mute">Ask</span>
                      ) : (
                        <span className="display text-xl whitespace-nowrap text-gold">{formatKes(item.priceKes)}</span>
                      )}
                    </div>

                    <p className="m-0 text-base leading-normal text-fog">{item.description}</p>

                    {item.options?.length ? (
                      <p className="label m-0 text-sm text-mute">{item.options.join(' · ')}</p>
                    ) : null}

                    <a
                      href={orderUrl(contact.whatsappNumber, item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-gold mt-auto"
                    >
                      Order on WhatsApp
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {inStock.length < catalogue.length ? (
              <p className="mt-8 text-base text-mute">
                Some items are out of stock and are not listed. Ask reception on {contact.whatsappDisplay}.
              </p>
            ) : null}

            {/* The grid is short, so the page closes on the one thing a
                customer does next: ask a person. */}
            <section className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="m-0 max-w-md text-base leading-relaxed text-fog">
                Not sure of your size, or after something that is not listed? Ask reception on{' '}
                <span className="text-white">{contact.whatsappDisplay}</span> and we will tell you what is in.
              </p>
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
