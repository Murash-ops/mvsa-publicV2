import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Facebook, Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forest-dark text-white pt-20 pb-10 overflow-hidden relative border-t border-gold/15">
      {/* Background Decoration */}
      <div className="absolute inset-0 turf-pattern opacity-5" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-14 h-14 bg-white rounded-none p-1 shadow-sm transition-all duration-300 group-hover:scale-105 spring-bounce flex items-center justify-center border border-white/10">
                <div className="relative w-full h-full">
                  <Image src="/images/logo.png" alt="MVSA Logo" fill className="object-contain" unoptimized />
                </div>
              </div>
              <div>
                <h2 className="font-brand font-bold text-xl tracking-tighter leading-none text-white">MVSA</h2>
                <p className="text-[9px] text-gold font-bold uppercase tracking-widest leading-none mt-1">Arena & Academy</p>
              </div>
            </Link>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed max-w-xs font-medium">
              Nairobi&apos;s premium sports destination for 5-aside football, group fitness, and youth development. Play, compete, and connect.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/mtviewsportsarena" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-gold rounded-none flex items-center justify-center transition-all duration-300 group hover:shadow-gold-sm spring-bounce border border-white/10" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-white/70 group-hover:text-forest-dark group-hover:scale-110 transition-all duration-300" />
              </a>
              <a href="https://facebook.com/mtviewsportsarena" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-gold rounded-none flex items-center justify-center transition-all duration-300 group hover:shadow-gold-sm spring-bounce border border-white/10" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-white/70 group-hover:text-forest-dark group-hover:scale-110 transition-all duration-300" />
              </a>
              <a href="https://www.tiktok.com/@mountainviewsportsarena" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-gold rounded-none flex items-center justify-center transition-all duration-300 group hover:shadow-gold-sm spring-bounce border border-white/10" aria-label="TikTok">
                <svg className="w-5 h-5 text-white/70 group-hover:text-forest-dark group-hover:scale-110 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-[13px] text-gold uppercase tracking-widest">Explore</h3>
            <ul className="space-y-3">
              {[
                { href: '/book', label: 'Book a Pitch' },
                { href: '/programs', label: 'Our Programs' },
                { href: '/about', label: 'About the Facility' },
                { href: '/contact', label: 'Get in Touch' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-gold hover:translate-x-1 transition-all duration-300 text-xs uppercase tracking-wider font-bold inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-[13px] text-gold uppercase tracking-widest">Programs</h3>
            <ul className="space-y-3">
              {['Football Academy', 'Zumba & Fitness', 'Chess Club', 'Martial Arts'].map(name => (
                <li key={name}>
                  <span className="text-white/60 text-xs sm:text-sm font-medium">{name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-[13px] text-gold uppercase tracking-widest">Visit Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="text-white/65 text-xs sm:text-sm leading-relaxed font-medium">Waiyaki Way, Behind Mountain View Mall, Kangemi, Nairobi</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <p className="text-white/65 text-xs sm:text-sm font-medium leading-tight">Turf Bookings: 0798 258 950</p>
                  <p className="text-white/65 text-xs sm:text-sm font-medium leading-tight">Academy & Programs: 0116 619 476</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <a href="mailto:mtviewsportsarena@gmail.com" className="text-white/65 hover:text-gold transition-colors text-xs sm:text-sm font-medium">
                  mtviewsportsarena@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase">
            © {currentYear} Mountain View Sports Arena. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-white/30 hover:text-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-300">Privacy</Link>
            <Link href="/terms" className="text-white/30 hover:text-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
