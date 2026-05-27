'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { 
  Trophy, 
  Users, 
  Clock, 
  ArrowRight, 
  Music, 
  Sword, 
  Target, 
  Zap, 
  Sparkles,
  CalendarDays
} from 'lucide-react';

const catalogThemeStyles: Record<string, {
  cardBg: string;
  borderColor: string;
  titleFont: string;
  accentColor: string;
  btnGradient: string;
  badgeBg: string;
  overlay: string;
  glow: string;
}> = {
  football: {
    cardBg: 'bg-white hover:bg-white',
    borderColor: 'border-forest/12 hover:border-gold',
    titleFont: 'font-sans font-black italic tracking-tighter uppercase',
    accentColor: 'text-forest',
    btnGradient: 'from-forest to-forest-dark hover:from-forest-light hover:to-forest text-white',
    badgeBg: 'bg-forest/5 text-forest border-forest/12',
    overlay: 'from-black/60 via-black/25 to-transparent',
    glow: 'shadow-sm hover:shadow-gold-md shadow-pitch'
  },
  chess: {
    cardBg: 'bg-white hover:bg-white',
    borderColor: 'border-forest/12 hover:border-gold',
    titleFont: 'font-brand tracking-widest uppercase',
    accentColor: 'text-gold',
    btnGradient: 'from-gold to-gold-deep hover:from-gold-muted hover:to-gold text-forest-dark font-black',
    badgeBg: 'bg-gold/5 text-gold border-gold/15',
    overlay: 'from-black/60 via-black/25 to-transparent',
    glow: 'shadow-sm hover:shadow-gold-md shadow-pitch'
  },
  dance: {
    cardBg: 'bg-white hover:bg-white',
    borderColor: 'border-forest/12 hover:border-gold',
    titleFont: 'font-display font-black tracking-tight uppercase',
    accentColor: 'text-forest',
    btnGradient: 'from-forest to-forest-dark hover:from-forest-light hover:to-forest text-white',
    badgeBg: 'bg-forest/5 text-forest border-forest/12',
    overlay: 'from-black/60 via-black/25 to-transparent',
    glow: 'shadow-sm hover:shadow-gold-md shadow-pitch'
  },
  fitness: {
    cardBg: 'bg-white hover:bg-white',
    borderColor: 'border-forest/12 hover:border-gold',
    titleFont: 'font-mono tracking-tighter uppercase font-black italic',
    accentColor: 'text-forest',
    btnGradient: 'from-forest to-forest-dark hover:from-forest-light hover:to-forest text-white',
    badgeBg: 'bg-forest/5 text-forest border-forest/12',
    overlay: 'from-black/60 via-black/25 to-transparent',
    glow: 'shadow-sm hover:shadow-gold-md shadow-pitch'
  }
};

const getTheme = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('football') || lowerName.includes('soccer')) return 'football';
  if (lowerName.includes('chess')) return 'chess';
  if (lowerName.includes('dance') || lowerName.includes('ballet')) return 'dance';
  return 'fitness';
};

