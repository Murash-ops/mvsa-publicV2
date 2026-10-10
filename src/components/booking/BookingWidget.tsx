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
 *  - If the backend cannot be reached we say exactly that and offer the phone
 *    and WhatsApp route. We never render an empty slot list, which would read
 *    as "fully booked".
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
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Users,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
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
}: BookingWidgetProps) {
  const [venue, setVenue] = useState<VenuePresentation>(venues[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [durationMinutes, setDurationMinutes] = useState(60);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [timezone, setTimezone] = useState<string>('Africa/Nairobi');
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsFailure, setSlotsFailure] = useState<Failure | null>(null);
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
    setSelectedSlot(null);
    void loadSlots();
  }, [loadSlots]);

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
      `Hi MVSA 👋 I'd like to book the ${venue.displayName} on ${dayLabel}, ${timeLabel}` +
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
    venue.displayName,
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
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold hover:bg-gold-muted text-forest-dark border border-gold font-display text-xs font-extrabold uppercase tracking-widest transition-all"
        data-testid="whatsapp-route"
      >
        <MessageSquare className="w-4 h-4" /> Message reception on WhatsApp
      </a>
      <a
        href={bookingsPhoneHref}
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent hover:bg-white/5 text-white border border-white/20 font-display text-xs font-extrabold uppercase tracking-widest transition-all"
        data-testid="phone-route"
      >
        <Phone className="w-4 h-4" /> Call {bookingsPhone}
      </a>
    </div>
  );

  /* --------------------------- confirmed booking -------------------------- */

  if (booking) {
    return (
      <div
        className="max-w-xl mx-auto text-center py-16 animate-entrance space-y-10"
        data-testid="booking-confirmed"
      >
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-none border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl text-white tracking-tighter uppercase leading-none font-display font-bold">
            Your slot is booked
          </h2>
          <p className="text-charcoal-light text-base max-w-md mx-auto leading-relaxed font-medium">
            {booking.resource_name}, {localTime(booking.start_local)}–
            {localTime(booking.end_local)} on{' '}
            {format(new Date(booking.start_local), 'EEEE d MMM yyyy')}.
          </p>
          <p className="font-mono text-gold text-lg font-bold">Reference {booking.reference}</p>
          <p className="text-charcoal-light text-sm max-w-md mx-auto leading-relaxed font-medium">
            {booking.amount_due_display} is due at reception. Keep the reference — reception can
            find your booking with it.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            href="/"
            className="px-10 py-5 bg-gold hover:bg-gold-muted text-forest-dark font-display text-xs font-bold uppercase tracking-widest rounded-none shadow-gold-sm transition-all border border-gold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------- main form ------------------------------ */

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-24">
        <div className="lg:col-span-2 space-y-10">
          {/* SECTION A: VENUE */}
          <section className="space-y-6 text-left">
            <div className="space-y-2 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" /> SELECT YOUR VENUE
              </h2>
              <p className="text-xs text-charcoal-light font-medium">
                Choose between our premium Floodlit Turf Pitch or Strategist Meeting Room.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4" data-testid="venue-grid">
              {venues.map((option) => {
                const isSelected = venue.resourceId === option.resourceId;
                return (
                  <button
                    key={option.resourceId}
                    onClick={() => {
                      setVenue(option);
                      setPartySize(option.kind === 'turf' ? 10 : 6);
                    }}
                    className={`relative overflow-hidden h-28 rounded-none border text-left p-4 transition-all duration-300 flex flex-col justify-end group cursor-pointer ${
                      isSelected
                        ? 'border-gold ring-1 ring-gold shadow-gold-sm'
                        : 'border-white/10 hover:border-gold/40'
                    }`}
                    aria-label={`Select ${option.displayName}`}
                  >
                    <Image
                      src={option.imageUrl}
                      alt={option.displayName}
                      fill
                      className="object-cover absolute inset-0 opacity-15 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500 z-0"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061a10] via-[#061a10]/70 to-transparent z-[1]" />
                    <div className="relative z-10 w-full space-y-0.5">
                      <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-gold bg-gold/10 px-1.5 py-0.5 border border-gold/20 inline-block mb-1">
                        {option.badge}
                      </span>
                      <h3 className="font-bold font-display text-sm sm:text-base text-white uppercase tracking-tight leading-tight">
                        {option.displayName}
                      </h3>
                      <p className="text-[10px] font-mono text-white/60 font-medium tracking-wide">
                        {option.blurb}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION B: DATE, LENGTH AND SLOT */}
          <section className="space-y-6 text-left">
            <div className="space-y-2 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" /> PICK YOUR DATE & SLOT
              </h2>
              <p className="text-xs text-charcoal-light font-medium">
                Choose a day, how long you want to play, then a start time. The arena publishes the
                start times it can offer, and each turf booking includes its handover afterwards.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
                Next 14 days
              </label>
              <div
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0"
                data-testid="date-strip"
              >
                {next14Days.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center justify-center min-w-[76px] p-4 rounded-none border transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-gold bg-gold text-forest-dark shadow-gold-sm font-bold scale-[1.02]'
                          : 'border-white/10 bg-white/5 text-white hover:border-gold/30'
                      }`}
                      aria-label={`Select date ${format(date, 'EEEE, MMMM d')}`}
                    >
                      <span className="text-[9px] uppercase font-mono tracking-widest text-white/50">
                        {format(date, 'EEE')}
                      </span>
                      <span className="text-xl font-bold font-mono my-1">{format(date, 'd')}</span>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-white/50">
                        {format(date, 'MMM')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
                How long?
              </label>
              <div className="flex flex-wrap gap-2" data-testid="duration-options">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.minutes}
                    onClick={() => setDurationMinutes(option.minutes)}
                    className={`px-4 py-2.5 border text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      durationMinutes === option.minutes
                        ? 'border-gold bg-gold text-forest-dark'
                        : 'border-white/10 bg-white/5 text-white hover:border-gold/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
                Start times ({timezone})
              </label>

              {isLoadingSlots ? (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-pulse"
                  data-testid="slot-grid-skeleton"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white/5 h-16 rounded-none border border-white/5" />
                  ))}
                </div>
              ) : slotsFailure ? (
                <div
                  className="p-8 bg-amber-500/5 border border-amber-500/30 rounded-none space-y-3"
                  data-testid="backend-unreachable"
                >
                  <p className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4" /> Live availability unavailable
                  </p>
                  <p className="text-sm text-charcoal-light font-medium leading-relaxed">
                    {slotsFailure.message} This does not mean the arena is full — we simply cannot
                    see the diary from here. Reception can check and confirm your slot.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => void loadSlots()}
                      className="px-5 py-3 border border-white/20 text-white text-[10px] font-display font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                      data-testid="retry-availability"
                    >
                      Try again
                    </button>
                  </div>
                  {contactRoute}
                </div>
              ) : slots.length === 0 ? (
                <div
                  className="p-12 text-center bg-card border border-dashed border-white/10 rounded-none space-y-2"
                  data-testid="slots-empty"
                >
                  <Clock className="w-10 h-10 mx-auto mb-3 text-white/20" />
                  <p className="text-xs text-charcoal-light font-medium">
                    Nothing of that length is left on this date. Try a shorter booking or another
                    day, or call reception on {bookingsPhone}.
                  </p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                  data-testid="slot-grid"
                >
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.slot_id === slot.slot_id;
                    return (
                      <button
                        key={slot.slot_id}
                        disabled={!slot.bookable}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setActionFailure(null);
                          setHandoverNotice('');
                        }}
                        title={slot.unbookable_reason ?? undefined}
                        className={`relative p-4 rounded-none border text-center transition-all duration-300 flex flex-col items-center justify-center ${
                          !slot.bookable
                            ? 'bg-white/5 border-white/5 opacity-25 cursor-not-allowed text-white/30'
                            : isSelected
                              ? 'border-gold bg-gold text-forest-dark font-bold scale-[1.02] shadow-gold-sm cursor-pointer'
                              : 'bg-white/5 border-white/10 text-white hover:border-gold/30 hover:bg-gold/10 cursor-pointer'
                        }`}
                        aria-label={`Start at ${localTime(slot.local.start_local)} — ${slot.price.display}`}
                      >
                        <span className="block font-mono font-bold text-sm">
                          {localTime(slot.local.start_local)}
                        </span>
                        <span
                          className={`text-[9px] font-mono mt-1 ${isSelected ? 'text-forest-dark' : 'text-white/60'}`}
                        >
                          {slot.price.display}
                        </span>
                        {slot.handover_minutes > 0 && (
                          <span
                            className={`text-[7px] font-mono uppercase mt-0.5 ${isSelected ? 'text-forest-dark/70' : 'text-white/35'}`}
                          >
                            +{slot.handover_minutes}m handover
                          </span>
                        )}
                        {!slot.bookable && (
                          <span className="absolute top-1 right-1 text-[6px] font-black uppercase bg-error text-white px-1">
                            Taken
                          </span>
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
        <div className="lg:col-span-1 lg:sticky lg:top-32 space-y-6 text-left">
          <div className="bg-card border border-white/10 p-8 rounded-none relative overflow-hidden shadow-sm space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold/10 to-gold/50" />

            <h3 className="font-display font-bold text-lg text-white border-b border-white/5 pb-2 uppercase tracking-wide">
              Booking Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-light font-medium">Venue:</span>
                <span className="font-bold text-white uppercase text-right max-w-[60%]">
                  {venue.displayName}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                <span className="text-charcoal-light font-medium">Date:</span>
                <span className="font-bold text-white">
                  {format(selectedDate, 'EEEE, MMM do, yyyy')}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                <span className="text-charcoal-light font-medium">Paid play:</span>
                <span className="font-bold text-white font-mono text-right max-w-[60%]">
                  {selectedSlot
                    ? `${localTime(selectedSlot.local.start_local)}–${localTime(selectedSlot.local.end_local)}`
                    : 'No slot selected'}
                </span>
              </div>
              {selectedSlot && selectedSlot.handover_minutes > 0 && (
                <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                  <span className="text-charcoal-light font-medium">Handover until:</span>
                  <span className="font-bold text-white/70 font-mono">
                    {localTime(selectedSlot.local.handover_ends_local)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-t-2 border-white/10 pt-4 mt-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Price:</span>
                <span className="font-mono font-black text-2xl text-gold" data-testid="price-total">
                  {selectedSlot ? selectedSlot.price.display : '—'}
                </span>
              </div>
            </div>

            {/* Customer details */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Enter Your Details
              </h4>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Wyclife Osengo"
                      className="w-full pl-9 pr-3 py-2.5 border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-all text-xs font-medium rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. 0798258950"
                      className="w-full pl-9 pr-3 py-2.5 border border-white/10 bg-white/5 text-white placeholder-white/30 font-mono focus:outline-none focus:border-gold transition-all text-xs rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider">
                    How many people?
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={partySize}
                      onChange={(e) => setPartySize(Number.parseInt(e.target.value, 10) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 border border-white/10 bg-white/5 text-white font-mono focus:outline-none focus:border-gold transition-all text-xs rounded-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <p className="text-error text-xs font-semibold bg-error/10 border border-error/20 p-3 text-center">
                {formError}
              </p>
            )}

            {actionFailure && (
              <div
                className="text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-200 p-3 space-y-1"
                data-testid="action-failure"
              >
                <p>{actionFailure.message}</p>
              </div>
            )}

            {handoverNotice && (
              <div
                className="text-xs font-semibold bg-white/5 border border-white/15 text-white/80 p-3"
                data-testid="identity-handover"
              >
                {handoverNotice}
              </div>
            )}

            {/* Hold panel, then confirm */}
            {hold ? (
              <div className="space-y-4" data-testid="hold-panel">
                <div className="p-4 border border-gold/30 bg-gold/5 space-y-1">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold">
                    Slot held
                  </p>
                  <p className="text-xs text-white font-medium">
                    {hold.resource_name}, {localTime(hold.start_local)}–{localTime(hold.end_local)}{' '}
                    · {hold.price_display}
                  </p>
                  <p className="text-xs text-charcoal-light font-mono" data-testid="hold-countdown">
                    Held for another {Math.floor(secondsLeft / 60)}m{' '}
                    {String(secondsLeft % 60).padStart(2, '0')}s
                  </p>
                </div>

                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything reception should know? (optional)"
                  className="w-full px-3 py-2.5 border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-all text-xs rounded-none resize-none"
                />

                <button
                  onClick={() => void handleConfirm()}
                  disabled={isConfirming}
                  className="w-full py-5 bg-gold hover:bg-gold-muted text-forest-dark border border-gold font-display text-xs font-extrabold uppercase tracking-widest transition-all rounded-none shadow-gold-sm cursor-pointer disabled:opacity-50"
                  data-testid="confirm-booking"
                >
                  {isConfirming ? 'Confirming…' : 'Confirm booking'}
                </button>
                <p className="text-[10px] text-white/40 italic font-medium text-center leading-relaxed">
                  Payment is made at reception. Nothing is charged on this site.
                </p>
              </div>
            ) : bookingWritesEnabled ? (
              <div className="space-y-3">
                <button
                  onClick={() => void handleHold()}
                  disabled={isHolding || !selectedSlot}
                  className="w-full py-5 bg-gold hover:bg-gold-muted text-forest-dark border border-gold font-display text-xs font-extrabold uppercase tracking-widest transition-all rounded-none shadow-gold-sm cursor-pointer disabled:opacity-50"
                  data-testid="hold-slot"
                >
                  {isHolding ? 'Holding your slot…' : 'Hold this slot for 15 minutes'}
                </button>
                <p className="text-[10px] text-white/40 italic font-medium text-center leading-relaxed">
                  We hold the slot for 15 minutes while you check the details, then you confirm.
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="whatsapp-handover">
                <div className="p-3 border border-white/15 bg-white/5">
                  <p className="text-[11px] text-white/80 font-medium leading-relaxed">
                    Online reservations are not switched on yet, so{' '}
                    <strong className="text-white">this does not hold the slot</strong>. Send the
                    details to reception and they will confirm the booking with you.
                  </p>
                </div>
                {contactRoute}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
