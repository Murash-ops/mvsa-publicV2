import { contact } from '@/content/site';

/** A wa.me link, with the message filled in when there is one. */
export function whatsappUrl(number: string, message?: string): string {
  return message
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${number}`;
}

/** The request the kick-off picker sends. Reception confirms the slot. */
export function arenaBookingMessage(time: string): string {
  return `Hi MVSA, I would like to book the Arena at ${time}. Is it free?`;
}

export function arenaBookingUrl(time: string): string {
  return whatsappUrl(contact.whatsappNumber, arenaBookingMessage(time));
}
