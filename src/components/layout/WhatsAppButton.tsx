'use client';

import { MessageSquare } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappNumber = "254798258950";
  const defaultMessage = "Hi MVSA! I'd like to inquire about booking a pitch.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-40 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-2xl shadow-2xl shadow-green-500/20 transition-all duration-300 hover:scale-110 active:scale-95 group flex items-center gap-3"
      aria-label="Contact us on WhatsApp"
    >
      <div className="hidden lg:block overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500 whitespace-nowrap px-0 group-hover:px-2">
        <span className="font-bold text-sm tracking-wide">CHAT WITH US</span>
      </div>
      <MessageSquare className="w-6 h-6 fill-white" />
      
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-2xl bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </a>
  );
}
