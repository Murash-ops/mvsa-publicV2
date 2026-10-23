'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { defaultKickoff, kickoffGroups } from '@/content/site';
import { arenaBookingUrl } from '@/lib/whatsapp';
import { dayLabel, dayPhrase, fetchSlotHours, isPast, nairobiDate, type SlotHours } from '@/lib/slots';

/**
 * The kick-off the visitor has picked, day and hour, shared by every "Book on
 * WhatsApp" link on the page, so the hero, the picker and the closing call all
 * send the same request: "Hi MVSA, I would like to book the Arena today at
 * 20:00."
 *
 * Days and live hours are worked out in the browser after it loads: the page
 * itself is built ahead of time, so "today" on the server could be days old.
 * Until then (or if the slots service can't be reached) every hour is
 * pickable and reception confirms on WhatsApp, as before.
 */

const DAYS_AHEAD = 7;
const REFRESH_MS = 60_000;
const ALL_TIMES: string[] = kickoffGroups.flatMap((group) => [...group.times]);

interface Day {
  offset: number;
  date: string;
  label: string;
  phrase: string;
}

type Live = { date: string; hours: SlotHours } | null;

interface KickoffState {
  picked: string;
  setPicked: (time: string) => void;
  days: Day[];
  day: Day | null;
  setDayOffset: (offset: number) => void;
  live: Live;
  now: Date | null;
  href: string;
}

const KickoffContext = createContext<KickoffState | null>(null);

function buildDays(now: Date): Day[] {
  return Array.from({ length: DAYS_AHEAD }, (_, offset) => {
    const date = nairobiDate(offset, now);
    return { offset, date, label: dayLabel(offset, date), phrase: dayPhrase(offset, date) };
  });
}

// The visitor's minute, ticking once a minute. The server can't know it, so
// it renders without days and every hour open.
function subscribeMinute(onChange: () => void) {
  const timer = setInterval(onChange, REFRESH_MS);
  return () => clearInterval(timer);
}
const getMinute = () => Math.floor(Date.now() / REFRESH_MS);
const getServerMinute = () => null;

export function KickoffProvider({ children }: { children: ReactNode }) {
  const [picked, setPickedState] = useState<string>(defaultKickoff);
  const minute = useSyncExternalStore(subscribeMinute, getMinute, getServerMinute);
  const now = useMemo(() => (minute === null ? null : new Date(minute * REFRESH_MS)), [minute]);
  // Until the visitor picks a day: today, or tomorrow once the default hour
  // has gone, so the first request isn't for a time in the past.
  const [chosenOffset, setDayOffset] = useState<number | null>(null);
  const dayOffset = chosenOffset ?? (now && isPast(defaultKickoff, 0, now) ? 1 : 0);
  const [live, setLive] = useState<Live>(null);

  const days = useMemo(() => (now ? buildDays(now) : []), [now]);
  const day = days[dayOffset] ?? null;
  const date = day?.date ?? null;

  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    fetchSlotHours(date, controller.signal).then((hours) => {
      if (!controller.signal.aborted) setLive(hours ? { date, hours } : null);
    });
    return () => controller.abort();
  }, [date, minute]);

  const setPicked = useCallback((time: string) => setPickedState(time), []);
  const value = useMemo(
    () => ({
      picked,
      setPicked,
      days,
      day,
      setDayOffset,
      live: live && live.date === date ? live : null,
      now,
      href: arenaBookingUrl(picked, day?.phrase),
    }),
    [picked, setPicked, days, day, live, date, now]
  );
  return <KickoffContext.Provider value={value}>{children}</KickoffContext.Provider>;
}

export function useKickoff(): KickoffState {
  const context = useContext(KickoffContext);
  if (context) return context;
  return {
    picked: defaultKickoff,
    setPicked: () => {},
    days: [],
    day: null,
    setDayOffset: () => {},
    live: null,
    now: null,
    href: arenaBookingUrl(defaultKickoff),
  };
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

type ChipState = 'past' | 'booked' | 'free' | 'open';

/**
 * The day pills, then every hour from 06:00 to 23:00 by part of the day.
 * With live hours, booked and past hours can't be picked; hours the slots
 * service says nothing about stay open.
 */
export function KickoffChips() {
  const { picked, setPicked, days, day, setDayOffset, live, now } = useKickoff();

  const stateOf = useCallback(
    (time: string): ChipState => {
      if (day && now && isPast(time, day.offset, now)) return 'past';
      return live?.hours[time] ?? 'open';
    },
    [day, now, live]
  );

  // If the picked hour is taken or gone, move to the next one that isn't.
  useEffect(() => {
    const blocked = (time: string) => ['past', 'booked'].includes(stateOf(time));
    if (!blocked(picked)) return;
    const next = ALL_TIMES.find((time) => time > picked && !blocked(time)) ?? ALL_TIMES.find((time) => !blocked(time));
    if (next) setPicked(next);
  }, [stateOf, picked, setPicked]);

  const freeCount = live ? ALL_TIMES.filter((time) => stateOf(time) === 'free').length : 0;

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Day"
        className="scrollbar-hide -mx-1 flex min-h-11 gap-2 overflow-x-auto px-1"
        data-testid="kickoff-days"
      >
        {days.map((d) => (
          <button
            key={d.date}
            type="button"
            className="day-chip"
            aria-pressed={d.offset === day?.offset}
            onClick={() => setDayOffset(d.offset)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {live ? (
        <p className="m-0 flex items-center gap-2 text-sm text-fog" data-testid="kickoff-live" aria-live="polite">
          <span aria-hidden="true" className="status-dot is-open inline-block h-2 w-2 rounded-full bg-grass" />
          {freeCount > 0
            ? `Live: ${freeCount} ${freeCount === 1 ? 'hour' : 'hours'} free ${day?.phrase ?? ''}`.trim()
            : `Fully booked ${day?.phrase ?? ''}. Try another day.`.trim()}
        </p>
      ) : null}

      <div role="group" aria-label="Kick-off time" className="flex flex-col gap-3" data-testid="kickoff-picker">
        {kickoffGroups.map((group) => (
          <div key={group.label} role="group" aria-label={`${group.label} kick-off times`} className="flex flex-col gap-1.5">
            <span className="label text-[12px] text-mute">{group.label}</span>
            <div className="flex flex-wrap gap-2">
              {group.times.map((time) => {
                const state = stateOf(time);
                const unavailable = state === 'booked' || state === 'past';
                return (
                  <button
                    key={time}
                    type="button"
                    className="chip"
                    data-state={state}
                    aria-pressed={time === picked}
                    disabled={unavailable}
                    title={state === 'booked' ? 'Booked' : undefined}
                    onClick={() => setPicked(time)}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Ask for 20:00": the gold call under the chips, naming the day after today. */
export function AskForKickoff({ className }: { className?: string }) {
  const { picked, href, day } = useKickoff();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn shine self-start ${className ?? ''}`}
      data-testid="kickoff-cta"
      data-route="whatsapp"
    >
      Ask for {day && day.offset > 0 ? `${day.label} ` : ''}
      {picked}
    </a>
  );
}

export function PickedTime() {
  const { picked } = useKickoff();
  return <>{picked}</>;
}
