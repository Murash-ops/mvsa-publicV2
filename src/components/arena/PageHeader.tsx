import Image from 'next/image';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  titleTop: string;
  titleBottom?: string;
  intro?: ReactNode;
  /** An optional photograph behind the header, darkened. */
  image?: { src: string; alt: string; position?: string };
  children?: ReactNode;
}

/** The top of every inner page: gold label, big Bebas title, a line of copy. */
export default function PageHeader({ eyebrow, titleTop, titleBottom, intro, image, children }: PageHeaderProps) {
  return (
    <section className={`relative overflow-hidden ${image ? 'flex min-h-[360px] items-end' : ''}`}>
      {image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: image.position ?? 'center 60%' }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[rgba(3,6,3,0.66)]" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(to_top,#070A07_6%,rgba(7,10,7,0)_100%)]" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_50%_70%_at_20%_0%,rgba(224,194,90,0.14),transparent_70%)]"
        />
      )}
      <div className="wrap rise relative flex flex-col gap-6 pt-[clamp(56px,8vw,96px)] pb-[clamp(40px,6vw,64px)]">
        <span className="label text-[13px] text-gold">{eyebrow}</span>
        <h1 className="display m-0 text-[clamp(44px,6vw,84px)] leading-[0.84]">
          {titleTop}
          {titleBottom ? (
            <>
              <br />
              <span className="text-gold">{titleBottom}</span>
            </>
          ) : null}
        </h1>
        {intro ? <p className="m-0 max-w-[600px] text-[clamp(16px,1.25vw,18px)] leading-[1.55] text-fog">{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}
