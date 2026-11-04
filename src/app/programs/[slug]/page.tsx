import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getAcademyProgram, getAcademyPrograms, type AcademyProgram } from '@/lib/academy-programs';
import { getStory, type ProgramStory, type ProgramTheme } from '@/content/programs';
import { contact, siteOrigin } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { itemsForProgram, loadWhatsOn } from '@/lib/whats-on';
import { nairobiToday } from '@/lib/whats-on/parse';
import Motif from '@/components/programs/Motif';
import ShareBar from '@/components/programs/ShareBar';
import ProgramTile from '@/components/programs/ProgramTile';
import { themeClass } from '@/components/programs/theme';
import WhatsOnPosters from '@/components/whats-on/WhatsOnPosters';

/** The page carries What's on rows for this programme, read hourly. */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return getAcademyPrograms().map((program) => ({ slug: program.slug }));
}

function load(slug: string): { program: AcademyProgram; story: ProgramStory } | null {
  const program = getAcademyProgram(slug);
  const story = program ? getStory(program.slug) : undefined;
  return program && story && program.slug === slug ? { program, story } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = load(slug);
  if (!found) return { title: 'Programs | Mountain View Sports Arena' };
  const { program, story } = found;
  const url = `${siteOrigin}/programs/${program.slug}`;
  const title = `${program.name} | Mountain View Sports Arena`;
  return {
    title,
    description: story.lede,
    alternates: { canonical: url },
    openGraph: {
      title: `${program.name} at Mountain View Sports Arena`,
      description: story.shareLine,
      url,
      siteName: 'Mountain View Sports Arena',
      locale: 'en_KE',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: program.name, description: story.shareLine },
  };
}

/** Which phone lines to show: the Academy's for its programmes, reception's for the rest. */
function phones(program: AcademyProgram) {
  return program.type === 'academy'
    ? [
        { label: contact.bookingsPhone, href: contact.bookingsPhoneHref },
        { label: contact.academyPhone, href: contact.academyPhoneHref },
      ]
    : [
        { label: contact.bookingsPhone, href: contact.bookingsPhoneHref },
        { label: contact.secondPhone, href: contact.secondPhoneHref },
      ];
}

/** Mon–Sat sessions left, today included, up to the last day. */
function trainingDaysLeft(today: string, from: string, until: string): number {
  let count = 0;
  const start = new Date(`${today < from ? from : today}T00:00:00Z`);
  const end = new Date(`${until}T00:00:00Z`);
  for (let d = start; d <= end; d = new Date(d.getTime() + 86_400_000)) {
    if (d.getUTCDay() !== 0) count += 1;
  }
  return count;
}

const HOLIDAY_FROM = '2026-11-02';
const HOLIDAY_UNTIL = '2026-12-19';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** The headline's type treatment is part of each theme. */
const HEADLINE: Record<ProgramTheme, string> = {
  pathway: 'hard-shadow',
  holiday: 'hard-shadow [--hard-shadow:#F5F2EA] -rotate-2 origin-left',
  board: '',
  breath: '!font-medium tracking-[0.03em]',
  ring: 'hard-shadow -skew-x-6 origin-left',
  beat: 'hard-shadow [--hard-shadow:#0E1C14]',
  drill: 'hard-shadow',
  event: 'hard-shadow',
};

function Headline({ story }: { story: ProgramStory }) {
  const lines = story.headline;
  const size = lines.join('').length > 14 ? 'text-[clamp(56px,9vw,128px)]' : 'text-[clamp(64px,11vw,156px)]';
  return (
    <h1 className={`display m-0 leading-[0.82] ${size} ${HEADLINE[story.theme]}`}>
      {lines.map((line, i) => {
        const last = i === lines.length - 1 && lines.length > 1;
        if (story.theme === 'board' && last) {
          // "Club" sits on a dark square, like a piece on the board.
          return (
            <span key={line} className="mt-2 inline-block bg-[#15241B] px-3 pt-1 pb-0 text-[#F5F2EA]">
              {line}
            </span>
          );
        }
        if (story.theme === 'drill' && last) {
          return (
            <span key={line} className="block text-transparent [-webkit-text-stroke:2px_#C2A15B] [text-shadow:none]">
              {line}
            </span>
          );
        }
        if (story.theme === 'beat' && last) {
          return (
            <span key={line} className="block pl-[0.6em] text-gold">
              {line}
            </span>
          );
        }
        return (
          <span key={line} className={`block ${last ? 'text-gold' : ''}`}>
            {line}
          </span>
        );
      })}
    </h1>
  );
}

