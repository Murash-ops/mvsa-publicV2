import Link from 'next/link';
import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import WhatsOnPosters from '@/components/whats-on/WhatsOnPosters';
import { loadWhatsOn } from '@/lib/whats-on';
import { contact, home, social } from '@/content/site';

/** Read from the sheet at most once an hour. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'What’s on | Mountain View Sports Arena',
  description: 'Offers, the holiday programme and the regular sessions at Mountain View Sports Arena right now.',
};

export default async function WhatsOnPage() {
  const { items } = await loadWhatsOn();

  return (
    <main className="theme-light">
      <PageHeader
        eyebrow="At the Arena now"
        titleTop="What’s on"
        intro="Offers, the holiday programme and the regular sessions. Something you want to join? Tap through for the details, or call or WhatsApp reception."
      />
      <section className="wrap flex flex-col gap-10 pb-[clamp(56px,7vw,88px)]" aria-label="What’s on">
        {items.length > 0 ? (
          <WhatsOnPosters items={items} layout="grid" />
        ) : (
          <p className="m-0 max-w-[620px] border-l-4 border-gold pl-4 text-lg text-fog" data-testid="whats-on-empty">
            {home.whatsOn.empty}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8">
          <p className="m-0 max-w-[560px] text-base leading-[1.55] text-fog">
            For tournaments, team days and anything new, follow{' '}
            <a
              href={`https://instagram.com/${social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline decoration-gold underline-offset-4"
            >
              @{social.instagram}
            </a>{' '}
            or call or WhatsApp {contact.bookingsPhone}.
          </p>
          <Link href="/programs" className="btn btn-outline-gold">
            All programmes
          </Link>
        </div>
      </section>
    </main>
  );
}
