import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Facebook, Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-pitch text-white pt-20 pb-10 overflow-hidden relative">
      {/* Decorative gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute inset-0 turf-pattern" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-14 h-14 bg-white rounded-xl p-1 shadow-sm transition-all duration-300 group-hover:scale-105 spring-bounce flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image src="/images/logo.png" alt="MVSA Logo" fill className="object-contain" unoptimized />
                </div>
              </div>
              <div>
                <h2 className="font-brand font-bold text-xl tracking-tighter leading-none text-white">MVSA</h2>
                <p className="text-[10px] text-gold font-bold uppercase tracking-widest leading-none mt-1">Arena & Academy</p>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Nairobi&apos;s premium sports destination for 5-aside football, group fitness, and youth development. Play, compete, and connect.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/mtviewsportsarena" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-gold rounded-xl flex items-center justify-center transition-all duration-300 group hover:shadow-gold-sm spring-bounce" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-white/60 group-hover:text-pitch group-hover:scale-110 transition-all duration-300" />
              </a>
              <a href="https://facebook.com/mtviewsportsarena" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-gold rounded-xl flex items-center justify-center transition-all duration-300 group hover:shadow-gold-sm spring-bounce" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-white/60 group-hover:text-pitch group-hover:scale-110 transition-all duration-300" />
              </a>
              <a href="https://tiktok.com/@mtviewsportsarena" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-gold rounded-xl flex items-center justify-center transition-all duration-300 group hover:shadow-gold-sm spring-bounce" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/60 group-hover:text-pitch group-hover:scale-110 transition-all duration-300">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.5-.7-.52-1.27-1.2-1.68-1.97-.22-.37-.36-.77-.47-1.19-.02 1.53-.01 3.05-.01 4.58-.02 3.2-.82 6.45-3.11 8.68-2.29 2.29-5.73 3.09-8.83 2.37-3.1-.72-5.7-3.08-6.65-6.08-.95-3-1.07-6.52.46-9.42C2.28 5.4 4.88 3.5 7.9 3.08c1.3-.18 2.63-.07 3.89.33v4.29c-.84-.26-1.77-.35-2.61-.17-1.42.3-2.66 1.34-3.18 2.69-.52 1.35-.46 2.92.16 4.21.62 1.29 1.94 2.19 3.36 2.34 1.42.15 2.9-.38 3.69-1.57.79-1.19.86-2.73.85-4.11V.02z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-gold">Explore</h3>
            <ul className="space-y-3">
              {[
                { href: '/book', label: 'Book a Pitch' },
                { href: '/programs', label: 'Our Programs' },
                { href: '/about', label: 'About the Facility' },
                { href: '/contact', label: 'Get in Touch' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/40 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm font-medium inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-gold">Programs</h3>
            <ul className="space-y-3">
              {['Football Academy', 'Zumba & Fitness', 'Chess Club', 'Martial Arts'].map(name => (
                <li key={name}>
                  <span className="text-white/40 text-sm font-medium">{name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-gold">Visit Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="text-white/40 text-sm leading-relaxed">Waiyaki Way, Behind Mountain View Mall, Kangemi, Nairobi</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="text-white/40 text-sm">0798 258 950 / 0783 209 442</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <a href="mailto:mtviewsportsarena@gmail.com" className="text-white/40 hover:text-gold transition-colors text-sm">
                  mtviewsportsarena@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/25 text-xs font-medium tracking-widest uppercase">
            © {currentYear} Mountain View Sports Arena. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-white/25 hover:text-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-300">Privacy</Link>
            <Link href="/terms" className="text-white/25 hover:text-gold text-[10px] font-bold uppercase tracking-widest transition-colors duration-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
