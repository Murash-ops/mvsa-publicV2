'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export default function ContactPage() {
  const supabase = createClient();
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const contacts = [
    { 
      name: "Arena Bookings (Turf)", 
      value: "0798 258 950", 
      href: "tel:0798258950",
      icon: Phone, 
      color: "text-forest", 
      bg: "bg-forest/5" 
    },
    { 
      name: "Academy & Programs", 
      value: "0116 619 476", 
      href: "tel:0116619476",
      icon: Phone, 
      color: "text-forest", 
      bg: "bg-forest/5" 
    },
    { 
      name: "Secondary Line", 
      value: "0783 209 442", 
      href: "tel:0783209442",
      icon: Phone, 
      color: "text-forest", 
      bg: "bg-forest/5" 
    },
    { 
      name: "Official Email", 
      value: "mtviewsportsarena@gmail.com", 
      href: "mailto:mtviewsportsarena@gmail.com",
      icon: Mail, 
      color: "text-forest", 
      bg: "bg-forest/5" 
    },
  ];

  const socialLinks = [
    { name: "Instagram", handle: "@mtviewsportsarena", icon: Instagram, href: "https://instagram.com/mtviewsportsarena" },
    { name: "Facebook", handle: "MtView Sports Arena", icon: Facebook, href: "https://facebook.com/mtviewsportsarena" },
    { name: "TikTok", handle: "@mountainviewsportsarena", icon: Instagram, href: "https://www.tiktok.com/@mountainviewsportsarena" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    // Form Validations
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMsg('Please populate all inputs before sending.');
      setIsSubmitting(false);
      return;
    }

    // Phone validation checking (Kenyan formats)
    const phoneClean = formData.phone.trim().replace(/\s+/g, '');
    const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phoneClean)) {
      setErrorMsg('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx or 01xxxxxxxx).');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([{
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          status: 'unread'
        }]);

      if (error) throw error;
      
      setIsSuccess(true);
      setFormData({ name: '', phone: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 bg-surface text-charcoal">
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[160px] pointer-events-none select-none -z-10" />
      <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-forest/5 rounded-full blur-[120px] pointer-events-none select-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <header className="mb-16 space-y-4 text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-forest/5 border border-forest/12 rounded-none mb-2">
            <Send className="w-4 h-4 text-forest" />
            <span className="text-forest text-[10px] font-bold uppercase tracking-[0.2em]">Contact Channels</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-forest tracking-tighter leading-none uppercase">
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
                  className="flex items-center gap-6 p-6 glass rounded-none border border-forest/12 hover:border-gold hover:shadow-gold-sm bg-white transition-all duration-300 group spring-bounce"
                >
                  <div className={`w-14 h-14 ${contact.bg} ${contact.color} rounded-none border border-forest/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                    <contact.icon className="w-6 h-6 text-forest" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[10px] font-bold text-charcoal-light/50 uppercase tracking-widest mb-1">{contact.name}</p>
                    <p className="font-display font-bold text-forest transition-colors group-hover:text-gold text-lg uppercase leading-none">
                      {contact.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-8 glass rounded-none text-charcoal space-y-6 border border-forest/12 shadow-pitch text-left bg-white">
              <div className="flex items-center gap-3 text-forest mb-2 border-b border-forest/5 pb-2">
                <Clock className="w-5 h-5 text-gold" />
                <span className="text-xs font-bold uppercase tracking-widest">Operating hours</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-forest/5 pb-2">
                  <span className="text-sm font-semibold text-charcoal-light">Monday — Sunday</span>
                  <span className="text-sm font-bold text-gold font-mono">06:00 AM — 11:00 PM</span>
                </div>
                <p className="text-xs text-charcoal-light/75 leading-relaxed font-medium">
                  Pitch lights engage automatically at dusk. Facilities close strictly at 11:00 PM.
                </p>
              </div>
            </div>

            {/* Social Grid */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    className="flex-1 flex items-center gap-3 p-4 glass rounded-none border border-forest/12 hover:border-gold hover:shadow-gold-sm bg-white transition-all duration-300 group spring-bounce"
                  >
                    <div className="w-8 h-8 bg-forest/5 text-forest rounded-none flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-all duration-300 border border-forest/12 shrink-0">
                      {social.name === "TikTok" ? (
                        <svg className="w-4 h-4 text-forest group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                        </svg>
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-[9px] font-bold text-charcoal-light/50 uppercase tracking-tighter leading-none">{social.name}</p>
                      <p className="text-xs font-bold text-forest truncate">{social.handle}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="glass p-8 rounded-none border border-forest/12 shadow-pitch space-y-6 relative overflow-hidden bg-white">
              <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-forest flex items-center gap-2 border-b border-forest/5 pb-3">
                <MessageSquare className="w-5 h-5 text-gold" />
                Drop Us A Message
              </h2>

              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-none bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase text-forest">Inquiry Logged successfully!</h3>
                  <p className="text-charcoal-light text-sm max-w-sm font-medium">
                    Thank you. Your message has been logged straight in our dashboard system. A representative will contact you shortly.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-4 px-6 py-2.5 bg-forest text-white hover:bg-forest-dark rounded-none font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Send another inquiry
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
                    <label className="text-xs font-black uppercase tracking-widest text-forest">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Jane Wanjiku"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 rounded-none border border-forest/12 bg-white text-charcoal placeholder-charcoal/40 focus:border-gold focus:outline-none font-medium text-sm transition-all focus:ring-1 focus:ring-gold/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-forest">Phone Number (Kenyan Format)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="07xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-4 rounded-none border border-forest/12 bg-white text-charcoal placeholder-charcoal/40 focus:border-gold focus:outline-none font-mono text-sm transition-all focus:ring-1 focus:ring-gold/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-forest">Message Details</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Enter details about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-5 py-4 rounded-none border border-forest/12 bg-white text-charcoal placeholder-charcoal/40 focus:border-gold focus:outline-none font-medium text-sm transition-all focus:ring-1 focus:ring-gold/30 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 px-8 py-5 bg-forest hover:bg-forest-dark text-white rounded-none font-extrabold text-xs tracking-[0.15em] uppercase hover:shadow-gold-sm active:scale-98 transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        SEND INQUIRY
                        <Send className="w-4 h-4 text-white stroke-[2.5px]" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Location Map Card below the form */}
            <div className="glass p-4 rounded-none border border-forest/12 shadow-pitch h-[280px] relative overflow-hidden group bg-white">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.15647573428!2d36.75!3d-1.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f19f6a6c42171%3A0x6b40e704043f053e!2sMountain%20View%20Mall!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske" 
                className="w-full h-full rounded-none border-0 grayscale hover:grayscale-0 transition-all duration-700 pointer-events-auto" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 glass backdrop-blur-md border border-forest/12 rounded-none flex items-start gap-3 shadow-pitch bg-white/90">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-bold text-forest text-base uppercase leading-none mb-1">Mountain View Sports Arena</p>
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
