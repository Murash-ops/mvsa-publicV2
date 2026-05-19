import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  MessageSquare,
  Clock,
  Send,
  Shield
} from 'lucide-react';

export default function ContactPage() {
  const contacts = [
    { 
      name: "Arena Bookings", 
      phone: "0783 209 442", 
      icon: Phone, 
      color: "text-forest", 
      bg: "bg-forest/5" 
    },
    { 
      name: "Academy Inquiries", 
      phone: "0116 619 476", 
      icon: Shield, 
      color: "text-gold", 
      bg: "bg-gold/10" 
    },
    { 
      name: "WhatsApp Support", 
      phone: "0798 258 950", 
      icon: MessageSquare, 
      color: "text-[#25D366]", 
      bg: "bg-[#25D366]/10" 
    },
  ];

  const socialLinks = [
    { name: "Instagram", handle: "@mtviewsportsarena", icon: Instagram, href: "https://instagram.com/mtviewsportsarena" },
    { name: "Facebook", handle: "MVSA Arena", icon: Facebook, href: "https://facebook.com/mtviewsportsarena" },
  ];

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <header className="mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-forest/5 border border-forest/10 rounded-full">
            <Send className="w-4 h-4 text-forest" />
            <span className="text-forest text-[10px] font-bold uppercase tracking-[0.2em]">Get in Touch</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-forest tracking-tighter leading-[0.9] italic">
            READY TO <br/>
            <span className="text-gold">CONNECT?</span>
          </h1>
          <p className="text-charcoal-light text-lg max-w-2xl leading-relaxed font-medium">
            Whether you have a question about booking, want to enroll in an academy, or just want to say hi, we're here to help.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Methods */}
          <div className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {contacts.map((contact, i) => (
                <div key={i} className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-border-color shadow-sm hover:shadow-md transition-shadow group">
                  <div className={`w-14 h-14 ${contact.bg} ${contact.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <contact.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{contact.name}</p>
                    <p className="text-xl font-display font-bold text-forest italic">{contact.phone}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-forest rounded-[2rem] text-white space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-gold mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Opening Hours</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-sm font-medium text-white/60">Monday — Sunday</span>
                    <span className="text-sm font-bold">8:00 AM — 12:00 AM</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Last bookable slot starts at 11:00 PM daily.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  className="flex-1 flex items-center gap-3 p-4 bg-white rounded-2xl border border-border-color hover:border-gold transition-colors group"
                >
                  <div className="w-8 h-8 bg-surface text-forest rounded-lg flex items-center justify-center group-hover:bg-gold group-hover:text-forest transition-colors">
                    <social.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-muted uppercase tracking-tighter leading-none">{social.name}</p>
                    <p className="text-xs font-bold text-forest truncate">{social.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Map & Form Section */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-4 rounded-[2.5rem] border border-border-color shadow-sm h-[400px] lg:h-full min-h-[450px] relative overflow-hidden group">
              {/* Google Maps Embed Iframe */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.15647573428!2d36.75!3d-1.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f19f6a6c42171%3A0x6b40e704043f053e!2sMountain%20View%20Mall!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske" 
                className="w-full h-full rounded-[2rem] border-0 grayscale hover:grayscale-0 transition-all duration-700" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/90 backdrop-blur-md border border-border-color rounded-2xl flex items-start gap-4 shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <MapPin className="w-6 h-6 text-forest shrink-0 mt-1" />
                <div>
                  <p className="font-display font-bold text-forest text-lg italic">Find Us Here</p>
                  <p className="text-sm text-charcoal-light leading-relaxed">
                    Waiyaki Way, Behind Mountain View Mall, <br/>
                    Kangemi, Nairobi.
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
