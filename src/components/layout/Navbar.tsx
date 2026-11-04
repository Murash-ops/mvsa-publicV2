'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { shopIsListed } from '@/content/shop';
import ShopBag from '@/components/layout/ShopBag';

/**
 * Sticky navigation with the one primary action on the site: Book.
 * Below 1024px the links fold into a drawer behind a menu button, while Book
 * and the shop bag stay in the bar so they are one tap away on a phone.
 *
 * The drawer is rendered beside the header, not inside it: the header's
 * backdrop-filter makes it the containing block for fixed children, so a
 * drawer inside it is clipped to the header's own height and never shows.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The shop is listed only once its catalogue is real, so a draft or empty
  // shop can never be linked from the navigation by accident.
  const links = [
    { name: "What's on", href: '/whats-on' },
    { name: 'Programs', href: '/programs' },
    { name: 'Meeting room', href: '/book#meeting-room' },
    ...(shopIsListed ? [{ name: 'Shop', href: '/shop' }] : []),
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) =>
    !href.includes('#') && (pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)));

  // While the drawer is open, the page behind it stays put and Escape closes it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
    <header
      className="sticky top-0 z-50 border-b border-white/[0.08] bg-[rgba(14,28,20,0.92)] backdrop-blur-[14px]"
    >
      <div className="wrap flex h-20 items-center justify-between gap-3.5">
        <Link
          href="/"
          aria-label="Mountain View Sports Arena, home"
          className="flex min-h-11 items-center text-white hover:text-gold-light"
          onClick={() => setOpen(false)}
        >
          <Logo variant="emblem" width={96} decorative />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-[clamp(10px,2.2vw,30px)] lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`label inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-[15px] tracking-[0.08em] ${
                link.href === '/shop' ? 'shop-link' : ''
              } ${isActive(link.href) ? 'text-gold' : 'text-fog hover:text-gold-light'}`}
            >
              {link.href === '/shop' ? <ShopBag className="h-[22px] w-[22px] text-gold" /> : null}
              {link.name}
            </Link>
          ))}
          <Link href="/book" className="btn btn-sm shine" data-testid="nav-book">
            Book
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 lg:hidden">
          {shopIsListed ? (
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="shop-link label inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-1.5 text-[13px] tracking-[0.08em] text-fog hover:text-gold-light"
              aria-current={isActive('/shop') ? 'page' : undefined}
            >
              <ShopBag className="h-6 w-6 text-gold" />
              <span>Shop</span>
            </Link>
          ) : null}
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="btn btn-sm shine px-4 text-[14px]"
            data-testid="nav-book"
          >
            Book
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
    </header>

      {open && (
        <div
          id="mobile-menu"
          className="lg:hidden fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto border-t border-white/[0.08] bg-ink"
        >
          <nav aria-label="Mobile" className="wrap flex flex-col gap-1 py-6">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="display flex min-h-14 items-center border-b border-white/[0.08] text-[28px] text-white hover:text-gold"
            >
              Home
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`display flex min-h-14 items-center gap-3 border-b border-white/[0.08] text-[28px] ${
                  link.href === '/shop' ? 'shop-link' : ''
                } ${isActive(link.href) ? 'text-gold' : 'text-white hover:text-gold'}`}
              >
                {link.href === '/shop' ? <ShopBag className="h-7 w-7 text-gold" /> : null}
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
