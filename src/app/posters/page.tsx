import Link from 'next/link';
import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import { PosterDownload } from '@/components/whats-on/WhatsOnPosters';
import { itemsWithPosters, loadWhatsOn } from '@/lib/whats-on';

/** Read from the sheet at most once an hour, like What's on. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Posters | Mountain View Sports Arena',
  description: 'Posters for what’s on at Mountain View Sports Arena, to download and share.',
};

/**
 * The posters for the cards showing on What's on right now. Each poster is
 * shown whole as a plain image of the real file, so on a phone it can be
 * pressed and saved, with a download link and a link to open it full size.
 */
export default async function PostersPage() {
  const posters = itemsWithPosters((await loadWhatsOn()).items);

  return (
    <main className="theme-light">
      <PageHeader
        eyebrow="Download and share"
        titleTop="Posters"
        intro="Posters for what’s on at the Arena. Save one and share it with your team. On iPhone, press and hold the poster, then choose Save to Photos."
      />
      <section className="wrap flex flex-col gap-10 pb-[clamp(56px,7vw,88px)]" aria-label="Posters">
        {posters.length > 0 ? (
          <ul className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {posters.map((item) => {
              const isPdf = item.poster!.toLowerCase().endsWith('.pdf');
              return (
                <li key={item.id} id={item.id} className="flex scroll-mt-24 flex-col gap-4" data-testid="poster">
                  {isPdf ? null : (
                    <a href={item.poster} target="_blank" rel="noopener" className="block border border-white/10 bg-surface">
                      {/* A plain <img> of the real file, not a resized copy, so press-and-save keeps it full size. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.poster} alt={`${item.title} poster`} loading="lazy" className="block h-auto w-full" />
                    </a>
                  )}
                  <div className="flex flex-col gap-1">
                    <h2 className="display m-0 text-[clamp(28px,3vw,36px)] leading-[0.9]">{item.title}</h2>
                    {item.datesText ? <p className="label m-0 text-[15px] tracking-[0.1em] text-gold">{item.datesText}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <PosterDownload item={item} className="btn btn-gold" />
                    <a href={item.poster} target="_blank" rel="noopener" className="text-link text-base" data-testid="poster-open">
                      Open full size
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="m-0 max-w-[620px] border-l-4 border-gold pl-4 text-lg text-fog" data-testid="posters-empty">
            No posters to download right now. New ones go up here with what’s on.
          </p>
        )}
        <Link href="/whats-on" className="btn btn-outline-gold self-start">
          See what’s on
        </Link>
      </section>
    </main>
  );
}
