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
  Flame
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* ============================================
          1. HERO — "STADIUM TUNNEL" 
          ============================================ */}
      <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pitch via-forest-dark to-pitch z-0" />
        <div className="absolute inset-0 turf-pattern z-[1]" />
        
        {/* Gold spotlight glow */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-gold/8 rounded-full blur-[160px] z-[1]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-forest-light/10 rounded-full blur-[120px] z-[1]" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 pb-20 lg:pb-0">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-gold rounded-full animate-slide-up">
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">Nairobi&apos;s Premium Arena</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-white tracking-tighter leading-[0.9] animate-slide-up stagger-1">
              WHERE <span className="text-gold">WARRIORS</span> <br/>
              COME TO PLAY.
            </h1>
            
            <p className="text-white/50 text-lg md:text-xl max-w-xl leading-relaxed font-medium animate-slide-up stagger-2">
              Experience 5-aside football on professional turf with premium amenities. From elite academy training to casual kickabouts, MVSA is your home for sports.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-5 pt-4 animate-slide-up stagger-3">
              <Link 
                href="/book" 
                className="w-full sm:w-auto bg-gold hover:bg-gold-muted text-pitch px-10 py-5 rounded-2xl font-bold text-lg tracking-widest uppercase transition-all duration-300 shadow-gold-lg active:scale-95 flex items-center justify-center gap-3 spring-bounce"
              >
                <CalendarDays className="w-6 h-6" />
                Book a Pitch
              </Link>
              <Link 
                href="/programs" 
                className="w-full sm:w-auto group flex items-center justify-center sm:justify-start gap-3 text-white/80 hover:text-white font-bold tracking-widest uppercase text-sm py-5 transition-colors"
              >
                Explore Programs
                <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-2 transition-transform duration-300 spring-bounce" />
              </Link>
            </div>
          </div>
          
          {/* Right Image (Asymmetric) */}
          <div className="lg:col-span-5 relative lg:h-[70vh] animate-slide-up stagger-4">
            <div className="absolute -inset-4 border border-gold/15 rounded-[2.5rem] rotate-3 hidden lg:block" />
            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-pitch/80 border border-white/5 rotate-1 hover:rotate-0 transition-transform duration-700 spring-bounce">
              <Image 
                src="/images/hero_turf.png" 
                alt="MVSA Premium Football Turf" 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pitch/90 via-pitch/20 to-transparent" />
              
              {/* Floating Info Card */}
              <div className="absolute bottom-8 left-8 right-8 glass rounded-2xl p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold text-lg">Main 5-Aside Turf</p>
                    <p className="text-gold text-xs font-bold uppercase tracking-widest">Available Now</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-bold uppercase">From</p>
                    <p className="text-white font-bold text-xl font-mono">KES 1,500</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent z-[5]" />
      </section>

      {/* ============================================
          2. STATS — ZIG-ZAG LAYOUT 
          ============================================ */}
      <section className="py-24 bg-surface relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Trophy, label: 'Professional', value: 'Turf', color: 'text-gold', offset: '' },
              { icon: Zap, label: 'Night Games', value: 'Floodlights', color: 'text-blue-400', offset: 'lg:translate-y-6' },
              { icon: Users, label: 'Youth', value: 'Academy', color: 'text-emerald-500', offset: '' },
              { icon: MapPin, label: 'Location', value: 'Kangemi', color: 'text-rose-400', offset: 'lg:translate-y-6' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`
                  bg-white p-8 rounded-3xl border border-border-color 
                  hover:shadow-gold-md hover:-translate-y-1 
                  transition-all duration-500 spring-bounce group
                  animate-slide-up stagger-${i + 1}
                  ${stat.offset}
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${stat.color} bg-current/10 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-2xl font-display font-bold text-forest tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          3. PRICING — ASYMMETRIC BENTO 
          ============================================ */}
      <section className="py-24 bg-white overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-gold/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-forest/5 rounded-full blur-[80px]" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Image Grid */}
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="aspect-[4/5] relative rounded-3xl overflow-hidden shadow-xl group">
                    <div className="absolute inset-0 bg-forest/10 group-hover:bg-forest/5 transition-colors duration-500 z-10" />
                    <Image src="/images/hero_turf.png" alt="Professional football turf close-up" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="bg-pitch p-6 rounded-3xl text-white relative overflow-hidden">
                    <div className="turf-pattern absolute inset-0" />
                    <div className="relative z-10">
                      <p className="text-gold font-bold text-2xl tracking-tight mb-1 font-display">KES 1,500</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Off-Peak Rate</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gold p-6 rounded-3xl text-pitch relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-4 h-4 text-pitch/60" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-pitch/60">Peak Hour Rate</p>
                      </div>
                      <p className="font-bold text-2xl tracking-tight font-display">KES 2,000</p>
                    </div>
                  </div>
                  <div className="aspect-[4/5] relative rounded-3xl overflow-hidden shadow-xl group">
                    <div className="absolute inset-0 bg-forest/10 group-hover:bg-forest/5 transition-colors duration-500 z-10" />
                    <Image src="/images/lounge.png" alt="MVSA lounge area" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-4xl md:text-6xl font-display font-extrabold text-forest leading-[0.9]">
                PITCH PERFECT <br/>
                <span className="text-gold">PRICING.</span>
              </h2>
              <p className="text-charcoal-light text-lg leading-relaxed font-medium">
                We offer the most competitive rates in Nairobi for professional-grade turf. Whether you&apos;re booking for a casual 5-aside match or a corporate event, we have a slot for you.
              </p>
              
              <div className="space-y-3">
                {[
                  { icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-50', title: 'Free Water & Showers', desc: 'Stay hydrated and refreshed after your game.' },
                  { icon: Wifi, color: 'text-forest', bg: 'bg-forest/5', title: 'Free High-Speed WiFi', desc: 'Share your goals instantly with our arena WiFi.' },
                  { icon: Lock, color: 'text-gold', bg: 'bg-gold/10', title: 'Secure Changing Rooms', desc: 'Your belongings are safe with our locker system.' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border-color hover:border-gold/30 hover:bg-white transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-forest">{item.title}</p>
                      <p className="text-xs text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          4. CTA — DARK IMMERSIVE 
          ============================================ */}
      <section className="py-28 bg-gradient-to-br from-pitch via-forest-dark to-pitch relative overflow-hidden">
        <div className="absolute inset-0 turf-pattern" />
        
        {/* Radial spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gold/6 rounded-full blur-[150px] z-0" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-7xl font-display font-extrabold text-white tracking-tighter leading-tight">
            READY TO <span className="text-gold">DOMINATE</span> <br/>
            THE PITCH?
          </h2>
          <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Book your hourly slot now and get instant confirmation via M-Pesa. No calls, no waiting, just play.
          </p>
          <div className="pt-6">
            <Link 
              href="/book" 
              className="inline-flex bg-gold hover:bg-gold-muted text-pitch px-12 py-6 rounded-2xl font-bold text-xl tracking-widest uppercase transition-all duration-300 shadow-gold-lg active:scale-95 items-center gap-4 spring-bounce"
            >
              <CalendarDays className="w-7 h-7" />
              Secure Your Slot
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
