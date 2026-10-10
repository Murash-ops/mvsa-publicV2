import BookingWidget from '@/components/booking/BookingWidget';
import { bookingWritesEnabled, getVenueFacts, isMvsaApiError } from '@/lib/mvsa-api';
import { venues } from '@/content/venues';
import { booking as bookingCopy, contact } from '@/content/site';
import { AlertTriangle, CalendarDays } from 'lucide-react';

export const revalidate = 0; // Availability and venue facts are never cached

/**
 * The bookable resources are fixed by the backend (res_turf and
 * res_meeting_room), so the page always renders the widget. Venue facts are
 * fetched only for the hours note; if that call fails the page says so and the
 * widget still offers the phone and WhatsApp route.
 */
export default async function BookPage() {
  let hoursNote: string | null = null;
  let factsUnreachable = false;

  try {
    const facts = await getVenueFacts();
    hoursNote = facts.facts.hours_note ?? null;
  } catch (error) {
    if (!isMvsaApiError(error)) throw error;
    factsUnreachable = true;
  }

  return (
    <main className="min-h-screen bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 pt-32 pb-16 px-4 sm:px-8">
        <header className="mb-12 animate-slide-up text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-none mb-6">
            <CalendarDays className="w-4 h-4 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
              Online Booking
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-4 tracking-tight uppercase">
            RESERVE YOUR <span className="text-gold">PITCH</span>
          </h1>
          <p className="text-charcoal-light text-lg max-w-3xl font-medium">
            Pick your venue, date and start time — we hold the slot while you confirm.
          </p>
          {hoursNote && (
            <p className="text-charcoal-light/70 text-sm max-w-3xl font-medium mt-3">{hoursNote}</p>
          )}
          {factsUnreachable && (
            <div
              className="mt-6 p-4 border border-amber-500/30 bg-amber-500/5 max-w-3xl"
              data-testid="facts-unreachable"
            >
              <p className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
                <AlertTriangle className="w-4 h-4" /> Venue details unavailable
              </p>
              <p className="text-sm text-charcoal-light font-medium">
                {bookingCopy.unreachableNotice} {bookingCopy.unreachableAction} Call{' '}
                <a href={contact.bookingsPhoneHref} className="text-gold font-bold">
                  {contact.bookingsPhone}
                </a>
                .
              </p>
            </div>
          )}
        </header>

        <BookingWidget
          venues={venues}
          bookingWritesEnabled={bookingWritesEnabled()}
          whatsappNumber={contact.whatsappNumber}
          bookingsPhone={contact.bookingsPhone}
          bookingsPhoneHref={contact.bookingsPhoneHref}
        />
      </div>
    </main>
  );
}
