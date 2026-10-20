'use client';

import { useState } from 'react';
import PageHeader from '@/components/arena/PageHeader';
import { contact as venueContact, social } from '@/content/site';
import { isValidKenyanPhone } from '@/lib/booking/phone';
import { whatsappUrl } from '@/lib/whatsapp';

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

  const socialLinks = [
    { name: 'Instagram', handle: `@${social.instagram}`, href: `https://instagram.com/${social.instagram}` },
    { name: 'TikTok', handle: `@${social.tiktok}`, href: `https://www.tiktok.com/@${social.tiktok}` },
    { name: 'Facebook', handle: social.facebook, href: `https://facebook.com/${social.facebook}` },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in your name, number and message.');
      return;
    }

    if (!isValidKenyanPhone(formData.phone)) {
      setErrorMsg('Please enter a valid Kenyan phone number (e.g. 07xxxxxxxx or 01xxxxxxxx).');
      return;
    }

    // Nothing is stored here: the message is handed to WhatsApp, which is the
    // channel the venue actually reads.
    const message = `Hi MVSA, ${formData.message.trim()}\n\nMy name is ${formData.name.trim()}, my number is ${formData.phone.trim()}.`;
    const url = whatsappUrl(venueContact.whatsappNumber, message);

    window.open(url, '_blank', 'noopener,noreferrer');
    setHandoverUrl(url);
  };

  const labelClass = 'label mb-2 block text-[13px] text-white';

  return (
    <main>
      <PageHeader
        eyebrow="Contact"
        titleTop="Bring your"
        titleBottom="squad"
        intro={`${venueContact.addressLine}. Open every day, 06:00 to midnight.`}
      />

      <section className="wrap grid gap-10 pb-[clamp(56px,7vw,88px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-3.5">
          {venueContact.channels.map((channel) => (
            <a
              key={channel.href}
              href={channel.href}
              className="group flex flex-col gap-1 border border-white/10 bg-surface px-6 py-5 hover:border-gold"
            >
              <span className="label text-sm text-mute">{channel.name}</span>
              <span
                className={`text-white group-hover:text-gold ${
                  channel.href.startsWith('mailto:')
                    ? 'text-base font-semibold break-words'
                    : 'display text-[clamp(22px,2.4vw,28px)] leading-none'
                }`}
              >
                {channel.value}
              </span>
            </a>
          ))}

          <div className="flex flex-col gap-2 border border-t-4 border-white/10 border-t-grass bg-surface px-6 py-5">
            <span className="label text-sm text-gold">Opening hours</span>
            <span className="display text-[28px] leading-none">Every day · 06:00 – midnight</span>
          </div>

          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {socialLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label inline-flex min-h-12 items-center border border-white/15 px-4 text-[13px] text-fog hover:border-gold hover:text-gold"
                  aria-label={`${link.name}: ${link.handle}`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 border border-white/10 bg-surface p-[clamp(20px,4vw,40px)]">
            <h2 className="display m-0 text-[clamp(30px,3.2vw,40px)] leading-[0.9]">
              Send us a <span className="text-gold">message</span>
            </h2>

            <p className="m-0 border-l-2 border-gold pl-4 text-base leading-relaxed text-fog" data-testid="inquiry-disclosure">
              Messages are not stored on this site. Pressing send opens WhatsApp with your message ready, so it reaches
              reception on the line they actually watch.
            </p>

            {handoverUrl ? (
              <div className="flex flex-col items-start gap-4 py-4" data-testid="inquiry-handover" role="status">
                <h3 className="display m-0 text-2xl leading-none">Your message is ready in WhatsApp</h3>
                <p className="m-0 max-w-md text-base text-fog">
                  Send it in WhatsApp and reception will reply there. Nothing was stored on this site, so the message only
                  reaches us once you send it.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href={handoverUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm">
                    Open WhatsApp again
                  </a>
                  <a href={venueContact.bookingsPhoneHref} className="btn btn-ghost btn-sm">
                    Call {venueContact.bookingsPhone}
                  </a>
                </div>
                <button type="button" onClick={() => setHandoverUrl(null)} className="text-link text-base">
                  Write another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {errorMsg && (
                  <p className="m-0 border border-gold/40 bg-gold/10 px-4 py-3 text-base text-gold-light" role="alert">
                    {errorMsg}
                  </p>
                )}

                <div>
                  <label htmlFor="contact-name" className={labelClass}>Your name</label>
                  <input
                    id="contact-name"
                    required
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Wanjiku"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className={labelClass}>Phone number</label>
                  <input
                    id="contact-phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="07xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className={labelClass}>Message</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Enter details about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="field resize-none"
                  />
                </div>

                <button type="submit" className="btn btn-gold w-full" data-testid="inquiry-submit">
                  Send on WhatsApp
                </button>
              </form>
            )}
          </div>

          <div className="relative h-[300px] overflow-hidden border border-white/10 bg-surface">
            <iframe
              src={venueContact.mapsEmbedUrl}
              title="Map: Mountain View Mall, Waiyaki Way"
              className="h-full w-full border-0 grayscale"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
