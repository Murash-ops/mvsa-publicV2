'use client';

import Image from 'next/image';
import type { MouseEvent } from 'react';
import type { BentoTile } from '@/content/site';

const TITLE_SIZE = { lg: 'text-[clamp(44px,5vw,64px)]', md: 'text-[40px]', sm: 'text-4xl' } as const;

/** Moves the tile's spotlight to the cursor without re-rendering anything. */
function spotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--x', `${Math.round(event.clientX - rect.left)}px`);
  event.currentTarget.style.setProperty('--y', `${Math.round(event.clientY - rect.top)}px`);
}

export default function Bento({ tiles }: { tiles: readonly BentoTile[] }) {
  return (
    <div className="bento">
      {tiles.map((tile, i) => (
        <article
          key={tile.title}
          onMouseMove={spotlight}
          className="bento-tile rise relative flex flex-col justify-end gap-2.5 overflow-hidden border border-white/10 bg-surface p-7"
          style={{
            gridColumn: `span ${tile.cols}`,
            gridRow: `span ${tile.rows}`,
            animationDelay: `${(i * 0.07).toFixed(2)}s`,
          }}
        >
          {'img' in tile && tile.img ? (
            <Image
              src={tile.img}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 560px) 100vw, (max-width: 900px) 100vw, 50vw"
              className="object-cover opacity-45"
            />
          ) : null}
          <span className="label relative z-[2] text-[15px] text-gold">{tile.tag}</span>
          <h3 className={`display relative z-[2] m-0 leading-[0.92] ${TITLE_SIZE[tile.size]}`}>{tile.title}</h3>
          <p className="relative z-[2] m-0 max-w-[420px] text-base leading-normal text-fog">{tile.body}</p>
        </article>
      ))}
    </div>
  );
}