export default function ProgramsPage() {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const whatsappNumber = "254798258950";
  
  useEffect(() => {
    async function fetchPrograms() {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true });

      if (!error && data) {
        setPrograms(data);
      }
      setIsLoading(false);
    }

    fetchPrograms();
  }, []);

  const getWhatsAppUrl = (program: string) => {
    const msg = `Hi MVSA! I'd like to register for the ${program} program. Please send me more details.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  const getIcon = (type: string, name: string) => {
    if (type === 'academy') return Trophy;
    if (name.includes('Zumba')) return Music;
    if (name.includes('Boxing')) return Target;
    if (name.includes('Martial')) return Sword;
    return Zap;
  };

  const formatSchedule = (name: string, defaultSchedule: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('football') || lowerName.includes('soccer')) {
      return 'Saturday and Sunday';
    }
    if (lowerName.includes('chess') || lowerName.includes('dance')) {
      return 'Saturday';
    }
    return defaultSchedule;
  };

  const kidsPrograms = programs.filter(p => p.type === 'academy');
  const fitnessClasses = programs.filter(p => p.type === 'fitness');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-forest/10 border-t-gold rounded-full animate-spin" />
          <p className="font-display font-bold text-gold tracking-tight animate-pulse">Loading Programs...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 bg-surface text-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <header className="mb-24 space-y-8 animate-slide-up relative text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-forest/5 border border-forest/12 rounded-none">
            <Trophy className="w-4 h-4 text-forest" />
            <span className="text-forest text-[10px] font-black uppercase tracking-[0.3em]">Elite Training & Fitness</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black text-forest tracking-tighter leading-[0.85] uppercase">
            Programs & <br/>
            <span className="text-gold">Academies</span>
          </h1>
          
          <p className="text-charcoal-light text-xl max-w-2xl leading-relaxed font-medium">
            Professional development pathways and high-performance fitness programs designed for the Mountain View community.
          </p>
        </header>

        {/* Kids Programs Section */}
        {kidsPrograms.length > 0 && (
          <div className="space-y-12 mb-40 text-left">
            <div className="flex items-center gap-6 animate-slide-up">
              <div className="w-12 h-1.5 bg-gold rounded-none" />
              <h2 className="text-3xl font-display font-black text-forest uppercase tracking-tight">Youth Excellence</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-forest/10 via-gold/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {kidsPrograms.map((program, i) => {
                const pTheme = getTheme(program.name);
                const styles = catalogThemeStyles[pTheme];
                const staggerClass = `stagger-${(i % 4) + 1}`;
                return (
                  <div 
                    key={program.id} 
                    className={`
                      glass rounded-none overflow-hidden flex flex-col
                      hover:-translate-y-2 transition-all duration-300 spring-bounce group
                      animate-slide-up ${staggerClass} border
                      ${styles.cardBg} ${styles.borderColor} ${styles.glow}
                      ${i === 0 ? 'lg:col-span-12 lg:flex-row shadow-pitch' : 'lg:col-span-6 shadow-pitch'}
                    `}
                  >
                    <div className={`relative ${i === 0 ? 'lg:w-3/5 min-h-[450px]' : 'aspect-[16/10]'} overflow-hidden rounded-none`}>
                      <Image 
                        src={program.image_url || '/images/academy.jpeg'} 
                        alt={program.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out filter brightness-95" 
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                      
                      {/* Floating Info Badge */}
                      <div className="absolute bottom-6 left-6 flex gap-2">
                        <div className="bg-forest/90 backdrop-blur-md px-4 py-2 rounded-none border border-gold/30 flex items-center gap-2">
                          <Users className="w-4 h-4 text-gold" />
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">Ages 6-16</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-10 lg:p-14 flex-1 flex flex-col justify-between relative z-10 bg-white">
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                          <div className="space-y-2">
                            <div className="w-10 h-1 bg-gold rounded-none" />
                            <h3 className="text-3xl lg:text-4xl text-forest leading-tight font-display font-bold uppercase">{program.name}</h3>
                          </div>
                        </div>

                        <p className="text-charcoal-light text-base mb-8 leading-relaxed font-medium">
                          {program.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                          <div className="flex items-center gap-3 p-4 bg-forest/5 border border-forest/12 rounded-none">
                            <Clock className="w-5 h-5 text-forest animate-pulse" />
                            <span className="text-xs font-bold text-charcoal-light uppercase tracking-wider">{formatSchedule(program.name, program.schedule)}</span>
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-forest/5 border border-forest/12 rounded-none">
                            <Zap className="w-5 h-5 text-forest animate-pulse" />
                            <span className="text-xs font-bold text-charcoal-light uppercase tracking-wider">Elite Coaching</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex gap-4">
                        <button 
                          onClick={() => window.location.href = `/programs/${program.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-4 bg-forest hover:bg-forest-dark text-white px-10 py-5 rounded-none font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:-translate-y-0.5 active:scale-95 spring-bounce shadow-sm border border-forest"
                        >
                          Explore Program
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fitness Classes Section */}
        {fitnessClasses.length > 0 && (
          <div className="space-y-12 text-left">
            <div className="flex items-center gap-6 animate-slide-up">
              <div className="w-12 h-1.5 bg-gold rounded-none" />
              <h2 className="text-3xl font-display font-black text-forest uppercase tracking-tight">Active Fitness</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-forest/10 via-gold/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fitnessClasses.map((cls, i) => {
                const pTheme = getTheme(cls.name);
                const styles = catalogThemeStyles[pTheme];
                const Icon = getIcon('fitness', cls.name);
                const staggerClass = `stagger-${(i % 4) + 1}`;
                return (
                  <div 
                    key={cls.id}
                    className={`
                      glass p-10 rounded-none border
                      hover:-translate-y-2 transition-all duration-300 spring-bounce group
                      animate-slide-up ${staggerClass} relative overflow-hidden bg-white
                      ${styles.borderColor} ${styles.glow}
                    `}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-forest/5 rounded-bl-[4rem] -z-10 group-hover:bg-forest/10 transition-colors" />
                    
                    <div className="w-16 h-16 bg-forest/5 text-forest rounded-none flex items-center justify-center mb-8 group-hover:scale-105 group-hover:bg-forest group-hover:text-white transition-all duration-300 border border-forest/12">
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl text-forest mb-4 font-display font-bold uppercase">{cls.name}</h3>
                    
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-3 text-xs font-bold text-charcoal-light uppercase tracking-widest">
                        <Clock className="w-4 h-4 text-gold" />
                        {formatSchedule(cls.name, cls.schedule)}
                      </div>
                    </div>

                    <button 
                      onClick={() => window.location.href = `/programs/${cls.id}`}
                      className="group/join flex items-center justify-between w-full p-4 bg-white border border-forest/12 rounded-none hover:bg-forest hover:text-white hover:border-forest transition-all duration-300 active:scale-95 spring-bounce"
                    >
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase text-forest group-hover/join:text-white">Explore Program</span>
                      <ArrowRight className="w-5 h-5 text-forest group-hover/join:translate-x-1 group-hover/join:text-white transition-all" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Community CTA Section */}
        <section className="mt-40 p-16 md:p-24 bg-forest-dark rounded-none relative overflow-hidden group shadow-2xl text-center">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay turf-pattern" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/20 rounded-full blur-[120px] group-hover:bg-gold/30 transition-all duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-forest/20 rounded-full blur-[120px]" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 rounded-none border border-white/10">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Partner With Us</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-tight uppercase">
              Have a vision for <br/>
              <span className="text-gold">your own program?</span>
            </h2>
            
            <p className="text-white/70 text-xl font-medium leading-relaxed max-w-xl mx-auto">
              MVSA provides the ultimate platform for instructors to launch and scale their professional sports and fitness academies.
            </p>
            
            <div className="pt-6">
              <a 
                href={getWhatsAppUrl('Hosting a Program')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-gold hover:bg-white text-forest-dark px-12 py-6 rounded-none font-bold text-xs tracking-[0.2em] uppercase shadow-2xl shadow-gold/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              >
                Launch Your Program
                <Sparkles className="w-5 h-5 text-forest-dark" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
