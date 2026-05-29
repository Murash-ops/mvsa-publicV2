import BookingWidget from '@/components/booking/BookingWidget';
import { createClient } from '@/utils/supabase/server';
import type { Venue } from '@/types/database';
import { CalendarDays } from 'lucide-react';

export const revalidate = 0; // Don't cache this page so it always gets the latest venues

export default async function BookPage() {
  const supabase = await createClient();
  
  // Fetch available venues
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('SUPABASE ERROR:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  }

  return (
    <main className="min-h-screen bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 pt-32 pb-16 px-4 sm:px-8">
        <header className="mb-12 animate-slide-up text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-none mb-6">
            <CalendarDays className="w-4 h-4 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Online Booking</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-4 tracking-tight uppercase">
            RESERVE YOUR <span className="text-gold">PITCH</span>
          </h1>
          <p className="text-charcoal-light text-lg max-w-3xl font-medium">
            Select your venue, date and slot — then reserve instantly via WhatsApp
          </p>
        </header>
        
        {(!venues || venues.length === 0) ? (
          <div className="glass rounded-none p-12 text-center border border-white/10 bg-card">
            <h2 className="text-2xl font-display font-bold text-white mb-2">No venues available</h2>
            <p className="text-charcoal-light">Please check back later or contact administration.</p>
          </div>
        ) : (
          <BookingWidget initialVenues={venues as Venue[]} />
        )}
      </div>
    </main>
  );
}
