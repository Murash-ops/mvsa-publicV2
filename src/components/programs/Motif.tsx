import type { ProgramTheme } from '@/content/programs';

/**
 * The drawing behind each programme: chalk pitch lines for the Academy, a
 * board for chess, breathing rings for yoga, and so on. Pure SVG, decorative
 * (aria-hidden), coloured from the theme so it sits in the same family.
 *
 * `size="tile"` is the small version on the programme cards; `size="hero"`
 * fills the top of the programme page.
 */
export default function Motif({ theme, size = 'hero' }: { theme: ProgramTheme; size?: 'hero' | 'tile' }) {
  const common = 'pointer-events-none absolute inset-0 h-full w-full';
  switch (theme) {
    case 'pathway':
      // A 5-aside pitch in chalk, seen from above, running off the edge.
      return (
        <svg aria-hidden="true" className={common} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#F5F2EA" strokeOpacity={size === 'hero' ? 0.13 : 0.22} strokeWidth={size === 'hero' ? 1.6 : 2.4}>
            <rect x="20" y="20" width="360" height="220" />
            <line x1="200" y1="20" x2="200" y2="240" />
            <circle cx="200" cy="130" r="38" />
            {size === 'tile' ? <circle cx="200" cy="130" r="2.5" fill="#F5F2EA" /> : null}
            <path d="M20 80h46v100H20M380 80h-46v100h46" />
            <path d="M66 105a26 26 0 0 1 0 50M334 105a26 26 0 0 0 0 50" />
          </g>
          {/* the pathway: three chalk dots, left to right (cards only; on the page the steps say it) */}
          {size === 'tile' ? (
          <>
          <g fill="#C2A15B" fillOpacity={0.8}>
            <circle cx="110" cy="190" r="5" />
            <circle cx="200" cy="170" r="5" />
            <circle cx="290" cy="150" r="5" />
          </g>
          <path d="M110 190 L200 170 L290 150" stroke="#C2A15B" strokeOpacity={0.7} strokeWidth="2" strokeDasharray="4 6" fill="none" />
          </>
          ) : null}
        </svg>
      );
    case 'holiday':
      return (
        <svg aria-hidden="true" className={common} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id={`hol-${size}`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="11" height="22" fill="#0E1C14" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="400" height={size === 'hero' ? 10 : 16} fill={`url(#hol-${size})`} />
          <rect x="0" y={size === 'hero' ? 250 : 244} width="400" height={size === 'hero' ? 10 : 16} fill={`url(#hol-${size})`} />
          <polygon
            points={burst(size === 'hero' ? 330 : 320, size === 'hero' ? 70 : 74, size === 'hero' ? 62 : 46, size === 'hero' ? 42 : 31, 14)}
            fill="#0E1C14"
            fillOpacity={size === 'hero' ? 0.1 : 0.16}
          />
        </svg>
      );
    case 'board':
      return (
        <div aria-hidden="true" className={`${common} overflow-hidden`}>
          <div
            className="checker absolute -right-6 -top-6 rotate-[-8deg] opacity-[0.12]"
            style={{ width: size === 'hero' ? 432 : 220, height: size === 'hero' ? 432 : 220, ['--sq' as string]: size === 'hero' ? '54px' : '27.5px' }}
          />
        </div>
      );
    case 'breath':
      return (
        <svg aria-hidden="true" className={common} viewBox="0 0 400 260" preserveAspectRatio="xMaxYMid slice">
          <g fill="none" stroke="#2D7A3A" strokeWidth="1.4" strokeOpacity="0.35">
            <circle className="breath-ring" cx="320" cy="130" r="60" />
            <circle className="breath-ring" cx="320" cy="130" r="95" />
            <circle className="breath-ring" cx="320" cy="130" r="130" />
          </g>
        </svg>
      );
    case 'ring':
      return (
        <div aria-hidden="true" className={`${common} overflow-hidden`}>
          <div
            className={`tape absolute rotate-[-12deg] ${
              size === 'hero' ? '-right-[12%] -top-[3%] h-[60px] w-[60%] opacity-40 lg:top-[10%] lg:h-[18%] lg:w-[46%] lg:opacity-70' : '-right-[10%] top-[18%] h-[22%] w-[70%] opacity-70'
            }`}
          />
          <div className="absolute inset-x-0 top-[62%] h-px bg-[#C2A15B]/40" />
          <div className="absolute inset-x-0 top-[70%] h-px bg-[#C2A15B]/30" />
          <div className="absolute inset-x-0 top-[78%] h-px bg-[#C2A15B]/20" />
        </div>
      );
    case 'beat': {
      const heights = [40, 72, 55, 90, 64, 100, 48, 80, 58, 94, 42, 76];
      return (
        <div
          aria-hidden="true"
          className={`${common} ${size === 'hero' ? 'hidden lg:flex' : 'flex'} items-end justify-end gap-[3%] px-[6%] pb-0 [mask-image:linear-gradient(to_top,transparent,black_35%)] ${
            size === 'hero' ? 'lg:left-auto lg:w-[40%] lg:opacity-35' : 'opacity-50'
          }`}
        >
          {heights.map((h, i) => (
            <span
              key={i}
              className="beat-bar block w-[4%] bg-[#C2A15B]"
              style={{ height: `${h * (size === 'hero' ? 0.7 : 0.55)}%`, animationDelay: `${(i * 0.13).toFixed(2)}s` }}
            />
          ))}
        </div>
      );
    }
    case 'drill':
      return (
        <svg aria-hidden="true" className={common} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
          <path d="M40 210 L120 120 L200 200 L280 110 L360 190" fill="none" stroke="#F5F2EA" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="5 7" />
          {[
            [40, 210],
            [120, 120],
            [200, 200],
            [280, 110],
            [360, 190],
          ].map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x - 9} ${y + 7} L${x} ${y - 12} L${x + 9} ${y + 7} Z`} fill="#C2A15B" fillOpacity="0.75" />
          ))}
        </svg>
      );
    case 'event':
      return (
        <svg aria-hidden="true" className={common} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
          <polygon points={burst(330, 60, 90, 55, 18)} fill="#C2A15B" fillOpacity={size === 'hero' ? 0.16 : 0.22} />
          {[
            [40, 40, '#C2A15B'],
            [90, 200, '#F5F2EA'],
            [180, 30, '#3F8F4A'],
            [250, 220, '#C2A15B'],
            [370, 210, '#F5F2EA'],
            [140, 120, '#3F8F4A'],
          ].map(([x, y, c]) => (
            <rect key={`${x}-${y}`} x={x as number} y={y as number} width="8" height="8" fill={c as string} fillOpacity="0.5" transform={`rotate(30 ${x} ${y})`} />
          ))}
        </svg>
      );
  }
}

/** A star burst polygon, like the gold bursts on the social graphics. */
function burst(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    out.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return out.join(' ');
}
