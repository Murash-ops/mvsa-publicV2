import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

const bebas = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
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
  title: "Mountain View Sports Arena | Let's meet at the Arena",
  description:
    'Floodlit 5-aside at the Arena, behind Mountain View Mall on Waiyaki Way. Open every day, 08:00 to midnight. Book on WhatsApp.',
  openGraph: {
    title: "Let's meet at the Arena",
    description:
      'Floodlit 5-aside behind Mountain View Mall, Waiyaki Way. Open every day, 08:00 to midnight.',
    siteName: 'Mountain View Sports Arena',
    locale: 'en_KE',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#070A07',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebas.variable} ${barlow.variable} ${barlowCondensed.variable} min-h-screen flex flex-col`}
      >
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
