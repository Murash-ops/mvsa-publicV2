import Image from 'next/image';
import { Play } from 'lucide-react';
import { watchGames, youtube } from '@/content/site';

/**
 * "Watch our games": points people to the Arena's YouTube channel, MVSA TV.
 * It links to the channel and never embeds a single match: customers' games
 * need their captain's consent before they are shown on their own.
 *
 * `section` is the home page block; `band` is the compact strip on What's on.
 */
export default function WatchGames({ variant = 'section' }: { variant?: 'section' | 'band' }) {
  const link = (
    <a
      href={youtube.url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-gold self-start"
      data-testid="watch-games-link"
    >
      <Play aria-hidden="true" className="h-5 w-5 fill-current" />
      {watchGames.cta}
      <span className="sr-only"> (MVSA TV, opens in a new tab)</span>
    </a>
  );

  if (variant === 'band') {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-6 border-l-4 border-gold bg-surface px-6 py-6"
        data-testid="watch-games"
      >
        <div className="flex flex-col gap-2">
          <span className="tag">{watchGames.tag}</span>
          <h2 className="display m-0 mt-2 text-[clamp(30px,4vw,44px)] leading-[0.9]">{watchGames.short}</h2>
          <p className="m-0 max-w-[520px] text-base leading-[1.55] text-fog">{watchGames.body}</p>
        </div>
        {link}
      </div>
    );
  }

  return (
    <section
      id="watch"
      className="wrap grid scroll-mt-24 items-center gap-10 py-[clamp(56px,7vw,88px)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
      aria-labelledby="watch-title"
      data-testid="watch-games"
    >
      <div className="flex flex-col gap-5">
        <span className="tag">{watchGames.tag}</span>
        <h2 id="watch-title" className="h-section text-[clamp(44px,6vw,80px)]">
          {watchGames.titleTop}
          <br />
          <span className="text-gold">{watchGames.titleBottom}</span>
        </h2>
        <p className="m-0 max-w-[440px] text-base leading-[1.55] text-fog">{watchGames.body}</p>
        {link}
      </div>
      <a
        href={youtube.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
        className="print print-tilt-r relative block aspect-video overflow-hidden [--print-shadow:#C2A15B]"
      >
        <Image
          src="/images/arena/touchline.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 92vw, 50vw"
          className="object-cover"
        />
        <span className="absolute inset-0 bg-[rgba(10,22,15,0.35)]" />
        <span className="absolute top-1/2 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ink">
          <Play className="ml-1 h-9 w-9 fill-current" />
        </span>
      </a>
    </section>
  );
}
