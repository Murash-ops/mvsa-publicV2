import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/brand/Logo';
import PageHeader from '@/components/arena/PageHeader';
import LampClose from '@/components/arena/LampClose';
import { about, contact } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'About | Mountain View Sports Arena',
  description: about.intro,
};

// Page copy is checked in (src/content/site.ts), so this page needs no data layer.
export default function AboutPage() {
  return (
    <main>
      <PageHeader eyebrow={about.eyebrow} titleTop={about.titleTop} titleBottom={about.titleBottom} intro={about.intro} />

      <section className="wrap grid items-center gap-12 pb-[clamp(72px,9vw,112px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="flex justify-center border border-white/10 bg-surface p-[clamp(24px,5vw,56px)] text-gold">
          <Logo variant="emblem" width={480} />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="h-section">
            Our <span className="text-gold">story</span>
          </h2>
          {about.story.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="m-0 text-lg leading-[1.6] text-fog">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-surface">
        <div className="wrap flex flex-col gap-10 py-[clamp(72px,9vw,104px)]">
          <h2 className="h-section">
            Built for
            <br />
            <span className="text-gold">match night</span>
          </h2>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
            {about.amenities.map((item, i) => (
              <article
                key={item.title}
                className="rise flex flex-col gap-3 border border-t-4 border-white/10 border-t-grass bg-ink px-6 py-7"
                style={{ animationDelay: `${(i * 0.07).toFixed(2)}s` }}
              >
                <h3 className="display m-0 text-4xl leading-[0.92]">{item.title}</h3>
                <p className="m-0 text-base leading-normal text-fog">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="The Arena" className="grid gap-1 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {about.photos.map((photo) => (
          <div key={photo.src} className="photo relative h-[clamp(300px,40vw,400px)]">
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 560px) 100vw, 25vw" className="object-cover" />
          </div>
        ))}
      </section>

      <section className="wrap flex flex-wrap items-end justify-between gap-8 py-[clamp(72px,9vw,112px)]">
        <div className="flex max-w-[620px] flex-col gap-4">
          <h2 className="h-section">{about.partner.title}</h2>
          <p className="m-0 text-lg leading-[1.55] text-fog">{about.partner.body}</p>
        </div>
        <a
          href={whatsappUrl(contact.whatsappNumber, about.partner.message)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-gold"
        >
          Talk to us
        </a>
      </section>

      <LampClose>
        <Link href="/book" className="btn shine">Book the Arena</Link>
        <a href={contact.bookingsPhoneHref} className="btn btn-ghost">
          Call {contact.bookingsPhone}
        </a>
      </LampClose>
    </main>
  );
}
