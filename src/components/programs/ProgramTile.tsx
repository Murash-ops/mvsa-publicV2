import Link from 'next/link';
import type { AcademyProgram } from '@/lib/academy-programs';
import { getStory } from '@/content/programs';
import Motif from '@/components/programs/Motif';
import { themeClass } from '@/components/programs/theme';

/** A programme card in its own theme, linking to its page. */
export default function ProgramTile({ program }: { program: AcademyProgram }) {
  const story = getStory(program.slug);
  const theme = story?.theme ?? 'pathway';
  return (
    <Link
      href={`/programs/${program.slug}`}
      className={`${themeClass(theme)} prog-tile group relative flex min-h-[200px] flex-col justify-end gap-1.5 overflow-hidden p-5 sm:min-h-[240px] sm:p-6`}
      data-testid="program-tile"
    >
      {/* On a card the drawing keeps to the top, clear of the words. */}
      <div aria-hidden="true" className={`absolute inset-x-0 top-0 ${['pathway', 'drill', 'event', 'ring'].includes(theme) ? 'h-[55%]' : 'h-full'}`}>
        <Motif theme={theme} size="tile" />
      </div>
      <span className="label relative text-[13px] tracking-[0.08em] text-gold">{program.schedule}</span>
      <h3 className="display relative m-0 text-[clamp(30px,3.4vw,44px)] leading-[0.86]">{program.name}</h3>
      {program.age_group ? <span className="relative text-[15px] leading-snug text-fog">{program.age_group}</span> : null}
    </Link>
  );
}
