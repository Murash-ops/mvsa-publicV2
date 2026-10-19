import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { contact, social } from '@/content/site';
import { getAcademyPrograms } from '@/lib/academy-programs';

const pages = [
  { href: '/book', label: 'Book the Arena' },
  { href: '/programs', label: 'Programs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const linkClass = 'inline-flex min-h-11 items-center text-gold hover:text-gold-light';

export default function Footer() {
  const programs = getAcademyPrograms();

  return (
    <footer className="border-t border-white/[0.08]">
      <div className="wrap flex flex-col gap-9 pt-14 pb-10">
        <div className="grid gap-8 text-base leading-relaxed text-fog [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          <div className="flex flex-col gap-3">
            <Link href="/" aria-label="Mountain View Sports Arena, home" className="self-start text-gold hover:text-gold-light">
              <Logo variant="emblem" width={236} decorative />
            </Link>
            <span>{contact.addressLine}</span>
          </div>

          <div className="flex flex-col">
            <h2 className="label text-base tracking-[0.14em] text-white">Arena bookings</h2>
            <a href={contact.bookingsPhoneHref} className={linkClass}>{contact.bookingsPhone}</a>
            <a href={contact.secondPhoneHref} className={linkClass}>{contact.secondPhone}</a>
            <h2 className="label mt-4 text-base tracking-[0.14em] text-white">Academy</h2>
            <a href={contact.academyPhoneHref} className={linkClass}>{contact.academyPhone}</a>
            <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>{contact.email}</a>
          </div>

          <div className="flex flex-col">
            <h2 className="label text-base tracking-[0.14em] text-white">Programs</h2>
            <ul>
              {programs.map((program) => (
                <li key={program.id}>
                  <Link href={`/programs/${program.id}`} className={linkClass}>
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h2 className="label text-base tracking-[0.14em] text-white">Open</h2>
            <span className="min-h-11 py-2.5">{contact.hours}</span>
            <a
              href={`https://instagram.com/${social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              @{social.instagram}
            </a>
            <h2 className="label mt-4 text-base tracking-[0.14em] text-white">Pages</h2>
            <ul>
              {pages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className={linkClass}>
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
          <span className="label text-[15px] tracking-[0.2em] text-mute">Play · Compete · Connect</span>
          <span className="text-sm text-mute">© {new Date().getFullYear()} Mountain View Sports Arena</span>
        </div>
      </div>
    </footer>
  );
}
