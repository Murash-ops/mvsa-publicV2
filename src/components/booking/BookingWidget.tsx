'use client';

import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { createClient } from '@/utils/supabase/client';
import type { Venue, TimeSlot } from '@/types/database';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function BookingWidget({ initialVenues }: { initialVenues: Venue[] }) {
  const supabase = createClient();
  
  const displayedVenues = initialVenues.filter(v => 
    v.name === 'Main Arena Turf' || v.name === 'Meeting Room / Conference Hall'
  );

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(displayedVenues[0] || null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // Details Form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [slotHoldWarning, setSlotHoldWarning] = useState('');
  const [isHolding, setIsHolding] = useState(false);

  // Generate exactly 14 days ahead starting from today
  const next14Days = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  // Fetch slots when selectedVenue or selectedDate changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedVenue) return;
      
      setIsLoadingSlots(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        const { data, error } = await supabase
          .from('time_slots')
          .select('*')
          .eq('venue_id', selectedVenue.id)
          .eq('date', dateStr)
          .order('start_time', { ascending: true });
          
        if (!error && data) {
          // Filter to slots between 6AM and 11PM (06:00 to 23:00)
          const filteredSlots = data.filter((s: any) => {
            const hour = parseInt(s.start_time.split(':')[0]);
            return hour >= 6 && hour <= 23;
          });
          setSlots(filteredSlots);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setIsLoadingSlots(false);
        setSelectedSlots([]); // Reset selected slots on date/venue change
      }
    }
    
    fetchSlots();
  }, [selectedVenue, selectedDate]);

  const toggleSlot = (id: number) => {
    setSelectedSlots(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getSlotPrice = (slot: TimeSlot) => {
    const rates = selectedVenue?.hourly_rates as Record<string, number> | undefined;
    return rates?.[slot.price_tier] ?? (slot.price_tier === 'peak' ? 2000 : 1500);
  };

  // Calculate total price based on selected slots
  const calculateTotal = () => {
    return selectedSlots.reduce((total, id) => {
      const slot = slots.find(s => s.id === id);
      if (!slot) return total;
      return total + getSlotPrice(slot);
    }, 0);
  };

  const total = calculateTotal();

  // Format slot times string for summary and prefilled message
  const getSelectedSlotsTimeString = () => {
    if (selectedSlots.length === 0) return 'No slots selected';
    const sortedSelected = slots
      .filter(s => selectedSlots.includes(s.id))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
      
    if (sortedSelected.length === 1) {
      const s = sortedSelected[0];
      const start = s.start_time.substring(0, 5);
      const [h, m] = s.start_time.split(':');
      const endHour = (parseInt(h) + 1).toString().padStart(2, '0');
      return `${start} - ${endHour}:${m}`;
    } else {
      return sortedSelected.map(s => {
        const start = s.start_time.substring(0, 5);
        const [h, m] = s.start_time.split(':');
        const endHour = (parseInt(h) + 1).toString().padStart(2, '0');
        return `${start}-${endHour}:${m}`;
      }).join(', ');
    }
  };

  const getPeakStatus = () => {
    const sortedSelected = slots.filter(s => selectedSlots.includes(s.id));
    const hasPeak = sortedSelected.some(s => s.price_tier === 'peak');
    return hasPeak ? 'Peak' : 'Off-Peak';
  };

  // WhatsApp conversational prefilled message builder
  const buildWhatsAppUrl = () => {
    const venueName = selectedVenue?.name || 'Main Arena Turf';
    const dayDate = format(selectedDate, 'EEEE MMM do');
    const timeRange = getSelectedSlotsTimeString();
    const peakStatus = getPeakStatus();
    const priceVal = total;
    const nameVal = clientName.trim();
    const phoneVal = clientPhone.trim();

    const message = `Hi MVSA 👋 I'd like to book the ${venueName} on ${dayDate}, ${timeRange} (${peakStatus} - KES ${priceVal.toLocaleString()}). My name is ${nameVal}, number is ${phoneVal}.`;
    return `https://wa.me/254798258950?text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppRedirect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSlotHoldWarning('');
    
    if (!selectedVenue) {
      setErrorMessage('Please select a venue.');
      return;
    }
    if (selectedSlots.length === 0) {
      setErrorMessage('Please select at least one hourly time slot.');
      return;
    }
    if (!clientName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanPhone = clientPhone.replace(/\s/g, '');
    if (!/^(07|01|254)\d{8,10}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx or 01xxxxxxxx).');
      return;
    }

    setIsHolding(true);
    
    try {
      // Call the stored database function to reserve slot and create a pending booking row
      const { data, error } = await supabase.rpc('create_booking_with_hold', {
        p_venue_id: selectedVenue.id,
        p_client_name: clientName.trim(),
        p_client_phone: cleanPhone,
        p_slot_ids: selectedSlots,
        p_total_amount: total,
        p_deposit_amount: 0,
        p_balance: total,
        p_source: 'whatsapp'
      });
      
      if (error) {
        console.error('Database slot hold error:', error);
        setSlotHoldWarning('Warning: We could not hold your time slot in our database. Please proceed to WhatsApp to manually confirm availability with our staff.');
      }
    } catch (err) {
      console.error('Database connection error:', err);
      setSlotHoldWarning('Warning: We could not hold your time slot in our database. Please proceed to WhatsApp to manually confirm availability with our staff.');
    } finally {
      setIsHolding(false);
      // Open WhatsApp regardless of DB outcome
      window.open(buildWhatsAppUrl(), '_blank');
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 animate-entrance space-y-10">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-none border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 animate-pulse" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl text-white tracking-tighter uppercase leading-none font-display font-bold">
            Your request has been sent!
          </h2>
          {slotHoldWarning ? (
            <p className="text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 p-4 text-sm max-w-md mx-auto leading-relaxed">
              {slotHoldWarning}
            </p>
          ) : (
            <p className="text-charcoal-light text-base max-w-md mx-auto leading-relaxed font-medium">
              We&apos;ll confirm your booking on WhatsApp within a few minutes. See you on the pitch 🏟️
            </p>
          )}
        </div>

        <div className="pt-4 flex justify-center">
          <Link 
            href="/"
            className="px-10 py-5 bg-gold hover:bg-gold-muted text-forest-dark font-display text-xs font-bold uppercase tracking-widest rounded-none shadow-gold-sm transition-all hover:scale-105 active:scale-95 border border-gold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-24">
        {/* Left Column: Input Sections (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* ========================================================
              SECTION A: SELECT VENUE
              ======================================================== */}
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
              {displayedVenues.map((v) => {
                const isSelected = selectedVenue?.id === v.id;
                
                const imgMap: Record<string, string> = {
                  'Main Arena Turf': '/images/hero_turf.jpeg',
                  '5-Aside Turf': '/images/hero_turf.jpeg',
                  'Meeting Room': '/images/meeting_hall.jpeg',
                  'Meeting Hall': '/images/meeting_hall.jpeg',
                  'Meeting Room / Conference Hall': '/images/meeting_hall.jpeg'
                };
                const bgImg = v.image_url || imgMap[v.name] || '/images/hero_turf.jpeg';
                
                const minRate = v.hourly_rates?.off_peak || 1000;
                const maxRate = v.hourly_rates?.peak || 2000;
                const rateString = v.type === 'turf' 
                  ? `KES ${minRate.toLocaleString()} - ${maxRate.toLocaleString()} / hr`
                  : `From KES ${minRate.toLocaleString()} / hr`;

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVenue(v)}
                    className={`relative overflow-hidden h-28 rounded-none border text-left p-4 transition-all duration-300 flex flex-col justify-end group cursor-pointer ${
                      isSelected 
                        ? 'border-gold ring-1 ring-gold shadow-gold-sm' 
                        : 'border-white/10 hover:border-gold/40'
                    }`}
                    aria-label={`Select ${v.name}`}
                  >
                    <Image 
                      src={bgImg} 
                      alt={v.name} 
                      fill 
                      className="object-cover absolute inset-0 opacity-15 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500 z-0" 
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061a10] via-[#061a10]/70 to-transparent z-[1]" />
                    
                    <div className="relative z-10 w-full space-y-0.5">
                      <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-gold bg-gold/10 px-1.5 py-0.5 border border-gold/20 inline-block mb-1">
                        {v.type === 'turf' ? 'Synthetic Turf' : 'Clubhouse Lounge'}
                      </span>
                      <h3 className="font-bold font-display text-sm sm:text-base text-white uppercase tracking-tight leading-tight">
                        {v.name}
                      </h3>
                      <p className="text-[10px] font-mono text-gold font-extrabold tracking-wide">
                        {rateString}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ========================================================
              SECTION B: SELECT DATE & TIME SLOT
              ======================================================== */}
          <section className="space-y-6 text-left">
            <div className="space-y-2 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" /> PICK YOUR DATE & SLOT
              </h2>
              <p className="text-xs text-charcoal-light font-medium">
                Choose a calendar day and pick your preferred hourly slots.
              </p>
            </div>

            {/* Date Strip */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">14-Day Horizontal Date Strip</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0" data-testid="date-strip">
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

            {/* Time Slots Grid */}
            <div className="space-y-4 pt-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">Available Hourly Time Slots (6:00 AM - 11:00 PM)</label>
              {isLoadingSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-pulse" data-testid="slot-grid-skeleton">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="bg-white/5 h-16 rounded-none border border-white/5" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="p-12 text-center bg-card border border-dashed border-white/10 rounded-none">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-white/20" />
                  <p className="text-xs text-charcoal-light font-medium">
                    No slots generated for this date. Please contact reception at 0798 258 950.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" data-testid="slot-grid">
                  {slots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.id);
                    const isAvailable = slot.status === 'available';
                    const isPeak = slot.price_tier === 'peak' || slot.price_tier === 'weekend';
                    const slotPrice = getSlotPrice(slot);

                    return (
                      <button
                        key={slot.id}
                        disabled={!isAvailable}
                        onClick={() => toggleSlot(slot.id)}
                        className={`relative p-4 rounded-none border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                          !isAvailable 
                            ? 'bg-white/5 border-white/5 opacity-20 cursor-not-allowed text-white/30'
                            : isSelected 
                              ? 'border-gold bg-gold text-forest-dark font-bold scale-[1.02] shadow-gold-sm'
                              : 'bg-white/5 border-white/10 text-white hover:border-gold/30 hover:bg-gold/10'
                        }`}
                        aria-label={`Slot ${slot.start_time.substring(0, 5)} - KES ${slotPrice}`}
                      >
                        <span className="block font-mono font-bold text-sm">
                          {slot.start_time.substring(0, 5)}
                        </span>
                        <span className={`text-[8px] font-extrabold mt-1 uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected 
                            ? 'bg-forest-dark/20 text-forest-dark border border-forest-dark/30' 
                            : isPeak 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : 'bg-white/10 text-white/80 border border-white/15'
                        }`}>
                          {isPeak ? 'PEAK' : 'OFF-PEAK'}
                        </span>
                        <span className={`text-[9px] font-mono mt-1 ${isSelected ? 'text-forest-dark' : 'text-white/60'}`}>
                          KES {slotPrice}
                        </span>
                        {!isAvailable && (
                          <span className="absolute top-1 right-1 text-[6px] font-black uppercase bg-error text-white px-1">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Client Details Section is now moved to the Booking Summary sidebar panel */}

        </div>

        {/* Right Column: Sticky Booking Summary Panel (1/3 width on desktop) */}
        <div className="lg:col-span-1 lg:sticky lg:top-32 space-y-6 text-left">
          
          <div className="bg-card border border-white/10 p-8 rounded-none relative overflow-hidden shadow-sm space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold/10 to-gold/50" />
            
            <h3 className="font-display font-bold text-lg text-white border-b border-white/5 pb-2 uppercase tracking-wide">
              Booking Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-light font-medium">Selected Venue:</span>
                <span className="font-bold text-white uppercase text-right max-w-[60%] truncate">{selectedVenue?.name || 'None'}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                <span className="text-charcoal-light font-medium">Date:</span>
                <span className="font-bold text-white">{format(selectedDate, 'EEEE, MMM do, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                <span className="text-charcoal-light font-medium">Time Slots:</span>
                <span className="font-bold text-white font-mono break-all text-right max-w-[60%]">{selectedSlots.length > 0 ? getSelectedSlotsTimeString() : 'No slots selected'}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                <span className="text-charcoal-light font-medium">Rate Tier:</span>
                <span className="font-bold text-gold uppercase tracking-wider">{selectedSlots.length > 0 ? getPeakStatus() : 'None'}</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-white/10 pt-4 mt-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Total Price:</span>
                <span className="font-mono font-black text-2xl text-gold">KES {total.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Contact Details Fields */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Enter Your Details
              </h4>
              
              <div className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider">Full Name</label>
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

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider">Phone Number</label>
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
              </div>
            </div>

            {errorMessage && (
              <p className="text-error text-xs font-semibold bg-error/10 border border-error/20 p-3 text-center">{errorMessage}</p>
            )}

            <button
              onClick={handleWhatsAppRedirect}
              disabled={isHolding}
              className="w-full py-5 bg-gold hover:bg-gold-muted text-forest-dark border border-gold font-display text-xs font-extrabold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2.5 shadow-gold-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] spring-bounce animate-pulse-gold disabled:opacity-50"
            >
              {isHolding ? 'Reserving Slot...' : 'Reserve via WhatsApp'}
            </button>
            
            <p className="text-[10px] text-white/40 italic font-medium pt-2 text-center leading-relaxed">
              *Tapping button redirects to WhatsApp chat to confirm instantly.
            </p>
          </div>
          
        </div>
      </div>

      {/* Mobile fixed bottom bar removed to keep checkout consolidated in summary panel */}

    </div>
  );
}
