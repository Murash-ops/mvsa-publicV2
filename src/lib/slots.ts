/**
 * Live Arena hours for the kick-off picker.
 *
 * The picker asks the venue's public slots service (mvsa-infra, slots/), which
 * answers per whole hour with "free" or "booked" and nothing else: no names,
 * no prices. Hours it leaves out are unknown and stay pickable. When the
 * service can't be reached the picker simply works as before: pick a time and
 * reception confirms it on WhatsApp.
 */

export const SLOTS_URL = process.env.NEXT_PUBLIC_SLOTS_URL ?? 'https://bot.mvsa.co.ke/public/slots';

export type HourState = 'free' | 'booked';
export type SlotHours = Record<string, HourState>;

const ZONE = 'Africa/Nairobi';

/** The Nairobi calendar date, offset by whole days, as YYYY-MM-DD. */
export function nairobiDate(offsetDays = 0, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONE }).format(
    new Date(now.getTime() + offsetDays * 86_400_000)
  );
}

/** The current hour in Nairobi, 0 to 23. */
export function nairobiHour(now = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', hourCycle: 'h23' }).format(now));
}

function noon(date: string): Date {
  return new Date(`${date}T12:00:00+03:00`);
}

/** The chip label: "Today", "Tomorrow", then "Sat 25". */
export function dayLabel(offset: number, date: string): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  const d = noon(date);
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, weekday: 'short' }).format(d);
  const day = new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, day: 'numeric' }).format(d);
  return `${weekday} ${day}`;
}

/** How the day reads in the WhatsApp request: "today", "tomorrow", "on Saturday 25 October". */
export function dayPhrase(offset: number, date: string): string {
  if (offset === 0) return 'today';
  if (offset === 1) return 'tomorrow';
  const words = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(noon(date));
  return `on ${words.replace(',', '')}`;
}

/** When a booking that starts at `start` and runs `hours` whole hours ends: "22:00", or "midnight". */
export function endTime(start: string, hours: number): string {
  const end = Number(start.slice(0, 2)) + hours;
  return end % 24 === 0 ? 'midnight' : `${String(end % 24).padStart(2, '0')}:00`;
}

/** The picked hours as one label: "20:00", or "20:00–22:00". */
export function rangeLabel(start: string, hours: number): string {
  return hours > 1 ? `${start}–${endTime(start, hours)}` : start;
}

/** True when the hour has already started today. */
export function isPast(time: string, offset: number, now = new Date()): boolean {
  return offset === 0 && Number(time.slice(0, 2)) <= nairobiHour(now);
}

/** One day's hours from the slots service, or null when it can't say. */
export async function fetchSlotHours(date: string, signal?: AbortSignal): Promise<SlotHours | null> {
  try {
    const response = await fetch(`${SLOTS_URL}?date=${date}`, { signal, cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as { date?: string; hours?: Record<string, unknown> };
    if (body.date !== date || !body.hours || typeof body.hours !== 'object') return null;
    const hours: SlotHours = {};
    for (const [time, state] of Object.entries(body.hours)) {
      if (/^\d{2}:00$/.test(time) && (state === 'free' || state === 'booked')) hours[time] = state;
    }
    return hours;
  } catch {
    return null;
  }
}
