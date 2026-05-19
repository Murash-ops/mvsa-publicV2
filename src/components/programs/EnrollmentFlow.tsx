'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  X, 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  MessageSquare,
  Phone,
  User,
  Calendar
} from 'lucide-react';

interface Program {
  id: number;
  name: string;
  type: string;
  pricing_json: {
    session: number;
    monthly?: number;
    term?: number;
  };
}

export default function EnrollmentFlow({ program, onClose }: { program: Program, onClose: () => void }) {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'polling' | 'success' | 'failed'>('idle');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    participantName: '',
    participantAge: '',
    clientPhone: '',
    plan: 'session'
  });

  const deposit = (program.pricing_json as any)[formData.plan] * 0.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      // Age validation for academy
      if (program.type === 'academy') {
        const age = parseInt(formData.participantAge);
        if (isNaN(age) || age < 4 || age > 18) {
          setErrorMessage('Participant age must be between 4 and 18 for academies.');
          return;
        }
      }
      setStep(2);
      return;
    }

    // Process Payment
    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    const cleanPhone = formData.clientPhone.replace(/\s/g, '');

    try {
      // 1. Create pending enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert([{
          program_id: program.id,
          participant_name: formData.participantName,
          participant_age: parseInt(formData.participantAge),
          client_phone: cleanPhone,
          status: 'pending',
          payment_status: 'unpaid'
        }])
        .select()
        .single();

      if (enrollError) throw enrollError;

      // 2. Trigger STK Push
      const { data: mpesaData, error: mpesaError } = await supabase.functions.invoke('mpesa-stk-push', {
        body: { 
          amount: deposit, 
          phoneNumber: cleanPhone,
          metadata: {
            enrollment_id: enrollment.id,
            program_name: program.name
          }
        }
      });

      if (mpesaError) throw mpesaError;
      if (mpesaData?.ResponseCode !== "0") throw new Error(mpesaData?.CustomerMessage || 'STK Push failed');

      // 3. Update enrollment with checkout ID
      await supabase
        .from('enrollments')
        .update({ checkout_request_id: mpesaData.CheckoutRequestID })
        .eq('id', enrollment.id);

      setCheckoutId(mpesaData.CheckoutRequestID);
      setPaymentStatus('polling');
    } catch (err: any) {
      setPaymentStatus('idle');
      setErrorMessage(err.message || 'Enrollment failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Polling logic (similar to BookingWidget)
  useEffect(() => {
    if (paymentStatus !== 'polling' || !checkoutId) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('status')
        .eq('checkout_request_id', checkoutId)
        .single();

      if (data?.status === 'active') {
        setPaymentStatus('success');
        setCheckoutId(null);
        clearInterval(interval);
      } else if (data?.status === 'cancelled') {
        setPaymentStatus('failed');
        setErrorMessage('Payment was cancelled or failed.');
        setCheckoutId(null);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentStatus, checkoutId]);

  return (
    <div className="fixed inset-0 bg-pitch/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-entrance">
      <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-slide-up relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[4rem] -z-10" />
        
        {/* Header with deep forest gradient */}
        <div className="p-10 flex justify-between items-center bg-gradient-to-br from-forest-dark via-forest to-forest-dark text-white relative overflow-hidden">
          <div className="absolute inset-0 turf-pattern opacity-20 mix-blend-overlay" />
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-gold rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Program Enrollment</span>
            </div>
            <h2 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">{program.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90 duration-500 relative z-10 border border-white/10"
            aria-label="Close enrollment"
          >
            <X className="w-6 h-6 text-gold" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-10 py-6 flex items-center gap-4 bg-surface/50 border-b border-forest/5">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${step >= 1 ? 'bg-forest text-gold' : 'bg-forest/5 text-forest/40'}`}>1</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-forest/40">Details</span>
          </div>
          <div className="h-px flex-1 bg-forest/10" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${step >= 2 ? 'bg-forest text-gold' : 'bg-forest/5 text-forest/40'}`}>2</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-forest/40">Payment</span>
          </div>
        </div>

        {paymentStatus === 'success' ? (
          <div className="p-14 text-center animate-entrance">
            <div className="w-24 h-24 bg-gold/10 text-gold rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-4xl font-display font-black text-forest mb-4 tracking-tighter uppercase leading-tight">Welcome to <br/>the Arena!</h3>
            <p className="text-charcoal-light mb-10 text-lg leading-relaxed font-medium">
              Your enrollment for <strong>{program.name}</strong> is confirmed. Prepare for greatness, <strong>{formData.participantName}</strong>.
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-forest hover:bg-forest-dark text-white py-5 rounded-[1.5rem] font-black tracking-[0.2em] uppercase shadow-2xl shadow-forest/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              Enter Dashboard
            </button>
          </div>
        ) : paymentStatus === 'polling' ? (
          <div className="p-14 text-center animate-entrance">
            <div className="relative w-20 h-20 mx-auto mb-10">
              <div className="absolute inset-0 border-4 border-forest/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Phone className="w-8 h-8 text-forest" />
              </div>
            </div>
            <h3 className="text-3xl font-display font-black text-forest mb-4 uppercase tracking-tighter">Awaiting PIN</h3>
            <p className="text-charcoal-light mb-8 text-lg font-medium opacity-80">
              Complete the <strong className="text-forest">KES {deposit.toLocaleString()}</strong> STK push on your device to finalize.
            </p>
            <div className="bg-forest/5 p-6 rounded-[2rem] border border-forest/10 inline-flex items-center gap-3">
              <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-forest uppercase tracking-[0.2em]">Secure Cloud Polling Active</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-forest/40 flex items-center gap-2">
                    <User className="w-3 h-3 text-gold" /> Participant Full Name
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter athlete's name"
                    value={formData.participantName}
                    onChange={(e) => setFormData({...formData, participantName: e.target.value})}
                    className="w-full px-6 py-5 rounded-2xl border border-forest/10 bg-surface/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 font-bold text-forest transition-all placeholder:text-forest/20 shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-forest/40 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gold" /> Athlete Age
                    </label>
                    <input 
                      required
                      type="number" 
                      placeholder="e.g. 12"
                      value={formData.participantAge}
                      onChange={(e) => setFormData({...formData, participantAge: e.target.value})}
                      className="w-full px-6 py-5 rounded-2xl border border-forest/10 bg-surface/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 font-bold text-forest transition-all placeholder:text-forest/20 shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-forest/40 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gold" /> Parent Phone
                    </label>
                    <input 
                      required
                      type="tel" 
                      placeholder="07XX..."
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      className="w-full px-6 py-5 rounded-2xl border border-forest/10 bg-surface/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 font-bold text-forest transition-all placeholder:text-forest/20 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-forest/40">Choose Your Pathway</label>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(program.pricing_json).map(([key, value]) => {
                      if (!value) return null;
                      const isActive = formData.plan === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData({...formData, plan: key})}
                          className={`
                            flex justify-between items-center p-6 rounded-[2rem] border-2 transition-all duration-500
                            ${isActive 
                              ? 'border-gold bg-gold/5 shadow-[0_0_30px_rgba(197,165,90,0.1)]' 
                              : 'border-forest/5 hover:border-forest/20 bg-surface'}
                          `}
                        >
                          <div className="text-left flex items-center gap-4">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-gold' : 'border-forest/20'}`}>
                              {isActive && <div className="w-2 h-2 bg-gold rounded-full" />}
                            </div>
                            <div>
                              <p className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-forest' : 'text-forest/60'}`}>{key}</p>
                              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Full Access</p>
                            </div>
                          </div>
                          <p className={`text-2xl font-display font-black ${isActive ? 'text-gold' : 'text-forest'}`}>
                            KES {value.toLocaleString()}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Glass Summary */}
                <div className="bg-forest-dark p-8 rounded-[2rem] relative overflow-hidden text-white shadow-2xl">
                  <div className="absolute inset-0 turf-pattern opacity-10" />
                  <div className="relative z-10 flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Required Deposit</p>
                      <p className="text-3xl font-display font-black tracking-tighter uppercase">50% Commitment</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-display font-black text-gold leading-none">KES {deposit.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">VAT Inclusive</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <p className="text-red-700 text-xs font-black uppercase tracking-widest">{errorMessage}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-4 bg-forest hover:bg-forest-dark text-white px-8 py-6 rounded-[1.5rem] font-black text-xs tracking-[0.3em] uppercase transition-all duration-500 shadow-2xl shadow-forest/20 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              ) : step === 1 ? (
                <>Next: Choose Plan <ChevronRight className="w-5 h-5 text-gold" /></>
              ) : (
                <>Pay via M-Pesa <ChevronRight className="w-5 h-5 text-gold" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
