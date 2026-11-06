'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';

type Tab = 'pitch' | 'room';

/**
 * "Pitch | Meeting room" at the top of /book, so on a phone the meeting room
 * is one tap away instead of a long scroll below the pitch. The address
 * follows the choice (/book#meeting-room), so the navigation link and shared
 * links open the right one. Before the page is interactive both sections
 * show, one after the other, so nothing is lost without JavaScript.
 */
export default function BookTabs({ pitch, room }: { pitch: ReactNode; room: ReactNode }) {
  const [tab, setTab] = useState<Tab | null>(null);

  const fromHash = useCallback(() => {
    const next: Tab = window.location.hash === '#meeting-room' ? 'room' : 'pitch';
    setTab(next);
    if (next === 'room') {
      requestAnimationFrame(() => document.getElementById('book-tabs')?.scrollIntoView({ block: 'start' }));
    }
  }, []);

  useEffect(() => {
    // Reading the address once the page is in the browser is the point here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [fromHash]);

  const choose = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, '', next === 'room' ? '#meeting-room' : '#arena');
  };

  const option = (value: Tab, label: string, sub: string) => {
    const selected = tab === value;
    return (
      <button
        type="button"
        aria-pressed={selected}
        aria-controls={value === 'pitch' ? 'arena' : 'meeting-room'}
        onClick={() => choose(value)}
        className={`flex min-h-[60px] flex-1 flex-col items-start justify-center px-4 py-2 text-left transition-colors sm:px-6 ${
          selected ? 'bg-pitch text-[#F5F2EA]' : 'bg-surface text-white hover:bg-[#EDE7D8]'
        }`}
        data-testid={`book-tab-${value}`}
      >
        <span className="display text-[24px] leading-none sm:text-[28px]">{label}</span>
        <span className={`text-[14px] ${selected ? 'text-[#E3E8E1]' : 'text-mute'}`}>{sub}</span>
      </button>
    );
  };

  return (
    <>
      <div id="book-tabs" className="wrap scroll-mt-24 pb-6">
        <div role="group" aria-label="What would you like to book?" className="flex border-2 border-pitch shadow-[0_8px_24px_rgba(14,28,20,0.12)]">
          {option('pitch', 'The pitch', 'From KSH 1,500 an hour')}
          {option('room', 'Meeting room', 'KSH 1,000 an hour')}
        </div>
      </div>
      <div hidden={tab === 'room'}>{pitch}</div>
      <div hidden={tab === 'pitch'}>{room}</div>
    </>
  );
}
