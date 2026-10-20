import Image from 'next/image';
import { contact, home } from '@/content/site';
import { heroPhoto } from '@/content/photos';
import { getAcademyPrograms } from '@/lib/academy-programs';
import { whatsappUrl } from '@/lib/whatsapp';
import StatusPill from '@/components/arena/StatusPill';
import PricePlate from '@/components/arena/PricePlate';
import Marquee from '@/components/arena/Marquee';
import Pitch3D from '@/components/arena/Pitch3D';
import Bento from '@/components/arena/Bento';
import LampClose from '@/components/arena/LampClose';
import { AskForKickoff, BookArenaLink, KickoffChips, KickoffProvider } from '@/components/arena/Kickoff';

const delay = (i: number) => `${(i * 0.07).toFixed(2)}s`;

export default function Home() {
  const programs = getAcademyPrograms();
  const lineUrl = {
    bookings: whatsappUrl(contact.whatsappNumber),
    academy: whatsappUrl(contact.academyWhatsappNumber),
  } as const;

  return (
    <KickoffProvider>
      <main>
        {/* Hero: the floodlights flicker on over the pitch */}
        <section id="top" className="relative flex min-h-[clamp(540px,86svh,740px)] items-end overflow-hidden">
          <Image
            src={heroPhoto.src}
            alt={home.hero.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: heroPhoto.objectPosition }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[rgba(3,6,3,0.34)]" />
          <div aria-hidden="true" className="lights pointer-events-none absolute inset-0 mix-blend-screen">
            <div className="absolute inset-0 bg-[conic-gradient(from_128deg_at_0%_0%,transparent_0deg,rgba(255,240,205,0.30)_12deg,rgba(255,240,205,0.06)_26deg,transparent_34deg)]" />
            <div className="absolute inset-0 bg-[conic-gradient(from_198deg_at_100%_0%,transparent_0deg,rgba(255,240,205,0.06)_8deg,rgba(255,240,205,0.30)_22deg,transparent_34deg)]" />
            <div className="absolute -top-10 left-[2%] h-[90px] w-[90px] rounded-full bg-[radial-gradient(circle,rgba(255,246,220,0.95),rgba(255,246,220,0)_70%)]" />
            <div className="absolute -top-10 right-[2%] h-[90px] w-[90px] rounded-full bg-[radial-gradient(circle,rgba(255,246,220,0.95),rgba(255,246,220,0)_70%)]" />
          </div>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[78%] sm:h-1/2 bg-[linear-gradient(to_top,#070A07_4%,rgba(7,10,7,0.55)_40%,rgba(7,10,7,0)_100%)]" />

          <div className="wrap relative flex flex-wrap items-end justify-between gap-8 pb-12">
            <div className="rise flex min-w-0 flex-[1_1_520px] flex-col gap-5">
              <StatusPill />
              <h1 className="display m-0 text-[clamp(44px,6vw,92px)] leading-[0.9]">
                {home.hero.titleTop}
                <br />
                <span className="text-gold">{home.hero.titleBottom}</span>
              </h1>
              <p className="m-0 max-w-[540px] text-[clamp(16px,1.25vw,18px)] leading-[1.55] text-fog">{home.hero.body}</p>
              <div className="flex flex-wrap gap-3">
                <BookArenaLink className="btn shine">Book on WhatsApp</BookArenaLink>
                <a href={contact.bookingsPhoneHref} className="btn btn-ghost">
                  Call {contact.bookingsPhone}
                </a>
              </div>
            </div>
            <PricePlate className="flex-[0_1_260px]" />
          </div>
        </section>

        <Marquee />

        {/* Interactive 3D pitch + kick-off picker */}
        <section id="pitch" className="wrap flex flex-wrap items-center gap-10 py-[clamp(56px,7vw,88px)]">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
            <span className="label text-[13px] text-gold">{home.pricing.eyebrow}</span>
            <h2 className="h-section">
              {home.kickoff.titleTop}
              <br />
              <span className="text-gold">{home.kickoff.titleBottom}</span>
            </h2>
            <p className="m-0 max-w-[460px] text-base leading-[1.55] text-fog">{home.kickoff.body}</p>
            <KickoffChips />
            <AskForKickoff />
            <p className="m-0 max-w-[460px] text-base text-mute">{home.pricing.note}</p>
          </div>
          <Pitch3D caption={home.kickoff.markerCaption} />
        </section>

        {/* Bento grid with cursor spotlight */}
        <section className="wrap flex flex-col gap-10 pb-[clamp(56px,7vw,88px)]">
          <h2 className="h-section">
            {home.bento.titleTop}
            <br />
            <span className="text-gold">{home.bento.titleBottom}</span>
          </h2>
          <Bento tiles={home.bento.tiles} />
        </section>

        {/* This week */}
        <section id="week" className="scroll-mt-20 border-y border-white/[0.08] bg-surface">
          <div className="wrap flex flex-col gap-9 py-[clamp(56px,7vw,84px)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="h-section">
                {home.week.titleTop}
                <br />
                {home.week.titleBottom}
              </h2>
              <p className="m-0 max-w-[380px] text-base leading-[1.55] text-fog">{home.week.body}</p>
            </div>
            <ul className="m-0 flex list-none flex-col border-t-2 border-gold p-0">
              {home.week.fixtures.map((fixture, i) => (
                <li
                  key={fixture.what}
                  className="rise flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-white/10 px-3 py-[22px]"
                  style={{ animationDelay: delay(i) }}
                >
                  <span className="display flex-[0_0_140px] text-[28px] leading-none text-gold">{fixture.day}</span>
                  <span className="label flex-[0_0_180px] text-lg tracking-[0.04em] text-white">{fixture.time}</span>
                  <span className="display min-w-0 flex-[1_1_240px] text-2xl leading-none">{fixture.what}</span>
                  <a
                    href={lineUrl[fixture.line]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link text-[15px]"
                    aria-label={`${fixture.cta}: ${fixture.what}`}
                  >
                    {fixture.cta}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Programs */}
        <section id="programs" className="wrap flex flex-col gap-10 py-[clamp(56px,7vw,88px)]">
          <h2 className="h-section">
            {home.programs.titleTop}
            <br />
            {home.programs.titleBottom}
          </h2>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
            {programs.map((program, i) => (
              <article
                key={program.id}
                className="rise flex min-h-[170px] flex-col gap-3 border border-t-4 border-white/10 border-t-grass bg-surface px-6 py-7"
                style={{ animationDelay: delay(i) }}
              >
                <span className="label text-[13px] text-gold">{program.age_group}</span>
                <h3 className="display m-0 text-[28px] leading-[0.92]">{program.name}</h3>
                <p className="m-0 grow text-base leading-normal text-fog">{program.schedule}.</p>
                <a
                  href={lineUrl.academy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link text-base"
                  aria-label={`Ask to join ${program.name}`}
                >
                  Ask to join
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Photo strip with hover zoom */}
        <section aria-label="The Arena" className="grid gap-1 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {home.photos.map((photo) => (
            <div key={photo.src} className="photo relative h-[clamp(300px,40vw,400px)]">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 560px) 100vw, 25vw" className="object-cover" />
            </div>
          ))}
        </section>

        <LampClose>
          <BookArenaLink className="btn shine">Book on WhatsApp</BookArenaLink>
          <a href={contact.bookingsPhoneHref} className="btn btn-ghost">
            Call {contact.bookingsPhone}
          </a>
        </LampClose>
      </main>
    </KickoffProvider>
  );
}
