import Link from 'next/link';
import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import { getAcademyPrograms } from '@/lib/academy-programs';
import { contact } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Programs | Mountain View Sports Arena',
  description: 'Football Academy, Chess Club, Boxing, Community Yoga and Dance & Rhythm at the Arena.',
};

/**
 * Programme data comes from src/lib/academy-programs: checked-in seed data,
 * because the backend contract has no programmes endpoint. See that module and
 * docs/backend-migration.md before wiring this page to anything live.
 */
export default function ProgramsPage() {
  const programs = getAcademyPrograms();

  return (
    <main>
      <PageHeader
        eyebrow="Programs"
        titleTop="More than"
        titleBottom="a pitch"
        intro="Football, chess, boxing, yoga and dance at the Arena. Ask the academy line to join any of them."
      >
        <a
          href={whatsappUrl(contact.academyWhatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-gold self-start"
        >
          Academy · {contact.academyPhone}
        </a>
      </PageHeader>

      <section className="wrap pb-[clamp(56px,7vw,88px)]">
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {programs.map((program, i) => (
            <article
              key={program.id}
              className="rise flex min-h-[200px] flex-col gap-3 border border-t-4 border-white/10 border-t-grass bg-surface px-6 py-7"
              style={{ animationDelay: `${(i * 0.07).toFixed(2)}s` }}
            >
              <span className="label text-[13px] text-gold">{program.age_group}</span>
              <h2 className="display m-0 text-[32px] leading-[0.92]">{program.name}</h2>
              <p className="label m-0 text-base tracking-[0.06em] text-white">{program.schedule}</p>
              <p className="m-0 grow text-base leading-normal text-fog">{program.description}</p>
              <Link href={`/programs/${program.id}`} className="text-link text-base" aria-label={`More about ${program.name}`}>
                More about it
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
