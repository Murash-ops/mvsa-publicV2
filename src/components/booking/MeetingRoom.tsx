'use client';

import Image from 'next/image';
import { useId, useState } from 'react';
import { meetingRoom } from '@/content/site';
import { whatsappUrl } from '@/lib/whatsapp';

type Use = (typeof meetingRoom.uses)[number]['id'];

/** "2026-11-07" -> "Saturday 7 November". */
function dayPhrase(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

/**
 * The message the visitor sends. Every part is optional except the room;
 * nothing is reserved until reception replies.
 */
export function meetingRoomMessage(use?: Use, day?: string, people?: string): string {
  const label = meetingRoom.uses.find((u) => u.id === use)?.label.toLowerCase();
  const what = label ? ` for ${/^[aeiou]/.test(label) ? 'an' : 'a'} ${label}` : '';
  const when = day ? ` on ${dayPhrase(day)}` : '';
  const count = people && /^\d{1,3}$/.test(people) && Number(people) > 0 ? `, for about ${Number(people)} people` : '';
  return `Hi MVSA, I'd like to book the meeting room${what}${when}${count}. Is it free?`;
}

export default function MeetingRoom({ whatsappNumber, phone, phoneHref }: { whatsappNumber: string; phone: string; phoneHref: string }) {
  const [use, setUse] = useState<Use | undefined>(undefined);
  const [day, setDay] = useState('');
  const [people, setPeople] = useState('');
  const ids = { day: useId(), people: useId(), uses: useId() };
  const href = whatsappUrl(whatsappNumber, meetingRoomMessage(use, day || undefined, people || undefined));
  const peopleInvalid = people !== '' && !/^\d{1,3}$/.test(people);

  return (
    <section id="meeting-room" className="theme-dark scroll-mt-24 bg-ink" aria-labelledby="meeting-room-title" data-testid="meeting-room">
      <div className="wrap grid gap-12 py-[clamp(56px,7vw,96px)] lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-start">
        <div className="flex flex-col gap-8">
          <div className="print print-tilt-l relative aspect-[4/5] w-full max-w-[520px] overflow-hidden [--print-shadow:#2D5016] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/images/arena/meeting-room.webp"
              alt={meetingRoom.photoAlt}
              fill
              sizes="(max-width: 1024px) 92vw, 520px"
              className="object-cover"
              style={{ objectPosition: 'center 58%' }}
            />
          </div>
          <ul className="m-0 flex max-w-[520px] list-none flex-wrap gap-2 p-0" aria-label="In the room">
            {meetingRoom.features.map((feature) => (
              <li key={feature} className="label border border-white/20 px-3 py-2 text-[13px] tracking-[0.1em] text-fog">
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-7">
          <span className="tag">{meetingRoom.eyebrow}</span>
          <h2 id="meeting-room-title" className="display hard-shadow m-0 text-[clamp(48px,6.4vw,88px)] leading-[0.84] [--hard-shadow:#2D5016]">
            {meetingRoom.titleTop}
            <br />
            <span className="text-gold">{meetingRoom.titleBottom}</span>
          </h2>
          <p className="m-0 max-w-[540px] text-[17px] leading-[1.55] text-fog">{meetingRoom.lede}</p>

          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend id={ids.uses} className="label mb-3 text-[14px] tracking-[0.12em] text-white">
              What is it for?
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {meetingRoom.uses.map((option) => {
                const selected = use === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setUse(selected ? undefined : option.id)}
                    className={`flex min-h-[72px] flex-col items-start justify-center gap-1 border-2 px-4 py-3 text-left transition-colors ${
                      selected ? 'border-gold bg-gold text-ink' : 'border-white/20 text-white hover:border-gold'
                    }`}
                  >
                    <span className="display text-[24px] leading-none">{option.label}</span>
                    <span className={`text-[14px] leading-snug ${selected ? 'text-ink' : 'text-fog'}`}>{option.body}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor={ids.day} className="label text-[14px] tracking-[0.12em] text-white">
                Which day? <span className="font-semibold normal-case tracking-normal text-mute">(optional)</span>
              </label>
              <input id={ids.day} type="date" value={day} onChange={(e) => setDay(e.target.value)} className="field [color-scheme:dark]" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={ids.people} className="label text-[14px] tracking-[0.12em] text-white">
                How many people? <span className="font-semibold normal-case tracking-normal text-mute">(optional)</span>
              </label>
              <input
                id={ids.people}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                value={people}
                onChange={(e) => setPeople(e.target.value.trim())}
                aria-invalid={peopleInvalid}
                aria-describedby={peopleInvalid ? `${ids.people}-err` : undefined}
                className="field"
                placeholder="e.g. 20"
              />
              {peopleInvalid ? (
                <span id={`${ids.people}-err`} className="text-[14px] text-gold-light">
                  Use a number, like 20.
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-gold min-h-[58px] self-start text-[18px]" data-testid="meeting-room-cta">
              Ask for the room on WhatsApp
            </a>
            <p className="m-0 max-w-[540px] text-[15px] leading-[1.55] text-fog">
              {meetingRoom.note} Or call{' '}
              <a href={phoneHref} className="inline-flex min-h-11 items-center font-semibold text-white underline decoration-gold underline-offset-4">
                {phone}
              </a>
              .
            </p>
            <p className="m-0 border-l-4 border-gold pl-4 text-[15px] text-fog">{meetingRoom.combo}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
