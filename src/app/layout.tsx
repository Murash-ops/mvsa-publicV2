import type { Metadata } from "next";
import { DM_Sans, Cinzel, JetBrains_Mono, Outfit, Chakra_Petch, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  preload: false,
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
  preload: false,
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Mountain View Sports Arena | Play • Compete • Connect",
  description: "Nairobi's premium 5-aside football turf and recreational facility. Book your pitch today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${outfit.variable} ${cinzel.variable} ${jetbrainsMono.variable} ${chakraPetch.variable} ${spaceGrotesk.variable} font-sans antialiased bg-surface text-charcoal min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}

