import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { 
  ArrowRight, 
  Trophy, 
  Users, 
  Wifi, 
  Droplets, 
  Lock, 
  MapPin,
  CalendarDays,
  Sparkles,
  Clock,
  ChevronRight,
  CircleDollarSign
} from 'lucide-react';

export const revalidate = 0; // Prevent server component caching to ensure live content panel updates propagate instantly

export default async function Home() {
  const supabase = await createClient();
  
  // Parallel fetch to eliminate waterfalls (Vercel Best Practice async-parallel)
  const [contentRes, programsRes, venuesRes] = await Promise.all([
    supabase.from('site_content').select('*').eq('key', 'landing_page').single(),
    supabase.from('programs').select('*').eq('is_active', true).limit(4),
    supabase.from('venues').select('*').order('id', { ascending: true })
  ]);

  const dbVenues = venuesRes?.data || [];

  // 1. Turf rates
  const turfVenue = dbVenues.find((v: any) => v.name === 'Main Arena Turf' || v.type === 'turf');
  const turfOffPeak = turfVenue?.hourly_rates?.off_peak || 1500;
  const turfPeak = turfVenue?.hourly_rates?.peak || 2000;

  // 2. Meeting room rates (capacity-based)
  const meetingVenue = dbVenues.find((v: any) => v.type === 'meeting_room' || v.name.includes('Meeting') || v.name.includes('Conference'));
  const meetingOffPeak = meetingVenue?.hourly_rates?.off_peak || 500;
  const meetingPeak = meetingVenue?.hourly_rates?.peak || 1000;

  const content = contentRes?.data?.value || {
    hero_title: "🏟️ NAIBOBI'S PREMIER FOOTBALL & RECREATIONAL SANCTUARY",
    hero_subtitle: "Professional synthetic turf surfaces. FIFA standard floodlights. Elite sports excellence.",
    amenities: [
      { title: "High-Speed WiFi", desc: "Free access for all players and visitors." },
      { title: "Clean Washrooms", desc: "Well-maintained toilets and changing rooms." },
      { title: "Secure Lockers", desc: "Private storage for your peace of mind." },
      { title: "Meeting Hall", desc: "A versatile space for team meetings and events." }
    ]
  };

  const dbPrograms = programsRes?.data || [];

  const defaultCohorts = [
    { name: "Football Academy", type: "Athletic Excellence", schedule: "Ages 6-16", color: "border-forest/12" },
    { name: "Chess Club", type: "Cognitive Mastery", schedule: "Ages 4-18", color: "border-forest/12" },
    { name: "Dance & Rhythm", type: "Creative Expression", schedule: "Ages 6-16", color: "border-forest/12" },
    { name: "Arena Fitness", type: "Physical Mastery", schedule: "Ages 16+", color: "border-forest/12" }
  ];

  const amenityIcons = [Wifi, Droplets, Lock, MapPin];

  return (
    <main className="min-h-screen bg-surface text-charcoal">
      {/* ============================================
          1. HERO — SPECTACULAR LUXURY BANNER
          ============================================ */}
      <section className="relative min-h-screen flex items-center pt-24 z-20">
        {/* Backdrop image with beautiful high-performance Next.js Image and dark overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image 
            src="/images/hero_turf.jpeg"
            alt="Mountain View Sports Arena Turf"
            fill
            priority
            className="object-cover object-center"
            style={{ 
              filter: "brightness(0.35) contrast(1.1)"
            }}
            unoptimized
          />
          {/* Deep forest-green / charcoal tinted overlay (not pure black) fading to deep dark green to blend with the fold */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A3A0A]/40 via-[#2B2B2B]/85 to-[#061a10]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full relative z-30 pt-16">
          <div className="max-w-4xl space-y-8 text-left">
            {/* Elegant luxury badge */}
            <div className="inline-flex items-center gap-2 rounded-none border border-gold/40 bg-forest-dark/30 px-4 py-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-gold">
                Mountain View Sports Arena
              </span>
            </div>
            
            {/* Display Heading - Styled exactly to Spec */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold uppercase leading-[0.9] tracking-tight text-white">
              Nairobi&apos;s <br />
              <span className="text-gold">Recreational</span> Sanctuary
            </h1>
            
            {/* Subtitle */}
            <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed border-l border-gold pl-6 font-medium">
              {content.hero_subtitle} <br />
              <span className="text-white/95 font-bold">Experience Nairobi&apos;s ultimate synthetic turf and training environment.</span>
            </p>
            
            {/* Action Call to Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <Link 
                href="/book" 
                className="group relative h-16 w-full sm:w-64 cursor-pointer overflow-hidden bg-gold text-forest-dark transition-all duration-300 hover:scale-[1.02] hover:bg-gold-muted active:scale-[0.98] flex items-center justify-center rounded-none shadow-gold-sm border border-gold"
              >
                <div className="flex items-center justify-center gap-3">
                  <CalendarDays className="w-5 h-5 text-forest-dark stroke-[2px]" />
                  <span className="font-display text-sm font-extrabold uppercase tracking-widest text-forest-dark">
                    Book Pitch
                  </span>
                  <ArrowRight className="w-5 h-5 text-forest-dark stroke-[2.5px] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link 
                href="/programs" 
                className="w-full sm:w-auto group flex items-center justify-center sm:justify-start gap-2.5 text-white/80 hover:text-gold font-display font-bold tracking-widest uppercase text-xs py-4 transition-colors duration-300"
              >
                Explore Programs
                <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            
            {/* Details Row */}
            <div className="pt-6 flex flex-wrap gap-x-8 gap-y-3 opacity-80 text-white/60">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4.5 h-4.5 text-gold" />
                <span className="text-[10px] font-mono uppercase tracking-wider">M-Pesa Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-gold" />
                <span className="text-[10px] font-mono uppercase tracking-wider">6:00 AM - 11:00 PM Slots</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          2. SANCTUARY SPECS — DYNAMIC BENTO GRID
          ============================================ */}
      <section className="py-32 relative z-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-16">
          
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-forest/5 border border-forest/12">
                <span className="w-1.5 h-1.5 bg-forest rounded-full" />
                <span className="text-forest text-[9px] font-mono uppercase tracking-[0.2em] font-extrabold">Sanctuary Specs</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-display font-bold uppercase text-forest tracking-tight leading-none">
                BUILT FOR PURE <br />
                <span className="text-gold italic font-normal">HIGH PERFORMANCE.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 text-left">
              <p className="text-charcoal-light text-sm leading-relaxed max-w-md font-medium">
                Every square inch is engineered to support tactical execution, joint cushion stability, shadow-free sightlines during nights, and pure squad recreation.
              </p>
            </div>
          </div>

          {/* Simple Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Specs 1 */}
            <div className="bento-tile p-8 flex flex-col justify-between h-[320px] text-left border border-forest/12">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-forest/5 border border-forest/12 text-forest flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[9px] text-forest font-mono uppercase tracking-widest bg-forest/5 px-2.5 py-1 border border-forest/12 font-bold">
                  FIFA SPEC
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-forest uppercase tracking-tight">Professional Turf</h3>
                <p className="text-charcoal-light text-xs sm:text-sm leading-relaxed font-medium">
                  Designed with micro shock-absorption layers, consistent grip texture, and elite grass bounce mechanics. Minimizes injury hazards during sliding play.
                </p>
              </div>
            </div>

            {/* Specs 2 */}
            <div className="bento-tile p-8 flex flex-col justify-between h-[320px] text-left border border-forest/12">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-forest/5 border border-forest/12 text-forest flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[9px] text-gold font-mono uppercase tracking-widest bg-gold/5 px-2.5 py-1 border border-gold/20 font-bold">
                  FLOODLIGHTS
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-forest uppercase tracking-tight">Match Illumination</h3>
                <p className="text-charcoal-light text-xs sm:text-sm leading-relaxed font-medium">
                  Shadow-free floodlight framework enabling crisp depth visibility for fast night tournaments, operating securely until 11:00 PM.
                </p>
              </div>
            </div>

            {/* Specs 3 */}
            <div className="bento-tile p-8 flex flex-col justify-between h-[320px] text-left border border-forest/12">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-forest/5 border border-forest/12 text-forest flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-[9px] text-forest/70 font-mono uppercase tracking-widest bg-forest/5 px-2.5 py-1 border border-forest/12 font-bold">
                  DEVELOPMENT
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-forest uppercase tracking-tight">Youth Academy</h3>
                <p className="text-charcoal-light text-xs sm:text-sm leading-relaxed font-medium">
                  Continuous expert training blocks across active Football cohorts, tactical Chess clubs, Dance rhythms, and fitness pathways led by certified coaches.
                </p>
              </div>
            </div>

          </div>

          {/* Dynamic Perks Row (CONSUMES dynamic site_content BLOCK) */}
          <div className="bento-tile p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 text-left border border-forest/12">
            <div className="space-y-2">
              <h4 className="text-lg font-display font-bold text-forest uppercase tracking-tight">Clubhouse Amenities Panel</h4>
              <p className="text-charcoal-light text-xs sm:text-sm font-medium">
                Every booking logs instant secure entry to high-end clubhouse locker chambers, fresh washrooms, and parking slots.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto shrink-0">
              {content.amenities?.slice(0, 4).map((perk: any, index: number) => {
                const Icon = amenityIcons[index % amenityIcons.length] || Wifi;
                return (
                  <div key={index} className="bg-surface border border-forest/12 p-4 rounded-none flex flex-col items-center justify-center text-center gap-2 w-full sm:w-32 hover:border-gold/40 transition-all duration-300">
                    <Icon className="w-5 h-5 text-gold" />
                    <span className="text-[9px] font-mono font-bold text-forest uppercase tracking-wider truncate max-w-full">{perk.title}</span>
                  </div>
                );
              })}
            </div>
          </div>


        </div>
      </section>

      {/* ============================================
          3. TARIFFS — HIGH CONTRAST ARENA TARIFFS
          ============================================ */}
      <section className="py-28 relative z-20 border-t border-forest/12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Rates Description */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-forest/5 border border-forest/12">
                <Sparkles className="w-4 h-4 text-forest" />
                <span className="text-forest text-[10px] font-mono uppercase tracking-[0.2em] font-bold">TARIFF GUIDE</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-forest uppercase tracking-tight leading-none">
                TRANSPARENT <br />
                <span className="text-gold italic font-normal">ARENA PRICING.</span>
              </h2>
              <p className="text-charcoal-light text-sm sm:text-base leading-relaxed font-medium">
                No hidden costs. Simple, transparent hourly reservations. Book your pitch online and settle seamlessly via M-Pesa or card for instant confirmation.
              </p>
              
              <div className="space-y-4 pt-4 border-t border-forest/12">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-forest/5 text-forest flex items-center justify-center border border-forest/12 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-forest uppercase tracking-wide">60-Minute Slots</h5>
                    <p className="text-xs text-charcoal-light mt-0.5">Rates include full turf usage, bibs, standard match footballs, and showers.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-forest/5 text-forest flex items-center justify-center border border-forest/12 shrink-0">
                    <CircleDollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-forest uppercase tracking-wide">Instant Checkout Sync</h5>
                    <p className="text-xs text-charcoal-light mt-0.5">Enter code or pay via verified merchant paths with rapid notifications.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Grid */}
            <div className="lg:col-span-7 space-y-8">
              {/* Venue 1: Main Arena Turf */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-lg text-forest uppercase tracking-wider border-b border-forest/10 pb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                  1. Main Arena Turf
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-6 border border-forest/12 bg-surface hover:border-gold transition-all duration-300">
                    <div className="space-y-1 text-left">
                      <span className="px-2 py-0.5 bg-forest/5 text-[8px] font-mono font-bold uppercase text-forest border border-forest/12">
                        OFF-PEAK
                      </span>
                      <h4 className="font-bold text-forest text-sm uppercase tracking-wide">Standard Off-Peak</h4>
                      <p className="text-[10px] text-charcoal-light font-medium font-sans">Mon–Fri (6:00 AM — 5:00 PM)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-mono font-black text-xl leading-none">KES {turfOffPeak.toLocaleString()}</p>
                      <p className="text-[8px] text-charcoal-light/50 font-black uppercase mt-1">Per hour</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-6 border border-gold/40 bg-gold/5 hover:border-gold transition-all duration-300">
                    <div className="space-y-1 text-left">
                      <span className="px-2 py-0.5 bg-gold/10 text-[8px] font-mono font-bold uppercase text-gold border border-gold/20">
                        PEAK POWER
                      </span>
                      <h4 className="font-bold text-forest text-sm uppercase tracking-wide">Premium Peak</h4>
                      <p className="text-[10px] text-charcoal-light font-medium font-sans">Nights & All Weekends</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-mono font-black text-xl leading-none">KES {turfPeak.toLocaleString()}</p>
                      <p className="text-[8px] text-charcoal-light/50 font-black uppercase mt-1">Per hour</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue 2: Meeting Room / Conference Hall */}
              <div className="space-y-4 pt-4">
                <h3 className="font-display font-black text-lg text-forest uppercase tracking-wider border-b border-forest/10 pb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                  2. Meeting Room / Conference Hall
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-6 border border-forest/12 bg-surface hover:border-gold transition-all duration-300">
                    <div className="space-y-1 text-left">
                      <span className="px-2 py-0.5 bg-forest/5 text-[8px] font-mono font-bold uppercase text-forest border border-forest/12">
                        SMALL GROUP
                      </span>
                      <h4 className="font-bold text-forest text-sm uppercase tracking-wide">Small Group Rate</h4>
                      <p className="text-[10px] text-charcoal-light font-medium font-sans">Under 20 People Capacity</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-mono font-black text-xl leading-none">KES {meetingOffPeak.toLocaleString()}</p>
                      <p className="text-[8px] text-charcoal-light/50 font-black uppercase mt-1">Per hour</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-6 border border-gold/40 bg-gold/5 hover:border-gold transition-all duration-300">
                    <div className="space-y-1 text-left">
                      <span className="px-2 py-0.5 bg-gold/10 text-[8px] font-mono font-bold uppercase text-gold border border-gold/20">
                        LARGE GROUP
                      </span>
                      <h4 className="font-bold text-forest text-sm uppercase tracking-wide">Large Group & Events</h4>
                      <p className="text-[10px] text-charcoal-light font-medium font-sans">20+ People Capacity</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-mono font-black text-xl leading-none">KES {meetingPeak.toLocaleString()}</p>
                      <p className="text-[8px] text-charcoal-light/50 font-black uppercase mt-1">Per hour</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ============================================
          4. PATHWAYS — ACTIVE PROGRAMS
          ============================================ */}
      <section className="py-24 relative z-20 border-t border-forest/12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
          
          <div className="flex items-center gap-4 text-left">
            <h2 className="text-2xl font-display font-bold text-forest uppercase tracking-tight">Active Programs & Pathways</h2>
            <div className="flex-1 h-px bg-forest/12" />
            <Link 
              href="/programs" 
              className="text-xs font-mono font-bold uppercase text-gold hover:text-forest transition-colors shrink-0 tracking-widest flex items-center gap-1"
            >
              All Cohorts <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(dbPrograms.length > 0 ? dbPrograms : defaultCohorts).map((cohort: any, index: number) => {
              return (
                <div 
                  key={index} 
                  className="bento-tile p-6 flex flex-col justify-between group h-[200px] border border-forest/12"
                >
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <span className="w-2 h-2 rounded-full bg-gold" />
                      <span className="text-[9px] font-mono uppercase bg-forest/5 px-2 py-0.5 text-forest border border-forest/12 font-bold">
                        {cohort.schedule?.includes("Ages") ? cohort.schedule : "Ages 6-16"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-forest font-bold text-base uppercase tracking-wider">{cohort.name}</h4>
                      <p className="text-[10px] text-charcoal-light font-bold uppercase tracking-widest mt-1">
                        {cohort.type || "Athletic Excellence"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link 
                      href={`/programs/${cohort.id || ""}`} 
                      className="w-8 h-8 bg-forest/5 border border-forest/12 flex items-center justify-center text-forest group-hover:bg-gold group-hover:text-forest-dark transition-all duration-300 rounded-none"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================
          5. CALL TO ACTION
          ============================================ */}
      <section className="py-32 relative z-20 border-t border-forest/12 bg-surface">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-forest/5 border border-forest/12">
            <Trophy className="w-4 h-4 text-forest" />
            <span className="text-forest text-[10px] font-mono uppercase tracking-[0.2em] font-extrabold">SECURE YOUR SLOT</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl font-display font-bold text-forest tracking-tight leading-none uppercase">
            READY TO DOMINATE <br />
            <span className="text-gold italic font-normal">THE ARENA?</span>
          </h2>
          
          <p className="text-charcoal-light text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Lock in your hourly pitch reservation. Instant booking confirmation, premium turf texture, vertical stadium floodlights, and professional specs await your squad today.
          </p>
          
          <div className="pt-4 flex justify-center">
            <Link 
              href="/book" 
              className="group relative h-16 w-64 cursor-pointer overflow-hidden bg-gold text-forest-dark transition-all duration-300 hover:scale-[1.02] hover:bg-gold-muted active:scale-[0.98] flex items-center justify-center rounded-none shadow-gold-sm border border-gold"
            >
              <div className="flex items-center justify-center gap-3">
                <CalendarDays className="w-5 h-5 text-forest-dark stroke-[2px]" />
                <span className="font-display text-sm font-extrabold uppercase tracking-widest text-forest-dark">
                  Book Slot Now
                </span>
                <ArrowRight className="w-5 h-5 text-forest-dark stroke-[2.5px]" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
