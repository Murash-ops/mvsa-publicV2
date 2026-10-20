import { home } from '@/content/site';

/** The green band that never stops scrolling (unless motion is turned down). */
export default function Marquee({ items = home.marquee }: { items?: readonly string[] }) {
  const line = [...items, ...items].join(' ✦ ') + ' ✦';
  return (
    <div aria-hidden="true" className="overflow-hidden whitespace-nowrap bg-pitch py-3.5 text-[#F5F2EA]">
      <div className="marquee-track display flex w-max text-[22px] leading-none tracking-[0.04em]" data-testid="marquee-track">
        <span className="pr-10">{line}</span>
        <span className="pr-10">{line}</span>
      </div>
    </div>
  );
}
