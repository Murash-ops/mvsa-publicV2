'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { defaultKickoff, kickoffTimes } from '@/content/site';
import { arenaBookingUrl } from '@/lib/whatsapp';

/**
 * The kick-off the visitor has picked, shared by every "Book on WhatsApp"
 * link on the page, so the hero, the picker and the closing call all send
 * the same request: "Hi MVSA, I would like to book the Arena at HH:MM."
 */

interface KickoffState {
  picked: string;
  setPicked: (time: string) => void;
  href: string;
}

const KickoffContext = createContext<KickoffState | null>(null);

export function KickoffProvider({ children }: { children: ReactNode }) {
  const [picked, setPickedState] = useState<string>(defaultKickoff);
  const setPicked = useCallback((time: string) => setPickedState(time), []);
  const value = useMemo(
    () => ({ picked, setPicked, href: arenaBookingUrl(picked) }),
    [picked, setPicked]
  );
  return <KickoffContext.Provider value={value}>{children}</KickoffContext.Provider>;
}

export function useKickoff(): KickoffState {
  const context = useContext(KickoffContext);
  if (context) return context;
  return { picked: defaultKickoff, setPicked: () => {}, href: arenaBookingUrl(defaultKickoff) };
}

/** A link that opens WhatsApp with the picked kick-off filled in. */
export function BookArenaLink({
  className,
  children,
  testId,
}: {
  className?: string;
  children: ReactNode;
  testId?: string;
}) {
  const { href } = useKickoff();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} data-testid={testId}>
      {children}
    </a>
  );
}

/** The kick-off chips, 17:00 to 22:00. */
export function KickoffChips() {
  const { picked, setPicked } = useKickoff();
  return (
    <div role="group" aria-label="Kick-off time" className="flex flex-wrap gap-2.5" data-testid="kickoff-picker">
      {kickoffTimes.map((time) => (
        <button
          key={time}
          type="button"
          className="chip"
          aria-pressed={time === picked}
          onClick={() => setPicked(time)}
        >
          {time}
        </button>
      ))}
    </div>
  );
}

/** "Ask for 20:00": the gold call under the chips. */
export function AskForKickoff({ className }: { className?: string }) {
  const { picked, href } = useKickoff();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn shine self-start ${className ?? ''}`}
      data-testid="kickoff-cta"
      data-route="whatsapp"
    >
      Ask for {picked}
    </a>
  );
}

export function PickedTime() {
  const { picked } = useKickoff();
  return <>{picked}</>;
}
