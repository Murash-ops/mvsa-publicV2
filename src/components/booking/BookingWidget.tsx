'use client';

/**
 * Booking widget — live availability from the MVSA backend, then the approved
 * hold-then-confirm flow.
 *
 * It talks only to this site's own route handlers (/api/availability,
 * /api/booking/hold, /api/booking/confirm) because the backend bearer token
 * must never reach the browser.
 *
 * Three honesty rules are load-bearing here:
 *  - If the backend cannot be reached the page shows one calm block instead:
 *    book on WhatsApp or by phone, with the kick-off picker, and a line that
 *    online booking is coming. Never a dead date picker, and never an empty
 *    slot list, which would read as "fully booked".
 *  - A 409 means the interval went while the customer was deciding, or their
 *    15-minute hold lapsed. We say so and re-fetch availability.
 *  - When booking writes are switched off, the WhatsApp handover says in plain
 *    words that nothing has been reserved yet.
 *
 * Start times and prices are never derived here. Both come from the backend
 * per slot, so a change to the venue's start increments or to how a rate is
 * worked out needs no change in this component.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { AskForKickoff, KickoffChips, KickoffProvider } from '@/components/arena/Kickoff';
import { booking as bookingCopy } from '@/content/site';
import type { VenuePresentation } from '@/content/venues';
import type {
  AvailabilityResponseBody,
  AvailabilitySlot,
  ConfirmResponseBody,
  HeldSlotBody,
  HoldResponseBody,
} from '@/lib/booking/contracts';
import { isValidKenyanPhone } from '@/lib/booking/phone';

type Failure = { message: string; kind: string };

/** Offered lengths. The backend is the authority and re-validates every one. */
const DURATION_OPTIONS = [
  { minutes: 60, label: '1 hour' },
  { minutes: 120, label: '2 hours' },
  { minutes: 180, label: '3 hours' },
  { minutes: 240, label: '4 hours' },
  { minutes: 300, label: '5 hours' },
  { minutes: 600, label: 'Full day (10 hours)' },
];

interface BookingWidgetProps {
  venues: VenuePresentation[];
  /** False unless MVSA_BOOKING_WRITES_ENABLED=true on the server. */
  bookingWritesEnabled: boolean;
  whatsappNumber: string;
  bookingsPhone: string;
  bookingsPhoneHref: string;
  /**
   * True when the server could not reach the backend while rendering. The
   * calm block shows straight away, and the widget only appears if a quiet
   * check for live times succeeds.
   */
  initiallyOffline?: boolean;
}

function localTime(value: string): string {
  // "2026-10-11T08:20:00+03:00" -> "08:20"
  return value.slice(11, 16);
}

async function readFailure(response: Response): Promise<Failure> {
  try {
    const body = (await response.json()) as { error?: { message?: string; kind?: string } };
    return {
      message: body.error?.message ?? 'We cannot reach the arena booking system right now.',
      kind: body.error?.kind ?? 'server',
    };
  } catch {
    return {
      message: 'We cannot reach the arena booking system right now.',
      kind: 'server',
    };
  }
}

