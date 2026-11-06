'use client';

import { useState } from 'react';

/**
 * Share a programme: straight into WhatsApp with the link and one line, or
 * copy the link. The copy button says "Link copied" for a moment, and a
 * screen reader hears the same thing.
 */
export default function ShareBar({ url, text, className = '' }: { url: string; text: string; className?: string }) {
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const area = document.createElement('textarea');
        area.value = url;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        if (!ok) throw new Error('copy refused');
      }
      setCopied('done');
    } catch {
      setCopied('failed');
    }
    window.setTimeout(() => setCopied('idle'), 2500);
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`} data-testid="share-bar">
      <span className="label text-[13px] tracking-[0.14em] text-mute">Share</span>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-ghost gap-2"
        data-testid="share-whatsapp"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M12.01 2C6.5 2 2.03 6.48 2.02 11.98c0 1.76.46 3.47 1.34 4.97L2 22l5.21-1.37a9.97 9.97 0 0 0 4.8 1.23c5.5 0 9.99-4.47 9.99-9.98C22 6.48 17.52 2 12.01 2zm0 18.18c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.1.81.83-3.02-.2-.31a8.2 8.2 0 0 1-1.26-4.34c0-4.54 3.7-8.23 8.28-8.23a8.24 8.24 0 0 1 8.25 8.24c0 4.54-3.7 8.19-8.25 8.19z" />
        </svg>
        WhatsApp
        <span className="sr-only"> (share this page, opens WhatsApp)</span>
      </a>
      <button type="button" onClick={copy} className="btn btn-sm btn-ghost" data-testid="share-copy">
        {copied === 'done' ? 'Link copied' : copied === 'failed' ? 'Copy failed' : 'Copy link'}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied === 'done' ? 'Link copied' : copied === 'failed' ? 'The link could not be copied' : ''}
      </span>
    </div>
  );
}
