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

export default function ProgramsPage() {
  const supabase = createClient();
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const kidsPrograms = programs.filter(p => p.type === 'academy');
  const fitnessClasses = programs.filter(p => p.type === 'fitness');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-forest border-t-gold rounded-full animate-spin" />
          <p className="font-display font-bold text-forest tracking-tight">Loading Programs...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 bg-surface/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <header className="mb-24 space-y-8 animate-slide-up relative">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-gold/10 rounded-full blur-[100px] -z-10" />
          
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-forest/5 border border-forest/10 rounded-2xl">
            <Trophy className="w-4 h-4 text-gold" />
            <span className="text-forest text-[10px] font-black uppercase tracking-[0.3em]">Elite Training & Fitness</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black text-forest tracking-tighter leading-[0.85]">
            PROGRAMS & <br/>
            <span className="text-gold relative">
              ACADEMIES
              <div className="absolute -bottom-2 left-0 w-full h-2 bg-forest/5 rounded-full" />
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
              <h2 className="text-3xl font-display font-black text-forest uppercase tracking-tight">Youth Excellence</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-forest/20 via-gold/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {kidsPrograms.map((program, i) => (
                <div 
                  key={program.id} 
                  className={`
                    bg-white/80 backdrop-blur-sm rounded-[3rem] border border-forest/5 overflow-hidden flex flex-col
                    hover:-translate-y-3 hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/20
                    transition-all duration-700 spring-bounce group
                    animate-slide-up
                    ${i === 0 ? 'lg:col-span-12 lg:flex-row shadow-xl' : 'lg:col-span-6 shadow-lg'}
                  `}
                >
                  <div className={`relative ${i === 0 ? 'lg:w-3/5 min-h-[450px]' : 'aspect-[16/10]'} overflow-hidden`}>
                    <Image 
                      src={program.image_url || '/images/academy.png'} 
                      alt={program.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent opacity-60" />
                    
                    {/* Floating Info Badge */}
                    <div className="absolute bottom-6 left-6 flex gap-2">
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gold" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Ages 6-16</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 lg:p-14 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-2">
                        <div className="w-10 h-1 bg-gold/30 rounded-full" />
                        <h3 className="text-3xl lg:text-4xl font-display font-black text-forest leading-tight uppercase tracking-tighter">{program.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="bg-forest/5 px-4 py-2 rounded-2xl border border-forest/10">
                          <p className="text-forest font-black text-2xl tracking-tighter font-mono leading-none">
                            KES {program.pricing_json?.session || 0}
                          </p>
                          <p className="text-[10px] font-black text-gold uppercase tracking-widest mt-1">Per Session</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-charcoal-light text-base mb-8 leading-relaxed font-medium">
                      {program.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-forest/5">
                        <Clock className="w-5 h-5 text-gold" />
                        <span className="text-xs font-bold text-forest uppercase tracking-wider">{program.schedule}</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-forest/5">
                        <Zap className="w-5 h-5 text-gold" />
                        <span className="text-xs font-bold text-forest uppercase tracking-wider">Elite Coaching</span>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-4">
                      <button 
                        onClick={() => setSelectedProgram(program)}
                        className="flex-1 inline-flex items-center justify-center gap-4 bg-forest hover:bg-forest-dark text-white px-10 py-5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 shadow-xl shadow-forest/20 group/btn"
                      >
                        Enroll Academy
                        <ArrowRight className="w-5 h-5 text-gold group-hover/btn:translate-x-2 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fitness Classes Section */}
        {fitnessClasses.length > 0 && (
          <div className="space-y-12">
            <div className="flex items-center gap-6 animate-slide-up">
              <div className="w-12 h-1.5 bg-gold rounded-full" />
              <h2 className="text-3xl font-display font-black text-forest uppercase tracking-tight">Active Fitness</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-forest/20 via-gold/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fitnessClasses.map((cls, i) => {
                const Icon = getIcon('fitness', cls.name);
                return (
                  <div 
                    key={cls.id}
                    className={`
                      bg-white/70 backdrop-blur-md p-10 rounded-[2.5rem] border border-forest/5 
                      hover:-translate-y-3 hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/20
                      transition-all duration-700 spring-bounce group
                      animate-slide-up relative overflow-hidden shadow-xl
                    `}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[4rem] -z-10 group-hover:bg-gold/10 transition-colors" />
                    
                    <div className="w-16 h-16 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-forest group-hover:text-gold transition-all duration-500 shadow-inner">
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-display font-black text-forest mb-4 uppercase tracking-tighter">{cls.name}</h3>
                    
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-3 text-xs font-bold text-charcoal-light/60 uppercase tracking-widest">
                        <Clock className="w-4 h-4 text-gold" />
                        {cls.schedule}
                      </div>
                      <div className="text-xl font-black text-forest font-mono tracking-tighter">
                        {cls.pricing_json?.session ? `KES ${cls.pricing_json.session}` : 'Coming Soon'}
                        <span className="text-[10px] font-black text-gold ml-2 uppercase tracking-widest">/ Session</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedProgram(cls)}
                      className="group/join flex items-center justify-between w-full p-4 bg-forest/5 rounded-2xl border border-forest/10 hover:bg-forest hover:text-white transition-all duration-500 active:scale-95"
                    >
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase">Secure Spot</span>
                      <ArrowRight className="w-5 h-5 text-gold group-hover/join:translate-x-1 transition-transform" />
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
