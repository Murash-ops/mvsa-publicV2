'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { 
  Trophy, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Upload,
  Calendar,
  Phone,
  User,
  ShieldAlert,
  Compass,
  MessageCircle,
  Mail,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react';

const SparklesIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
  </svg>
);

const Sparkles = (props: any) => <SparklesIcon {...props} />;

const PROGRAM_DETAILS_MAP: Record<string, {
  curriculum: Array<{ title: string; desc: string; icon: any }>;
  logistics: {
    duration: string;
    frequency: string;
  };
}> = {
  football: {
    curriculum: [
      { title: "Ball Mastery", desc: "Micro-touch drills, ball control, and directional dribbling.", icon: Trophy },
      { title: "Tactical Intelligence", desc: "Spatial awareness, positional discipline, and transitional structures.", icon: Compass },
      { title: "Physical Performance", desc: "Soccer-specific agility, cardiovascular capacity, and explosive bursts.", icon: Zap },
      { title: "Mental Resiliency", desc: "Leadership fundamentals, communication, and competitive focus.", icon: Sparkles }
    ],
    logistics: {
      duration: "90 Mins",
      frequency: "2x Weekly (Sat & Sun)"
    }
  },
  chess: {
    curriculum: [
      { title: "Strategic Openings", desc: "Control of the center, piece development, and classic structure control.", icon: Trophy },
      { title: "Tactical Matrix", desc: "Double attacks, pins, skewers, and advanced combination geometry.", icon: Compass },
      { title: "Endgame Technique", desc: "King activity, opposition positioning, and pawn promotion frameworks.", icon: Zap },
      { title: "Analytical Focus", desc: "Time management, logic, patience, and visual mental mapping.", icon: Sparkles }
    ],
    logistics: {
      duration: "120 Mins",
      frequency: "1x Weekly (Saturday)"
    }
  },
  dance: {
    curriculum: [
      { title: "Core Rhythmics", desc: "Timing coordination, musicality appreciation, and spatial movement flow.", icon: Trophy },
      { title: "Dynamic Choreography", desc: "Kinetic sequences, memory tracking, and expressive storytelling.", icon: Compass },
      { title: "Flexibility & Strength", desc: "Extension balance, posture alignment, and dynamic core stability.", icon: Zap },
      { title: "Creative Expression", desc: "Performance confidence, freestyle rhythm, and group collaboration.", icon: Sparkles }
    ],
    logistics: {
      duration: "60 Mins",
      frequency: "1x Weekly (Saturday)"
    }
  },
  fitness: {
    curriculum: [
      { title: "Cardio Agility", desc: "High-intensity agility sequences to optimize fat oxidation thresholds.", icon: Trophy },
      { title: "Functional Strength", desc: "Multi-joint compound tracking to secure posture stability and alignment.", icon: Compass },
      { title: "Conditioning Tiers", desc: "Core endurance challenges and structural muscle tone progression.", icon: Zap },
      { title: "Performance Mindset", desc: "Goal progression tracking, nutritional accountability, and active consistency.", icon: Sparkles }
    ],
    logistics: {
      duration: "60 Mins",
      frequency: "3x Weekly (Mon, Wed, Fri)"
    }
  }
};

