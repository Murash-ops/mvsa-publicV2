import type { CSSProperties } from 'react';

/**
 * The Arena's two approved marks, each one colour on a transparent ground.
 *
 * The artwork is used as a CSS mask over `currentColor`, so the mark takes
 * the colour of whatever it sits in: white in the navigation, gold in the
 * footer. There is no text lockup; the accessible name carries the words.
 */

const MARKS = {
  helmets: { src: '/images/brand/arena-helmets.png', ratio: 960 / 485 },
  emblem: { src: '/images/brand/arena-emblem.png', ratio: 1419 / 899 },
} as const;

export type LogoVariant = keyof typeof MARKS;

interface LogoProps {
  variant: LogoVariant;
  /** Rendered width in pixels; the height follows the artwork. */
  width: number;
  className?: string;
  /** Set when a parent (such as a home link) already names the logo. */
  decorative?: boolean;
}

export default function Logo({ variant, width, className, decorative = false }: LogoProps) {
  const mark = MARKS[variant];
  const style: CSSProperties = {
    width,
    height: Math.round(width / mark.ratio),
    maxWidth: '100%',
    WebkitMaskImage: `url(${mark.src})`,
    maskImage: `url(${mark.src})`,
  };

  return (
    <span
      className={`logo-mark ${className ?? ''}`}
      style={style}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': 'Mountain View Sports Arena' })}
    />
  );
}
