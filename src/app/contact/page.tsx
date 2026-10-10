'use client';

import { useState } from 'react';
import { contact as venueContact, social } from '@/content/site';
import { isValidKenyanPhone } from '@/lib/booking/phone';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

// Brand icons removed from lucide-react v0.470+; inline SVG wrappers
const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTok = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

/**
 * The backend contract has no inquiries endpoint, so this page cannot store a
 * message and does not pretend to. The form composes the message and hands it
 * to the venue's WhatsApp line, which is where enquiries are actually read,
 * and says so before and after sending. See docs/backend-migration.md, gap 4.
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [handoverUrl, setHandoverUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const contacts = venueContact.channels.map((channel) => ({
    name: channel.name,
    value: channel.value,
    href: channel.href,
    icon: channel.href.startsWith('mailto:') ? Mail : Phone,
    color: "text-forest",
    bg: "bg-forest/5"
  }));

  const socialLinks = [
    { name: "Instagram", handle: `@${social.instagram}`, icon: Instagram, href: `https://instagram.com/${social.instagram}` },
    { name: "Facebook", handle: "MtView Sports Arena", icon: Facebook, href: `https://facebook.com/${social.facebook}` },
    { name: "TikTok", handle: `@${social.tiktok}`, icon: TikTok, href: `https://www.tiktok.com/@${social.tiktok}` },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMsg('Please populate all inputs before sending.');
      return;
    }

    if (!isValidKenyanPhone(formData.phone)) {
      setErrorMsg('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx or 01xxxxxxxx).');
      return;
    }

    // Nothing is stored here: the message is handed to WhatsApp, which is the
    // channel the venue actually reads.
    const message = `Hi MVSA \u{1F44B} ${formData.message.trim()}\n\nMy name is ${formData.name.trim()}, my number is ${formData.phone.trim()}.`;
    const url = `https://wa.me/${venueContact.whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setHandoverUrl(url);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 bg-transparent text-charcoal">
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[160px] pointer-events-none select-none -z-10" />
      <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-forest/5 rounded-full blur-[120px] pointer-events-none select-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <header className="mb-16 space-y-4 text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-none mb-2">
            <Send className="w-4 h-4 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Contact Channels</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tighter leading-none uppercase">
            Connect With <span className="text-gold">The Arena</span>
          </h1>
          <p className="text-charcoal-light text-lg max-w-2xl leading-relaxed font-medium">
            Whether you have an event query, seek custom fitness package pricing, or want to drop in, send us a secure message.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Coordinates */}
          <div className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {contacts.map((contact, i) => (
                <a 
                  key={i} 
                  href={contact.href}
                  className="flex items-center gap-6 p-6 glass rounded-none border border-white/10 hover:border-gold hover:shadow-gold-sm bg-card transition-all duration-300 group spring-bounce"
                >
                  <div className={`w-14 h-14 bg-white/10 text-white rounded-none border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                    <contact.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[10px] font-bold text-charcoal-light/50 uppercase tracking-widest mb-1">{contact.name}</p>
                    <p className="font-display font-bold text-white transition-colors group-hover:text-gold text-lg uppercase leading-none">
                      {contact.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-8 glass rounded-none text-charcoal space-y-6 border border-white/10 shadow-pitch text-left bg-card">
              <div className="flex items-center gap-3 text-white mb-2 border-b border-white/5 pb-2">
                <Clock className="w-5 h-5 text-gold" />
                <span className="text-xs font-bold uppercase tracking-widest">Operating hours</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-sm font-semibold text-charcoal-light">Monday — Sunday</span>
                  <span className="text-sm font-bold text-gold font-mono">06:00 AM — 11:00 PM</span>
                </div>
                <p className="text-xs text-charcoal-light/75 leading-relaxed font-medium">
                  Pitch lights engage automatically at dusk. Facilities close strictly at 11:00 PM.
                </p>
              </div>
            </div>

            {/* Social Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 p-2 sm:p-3 md:p-4 glass rounded-none border border-white/10 hover:border-gold hover:shadow-gold-sm bg-card transition-all duration-300 group spring-bounce min-w-0 w-full"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 text-white rounded-none flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-all duration-300 border border-white/10 shrink-0">
                      {social.name === "TikTok" ? (
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                        </svg>
                      ) : (
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-[7px] sm:text-[9px] font-bold text-charcoal-light/50 uppercase tracking-tighter leading-none">{social.name}</p>
                      <p className="text-[9px] sm:text-xs font-bold text-white group-hover:text-gold truncate">{social.handle}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="glass p-8 rounded-none border border-white/10 shadow-pitch space-y-6 relative overflow-hidden bg-card">
              <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <MessageSquare className="w-5 h-5 text-gold" />
                Drop Us A Message
              </h2>

              <p className="text-xs text-charcoal-light font-medium leading-relaxed border border-white/10 bg-white/5 p-3" data-testid="inquiry-disclosure">
                Messages are not stored on this site. Pressing send opens WhatsApp with your
                message ready, so it reaches reception on the line they actually watch.
              </p>

              {handoverUrl ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300" data-testid="inquiry-handover">
                  <div className="w-16 h-16 rounded-none bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase text-white">Your message is ready in WhatsApp</h3>
                  <p className="text-charcoal-light text-sm max-w-sm font-medium">
                    Send it in WhatsApp and reception will reply there. Nothing was stored on this
                    site, so the message only reaches us once you send it.
                  </p>
                  <a
                    href={handoverUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 px-6 py-3 bg-gold hover:bg-gold-muted text-forest-dark border border-gold rounded-none font-extrabold text-xs tracking-widest uppercase transition-all"
                  >
                    Open WhatsApp again
                  </a>
                  <a
                    href={venueContact.bookingsPhoneHref}
                    className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-gold transition-colors"
                  >
                    Or call {venueContact.bookingsPhone}
                  </a>
                  <button 
                    onClick={() => setHandoverUrl(null)}
                    className="mt-4 px-6 py-2.5 bg-forest hover:bg-forest-light text-white rounded-none font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Write another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/25 text-red-600 p-4 rounded-none text-xs font-bold tracking-wide uppercase">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white/80">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Jane Wanjiku"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 rounded-none border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-gold focus:outline-none font-medium text-sm transition-all focus:ring-1 focus:ring-gold/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white/80">Phone Number (Kenyan Format)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="07xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-4 rounded-none border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-gold focus:outline-none font-mono text-sm transition-all focus:ring-1 focus:ring-gold/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white/80">Message Details</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Enter details about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-5 py-4 rounded-none border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-gold focus:outline-none font-medium text-sm transition-all focus:ring-1 focus:ring-gold/30 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2.5 px-8 py-5 bg-gold hover:bg-gold-muted text-forest-dark border border-gold rounded-none font-extrabold text-xs tracking-[0.15em] uppercase hover:shadow-gold-sm active:scale-98 transition-all cursor-pointer"
                    data-testid="inquiry-submit"
                  >
                    SEND ON WHATSAPP
                    <Send className="w-4 h-4 text-forest-dark stroke-[2.5px]" />
                  </button>
                </form>
              )}
            </div>

            {/* Location Map Card below the form */}
            <div className="glass p-4 rounded-none border border-white/10 shadow-pitch h-[280px] relative overflow-hidden group bg-card">
              <iframe 
                src={venueContact.mapsEmbedUrl}
                className="w-full h-full rounded-none border-0 grayscale hover:grayscale-0 transition-all duration-700 pointer-events-auto" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 glass backdrop-blur-md border border-white/10 rounded-none flex items-start gap-3 shadow-pitch bg-card/90">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-bold text-white text-base uppercase leading-none mb-1">Mountain View Sports Arena</p>
                  <p className="text-[11px] text-charcoal-light leading-normal font-medium">
                    Behind Mountain View Mall, Waiyaki Way, Nairobi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
