import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import ProgramTile from '@/components/programs/ProgramTile';
import { getAcademyPrograms } from '@/lib/academy-programs';
import { contact } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Programmes | Mountain View Sports Arena',
  description:
    'Football Academy, Holiday Training, Chess Club, Community Yoga, Boxing, Dance & Rhythm, individual training and events at the Arena.',
};

/**
 * Programme data comes from src/lib/academy-programs: checked-in seed data,
 * because the backend contract has no programmes endpoint. Each card opens the
 * programme's own page, which carries its own share card.
 */
export default function ProgramsPage() {
  const programs = getAcademyPrograms();
  const academy = programs.filter((p) => p.type === 'academy');
  const rest = programs.filter((p) => p.type !== 'academy');

  return (
    <main className="theme-light">
      <PageHeader
        eyebrow="Programmes"
        titleTop="More than"
        titleBottom="a pitch"
        intro="Football, chess and dance with the Academy; yoga and boxing for adults; your own session or your own event on the Arena. Every programme has its own page to share."
      >
        <a
          href={whatsappUrl(contact.whatsappNumber, "Hi MVSA, I'd like to know more about your programmes")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-gold self-start"
        >
          Ask us on WhatsApp
        </a>
      </PageHeader>

      <section className="wrap flex flex-col gap-5 pb-12" aria-labelledby="academy-title">
        <h2 id="academy-title" className="h-section text-[clamp(28px,3vw,40px)]">
          Mountain View Sports Academy
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {academy.map((program) => (
            <ProgramTile key={program.id} program={program} />
          ))}
        </div>
      </section>

      <section className="wrap flex flex-col gap-5 pb-[clamp(56px,7vw,88px)]" aria-labelledby="more-title">
        <h2 id="more-title" className="h-section text-[clamp(28px,3vw,40px)]">
          Fitness, training and events
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {rest.map((program) => (
            <ProgramTile key={program.id} program={program} />
          ))}
        </div>
      </section>
    </main>
  );
}
