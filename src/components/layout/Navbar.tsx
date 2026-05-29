'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, CalendarDays } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Programs', href: '/programs' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-colors duration-300 transition-[padding] duration-300 border-b
      ${isScrolled 
        ? 'bg-forest-dark/85 backdrop-blur-xl py-3 border-white/5 shadow-gold-sm' 
        : 'bg-[#061a10]/80 backdrop-blur-md py-4 border-transparent'}
    `}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 bg-white rounded-none p-1 border border-white/20 transition-all duration-300 group-hover:scale-105 spring-bounce flex items-center justify-center shadow-sm">
            <div className="relative w-full h-full">
              <Image src="/images/logo.png" alt="MVSA Logo" fill className="object-contain" priority unoptimized />
            </div>
          </div>
          <div>
            <h1 className="font-brand font-bold text-xl lg:text-2xl transition-colors duration-500 tracking-tighter leading-none text-white">MVSA</h1>
            <p className="text-[9px] text-gold font-bold uppercase tracking-widest leading-none mt-1">Arena & Academy</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`
                group relative text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 py-2
                ${pathname === link.href 
                  ? 'text-gold' 
                  : 'text-white/80 hover:text-gold'}
              `}
            >
              {link.name}
              {/* Active underline indicator */}
              <span className={`
                absolute bottom-0 left-0 h-[2px] bg-gold transition-all duration-300 spring-bounce
                ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}
              `} />
            </Link>
          ))}
          <Link 
            href="/book" 
            className="bg-gold hover:bg-gold-muted text-forest-dark px-6 py-3 rounded-none font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-gold-sm active:scale-[0.98] flex items-center gap-2 spring-bounce border border-gold"
          >
            <CalendarDays className="w-4 h-4" />
            Book Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 hover:bg-white/10 rounded-none transition-colors text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[80px] bg-forest-dark/95 backdrop-blur-xl border-b border-white/10 p-8 shadow-lg">
          <div className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  text-lg font-display font-bold tracking-tight py-3 px-4 rounded-none transition-all duration-300
                  animate-slide-up
                  ${pathname === link.href 
                    ? 'text-gold bg-gold/5 border-l-4 border-gold pl-6 font-extrabold' 
                    : 'text-white hover:bg-white/5'}
                `}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/book" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-6 bg-gold hover:bg-gold-muted text-forest-dark py-5 rounded-none font-bold text-center text-md tracking-widest uppercase shadow-gold-sm animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
