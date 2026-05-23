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
  Sparkles,
  Phone,
  User,
  ShieldAlert,
  ArrowDownToLine,
  Compass,
  MessageCircle,
  Mail,
  Zap,
  Lock,
  ChevronRight,
  Share2,
  GraduationCap,
  Award,
  Activity,
  Check,
  Copy,
  Heart
} from 'lucide-react';

/* === IMMERSIVE BACKGROUND PATTERNS === */

const SoccerPitchBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
    {/* Fine pitch grid lines */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
    {/* Soccer pitch geometry outlines */}
    <svg className="absolute inset-0 w-full h-full stroke-emerald-500/10 stroke-[1.5] fill-none" viewBox="0 0 1000 1500" preserveAspectRatio="none">
      {/* Outlines */}
      <rect x="20" y="20" width="960" height="1460" rx="10" />
      {/* Center Line */}
      <line x1="20" y1="750" x2="980" y2="750" />
      {/* Center Circle */}
      <circle cx="500" cy="750" r="120" />
      {/* Penalty Box Top */}
      <rect x="250" y="20" width="500" height="220" />
      <rect x="380" y="20" width="240" height="80" />
      <path d="M 380 240 A 120 120 0 0 0 620 240" />
      {/* Penalty Box Bottom */}
      <rect x="250" y="1260" width="500" height="220" />
      <rect x="380" y="1400" width="240" height="80" />
      <path d="M 380 1260 A 120 120 0 0 1 620 1260" />
      {/* Corner Circles */}
      <path d="M 20 50 A 30 30 0 0 0 50 20" />
      <path d="M 980 50 A 30 30 0 0 1 950 20" />
      <path d="M 20 1450 A 30 30 0 0 1 50 1480" />
      <path d="M 980 1450 A 30 30 0 0 0 950 1480" />
    </svg>
  </div>
);

const ChessBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
    {/* Subtle marble checkerboard texture */}
    <div 
      className="absolute inset-0 opacity-[0.015]" 
      style={{
        backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,1) 0 25%, transparent 0 50%)',
        backgroundSize: '100px 100px'
      }}
    />
    {/* Premium gold marble ambient glows */}
    <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#d4af37]/3 blur-[140px] animate-pulse duration-[8s]" />
    <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#aa841c]/3 blur-[140px] animate-pulse duration-[10s]" />
  </div>
);

const DanceBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
    {/* Dynamic pulsating sunset neon spheres */}
    <div className="absolute top-[15%] left-[5%] w-[450px] h-[450px] rounded-full bg-pink-500/10 blur-[130px] animate-pulse duration-[7s]" />
    <div className="absolute top-[45%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[140px] animate-pulse duration-[9s]" />
    <div className="absolute bottom-[5%] left-[15%] w-[350px] h-[350px] rounded-full bg-fuchsia-500/8 blur-[110px] animate-pulse duration-[6s]" />
  </div>
);

const FitnessBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
    {/* Tech carbon mesh grid structure */}
    <div 
      className="absolute inset-0 opacity-[0.05]" 
      style={{
        backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)',
        backgroundSize: '10px 10px',
      }}
    />
    {/* Aggressive orange horizontal scanlines */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.015)_1px,transparent_1px)] bg-[size:100%_32px]" />
    <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#f97316]/5 blur-[120px]" />
  </div>
);

const PROGRAM_DETAILS_MAP: Record<string, {
  curriculum: Array<{ title: string; desc: string; icon: any }>;
  logistics: {
    duration: string;
    frequency: string;
  };
}> = {
  football: {
    curriculum: [
      { title: "Ball Mastery", desc: "Micro-touch drills, dynamic ball control, and directional dribbling.", icon: Trophy },
      { title: "Tactical Intelligence", desc: "Spatial awareness, positional discipline, and transitional structures.", icon: Compass },
      { title: "Physical Performance", desc: "Soccer-specific agility, cardiovascular capacity, and explosive bursts.", icon: Zap },
      { title: "Mental Resiliency", desc: "Leadership fundamentals, sport-specific communication, and competitive focus.", icon: Sparkles }
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
      { title: "Functional Strength", desc: "Multi-joint movements, kinetic chain stability, and core activation.", icon: Trophy },
      { title: "Cardio Conditioning", desc: "High-intensity interval systems, aerobic conditioning, and energy tracking.", icon: Compass },
      { title: "Flexibility & Recovery", desc: "Movement screen mobility, guided soft-tissue release, and structural recovery.", icon: Zap },
      { title: "Performance Mindset", desc: "Goal progression tracking, nutritional accountability, and active consistency.", icon: Sparkles }
    ],
    logistics: {
      duration: "60 Mins",
      frequency: "Flexible Slots"
    }
  }
};

