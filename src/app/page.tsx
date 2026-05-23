import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Trophy, 
  Users, 
  Zap, 
  Wifi, 
  Droplets, 
  Lock, 
  MapPin,
  CalendarDays,
  Shield,
  Flame,
  Activity,
  Compass
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-forest-dark">
      {/* Background Mesh Overlays */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-gold/5 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-forest-light/10 blur-[140px] pointer-events-none -z-10" />
      
      {/* ============================================
          1. HERO — ASYMMETRIC EDITORIAL LAYOUT
          ============================================ */}
      <section className="relative min-h-[100dvh] flex items-center pt-28 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-10 text-left">
            <div className="inline-flex items-center gap-2.5 px-4.5 py-2 glass-gold rounded-full animate-slide-up border border-gold/15 shadow-gold-sm">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span className="text-gold text-[9px] font-black uppercase tracking-[0.25em]">Nairobi&apos;s Premium Arena</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-black text-white tracking-tighter leading-[0.85] animate-slide-up stagger-1 uppercase">
              HOME OF <br/>
              <span className="capsule-inline mx-2 border border-gold/20 align-middle shadow-gold-sm">
                <Image 
                  src="/images/hero_turf.jpeg" 
                  fill 
                  className="object-cover scale-105" 
                  alt="Premium Turf Capsule" 
                />
              </span>
              <span className="text-gold">FOOTBALL</span> <br/>
              AND FITNESS.
            </h1>
            
            <p className="text-charcoal-light/75 text-lg md:text-xl max-w-xl leading-relaxed font-medium animate-slide-up stagger-2">
              Experience professional-grade 5-aside football on elite turf with premium stadium amenities. From dynamic youth academies to corporate leagues, MVSA delivers Nairobi&apos;s ultimate sports venue.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2 animate-slide-up stagger-3 w-full sm:w-auto">
              <Link 
                href="/book" 
                className="w-full sm:w-auto bg-gradient-to-r from-gold to-gold-muted hover:from-white hover:to-white text-forest px-10 py-5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 shadow-gold-md hover:shadow-gold-lg active:scale-95 flex items-center justify-center gap-3 spring-bounce btn-premium"
              >
                <CalendarDays className="w-5 h-5 stroke-[2.5px]" />
                Book a Pitch
              </Link>
              <Link 
                href="/programs" 
                className="w-full sm:w-auto group flex items-center justify-center sm:justify-start gap-3 text-white/60 hover:text-gold font-black tracking-[0.2em] uppercase text-xs py-5 transition-all duration-300"
              >
                Explore Programs
                <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-2 transition-transform duration-500 spring-bounce" />
              </Link>
            </div>
          </div>
          
          {/* Right Column: Premium Dashboard Frame */}
          <div className="lg:col-span-5 relative lg:h-[65vh] w-full flex items-center justify-center animate-slide-up stagger-4">
            <div className="absolute -inset-4 border border-gold/10 rounded-[3rem] rotate-3 hidden lg:block" />
            <div className="relative h-[450px] lg:h-full w-full rounded-[2.8rem] overflow-hidden shadow-2xl border border-white/5 rotate-1 hover:rotate-0 transition-all duration-[800ms] spring-bounce group">
              <Image 
                src="/images/hero_turf.jpeg" 
                alt="MVSA Premium Football Turf" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[2500ms] ease-out filter brightness-95"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/95 via-forest-dark/10 to-transparent" />
              
              {/* Immersive Float Info Panel */}
              <div className="absolute bottom-6 inset-x-6 glass p-6 rounded-2xl border border-white/10 flex justify-between items-center backdrop-blur-xl">
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-wider">Main 5-Aside Turf</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-gold text-[10px] font-black uppercase tracking-widest">Pitches Open Today</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[8px] font-black uppercase tracking-wider">Starting From</p>
                  <p className="text-gold font-black text-lg font-mono">KES 1,500</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Transition Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-forest-dark to-transparent z-[5] pointer-events-none" />
      </section>

      {/* ============================================
          2. THE COCKPIT — ASYMMETRIC BENTO GRID
          ============================================ */}
      <section className="py-28 relative overflow-hidden bg-forest-dark/30">
        <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full bg-gold/3 blur-[150px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 space-y-16">
          
          {/* Section Header */}
          <div className="space-y-6 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-gold rounded-xl">
              <Activity className="w-3.5 h-3.5 text-gold" />
              <span className="text-gold text-[9px] font-black uppercase tracking-[0.25em]">Premium Infrastructure</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-[0.9] uppercase">
              THE VENUE OF <br/>
              <span className="text-gold">CHAMPIONS.</span>
            </h2>
            <p className="text-charcoal-light/70 text-lg font-medium leading-relaxed">
              Every detail is meticulously crafted to support peak athletic performance, visual clarity, and client comfort. Explore what makes MVSA Nairobi&apos;s leading sports arena.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[250px]">
            
            {/* Tile 1: Professional Turf (Large - 8cols x 2rows) */}
            <div className="md:col-span-12 lg:col-span-8 md:row-span-2 bento-tile rounded-[2.5rem] overflow-hidden relative flex flex-col justify-end p-10 group">
              <div className="absolute inset-0 z-0">
                <Image 
                  src="/images/academy.jpeg" 
                  alt="Elite youth squad on premium turf" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out filter brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/95 via-forest-dark/30 to-transparent" />
              </div>
              
              <div className="relative z-10 space-y-4 max-w-xl">
                <span className="bg-emerald-500/20 text-[#4ade80] border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                  PROFESSIONAL SPECIFICATIONS
                </span>
                <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight">
                  High-Performance Synthetic Turf
                </h3>
                <p className="text-white/60 text-sm leading-relaxed font-medium">
                  Engineered for high shock absorption, clean ball dynamics, and secure pivot traction. Reduces stress on joints and enables competitive play under all weather conditions.
                </p>
              </div>
            </div>

            {/* Tile 2: Night Games Floodlights (4cols x 1row) */}
            <div className="md:col-span-6 lg:col-span-4 md:row-span-1 bento-tile rounded-[2.5rem] p-8 flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 stroke-[2px]" />
                </div>
                <span className="text-[9px] text-[#4ade80] font-black uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">ILLUMINATION System</p>
                <h4 className="text-lg font-display font-black text-white uppercase tracking-tight">High-Intensity Floodlights</h4>
                <p className="text-white/50 text-xs font-medium mt-1 leading-normal">
                  Professional vertical grid lighting for shadow-free play up to 10 PM.
                </p>
              </div>
            </div>

            {/* Tile 3: Youth Academy Development (4cols x 1row) */}
            <div className="md:col-span-6 lg:col-span-4 md:row-span-1 bento-tile rounded-[2.5rem] p-8 flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 stroke-[2px]" />
                </div>
                <span className="text-[9px] text-gold font-black uppercase tracking-widest bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
                  AGES 6-16
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">ACADEMY DEVELOPMENT</p>
                <h4 className="text-lg font-display font-black text-white uppercase tracking-tight">Elite Youth Training</h4>
                <p className="text-white/50 text-xs font-medium mt-1 leading-normal">
                  Expert-led structured coaching pathways for Football, Chess, and Dance.
                </p>
              </div>
            </div>
            
            {/* Tile 4: Premium Amenities Dashboard (12cols x 1row) */}
            <div className="md:col-span-12 lg:col-span-12 md:row-span-1 bento-tile rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-gold/3 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="space-y-3 max-w-md">
                <span className="text-gold text-[9px] font-black uppercase tracking-[0.25em] block">Exclusive Player Conveniences</span>
                <h4 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight">Fully Equipped Player Clubhouse</h4>
                <p className="text-white/50 text-sm font-medium leading-relaxed">
                  Every booking and academy session includes access to secure digital lockers, hot shower enclosures, high-speed stadium WiFi, and mineral hydration logs.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto shrink-0">
                {[
                  { icon: Droplets, color: 'text-sky-400', label: 'Showers & Water' },
                  { icon: Wifi, color: 'text-gold', label: 'Arena High-Speed WiFi' },
                  { icon: Lock, color: 'text-gold-muted', label: 'Secure Lockers' },
                  { icon: MapPin, color: 'text-rose-400', label: 'Nairobi Highway Links' }
                ].map((amenity, index) => (
                  <div key={index} className="glass p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-3 hover:border-gold/30 transition-all duration-300">
                    <amenity.icon className={`w-6 h-6 ${amenity.color}`} />
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-wider">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================
          3. PRICING — HIGH-DENSITY GLASS TICKETS
          ============================================ */}
      <section className="py-28 overflow-hidden relative">
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-forest-light/8 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Visual Frame Block */}
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-16">
                  <div className="aspect-[4/5] relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 group">
                    <div className="absolute inset-0 bg-forest-dark/20 group-hover:bg-forest-dark/5 transition-colors duration-500 z-10" />
                    <Image 
                      src="/images/hero_turf.jpeg" 
                      alt="Premium stadium turf view" 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                    />
                  </div>
                  
                  {/* High Density Monospace Rate Tile */}
                  <div className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-gold font-black text-2xl tracking-tight mb-1 font-mono">KES 1,500</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Off-Peak / Hourly Slot</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* High Density Active Rate Tile */}
                  <div className="glass-gold p-8 rounded-3xl border border-gold/20 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-3.5 h-3.5 text-gold animate-pulse" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-gold/80">Peak Hours (Sat/Sun/Nights)</p>
                      </div>
                      <p className="font-black text-2xl tracking-tight font-mono text-white">KES 2,000</p>
                    </div>
                  </div>
                  
                  <div className="aspect-[4/5] relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 group">
                    <div className="absolute inset-0 bg-forest-dark/20 group-hover:bg-forest-dark/5 transition-colors duration-500 z-10" />
                    <Image 
                      src="/images/meeting_hall.jpeg" 
                      alt="MVSA executive player spaces" 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rates Description & Features Column */}
            <div className="space-y-8 order-1 lg:order-2 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-gold rounded-xl">
                <Compass className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold text-[9px] font-black uppercase tracking-[0.25em]">Rates & Bookings</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[0.9] uppercase">
                CALIBRATED <br/>
                <span className="text-gold">PITCH TARIFFS.</span>
              </h2>
              <p className="text-charcoal-light/75 text-lg leading-relaxed font-medium">
                We maintain honest, transparent, and competitive pricing across all timeslots in Nairobi. Secure digital confirmation is sent instantly upon booking validation via M-Pesa.
              </p>
              
              <div className="space-y-4 pt-4">
                {[
                  { title: "Standard Off-Peak Hour", hours: "Mon to Fri (6 AM - 5 PM)", price: "KES 1,500" },
                  { title: "Premium Peak Hour", hours: "Nights (5 PM - 10 PM) & All Weekends", price: "KES 2,000" }
                ].map((tier, index) => (
                  <div key={index} className="flex justify-between items-center p-6 rounded-2xl glass border border-white/5 hover:border-gold/30 transition-all duration-300">
                    <div>
                      <p className="font-black text-white text-sm uppercase tracking-wide">{tier.title}</p>
                      <p className="text-xs text-white/40 mt-1 font-medium">{tier.hours}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-black text-xl font-mono">{tier.price}</p>
                      <p className="text-[8px] text-white/30 font-black uppercase tracking-wider">Per Hour Slot</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================
          4. CALL TO ACTION — DARK IMMERSIVE
          ============================================ */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-forest-dark to-[#030d07]">
        {/* Soft centered spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-10">
          <div className="inline-flex items-center gap-2.5 px-4.5 py-2 glass-gold rounded-full border border-gold/15 shadow-gold-sm">
            <Trophy className="w-3.5 h-3.5 text-gold" />
            <span className="text-gold text-[9px] font-black uppercase tracking-[0.25em]">Reserve Your Slot</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter leading-none uppercase">
            READY TO DOMINATE <br/>
            <span className="text-gold">THE TURF?</span>
          </h2>
          
          <p className="text-charcoal-light/70 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Lock in your hourly slot on Nairobi&apos;s leading synthetic surface. Rapid confirmation, secure player access, and state-of-the-art facilities await your squad.
          </p>
          
          <div className="pt-6">
            <Link 
              href="/book" 
              className="inline-flex bg-gradient-to-r from-gold to-gold-muted hover:from-white hover:to-white text-forest px-12 py-6 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 shadow-gold-lg hover:-translate-y-1 active:scale-95 items-center gap-4 spring-bounce btn-premium"
            >
              <CalendarDays className="w-5 h-5 stroke-[2.5px]" />
              Secure Your Slot Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
