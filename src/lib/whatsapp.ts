import { contact } from '@/content/site';
import { endTime } from '@/lib/slots';

/** A wa.me link, with the message filled in when there is one. */
export function whatsappUrl(number: string, message?: string): string {
  return message
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${number}`;
}

/**
 * The request the kick-off picker sends. Reception confirms the slot. The day
 * reads "today", "tomorrow" or "on Saturday 25 October"; without one the
 * request names the time only. More than one hour reads as a range:
 * "from 20:00 to 22:00 (2 hours)". When the hours qualify for Extra Time the
 * message says so, because the customer has to ask for it.
 */
export function arenaBookingMessage(time: string, day?: string, hours = 1, extraTime = false): string {
  const when = hours > 1 ? `from ${time} to ${endTime(time, hours)} (${hours} hours)` : `at ${time}`;
  return `Hi MVSA, I would like to book the Arena${day ? ` ${day}` : ''} ${when}${extraTime ? ', with Extra Time' : ''}. Is it available?`;
}

export function arenaBookingUrl(time: string, day?: string, hours = 1, extraTime = false): string {
  return whatsappUrl(contact.whatsappNumber, arenaBookingMessage(time, day, hours, extraTime));
}
