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
        <path d="M17.472 14.382c-.02-.014-.578-.285-.668-.318-.09-.033-.156-.05-.221.05-.065.1-.254.318-.312.385-.058.067-.117.075-.221.024-.105-.05-4.42-1.62-5.07-2.19-.053-.046-.077-.097-.022-.162.053-.062.22-.257.31-.386.09-.13.12-.22.18-.37.06-.15.03-.28-.01-.37-.04-.09-.37-.89-.5-.1.21-.1-.08-.03-.13-.06-.17-.07-.35-.08-.22-.05-.06.01-.15.04-.22.11-.07.07-.31.3-.31.74s.32.87.37.93c.05.07 1.91 2.92 4.63 4.1.65.28 1.15.45 1.55.57.65.21 1.25.18 1.72.11.53-.08 1.63-.67 1.86-1.31.23-.64.23-1.19.16-1.31-.07-.1-.23-.16-.46-.27zM12 2C6.48 2 2 6.48 2 12c0 1.91.54 3.7 1.48 5.24L2 22l4.9-1.28C8.36 21.55 10.12 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.63 0-3.17-.43-4.51-1.21l-.32-.19-2.99.78.8-2.9-.21-.34C4.1 14.93 3.6 13.51 3.6 12c0-4.63 3.77-8.4 8.4-8.4s8.4 3.77 8.4 8.4-3.77 8.4-8.4 8.4z" />
      </svg>
      
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-2xl bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </a>
  );
}
