import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { 
  ArrowRight, 
  Lock, 
  Wifi, 
  Clock, 
  ChevronRight,
  Shield,
  HelpCircle,
  Activity
} from 'lucide-react';

export const revalidate = 0; // Ensure live database changes propagate instantly

export default async function Home() {
  const supabase = await createClient();
  
  // Parallel fetch to eliminate waterfalls
  const [programsRes, venuesRes, siteContentRes] = await Promise.all([
    supabase.from('programs').select('*').eq('is_active', true).limit(4),
    supabase.from('venues').select('*').order('id', { ascending: true }),
    supabase.from('site_content').select('*')
  ]);

  const dbVenues = venuesRes?.data || [];
  const dbPrograms = programsRes?.data || [];
  const siteContent = siteContentRes?.data || [];

  // 1. Parse dynamic content keys with hardcoded fallbacks
  const homepageRow = siteContent.find((r: any) => r.key === 'homepage_content');
  const homepageData = homepageRow?.value || {};

  const heroHeadline = homepageData.hero_headline || "Home of Football \n& Fitness";
  const heroSubheading = homepageData.hero_subheading || "Premium synthetic turf. Floodlit nights. Behind Mountain View Mall, Waiyaki Way.";
  const heroTextAboveCta = homepageData.hero_text_above_cta || "Want to see the arena in action? Follow us on Instagram and TikTok @mtviewsportsarena";
  const closingCtaHeadline = homepageData.closing_cta_headline || "Book Your Slot Today";
  
  const instagramHandle = homepageData.instagram || "mtviewsportsarena";
  const tiktokHandle = homepageData.tiktok || "mtviewsportsarena";

  const trustCard1Title = homepageData.trust_card_1_title || "Changing Rooms & Lockers";
  const trustCard1Desc = homepageData.trust_card_1_desc || "Private premium changing stalls and secure smart lockers for your gear.";
  const trustCard2Title = homepageData.trust_card_2_title || "Free WiFi & Water";
  const trustCard2Desc = homepageData.trust_card_2_desc || "High-speed clubhouse connection and unlimited filtered hydration station.";
  const trustCard3Title = homepageData.trust_card_3_title || "Floodlit Until 11PM";
  const trustCard3Desc = homepageData.trust_card_3_desc || "FIFA-standard shadow-free matches under our high-intensity lighting systems.";

  const appearanceRow = siteContent.find((r: any) => r.key === 'appearance_settings');
  const appearanceData = appearanceRow?.value || {};
  
  const heroImgUrl = homepageData.hero_image_url || appearanceData.hero_image_url || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920";

  // Determine Turf rates from database
  const turfVenue = dbVenues.find((v: any) => v.type === 'turf' || v.name.includes('Turf'));
  const turfOffPeak = turfVenue?.hourly_rates?.off_peak || 1500;
  const turfPeak = turfVenue?.hourly_rates?.peak || 2000;

  // Determine Meeting Room rates from database
  const meetingVenue = dbVenues.find((v: any) => v.type === 'meeting_room' || v.name.includes('Meeting'));
  const meetingMinRate = meetingVenue?.hourly_rates?.off_peak || 1000;

  const renderHeadline = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br className="hidden sm:inline" />}
      </span>
    ));
  };

  return (
    <main className="min-h-screen text-charcoal selection:bg-gold selection:text-forest-dark overflow-x-hidden">
      {/* ============================================
          1. HERO SECTION (FULL BLEED OVERLAY)
          ============================================ */}
      <section 
        className="relative h-screen flex items-center justify-center pt-20 z-10 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${heroImgUrl}')` }}
      >
        {/* Lighter atmospheric overlay letting background show through */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061a10]/40 via-[#061a10]/20 to-[#061a10]/80 z-0" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full relative z-20 pt-10 text-center space-y-8 animate-slide-up">
          {/* Headline - Cinzel, large, white, sharp */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-white leading-[0.95] drop-shadow-lg">
            {renderHeadline(heroHeadline)}
          </h1>
          
          {/* Subheading - DM Sans, muted white, one line */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto font-medium tracking-wide">
            {heroSubheading}
          </p>
          
          {/* Double CTAs - Stacked on Mobile, Side-by-Side on Desktop */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/book" 
              className="relative h-16 w-64 bg-gold text-forest-dark hover:bg-gold-muted border border-gold font-display text-sm font-extrabold uppercase tracking-[0.2em] flex items-center justify-center rounded-none shadow-gold-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            >
              Book Now
            </Link>
            <Link 
              href="/programs" 
              className="relative h-16 w-64 bg-transparent text-white hover:bg-gold/10 border border-gold font-display text-sm font-extrabold uppercase tracking-[0.2em] flex items-center justify-center rounded-none transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            >
              Explore Programs
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          2. TRUST SIGNALS (SINGLE ROW OF EXACTLY 3)
          ============================================ */}
      <section className="py-20 bg-[#061a10]/60 border-y border-white/5 relative z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Signal 1 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 p-6 bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">{trustCard1Title}</h4>
                <p className="font-sans text-xs text-white/50 leading-relaxed font-medium">
                  {trustCard1Desc}
                </p>
              </div>
            </div>

            {/* Signal 2 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 p-6 bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">{trustCard2Title}</h4>
                <p className="font-sans text-xs text-white/50 leading-relaxed font-medium">
                  {trustCard2Desc}
                </p>
              </div>
            </div>

            {/* Signal 3 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 p-6 bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">{trustCard3Title}</h4>
                <p className="font-sans text-xs text-white/50 leading-relaxed font-medium">
                  {trustCard3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          3. PRICING TEASER (2 TIERS ONLY, DIRECT BUTTON)
          ============================================ */}
      <section className="py-24 bg-transparent relative z-20">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Simple Arena Pricing
            </h2>
            <div className="w-12 h-1 bg-gold mx-auto rounded-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {/* Off-Peak Tier */}
            <div className="p-8 border border-white/10 bg-card hover:border-gold transition-all duration-300">
              <div className="flex justify-between items-center">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 bg-white/5 text-[9px] font-mono font-bold uppercase text-white/80 border border-white/10">
                    OFF-PEAK RATE
                  </span>
                  <h4 className="font-display font-bold text-lg text-white uppercase tracking-wide">Weekday Morning/Afternoon</h4>
                  <p className="text-xs text-charcoal-light font-medium">Monday–Friday, 6AM–5PM</p>
                </div>
                <div className="text-right">
                  <p className="text-gold font-mono font-black text-2xl">KES {turfOffPeak.toLocaleString()}</p>
                  <p className="text-[9px] text-muted font-bold uppercase mt-1">Per hour</p>
                </div>
              </div>
            </div>

            {/* Peak Tier */}
            <div className="p-8 border border-gold/30 bg-gold/10 hover:border-gold transition-all duration-300">
              <div className="flex justify-between items-center">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 bg-gold/15 text-[9px] font-mono font-bold uppercase text-gold border border-gold/20">
                    PEAK ACTION
                  </span>
                  <h4 className="font-display font-bold text-lg text-white uppercase tracking-wide">Evenings & Weekends</h4>
                  <p className="text-xs text-charcoal-light font-medium">Nights & Sat-Sun All-Day</p>
                </div>
                <div className="text-right">
                  <p className="text-gold font-mono font-black text-2xl">KES {turfPeak.toLocaleString()}</p>
                  <p className="text-[9px] text-muted font-bold uppercase mt-1">Per hour</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Secondary Option line below cards */}
            <p className="text-charcoal-light font-sans text-sm font-semibold tracking-wide">
              Meeting Room from KES {meetingMinRate.toLocaleString()}/hr
            </p>
            
            {/* Single CTA button pointing to booking page */}
            <div className="flex justify-center">
              <Link 
                href="/book" 
                className="inline-flex items-center justify-center gap-2.5 bg-forest hover:bg-forest-light text-white px-10 py-5 rounded-none font-display text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                See Full Availability
                <ArrowRight className="w-4 h-4 text-gold stroke-[2.5px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          4. PROGRAMS STRIP (SLIM PATHWAYS CAROUSEL)
          ============================================ */}
      <section className="py-24 bg-[#061a10]/50 border-t border-white/5 relative z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-tight">
              Programs & Training Pathways
            </h2>
            <div className="hidden sm:block flex-1 h-px bg-white/10" />
          </div>

          {/* Grid Layout (Desktop) / Horizontal Scroll (Mobile) */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide shrink-0">
            {(dbPrograms.length > 0 ? dbPrograms : [
              { name: "Football Academy", schedule: "Ages 6-16" },
              { name: "Chess Club", schedule: "Ages 4-18" },
              { name: "Dance & Rhythm", schedule: "Ages 6-16" },
              { name: "Arena Fitness", schedule: "Ages 16+" }
            ]).map((program: any, index: number) => {
              return (
                <div 
                  key={index} 
                  className="bg-card border border-white/10 p-6 rounded-none flex flex-col justify-between min-w-[280px] md:min-w-0 h-[150px] shadow-sm hover:border-gold hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                      <span className="text-[9px] font-mono font-bold uppercase bg-white/10 px-2 py-0.5 text-white/80 border border-white/10">
                        {program.schedule || 'Ages 6-16'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base uppercase tracking-wide font-display">{program.name}</h4>
                      <p className="text-[10px] text-gold/60 font-medium uppercase tracking-widest mt-1.5 font-mono">
                        {program.age_group || 'All levels welcome'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-center">
            <Link 
              href="/programs" 
              className="inline-flex items-center gap-2 group text-xs font-mono font-bold uppercase text-gold hover:text-white transition-colors tracking-widest"
            >
              View All Programs 
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================
          5. CLOSING CTA (DOMINANT GOLD BOOK NOW)
          ============================================ */}
      <section className="py-28 bg-transparent relative z-20 text-center text-white overflow-hidden">
        {/* Subtle grid-blur patterns */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 space-y-10 relative z-10">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
            {closingCtaHeadline}
          </h2>
          
          {/* Dominant Gold CTA */}
          <div className="pt-2 flex justify-center">
            <Link 
              href="/book" 
              className="relative h-16 w-64 bg-gold text-forest-dark hover:bg-gold-muted border border-gold font-display text-sm font-extrabold uppercase tracking-[0.2em] flex items-center justify-center rounded-none shadow-gold-md transition-all duration-300 hover:scale-[1.03]"
            >
              Book Now
            </Link>
          </div>

          {/* Social details in single block */}
          <div className="pt-8 space-y-6">
            <p className="text-white/60 font-sans text-xs sm:text-sm font-semibold tracking-wide max-w-xl mx-auto leading-relaxed">
              {heroTextAboveCta}
            </p>
            
            {/* Social Icons - Instagram and TikTok only */}
            <div className="flex justify-center items-center gap-5">
              {/* Instagram SVG */}
              <a 
                href={`https://instagram.com/${instagramHandle}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-none bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold flex items-center justify-center text-white hover:text-gold transition-all"
                aria-label="Instagram link"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* TikTok SVG */}
              <a 
                href={`https://tiktok.com/@${tiktokHandle}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-none bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold flex items-center justify-center text-white hover:text-gold transition-all"
                aria-label="TikTok link"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
