'use client';

import { useSyncExternalStore } from 'react';

/** The hour in Nairobi, 0 to 23. */
function nairobiHour(): number {
  try {
    const hour = new Date().toLocaleString('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      hour12: false,
    });
    return Number.parseInt(hour, 10) % 24;
  } catch {
    return 12;
  }
}

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

/** Open from 08:00 until midnight, every day. */
const getOpen = () => nairobiHour() >= 8;
/** The server cannot know the visitor's moment, so it renders the neutral line. */
const getServerOpen = () => null;

export default function StatusPill() {
  const open = useSyncExternalStore(subscribe, getOpen, getServerOpen);

  const text = open === null ? 'Open every day · 08:00 to midnight' : open ? 'Open now · until midnight' : 'Opens 08:00';

  return (
    <span
      className="label inline-flex items-center gap-2.5 self-start rounded-full border border-white/[0.16] bg-white/[0.08] px-3.5 py-2 text-[15px] tracking-[0.14em]"
      data-testid="status-pill"
    >
      <span
        aria-hidden="true"
        className={`status-dot h-[9px] w-[9px] rounded-full ${open ? 'is-open bg-[#3FDC6E]' : 'bg-gold'}`}
      />
      {text}
    </span>
  );
}
