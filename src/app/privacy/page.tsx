import Link from 'next/link';
import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import { contact } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Privacy policy | Mountain View Sports Arena',
  description:
    'What Mountain View Sports Arena and Mountain View Sports Academy collect, why, who holds it, and your rights under the Data Protection Act, 2019.',
};

const linkClass = 'text-gold underline underline-offset-2 hover:text-gold-light';

/**
 * The privacy policy the Meta app ("MVSA automation") points to. Plain words,
 * and only what the Arena actually does. Change the date line with any edit.
 */
export default function PrivacyPage() {
  return (
    <main className="theme-light">
      <PageHeader
        eyebrow="Privacy"
        titleTop="Privacy"
        titleBottom="policy"
        intro="How Mountain View Sports Arena and Mountain View Sports Academy look after the details you give us."
      />

      <div className="wrap">
        <article className="flex max-w-[760px] flex-col gap-10 pb-[clamp(56px,7vw,88px)] text-base leading-[1.65] text-fog [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_p]:m-0 [&_ul]:m-0 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:p-0">
        <p className="label text-[13px] text-mute">Last updated 31 October 2026</p>

        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">Who we are</h2>
          <p>
            Mountain View Sports Arena and Mountain View Sports Academy (&ldquo;MVSA&rdquo;, &ldquo;we&rdquo;) are based{' '}
            {contact.addressLine.charAt(0).toLowerCase() + contact.addressLine.slice(1)}. We decide what happens to the
            personal details described here.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">What we collect</h2>
          <ul>
            <li>
              Your name, phone number and the messages you send us when you book or ask a question on WhatsApp,
              Facebook or Instagram, or by phone.
            </li>
            <li>Booking details: the date, time and length of your booking, and how you paid.</li>
            <li>
              For Academy players: the parent or guardian&rsquo;s name and phone number, and the child&rsquo;s name and
              age group.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">Why we use it</h2>
          <ul>
            <li>To take and confirm bookings.</li>
            <li>To register players for the Academy and keep parents informed.</li>
            <li>To reply to your enquiries.</li>
            <li>
              To publish our own posts and ads on our Facebook and Instagram pages, through our own app. The app posts
              to our pages only.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">What we never do</h2>
          <ul>
            <li>We do not sell your details, or give them to anyone to market to you.</li>
            <li>We never publish a photo of a child without a parent or guardian&rsquo;s consent.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">Where it is kept, and for how long</h2>
          <p>
            Your details are held with the service providers we use to run the Arena, such as Google (our records),
            Meta (WhatsApp, Facebook and Instagram) and our website hosting provider. We keep them only as long as we
            need them for the reasons above, or as long as the law requires, and then delete them.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">Your rights</h2>
          <p>Under Kenya&rsquo;s Data Protection Act, 2019, you can ask us to:</p>
          <ul>
            <li>show you the details we hold about you;</li>
            <li>correct anything that is wrong;</li>
            <li>
              delete your details. See <Link href="/data-deletion" className={linkClass}>how to ask for deletion</Link>.
            </li>
          </ul>
          <p>
            If you are unhappy with how we have handled your details, you can complain to the Office of the Data
            Protection Commissioner (ODPC) at{' '}
            <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className={linkClass}>
              www.odpc.go.ke
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">Questions</h2>
          <p>For any privacy question or request, contact us:</p>
          <ul>
            <li>
              WhatsApp:{' '}
              <a href={whatsappUrl(contact.whatsappNumber)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {contact.whatsappDisplay}
              </a>
            </li>
            <li>
              Phone:{' '}
              <a href={contact.bookingsPhoneHref} className={linkClass}>
                {contact.bookingsPhone}
              </a>
            </li>
            <li>
              Email:{' '}
              <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>
                {contact.email}
              </a>
            </li>
          </ul>
        </section>
      </article>
      </div>
    </main>
  );
}
