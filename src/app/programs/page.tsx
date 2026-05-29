'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trophy, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsPage() {
  const supabase = createClient();
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (!error && data) {
          setPrograms(data);
        }
      } catch (err) {
        console.error('Error fetching programs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  const getPriceLabel = (pricingJson: any) => {
    if (!pricingJson) return 'KES 1,500 / Session';
    const term = pricingJson.term;
    const monthly = pricingJson.monthly;
    const session = pricingJson.session;
    
    if (term) return `KES ${term.toLocaleString()} / Term`;
    if (monthly) return `KES ${monthly.toLocaleString()} / Month`;
    if (session) return `KES ${session.toLocaleString()} / Session`;
    return 'KES 1,500 / Session';
  };

  const getAgeLevel = (program: any) => {
    // If program is academy, it is for kids; if fitness, for adults
    if (program.type === 'academy') {
      return program.schedule?.includes('Ages') ? program.schedule : 'Ages 6 - 16';
    }
    return 'Ages 16+ / Adults';
  };

  const youthAcademies = programs.filter(p => p.type === 'academy');
  const fitnessWellness = programs.filter(p => p.type !== 'academy');

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
    <main className="min-h-screen pt-32 pb-24 bg-transparent text-charcoal text-left">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <header className="mb-20 space-y-6 animate-slide-up relative">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 border border-white/10 rounded-none">
            <Trophy className="w-4 h-4 text-white" />
            <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Elite Academies & Fitness</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter leading-[0.85] uppercase">
            Programs & <br/>
            <span className="text-gold">Academies</span>
          </h1>
          
          <p className="text-charcoal-light text-base md:text-lg max-w-2xl leading-relaxed font-medium">
            Discover specialized development tracks for kids and high-intensity workout options for adults at Nairobi&apos;s leading sports arena.
          </p>
        </header>

        {/* Section 1: Youth Academies */}
        <section className="space-y-8 text-left">
          <div className="space-y-1 border-b border-white/5 pb-4">
            <h2 className="text-3xl font-brand font-bold text-gold uppercase tracking-wider">
              YOUTH ACADEMIES
            </h2>
            <p className="text-sm text-charcoal-light font-medium tracking-wide">
              Structured development programs for ages 6–16
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {youthAcademies.map((program, i) => {
              const staggerClass = `stagger-${(i % 3) + 1}`;
              return (
                <div 
                  key={program.id}
                  className={`
                    bg-card border border-white/10 p-8 rounded-none flex flex-col justify-between h-[300px]
                    hover:border-gold hover:-translate-y-1 transition-all duration-300 animate-slide-up ${staggerClass} relative overflow-hidden group shadow-sm
                  `}
                >
                  {/* Visual grid blur effect */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-bl-[4rem] pointer-events-none group-hover:bg-gold/10 transition-colors" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                      <span className="text-[9px] font-mono font-bold uppercase bg-white/10 px-2.5 py-1 text-white border border-white/10">
                        Youth Academy
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl text-white font-display font-bold uppercase leading-tight tracking-tight">
                        {program.name}
                      </h3>
                      <p className="text-xs font-sans text-charcoal-light font-semibold tracking-wide flex items-center gap-1.5 pt-1">
                        <CalendarDays className="w-4 h-4 text-gold stroke-[2px]" />
                        {getAgeLevel(program)}
                      </p>
                      <p className="text-sm font-mono text-gold font-extrabold tracking-wider pt-0.5">
                        {getPriceLabel(program.pricing_json)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 relative z-10">
                    <Link 
                      href={`/programs/${program.id}`}
                      className="w-full py-4 bg-transparent hover:bg-gold border border-white/10 text-white hover:text-forest-dark hover:border-gold font-display text-xs font-extrabold uppercase tracking-[0.2em] flex items-center justify-between px-6 transition-all duration-300 active:scale-[0.98]"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {youthAcademies.length === 0 && (
            <div className="p-16 text-center border border-dashed border-white/10 rounded-none bg-card">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-white/20 animate-pulse" />
              <p className="text-sm text-charcoal-light font-medium">No youth academies are active at this time.</p>
            </div>
          )}
        </section>

        {/* Subtle Decorative Gold Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent my-16 relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gold rotate-45 border border-pitch" />
        </div>

        {/* Section 2: Fitness & Wellness */}
        <section className="space-y-8 text-left">
          <div className="space-y-1 border-b border-white/5 pb-4">
            <h2 className="text-3xl font-brand font-bold text-gold uppercase tracking-wider">
              FITNESS & WELLNESS
            </h2>
            <p className="text-sm text-charcoal-light font-medium tracking-wide">
              High-energy classes for adults 16+
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fitnessWellness.map((program, i) => {
              const staggerClass = `stagger-${(i % 3) + 1}`;
              return (
                <div 
                  key={program.id}
                  className={`
                    bg-card border border-white/10 p-8 rounded-none flex flex-col justify-between h-[300px]
                    hover:border-gold hover:-translate-y-1 transition-all duration-300 animate-slide-up ${staggerClass} relative overflow-hidden group shadow-sm
                  `}
                >
                  {/* Visual grid blur effect */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-bl-[4rem] pointer-events-none group-hover:bg-gold/10 transition-colors" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                      <span className="text-[9px] font-mono font-bold uppercase bg-white/10 px-2.5 py-1 text-white border border-white/10">
                        Adult Fitness
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl text-white font-display font-bold uppercase leading-tight tracking-tight">
                        {program.name}
                      </h3>
                      <p className="text-xs font-sans text-charcoal-light font-semibold tracking-wide flex items-center gap-1.5 pt-1">
                        <CalendarDays className="w-4 h-4 text-gold stroke-[2px]" />
                        {getAgeLevel(program)}
                      </p>
                      <p className="text-sm font-mono text-gold font-extrabold tracking-wider pt-0.5">
                        {getPriceLabel(program.pricing_json)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 relative z-10">
                    <Link 
                      href={`/programs/${program.id}`}
                      className="w-full py-4 bg-transparent hover:bg-gold border border-white/10 text-white hover:text-forest-dark hover:border-gold font-display text-xs font-extrabold uppercase tracking-[0.2em] flex items-center justify-between px-6 transition-all duration-300 active:scale-[0.98]"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {fitnessWellness.length === 0 && (
            <div className="p-16 text-center border border-dashed border-white/10 rounded-none bg-card">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-white/20 animate-pulse" />
              <p className="text-sm text-charcoal-light font-medium">No adult fitness classes are active at this time.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
