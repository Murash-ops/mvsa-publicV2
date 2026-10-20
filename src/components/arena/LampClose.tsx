import type { ReactNode } from 'react';
import { home } from '@/content/site';

/** The closing section: "Bring your squad", on the pitch green. */
export default function LampClose({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-pitch" aria-labelledby="closing-title">
      <div className="wrap relative flex flex-col items-center gap-7 py-[clamp(72px,9vw,112px)] text-center">
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
