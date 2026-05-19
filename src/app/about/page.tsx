import Image from 'next/image';
import { 
  History, 
  Target, 
  Heart, 
  Wifi, 
  Droplets, 
  Lock, 
  Coffee,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function AboutPage() {
  const amenities = [
    { icon: Wifi, title: "High-Speed WiFi", desc: "Free access for all players and visitors." },
    { icon: Droplets, title: "Clean Washrooms", desc: "Well-maintained toilets and changing rooms." },
    { icon: Lock, title: "Secure Lockers", desc: "Private storage for your peace of mind." },
    { icon: Users, title: "Meeting Hall", desc: "A versatile space for team meetings and events." },
  ];

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <header className="mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-forest/5 border border-forest/10 rounded-full">
            <Heart className="w-4 h-4 text-forest" />
            <span className="text-forest text-[10px] font-bold uppercase tracking-[0.2em]">Our Story & Mission</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-forest tracking-tighter leading-[0.9] italic">
            THE HEART OF <br/>
            <span className="text-gold">NAIROBI SPORTS.</span>
          </h1>
        </header>

        {/* Story Section - Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">
          <div className="lg:col-span-7 relative h-[400px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
            <Image src="/images/hero_turf.jpeg" alt="MVSA Arena" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest/40 to-transparent" />
          </div>
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-display font-bold text-forest italic">Our Mission</h2>
              <p className="text-charcoal-light text-lg leading-relaxed font-medium">
                Mountain View Sports Arena (MVSA) was born from a simple vision: to create a world-class sports destination in the heart of our community.
              </p>
            </div>
            <p className="text-charcoal-light leading-relaxed">
              We believe that sports have the power to transform lives—building character in youth, health in adults, and unity in communities. MVSA provides more than just a pitch; we provide an ecosystem where athletes of all levels can thrive.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-6 bg-surface rounded-2xl border border-border-color">
                <p className="text-2xl font-display font-bold text-forest italic mb-1">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Premium Turf</p>
              </div>
              <div className="p-6 bg-surface rounded-2xl border border-border-color">
                <p className="text-2xl font-display font-bold text-forest italic mb-1">24/7</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Secure Facility</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-display font-bold text-forest italic">The Premium Experience</h2>
            <p className="text-charcoal-light font-medium">We've thought of every detail so you can focus on the game.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenities.map((item, i) => (
              <div key={i} className="group p-8 bg-white rounded-3xl border border-border-color shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gold group-hover:text-forest transition-colors">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-bold text-forest italic mb-3">{item.title}</h3>
                <p className="text-charcoal-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Section - Masonry-like Layout */}
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-display font-bold text-forest italic">Facility Tour</h2>
            <div className="flex-1 h-px bg-border-color" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[800px] md:h-[600px]">
            <div className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden shadow-lg group">
              <Image src="/images/meeting_hall.jpeg" alt="Meeting Hall" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-forest/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-8 left-8 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <p className="font-display font-bold text-2xl italic tracking-tight">The Meeting Hall</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">Team Events & Strategy</p>
              </div>
            </div>
            <div className="md:col-span-4 grid grid-rows-2 gap-6">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-lg group">
                <Image src="/images/hero_turf.jpeg" alt="Turf" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-forest/20" />
              </div>
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-lg group">
                <Image src="/images/academy.jpeg" alt="Academy" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-forest/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
