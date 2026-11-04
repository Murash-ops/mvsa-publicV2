import Image from 'next/image';
import Link from 'next/link';
import type { WhatsOnItem } from '@/lib/whats-on';

/**
 * What's on, as posters: each card is built like an MVSA social graphic
 * (photo full bleed, tilted kicker, big title, the dates, small print), so
 * the website and the feed look like the same club.
 */

const DEFAULT_IMAGE = '/images/arena/covered-pitch.webp';
/** Photos that may show children: always shown in duotone so nobody can be made out. */
const KIDS_PHOTOS = new Set(['/images/programs/boots-and-ball.webp']);

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

export function WhatsOnPoster({ item, priority = false }: { item: WhatsOnItem; priority?: boolean }) {
  const image = item.image ?? DEFAULT_IMAGE;
  const kids = KIDS_PHOTOS.has(image);
  const link = item.linkUrl ?? (item.programId ? `/programs/${item.programId}` : undefined);
  const label = item.linkLabel ?? (link ? 'Find out more' : undefined);

  return (
    <article
      className="theme-dark poster grain relative isolate flex h-full min-h-[480px] w-full min-w-0 flex-col justify-end overflow-hidden bg-ink"
      data-testid="whats-on-item"
      aria-labelledby={`wo-${item.id}`}
    >
      <div className={`absolute inset-0 -z-10 ${kids ? 'duotone' : ''}`}>
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
          className="poster-photo object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,22,16,0.97)_0%,rgba(11,22,16,0.88)_38%,rgba(11,22,16,0.35)_68%,rgba(11,22,16,0.05)_100%)]"
      />
      <div className="relative z-[2] flex flex-col gap-3 p-6 sm:p-7">
        {item.kicker ? <span className="tag">{item.kicker}</span> : null}
        <h3 id={`wo-${item.id}`} className="display m-0 text-[clamp(42px,3.8vw,56px)] leading-[0.84] text-white">
          {item.title}
        </h3>
        {item.datesText ? <p className="label m-0 text-[15px] tracking-[0.1em] text-gold">{item.datesText}</p> : null}
        <p className="m-0 text-base leading-[1.45] text-fog">{item.blurb}</p>
        {item.smallPrint ? (
          <p className="m-0 text-[13px] leading-snug text-[#C9D2C8]" data-testid="whats-on-small-print">
            {item.smallPrint}
          </p>
        ) : null}
        {link && label ? (
          isExternal(link) ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-link poster-cta self-start text-[15px]">
              {label}
              <span className="sr-only"> ({item.title}, opens in a new tab)</span>
            </a>
          ) : (
            <Link href={link} className="text-link poster-cta self-start text-[15px]">
              {label}
              <span className="sr-only"> ({item.title})</span>
            </Link>
          )
        ) : null}
      </div>
    </article>
  );
}

export default function WhatsOnPosters({ items, layout = 'row' }: { items: WhatsOnItem[]; layout?: 'row' | 'grid' }) {
  if (layout === 'grid') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, i) => (
          <WhatsOnPoster key={item.id} item={item} priority={i < 2} />
        ))}
      </div>
    );
  }
  // On a phone the posters scroll sideways, one and a bit in view, so it is
  // obvious there is more; from a tablet up they sit in a grid.
  return (
    <div
      className="scrollbar-hide -mx-[clamp(16px,4vw,48px)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(16px,4vw,48px)] pb-2 md:mx-0 md:grid md:overflow-visible md:px-0 md:grid-cols-2 xl:grid-cols-4"
      data-testid="whats-on-row"
    >
      {items.map((item) => (
        <div key={item.id} className="w-[82%] max-w-[360px] min-w-0 shrink-0 snap-start md:w-auto md:max-w-none">
          <WhatsOnPoster item={item} />
        </div>
      ))}
    </div>
  );
}
