'use client';

import { useState } from 'react';
import Image from 'next/image';
import { categories, formatKes, orderUrl, type ShopCategory, type ShopItem } from '@/content/shop';

/**
 * Arena Kit on the shelf: a filter by kind, and a card per piece where the
 * visitor picks a size before the order goes to WhatsApp. The chosen size
 * rides along in the message, so reception doesn't have to ask.
 */
export default function ShopGrid({ items, whatsappNumber }: { items: ShopItem[]; whatsappNumber: string }) {
  const [shelf, setShelf] = useState<ShopCategory | 'all'>('all');
  const shown = shelf === 'all' ? items : items.filter((item) => item.category === shelf);
  const shelves = categories.filter((c) => c.id === 'all' || items.some((item) => item.category === c.id));

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Show" className="flex flex-wrap gap-2" data-testid="shop-filter">
        {shelves.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip px-5 text-[18px]"
            aria-pressed={shelf === c.id}
            onClick={() => setShelf(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {shown.map((item, i) => (
          <KitCard key={item.id} item={item} whatsappNumber={whatsappNumber} index={i} />
        ))}
      </div>
    </div>
  );
}

function KitCard({ item, whatsappNumber, index }: { item: ShopItem; whatsappNumber: string; index: number }) {
  const [option, setOption] = useState<string | undefined>(undefined);

  return (
    <article
      className="kit-card rise group flex flex-col border border-white/10 bg-surface"
      style={{ animationDelay: `${(index * 0.06).toFixed(2)}s` }}
      data-testid="kit-card"
    >
      <div className="relative aspect-square overflow-hidden bg-ink">
        {item.image ? (
          <Image
            src={item.image.src}
            alt={`${item.name}: ${item.description}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="kit-photo object-cover"
          />
        ) : null}
        {item.mark ? (
          <span className="label absolute top-3 left-3 bg-gold px-2.5 py-1 text-[11px] tracking-[0.16em] text-ink">
            {item.mark === 'classic' ? 'Classic' : 'Helmets'}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pt-5 pb-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="display m-0 text-[24px] leading-[0.95]">{item.name}</h2>
          {item.priceKes === undefined ? (
            <span className="label text-[13px] whitespace-nowrap text-mute">Ask</span>
          ) : (
            <span className="display text-xl whitespace-nowrap text-gold">{formatKes(item.priceKes)}</span>
          )}
        </div>

        <p className="m-0 text-[15px] leading-normal text-fog">{item.description}</p>

        {item.options?.length ? (
          <div role="group" aria-label={`${item.name} size`} className="flex flex-wrap gap-1.5">
            {item.options.map((o) => (
              <button
                key={o}
                type="button"
                className="size-chip"
                aria-pressed={option === o}
                onClick={() => setOption(option === o ? undefined : o)}
              >
                {o}
              </button>
            ))}
          </div>
        ) : null}

        <a
          href={orderUrl(whatsappNumber, item, option)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm shine mt-auto"
          aria-label={`Order on WhatsApp: ${item.name}${option ? `, ${option}` : ''}`}
        >
          Order on WhatsApp
        </a>
      </div>
    </article>
  );
}
