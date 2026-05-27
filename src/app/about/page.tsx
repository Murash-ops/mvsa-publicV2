import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { 
  Heart, 
  Wifi, 
  Droplets, 
  Lock, 
  Users,
  MapPin,
  Clock
} from 'lucide-react';

export const revalidate = 0; // Prevent caching to ensure site content edits propagate immediately

export default async function AboutPage() {
  const supabase = await createClient();
  
  // Fetch dynamic copy from database site_content table
  const { data: contentData } = await supabase
    .from('site_content')
    .select('*')
    .eq('key', 'about_page')
    .single();

  const content = contentData?.value || {
    title: "THE HEART OF NAIROBI SPORTS",
    subtitle: "A premium recreational sanctuary dedicated to physical mastery, elite training, and community connection.",
    story_title: "Our Mission",
    story_text: "Mountain View Sports Arena (MVSA) was born from a simple vision: to create a world-class sports destination in the heart of our community.\n\nWe believe that sports have the power to transform lives—building character in youth, health in adults, and unity in communities. MVSA provides more than just a pitch; we provide an ecosystem where athletes of all levels can thrive and excel.",
    turf_spec: "100% Premium Synthetic Turf",
    security_spec: "24/7 Monitored Facility Security"
  };

  const amenities = [
    { icon: Wifi, title: "High-Speed WiFi", desc: "Free access for all players and visitors." },
    { icon: Droplets, title: "Clean Washrooms", desc: "Well-maintained toilets and changing rooms." },
    { icon: Lock, title: "Secure Lockers", desc: "Private storage for your peace of mind." },
    { icon: Users, title: "Meeting Hall", desc: "A versatile space for team meetings and events." },
  ];

  return (
    <main className="min-h-screen pt-32 pb-24 bg-surface text-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <header className="mb-20 space-y-6 text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-forest/5 border border-forest/12 rounded-none">
            <Heart className="w-4 h-4 text-gold" />
            <span className="text-forest text-[10px] font-bold uppercase tracking-[0.2em]">Our Story & Mission</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-forest tracking-tighter leading-[0.9] uppercase">
            The Heart of <br/>
            <span className="text-gold">Nairobi Sports</span>
          </h1>
          <p className="text-charcoal-light text-lg max-w-2xl font-medium mt-4">
            {content.subtitle}
          </p>
        </header>

        {/* Story Section - Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32 text-left">
          <div className="lg:col-span-7 relative h-[400px] lg:h-[600px] rounded-none overflow-hidden shadow-sm border border-forest/12">
            <Image 
              src="/images/hero_turf.jpeg" 
              alt="MVSA Arena Turf Facility" 
              fill 
              className="object-cover" 
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest/40 to-transparent" />
          </div>
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-display font-bold text-forest uppercase tracking-tight">{content.story_title}</h2>
              <p className="text-charcoal-light text-lg leading-relaxed font-medium whitespace-pre-line">
                {content.story_text}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-6 glass rounded-none border border-forest/12 bg-white">
                <p className="text-2xl font-display font-bold text-gold uppercase mb-1">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{content.turf_spec}</p>
              </div>
              <div className="p-6 glass rounded-none border border-forest/12 bg-white">
                <p className="text-2xl font-display font-bold text-gold uppercase mb-1">24/7</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{content.security_spec}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-display font-bold text-forest uppercase tracking-tight">The Premium Experience</h2>
            <p className="text-charcoal-light font-medium">We&apos;ve thought of every detail so you can focus on the game.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenities.map((item, i) => (
              <div key={i} className="group p-8 glass rounded-none border border-forest/12 hover:border-gold hover:shadow-gold-sm transition-all duration-300 hover:-translate-y-1 text-center spring-bounce bg-white">
                <div className="w-16 h-16 bg-forest/5 text-forest rounded-none flex items-center justify-center mx-auto mb-6 group-hover:bg-forest group-hover:text-white transition-colors duration-300 border border-forest/12">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-bold text-forest uppercase mb-3">{item.title}</h3>
                <p className="text-charcoal-light/80 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Facility Showcase Gallery */}
        <div className="space-y-12 text-left">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-display font-bold text-forest uppercase tracking-tight">Facility Tour & Showcase</h2>
            <div className="flex-1 h-px bg-forest/10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 1. Turf recreational */}
            <div className="relative rounded-none overflow-hidden border border-forest/12 group h-[320px]">
              <Image 
                src="/images/hero_turf.jpeg" 
                alt="Main Arena Turf - Recreational Play" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white z-10">
                <p className="font-display font-bold text-lg uppercase tracking-wider text-gold">Main Arena Turf</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/80">Recreational & Tournament Play</p>
              </div>
            </div>

            {/* 2. Turf academy */}
            <div className="relative rounded-none overflow-hidden border border-forest/12 group h-[320px]">
              <Image 
                src="/images/academy.jpeg" 
                alt="Main Arena - Youth Training (Conducted on Main Turf)" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white z-10">
                <p className="font-display font-bold text-lg uppercase tracking-wider text-gold">Main Arena - Youth Training</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/80">Academy Training (Held on Main Turf)</p>
              </div>
            </div>

            {/* 3. Meeting Hall */}
            <div className="relative rounded-none overflow-hidden border border-forest/12 group h-[320px]">
              <Image 
                src="/images/meeting_hall.jpeg" 
                alt="Meeting Hall strategist rooms" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white z-10">
                <p className="font-display font-bold text-lg uppercase tracking-wider text-gold">The Meeting Hall</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/80">Strategy & Team Gatherings</p>
              </div>
            </div>

            {/* 4. Washrooms / Changing Rooms Placeholder */}
            <div className="flex flex-col justify-between p-8 rounded-none border border-dashed border-gold/40 bg-gold/5 h-[320px] text-left hover:border-gold transition-all duration-300">
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 text-gold flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-display font-bold text-forest uppercase tracking-tight">Changing Rooms</h3>
                <p className="text-charcoal-light text-xs leading-relaxed font-medium">
                  Modern changing chambers, secure locker vaults, and fresh shower facilities.
                </p>
                <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 border border-gold/20">
                  Photo Placeholder
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
