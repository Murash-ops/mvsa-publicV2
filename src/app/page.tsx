import Image from 'next/image';
import Link from 'next/link';
import { contact, home, meetingRoom } from '@/content/site';
import { catalogue } from '@/content/shop';
import { getAcademyPrograms } from '@/lib/academy-programs';
import { loadWhatsOn } from '@/lib/whats-on';
import StatusPill from '@/components/arena/StatusPill';
import PricePlate from '@/components/arena/PricePlate';
import Marquee from '@/components/arena/Marquee';
import Bento from '@/components/arena/Bento';
import LampClose from '@/components/arena/LampClose';
import WhatsOnPosters from '@/components/whats-on/WhatsOnPosters';
import ProgramTile from '@/components/programs/ProgramTile';

/** What's on is read from the sheet at most once an hour. */
export const revalidate = 3600;

/**
 * The home page is the shop window: the Arena, what's on now, the
 * programmes, the meeting room and the kit. Booking lives on /book, reached
 * from the one Book button in the navigation; this page only links to it.
 */
export default async function Home() {
  const programs = getAcademyPrograms();
  const { items } = await loadWhatsOn();
  const kit = catalogue.filter((item) => item.image && item.available !== false).slice(0, 3);

  return (
    <main>
      {/* Hero: the covered pitch, the line over it. */}
      <section id="top" className="relative flex min-h-[clamp(560px,88svh,780px)] items-end overflow-hidden">
        <Image
          src="/images/arena/covered-pitch.webp"
          alt={home.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: 'center 42%' }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(10,22,15,0.42)] sm:bg-[rgba(10,22,15,0.28)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[80%] bg-[linear-gradient(to_top,#0E1C14_6%,rgba(14,28,20,0.6)_45%,rgba(14,28,20,0)_100%)]" />

        <div className="wrap relative flex flex-wrap items-end justify-between gap-8 pb-12">
          <div className="rise flex min-w-0 flex-[1_1_560px] flex-col gap-5">
            <StatusPill />
            <h1 className="display hard-shadow m-0 text-[clamp(52px,7.4vw,112px)] leading-[0.84] [--hard-shadow:#2D5016]">
              {home.hero.titleTop}
              <br />
              <span className="text-gold">{home.hero.titleBottom}</span>
            </h1>
            <p className="m-0 max-w-[560px] text-[clamp(16px,1.25vw,18px)] leading-[1.55] text-fog">{home.hero.body}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/whats-on" className="btn btn-outline-gold">
                See what’s on
              </Link>
              <Link href="/book" className="text-link text-base" data-testid="hero-book-link">
                Book a pitch
              </Link>
            </div>
          </div>
          <PricePlate className="flex-[0_1_260px]" />
        </div>
      </section>

      <Marquee tone="night" />

      {/* What's on: from the sheet (or the checked-in list). */}
      <div className="theme-light sheet-in">
        <section id="whats-on" className="wrap flex scroll-mt-24 flex-col gap-8 py-[clamp(56px,7vw,88px)]" aria-labelledby="whats-on-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="whats-on-title" className="h-section text-[clamp(44px,6vw,80px)]">
              {home.whatsOn.title}
            </h2>
            <p className="m-0 max-w-[420px] text-base leading-[1.55] text-fog">{home.whatsOn.body}</p>
          </div>
          {items.length > 0 ? (
            <WhatsOnPosters items={items.slice(0, 4)} />
          ) : (
            <p className="m-0 max-w-[620px] border-l-4 border-gold pl-4 text-base text-fog">{home.whatsOn.empty}</p>
          )}
          <Link href="/whats-on" className="text-link self-start text-base">
            Everything on at the Arena
          </Link>
        </section>
      </div>

      {/* Programmes: each card in its own theme. */}
      <section id="programs" className="wrap flex flex-col gap-8 py-[clamp(56px,7vw,88px)]" aria-labelledby="programs-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="programs-title" className="h-section">
            {home.programs.titleTop}
            <br />
            <span className="text-gold">{home.programs.titleBottom}</span>
          </h2>
          <p className="m-0 max-w-[420px] text-base leading-[1.55] text-fog">{home.programs.body}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {programs.map((program) => (
            <ProgramTile key={program.id} program={program} />
          ))}
        </div>
      </section>

      {/* The Arena itself. */}
      <div className="theme-light">
        <section className="wrap flex flex-col gap-10 py-[clamp(56px,7vw,88px)]">
          <h2 className="h-section">
            {home.bento.titleTop}
            <br />
            <span className="text-gold">{home.bento.titleBottom}</span>
          </h2>
          <Bento tiles={home.bento.tiles} />
        </section>

        {/* Meeting room teaser. */}
        <section className="wrap grid items-center gap-10 pb-[clamp(56px,7vw,88px)] md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]" aria-labelledby="room-title">
          <div className="relative">
            <div className="print print-tilt-l relative aspect-[4/3] overflow-hidden [--print-shadow:#2D5016]">
              <Image
                src="/images/arena/meeting-room.webp"
                alt={meetingRoom.photoAlt}
                fill
                sizes="(max-width: 768px) 92vw, 50vw"
                className="object-cover"
                style={{ objectPosition: 'center 62%' }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <span className="tag">{meetingRoom.eyebrow}</span>
            <h2 id="room-title" className="h-section">
              {home.meetingRoom.titleTop}
              <br />
              <span className="text-gold">{home.meetingRoom.titleBottom}</span>
            </h2>
            <p className="m-0 max-w-[460px] text-base leading-[1.55] text-fog">{home.meetingRoom.body}</p>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {meetingRoom.uses.map((use) => (
                <li key={use.id} className="label border border-white/20 px-3 py-2 text-[13px] tracking-[0.1em] text-white">
                  {use.label}s
                </li>
              ))}
            </ul>
            <Link href="/book#meeting-room" className="btn btn-outline-gold self-start">
              {home.meetingRoom.cta}
            </Link>
          </div>
        </section>
      </div>

      {/* Shop teaser. */}
      <section className="relative overflow-hidden border-y border-white/[0.08] bg-surface" aria-labelledby="shop-title">
        <div className="wrap grid items-center gap-10 py-[clamp(56px,7vw,88px)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-5">
            <h2 id="shop-title" className="h-section text-[clamp(44px,6vw,80px)]">
              {home.shop.titleTop}
              <br />
              <span className="text-gold">{home.shop.titleBottom}</span>
            </h2>
            <p className="m-0 max-w-[420px] text-base leading-[1.55] text-fog">{home.shop.body}</p>
            <Link href="/shop" className="btn btn-outline-gold self-start">
              {home.shop.cta}
            </Link>
          </div>
          <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0">
            {kit.map((item, i) => (
              <li
                key={item.id}
                className={`relative aspect-square overflow-hidden border border-white/10 bg-ink ${
                  i === 0 ? 'rotate-[-2deg]' : i === 2 ? 'rotate-[2deg]' : 'translate-y-4'
                }`}
              >
                <Link href="/shop" className="block h-full w-full" aria-label={`${item.name}, in the shop`}>
                  <Image src={item.image!.src} alt="" fill sizes="(max-width: 768px) 30vw, 20vw" className="object-cover" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Photo strip. */}
      <section aria-label="The Arena" className="grid gap-1 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {home.photos.map((photo) => (
          <div key={photo.src} className="photo relative h-[clamp(300px,40vw,400px)]">
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 560px) 100vw, 25vw" className="object-cover" />
          </div>
        ))}
      </section>

      <LampClose>
        <Link href="/book" className="btn btn-ghost">
          Book a pitch
        </Link>
        <a href={contact.bookingsPhoneHref} className="btn btn-ghost">
          Call {contact.bookingsPhone}
        </a>
      </LampClose>
    </main>
  );
}
