/**
 * The shop bag icon. It hangs still, then gives a small swing every few
 * seconds with a brass spark, so the shop is easy to spot without a banner.
 * The swing and the spark stop for anyone who prefers reduced motion
 * (globals.css), and the icon is decorative: the link carries the word "Shop".
 */
export default function ShopBag({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={`overflow-visible ${className}`} aria-hidden="true" data-testid="shop-icon">
      <g className="shop-bag">
        {/* handle */}
        <path d="M9.5 10V8a4.5 4.5 0 0 1 9 0v2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        {/* bag */}
        <path d="M5 10.5h18l-1.4 13.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 10.5Z" fill="currentColor" />
        {/* stitched band */}
        <path d="M8 15.5h12" stroke="var(--color-ink)" strokeWidth="1.6" strokeDasharray="1.6 1.8" />
      </g>
      <path
        className="shop-spark"
        d="M24.5 2.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z"
        fill="var(--color-gold-light)"
      />
    </svg>
  );
}
