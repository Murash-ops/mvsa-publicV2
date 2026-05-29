'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  Trophy, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Calendar,
  Phone,
  User,
  ShieldAlert,
  Compass,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function ProgramDetailsPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const programId = params?.id;

  // State
  const [program, setProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Form State
  const [participantName, setParticipantName] = useState('');
  const [participantAge, setParticipantAge] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [pricingPlan, setPricingPlan] = useState('session');
  
  // Custom dynamic schema answers
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  async function fetchProgramDetails() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          instructor:instructor_id (name)
        `)
        .eq('id', programId)
        .single();

      if (!error && data) {
        setProgram(data);
        if (data.pricing_json) {
          const availablePlans = Object.keys(data.pricing_json).filter(key => data.pricing_json[key] > 0);
          if (availablePlans.length > 0) {
            setPricingPlan(availablePlans[0]);
          }
        }
      } else {
        router.push('/programs');
      }
    } catch (err) {
      console.error('Error fetching program:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const getAgeLevel = () => {
    if (!program) return 'Ages 6-16';
    if (program?.type === 'academy') {
      return program?.schedule?.includes('Ages') ? program?.schedule : 'Ages 6 - 16';
    }
    return 'Ages 16+ / Adults';
  };

  const getPriceLabel = (planKey: string) => {
    if (!program?.pricing_json) return 'KES 0';
    const val = program?.pricing_json[planKey];
    return `KES ${val?.toLocaleString() || 0}`;
  };

  const submitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Core Validations
    if (!participantName.trim()) {
      setErrorMessage('Participant name is required.');
      return;
    }
    if (program?.type === 'academy') {
      const age = parseInt(participantAge);
      if (isNaN(age) || age < 4 || age > 18) {
        setErrorMessage('Participant age must be between 4 and 18 for academies.');
        return;
      }
    }
    const cleanPhone = parentPhone.replace(/\s/g, '');
    if (!/^(07|01|254)\d{8,10}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Compile dynamic responses as custom answers metadata
      const hasSchema = program?.registration_schema && Array.isArray(program?.registration_schema) && program?.registration_schema?.length > 0;
      
      let genderVal = 'Other';
      let experienceVal = 'Beginner';
      let schoolClubVal = '';
      let medicalVal = '';

      if (hasSchema) {
        Object.entries(dynamicAnswers).forEach(([fieldKey, value]) => {
          const keyLower = fieldKey.toLowerCase();
          if (keyLower.includes('gender')) {
            genderVal = value;
          } else if (keyLower.includes('experience')) {
            experienceVal = value;
          } else if (keyLower.includes('school') || keyLower.includes('club')) {
            schoolClubVal = value;
          } else if (keyLower.includes('medical') || keyLower.includes('allergy') || keyLower.includes('history')) {
            medicalVal = value;
          } else {
            medicalVal += (medicalVal ? '\n' : '') + `${fieldKey}: ${value}`;
          }
        });
      }

      // Insert enrollment in pending status (No auto SMS sent)
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([{
          program_id: program?.id,
          participant_name: participantName.trim(),
          participant_age: parseInt(participantAge) || null,
          client_phone: cleanPhone,
          status: 'pending', // Set strictly as pending for Admin review
          payment_status: 'unpaid',
          gender: genderVal,
          communication_pref: 'whatsapp',
          prior_experience: experienceVal,
          school_club: schoolClubVal || null,
          medical_conditions: medicalVal || null,
          pricing_plan: pricingPlan
        }]);

      if (enrollError) throw enrollError;

      setRegistrationSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing your registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-forest/10 border-t-gold rounded-full animate-spin" />
          <p className="font-display font-bold text-gold tracking-tight animate-pulse">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-center">
        <div className="max-w-md mx-auto p-8 glass rounded-none border border-white/10 bg-card space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-none border border-red-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl text-white font-display font-bold uppercase tracking-tight">Program not found</h2>
            <p className="text-charcoal-light text-sm font-medium">This program could not be found or is no longer active.</p>
          </div>
          <Link 
            href="/programs"
            className="inline-block w-full py-4 bg-gold hover:bg-gold-muted text-forest-dark font-display text-xs font-bold uppercase tracking-widest rounded-none shadow-gold-sm transition-all duration-300 active:scale-[0.98]"
          >
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  const hasCustomSchema = program?.registration_schema && Array.isArray(program?.registration_schema) && program?.registration_schema?.length > 0;

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
          <button 
            onClick={() => router.push('/programs')}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-6 border border-white/20 backdrop-blur-md px-4 py-2 rounded-none hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> All Programs
          </button>
          
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

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-card border border-white/10 rounded-none shadow-sm overflow-hidden">
              
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-white/5 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-display font-bold uppercase tracking-tight">PROGRAM REGISTRATION</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 text-gold">Submit Details for Intake</p>
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-none border border-white/10 text-[9px] font-mono font-bold text-white">
                  <Lock className="w-3.5 h-3.5 text-gold" /> SECURE
                </div>
              </div>

              {/* Dynamic Registration Form (Single Unified View) */}
              {registrationSuccess ? (
                <div className="p-8 text-center animate-entrance space-y-6">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-none border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl text-white font-display font-bold uppercase tracking-tight">
                    Registration received!
                  </h4>
                  <p className="text-charcoal-light text-sm leading-relaxed font-medium">
                    We&apos;ll be in touch to confirm your spot.
                  </p>
                  <button 
                    onClick={() => router.push('/programs')}
                    className="w-full py-4 bg-forest hover:bg-forest-light text-white rounded-none font-display text-xs font-bold uppercase tracking-widest transition-colors border border-forest cursor-pointer"
                  >
                    Return to Programs
                  </button>
                </div>
              ) : (
                <form onSubmit={submitEnrollment} className="p-8 space-y-5">
                  
                  {/* Standard Field: Participant Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">Athlete Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Brandon Kalomba"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-all text-sm font-medium rounded-none"
                      />
                    </div>
                  </div>

                  {/* Standard Field: Athlete Age */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">Athlete Age</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                      <input 
                        required
                        type="number" 
                        placeholder="e.g. 11"
                        value={participantAge}
                        onChange={(e) => setParticipantAge(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-all text-sm font-medium rounded-none"
                      />
                    </div>
                  </div>

                  {/* Standard Field: Parent/Contact Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">Parent / Guardian Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                      <input 
                        required
                        type="tel" 
                        placeholder="e.g. 0798258950"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-white/10 bg-white/5 text-white placeholder-white/30 font-mono focus:outline-none focus:border-gold transition-all text-sm rounded-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Fields from registration_schema */}
                  {hasCustomSchema ? (
                    program?.registration_schema?.map((field: any) => {
                      const inputKey = field.field_name;
                      return (
                        <div key={inputKey} className="space-y-1.5 pt-2 border-t border-white/5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">
                            {field.field_name} {field.required && <span className="text-error">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              required={field.required}
                              rows={3}
                              placeholder="Enter details..."
                              value={dynamicAnswers[inputKey] || ''}
                              onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [inputKey]: e.target.value })}
                              className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-all text-sm font-medium rounded-none"
                            />
                          ) : field.type === 'select' ? (
                            <select
                              required={field.required}
                              value={dynamicAnswers[inputKey] || ''}
                              onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [inputKey]: e.target.value })}
                              className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white focus:outline-none focus:border-gold transition-all text-sm font-medium rounded-none"
                            >
                              <option value="">Select option...</option>
                              {field.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'checkbox' ? (
                            <label className="flex items-center gap-3 py-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                required={field.required}
                                checked={dynamicAnswers[inputKey] === 'true'}
                                onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [inputKey]: e.target.checked ? 'true' : 'false' })}
                                className="w-4 h-4 text-gold border-white/10 rounded-none focus:ring-0 focus:outline-none accent-gold cursor-pointer"
                              />
                              <span className="text-xs text-charcoal-light font-bold">Yes, I confirm</span>
                            </label>
                          ) : (
                            <input
                              required={field.required}
                              type={field.type === 'number' ? 'number' : 'text'}
                              placeholder="Enter details..."
                              value={dynamicAnswers[inputKey] || ''}
                              onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [inputKey]: e.target.value })}
                              className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-all text-sm font-medium rounded-none"
                            />
                          )}
                        </div>
                      );
                    })
                  ) : null}

                  {/* Standard Field: Pricing Plan Selection */}
                  {program?.pricing_json && (
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">Choose Pricing Option</label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {Object.entries(program?.pricing_json || {}).map(([key, value]) => {
                          if (!value || (value as number) === 0) return null;
                          const isActive = pricingPlan === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setPricingPlan(key)}
                              className={`w-full flex items-center justify-between p-4 border text-left transition-all duration-300 rounded-none cursor-pointer ${
                                isActive 
                                  ? 'border-gold bg-gold/10 text-gold font-bold scale-[1.01]' 
                                  : 'border-white/10 bg-white/5 text-white hover:border-gold/30 hover:bg-gold/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isActive ? 'border-gold' : 'border-white/10'}`}>
                                  {isActive && <div className="w-1.5 h-1.5 bg-gold rounded-full" />}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">{key}</span>
                              </div>
                              <span className="text-sm font-mono font-bold text-white">
                                KES {value.toLocaleString()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Billing Details Block */}
                  {program?.pricing_json && (
                    <div className="p-4 border border-white/10 bg-white/5 rounded-none flex justify-between items-center text-xs">
                      <span className="font-bold text-charcoal-light">Total Fees Due:</span>
                      <span className="font-mono font-black text-lg text-gold">{getPriceLabel(pricingPlan)}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <p className="text-error text-xs font-semibold">{errorMessage}</p>
                  )}

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 bg-gold hover:bg-gold-muted disabled:opacity-50 text-forest-dark py-4.5 rounded-none font-display text-xs font-extrabold uppercase tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin text-forest-dark" />
                    ) : (
                      'Register Now'
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