function HeroPicture({ story, program }: { story: ProgramStory; program: AcademyProgram }) {
  const photo = story.photo;
  if (!photo) {
    // No photograph of this programme yet: the time does the talking.
    return (
      <div className="relative flex aspect-square w-full max-w-[460px] flex-col justify-end gap-2 justify-self-center overflow-hidden border-2 border-gold p-7 lg:justify-self-end">
        <Motif theme={story.theme} size="tile" />
        <span className="label relative text-[15px] tracking-[0.14em] text-fog">{story.focalLabel}</span>
        <span className="display relative text-[clamp(72px,10vw,128px)] leading-[0.82] text-gold">{story.focal}</span>
        <span className="label relative text-[15px] tracking-[0.14em] text-fog">
          {program.age_group.includes(story.focal) ? program.schedule : program.age_group}
        </span>
      </div>
    );
  }
  const frame: Record<ProgramTheme, string> = {
    pathway: 'print print-tilt-r aspect-[4/5] [--print-shadow:#C2A15B]',
    holiday: 'print print-tilt-r aspect-[4/5] [--print-shadow:#0E1C14]',
    board: 'aspect-[4/5] border-[10px] border-[#15241B] shadow-[12px_12px_0_#C2A15B]',
    breath: 'aspect-[4/5] rounded-t-[999px] border-4 border-[#F5F2EA] shadow-[0_24px_60px_rgba(45,80,22,0.18)]',
    ring: 'print print-tilt-l aspect-[4/5]',
    beat: 'print print-tilt-l aspect-[4/5] [--print-shadow:#0E1C14]',
    drill: 'print print-tilt-l aspect-[4/5] [--print-shadow:#C2A15B]',
    event: 'print print-tilt-r aspect-[4/5] [--print-shadow:#C2A15B]',
  };
  return (
    <div className={`relative w-full max-w-[440px] justify-self-center overflow-hidden lg:justify-self-end ${frame[story.theme]}`}>
      <div className={`absolute inset-0 ${photo.treatment === 'duotone' ? 'duotone' : ''}`}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 440px"
          className="object-cover"
          style={{ objectPosition: photo.position ?? 'center' }}
        />
      </div>
    </div>
  );
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = load(slug);
  if (!found) notFound();
  const { program, story } = found;

  const url = `${siteOrigin}/programs/${program.slug}`;
  const registerUrl = whatsappUrl(contact.whatsappNumber, story.register.message);
  const shareText = `${program.name} at Mountain View Sports Arena: ${story.shareLine}`;
  const { items } = await loadWhatsOn();
  // Cards that only point back to this page would repeat the hero, so they are left out.
  const related = itemsForProgram(items, program.slug, program.id).filter(
    (item) => item.linkUrl !== `/programs/${program.slug}`
  );
  const others = getAcademyPrograms().filter((p) => p.slug !== program.slug);
  const today = nairobiToday(new Date());
  const holidayDaysLeft = story.week ? trainingDaysLeft(today, HOLIDAY_FROM, HOLIDAY_UNTIL) : 0;
  const todayName = WEEKDAYS[new Date(`${today}T00:00:00Z`).getUTCDay()];

  return (
    <main className={themeClass(story.theme)} data-program={program.slug}>
      {/* Hero, in the programme's own theme. */}
      <section className="prog-hero">
        <Motif theme={story.theme} />
        {story.theme === 'holiday' ? <div aria-hidden="true" className="stripe-band absolute inset-x-0 top-0" /> : null}
        <div className="wrap relative grid items-center gap-12 pt-[clamp(40px,6vw,72px)] pb-[clamp(56px,7vw,96px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="rise flex min-w-0 flex-col gap-6">
            <Link href="/programs" className="text-link self-start text-[14px]">
              All programs
            </Link>
            <span className="tag">{story.kicker}</span>
            <Headline story={story} />
            <p className="m-0 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="label text-[15px] tracking-[0.14em] text-fog">{story.focalLabel}</span>
              <span className="display text-[clamp(40px,5vw,64px)] leading-none text-gold" data-testid="program-focal">
                {story.focal}
              </span>
            </p>
            <p className="m-0 max-w-[580px] text-[clamp(17px,1.4vw,19px)] leading-[1.55] text-fog">{story.lede}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a href={registerUrl} target="_blank" rel="noopener noreferrer" className="btn shine" data-testid="register-cta">
                {story.register.label}
                <span className="sr-only"> on WhatsApp</span>
              </a>
              {story.formUrl ? (
                <a href={story.formUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" data-testid="register-online">
                  Register online
                  <span className="sr-only"> (Google Form, opens in a new tab)</span>
                </a>
              ) : null}
            </div>
            <ShareBar url={url} text={shareText} />
          </div>
          <HeroPicture story={story} program={program} />
        </div>
      </section>

      {/* At a glance. */}
      <section className="border-y border-white/[0.08] bg-surface" aria-label="At a glance">
        <dl className="wrap m-0 grid gap-6 py-8 sm:grid-cols-3">
          {[
            { term: 'When', value: program.schedule },
            { term: 'Who', value: program.age_group },
            { term: 'Where', value: 'The Arena, behind Mountain View Mall, Waiyaki Way' },
          ].map((row) => (
            <div key={row.term} className="flex flex-col gap-1.5 border-l-4 border-gold pl-4">
              <dt className="label text-[13px] tracking-[0.14em] text-mute">{row.term}</dt>
              <dd className="m-0 text-lg font-semibold leading-snug text-white">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The pathway: a real sequence, so it is numbered. */}
      {story.steps ? (
        <section className="wrap flex flex-col gap-8 py-[clamp(56px,7vw,88px)]" aria-labelledby="steps-title">
          <h2 id="steps-title" className="h-section">
            The <span className="text-gold">pathway</span>
          </h2>
          <ol className="m-0 grid list-none gap-0 p-0 md:grid-cols-3">
            {story.steps.map((step, i) => (
              <li key={step.title} className="relative flex flex-col gap-3 border-t-4 border-gold pt-6 pr-6 pb-6 md:pb-0">
                <span className="display text-[64px] leading-none text-gold">{i + 1}</span>
                <h3 className="display m-0 text-[32px] leading-[0.9]">{step.title}</h3>
                <p className="m-0 max-w-[340px] text-base leading-[1.55] text-fog">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Holiday: the week, day by day, with today marked. */}
      {story.week ? (
        <section className="wrap flex flex-col gap-8 py-[clamp(56px,7vw,88px)]" aria-labelledby="week-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="week-title" className="h-section">
              Who trains <span className="text-gold">when</span>
            </h2>
            {holidayDaysLeft > 0 ? (
              <p className="m-0 flex items-baseline gap-3" data-testid="holiday-countdown">
                <span className="display text-[clamp(48px,6vw,72px)] leading-none text-gold">{holidayDaysLeft}</span>
                <span className="label text-[15px] tracking-[0.12em] text-fog">training days left</span>
              </p>
            ) : null}
          </div>
          <ul className="m-0 flex list-none flex-col border-t-4 border-[#0E1C14] p-0">
            {story.week.map((row) => {
              const isToday = row.day === todayName && holidayDaysLeft > 0 && today >= HOLIDAY_FROM;
              return (
                <li
                  key={row.day}
                  className={`flex flex-wrap items-center gap-x-8 gap-y-1 border-b border-[#0E1C14]/25 px-3 py-4 ${isToday ? 'bg-[#0E1C14] text-[#F5F2EA]' : ''}`}
                  aria-current={isToday ? 'date' : undefined}
                >
                  <span className={`display w-[90px] text-[34px] leading-none ${isToday ? 'text-[#C2A15B]' : ''}`}>{row.day}</span>
                  <span className="label text-[15px] tracking-[0.1em]">11am–1pm</span>
                  <span className="min-w-0 flex-[1_1_220px] text-lg font-semibold">{row.who}</span>
                  {isToday ? <span className="label text-[13px] tracking-[0.14em] text-[#C2A15B]">Today</span> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* What makes it what it is. */}
      <section className={`wrap flex flex-col gap-8 ${story.steps || story.week ? 'pb-[clamp(56px,7vw,88px)]' : 'py-[clamp(56px,7vw,88px)]'}`}>
        <div className="grid gap-8 md:grid-cols-3">
          {story.points.map((point) => (
            <div key={point.title} className="flex flex-col gap-3">
              <PointMark theme={story.theme} />
              <h3 className="display m-0 text-[30px] leading-[0.9]">{point.title}</h3>
              <p className="m-0 max-w-[360px] text-base leading-[1.55] text-fog">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="wrap flex flex-col gap-6 pb-[clamp(56px,7vw,88px)]" aria-labelledby="related-title">
          <h2 id="related-title" className="h-section">
            On <span className="text-gold">now</span>
          </h2>
          <WhatsOnPosters items={related} />
        </section>
      ) : null}

      {/* Register: the point of the page. */}
      <section className="theme-dark relative overflow-hidden bg-pitch" aria-labelledby="register-title" id="register">
        <div className="wrap relative grid gap-10 py-[clamp(56px,7vw,96px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex flex-col gap-6">
            <h2 id="register-title" className="display hard-shadow m-0 text-[clamp(48px,7vw,96px)] leading-[0.84] [--hard-shadow:#0E1C14]">
              {story.register.heading}
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[17px] leading-[1.5] text-fog">
              {story.goodToKnow.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 bg-gold" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-5 self-end">
            <a href={registerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold min-h-[60px] text-[19px]" data-testid="register-cta-bottom">
              {story.register.label} on WhatsApp
            </a>
            <p className="m-0 text-base text-fog">{story.register.note}</p>
            <p className="m-0 text-base text-fog">
              <span className="label mr-2 text-[13px] tracking-[0.14em] text-gold">Call or WhatsApp</span>
              {phones(program).map((phone, i) => (
                <span key={phone.href}>
                  {i > 0 ? ' / ' : null}
                  <a href={phone.href} className="inline-flex min-h-11 items-center font-semibold text-white underline decoration-gold underline-offset-4 hover:text-gold-light">
                    {phone.label}
                  </a>
                </span>
              ))}
            </p>
            {story.formUrl ? (
              <a href={story.formUrl} target="_blank" rel="noopener noreferrer" className="text-link self-start text-base">
                Or register online
                <span className="sr-only"> (Google Form, opens in a new tab)</span>
              </a>
            ) : null}
            <ShareBar url={url} text={shareText} className="border-t border-white/15 pt-5" />
          </div>
        </div>
      </section>

      {/* Everything else at the Arena. */}
      <section className="theme-dark bg-ink" aria-labelledby="others-title">
        <div className="wrap flex flex-col gap-8 py-[clamp(56px,7vw,88px)]">
          <h2 id="others-title" className="h-section">
            Also at <span className="text-gold">the Arena</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {others.slice(0, 4).map((other) => (
              <ProgramTile key={other.id} program={other} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/** A small mark before each point, drawn in the programme's motif. */
function PointMark({ theme }: { theme: ProgramTheme }) {
  const mark: Record<ProgramTheme, ReactNode> = {
    pathway: <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" />,
    holiday: <polygon points="12,1 15,9 23,9 17,14 19,23 12,18 5,23 7,14 1,9 9,9" fill="currentColor" />,
    board: (
      <>
        <rect x="2" y="2" width="10" height="10" fill="currentColor" />
        <rect x="12" y="12" width="10" height="10" fill="currentColor" />
        <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
    breath: <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />,
    ring: <rect x="2" y="8" width="20" height="8" fill="currentColor" transform="rotate(-12 12 12)" />,
    beat: (
      <>
        <rect x="2" y="10" width="4" height="12" fill="currentColor" />
        <rect x="10" y="2" width="4" height="20" fill="currentColor" />
        <rect x="18" y="7" width="4" height="15" fill="currentColor" />
      </>
    ),
    drill: <path d="M3 21 L12 3 L21 21 Z" fill="currentColor" />,
    event: <polygon points="12,1 14,9 23,12 14,15 12,23 10,15 1,12 10,9" fill="currentColor" />,
  };
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-gold" aria-hidden="true">
      {mark[theme]}
    </svg>
  );
}
