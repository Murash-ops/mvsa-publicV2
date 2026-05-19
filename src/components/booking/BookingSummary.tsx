'use client';

import { TimeSlot } from '@/types/database';
import { ArrowRight, Calendar, Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface BookingSummaryProps {
  selectedSlots: TimeSlot[];
  onProceed: () => void;
}

export default function BookingSummary({ selectedSlots, onProceed }: BookingSummaryProps) {
  if (selectedSlots.length === 0) return null;

  const totalAmount = selectedSlots.reduce((sum, slot) => {
    const price = slot.price_tier === 'peak' ? 2000 : 1500;
    return sum + price;
  }, 0);

  const depositAmount = totalAmount * 0.5;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-forest rounded-[2.5rem] p-6 lg:p-8 shadow-2xl shadow-forest/40 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        
        <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10 w-full lg:w-auto">
          {/* Slot Count */}
          <div className="flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0 lg:pr-8 w-full lg:w-auto justify-center lg:justify-start">
            <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center border border-gold/30">
              <Calendar className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'}</p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Selected</p>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="flex gap-10">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-white font-bold text-xl tracking-tighter">KES {totalAmount.toLocaleString()}</p>
            </div>
            <div className="relative">
              <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">Deposit Due Now</p>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gold" />
                <p className="text-gold font-bold text-2xl tracking-tighter font-display italic">KES {depositAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onProceed}
          className="w-full lg:w-auto bg-gold hover:bg-gold-muted text-forest px-10 py-5 rounded-2xl font-bold text-lg tracking-widest uppercase transition-all shadow-xl shadow-gold/20 active:scale-95 flex items-center justify-center gap-3 relative z-10"
        >
          Proceed to Pay
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
