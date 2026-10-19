import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import { getAcademyProgram, getAcademyPrograms } from '@/lib/academy-programs';
import { contact } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';

export function generateStaticParams() {
  return getAcademyPrograms().map((program) => ({ id: program.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const program = getAcademyProgram(id);
  return program
    ? { title: `${program.name} | Mountain View Sports Arena`, description: program.description }
    : { title: 'Programs | Mountain View Sports Arena' };
}

/**
 * Programme data comes from src/lib/academy-programs: checked-in seed data,
 * because the backend contract has no programmes endpoint. Enrolment is an
 * enquiry over WhatsApp: nothing on this page reserves a place or takes money.
 */
export default async function ProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = getAcademyProgram(id);
  if (!program) notFound();

  const joinUrl = whatsappUrl(
    contact.academyWhatsappNumber,
    `Hi MVSA, I would like to join ${program.name}. Could you tell me more?`
  );

  return (
    <main>
      <PageHeader
        eyebrow={program.age_group}
        titleTop={program.name}
        intro={program.description}
        image={program.image_url ? { src: program.image_url, alt: 'The pitch at Mountain View Sports Arena' } : undefined}
      >
        <Link href="/programs" className="text-link self-start text-base">
          ← All programs
        </Link>
      </PageHeader>

      <section className="wrap grid gap-3.5 pb-[clamp(72px,9vw,112px)] md:grid-cols-2">
        <div className="flex flex-col gap-4 border border-t-4 border-white/10 border-t-grass bg-surface px-7 py-8">
          <span className="label text-[15px] text-gold">When</span>
          <p className="display m-0 text-[clamp(40px,5vw,56px)] leading-[0.92]">{program.schedule}</p>
          <span className="label mt-2 text-[15px] text-gold">Who</span>
          <p className="display m-0 text-[clamp(40px,5vw,56px)] leading-[0.92]">{program.age_group}</p>
        </div>
        <div className="flex flex-col gap-5 border border-white/10 bg-surface px-7 py-8">
          <h2 className="display m-0 text-[48px] leading-[0.92]">
            Ask to <span className="text-gold">join</span>
          </h2>
          <p className="m-0 text-lg leading-[1.55] text-fog">
            Joining is arranged with the academy on WhatsApp or by phone. Nothing on this page reserves a place or takes payment.
          </p>
          <div className="mt-auto flex flex-wrap gap-3">
            <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="btn shine">
              Ask on WhatsApp
            </a>
            <a href={contact.academyPhoneHref} className="btn btn-ghost">
              Call {contact.academyPhone}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
