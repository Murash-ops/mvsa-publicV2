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
    <main className="min-h-screen bg-gradient-to-b from-pitch via-pitch-light to-pitch relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 turf-pattern" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gold/6 rounded-full blur-[160px]" />
      <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-forest/8 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto relative z-10 pt-32 pb-16 px-4 sm:px-8">
        <header className="mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-gold rounded-full mb-6">
            <CalendarDays className="w-4 h-4 text-gold" />
            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">Book Your Session</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-display text-white mb-4 tracking-tight">
            Reserve Your <span className="text-gold">Pitch</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl font-medium">
            Select a venue, pick your preferred date and time slots, and pay your deposit securely via M-Pesa to confirm your booking instantly.
          </p>
        </header>
        
        {(!venues || venues.length === 0) ? (
          <div className="glass rounded-3xl p-12 text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-2">No venues available</h2>
            <p className="text-white/40">Please check back later or contact administration.</p>
          </div>
        ) : (
          <BookingWidget initialVenues={venues as Venue[]} />
        )}
      </div>
    </main>
  );
}
