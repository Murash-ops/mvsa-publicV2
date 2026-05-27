'use client';

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
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.963L2 22l5.21-1.366a9.97 9.97 0 0 0 4.8 1.234h.005c5.507 0 9.99-4.478 9.99-9.985C22.007 6.478 17.52 2 12.012 2zm6.066 14.225c-.27.755-1.57 1.385-2.155 1.455-.495.06-1.12.09-3.27-.795-2.75-1.135-4.52-3.92-4.655-4.105-.135-.185-1.12-1.49-1.12-2.84 0-1.355.7-2.02.945-2.295.245-.275.54-.34.72-.34h.515c.165 0 .39.06.595.555.205.5.7 1.71.76 1.835.06.125.1.27.015.435-.085.165-.13.27-.255.42-.125.15-.265.335-.38.45-.13.13-.265.27-.115.53.15.25.665 1.095 1.425 1.77.975.87 1.795 1.14 2.05 1.27.255.13.405.11.555-.065.15-.18.64-.745.815-1 .17-.255.34-.21.575-.125.24.085 1.515.715 1.775.845.26.13.435.195.495.305.06.11.06.64-.21 1.395z" />
      </svg>
      
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-2xl bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </a>
  );
}