export default function BookingWidget({
  venues,
  bookingWritesEnabled,
  whatsappNumber,
  bookingsPhone,
  bookingsPhoneHref,
  initiallyOffline = false,
}: BookingWidgetProps) {
  const [venue, setVenue] = useState<VenuePresentation>(venues[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [durationMinutes, setDurationMinutes] = useState(60);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [timezone, setTimezone] = useState<string>('Africa/Nairobi');
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsFailure, setSlotsFailure] = useState<Failure | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [partySize, setPartySize] = useState(venues[0]?.kind === 'turf' ? 10 : 6);
  const [notes, setNotes] = useState('');

  const [intentKey, setIntentKey] = useState<string | null>(null);
  const [hold, setHold] = useState<HeldSlotBody | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [booking, setBooking] = useState<ConfirmResponseBody | null>(null);

  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionFailure, setActionFailure] = useState<Failure | null>(null);
  const [handoverNotice, setHandoverNotice] = useState('');

  const requestRef = useRef(0);
  const next14Days = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i)),
    []
  );

  const loadSlots = useCallback(async () => {
    const requestId = ++requestRef.current;
    setIsLoadingSlots(true);
    setSlotsFailure(null);

    const query = new URLSearchParams({
      date: format(selectedDate, 'yyyy-MM-dd'),
      resource_id: venue.resourceId,
      duration_minutes: String(durationMinutes),
    });

    try {
      const response = await fetch(`/api/availability?${query.toString()}`, {
        cache: 'no-store',
      });
      if (requestId !== requestRef.current) return;

      if (!response.ok) {
        setSlots([]);
        setSlotsFailure(await readFailure(response));
        return;
      }

      const body = (await response.json()) as AvailabilityResponseBody;
      setSlots(body.slots);
      setTimezone(body.timezone);
      setHasLoaded(true);
    } catch {
      if (requestId !== requestRef.current) return;
      setSlots([]);
      setSlotsFailure({
        message: 'We cannot reach the arena booking system right now.',
        kind: 'unreachable',
      });
    } finally {
      if (requestId === requestRef.current) setIsLoadingSlots(false);
    }
  }, [durationMinutes, selectedDate, venue.resourceId]);

  useEffect(() => {
    // Deferred by a microtask: loadSlots sets the loading state as it starts,
    // and doing that synchronously inside the effect would cascade an extra
    // render pass. `active` drops the result if the query changed meanwhile.
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void loadSlots();
    });
    return () => {
      active = false;
    };
  }, [loadSlots]);

  /** Any change to the query invalidates the chosen slot and any stale notice. */
  const clearSelection = () => {
    setSelectedSlot(null);
    setActionFailure(null);
    setHandoverNotice('');
    setFormError('');
  };

  // Hold countdown. When it runs out the hold is gone in the backend too, so
  // the customer is told and availability is refreshed.
  useEffect(() => {
    if (!hold) return;

    const tick = () => {
      const remaining = Math.max(0, Math.round((Date.parse(hold.expires_at) - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setHold(null);
        setIntentKey(null);
        setActionFailure({
          kind: 'conflict',
          message:
            'Your 15-minute hold has expired, so the slot is free for others again. Pick a time and we will hold it afresh.',
        });
        void loadSlots();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [hold, loadSlots]);

  const whatsappUrl = useMemo(() => {
    const dayLabel = format(selectedDate, 'EEEE d MMM');
    const timeLabel = selectedSlot
      ? `${localTime(selectedSlot.local.start_local)}–${localTime(selectedSlot.local.end_local)}`
      : 'a time that works';
    const priceLabel = selectedSlot ? ` (${selectedSlot.price.display})` : '';
    const hours = durationMinutes / 60;
    const message =
      `Hi MVSA, I would like to book ${venue.requestName} on ${dayLabel}, ${timeLabel}` +
      `${priceLabel} for ${hours} ${hours === 1 ? 'hour' : 'hours'}, ${partySize} people.` +
      `${clientName.trim() ? ` My name is ${clientName.trim()}.` : ''}` +
      `${clientPhone.trim() ? ` My number is ${clientPhone.trim()}.` : ''}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [
    clientName,
    clientPhone,
    durationMinutes,
    partySize,
    selectedDate,
    selectedSlot,
    venue.requestName,
    whatsappNumber,
  ]);

  const validateDetails = (): boolean => {
    if (!selectedSlot) {
      setFormError('Pick a start time first.');
      return false;
    }
    if (clientName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return false;
    }
    if (!isValidKenyanPhone(clientPhone)) {
      setFormError('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx).');
      return false;
    }
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 500) {
      setFormError('Tell us how many people are coming (1 to 500).');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleHold = async () => {
    setActionFailure(null);
    setHandoverNotice('');
    if (!validateDetails() || !selectedSlot) return;

    // One key per customer intent, reused by every retry of this attempt.
    const key = intentKey ?? crypto.randomUUID();
    setIntentKey(key);
    setIsHolding(true);

    try {
      const response = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_id: venue.resourceId,
          start_at: selectedSlot.start_at,
          duration_minutes: durationMinutes,
          party_size: partySize,
          name: clientName.trim(),
          phone: clientPhone.trim(),
          intent_key: key,
        }),
      });

      if (!response.ok) {
        const failure = await readFailure(response);
        setActionFailure(failure);
        setIntentKey(null);
        if (response.status === 409) {
          setSelectedSlot(null);
          await loadSlots();
        }
        return;
      }

      const body = (await response.json()) as HoldResponseBody;
      if (body.outcome === 'identity_confirmation_required') {
        setHandoverNotice(body.message);
        setIntentKey(null);
        return;
      }
      setHold(body);
    } catch {
      setIntentKey(null);
      setActionFailure({
        kind: 'unreachable',
        message: 'We cannot reach the arena booking system right now.',
      });
    } finally {
      setIsHolding(false);
    }
  };

  const handleConfirm = async () => {
    if (!hold || !intentKey) return;
    setActionFailure(null);
    setIsConfirming(true);

    try {
      const response = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hold_id: hold.hold_id,
          name: clientName.trim(),
          phone: clientPhone.trim(),
          party_size: partySize,
          notes,
          intent_key: intentKey,
        }),
      });

      if (!response.ok) {
        const failure = await readFailure(response);
        setActionFailure(failure);
        if (response.status === 409 || response.status === 404) {
          // The interval went, or the hold lapsed: start again from live slots.
          setHold(null);
          setIntentKey(null);
          setSelectedSlot(null);
          await loadSlots();
        }
        return;
      }

      const body = (await response.json()) as
        | ConfirmResponseBody
        | { outcome: 'identity_confirmation_required'; message: string };

      if (body.outcome === 'identity_confirmation_required') {
        setHandoverNotice(body.message);
        return;
      }

      setBooking(body);
      setHold(null);
    } catch {
      setActionFailure({
        kind: 'unreachable',
        message: 'We cannot reach the arena booking system right now.',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const contactRoute = (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-gold btn-sm flex-1"
        data-testid="whatsapp-route"
      >
        Message reception on WhatsApp
      </a>
      <a href={bookingsPhoneHref} className="btn btn-ghost btn-sm flex-1" data-testid="phone-route">
        Call {bookingsPhone}
      </a>
    </div>
  );

  /* ------------------------------ calm block ------------------------------ */

  // One calm block while live times are not available: today that is always.
  const showOffline = slotsFailure !== null || (initiallyOffline && !hasLoaded);

  if (showOffline && !hold && !booking) {
    return (
      <KickoffProvider>
        <section
          className="flex flex-col gap-6 border border-t-4 border-white/10 border-t-gold bg-surface p-[clamp(20px,4vw,44px)]"
          data-testid="booking-offline"
          aria-labelledby="booking-offline-title"
        >
          <h2 id="booking-offline-title" className="display m-0 text-[clamp(32px,3.6vw,44px)] leading-[0.9]">
            {bookingCopy.offline.title}
          </h2>
          <p className="m-0 max-w-[620px] text-base leading-[1.55] text-fog">{bookingCopy.offline.body}</p>
          <KickoffChips />
          <div className="flex flex-wrap gap-3">
            <AskForKickoff />
            <a href={bookingsPhoneHref} className="btn btn-ghost" data-testid="phone-route">
              Call {bookingsPhone}
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <p className="m-0 text-base text-mute">{bookingCopy.offline.coming}</p>
            <button
              type="button"
              onClick={() => void loadSlots()}
              disabled={isLoadingSlots}
              className="text-link text-[13px] disabled:opacity-60"
              data-testid="retry-availability"
            >
              {isLoadingSlots ? 'Checking…' : bookingCopy.offline.retry}
            </button>
          </div>
        </section>
      </KickoffProvider>
    );
  }

  /* --------------------------- confirmed booking -------------------------- */

  if (booking) {
    return (
      <div
        className="mx-auto flex max-w-xl flex-col items-center gap-6 border border-t-4 border-white/10 border-t-grass bg-surface px-6 py-12 text-center"
        data-testid="booking-confirmed"
      >
        <h2 className="display m-0 text-4xl leading-[0.9]">
          Your slot is <span className="text-gold">booked</span>
        </h2>
        <p className="m-0 text-base text-fog">
          {booking.resource_name}, {localTime(booking.start_local)}–{localTime(booking.end_local)} on{' '}
          {format(new Date(booking.start_local), 'EEEE d MMM yyyy')}.
        </p>
        <p className="display m-0 text-2xl text-gold">Reference {booking.reference}</p>
        <p className="m-0 text-base text-fog">
          {booking.amount_due_display} is due at reception. Keep the reference — reception can find your booking with it.
        </p>
        <Link href="/" className="btn btn-gold">
          Back to the home page
        </Link>
      </div>
    );
  }

  /* ------------------------------- main form ------------------------------ */

  const stepTitle = 'display m-0 text-[clamp(26px,2.8vw,32px)] leading-[0.9]';
  const fieldLabel = 'label mb-2 block text-[13px] text-white';
  const option = (selected: boolean) =>
    `border-2 transition-colors ${selected ? 'border-gold bg-gold text-ink' : 'border-white/20 bg-transparent text-white hover:border-gold'}`;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* VENUE */}
          <section className="flex flex-col gap-5">
            <h2 className={stepTitle}>
              <span className="text-gold">1.</span> What are you booking?
            </h2>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2" data-testid="venue-grid">
              {venues.map((choice) => {
                const isSelected = venue.resourceId === choice.resourceId;
                return (
                  <button
                    key={choice.resourceId}
                    type="button"
                    onClick={() => {
                      clearSelection();
                      setVenue(choice);
                      setPartySize(choice.kind === 'turf' ? 10 : 6);
                    }}
                    aria-pressed={isSelected}
                    className={`group relative flex h-36 flex-col justify-end overflow-hidden border-2 p-5 text-left ${
                      isSelected ? 'border-gold' : 'border-white/10 hover:border-gold/60'
                    }`}
                    aria-label={`Select ${choice.displayName}`}
                  >
                    <Image
                      src={choice.imageUrl}
                      alt=""
                      fill
                      className="object-cover opacity-30"
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink),transparent)]" />
                    <span className="relative label text-sm text-gold">{choice.badge}</span>
                    <span className="relative display text-2xl leading-none text-white">{choice.displayName}</span>
                    <span className="relative text-sm text-fog">{choice.blurb}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* DATE, LENGTH AND SLOT */}
          <section className="flex flex-col gap-6">
            <h2 className={stepTitle}>
              <span className="text-gold">2.</span> Pick a day and a time
            </h2>

            <div>
              <span className={fieldLabel} id="date-label">Next 14 days</span>
              <div
                className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-2"
                data-testid="date-strip"
                role="group"
                aria-labelledby="date-label"
              >
                {next14Days.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        clearSelection();
                        setSelectedDate(date);
                      }}
                      aria-pressed={isSelected}
                      className={`flex min-w-[76px] flex-col items-center justify-center px-3 py-3 ${option(isSelected)}`}
                      aria-label={`Select date ${format(date, 'EEEE, MMMM d')}`}
                    >
                      <span className="label text-xs">{format(date, 'EEE')}</span>
                      <span className="display text-xl leading-none">{format(date, 'd')}</span>
                      <span className="label text-xs">{format(date, 'MMM')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className={fieldLabel} id="duration-label">How long?</span>
              <div className="flex flex-wrap gap-2.5" data-testid="duration-options" role="group" aria-labelledby="duration-label">
                {DURATION_OPTIONS.map((choice) => (
                  <button
                    key={choice.minutes}
                    type="button"
                    onClick={() => {
                      clearSelection();
                      setDurationMinutes(choice.minutes);
                    }}
                    aria-pressed={durationMinutes === choice.minutes}
                    className={`label min-h-12 px-4 text-base ${option(durationMinutes === choice.minutes)}`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={fieldLabel}>Start times ({timezone})</span>

              {isLoadingSlots ? (
                <div
                  className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  data-testid="slot-grid-skeleton"
                  aria-busy="true"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 border border-white/10 bg-white/[0.04]" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="border border-dashed border-white/15 bg-surface p-8 text-center" data-testid="slots-empty">
                  <p className="m-0 text-base text-fog">
                    Nothing of that length is left on this date. Try a shorter booking or another day, or call reception
                    on {bookingsPhone}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" data-testid="slot-grid">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.slot_id === slot.slot_id;
                    return (
                      <button
                        key={slot.slot_id}
                        type="button"
                        disabled={!slot.bookable}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setActionFailure(null);
                          setHandoverNotice('');
                        }}
                        title={slot.unbookable_reason ?? undefined}
                        aria-pressed={isSelected}
                        className={`relative flex min-h-20 flex-col items-center justify-center px-2 py-3 text-center ${
                          !slot.bookable
                            ? 'cursor-not-allowed border-2 border-white/5 bg-white/[0.03] text-white/35'
                            : option(isSelected)
                        }`}
                        aria-label={`Start at ${localTime(slot.local.start_local)} — ${slot.price.display}`}
                      >
                        <span className="display text-xl leading-none">{localTime(slot.local.start_local)}</span>
                        <span className="label mt-1 text-xs">{slot.price.display}</span>
                        {slot.handover_minutes > 0 && (
                          <span className="mt-0.5 text-[11px] opacity-70">+{slot.handover_minutes}m handover</span>
                        )}
                        {!slot.bookable && (
                          <span className="label absolute top-1 right-1 bg-white/10 px-1 text-[10px] text-fog">Taken</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SUMMARY PANEL */}
        <div className="lg:sticky lg:top-28 lg:col-span-1">
          <div className="flex flex-col gap-6 border border-t-4 border-white/10 border-t-gold bg-surface p-7">
            <h3 className="display m-0 text-2xl leading-none">Your booking</h3>

            <dl className="m-0 flex flex-col gap-3 text-base">
              <div className="flex justify-between gap-4">
                <dt className="text-mute">Booking</dt>
                <dd className="m-0 text-right font-semibold text-white">{venue.displayName}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-mute">Date</dt>
                <dd className="m-0 text-right font-semibold text-white">{format(selectedDate, 'EEE d MMM yyyy')}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-mute">Play</dt>
                <dd className="m-0 text-right font-semibold text-white">
                  {selectedSlot
                    ? `${localTime(selectedSlot.local.start_local)}–${localTime(selectedSlot.local.end_local)}`
                    : 'No slot selected'}
                </dd>
              </div>
              {selectedSlot && selectedSlot.handover_minutes > 0 && (
                <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                  <dt className="text-mute">Handover until</dt>
                  <dd className="m-0 text-right text-fog">{localTime(selectedSlot.local.handover_ends_local)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 border-t-2 border-white/15 pt-4">
                <dt className="label text-white">Price</dt>
                <dd className="display m-0 text-2xl leading-none text-gold" data-testid="price-total">
                  {selectedSlot ? selectedSlot.price.display : '—'}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
              <div>
                <label htmlFor="booking-name" className={fieldLabel}>Full name</label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Wyclife Osengo"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="booking-phone" className={fieldLabel}>Phone number</label>
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="e.g. 0798258950"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="booking-party" className={fieldLabel}>How many people?</label>
                <input
                  id="booking-party"
                  type="number"
                  min={1}
                  max={500}
                  value={partySize}
                  onChange={(e) => setPartySize(Number.parseInt(e.target.value, 10) || 0)}
                  className="field"
                />
              </div>
            </div>

            {formError && (
              <p className="m-0 border border-gold/40 bg-gold/10 px-4 py-3 text-base text-gold-light" role="alert">
                {formError}
              </p>
            )}

            {actionFailure && (
              <div className="border border-gold/40 bg-gold/10 px-4 py-3 text-base text-gold-light" data-testid="action-failure" role="alert">
                <p className="m-0">{actionFailure.message}</p>
              </div>
            )}

            {handoverNotice && (
              <div className="border border-white/15 bg-white/5 px-4 py-3 text-base text-fog" data-testid="identity-handover">
                {handoverNotice}
              </div>
            )}

            {hold ? (
              <div className="flex flex-col gap-4" data-testid="hold-panel">
                <div className="flex flex-col gap-1 border border-gold/40 bg-gold/5 px-4 py-3">
                  <p className="label m-0 text-sm text-gold">Slot held</p>
                  <p className="m-0 text-base text-white">
                    {hold.resource_name}, {localTime(hold.start_local)}–{localTime(hold.end_local)} · {hold.price_display}
                  </p>
                  <p className="m-0 text-sm text-fog" data-testid="hold-countdown">
                    Held for another {Math.floor(secondsLeft / 60)}m {String(secondsLeft % 60).padStart(2, '0')}s
                  </p>
                </div>

                <label htmlFor="booking-notes" className="sr-only">Notes for reception</label>
                <textarea
                  id="booking-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything reception should know? (optional)"
                  className="field resize-none"
                />

                <button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={isConfirming}
                  className="btn btn-gold w-full disabled:opacity-50"
                  data-testid="confirm-booking"
                >
                  {isConfirming ? 'Confirming…' : 'Confirm booking'}
                </button>
                <p className="m-0 text-center text-sm text-mute">Payment is made at reception. Nothing is charged on this site.</p>
              </div>
            ) : bookingWritesEnabled ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => void handleHold()}
                  disabled={isHolding || !selectedSlot}
                  className="btn btn-gold w-full disabled:opacity-50"
                  data-testid="hold-slot"
                >
                  {isHolding ? 'Holding your slot…' : 'Hold this slot for 15 minutes'}
                </button>
                <p className="m-0 text-center text-sm text-mute">
                  We hold the slot for 15 minutes while you check the details, then you confirm.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3" data-testid="whatsapp-handover">
                <p className="m-0 border-l-2 border-gold pl-4 text-base text-fog">
                  Online reservations are not switched on yet, so <strong className="text-white">this does not hold the slot</strong>.
                  Send the details to reception and they will confirm the booking with you.
                </p>
                {contactRoute}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
