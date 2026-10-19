import { home } from '@/content/site';

/**
 * "The Arena from KES 1,500 per hour", with a light travelling round its
 * border. Read from home.pricing so the figure lives in one place.
 */
export default function PricePlate({ className }: { className?: string }) {
  const { name, headline, unit, terms } = home.pricing;
  const [from, ...rest] = headline.split(' ');
  const amount = rest.join(' ');

  return (
    <div className={`beam-ring rise min-w-0 ${className ?? ''}`} style={{ animationDelay: '0.15s' }}>
      <p className="m-0 flex flex-col gap-1 bg-ink px-[30px] py-[26px]" data-testid="pricing-headline">
        <span className="label text-[15px] tracking-[0.18em] text-fog">
          {name} {from}
        </span>{' '}
        <span className="display text-[clamp(64px,8vw,88px)] leading-[0.9] text-gold">{amount}</span>{' '}
        <span className="label text-lg tracking-[0.1em] text-fog">
          {unit} · {terms}
        </span>
      </p>
    </div>
  );
}
