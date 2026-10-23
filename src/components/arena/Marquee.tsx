import { home } from '@/content/site';

/**
 * The band that never stops scrolling (unless motion is turned down).
 * "night" is the hero's own dark base, so the hero ends in one block instead
 * of a bright stripe; "pitch" is the green band used inside a page.
 */
export default function Marquee({
  items = home.marquee,
  tone = 'pitch',
}: {
  items?: readonly string[];
  tone?: 'pitch' | 'night';
}) {
  const line = [...items, ...items].join(' ✦ ') + ' ✦';
  const toneClass = tone === 'night' ? 'bg-ink text-gold' : 'bg-pitch text-[#F5F2EA]';
  return (
    <div aria-hidden="true" className={`overflow-hidden whitespace-nowrap py-3.5 ${toneClass}`} data-tone={tone}>
      <div className="marquee-track display flex w-max text-[22px] leading-none tracking-[0.04em]" data-testid="marquee-track">
        <span className="pr-10">{line}</span>
        <span className="pr-10">{line}</span>
      </div>
    </div>
  );
}
