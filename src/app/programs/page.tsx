'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { 
  Trophy, 
  Users, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight,
  Music,
  Sword,
  Target,
  Zap,
  Loader2,
  Sparkles,
  Star
} from 'lucide-react';
import EnrollmentFlow from '@/components/programs/EnrollmentFlow';

const catalogThemeStyles: Record<string, {
  cardBg: string;
  borderColor: string;
  titleFont: string;
  accentColor: string;
  btnGradient: string;
  badgeBg: string;
  overlay: string;
  pattern: string;
  glow: string;
  doubleBorder?: boolean;
}> = {
  football: {
    cardBg: 'bg-[#0c1809]/90 hover:bg-[#0f240d]/90',
    borderColor: 'border-[#22c55e]/20 hover:border-[#22c55e]/40',
    titleFont: 'font-sans font-black italic tracking-tighter uppercase',
    accentColor: 'text-[#22c55e]',
    btnGradient: 'from-[#22c55e] to-[#15803d] hover:from-[#4ade80] hover:to-[#22c55e] text-white',
    badgeBg: 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30',
    overlay: 'from-[#071704]/80 via-transparent to-transparent',
    pattern: 'turf-pattern opacity-10',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.05)] hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] shadow-pitch'
  },
  chess: {
    cardBg: 'bg-[#121417]/95 hover:bg-[#181a20]/95',
    borderColor: 'border-[#d4af37]/20 hover:border-[#d4af37]/45',
    titleFont: 'font-brand tracking-widest uppercase',
    accentColor: 'text-[#d4af37]',
    btnGradient: 'from-[#d4af37] to-[#aa841c] hover:from-[#f3e8ff] hover:to-[#d4af37] hover:text-[#121417] text-[#121417] font-black',
    badgeBg: 'bg-white/5 text-[#d4af37] border-[#d4af37]/35',
    overlay: 'from-[#0f1115]/80 via-transparent to-transparent',
    pattern: 'checkerboard-pattern opacity-15',
    glow: 'shadow-[0_0_20px_rgba(212,175,55,0.05)] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] shadow-pitch',
    doubleBorder: true
  },
  dance: {
    cardBg: 'bg-[#1f0f35]/85 hover:bg-[#2c0e3e]/85',
    borderColor: 'border-[#ec4899]/20 hover:border-[#ec4899]/40',
    titleFont: 'font-display font-black tracking-tight uppercase',
    accentColor: 'text-[#ec4899]',
    btnGradient: 'from-[#ec4899] to-[#a21caf] hover:from-[#f472b6] hover:to-[#ec4899] text-white',
    badgeBg: 'bg-[#ec4899]/20 text-[#f472b6] border-[#ec4899]/30',
    overlay: 'from-[#180928]/80 via-transparent to-transparent',
    pattern: 'bg-gradient-to-tr from-pink-500/5 via-transparent to-purple-600/5 opacity-50',
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.05)] hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] shadow-pitch'
  },
  fitness: {
    cardBg: 'bg-[#131418]/95 hover:bg-[#1a1b21]/95',
    borderColor: 'border-white/5 hover:border-[#f97316]/30',
    titleFont: 'font-mono tracking-tighter uppercase font-black italic',
    accentColor: 'text-[#f97316]',
    btnGradient: 'from-[#f97316] to-[#c2410c] hover:from-[#fdba74] hover:to-[#f97316] text-white',
    badgeBg: 'bg-white/5 text-[#f97316] border-white/10',
    overlay: 'from-[#0b0c0e]/80 via-transparent to-transparent',
    pattern: 'scanline-pattern opacity-10',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.05)] hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] shadow-pitch'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-white/10 border-t-gold rounded-full animate-spin" />
          <p className="font-display font-bold text-gold tracking-tight animate-pulse">Loading Programs...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <header className="mb-24 space-y-8 animate-slide-up relative">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-gold/10 rounded-full blur-[100px] -z-10" />
          
          <div className="inline-flex items-center gap-3 px-5 py-2.5 glass-gold rounded-2xl">
            <Trophy className="w-4 h-4 text-gold" />
            <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Elite Training & Fitness</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter leading-[0.85]">
            PROGRAMS & <br/>
            <span className="text-gold relative">
              ACADEMIES
              <div className="absolute -bottom-2 left-0 w-full h-2 bg-gold/10 rounded-full" />
            </span>
          </h1>
          
          <p className="text-charcoal-light text-xl max-w-2xl leading-relaxed font-medium opacity-80">
            Professional development pathways and high-performance fitness programs designed for the Mountain View community.
          </p>
        </header>

        {/* Kids Programs Section */}
        {kidsPrograms.length > 0 && (
          <div className="space-y-12 mb-40">
            <div className="flex items-center gap-6 animate-slide-up">
              <div className="w-12 h-1.5 bg-gold rounded-full" />
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">Youth Excellence</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-gold/10 to-transparent" />
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
                      glass rounded-[3rem] overflow-hidden flex flex-col
                      hover:-translate-y-3 transition-all duration-700 spring-bounce group
                      animate-slide-up ${staggerClass} relative border
                      ${styles.cardBg} ${styles.borderColor} ${styles.glow}
                      ${i === 0 ? 'lg:col-span-12 lg:flex-row shadow-pitch' : 'lg:col-span-6 shadow-pitch'}
                    `}
                  >
                    {/* Atmospheric pattern layer */}
                    <div className="absolute inset-0 -z-10 pointer-events-none rounded-[3rem] overflow-hidden">
                      <div className={`absolute inset-0 ${styles.pattern} mix-blend-overlay`} />
                      {styles.doubleBorder && (
                        <div className="absolute inset-[3px] border-4 border-double border-[#d4af37]/20 rounded-[2.8rem]" />
                      )}
                    </div>

                    <div className={`relative ${i === 0 ? 'lg:w-3/5 min-h-[450px]' : 'aspect-[16/10]'} overflow-hidden`}>
                      <Image 
                        src={program.image_url || '/images/academy.jpeg'} 
                        alt={program.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out filter brightness-95" 
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${styles.overlay} opacity-80`} />
                      
                      {/* Floating Info Badge */}
                      <div className="absolute bottom-6 left-6 flex gap-2">
                        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                          <Users className={`w-4 h-4 ${styles.accentColor}`} />
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">Ages 6-16</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-10 lg:p-14 flex-1 flex flex-col justify-between relative z-10">
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                          <div className="space-y-2">
                            <div className={`w-10 h-1 rounded-full ${styles.accentColor} opacity-40 bg-current`} />
                            <h3 className={`text-3xl lg:text-4xl text-white leading-tight ${styles.titleFont}`}>{program.name}</h3>
                          </div>
                        </div>

                        <p className="text-white/60 text-base mb-8 leading-relaxed font-medium">
                          {program.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                          <div className="flex items-center gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                            <Clock className={`w-5 h-5 ${styles.accentColor} animate-pulse`} />
                            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{formatSchedule(program.name, program.schedule)}</span>
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                            <Zap className={`w-5 h-5 ${styles.accentColor} animate-pulse`} />
                            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Elite Coaching</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex gap-4">
                        <button 
                          onClick={() => window.location.href = `/programs/${program.id}`}
                          className={`flex-1 inline-flex items-center justify-center gap-4 bg-gradient-to-r ${styles.btnGradient} px-10 py-5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:-translate-y-0.5 group/btn active:scale-95 spring-bounce shadow-md`}
                        >
                          Explore Program
                          <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
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
          <div className="space-y-12">
            <div className="flex items-center gap-6 animate-slide-up">
              <div className="w-12 h-1.5 bg-gold rounded-full" />
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">Active Fitness</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-gold/10 to-transparent" />
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
                      glass p-10 rounded-[2.5rem] border
                      hover:-translate-y-3 transition-all duration-700 spring-bounce group
                      animate-slide-up ${staggerClass} relative overflow-hidden
                      ${styles.cardBg} ${styles.borderColor} ${styles.glow}
                    `}
                  >
                    {/* Atmospheric pattern layer */}
                    <div className="absolute inset-0 -z-10 pointer-events-none rounded-[2.5rem] overflow-hidden">
                      <div className={`absolute inset-0 ${styles.pattern} mix-blend-overlay`} />
                      {styles.doubleBorder && (
                        <div className="absolute inset-[3px] border-4 border-double border-[#d4af37]/20 rounded-[2.3rem]" />
                      )}
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] -z-10 group-hover:bg-white/10 transition-colors" />
                    
                    <div className={`w-16 h-16 bg-white/5 ${styles.accentColor} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white group-hover:text-pitch transition-all duration-500 shadow-inner`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className={`text-2xl text-white mb-4 ${styles.titleFont}`}>{cls.name}</h3>
                    
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-3 text-xs font-bold text-white/60 uppercase tracking-widest">
                        <Clock className={`w-4 h-4 ${styles.accentColor}`} />
                        {formatSchedule(cls.name, cls.schedule)}
                      </div>
                    </div>

                    <button 
                      onClick={() => window.location.href = `/programs/${cls.id}`}
                      className={`group/join flex items-center justify-between w-full p-4 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-gradient-to-r ${styles.btnGradient} transition-all duration-500 active:scale-95 spring-bounce`}
                    >
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase">Explore Program</span>
                      <ArrowRight className="w-5 h-5 text-white/50 group-hover/join:translate-x-1 group-hover/join:text-white transition-all" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Community CTA Section */}
        <section className="mt-40 p-16 md:p-24 bg-forest-dark rounded-[4rem] relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay turf-pattern" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/20 rounded-full blur-[120px] group-hover:bg-gold/30 transition-all duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-forest/20 rounded-full blur-[120px]" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Partner With Us</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-tight uppercase">
              HAVE A VISION FOR <br/>
              <span className="text-gold">YOUR OWN PROGRAM?</span>
            </h2>
            
            <p className="text-white/50 text-xl font-medium leading-relaxed max-w-xl mx-auto">
              MVSA provides the ultimate platform for instructors to launch and scale their professional sports and fitness academies.
            </p>
            
            <div className="pt-6">
              <a 
                href={getWhatsAppUrl('Hosting a Program')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-gold hover:bg-white text-pitch px-12 py-6 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-gold/20 transition-all duration-500 hover:-translate-y-1.5 active:scale-95"
              >
                Launch Your Program
                <Sparkles className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {selectedProgram && (
        <EnrollmentFlow 
          program={selectedProgram} 
          onClose={() => setSelectedProgram(null)} 
        />
      )}
    </main>
  );
}
