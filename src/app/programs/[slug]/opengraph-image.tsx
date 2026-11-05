import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { getAcademyProgram, getAcademyPrograms } from '@/lib/academy-programs';
import { getStory, type ProgramTheme } from '@/content/programs';

/**
 * The card WhatsApp, Facebook and X show when a programme link is shared:
 * the programme's name in the brand's display face, its time, and a duotone
 * photograph, in the programme's own colours. Built once at deploy time.
 */

export const alt = 'Mountain View Sports Arena programme';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAcademyPrograms().map((program) => ({ slug: program.slug }));
}

const GROUND: Record<ProgramTheme, { bg: string; fg: string; accent: string; muted: string }> = {
  pathway: { bg: '#0E1C14', fg: '#F5F2EA', accent: '#C2A15B', muted: '#B9C4B8' },
  holiday: { bg: '#C2A15B', fg: '#0E1C14', accent: '#0E1C14', muted: '#2E3A31' },
  board: { bg: '#F5F2EA', fg: '#15241B', accent: '#7A5D22', muted: '#3A4A40' },
  breath: { bg: '#E6ECE2', fg: '#15241B', accent: '#2D6A3A', muted: '#3A4A40' },
  ring: { bg: '#0B1610', fg: '#F5F2EA', accent: '#C2A15B', muted: '#B9C4B8' },
  beat: { bg: '#2D5016', fg: '#F5F2EA', accent: '#E2CB8F', muted: '#DCE5D6' },
  drill: { bg: '#0E1C14', fg: '#F5F2EA', accent: '#C2A15B', muted: '#B9C4B8' },
  event: { bg: '#0B1610', fg: '#F5F2EA', accent: '#C2A15B', muted: '#B9C4B8' },
};

async function asset(...parts: string[]): Promise<Buffer> {
  return readFile(join(process.cwd(), 'assets', ...parts));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getAcademyProgram(slug);
  const story = program ? getStory(program.slug) : undefined;
  if (!program || !story) {
    return new ImageResponse(<div style={{ width: '100%', height: '100%', background: '#0E1C14' }} />, size);
  }

  const [display, label] = await Promise.all([
    asset('og-fonts', 'BigShouldersDisplay-Black.ttf'),
    asset('og-fonts', 'BarlowCondensed-ExtraBold.ttf'),
  ]);
  const photo = story.ogPhoto ? `data:image/jpeg;base64,${(await asset('og-photos', story.ogPhoto)).toString('base64')}` : null;
  const c = GROUND[story.theme];
  const name = story.headline.join(' ');
  const longest = Math.max(...story.headline.map((line) => line.length));
  const nameSize = longest >= 9 ? 120 : 150;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: c.bg, position: 'relative' }}>
        {story.theme === 'holiday' ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: 18,
              backgroundImage: 'repeating-linear-gradient(-45deg, #0E1C14 0 14px, #C2A15B 14px 28px)',
            }}
          />
        ) : null}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 0 56px 72px',
            width: photo ? 680 : 1100,
          }}
        >
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                background: story.theme === 'holiday' ? '#0E1C14' : c.accent,
                color: story.theme === 'holiday' ? '#F5F2EA' : c.bg,
                fontFamily: 'Barlow Condensed',
                fontSize: 26,
                letterSpacing: 3,
                textTransform: 'uppercase',
                padding: '8px 16px 6px',
                transform: 'rotate(-2deg)',
              }}
            >
              {story.kicker}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontFamily: 'Big Shoulders',
                fontSize: nameSize,
                lineHeight: 0.84,
                color: c.fg,
                textTransform: 'uppercase',
                display: 'flex',
                flexDirection: 'column',
                textShadow: story.theme === 'board' || story.theme === 'breath' ? 'none' : `6px 6px 0 ${story.theme === 'holiday' ? '#F5F2EA' : '#2D5016'}`,
              }}
            >
              {story.headline.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 24, gap: 18 }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontSize: 28, letterSpacing: 3, textTransform: 'uppercase', color: c.muted }}>
                {story.focalLabel}
              </span>
              <span style={{ fontFamily: 'Big Shoulders', fontSize: 72, color: c.accent, textTransform: 'uppercase', lineHeight: 1 }}>
                {story.focal}
              </span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Barlow Condensed',
              fontSize: 24,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: c.muted,
            }}
          >
            Mountain View Sports Arena · mvsa.co.ke
          </div>
        </div>
        {photo ? (
          <div style={{ display: 'flex', position: 'absolute', right: 56, top: 56, width: 420, height: 518, transform: 'rotate(2deg)' }}>
            <div style={{ display: 'flex', position: 'absolute', left: 16, top: 16, width: 420, height: 518, background: story.theme === 'holiday' ? '#0E1C14' : '#C2A15B' }} />
            <img
              src={photo}
              alt=""
              width={420}
              height={518}
              style={{ position: 'absolute', left: 0, top: 0, width: 420, height: 518, objectFit: 'cover', border: '10px solid #F5F2EA' }}
            />
          </div>
        ) : (
          // No photograph yet: the programme's own drawing fills the right side.
          <div style={{ display: 'flex', position: 'absolute', right: 72, bottom: 0, width: 380, height: 470, alignItems: 'flex-end', gap: 14 }}>
            {(story.theme === 'beat' ? [40, 72, 55, 90, 64, 100, 48, 80] : [100, 100, 100, 100]).map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  width: story.theme === 'beat' ? 32 : 56,
                  height: `${h}%`,
                  background: '#C2A15B',
                  opacity: story.theme === 'beat' ? 0.75 : 0.85,
                  ...(story.theme === 'beat' ? {} : { transform: 'skewX(-24deg)' }),
                }}
              />
            ))}
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Big Shoulders', data: display, style: 'normal', weight: 900 },
        { name: 'Barlow Condensed', data: label, style: 'normal', weight: 800 },
      ],
    }
  );
}