const CardPattern = ({ theme }: { theme: string }) => {
  if (theme === 'football') {
    return <div className="absolute inset-0 turf-pattern opacity-[0.04] pointer-events-none -z-10" />;
  }
  if (theme === 'chess') {
    return (
      <>
        <div className="absolute inset-0 checkerboard-pattern opacity-[0.03] pointer-events-none -z-10" />
        <div className="absolute inset-[4px] border border-[#d4af37]/10 rounded-[2.3rem] pointer-events-none -z-10" />
      </>
    );
  }
  if (theme === 'dance') {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-purple-500/5 opacity-20 pointer-events-none -z-10" />
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl pointer-events-none -z-10 animate-pulse duration-[6s]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none -z-10 animate-pulse duration-[8s]" />
      </>
    );
  }
  if (theme === 'fitness') {
    return (
      <>
        <div className="absolute inset-0 scanline-pattern opacity-[0.05] pointer-events-none -z-10" />
        <div className="absolute top-0 right-0 w-2 h-16 bg-[#f97316]/40 pointer-events-none -z-10" />
      </>
    );
  }
  return null;
};

export default function ProgramDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const programId = params?.id;

  const [program, setProgram] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Advanced Form steps (Step 1: Profile, Step 2: Parent, Step 3: Plan Selection)
  const [formStep, setFormStep] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoUploading, setPhotoUploading] = useState(false);

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
      // Default price selection if program loaded
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

  // Detect visual theme
  const getTheme = () => {
    if (!program) return 'fitness';
    const name = program.name.toLowerCase();
    if (name.includes('football') || name.includes('soccer')) return 'football';
    if (name.includes('chess')) return 'chess';
    if (name.includes('dance') || name.includes('ballet')) return 'dance';
    return 'fitness';
  };

  const theme = getTheme();

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

  // Theme styling configurations
  const themeStyles = {
    football: {
      bg: 'bg-gradient-to-b from-[#071704] via-[#020501] to-[#000000]',
      accentColor: 'text-[#22c55e]',
      borderColor: 'border-[#22c55e]/30',
      btnGradient: 'from-[#22c55e] to-[#15803d] hover:from-[#4ade80] hover:to-[#22c55e] text-white',
      heroOverlay: 'from-[#071704]/95 via-[#071704]/50 to-transparent',
      glow: 'bg-[#22c55e]/15',
      badgeBg: 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30',
      titleFont: 'font-sans font-black italic tracking-tighter uppercase',
      accentText: 'text-[#22c55e]',
      cardStyle: 'rounded-[2.5rem] border border-[#22c55e]/25 bg-gradient-to-br from-[#0c1809]/95 via-[#060e04]/98 to-black shadow-[0_12px_40px_rgba(34,197,94,0.06)] relative overflow-hidden transition-all duration-500',
      cardStyleSm: 'rounded-2xl border border-[#22c55e]/20 bg-[#0c1809]/40 relative overflow-hidden p-6 transition-all duration-300 group hover:border-[#22c55e]/40',
      badgeStyle: 'bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
      inputStyle: 'w-full px-4 py-3.5 rounded-xl border border-[#22c55e]/20 bg-[#060c05] text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 font-bold text-sm transition-all',
      textareaStyle: 'w-full px-4 py-3.5 rounded-xl border border-[#22c55e]/20 bg-[#060c05] text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 font-medium text-sm transition-all',
      inputBorder: 'border-[#22c55e]/20',
      inputBg: 'bg-[#060c05]',
      prefBtnActive: 'border-[#22c55e] bg-[#22c55e]/10 text-[#4ade80] font-bold text-xs py-3.5 rounded-xl text-center transition-all duration-300 scale-102 border-current',
      prefBtnInactive: 'border-white/5 bg-white/[0.01] hover:bg-white/5 text-white/40 font-bold text-xs py-3.5 rounded-xl text-center transition-all duration-300',
      priceCardActive: 'border-[#22c55e] bg-[#22c55e]/15 text-[#4ade80]',
      priceCardInactive: 'border-white/5 bg-[#060c05] text-white/50',
      cardWrapper: 'w-full',
      formCardBg: 'bg-[#0c1809]/95 backdrop-blur-xl'
    },
    chess: {
      bg: 'bg-gradient-to-b from-[#0f1115] via-[#16181d] to-[#07080a]',
      accentColor: 'text-[#d4af37]',
      borderColor: 'border-4 border-double border-[#d4af37]/35',
      btnGradient: 'from-[#d4af37] to-[#aa841c] hover:from-[#f3e8ff] hover:to-[#d4af37] hover:text-[#121417] text-[#121417] font-black',
      heroOverlay: 'from-[#0f1115]/95 via-[#0f1115]/40 to-transparent',
      glow: 'bg-[#d4af37]/10',
      badgeBg: 'bg-white/5 text-[#d4af37] border-white/10',
      titleFont: 'font-brand tracking-widest uppercase',
      accentText: 'text-[#d4af37]',
      cardStyle: 'rounded-[2.5rem] border-4 border-double border-[#d4af37]/35 bg-gradient-to-br from-[#121417]/98 via-[#0f1115]/98 to-black shadow-[0_12px_40px_rgba(212,175,55,0.06)] relative overflow-hidden transition-all duration-500',
      cardStyleSm: 'rounded-2xl border-2 border-double border-[#d4af37]/25 bg-[#121417]/40 relative overflow-hidden p-6 transition-all duration-300 group hover:border-[#d4af37]/45',
      badgeStyle: 'bg-white/5 text-[#d4af37] border border-[#d4af37]/30 px-3 py-1 rounded-full text-[10px] font-brand tracking-wider uppercase',
      inputStyle: 'w-full px-4 py-3.5 rounded-xl border border-white/10 bg-[#181a20] text-white placeholder-white/20 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 font-medium text-sm transition-all',
      textareaStyle: 'w-full px-4 py-3.5 rounded-xl border border-white/10 bg-[#181a20] text-white placeholder-white/20 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 font-medium text-sm transition-all',
      inputBorder: 'border-white/10',
      inputBg: 'bg-[#181a20]',
      prefBtnActive: 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] font-brand font-bold text-xs py-3.5 rounded-xl text-center transition-all duration-300 scale-102 border-current tracking-wider uppercase',
      prefBtnInactive: 'border-white/5 bg-white/[0.01] hover:bg-white/5 text-white/40 font-brand font-bold text-xs py-3.5 rounded-xl text-center transition-all duration-300 tracking-wider uppercase',
      priceCardActive: 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]',
      priceCardInactive: 'border-white/5 bg-[#181a20] text-white/50',
      cardWrapper: 'bg-[repeating-conic-gradient(#121417_0_25%,rgba(212,175,55,0.06)_0_50%)] [background-size:16px_16px] p-[6px] rounded-[2.8rem] w-full',
      formCardBg: 'bg-[#121417]/95 backdrop-blur-xl'
    },
    dance: {
      bg: 'bg-gradient-to-b from-[#180928] via-[#0b0314] to-[#000000]',
      accentColor: 'text-[#ec4899]',
      borderColor: 'border-[#ec4899]/30',
      btnGradient: 'from-[#ec4899] to-[#a21caf] hover:from-[#f472b6] hover:to-[#ec4899] text-white',
      heroOverlay: 'from-[#180928]/95 via-[#180928]/50 to-transparent',
      glow: 'bg-[#ec4899]/20',
      badgeBg: 'bg-[#ec4899]/20 text-[#f472b6] border-[#ec4899]/30',
      titleFont: 'font-display font-black tracking-tight uppercase',
      accentText: 'text-[#ec4899]',
      cardStyle: 'rounded-[3rem] border border-[#ec4899]/30 bg-gradient-to-br from-[#1f0f35]/90 via-[#130722]/95 to-black shadow-[0_12px_40px_rgba(236,72,153,0.06)] relative overflow-hidden backdrop-blur-2xl transition-all duration-500',
      cardStyleSm: 'rounded-[2rem] border border-[#ec4899]/20 bg-[#1f0f35]/40 relative overflow-hidden p-6 backdrop-blur-md transition-all duration-300 group hover:border-[#ec4899]/40',
      badgeStyle: 'bg-[#ec4899]/15 text-[#f472b6] border border-[#ec4899]/30 px-3 py-1 rounded-full text-[10px] font-display font-black tracking-tight uppercase',
      inputStyle: 'w-full px-5 py-3.5 rounded-full border border-[#ec4899]/20 bg-[#130722] text-white placeholder-white/20 focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899]/30 font-bold text-sm transition-all',
      textareaStyle: 'w-full px-5 py-3.5 rounded-[2rem] border border-[#ec4899]/20 bg-[#130722] text-white placeholder-white/20 focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899]/30 font-medium text-sm transition-all',
      inputBorder: 'border-[#ec4899]/20',
      inputBg: 'bg-[#130722]',
      prefBtnActive: 'border-[#ec4899] bg-[#ec4899]/15 text-[#f472b6] font-display font-black text-xs py-3.5 rounded-full text-center transition-all duration-300 scale-102 border-current tracking-wider uppercase',
      prefBtnInactive: 'border-[#ec4899]/10 bg-[#130722] text-[#f472b6]/40 font-display font-black text-xs py-3.5 rounded-full text-center transition-all duration-300 tracking-wider uppercase',
      priceCardActive: 'border-[#ec4899] bg-[#ec4899]/20 text-[#f472b6]',
      priceCardInactive: 'border-white/5 bg-[#130722] text-white/50',
      cardWrapper: 'w-full',
      formCardBg: 'bg-[#1f0f35]/90 backdrop-blur-xl font-sans'
    },
    fitness: {
      bg: 'bg-gradient-to-b from-[#0b0c0e] via-[#121316] to-[#000000]',
      accentColor: 'text-[#f97316]',
      borderColor: 'border-white/10',
      btnGradient: 'from-[#f97316] to-[#c2410c] hover:from-[#fdba74] hover:to-[#f97316] text-white',
      heroOverlay: 'from-[#0b0c0e]/95 via-[#0b0c0e]/40 to-transparent',
      glow: 'bg-[#f97316]/15',
      badgeBg: 'bg-white/5 text-[#f97316] border-white/10',
      titleFont: 'font-mono tracking-tighter uppercase font-black italic',
      accentText: 'text-[#f97316]',
      cardStyle: 'rounded-lg border border-white/10 border-l-4 border-l-[#f97316] bg-gradient-to-br from-[#131418]/98 via-[#0d0e10]/99 to-black shadow-[0_12px_40px_rgba(249,115,22,0.06)] relative overflow-hidden transition-all duration-500',
      cardStyleSm: 'rounded-sm border border-white/5 border-l-2 border-l-[#f97316] bg-[#0d0e10]/60 relative overflow-hidden p-6 transition-all duration-300 group hover:border-white/15',
      badgeStyle: 'bg-white/5 text-[#f97316] border border-[#f97316]/30 px-3 py-1 rounded-sm text-[10px] font-mono tracking-tighter uppercase font-black',
      inputStyle: 'w-full px-4 py-3.5 rounded-sm border border-white/10 bg-[#0d0e10] text-white placeholder-white/20 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/30 font-mono text-sm transition-all',
      textareaStyle: 'w-full px-4 py-3.5 rounded-sm border border-white/10 bg-[#0d0e10] text-white placeholder-white/20 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/30 font-mono text-sm transition-all',
      inputBorder: 'border-white/10',
      inputBg: 'bg-[#0d0e10]',
      prefBtnActive: 'border-[#f97316] bg-[#f97316]/10 text-[#f97316] font-mono font-black text-xs py-3.5 rounded-sm text-center transition-all duration-300 scale-102 border-current tracking-tighter italic uppercase',
      prefBtnInactive: 'border-white/5 bg-white/[0.01] hover:bg-white/5 text-white/40 font-mono font-black text-xs py-3.5 rounded-sm text-center transition-all duration-300 tracking-tighter italic uppercase',
      priceCardActive: 'border-[#f97316] bg-[#f97316]/15 text-[#f97316]',
      priceCardInactive: 'border-white/5 bg-[#0d0e10] text-white/50',
      cardWrapper: 'w-full',
      formCardBg: 'bg-[#131418]/95 backdrop-blur-xl font-mono'
    }
  }[theme];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoUploading(true);
      
      // Setup preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setPhotoUploading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      if (program.type === 'academy') {
        const age = parseInt(formData.participantAge);
        if (isNaN(age) || age < 4 || age > 18) {
          alert('Participant age must be between 4 and 18 for academies.');
          return;
        }
      }
      setFormStep(2);
    } else if (formStep === 2) {
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

      // 2. Insert as status = 'active' & payment_status = 'unpaid' directly to bypass STK Push
      const cleanPhone = formData.parentPhone.replace(/\s/g, '');

      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([{
          program_id: program.id,
          participant_name: formData.participantName,
          participant_age: parseInt(formData.participantAge) || null,
          client_phone: cleanPhone || '254700000000',
          status: 'active', // Triggers sheets sync immediately!
          payment_status: 'unpaid',
          gender: formData.gender,
          communication_pref: formData.communicationPref,
          passport_photo_url: passportUrl,
          prior_experience: formData.priorExperience,
          school_club: formData.schoolClub || null,
          medical_conditions: formData.medicalConditions || null,
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
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-gold animate-spin" />
          <p className="font-display font-bold text-gold tracking-tight animate-pulse uppercase">Loading Program...</p>
        </div>
      </div>
    );
  }

  if (!program) return null;

  return (
    <main className={`min-h-screen ${themeStyles.bg} transition-colors duration-500 relative overflow-hidden pb-32`}>
      {/* Immersive Dynamic Background Patterns */}
      {theme === 'football' && <SoccerPitchBackground />}
      {theme === 'chess' && <ChessBackground />}
      {theme === 'dance' && <DanceBackground />}
      {theme === 'fitness' && <FitnessBackground />}

      <div className={`absolute -right-40 -top-40 w-96 h-96 rounded-full blur-[150px] pointer-events-none -z-10 ${themeStyles.glow}`} />
      <div className={`absolute -left-40 bottom-40 w-96 h-96 rounded-full blur-[150px] pointer-events-none -z-10 ${themeStyles.glow}`} />

      {/* Program Details Banner Image (Landscape Cover) */}
      <div className="relative w-full h-[55vh] md:h-[60vh] overflow-hidden">
        {program.image_url ? (
          <img 
            src={program.image_url} 
            alt={program.name} 
            className="w-full h-full object-cover select-none scale-102 filter brightness-[0.8]" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-pitch via-forest-dark to-pitch flex items-center justify-center">
            <Trophy className="w-20 h-20 text-gold/10" />
          </div>
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${themeStyles.heroOverlay} z-1`} />
        
        {/* Navigation & General Info */}
        <div className="absolute inset-x-0 bottom-12 max-w-7xl mx-auto px-6 lg:px-10 z-10">
          <button 
            onClick={() => router.push('/programs')}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-6 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> All Programs
          </button>
          
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${themeStyles.badgeBg}`}>
              {program.type === 'academy' ? 'Youth Academy' : 'Adult Performance'}
            </div>
            <h1 className={`text-4xl md:text-6xl text-white leading-none ${themeStyles.titleFont}`}>
              {program.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-white/60">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> {formatSchedule(program.name, program.schedule)}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gold" /> {program.type === 'academy' ? 'Ages 6-16' : 'Ages 16+'}</span>
              {program.instructor?.name && (
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-gold" /> Coach {program.instructor.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Descriptions, Features, and Flyer (60%) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Outline Card */}
            <div className={`${themeStyles.cardStyle} p-8 md:p-12 shadow-2xl`}>
              <CardPattern theme={theme} />
              <h2 className={`text-2xl text-white uppercase tracking-tight mb-6 ${themeStyles.titleFont}`}>Program Overview</h2>
              <p className="text-white/60 text-lg leading-relaxed font-medium whitespace-pre-line">
                {program.description || "Join our high-performance program designed to challenge athletes, foster disciplined teamwork, and elevate core capabilities. Led by expert coaching facilitators in Nairobi's premier arena."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-gold border border-white/5">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">State-of-the-Art</h4>
                    <p className="text-xs text-white/40 mt-1">High-performance facility structures and training aids.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-gold border border-white/5">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Elite Pathway</h4>
                    <p className="text-xs text-white/40 mt-1">Dedicated curriculum tracking player development curves.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Parameters Box */}
            {PROGRAM_DETAILS_MAP[theme]?.logistics && (
              <div className={`${themeStyles.cardStyle} p-8 shadow-2xl grid grid-cols-2 gap-4 text-center divide-x divide-white/5`}>
                <CardPattern theme={theme} />
                <div className="px-2">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Session Length</p>
                  <p className={`text-base md:text-lg font-black mt-2 font-mono ${themeStyles.accentText}`}>
                    {PROGRAM_DETAILS_MAP[theme].logistics.duration}
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Frequency</p>
                  <p className="text-xs md:text-sm font-black text-white mt-2 uppercase tracking-wide">
                    {PROGRAM_DETAILS_MAP[theme].logistics.frequency}
                  </p>
                </div>
              </div>
            )}

            {/* Curriculum Pillars Grid */}
            {PROGRAM_DETAILS_MAP[theme]?.curriculum && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-1 bg-gold rounded-full" />
                  <h3 className={`text-xl text-white uppercase tracking-tight ${themeStyles.titleFont}`}>Structured Curriculum Pillars</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PROGRAM_DETAILS_MAP[theme].curriculum.map((pillar, index) => {
                    const PillarIcon = pillar.icon;
                    return (
                      <div key={index} className={`${themeStyles.cardStyleSm} shadow-lg relative group hover:scale-[1.02]`}>
                        <CardPattern theme={theme} />
                        <div className="flex items-start gap-4 relative z-10">
                          <div className={`p-3 rounded-xl border text-gold bg-white/5 group-hover:scale-110 transition-transform ${theme === 'dance' ? 'rounded-[1.2rem]' : theme === 'fitness' ? 'rounded-sm' : 'rounded-2xl'} ${themeStyles.borderColor}`}>
                            <PillarIcon className="w-5 h-5" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-white font-black text-sm uppercase tracking-wider">{pillar.title}</h4>
                            <p className="text-xs text-white/50 leading-relaxed font-medium">{pillar.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}



            {/* Poster / Flyer Showcase */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-1 bg-gold rounded-full" />
                <h3 className={`text-xl text-white uppercase tracking-tight ${themeStyles.titleFont}`}>Cohort Sharing Flyer</h3>
              </div>

              {program.poster_url ? (
                <div className={`${themeStyles.cardStyle} p-8 md:p-10 shadow-2xl relative group`}>
                  <CardPattern theme={theme} />
                  
                  <h3 className={`text-xl text-white uppercase tracking-tight mb-2 ${themeStyles.titleFont}`}>Program Flyer</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-6">Download and share with school cohorts or WhatsApp circles</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Poster Display */}
                    <div className="md:col-span-5 self-center w-full max-w-[320px] mx-auto relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                      <img 
                        src={program.poster_url} 
                        alt={`${program.name} Poster`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Actions Description */}
                    <div className="md:col-span-7 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-white font-black text-lg uppercase tracking-tight leading-tight">Spread the Word!</h4>
                        <p className="text-white/50 text-sm font-medium leading-relaxed">
                          Do you know friends, neighbors, or classmates who would love to join? Download this vertical poster and post it on your WhatsApp Status or share it directly!
                        </p>
                      </div>

                      <a 
                        href={program.poster_url} 
                        download={`${program.name}-poster.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-gold hover:text-pitch text-white px-6 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-md group-hover:shadow-gold-sm"
                      >
                        <ArrowDownToLine className="w-4 h-4 stroke-[2.5px]" /> DOWNLOAD FLYER
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`${themeStyles.cardStyle} p-8 md:p-10 shadow-2xl relative overflow-hidden group`}>
                  <CardPattern theme={theme} />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Visual Card Flyer mockup */}
                    <div className="md:col-span-5 self-center w-full max-w-[320px] mx-auto relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 p-6 flex flex-col justify-between group-hover:scale-[1.02] transition-transform duration-500">
                      <CardPattern theme={theme} />
                      {/* Checkered Borders for Chess */}
                      {theme === 'chess' && (
                        <div className="absolute inset-0 border-4 border-double border-[#d4af37]/40 rounded-3xl pointer-events-none" />
                      )}
                      {/* Technical outline for Fitness */}
                      {theme === 'fitness' && (
                        <div className="absolute inset-0 border border-dashed border-[#f97316]/30 rounded-3xl pointer-events-none" />
                      )}

                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${themeStyles.badgeBg}`}>
                            MVSA 2026
                          </span>
                          <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest font-mono">
                            #JOINTHESQUAD
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">ENROLL NOW</p>
                          <h4 className={`text-xl text-white leading-none ${themeStyles.titleFont}`}>
                            {program.name}
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="h-px bg-white/10" />
                        <div className="space-y-1">
                          <p className="text-[8px] text-white/35 font-bold uppercase tracking-widest">Class Schedule</p>
                          <p className="text-xs font-black text-white uppercase tracking-wider">
                            {formatSchedule(program.name, program.schedule)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-white/60">
                          <span>Nairobi, Kenya</span>
                          <span className={`${themeStyles.accentText} font-black`}>SECURE SPOT</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Share */}
                    <div className="md:col-span-7 space-y-6">
                      <div className="space-y-2">
                        <h4 className={`text-white font-black text-lg uppercase tracking-tight leading-tight ${themeStyles.titleFont}`}>Spread the Word!</h4>
                        <p className="text-white/50 text-sm font-medium leading-relaxed">
                          We have generated an interactive digital invitation card for this cohort. Copy the customized enrollment link to invite classmates or post directly onto your social updates!
                        </p>
                      </div>

                      <button
                        onClick={handleCopyLink}
                        type="button"
                        className={`w-full inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-gold hover:text-pitch text-white px-6 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-md ${copied ? 'bg-gold text-pitch border-gold' : ''}`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3px]" /> COPIED LINK!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 stroke-[2.5px]" /> COPY INVITE LINK
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Advanced Registration Form (40%) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className={themeStyles.cardWrapper}>
              <div className={`${themeStyles.cardStyle} overflow-hidden shadow-2xl`}>
                <CardPattern theme={theme} />
                
                {/* Form Header */}
                <div className="p-8 border-b border-white/5 bg-white/[0.01] text-white flex justify-between items-center">
                  <div>
                    <h3 className={`text-xl tracking-tight text-white uppercase ${themeStyles.titleFont}`}>RESERVE A SPOT</h3>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${themeStyles.accentText}`}>Secure Enrollment Instantly</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/15 text-[10px] font-black uppercase text-white/60 tracking-wider">
                    <Lock className={`w-3 h-3 ${themeStyles.accentText}`} /> SECURE
                  </div>
                </div>

                {/* Progress Steps Header */}
                <div className="px-8 py-4 flex items-center justify-between bg-white/[0.005] border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">
                  <span className={formStep >= 1 ? themeStyles.accentColor : ''}>1. Athlete</span>
                  <ChevronRight className="w-3 h-3 text-white/10" />
                  <span className={formStep >= 2 ? themeStyles.accentColor : ''}>2. Parent</span>
                  <ChevronRight className="w-3 h-3 text-white/10" />
                  <span className={formStep >= 3 ? themeStyles.accentColor : ''}>3. Pathway</span>
                </div>

                {/* Step Forms */}
                {registrationSuccess ? (
                  /* Success View */
                  <div className="p-10 text-center animate-entrance">
                    <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className={`text-3xl text-white mb-3 tracking-tighter uppercase leading-tight text-center ${themeStyles.titleFont}`}>YOU ARE ENROLLED!</h4>
                    <p className="text-white/60 mb-8 text-sm leading-relaxed font-medium">
                      Congratulations! <strong>{formData.participantName}</strong> has been successfully registered to the <strong>{program.name}</strong>.
                      <br/><br/>
                      Our team (Charles or Karlmax) will contact you shortly via <span className={`uppercase font-bold ${themeStyles.accentText}`}>{formData.communicationPref}</span> to arrange orientation.
                    </p>
                    <button 
                      onClick={() => router.push('/programs')}
                      className={`w-full py-4.5 bg-gradient-to-r ${themeStyles.btnGradient} rounded-2xl font-black text-xs tracking-widest uppercase transition-all duration-300 active:scale-95`}
                    >
                      RETURN TO CATALOG
                    </button>
                  </div>
                ) : (
                  <form onSubmit={formStep < 3 ? handleNextStep : submitEnrollment} className="p-8 space-y-6">
                    
                    {/* Step 1: Athlete/Participant Profile */}
                    {formStep === 1 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        
                        {/* Name */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                            <User className={`w-3 h-3 ${themeStyles.accentText}`} /> Participant Name
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

                        {/* Age & Gender */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2 col-span-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                              <Calendar className={`w-3 h-3 ${themeStyles.accentText}`} /> Age
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
                          <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                              <Compass className={`w-3 h-3 ${themeStyles.accentText}`} /> Gender
                            </label>
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
                        </div>

                        {/* School & Club */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                            <Compass className={`w-3 h-3 ${themeStyles.accentText}`} /> School or Club
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. Kilimani Primary School"
                            value={formData.schoolClub}
                            onChange={(e) => setFormData({...formData, schoolClub: e.target.value})}
                            className={themeStyles.inputStyle}
                          />
                        </div>

                        {/* Prior Experience */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                            <Trophy className={`w-3 h-3 ${themeStyles.accentText}`} /> Prior Sport Experience
                          </label>
                          <div className="space-y-2">
                            {[
                              { val: 'Beginner', label: 'Beginner', desc: 'No prior team or formal training' },
                              { val: 'Intermediate', label: 'Intermediate', desc: 'School team, club or recreational play' },
                              { val: 'Advanced', label: 'Advanced', desc: 'Elite Academy or high-level competition' }
                            ].map((exp) => {
                              const isSelected = formData.priorExperience === exp.val;
                              return (
                                <button
                                  key={exp.val}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, priorExperience: exp.val })}
                                  className={`w-full text-left p-4 transition-all duration-500 flex justify-between items-center gap-4 relative overflow-hidden ${
                                    theme === 'dance' ? 'rounded-[1.5rem]' : theme === 'fitness' ? 'rounded-sm' : 'rounded-2xl'
                                  } ${
                                    isSelected
                                      ? `${themeStyles.priceCardActive} shadow-lg shadow-black/40 border-current scale-[1.01]`
                                      : `${themeStyles.priceCardInactive} hover:border-white/10 hover:bg-white/[0.02]`
                                  }`}
                                >
                                  <CardPattern theme={theme} />
                                  <div className="relative z-10">
                                    <p className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-white/60'} ${theme === 'chess' ? 'font-brand' : ''}`}>{exp.label}</p>
                                    <p className="text-[9px] text-white/30 font-medium mt-0.5">{exp.desc}</p>
                                  </div>
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 relative z-10 ${isSelected ? 'border-current' : 'border-white/20'}`}>
                                    {isSelected && <div className="w-2 h-2 bg-current rounded-full" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Medical Conditions */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                            <ShieldAlert className={`w-3 h-3 ${themeStyles.accentText}`} /> Medical History / Allergies
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="e.g. Asthma, allergies, past operations (or leave blank)"
                            value={formData.medicalConditions}
                            onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                            className={themeStyles.textareaStyle}
                          />
                        </div>

                        {/* Passport Photo Upload */}
                        <div className="space-y-2 border-t border-white/5 pt-4">
                          <label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${themeStyles.accentText}`}>
                            <Upload className="w-3 h-3" /> Passport Photo of Child
                          </label>
                          
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden relative shrink-0">
                              {photoPreview ? (
                                <img src={photoPreview} alt="Passport Crop" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-white/20" />
                              )}
                            </div>
                            
                            <div className="relative flex-1">
                              <div className={`w-full px-4 py-3.5 border hover:bg-white/10 hover:border-gold/20 flex items-center justify-between cursor-pointer transition-colors text-xs font-bold text-white/60 ${theme === 'dance' ? 'rounded-full' : theme === 'fitness' ? 'rounded-sm' : 'rounded-xl'} ${themeStyles.inputBorder} ${themeStyles.inputBg}`}>
                                <span>{photoFile ? photoFile.name : 'Select passport image'}</span>
                                <Upload className="w-4 h-4 text-white/40" />
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
                            <label className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                              <User className={`w-3 h-3 ${themeStyles.accentText}`} /> Parent / Guardian Name
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
                          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                            <Phone className={`w-3 h-3 ${themeStyles.accentText}`} /> Phone Number (M-Pesa Primary)
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
                          <label className="text-[10px] font-black uppercase tracking-wider text-white/40">Preferred Channel for Progress & Attendance Logs</label>
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
                                  className={`flex flex-col items-center justify-center p-4 border transition-all duration-300 text-center gap-2 relative overflow-hidden ${
                                    theme === 'dance' ? 'rounded-[1.5rem]' : theme === 'fitness' ? 'rounded-sm' : 'rounded-2xl'
                                  } ${isSel ? `${themeStyles.prefBtnActive} font-black` : `${themeStyles.prefBtnInactive}`}`}
                                >
                                  <CardPattern theme={theme} />
                                  <Icon className={`w-4 h-4 relative z-10 ${isSel ? themeStyles.accentColor : 'text-white/30'}`} />
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
                        <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Select Academy Pricing Plan</label>
                        
                        <div className="space-y-3">
                          {Object.entries(program.pricing_json).map(([key, value]) => {
                            if (!value || (value as number) === 0) return null;
                            const isActive = formData.pricingPlan === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setFormData({ ...formData, pricingPlan: key })}
                                className={`w-full flex items-center justify-between p-5 border text-left transition-all duration-500 hover:scale-[1.02] spring-bounce relative overflow-hidden ${
                                  theme === 'dance' ? 'rounded-[2rem]' : theme === 'fitness' ? 'rounded-sm' : 'rounded-2xl'
                                } ${
                                  isActive 
                                    ? `${themeStyles.priceCardActive} shadow-lg shadow-black/40 border-current` 
                                    : `${themeStyles.priceCardInactive} hover:border-white/10 hover:bg-white/[0.02]`
                                }`}
                              >
                                <CardPattern theme={theme} />
                                <div className="flex items-center gap-3 relative z-10">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? 'border-current' : 'border-white/20'}`}>
                                    {isActive && <div className="w-2 h-2 bg-current rounded-full" />}
                                  </div>
                                  <div>
                                    <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/60'} ${theme === 'chess' ? 'font-brand' : ''}`}>{key}</p>
                                    <p className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Commitment Option</p>
                                  </div>
                                </div>
                                
                                {/* Dashed Ticket Separator */}
                                <div className="flex-1 border-t border-dashed border-white/10 mx-4 relative z-10" />
                                
                                <p className={`text-xl font-display font-black tracking-tight shrink-0 relative z-10 ${isActive ? themeStyles.accentText : 'text-white font-mono'}`}>
                                  KES {value.toLocaleString()}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Summary Panel */}
                        <div className={`p-6 border text-white/80 space-y-2 mt-6 ${theme === 'dance' ? 'rounded-[2rem]' : theme === 'fitness' ? 'rounded-sm' : 'rounded-2xl'} ${themeStyles.borderColor} ${themeStyles.inputBg}`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white/60">Selected Pathway:</span>
                            <span className={`font-black uppercase tracking-widest ${themeStyles.accentColor} ${theme === 'chess' ? 'font-brand' : ''}`}>{formData.pricingPlan}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-2">
                            <span className="text-xs font-bold text-white/60">Amount Payable:</span>
                            <span className={`text-xl font-display font-black ${themeStyles.accentColor}`}>KES {(program.pricing_json as any)[formData.pricingPlan]?.toLocaleString() || 0}</span>
                          </div>
                        </div>

                        <div className="bg-white/3 border border-white/5 p-4 rounded-2xl flex gap-3 text-xs leading-normal">
                          <Compass className={`w-5 h-5 ${themeStyles.accentColor} shrink-0 mt-0.5`} />
                          <p className="text-white/40 font-medium">
                            Note: Your registration is submitted directly as active. Karlmax and Charles will reach out shortly for payment coordination.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Form Footer Buttons */}
                    <div className="pt-4 flex gap-4">
                      {formStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormStep(prev => prev - 1)}
                          className="px-6 py-4.5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-colors"
                        >
                          BACK
                        </button>
                      )}
                      
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4.5 bg-gradient-to-r ${themeStyles.btnGradient} rounded-2xl font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-md active:scale-97 disabled:opacity-50`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : formStep < 3 ? (
                          <>CONTINUE <ChevronRight className="w-4 h-4" /></>
                        ) : (
                          <>CONFIRM ENROLLMENT <ChevronRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
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
