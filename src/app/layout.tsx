import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

// The display face of MVSA's design system (Big Shoulders, heaviest weight,
// display optical size). Variable, so one file covers every heading.
const shoulders = Big_Shoulders({
  variable: '--font-shoulders',
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  // next/font has no metrics for this family, so it cannot size a fallback.
  adjustFontFallback: false,
});

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL('http://localhost:3000');
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: 'Mountain View Sports Arena | Your home of football and fitness',
  description:
    'A covered, floodlit 5-aside pitch behind Mountain View Mall on Waiyaki Way, with the Academy, Chess Club, yoga, a meeting room and the Arena shop. Open every day, 6am to midnight.',
  openGraph: {
    title: 'Your home of football and fitness',
    description:
      'Floodlit 5-aside behind Mountain View Mall, Waiyaki Way. Open every day, 06:00 to midnight.',
    siteName: 'Mountain View Sports Arena',
    locale: 'en_KE',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E1C14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables sit on <html> so the theme tokens on :root can see them.
    <html lang="en" className={`${shoulders.variable} ${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
