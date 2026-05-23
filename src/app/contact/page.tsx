import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Clock,
  Send,
  Shield
} from 'lucide-react';

export default function ContactPage() {
  const contacts = [
    { 
      name: "Arena Bookings", 
      value: "0798 258 950", 
      href: "tel:0798258950",
      icon: Phone, 
      color: "text-gold", 
      bg: "bg-white/5" 
    },
    { 
      name: "Secondary Line", 
      value: "0783 209 442", 
      href: "tel:0783209442",
      icon: Shield, 
      color: "text-gold", 
      bg: "bg-white/5" 
    },
    { 
      name: "Official Email", 
      value: "mtviewsportsarena@gmail.com", 
      href: "mailto:mtviewsportsarena@gmail.com",
      icon: Mail, 
      color: "text-gold", 
      bg: "bg-white/5" 
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
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-gold rounded-full">
            <Send className="w-4 h-4 text-gold" />
            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">Get in Touch</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter leading-[0.9] italic">
            READY TO <br/>
            <span className="text-gold">CONNECT?</span>
          </h1>
          <p className="text-charcoal-light text-lg max-w-2xl leading-relaxed font-medium">
            Whether you have a question about booking, want to enroll in an academy, or just want to say hi, we&apos;re here to help.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Methods */}
          <div className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {contacts.map((contact, i) => (
                <a 
                  key={i} 
                  href={contact.href}
                  className="flex items-center gap-6 p-8 glass rounded-3xl border border-white/5 hover:border-gold/30 hover:shadow-gold-md transition-all duration-300 group spring-bounce"
                >
                  <div className={`w-14 h-14 ${contact.bg} ${contact.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300`}>
                    <contact.icon className="w-7 h-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{contact.name}</p>
                    <p className={`font-display font-bold text-white italic transition-colors group-hover:text-gold ${contact.name.includes('Email') ? 'text-xs sm:text-sm md:text-base break-all font-sans not-italic' : 'text-xl'}`}>
                      {contact.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-8 glass-gold rounded-[2rem] text-white space-y-6 relative overflow-hidden border border-gold/12 shadow-gold-sm animate-slide-up">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-gold mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Opening Hours</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-sm font-medium text-white/80">Monday — Sunday</span>
                    <span className="text-sm font-bold text-gold">8:00 AM — 12:00 AM</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
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
                  className="flex-1 flex items-center gap-3 p-4 glass rounded-2xl border border-white/5 hover:border-gold/30 hover:shadow-gold-sm transition-all duration-300 group spring-bounce"
                >
                  <div className="w-8 h-8 bg-white/5 text-gold rounded-lg flex items-center justify-center group-hover:bg-gold group-hover:text-pitch transition-all duration-300">
                    <social.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter leading-none">{social.name}</p>
                    <p className="text-xs font-bold text-white truncate">{social.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Map & Form Section */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass p-4 rounded-[2.5rem] border border-white/5 shadow-pitch h-[400px] lg:h-full min-h-[450px] relative overflow-hidden group">
              {/* Google Maps Embed Iframe */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.15647573428!2d36.75!3d-1.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f19f6a6c42171%3A0x6b40e704043f053e!2sMountain%20View%20Mall!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske" 
                className="w-full h-full rounded-[2rem] border-0 grayscale hover:grayscale-0 transition-all duration-700" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              <div className="absolute bottom-10 left-10 right-10 p-6 glass backdrop-blur-md border border-white/10 rounded-2xl flex items-start gap-4 shadow-pitch translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <MapPin className="w-6 h-6 text-gold shrink-0 mt-1" />
                <div>
                  <p className="font-display font-bold text-white text-lg italic animate-entrance">Find Us Here</p>
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
