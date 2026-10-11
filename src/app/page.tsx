import Image from 'next/image';
import Link from 'next/link';
import { getVenueFacts, isMvsaApiError, type PricingSummaryItem } from '@/lib/mvsa-api';
import { getAcademyPrograms } from '@/lib/academy-programs';
import { booking, contact, home, social } from '@/content/site';
import { gallery, heroPhoto } from '@/content/photos';
import { 
  ArrowRight, 
  Lock, 
  Wifi, 
  Clock, 
  ChevronRight
} from 'lucide-react';

export const revalidate = 0; // Venue facts come from the backend on every request

/**
 * How many photographs the home page shows. All 35 made the page 7,900px tall
 * on a desktop and nearly 30,000px on a phone, which is a scroll nobody
 * finishes. These are portrait frames, so they stack tall quickly.
 */
const GALLERY_ON_HOME = 12;

/**
 * Prices are venue facts, so they come from GET /v1/knowledge/facts and are
 * never hard-coded or recalculated here. If the backend cannot be reached we
 * say so and point at reception rather than printing a number we cannot stand
 * behind.
 */
async function loadPricingSummary(): Promise<{
  rows: PricingSummaryItem[];
  unreachable: boolean;
}> {
  try {
    const facts = await getVenueFacts();
    return { rows: facts.facts.pricing_summary, unreachable: false };
  } catch (error) {
    if (!isMvsaApiError(error)) throw error;
    return { rows: [], unreachable: true };
  }
}

export default async function Home() {
  const { rows: pricingRows, unreachable: pricingUnreachable } = await loadPricingSummary();

  const turfPricing = pricingRows.filter((row) => row.activity_id.startsWith('turf'));
  const meetingPricing = pricingRows.find((row) => row.activity_id === 'meeting_room');

  const programs = getAcademyPrograms().slice(0, 4);

  const heroHeadline = home.heroHeadline;
  const heroSubheading = home.heroSubheading;
  const heroTextAboveCta = home.heroTextAboveCta;
  const closingCtaHeadline = home.closingCtaHeadline;
  const instagramHandle = social.instagram;
  const tiktokHandle = social.tiktok;
  const [trustCard1, trustCard2, trustCard3] = home.trustCards;

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
          1. HERO - TEXT BESIDE THE PHOTOGRAPH

          Every photograph of the arena is portrait: these were taken on a
          phone held upright. Cropping one into a letterbox banner throws away
          most of the frame and softens what is left, which is what the old
          full-bleed background did. So the photograph keeps its own shape and
          the headline sits beside it on a wide screen, above it on a narrow
          one. One <Image>, no duplicate download per breakpoint.
          ============================================ */}
      <section className="relative z-10 pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 text-center lg:text-left space-y-8 animate-slide-up">
          {/* Headline - Cinzel, large, white, sharp */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-white leading-[0.95] text-balance">
            {renderHeadline(heroHeadline)}
          </h1>
          
          {/* Subheading - DM Sans, muted white, one line */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-white/75 max-w-xl mx-auto lg:mx-0 font-medium tracking-wide">
            {heroSubheading}
          </p>
          
          {/* Double CTAs - Stacked on Mobile, Side-by-Side on Desktop */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
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

          {/* The photograph, in its own proportions. object-contain would letterbox
              it; a 4:5 frame crops a little from top and bottom and no more. */}
          <div className="lg:col-span-5">
            <figure className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none overflow-hidden border border-white/10 bg-forest-light/20">
              <Image
                src={heroPhoto.src}
                alt="The covered pitch at Mountain View Sports Arena"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061a10]/55 via-transparent to-transparent" />
            </figure>
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
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">{trustCard1.title}</h4>
                <p className="font-sans text-xs text-white/50 leading-relaxed font-medium">
                  {trustCard1.description}
                </p>
              </div>
            </div>

            {/* Signal 2 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 p-6 bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">{trustCard2.title}</h4>
                <p className="font-sans text-xs text-white/50 leading-relaxed font-medium">
                  {trustCard2.description}
                </p>
              </div>
            </div>

            {/* Signal 3 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 p-6 bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">{trustCard3.title}</h4>
                <p className="font-sans text-xs text-white/50 leading-relaxed font-medium">
                  {trustCard3.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          3. PRICING TEASER (LIVE VENUE FACTS)
          ============================================ */}
      <section className="py-24 bg-transparent relative z-20">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Simple Arena Pricing
            </h2>
            <div className="w-12 h-1 bg-gold mx-auto rounded-none" />
          </div>

          {pricingUnreachable ? (
            <div className="max-w-2xl mx-auto p-8 border border-amber-500/30 bg-amber-500/5 text-left space-y-2" data-testid="pricing-unreachable">
              <p className="text-amber-300 text-xs font-bold uppercase tracking-widest">Live rates unavailable</p>
              <p className="text-charcoal-light text-sm font-medium leading-relaxed">
                {booking.unreachableNotice} For today&apos;s turf and meeting room rates, call reception on{' '}
                <a href={contact.bookingsPhoneHref} className="text-gold font-bold">{contact.bookingsPhone}</a>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left" data-testid="pricing-grid">
              {turfPricing.map((row) => (
                <div
                  key={`${row.activity_id}-${row.label}`}
                  className="p-6 border border-white/10 bg-card hover:border-gold transition-all duration-300 space-y-2"
                >
                  <span className="px-2.5 py-0.5 bg-white/5 text-[9px] font-mono font-bold uppercase text-white/80 border border-white/10 inline-block">
                    Turf hire
                  </span>
                  <h4 className="font-display font-bold text-base text-white uppercase tracking-wide">{row.label}</h4>
                  <p className="text-gold font-mono font-bold text-lg">{row.display}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-8">
            {/* Secondary Option line below cards */}
            {meetingPricing && (
              <p className="text-charcoal-light font-sans text-sm font-semibold tracking-wide">
                {meetingPricing.label}: {meetingPricing.display}
              </p>
            )}
            
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
            {programs.map((program) => {
              return (
                <div 
                  key={program.id}
                  className="bg-card border border-white/10 p-6 rounded-none flex flex-col justify-between min-w-[280px] md:min-w-0 h-[150px] shadow-sm hover:border-gold hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                      <span className="text-[9px] font-mono font-bold uppercase bg-white/10 px-2 py-0.5 text-white/80 border border-white/10">
                        {program.age_group}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base uppercase tracking-wide font-display">{program.name}</h4>
                      <p className="text-[10px] text-gold/60 font-medium uppercase tracking-widest mt-1.5 font-mono">
                        {program.schedule}
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
          5. THE ARENA, PHOTOGRAPHED
          ============================================ */}
      <section className="py-24 relative z-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              The Arena
            </h2>
            <p className="mt-3 font-sans text-sm sm:text-base text-white/70">
              Every photograph here was taken at Mountain View. Nothing is stock.
            </p>
          </div>

          {/* Columns rather than a grid: portrait and landscape frames sit
              together without cropping either into the wrong shape. */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
            {gallery.slice(0, GALLERY_ON_HOME).map((photo, i) => (
              <figure
                key={photo.src}
                className="mb-3 break-inside-avoid overflow-hidden border border-white/10 bg-forest-light/20"
              >
                <Image
                  src={photo.src}
                  alt="Mountain View Sports Arena"
                  width={photo.w}
                  height={photo.h}
                  loading={i < 4 ? 'eager' : 'lazy'}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          6. CLOSING CTA (DOMINANT GOLD BOOK NOW)
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
