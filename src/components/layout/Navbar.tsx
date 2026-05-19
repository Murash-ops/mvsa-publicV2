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

  // Define dark-themed pages where white text is needed initially
  const isDarkPage = pathname === '/' || pathname === '/book';

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
      fixed top-0 left-0 right-0 z-50 transition-all duration-500
      ${isScrolled 
        ? 'bg-pitch/95 backdrop-blur-xl py-3 shadow-pitch' 
        : 'bg-transparent py-5'}
    `}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 bg-white rounded-xl p-1 shadow-sm transition-all duration-300 group-hover:scale-105 spring-bounce flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image src="/images/logo.png" alt="MVSA Logo" fill className="object-contain" priority unoptimized />
            </div>
          </div>
          <div>
            <h1 className={`font-brand font-bold text-xl lg:text-2xl transition-colors duration-500 tracking-tighter leading-none ${
              isScrolled || isDarkPage ? 'text-white' : 'text-forest'
            }`}>MVSA</h1>
            <p className="text-[10px] text-gold font-bold uppercase tracking-widest leading-none mt-1">Arena & Academy</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`
                relative text-sm font-bold tracking-widest uppercase transition-colors duration-500 py-2
                ${pathname === link.href 
                  ? 'text-gold' 
                  : (isScrolled || isDarkPage ? 'text-white/60 hover:text-white' : 'text-forest/60 hover:text-forest')}
              `}
            >
              {link.name}
              {/* Active underline indicator */}
              <span className={`
                absolute bottom-0 left-0 h-[2px] bg-gold rounded-full transition-all duration-300 spring-bounce
                ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}
              `} />
            </Link>
          ))}
          <Link 
            href="/book" 
            className={`
              bg-gold hover:bg-gold-muted text-pitch px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase 
              transition-all duration-300 shadow-gold-sm hover:shadow-gold-md active:scale-95 flex items-center gap-2 spring-bounce
              ${pathname === '/book' ? 'ring-2 ring-gold/30 ring-offset-2 ring-offset-pitch' : ''}
            `}
          >
            <CalendarDays className="w-4 h-4" />
            Book Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors ${
            isScrolled || isDarkPage ? 'text-white' : 'text-forest'
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu — Staggered Entrance */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-pitch/98 backdrop-blur-xl z-40 p-8">
          <div className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  text-2xl font-display font-bold tracking-tight py-3 px-4 rounded-2xl transition-all duration-300
                  animate-slide-up
                  ${pathname === link.href 
                    ? 'text-gold bg-gold/5 border-l-4 border-gold pl-6' 
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
              className="mt-6 bg-gold text-pitch py-5 rounded-2xl font-bold text-center text-lg tracking-widest uppercase shadow-gold-lg animate-slide-up"
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
