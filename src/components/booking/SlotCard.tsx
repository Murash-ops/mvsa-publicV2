'use client';

import { TimeSlot } from '@/types/database';
import { Clock, Tag } from 'lucide-react';

interface SlotCardProps {
  slot: TimeSlot;
  isSelected: boolean;
  onToggle: (slot: TimeSlot) => void;
}

export default function SlotCard({ slot, isSelected, onToggle }: SlotCardProps) {
  const isBooked = slot.status === 'booked';
  const isHeld = slot.status === 'held';
  const isAvailable = slot.status === 'available';

  const statusStyles = {
    available: isSelected 
      ? 'bg-gold/10 border-gold shadow-lg shadow-gold/10 -translate-y-1' 
      : 'bg-white border-border-color hover:border-gold/50 hover:shadow-md hover:-translate-y-1',
    booked: 'bg-surface border-transparent opacity-60 cursor-not-allowed',
    held: 'bg-warning/5 border-warning/30 cursor-wait'
  };

  const getPrice = () => {
    // Assuming prices are hardcoded based on PRD if not in DB
    // Off-peak: 1500, Peak: 2000
    return slot.price_tier === 'peak' ? 2000 : 1500;
  };

  return (
    <button
      onClick={() => isAvailable && onToggle(slot)}
      disabled={!isAvailable}
      className={`
        relative w-full p-6 rounded-3xl border-2 text-left transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${statusStyles[slot.status]}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`
          p-2 rounded-xl 
          ${isSelected ? 'bg-gold text-forest' : 'bg-forest/5 text-forest'}
        `}>
          <Clock className="w-5 h-5" />
        </div>
        <span className={`
          text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border
          ${slot.price_tier === 'peak' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-green-100 text-green-700 border-green-200'}
        `}>
          {slot.price_tier.replace('_', '-')}
        </span>
      </div>

      <div className="space-y-1">
        <p className={`font-display font-bold text-xl italic ${isSelected ? 'text-forest' : 'text-forest'}`}>
          {slot.start_time} — {slot.end_time}
        </p>
        <div className="flex items-center gap-1.5">
          <Tag className={`w-3 h-3 ${isSelected ? 'text-forest/60' : 'text-muted'}`} />
          <p className={`text-sm font-bold ${isSelected ? 'text-forest/60' : 'text-muted'}`}>
            KES {getPrice().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Overlay */}
      {!isAvailable && (
        <div className="absolute top-2 right-2">
          <span className={`
            px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter
            ${isBooked ? 'bg-error text-white' : 'bg-warning text-white'}
          `}>
            {slot.status}
          </span>
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-forest rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
          <CheckIcon className="w-4 h-4 font-bold" />
        </div>
      )}
    </button>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
