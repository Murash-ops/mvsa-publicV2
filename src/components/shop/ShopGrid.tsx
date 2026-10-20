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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
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
          <span className="label absolute top-2 left-2 bg-gold px-2 py-0.5 text-[10px] tracking-[0.14em] text-ink sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
            {item.mark === 'classic' ? 'Classic' : 'Helmets'}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-3 pt-3 pb-4 sm:gap-3 sm:px-5 sm:pt-5 sm:pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="display m-0 text-[19px] leading-[0.95] sm:text-[24px]">{item.name}</h2>
          {item.priceKes === undefined ? (
            <span className="label text-[13px] whitespace-nowrap text-mute">Ask</span>
          ) : (
            <span className="display text-xl whitespace-nowrap text-gold">{formatKes(item.priceKes)}</span>
          )}
        </div>

        <p className="m-0 line-clamp-3 text-[13px] leading-snug text-fog sm:line-clamp-none sm:text-[15px] sm:leading-normal">{item.description}</p>

        {item.options?.length ? (
          <div role="group" aria-label={`${item.name} size`} className="flex flex-wrap gap-1 sm:gap-1.5">
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
          <span className="sm:hidden">Order</span>
          <span className="hidden sm:inline">Order on WhatsApp</span>
        </a>
      </div>
    </article>
  );
}
