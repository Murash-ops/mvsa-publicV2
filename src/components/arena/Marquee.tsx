import { home } from '@/content/site';

/** The gold band that never stops scrolling (unless motion is turned down). */
export default function Marquee() {
  const line = [...home.marquee, ...home.marquee].join(' ✦ ') + ' ✦';
  return (
    <div aria-hidden="true" className="overflow-hidden whitespace-nowrap bg-gold py-3.5 text-ink">
      <div className="marquee-track display flex w-max text-[34px] leading-none tracking-[0.04em]" data-testid="marquee-track">
        <span className="pr-10">{line}</span>
        <span className="pr-10">{line}</span>
      </div>
    </div>
  );
}
