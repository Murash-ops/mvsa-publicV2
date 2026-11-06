import type { Metadata } from 'next';
import BookingWidget from '@/components/booking/BookingWidget';
import PageHeader from '@/components/arena/PageHeader';
import MeetingRoom from '@/components/booking/MeetingRoom';
import BookTabs from '@/components/booking/BookTabs';
import { nairobiDate } from '@/lib/slots';
import { bookingWritesEnabled, getVenueFacts, isMvsaApiError } from '@/lib/mvsa-api';
import { venues } from '@/content/venues';
import { booking as bookingCopy, contact, extraTime, isExtraTimeDay } from '@/content/site';

export const revalidate = 0; // Availability and venue facts are never cached

export const metadata: Metadata = {
  title: 'Book the Arena or the meeting room | Mountain View Sports Arena',
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
  // Extra Time runs 1–30 November; the note goes by itself on 1 December.
  const extraTimeNow = isExtraTimeDay(nairobiDate(0));
  let backendUnreachable = false;

  try {
    const facts = await getVenueFacts();
    hoursNote = facts.facts.hours_note ?? null;
  } catch (error) {
    if (!isMvsaApiError(error)) throw error;
    backendUnreachable = true;
  }

  return (
    <main className="theme-light">
      <PageHeader
        eyebrow={bookingCopy.eyebrow}
        titleTop={bookingCopy.titleTop}
        titleBottom={bookingCopy.titleBottom}
        intro={bookingCopy.intro}
      >
        {hoursNote && <p className="m-0 max-w-[600px] text-base text-mute">{hoursNote}</p>}
      </PageHeader>

      <BookTabs
        pitch={
          <div id="arena" className="wrap flex scroll-mt-40 flex-col gap-6 pb-[clamp(56px,7vw,88px)]">
            {extraTimeNow ? (
              <p className="theme-dark m-0 flex flex-wrap items-center gap-x-4 gap-y-2 bg-ink px-5 py-4" data-testid="extra-time-note">
                <span className="tag">Extra Time</span>
                <span className="display text-[30px] leading-none text-gold">{extraTime.headline}</span>
                <span className="text-base text-fog">{extraTime.note}</span>
              </p>
            ) : null}
            <BookingWidget
              venues={venues}
              bookingWritesEnabled={bookingWritesEnabled()}
              whatsappNumber={contact.whatsappNumber}
              bookingsPhone={contact.bookingsPhone}
              bookingsPhoneHref={contact.bookingsPhoneHref}
              initiallyOffline={backendUnreachable}
            />
          </div>
        }
        room={
          <MeetingRoom
            whatsappNumber={contact.whatsappNumber}
            phone={contact.bookingsPhone}
            phoneHref={contact.bookingsPhoneHref}
          />
        }
      />
    </main>
  );
}
