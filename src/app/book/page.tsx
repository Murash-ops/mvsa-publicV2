import type { Metadata } from 'next';
import BookingWidget from '@/components/booking/BookingWidget';
import PageHeader from '@/components/arena/PageHeader';
import { bookingWritesEnabled, getVenueFacts, isMvsaApiError } from '@/lib/mvsa-api';
import { venues } from '@/content/venues';
import { booking as bookingCopy, contact } from '@/content/site';

export const revalidate = 0; // Availability and venue facts are never cached

export const metadata: Metadata = {
  title: 'Book the Arena | Mountain View Sports Arena',
  description: bookingCopy.intro,
};

/**
 * The bookable resources are fixed by the backend (res_turf and
 * res_meeting_room). Venue facts are fetched for the hours note. If that call
 * fails the backend is treated as unreachable: the widget opens on its one
 * calm block (WhatsApp, phone and the kick-off picker) and only switches to
 * live times if a quiet check of availability succeeds.
 */
export default async function BookPage() {
  let hoursNote: string | null = null;
  let backendUnreachable = false;

  try {
    const facts = await getVenueFacts();
    hoursNote = facts.facts.hours_note ?? null;
  } catch (error) {
    if (!isMvsaApiError(error)) throw error;
    backendUnreachable = true;
  }

  return (
    <main>
      <PageHeader
        eyebrow={bookingCopy.eyebrow}
        titleTop={bookingCopy.titleTop}
        titleBottom={bookingCopy.titleBottom}
        intro={bookingCopy.intro}
      >
        {hoursNote && <p className="m-0 max-w-[600px] text-base text-mute">{hoursNote}</p>}
      </PageHeader>

      <div className="wrap pb-[clamp(56px,7vw,88px)]">
        <BookingWidget
          venues={venues}
          bookingWritesEnabled={bookingWritesEnabled()}
          whatsappNumber={contact.whatsappNumber}
          bookingsPhone={contact.bookingsPhone}
          bookingsPhoneHref={contact.bookingsPhoneHref}
          initiallyOffline={backendUnreachable}
        />
      </div>
    </main>
  );
}
