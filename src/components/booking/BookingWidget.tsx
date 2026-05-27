'use client';

import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { createClient } from '@/utils/supabase/client';
import type { Venue, TimeSlot } from '@/types/database';
import Image from 'next/image';
import { Calendar, Clock, MapPin, CheckCircle2, Flame, Zap, CreditCard, Smartphone, Sunrise } from 'lucide-react';

export default function BookingWidget({ initialVenues }: { initialVenues: Venue[] }) {
  const supabase = createClient();
  
  // State
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(initialVenues[0] || null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'polling' | 'success' | 'failed'>('idle');
  const [manualHoldStatus, setManualHoldStatus] = useState<'idle' | 'holding' | 'held' | 'failed'>('idle');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stk' | 'manual'>('manual');
  const [randomRef] = useState(() => Math.floor(Math.random() * 1000).toString());
  const [mpesaCode, setMpesaCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  const handleSubmitMpesaCode = async () => {
    if (!mpesaCode.trim()) {
      setErrorMessage('Please enter your M-Pesa Transaction Code.');
      return;
    }
    const cleanCode = mpesaCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(cleanCode)) {
      setErrorMessage('Invalid M-Pesa Code. Must be exactly 10 alphanumeric characters.');
      return;
    }
    
    setIsSubmittingCode(true);
    setErrorMessage('');
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          checkout_request_id: cleanCode,
          status: 'pending'
        })
        .eq('id', Number(checkoutId));

      if (error) throw error;
      
      setPaymentStatus('success');
      setMpesaCode('');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to submit M-Pesa code. Please try again.');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  // Generate 14 days for the calendar
  const next14Days = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  // Fetch slots when venue or date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedVenue) return;
      
      setIsLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('venue_id', selectedVenue.id)
        .eq('date', dateStr)
        .order('start_time', { ascending: true });
        
      if (!error && data) {
        setSlots(data);
      }
      setIsLoading(false);
      setSelectedSlots([]); // Reset selection on date change
    }
    
    fetchSlots();
  }, [selectedVenue, selectedDate]);

  // Polling for payment status
  useEffect(() => {
    if (paymentStatus !== 'polling' || !checkoutId) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('status')
        .eq('checkout_request_id', checkoutId)
        .single();

      if (data?.status === 'confirmed') {
        setPaymentStatus('success');
        setCheckoutId(null);
        clearInterval(interval);
      } else if (data?.status === 'cancelled') {
        setPaymentStatus('failed');
        setErrorMessage('Payment was cancelled or failed.');
        setCheckoutId(null);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentStatus, checkoutId]);

  // Countdown timer for held slots
  useEffect(() => {
    if (paymentStatus !== 'polling' && manualHoldStatus !== 'held') return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (paymentStatus === 'polling') {
            setPaymentStatus('failed');
            setErrorMessage('Payment session expired. Please try again.');
          } else if (manualHoldStatus === 'held') {
            setManualHoldStatus('failed');
            setErrorMessage('Hold expired. Slots have been released.');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus, manualHoldStatus]);

  const toggleSlot = (id: number) => {
    setSelectedSlots(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getSlotPrice = (slot: { price_tier: string }) => {
    const rates = selectedVenue?.hourly_rates as Record<string, number> | undefined;
    return rates?.[slot.price_tier] ?? 0;
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, id) => {
      const slot = slots.find(s => s.id === id);
      if (!slot) return total;
      return total + getSlotPrice(slot);
    }, 0);
  };

  const [isPaying, setIsPaying] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [clientName, setClientName] = useState('');

  const total = calculateTotal();
  const deposit = total * 0.5;

  const handleManualHold = async () => {
    if (!phoneNumber || !clientName || selectedSlots.length === 0) return;
    
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!/^(07|01|254)\d{8,10}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid Kenyan phone number.');
      return;
    }

    setManualHoldStatus('holding');
    setErrorMessage('');
    
    try {
      const { data, error } = await supabase.rpc('create_booking_with_hold', {
        p_venue_id: selectedVenue?.id,
        p_client_name: clientName,
        p_client_phone: cleanPhone,
        p_slot_ids: selectedSlots,
        p_total_amount: total,
        p_deposit_amount: deposit,
        p_balance: total - deposit,
        p_source: 'online',
        p_checkout_request_id: null
      });

      if (error) throw error;
      
      setCheckoutId(data.toString());
      setManualHoldStatus('held');
      setCountdown(900); // 15 mins
    } catch (err: unknown) {
      setManualHoldStatus('idle');
      setErrorMessage((err as Error).message || 'Failed to hold slots. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber || selectedSlots.length === 0) return;
    
    // Simple validation
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!/^(07|01|254)\d{8,10}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid Kenyan phone number.');
      return;
    }

    setPaymentStatus('processing');
    setErrorMessage('');
    
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: { 
          amount: deposit, 
          phoneNumber: cleanPhone,
          metadata: {
            venue_id: selectedVenue?.id,
            slot_ids: selectedSlots,
            client_name: clientName
          }
        }
      });

      if (error) throw error;
      if (data?.ResponseCode !== "0") throw new Error(data?.CustomerMessage || 'STK Push failed');
      
      setCheckoutId(data.CheckoutRequestID);
      setPaymentStatus('polling');
      setCountdown(900); // 15 mins
    } catch (err: unknown) {
      setPaymentStatus('idle');
      setErrorMessage((err as Error).message || 'Payment initiation failed.');
    }
  };

  const resetBooking = () => {
    setSelectedSlots([]);
    setPaymentStatus('idle');
    setManualHoldStatus('idle');
    setCheckoutId(null);
    setErrorMessage('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ========================================================
          LEFT COLUMN: SELECTION GRID (VENUE, CALENDAR, SLOTS)
          ======================================================== */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* CARD A: Venue Selector */}
        <section className="glass rounded-none p-6 border border-forest/12 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-lg font-bold font-display mb-6 flex items-center gap-2 text-forest">
            <MapPin className="w-5 h-5 text-gold" /> Select Venue
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {initialVenues.map(v => {
              const isSelected = selectedVenue?.id === v.id;
              
              // Map images based on venue names
              const imgMap: Record<string, string> = {
                'Main Turf': '/images/hero_turf.jpeg',
                'Main Arena Turf': '/images/hero_turf.jpeg',
                'Academy Pitch': '/images/academy.jpeg',
                'Meeting Hall': '/images/meeting_hall.jpeg',
                'Meeting Room / Conference Hall': '/images/meeting_hall.jpeg',
                'Executive Lounge': '/images/meeting_hall.jpeg'
              };
              const bgImg = v.image_url || imgMap[v.name] || '/images/hero_turf.jpeg';
              
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVenue(v)}
                  className={`relative overflow-hidden h-36 rounded-none border text-left p-5 transition-all duration-300 spring-bounce group flex flex-col justify-end ${
                    isSelected 
                      ? 'border-gold shadow-gold-md ring-1 ring-gold/40 scale-[1.02]' 
                      : 'border-forest/12 hover:border-gold/30'
                  }`}
                  aria-label={`Select venue ${v.name}`}
                  id={`venue-btn-${v.id}`}
                >
                  <Image 
                    src={bgImg} 
                    alt={v.name} 
                    fill 
                    className="object-cover absolute inset-0 opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500 z-0" 
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/30 to-transparent z-[1]" />
                  <div className="relative z-10 w-full flex items-center justify-between">
                    <div>
                      <p className={`font-bold font-display text-base transition-colors ${isSelected ? 'text-gold animate-entrance' : 'text-white'}`}>
                        {v.name}
                      </p>
                      <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
                        {v.type === 'turf' ? '5-Aside Pitch' : 'Sanctuary Lounge'}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {selectedVenue?.description && (
            <div className="mt-4 p-4 border border-gold/20 bg-gold/5 text-xs text-charcoal-light/90 italic font-medium rounded-none text-left">
              {selectedVenue.description}
            </div>
          )}
        </section>

        {/* CARD B: Calendar Date Picker */}
        <section className="glass rounded-none p-6 border border-forest/12 animate-slide-up stagger-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest-light/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-lg font-bold font-display mb-6 flex items-center gap-2 text-forest">
            <Calendar className="w-5 h-5 text-gold" /> Select Date
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {next14Days.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center min-w-[72px] p-4 rounded-none border transition-all duration-300 spring-bounce ${
                    isSelected 
                      ? 'border-gold bg-gold text-forest-dark shadow-gold-sm scale-105 font-bold' 
                      : 'border-forest/12 bg-white text-charcoal-light hover:border-gold/30 hover:text-forest'
                  }`}
                  aria-label={`Select date ${format(date, 'EEEE, MMMM d')}`}
                  id={`date-btn-${format(date, 'yyyy-MM-dd')}`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-forest-dark/80 font-black' : 'text-muted'}`}>
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-xl font-bold font-mono my-1 text-charcoal">{format(date, 'd')}</span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-forest-dark/80 font-black' : 'text-muted'}`}>
                    {format(date, 'MMM')}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CARD C: Time-Slot Grid */}
        <section className="glass rounded-none p-6 border border-forest/12 animate-slide-up stagger-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-lg font-bold font-display mb-6 flex items-center gap-2 text-forest">
            <Clock className="w-5 h-5 text-gold" /> Available Slots (1-Hour Sessions)
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-charcoal/5 animate-pulse h-20 rounded-none" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="glass rounded-none p-10 text-center border border-forest/12 bg-white">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-forest/20" />
              <p className="text-charcoal-light font-medium">No slots generated for this date. Please contact reception at 0798 258 950 / 0783 209 442.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((slot, i) => {
                const isSelected = selectedSlots.includes(slot.id);
                const isAvailable = slot.status === 'available';
                const isMorning = slot.price_tier === 'morning';
                const isPeak = slot.price_tier === 'peak';
                const isWeekend = slot.price_tier === 'weekend';
                
                const tierConfig = isMorning
                  ? { label: 'MORNING', className: 'tier-morning', icon: <Sunrise className="w-3 h-3" /> }
                  : isPeak
                  ? { label: 'PEAK', className: 'tier-peak', icon: <Flame className="w-3 h-3" /> }
                  : isWeekend
                  ? { label: 'WEEKEND', className: 'tier-peak', icon: <Flame className="w-3 h-3" /> }
                  : { label: 'OFF-PEAK', className: 'tier-offpeak', icon: null };
                  
                return (
                  <button
                    key={slot.id}
                    disabled={!isAvailable}
                    onClick={() => toggleSlot(slot.id)}
                    className={`relative p-4 rounded-none border text-center transition-all duration-300 spring-bounce hover:scale-[1.03] animate-slide-up stagger-${Math.min(i + 1, 8)} ${
                      !isAvailable 
                        ? 'bg-charcoal/5 border-forest/5 opacity-40 cursor-not-allowed'
                        : isSelected 
                          ? 'border-gold bg-gold/10 shadow-gold-sm ring-1 ring-gold/30 text-gold'
                          : 'bg-white border-forest/12 text-charcoal hover:border-gold/30 hover:bg-gold/5'
                    }`}
                    aria-label={`Select hour slot starting ${slot.start_time.substring(0, 5)}`}
                    id={`slot-btn-${slot.id}`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-gold absolute top-2.5 right-2.5 animate-entrance" />
                    )}
                    <span className={`block font-mono font-bold text-lg ${isSelected ? 'text-gold font-extrabold' : 'text-charcoal font-semibold'}`}>
                      {slot.start_time.substring(0, 5)}
                    </span>
                    <span className={`text-[9px] font-extrabold mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${tierConfig.className}`}>
                      {tierConfig.icon}
                      {tierConfig.label}
                    </span>
                    {!isAvailable && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-error/80 text-white">
                        {slot.status}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ========================================================
          CARD D: SUMMARY COLUMN (STICKY TICKET LAYOUT)
          ======================================================== */}
      <div className="lg:col-span-4 animate-slide-up stagger-3 lg:sticky lg:top-28">
        <div className="glass rounded-none p-6 relative overflow-hidden border border-forest/12 shadow-pitch bg-white">
          {/* Subtle gold line on top to suggest ticket header */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold/10 to-gold/50" />
          
          <h3 className="font-display font-bold text-2xl mb-6 text-forest flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" /> Booking Details
          </h3>
          
          {paymentStatus === 'success' ? (
            <div className="text-center py-8 animate-entrance">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-none flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-bold font-display mb-2 text-forest">Reserved Successfully!</h4>
              <p className="text-charcoal-light text-sm mb-8 font-medium">
                Your slots have been held. The administrator will review and send SMS confirmation.
              </p>
              <button 
                onClick={resetBooking}
                className="w-full bg-forest hover:bg-forest-dark text-white py-4 rounded-none font-bold uppercase tracking-widest text-xs transition-colors btn-premium"
                id="btn-book-another"
              >
                Make Another Booking
              </button>
            </div>
          ) : paymentStatus === 'polling' ? (
            <div className="text-center py-8 animate-entrance">
              <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h4 className="text-xl font-bold font-display mb-2 text-forest">M-Pesa Verification</h4>
              <p className="text-charcoal-light text-sm mb-4 font-medium">
                Pushing STK payload to <strong className="text-forest">{phoneNumber}</strong>. Type PIN on your phone to finalize.
              </p>
              <div className="glass-gold p-4 rounded-none mb-6 border border-gold/25">
                <p className="text-xs uppercase font-bold text-gold/80 mb-1">Time remaining to pay</p>
                <p className={`text-3xl font-mono font-bold text-gold ${countdown < 120 ? 'animate-count-glow' : ''}`}>
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <button 
                onClick={() => setPaymentStatus('idle')}
                className="text-charcoal-light hover:text-forest text-xs underline underline-offset-4 transition-colors font-bold uppercase tracking-wider"
                id="btn-polling-cancel"
              >
                Cancel and try again
              </button>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="text-center py-8 animate-entrance">
              <div className="w-20 h-20 bg-error/10 text-error rounded-none flex items-center justify-center mx-auto mb-6 text-3xl font-bold border border-error/20">
                ✕
              </div>
              <h4 className="text-xl font-bold font-display mb-2 text-forest">Session Expired</h4>
              <p className="text-error mb-8 font-semibold text-sm">{errorMessage}</p>
              <button 
                onClick={() => setPaymentStatus('idle')}
                className="w-full bg-forest hover:bg-forest-dark text-white py-4 rounded-none font-bold uppercase tracking-widest text-xs transition-colors btn-premium"
                id="btn-payment-retry"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm border-b border-forest/5 pb-2">
                  <span className="text-charcoal-light font-medium">Venue</span>
                  <span className="font-bold text-charcoal">{selectedVenue?.name || '-'}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-forest/5 pb-2">
                  <span className="text-charcoal-light font-medium">Date</span>
                  <span className="font-bold text-charcoal">{format(selectedDate, 'MMM do, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-light font-medium">Hours Picked</span>
                  <span className="font-bold text-charcoal">{selectedSlots.length} hrs</span>
                </div>
              </div>
 
              {/* Ticket Divider */}
              <div className="border-t border-forest/12 my-6" />
 
              {/* Pricing */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-light text-sm font-medium">Total Fee</span>
                  <span className="font-mono font-bold text-charcoal">KES {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gold/5 border border-gold/15">
                  <span className="text-forest font-bold text-xs uppercase tracking-wider">50% Deposit Req.</span>
                  <span className="font-mono font-black text-xl text-gold">KES {deposit.toLocaleString()}</span>
                </div>
              </div>
 
              {selectedSlots.length > 0 ? (
                <div className="space-y-4">
                  {/* Name and Phone Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1">Your Name</label>
                      <input 
                        required
                        type="text" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-3 rounded-none border border-forest/12 bg-white text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-300 font-medium text-sm" 
                        placeholder="Full name" 
                        id="input-client-name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1">M-Pesa Number</label>
                      <input 
                        required
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-none border border-forest/12 bg-white text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-300 font-mono text-sm" 
                        placeholder="e.g. 0712345678" 
                        id="input-phone-number"
                      />
                    </div>
                  </div>
 
                  {errorMessage && paymentStatus === 'idle' && manualHoldStatus === 'idle' && (
                    <p className="text-error text-xs mt-2 font-medium">{errorMessage}</p>
                  )}
 
                  <div className="glass-gold p-5 rounded-none border border-gold/15 bg-white">
                    <p className="text-xs font-bold text-forest uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-forest/5 pb-2">
                      <Zap className="w-4 h-4 text-gold" /> Pay Manually to Till
                    </p>
                    
                    {manualHoldStatus === 'idle' || manualHoldStatus === 'holding' || manualHoldStatus === 'failed' ? (
                      <div className="space-y-4">
                        <p className="text-[11px] text-charcoal-light leading-relaxed font-medium">
                          To protect your slots from double-booking, we will lock them for 15 minutes while you submit your Till payment.
                        </p>
                        {errorMessage && manualHoldStatus === 'failed' && (
                           <p className="text-error text-xs mt-2 font-medium">{errorMessage}</p>
                        )}
                        <button 
                          onClick={handleManualHold}
                          disabled={manualHoldStatus === 'holding' || !phoneNumber || !clientName}
                          className="w-full bg-gold hover:bg-gold-muted disabled:opacity-50 text-forest-dark py-4 rounded-none font-bold uppercase tracking-widest text-xs transition-all duration-300 active:scale-[0.98] spring-bounce shadow-gold-sm btn-premium"
                          id="btn-manual-hold"
                        >
                          {manualHoldStatus === 'holding' ? 'Locking Slots...' : 'Hold Slots & Get Till'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-slide-up">
                        <div className="bg-forest/5 p-4 rounded-none text-center border border-gold/20">
                          <p className="text-[9px] font-bold text-forest/60 uppercase mb-1">Slots Locked For</p>
                          <p className={`text-3xl font-mono font-bold text-gold ${countdown < 120 ? 'animate-count-glow' : ''}`}>
                            {`${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 border-b border-forest/5 pb-3">
                          <div>
                            <p className="text-[9px] text-charcoal-light/60 uppercase font-black tracking-wider">Buy Goods Till</p>
                            <p className="text-xl font-mono font-bold text-forest tracking-widest">967413</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-charcoal-light/60 uppercase font-black tracking-wider">Deposit Fee</p>
                            <p className="text-xl font-mono font-bold text-gold">KES {deposit.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="bg-forest/5 p-3 rounded-none border border-forest/12">
                          <p className="text-[9px] text-charcoal-light/60 uppercase font-bold mb-1">M-Pesa Reference</p>
                          <p className="text-xs font-mono font-bold p-2 bg-white border border-forest/5 rounded-none uppercase text-center text-charcoal-light">
                            {clientName ? clientName.substring(0, 3).toUpperCase() : 'MVSA'}-{format(new Date(), 'ddMM')}-{randomRef || '000'}
                          </p>
                        </div>
 
                        {/* Mpesa Transaction Code Confirmation */}
                        <div className="pt-2 border-t border-forest/12 space-y-2">
                          <label className="block text-[9px] text-forest uppercase font-bold text-left tracking-wider">Enter M-Pesa Code (10 Chars)</label>
                          <input 
                            required
                            type="text"
                            value={mpesaCode}
                            onChange={(e) => setMpesaCode(e.target.value)}
                            placeholder="e.g. RG89SH3FKL"
                            className="w-full px-3 py-2 bg-white border border-forest/12 rounded-none text-center text-charcoal font-mono uppercase tracking-widest placeholder-charcoal/30 focus:outline-none focus:ring-1 focus:ring-gold/50"
                            id="input-mpesa-code"
                          />
                          {errorMessage && (
                            <p className="text-error text-[10px] font-medium text-center">{errorMessage}</p>
                          )}
                          <button
                            onClick={handleSubmitMpesaCode}
                            disabled={isSubmittingCode || !mpesaCode}
                            className="w-full bg-gold hover:bg-gold-muted disabled:opacity-50 text-forest-dark py-3 rounded-none font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 btn-premium"
                            id="btn-submit-code"
                          >
                            {isSubmittingCode ? 'Verifying...' : 'Complete Booking'}
                          </button>
                        </div>
 
                        <p className="text-[9px] text-charcoal-light/70 leading-relaxed text-center pt-2 font-medium">
                          Once confirmed, the system verifies M-Pesa receipts against Kenya Safaricom databases and secures your slots permanently.
                        </p>
 
                        <div className="text-center my-1.5">
                          <span className="text-[9px] text-muted font-bold">or</span>
                        </div>
 
                        <button 
                          type="button"
                          onClick={() => window.open(`https://wa.me/254798258950?text=Hi MVSA! I've just paid KES ${deposit} for my booking (Ref: ${checkoutId}). Please confirm.`, '_blank')}
                          className="w-full bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-600 py-3 rounded-none font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300"
                          id="btn-whatsapp-receipt"
                        >
                          Send Receipt via WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass text-charcoal-light/60 text-xs p-5 rounded-none text-center border border-dashed border-forest/12 bg-white/5">
                  Select an hour session slot above to continue.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