export default function ProgramDetailsPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const programId = params?.id;

  // State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [program, setProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formStep, setFormStep] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    participantName: '',
    participantAge: '',
    gender: 'Male',
    priorExperience: 'Beginner',
    schoolClub: '',
    medicalConditions: '',
    parentName: '',
    parentPhone: '',
    communicationPref: 'whatsapp',
    pricingPlan: 'session'
  });

  // Dynamic answers collection for custom registration schema
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  async function fetchProgramDetails() {
    setIsLoading(true);
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
      // Default price selection
      if (data.pricing_json) {
        const availablePlans = Object.keys(data.pricing_json).filter(key => data.pricing_json[key] > 0);
        if (availablePlans.length > 0) {
          setFormData(prev => ({ ...prev, pricingPlan: availablePlans[0] }));
        }
      }
    } else {
      router.push('/programs');
    }
    setIsLoading(false);
  }

  const getTheme = () => {
    if (!program) return 'football';
    const lowerName = program.name.toLowerCase();
    if (lowerName.includes('football') || lowerName.includes('soccer')) return 'football';
    if (lowerName.includes('chess')) return 'chess';
    if (lowerName.includes('dance') || lowerName.includes('ballet')) return 'dance';
    return 'fitness';
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setPhotoUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      // Validate core name & age
      if (!formData.participantName.trim()) {
        alert('Participant name is required.');
        return;
      }
      if (program.type === 'academy') {
        const age = parseInt(formData.participantAge);
        if (isNaN(age) || age < 4 || age > 18) {
          alert('Participant age must be between 4 and 18 for academies.');
          return;
        }
      }
      setFormStep(2);
    } else if (formStep === 2) {
      // Validate phone format
      const cleanPhone = formData.parentPhone.trim().replace(/\s+/g, '');
      const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        alert('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx or 01xxxxxxxx).');
        return;
      }
      setFormStep(3);
    }
  };

  const submitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let passportUrl = null;

      // 1. Upload passport photo if selected
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('player-profiles')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('player-profiles')
          .getPublicUrl(filePath);

        passportUrl = publicUrl;
      }

      const cleanPhone = formData.parentPhone.replace(/\s/g, '');

      // 2. Parse dynamic answers and map to the standard columns
      let genderVal = 'Other';
      let experienceVal = 'Beginner';
      let schoolClubVal = '';
      let medicalVal = '';

      const hasSchema = program.registration_schema && Array.isArray(program.registration_schema) && program.registration_schema.length > 0;

      if (hasSchema) {
        Object.entries(dynamicAnswers).forEach(([fieldKey, value]) => {
          const keyLower = fieldKey.toLowerCase();
          if (keyLower.includes('gender')) {
            genderVal = value;
          } else if (keyLower.includes('experience')) {
            experienceVal = value;
          } else if (keyLower.includes('school') || keyLower.includes('club')) {
            schoolClubVal = value;
          } else if (keyLower.includes('medical') || keyLower.includes('allergy') || keyLower.includes('condition') || keyLower.includes('history')) {
            medicalVal = value;
          } else {
            medicalVal += (medicalVal ? '\n' : '') + `${fieldKey}: ${value}`;
          }
        });
      } else {
        genderVal = formData.gender;
        experienceVal = formData.priorExperience;
        schoolClubVal = formData.schoolClub;
        medicalVal = formData.medicalConditions;
      }

      // 3. Insert into enrollments (status active directly, payment unconfirmed)
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([{
          program_id: program.id,
          participant_name: formData.participantName.trim(),
          participant_age: parseInt(formData.participantAge) || null,
          client_phone: cleanPhone || '254700000000',
          status: 'active', // Set active straight to trigger instant dashboard visibility
          payment_status: 'unpaid',
          gender: genderVal,
          communication_pref: formData.communicationPref,
          passport_photo_url: passportUrl,
          prior_experience: experienceVal,
          school_club: schoolClubVal || null,
          medical_conditions: medicalVal || null,
          pricing_plan: formData.pricingPlan
        }]);

      if (enrollError) throw enrollError;

      setRegistrationSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Error processing your registration');
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

  const theme = getTheme();
  
  // Theme styling definitions mapped perfectly to the luxury light aesthetic
  const themeStyles = {
    bg: 'bg-surface text-charcoal min-h-screen',
    accentColor: 'text-gold',
    borderColor: 'border-forest/12',
    btnGradient: 'from-forest to-forest-dark hover:from-forest-light hover:to-forest text-white',
    heroOverlay: 'from-[#1A3A0A]/90 via-[#1A3A0A]/40 to-transparent',
    glow: 'bg-gold/5',
    badgeBg: 'bg-forest/5 text-forest border-forest/12',
    titleFont: 'font-display font-bold text-forest',
    accentText: 'text-gold',
    cardStyle: 'rounded-none border border-forest/12 bg-white shadow-pitch relative overflow-hidden transition-all duration-300',
    cardStyleSm: 'rounded-none border border-forest/12 bg-white p-6 transition-all duration-300 group hover:border-gold shadow-sm',
    badgeStyle: 'bg-forest/5 text-forest border border-forest/12 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest',
    inputStyle: 'w-full px-4 py-3 rounded-none border border-forest/12 bg-white text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 font-medium text-sm transition-all',
    textareaStyle: 'w-full px-4 py-3 rounded-none border border-forest/12 bg-white text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 font-medium text-sm transition-all',
    inputBorder: 'border-forest/12',
    inputBg: 'bg-white',
    prefBtnActive: 'border-gold bg-gold/10 text-gold font-bold text-xs py-3.5 rounded-none text-center transition-all duration-300 scale-102 border-current shadow-sm',
    prefBtnInactive: 'border-forest/12 bg-white hover:border-gold/50 text-charcoal-light font-bold text-xs py-3.5 rounded-none text-center transition-all duration-300',
    priceCardActive: 'border-gold bg-gold/10 text-gold',
    priceCardInactive: 'border-forest/12 bg-white text-charcoal-light',
    cardWrapper: 'w-full rounded-none',
    formCardBg: 'bg-white'
  };

  const details = PROGRAM_DETAILS_MAP[theme] || PROGRAM_DETAILS_MAP.football;
  const hasCustomSchema = program.registration_schema && Array.isArray(program.registration_schema) && program.registration_schema.length > 0;

  return (
    <main className={`min-h-screen ${themeStyles.bg} relative pb-32`}>
      <div className={`absolute -right-40 -top-40 w-96 h-96 rounded-full blur-[150px] pointer-events-none -z-10 ${themeStyles.glow}`} />
      <div className={`absolute -left-40 bottom-40 w-96 h-96 rounded-full blur-[150px] pointer-events-none -z-10 ${themeStyles.glow}`} />

      {/* Hero Banner Cover */}
      <div className="relative w-full h-[55vh] md:h-[60vh] overflow-hidden">
        {program.image_url ? (
          <img 
            src={program.image_url} 
            alt={program.name} 
            className="w-full h-full object-cover select-none filter brightness-[0.7]" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-forest-dark via-forest to-forest-dark flex items-center justify-center">
            <Trophy className="w-20 h-20 text-gold/25 animate-pulse" />
          </div>
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${themeStyles.heroOverlay} z-1`} />
        
        {/* Banner Details Overlay */}
        <div className="absolute inset-x-0 bottom-12 max-w-7xl mx-auto px-6 lg:px-10 z-10 text-left">
          <button 
            onClick={() => router.push('/programs')}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-6 border border-white/20 backdrop-blur-md px-4 py-2 rounded-none hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> All Programs
          </button>
          
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-none border text-[9px] font-black uppercase tracking-widest ${themeStyles.badgeBg} bg-white/95 border-gold/45 text-forest font-bold`}>
              {program.type === 'academy' ? 'Youth Academy' : 'Adult Performance'}
            </div>
            <h1 className="text-4xl md:text-6xl text-white font-display font-black uppercase tracking-tight leading-none">
              {program.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-white/80">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> {formatSchedule(program.name, program.schedule)}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gold" /> {program.type === 'academy' ? 'Ages 6-16' : 'Ages 16+'}</span>
              {program.instructor?.name && (
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-gold" /> Coach {program.instructor.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-12 text-left">
            
            {/* Overview */}
            <div className={`${themeStyles.cardStyle} p-8 md:p-12 shadow-sm`}>
              <h2 className="text-2xl text-forest uppercase tracking-tight mb-6 font-display font-bold">Program Overview</h2>
              <p className="text-charcoal-light text-lg leading-relaxed font-medium whitespace-pre-line">
                {program.description || "Join our high-performance program designed to challenge athletes, foster disciplined teamwork, and elevate core capabilities. Led by expert coaching facilitators in Nairobi's premier arena."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-forest/12">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-forest/5 rounded-none text-forest border border-forest/12">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-forest font-bold font-display uppercase text-sm">State-of-the-Art</h4>
                    <p className="text-xs text-charcoal-light mt-1">High-performance facility structures and training aids.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-forest/5 rounded-none text-forest border border-forest/12">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-forest font-bold font-display uppercase text-sm">Elite Pathway</h4>
                    <p className="text-xs text-charcoal-light mt-1">Dedicated curriculum tracking player development curves.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Parameters */}
            {details.logistics && (
              <div className={`${themeStyles.cardStyle} p-8 shadow-sm grid grid-cols-2 gap-4 text-center divide-x divide-forest/12 bg-white`}>
                <div className="px-2">
                  <p className="text-[10px] font-black text-charcoal-light/60 uppercase tracking-widest">Session Length</p>
                  <p className="text-base md:text-lg font-black mt-2 font-mono text-forest">
                    {details.logistics.duration}
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-black text-charcoal-light/60 uppercase tracking-widest">Frequency</p>
                  <p className="text-xs md:text-sm font-black text-forest mt-2 uppercase tracking-wide font-display">
                    {details.logistics.frequency}
                  </p>
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div className="space-y-6">
              <h3 className="text-xl font-display font-bold text-forest uppercase tracking-tight">Training Pillars & Curriculum</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {details.curriculum.map((pillar, idx) => (
                  <div key={idx} className={themeStyles.cardStyleSm}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2.5 bg-gold/10 text-gold rounded-none border border-gold/25">
                        <pillar.icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold font-display uppercase text-forest tracking-tight">{pillar.title}</h4>
                    </div>
                    <p className="text-xs md:text-sm text-charcoal-light leading-relaxed font-medium">
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 text-left">
            <div className={themeStyles.cardWrapper}>
              <div className={`${themeStyles.cardStyle} overflow-hidden shadow-pitch`}>
                
                {/* Form Header */}
                <div className="p-8 border-b border-forest/12 bg-forest/5 text-forest flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-display font-bold uppercase tracking-tight text-forest">RESERVE A SPOT</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 text-gold">Secure Enrollment Instantly</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-none border border-forest/12 text-[10px] font-black text-forest tracking-wider">
                    <Lock className="w-3 h-3 text-gold" /> SECURE
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="px-8 py-4 flex items-center justify-between bg-white border-b border-forest/12 text-[9px] font-black uppercase tracking-widest text-muted">
                  <span className={formStep >= 1 ? 'text-forest font-bold' : ''}>1. Athlete</span>
                  <ChevronRight className="w-3 h-3 text-forest/10" />
                  <span className={formStep >= 2 ? 'text-forest font-bold' : ''}>2. Parent</span>
                  <ChevronRight className="w-3 h-3 text-forest/10" />
                  <span className={formStep >= 3 ? 'text-forest font-bold' : ''}>3. Pathway</span>
                </div>

                {/* Step Forms */}
                {registrationSuccess ? (
                  <div className="p-10 text-center animate-entrance bg-white">
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-none flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-3xl text-forest mb-3 tracking-tighter uppercase leading-tight text-center font-display font-bold">YOU ARE ENROLLED!</h4>
                    <p className="text-charcoal-light mb-8 text-sm leading-relaxed font-medium">
                      Congratulations! <strong>{formData.participantName}</strong> has been successfully registered to the <strong>{program.name}</strong>.
                      <br/><br/>
                      Our team (Charles or Karlmax) will contact you shortly via <span className="uppercase font-bold text-gold">{formData.communicationPref}</span> to arrange orientation.
                    </p>
                    <button 
                      onClick={() => router.push('/programs')}
                      className={`w-full py-4.5 rounded-none font-bold text-xs tracking-widest uppercase transition-all duration-300 active:scale-95 border border-forest ${themeStyles.btnGradient}`}
                    >
                      RETURN TO CATALOG
                    </button>
                  </div>
                ) : (
                  <form onSubmit={formStep < 3 ? handleNextStep : submitEnrollment} className="p-8 space-y-6 bg-white">
                    
                    {/* Step 1: Athlete/Participant Profile */}
                    {formStep === 1 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        
                        {/* Name */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                            <User className="w-3 h-3 text-gold" /> Participant Name
                          </label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. Brandon Kalomba"
                            value={formData.participantName}
                            onChange={(e) => setFormData({...formData, participantName: e.target.value})}
                            className={themeStyles.inputStyle}
                          />
                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-gold" /> Athlete Age
                          </label>
                          <input 
                            required
                            type="number" 
                            placeholder="e.g. 11"
                            value={formData.participantAge}
                            onChange={(e) => setFormData({...formData, participantAge: e.target.value})}
                            className={themeStyles.inputStyle}
                          />
                        </div>

                        {/* Dynamic Registration Fields */}
                        {hasCustomSchema ? (
                          program.registration_schema.map((field: any) => {
                            const inputKey = field.field_name;
                            return (
                              <div key={inputKey} className="space-y-2 pt-2 border-t border-forest/5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                                  <Compass className="w-3 h-3 text-gold" /> {field.field_name} {field.required && <span className="text-error">*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                  <textarea
                                    required={field.required}
                                    rows={3}
                                    placeholder={`Enter details...`}
                                    value={dynamicAnswers[inputKey] || ''}
                                    onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [inputKey]: e.target.value })}
                                    className={themeStyles.textareaStyle}
                                  />
                                ) : field.type === 'select' ? (
                                  <select
                                    required={field.required}
                                    value={dynamicAnswers[inputKey] || ''}
                                    onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [inputKey]: e.target.value })}
                                    className={themeStyles.inputStyle}
                                  >
                                    <option value="">Select option...</option>
                                    {field.options?.map((opt: string) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : field.type === 'checkbox' ? (
                                  <div className="flex items-center gap-3 py-2">
                                    <input
                                      type="checkbox"
                                      required={field.required}
                                      checked={dynamicAnswers[inputKey] === 'true'}
                                      onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [inputKey]: e.target.checked ? 'true' : 'false' })}
                                      className="w-4 h-4 text-gold border-forest/12 rounded-none focus:ring-0 focus:outline-none"
                                    />
                                    <span className="text-xs text-charcoal font-medium">I confirm / agree</span>
                                  </div>
                                ) : (
                                  <input
                                    required={field.required}
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    placeholder={`Enter responses...`}
                                    value={dynamicAnswers[inputKey] || ''}
                                    onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [inputKey]: e.target.value })}
                                    className={themeStyles.inputStyle}
                                  />
                                )}
                              </div>
                            );
                          })
                        ) : (
                          // Fallback fields: Gender, school club, prior experience, medical history
                          <div className="space-y-4 pt-2 border-t border-forest/5">
                            {/* Gender */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-forest">Gender</label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {['Male', 'Female', 'Other'].map((genderOption) => {
                                  const isSelected = formData.gender === genderOption;
                                  return (
                                    <button
                                      key={genderOption}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, gender: genderOption })}
                                      className={isSelected ? themeStyles.prefBtnActive : themeStyles.prefBtnInactive}
                                    >
                                      {genderOption}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* School Club */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                                <Compass className="w-3 h-3 text-gold" /> School or Club
                              </label>
                              <input 
                                type="text" 
                                placeholder="e.g. Kilimani Primary School"
                                value={formData.schoolClub}
                                onChange={(e) => setFormData({...formData, schoolClub: e.target.value})}
                                className={themeStyles.inputStyle}
                              />
                            </div>

                            {/* Experience */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                                <Trophy className="w-3 h-3 text-gold" /> Prior Sport Experience
                              </label>
                              <div className="space-y-2">
                                {[
                                  { val: 'Beginner', label: 'Beginner', desc: 'No prior team or formal training' },
                                  { val: 'Intermediate', label: 'Intermediate', desc: 'School team or recreational play' },
                                  { val: 'Advanced', label: 'Advanced', desc: 'Elite Academy or competitive play' }
                                ].map((exp) => {
                                  const isSelected = formData.priorExperience === exp.val;
                                  return (
                                    <button
                                      key={exp.val}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, priorExperience: exp.val })}
                                      className={`w-full text-left p-4 transition-all duration-300 flex justify-between items-center gap-4 border ${
                                        isSelected
                                          ? `${themeStyles.priceCardActive} shadow-sm border-current`
                                          : `${themeStyles.priceCardInactive} hover:border-gold/50`
                                      }`}
                                    >
                                      <div>
                                        <p className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-gold' : 'text-charcoal-light'}`}>{exp.label}</p>
                                        <p className="text-[9px] text-muted font-medium mt-0.5">{exp.desc}</p>
                                      </div>
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-current' : 'border-forest/12'}`}>
                                        {isSelected && <div className="w-2 h-2 bg-current rounded-full" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Medical conditions */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                                <ShieldAlert className="w-3 h-3 text-gold" /> Medical History / Allergies
                              </label>
                              <textarea 
                                rows={2}
                                placeholder="e.g. Asthma, allergies, past operations (or leave blank)"
                                value={formData.medicalConditions}
                                onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                                className={themeStyles.textareaStyle}
                              />
                            </div>
                          </div>
                        )}

                        {/* Passport Photo Upload */}
                        <div className="space-y-2 border-t border-forest/12 pt-4">
                          <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-forest">
                            <Upload className="w-3 h-3 text-gold" /> Passport Photo of Child
                          </label>
                          
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-forest/5 border border-dashed border-forest/20 flex items-center justify-center overflow-hidden relative shrink-0">
                              {photoPreview ? (
                                <img src={photoPreview} alt="Passport Crop" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-forest/20" />
                              )}
                            </div>
                            
                            <div className="relative flex-1">
                              <div className={`w-full px-4 py-3.5 border hover:bg-forest/5 hover:border-gold/30 flex items-center justify-between cursor-pointer transition-colors text-xs font-bold text-charcoal-light rounded-none ${themeStyles.inputBorder} ${themeStyles.inputBg}`}>
                                <span>{photoFile ? photoFile.name : 'Select passport image'}</span>
                                <Upload className="w-4 h-4 text-charcoal-light/55" />
                              </div>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Parent / Contact Info */}
                    {formStep === 2 && (
                      <div className="space-y-5 animate-in fade-in duration-300">
                        {program.type === 'academy' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                              <User className="w-3 h-3 text-gold" /> Parent / Guardian Name
                            </label>
                            <input 
                              required
                              type="text" 
                              placeholder="e.g. Charles Kalomba"
                              value={formData.parentName}
                              onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                              className={themeStyles.inputStyle}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gold" /> Phone Number (M-Pesa Primary)
                          </label>
                          <input 
                            required
                            type="tel" 
                            placeholder="e.g. 0798258950"
                            value={formData.parentPhone}
                            onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                            className={themeStyles.inputStyle}
                          />
                        </div>

                        {/* Preferred Communication Channel */}
                        <div className="space-y-3 pt-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-forest">Preferred Channel for Logs</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                              { id: 'sms', label: 'SMS', icon: Phone },
                              { id: 'email', label: 'Email', icon: Mail }
                            ].map((channel) => {
                              const isSel = formData.communicationPref === channel.id;
                              const Icon = channel.icon;
                              return (
                                <button
                                  key={channel.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, communicationPref: channel.id })}
                                  className={`flex flex-col items-center justify-center p-4 border transition-all duration-300 text-center gap-2 relative overflow-hidden rounded-none ${isSel ? themeStyles.prefBtnActive : themeStyles.prefBtnInactive}`}
                                >
                                  <Icon className={`w-4 h-4 relative z-10 ${isSel ? 'text-gold' : 'text-charcoal-light/40'}`} />
                                  <span className="text-[10px] font-bold tracking-wider relative z-10">{channel.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Pathway Selection (Pricing & Fees) */}
                    {formStep === 3 && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-forest block">Select Academy Pricing Plan</label>
                        
                        <div className="space-y-3">
                          {Object.entries(program.pricing_json).map(([key, value]) => {
                            if (!value || (value as number) === 0) return null;
                            const isActive = formData.pricingPlan === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setFormData({ ...formData, pricingPlan: key })}
                                className={`w-full flex items-center justify-between p-5 border text-left transition-all duration-300 hover:scale-[1.01] spring-bounce relative overflow-hidden rounded-none ${
                                  isActive 
                                    ? `${themeStyles.priceCardActive} shadow-sm border-current` 
                                    : `${themeStyles.priceCardInactive} hover:border-gold/40`
                                }`}
                              >
                                <div className="flex items-center gap-3 relative z-10">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? 'border-current' : 'border-forest/12'}`}>
                                    {isActive && <div className="w-2 h-2 bg-current rounded-full" />}
                                  </div>
                                  <div>
                                    <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-gold' : 'text-charcoal-light'}`}>{key}</p>
                                    <p className="text-[9px] text-muted font-bold uppercase tracking-wider">Commitment Option</p>
                                  </div>
                                </div>
                                
                                <div className="flex-1 border-t border-dashed border-forest/12 mx-4 relative z-10" />
                                
                                <p className={`text-xl font-display font-black tracking-tight shrink-0 relative z-10 ${isActive ? 'text-gold' : 'text-charcoal'}`}>
                                  KES {value.toLocaleString()}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Summary Panel */}
                        <div className={`p-6 border text-charcoal space-y-2 mt-6 rounded-none bg-forest/5 ${themeStyles.borderColor}`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-charcoal-light">Selected Pathway:</span>
                            <span className="font-black uppercase tracking-widest text-forest">{formData.pricingPlan}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-forest/12 pt-2 mt-2">
                            <span className="text-xs font-bold text-charcoal-light">Amount Payable:</span>
                            <span className="text-xl font-mono font-black text-gold">KES {((program.pricing_json as any)[formData.pricingPlan] || 0).toLocaleString()}</span>
                          </div>
                          <p className="text-[8.5px] text-muted text-center pt-2 font-medium">
                            Upon submission, child details sync instantly. Please coordinate payment directly with Charles/Karlmax.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation Actions */}
                    <button 
                      type="submit"
                      disabled={isSubmitting || photoUploading}
                      className={`w-full flex items-center justify-center gap-4 px-8 py-5 rounded-none font-bold text-xs tracking-[0.3em] uppercase transition-all duration-300 shadow-sm hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 border border-forest ${themeStyles.btnGradient}`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : formStep < 3 ? (
                        <>Next: Continue <ChevronRight className="w-5 h-5 text-white" /></>
                      ) : (
                        <>Complete Registration <ChevronRight className="w-5 h-5 text-white" /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
