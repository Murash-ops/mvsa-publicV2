import Link from 'next/link';
import LampClose from '@/components/arena/LampClose';
import PageHeader from '@/components/arena/PageHeader';

export default function NotFound() {
  return (
    <main>
      <PageHeader
        eyebrow="Page not found"
        titleTop="Out of"
        titleBottom="bounds"
        intro="That page isn’t here. The Arena is, every day from 06:00 to midnight."
      />
      <LampClose>
        <Link href="/" className="btn shine">Back to the home page</Link>
        <Link href="/book" className="btn btn-ghost">Book the Arena</Link>
      </LampClose>
    </main>
  );
}
