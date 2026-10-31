import Link from 'next/link';
import type { Metadata } from 'next';
import PageHeader from '@/components/arena/PageHeader';
import { contact } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Delete your data | Mountain View Sports Arena',
  description:
    'How to ask Mountain View Sports Arena to delete your details: WhatsApp or call 0798 258 950 and say "Delete my data".',
};

const linkClass = 'text-gold underline underline-offset-2 hover:text-gold-light';

/** The user-data-deletion instructions the Meta app ("MVSA automation") points to. */
export default function DataDeletionPage() {
  return (
    <main className="theme-light">
      <PageHeader
        eyebrow="Privacy"
        titleTop="Delete"
        titleBottom="your data"
        intro="You can ask us to delete the details we hold about you at any time."
      />

      <div className="wrap">
        <article className="flex max-w-[760px] flex-col gap-10 pb-[clamp(56px,7vw,88px)] text-base leading-[1.65] text-fog [&_h2]:text-white [&_li]:ml-5 [&_p]:m-0 [&_ol]:m-0 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:p-0">
        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">How to ask</h2>
          <ol className="list-decimal">
            <li>
              Send a WhatsApp message to{' '}
              <a
                href={whatsappUrl(contact.whatsappNumber, 'Delete my data')}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {contact.whatsappDisplay}
              </a>
              , or call{' '}
              <a href={contact.bookingsPhoneHref} className={linkClass}>
                {contact.bookingsPhone}
              </a>
              , and say <strong className="text-white">&ldquo;Delete my data&rdquo;</strong>.
            </li>
            <li>
              Tell us the phone number, or the Facebook or Instagram name, you used with us, so we can find your
              details.
            </li>
            <li>
              We confirm your request and delete your details within 30 days. The only exception is a record the law
              requires us to keep; if that applies, we tell you what we kept and why.
            </li>
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="display m-0 text-[clamp(28px,3vw,40px)]">If you used Facebook Login</h2>
          <p>
            If you connected to our app with Facebook Login, you can also remove it yourself: on Facebook, go to{' '}
            <strong className="text-white">Settings &rarr; Apps and Websites</strong>, find our app and remove it.
          </p>
        </section>

        <p>
          Read our <Link href="/privacy" className={linkClass}>privacy policy</Link> for what we collect and why.
        </p>
      </article>
      </div>
    </main>
  );
}
