import Image from 'next/image';
import type { Metadata } from 'next';
import { contact } from '@/content/site';
import { catalogue, draft, formatKes, orderUrl, shop } from '@/content/shop';

export const metadata: Metadata = {
  title: 'Shop | Mountain View Sports Arena',
  description: 'Kit and match essentials sold at the arena. Order over WhatsApp.',
};

export default function ShopPage() {
  const inStock = catalogue.filter((item) => item.available !== false);

  return (
    <main className="min-h-screen text-charcoal pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
            {shop.title}
          </h1>
          <p className="mt-4 font-sans text-sm sm:text-base text-white/70 leading-relaxed">
            {shop.intro}
          </p>
        </header>

        {catalogue.length === 0 ? (
          /* An empty catalogue says so. It never pretends to be a shop with
             nothing in it today. */
          <section className="mt-14 border border-white/10 bg-white/[0.02] p-10 max-w-2xl">
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">
              {shop.emptyHeading}
            </h2>
            <p className="mt-3 font-sans text-sm text-white/60 leading-relaxed">{shop.emptyBody}</p>
            <a
              href={`https://wa.me/${contact.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 h-14 w-full sm:w-64 bg-gold text-forest-dark hover:bg-gold-muted border border-gold font-display text-xs font-extrabold uppercase tracking-[0.2em] flex items-center justify-center transition-colors"
            >
              Message reception
            </a>
          </section>
        ) : (
          <>
            {draft ? (
              /* A draft list says so in plain words, above the grid, so nothing
                 on the page can be mistaken for a published price. */
              <p className="mt-10 border-l-2 border-gold/60 pl-4 font-sans text-sm text-white/70 leading-relaxed max-w-2xl">
                {shop.draftNote}
              </p>
            ) : null}

            <p className="mt-8 font-mono text-[11px] uppercase tracking-widest text-gold/80">
              {shop.orderNote}
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inStock.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col border border-white/10 bg-white/[0.02] hover:border-gold/30 transition-colors"
                >
                  {item.image ? (
                    <div className="relative aspect-[4/3] bg-forest-light/20">
                      <Image
                        src={item.image.src}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-col flex-1 gap-3 p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
                        {item.name}
                      </h2>
                      {item.priceKes === undefined ? (
                        <span className="font-mono text-[11px] uppercase tracking-widest text-white/50 whitespace-nowrap">
                          Ask
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-gold whitespace-nowrap tabular-nums">
                          {formatKes(item.priceKes)}
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs text-white/60 leading-relaxed">
                      {item.description}
                    </p>

                    {item.options?.length ? (
                      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                        {item.options.join(' · ')}
                      </p>
                    ) : null}

                    <a
                      href={orderUrl(contact.whatsappNumber, item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto h-12 border border-gold text-gold hover:bg-gold hover:text-forest-dark font-display text-[11px] font-extrabold uppercase tracking-[0.2em] flex items-center justify-center transition-colors"
                    >
                      Order on WhatsApp
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {inStock.length < catalogue.length ? (
              <p className="mt-8 font-sans text-xs text-white/40">
                Some items are out of stock and are not listed. Ask reception on{' '}
                {contact.whatsappDisplay}.
              </p>
            ) : null}

            {/* The grid is short, so the page closes on the one thing a
                customer does next: ask a person. */}
            <section className="mt-16 border-t border-white/10 pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <p className="font-sans text-sm text-white/60 leading-relaxed max-w-md">
                Not sure of your size, or after something that is not listed? Ask reception on{' '}
                <span className="text-white/80">{contact.whatsappDisplay}</span> and we will tell
                you what is in.
              </p>
              <a
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 w-full sm:w-64 shrink-0 bg-gold text-forest-dark hover:bg-gold-muted border border-gold font-display text-xs font-extrabold uppercase tracking-[0.2em] flex items-center justify-center transition-colors"
              >
                Message reception
              </a>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
