import { contact } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';

/** A quiet, always-there way to reach reception on WhatsApp. */
export default function WhatsAppButton() {
  const href = whatsappUrl(contact.whatsappNumber, 'Hi MVSA, I have a question about the Arena.');

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center border-2 border-gold bg-ink text-gold shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-gold hover:text-ink sm:right-6 sm:bottom-6"
      aria-label="Message reception on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.963L2 22l5.21-1.366a9.97 9.97 0 0 0 4.8 1.234h.005c5.507 0 9.99-4.478 9.99-9.985C22.007 6.478 17.52 2 12.012 2zm6.066 14.225c-.27.755-1.57 1.385-2.155 1.455-.495.06-1.12.09-3.27-.795-2.75-1.135-4.52-3.920-4.655-4.105-.135-.185-1.12-1.490-1.12-2.840 0-1.355.7-2.020.945-2.295.245-.275.54-.34.72-.34h.515c.165 0 .39.06.595.555.205.5.7 1.710.76 1.835.06.125.1.27.015.435-.085.165-.13.27-.255.42-.125.15-.265.335-.38.45-.13.13-.265.27-.115.53.15.25.665 1.095 1.425 1.770.975.87 1.795 1.140 2.050 1.270.255.13.405.11.555-.065.15-.18.64-.745.815-1 .17-.255.34-.21.575-.125.24.085 1.515.715 1.775.845.26.13.435.195.495.305.06.11.06.64-.21 1.395z" />
      </svg>
    </a>
  );
}
