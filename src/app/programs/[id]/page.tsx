import { notFound } from 'next/navigation';
import { getAcademyProgram } from '@/lib/academy-programs';
import { contact } from '@/content/site';
import { 
  Trophy, 
  Users, 
  Clock, 
  ArrowLeft,
  Calendar,
  User,
  Compass,
  Lock,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

/**
 * Programme data comes from src/lib/academy-programs: checked-in seed data,
 * because the backend contract has no programmes endpoint. Enrolment is an
 * enquiry over WhatsApp — nothing on this page reserves a place or takes money.
 */
export default async function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = getAcademyProgram(id);

  if (!program) notFound();

  const getAgeLevel = () => program.age_group;

  // Build conversational WhatsApp link using program name
  const whatsAppUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
    `Hi MVSA 👋 I'm interested in enrolling in ${program.name}. My name is [Name]. Could you share more details on enrollment?`
  )}`;

  return (
    <main className="min-h-screen bg-transparent text-charcoal text-left pb-32">
      {/* Hero Header */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        {program?.image_url ? (
          <img 
            src={program?.image_url} 
            alt={program?.name} 
            className="w-full h-full object-cover select-none filter brightness-[0.7]" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-forest-dark via-forest to-forest-dark flex items-center justify-center">
            <Trophy className="w-20 h-20 text-gold/20 animate-pulse" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061a10] via-[#061a10]/40 to-transparent z-[1]" />
        
        {/* Banner Details */}
        <div className="absolute inset-x-0 bottom-12 max-w-7xl mx-auto px-6 lg:px-10 z-10">
          <Link 
            href="/programs"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-6 border border-white/20 backdrop-blur-md px-4 py-2 rounded-none hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> All Programs
          </Link>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold text-forest-dark text-[9px] font-black uppercase tracking-widest font-mono">
              {program?.type === 'academy' ? 'Youth Academy' : 'Adult Performance'}
            </div>
            <h1 className="text-4xl md:text-6xl text-white font-display font-black uppercase tracking-tight leading-none">
              {program?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-white/80">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> {program?.schedule}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gold" /> {getAgeLevel()}</span>
              {program?.instructor?.name && (
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-gold" /> Coach {program?.instructor?.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Columns */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-10">
            <div className="bg-card border border-white/10 p-8 md:p-12 rounded-none shadow-sm space-y-6">
              <h2 className="text-2xl text-white uppercase tracking-tight font-display font-bold">Program Overview</h2>
              <p className="text-charcoal-light text-base md:text-lg leading-relaxed font-medium whitespace-pre-line">
                {program?.description || "Join our high-performance program designed to challenge athletes, foster disciplined teamwork, and elevate core capabilities. Led by expert coaching facilitators in Nairobi's premier arena."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-none text-white border border-white/10 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display uppercase text-sm">State-of-the-Art</h4>
                    <p className="text-xs text-charcoal-light mt-1">Access to premium turf and high-grade training gear.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-none text-white border border-white/10 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display uppercase text-sm">Pathway Tracker</h4>
                    <p className="text-xs text-charcoal-light mt-1">Dedicated assessments and skill grading matrices.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Enrollment Card (WhatsApp Redirect) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-card border border-white/10 rounded-none shadow-sm overflow-hidden p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gold">Intake open</span>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-white mt-0.5">Join Program</h3>
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-none border border-white/10 text-[9px] font-mono font-bold text-white">
                  <Lock className="w-3.5 h-3.5 text-gold" /> SECURE
                </div>
              </div>

              <p className="text-xs text-charcoal-light leading-relaxed font-medium">
                Enrollment for this program is managed directly through WhatsApp. Tap below to chat with our academy administrators to discuss details, parent requirements, and starting schedules.
              </p>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-5 bg-gold hover:bg-gold-muted text-forest-dark border border-gold font-display text-xs font-extrabold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2.5 shadow-gold-sm hover:scale-[1.02] active:scale-[0.98] spring-bounce text-center"
              >
                Enroll via WhatsApp
                <ChevronRight className="w-4 h-4 stroke-[2.5px]" />
              </a>
              
              <p className="text-[10px] text-white/40 italic font-medium text-center leading-relaxed">
                *Clicking redirects to WhatsApp chat at +254798258950
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
