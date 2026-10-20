import type { ReactNode } from 'react';
import { home } from '@/content/site';

/** The closing section: one lamp over "Bring your squad". */
export default function LampClose({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ink" aria-labelledby="closing-title">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_45%_70%_at_50%_0%,rgba(224,194,90,0.26),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="lamp-bar absolute top-0 left-1/2 h-[3px] w-[64%] -translate-x-1/2 bg-gold shadow-[0_0_60px_18px_rgba(224,194,90,0.45)]"
      />
      <div className="wrap relative flex flex-col items-center gap-7 pt-[clamp(96px,12vw,150px)] pb-[clamp(80px,10vw,120px)] text-center">
        <h2 id="closing-title" className="display m-0 text-[clamp(44px,6vw,88px)] leading-[0.84]">
          {home.closing.titleTop}
          <br />
          <span className="text-gold">{home.closing.titleBottom}</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </section>
  );
}
