'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { shopIsListed } from '@/content/shop';

/**
 * Sticky glass navigation with the shining gold call to action.
 * Below 1024px the links fold into a drawer behind a menu button.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The shop is listed only once its catalogue is real, so a draft or empty
  // shop can never be linked from the navigation by accident.
  const links = [
    { name: 'This week', href: '/#week' },
    { name: 'Programs', href: '/programs' },
    ...(shopIsListed ? [{ name: 'Shop', href: '/shop' }] : []),
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => !href.includes('#') && pathname === href;

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/[0.08] bg-[rgba(7,10,7,0.72)] backdrop-blur-[14px]"
    >
      <div className="wrap flex items-center justify-between gap-3.5 py-3">
        <Link
          href="/"
          aria-label="Mountain View Sports Arena, home"
          className="flex min-h-11 items-center text-white hover:text-gold-light"
          onClick={() => setOpen(false)}
        >
          <Logo variant="helmets" width={92} decorative />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-[clamp(10px,2.2vw,30px)] lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`label inline-flex min-h-11 items-center text-[17px] tracking-[0.08em] ${
                isActive(link.href) ? 'text-gold' : 'text-fog hover:text-gold-light'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/book" className="btn btn-sm shine">
            Book the Arena
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/book" className="btn btn-sm shine hidden px-4 text-[15px] sm:inline-flex">
            Book the Arena
          </Link>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center text-white hover:text-gold-light"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-7 w-7" aria-hidden /> : <Menu className="h-7 w-7" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto border-t border-white/[0.08] bg-ink/95 backdrop-blur-[14px]"
        >
          <nav aria-label="Mobile" className="wrap flex flex-col gap-1 py-6">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="display flex min-h-14 items-center border-b border-white/[0.08] text-[40px] text-white hover:text-gold"
            >
              Home
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`display flex min-h-14 items-center border-b border-white/[0.08] text-[40px] ${
                  isActive(link.href) ? 'text-gold' : 'text-white hover:text-gold'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/book" onClick={() => setOpen(false)} className="btn shine mt-6">
              Book the Arena
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
