'use client';

import { useState, type MouseEvent } from 'react';
import { PickedTime } from './Kickoff';

const REST = { rx: 52, rz: -16 };

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** The pitch drawn in 3D, tilting with the mouse, the picked hour floating over it. */
export default function Pitch3D({ caption }: { caption: string }) {
  const [tilt, setTilt] = useState(REST);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: Math.round(52 - py * 14), rz: Math.round(-16 + px * 22) });
  };

  const lamp = 'absolute h-4 w-4 rounded-full bg-[#FFF6DC] shadow-[0_0_30px_12px_rgba(255,240,205,0.55)]';

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={() => setTilt(REST)}
      className="flex h-[clamp(300px,60vw,460px)] min-w-0 flex-[1_1_520px] items-center justify-center [perspective:1100px] bg-[radial-gradient(ellipse_60%_55%_at_50%_55%,rgba(63,163,77,0.22),transparent_70%)]"
    >
      <div
        className="relative aspect-[520/340] w-[76%] sm:w-[86%] max-w-[540px] [transform-style:preserve-3d] transition-transform duration-[350ms] ease-out"
        style={{ transform: `rotateX(${tilt.rx}deg) rotateZ(${tilt.rz}deg)` }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#2F7D3A_0_52px,#29703A_52px_104px)] shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_10px_#1E4F26]"
        />
        <svg viewBox="0 0 520 340" width="100%" height="100%" role="img" aria-label="Pitch diagram" className="absolute inset-0">
          <g fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5">
            <rect x="10" y="10" width="500" height="320" />
            <line x1="260" y1="10" x2="260" y2="330" />
            <circle cx="260" cy="170" r="42" />
            <rect x="10" y="100" width="62" height="140" />
            <rect x="448" y="100" width="62" height="140" />
            <rect x="2" y="145" width="8" height="50" />
            <rect x="510" y="145" width="8" height="50" />
          </g>
          <circle cx="260" cy="170" r="3.5" fill="#FFFFFF" />
        </svg>
        <div aria-hidden="true" className={`${lamp} -top-2 -left-2`} />
        <div aria-hidden="true" className={`${lamp} -top-2 -right-2`} />
        <div aria-hidden="true" className={`${lamp} -bottom-2 -left-2`} />
        <div aria-hidden="true" className={`${lamp} -bottom-2 -right-2`} />
        <div className="pitch-marker absolute top-1/2 left-1/2 -mt-[34px] -ml-[92px] flex w-[184px] flex-col items-center gap-0.5 border-2 border-gold bg-ink px-3.5 py-2.5 shadow-[0_16px_30px_rgba(0,0,0,0.5)]">
          <span className="display text-[40px] leading-none text-gold">
            <PickedTime />
          </span>
          <span className="label text-sm tracking-[0.14em]">{caption}</span>
        </div>
      </div>
    </div>
  );
}
