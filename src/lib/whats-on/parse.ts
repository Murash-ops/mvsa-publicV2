/**
 * What's on: reading the sheet.
 *
 * The rows come from a Google Sheet that Murash keeps, published to the web as
 * CSV. This file turns that CSV into checked items. It is strict on purpose:
 * a row that is wrong is skipped and reported, never guessed at, so a typo in
 * the sheet can hide one card but can never put a wrong date, a broken link or
 * a forbidden price on the public site.
 *
 * No imports from the rest of the app, so the tests can load it directly.
 */

export const COLUMNS = [
  'title',
  'kicker',
  'blurb',
  'dates_text',
  'show_from',
  'show_until',
  'image',
  'link_label',
  'link_url',
  'program_id',
  'small_print',
] as const;

export type Column = (typeof COLUMNS)[number];

export interface WhatsOnItem {
  /** Stable key for React and for tests: the title in lowercase words. */
  id: string;
  title: string;
  kicker?: string;
  blurb: string;
  /** How the dates read on the card, e.g. "Mon–Sat, 11am–1pm, to 19 Dec". */
  datesText?: string;
  /** First day the card shows, YYYY-MM-DD in Nairobi. Blank: already showing. */
  showFrom?: string;
  /** Last day the card shows, YYYY-MM-DD in Nairobi. Blank: no end. */
  showUntil?: string;
  /** A picture already on the site, e.g. /images/arena/morning-turf.webp. */
  image?: string;
  linkLabel?: string;
  /** https://… or a page on this site starting with /. */
  linkUrl?: string;
  /** A programme slug (e.g. chess-club) or backend id (e.g. chess). */
  programId?: string;
  smallPrint?: string;
}

export interface RowProblem {
  /** The row number as the sheet shows it: the header is row 1. */
  row: number;
  title: string;
  reason: string;
}

export interface ParseResult {
  items: WhatsOnItem[];
  problems: RowProblem[];
}

/** The whole sheet is unusable (wrong columns, not CSV). */
export class WhatsOnFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WhatsOnFormatError';
  }
}

/* -------------------------------------------------------------------------- */
/*  CSV                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * RFC 4180 CSV: commas, double-quoted fields, "" for a quote inside a quoted
 * field, line breaks inside quotes, CRLF or LF. A stray quote in the middle of
 * an unquoted field, or a quote that never closes, is an error rather than a
 * guess.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let quoted = false;
  let fieldStarted = false;
  const input = text.replace(/^﻿/, '');

  const endField = () => {
    row.push(field);
    field = '';
    fieldStarted = false;
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < input.length) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        const next = input[i];
        if (next !== undefined && next !== ',' && next !== '\n' && next !== '\r') {
          throw new WhatsOnFormatError(`Unexpected character after a closing quote on line ${rows.length + 1}.`);
        }
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      if (fieldStarted) throw new WhatsOnFormatError(`A quote in the middle of a field on line ${rows.length + 1}.`);
      quoted = true;
      fieldStarted = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      endField();
      i += 1;
      continue;
    }
    if (ch === '\r' || ch === '\n') {
      endRow();
      i += ch === '\r' && input[i + 1] === '\n' ? 2 : 1;
      continue;
    }
    field += ch;
    fieldStarted = true;
    i += 1;
  }
  if (quoted) throw new WhatsOnFormatError('A quoted field never closes.');
  if (field !== '' || row.length > 0) endRow();
  return rows;
}

/* -------------------------------------------------------------------------- */
/*  Dates                                                                      */
/* -------------------------------------------------------------------------- */

const FULL_MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/** "Nov", "November" and "Sept" give 11, 11 and 9; anything else gives 0. */
function monthNumber(name: string): number {
  const n = name.toLowerCase();
  if (n === 'sept') return 9;
  const full = FULL_MONTHS.indexOf(n);
  if (full >= 0) return full + 1;
  const short = FULL_MONTHS.findIndex((m) => m.slice(0, 3) === n);
  return short >= 0 ? short + 1 : 0;
}

function isoDate(y: number, m: number, d: number): string | null {
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1) return null;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d > days) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Accepts only dates that cannot be misread: 2026-11-30, or 30 Nov 2026 /
 * 30 November 2026. "11/04/2026" is refused, because a sheet set to US or UK
 * dates turns it into April or November without telling anyone.
 */
export function parseSheetDate(value: string): string | null {
  const v = value.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v);
  if (m) return isoDate(Number(m[1]), Number(m[2]), Number(m[3]));
  m = /^(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})$/.exec(v);
  if (m) {
    const month = monthNumber(m[2]);
    return month ? isoDate(Number(m[3]), month, Number(m[1])) : null;
  }
  return null;
}

/** Today's date in Nairobi, YYYY-MM-DD. */
export function nairobiToday(now: Date): string {
  // Nairobi is UTC+3 all year, with no daylight saving.
  return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** True when the card should be on the site on this day (both ends included). */
export function isShowing(item: Pick<WhatsOnItem, 'showFrom' | 'showUntil'>, now: Date): boolean {
  const today = nairobiToday(now);
  if (item.showFrom && today < item.showFrom) return false;
  if (item.showUntil && today > item.showUntil) return false;
  return true;
}

/* -------------------------------------------------------------------------- */
/*  House rules                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Rules from MVSA/social/brand.md that a sheet row must not break. They are
 * checked here because a sheet is easy to edit from a phone and nobody
 * reviews it before it goes live.
 */
export function ruleProblem(item: WhatsOnItem): string | null {
  const text = [item.title, item.kicker, item.blurb, item.datesText, item.smallPrint, item.linkLabel]
    .filter(Boolean)
    .join(' ');

  // Money: the only figures the site may print are the Arena's "from KSH 1,500"
  // and the meeting room's "KSH 1,000 an hour".
  const amounts = text.match(/\b(?:KSH|KES|Ksh|Kshs|Sh)\.?\s?[\d,]+/gi) ?? [];
  if (amounts.some((a) => !['1500', '1000'].includes(a.replace(/\D/g, '')))) {
    return 'it has a price other than the Arena (KSH 1,500) or the meeting room (KSH 1,000); fees are only shared on WhatsApp';
  }
  if (/\btill\s*(?:no\.?|number|#)?\s*:?\s*\d{5,}/i.test(text) || /\b(pay\s?bill|buy goods|m-?pesa)\b/i.test(text)) {
    return 'it has a Till number or payment instructions (those are only shared on WhatsApp)';
  }
  // Extra Time is a daytime offer (6am–6pm). It must never sit with evening play.
  if (/extra time/i.test(text) && /\b(tonight|night|evening|midnight|under the lights|floodlit|after 6)\b/i.test(text)) {
    return 'it pairs Extra Time with evening play (Extra Time is only 6am–6pm)';
  }
  // Every Extra Time mention carries its small print.
  if (/extra time/i.test(text) && !/6\s?am\s?[–-]\s?6\s?pm/i.test(text)) {
    return 'Extra Time needs its small print: "Valid on bookings 6am–6pm, 1–30 Nov."';
  }
  // Yoga is donation-based, never free.
  if (/yoga/i.test(text) && /\bfree\b/i.test(text)) {
    return 'it calls yoga free (it is donation-based)';
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Rows                                                                       */
/* -------------------------------------------------------------------------- */

const LIMITS: Partial<Record<Column, number>> = {
  title: 60,
  kicker: 40,
  blurb: 280,
  dates_text: 80,
  link_label: 32,
  small_print: 160,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

function checkLink(url: string): string | null {
  if (url.startsWith('/')) {
    return /^\/[A-Za-z0-9\-._~/#?=&%]*$/.test(url) && !url.startsWith('//') ? null : 'link_url is not a clean site path';
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return 'link_url must start with https://';
    return null;
  } catch {
    return 'link_url is not a web address';
  }
}

function checkImage(path: string): string | null {
  // The site only shows its own pictures (the Content-Security-Policy blocks
  // anything else), so the column names a file already in /public/images.
  if (!/^\/images\/[A-Za-z0-9\-_/]+\.(webp|jpg|jpeg|png|avif)$/i.test(path)) {
    return 'image must be a picture on the site, like /images/arena/morning-turf.webp';
  }
  return null;
}

/** Validates one record (from the sheet or the fallback file). */
export function checkRecord(record: Partial<Record<Column, string>>): { item?: WhatsOnItem; reason?: string } {
  const get = (c: Column) => (record[c] ?? '').trim();

  const title = get('title');
  if (!title) return { reason: 'title is empty' };
  const blurb = get('blurb');
  if (!blurb) return { reason: 'blurb is empty' };

  for (const [column, max] of Object.entries(LIMITS) as [Column, number][]) {
    if (get(column).length > max) return { reason: `${column} is longer than ${max} characters` };
  }

  let showFrom: string | undefined;
  let showUntil: string | undefined;
  if (get('show_from')) {
    showFrom = parseSheetDate(get('show_from')) ?? undefined;
    if (!showFrom) return { reason: `show_from "${get('show_from')}" is not a date like 2026-11-01` };
  }
  if (get('show_until')) {
    showUntil = parseSheetDate(get('show_until')) ?? undefined;
    if (!showUntil) return { reason: `show_until "${get('show_until')}" is not a date like 2026-11-30` };
  }
  if (showFrom && showUntil && showFrom > showUntil) return { reason: 'show_from is after show_until' };

  const linkUrl = get('link_url') || undefined;
  const linkLabel = get('link_label') || undefined;
  if (linkUrl) {
    const problem = checkLink(linkUrl);
    if (problem) return { reason: problem };
  }
  if (linkLabel && !linkUrl) return { reason: 'link_label is set but link_url is empty' };

  const image = get('image') || undefined;
  if (image) {
    const problem = checkImage(image);
    if (problem) return { reason: problem };
  }

  const programId = get('program_id') || undefined;
  if (programId && !/^[a-z0-9_-]+$/.test(programId)) return { reason: 'program_id must be a programme name like chess-club' };

  const item: WhatsOnItem = {
    id: slugify(title),
    title,
    kicker: get('kicker') || undefined,
    blurb,
    datesText: get('dates_text') || undefined,
    showFrom,
    showUntil,
    image,
    linkLabel,
    linkUrl,
    programId,
    smallPrint: get('small_print') || undefined,
  };

  const broken = ruleProblem(item);
  if (broken) return { reason: broken };
  return { item };
}

/**
 * Parses the published CSV. Throws WhatsOnFormatError when the sheet as a
 * whole cannot be trusted (missing or unknown columns); otherwise returns the
 * good rows and a list of the rows that were skipped and why.
 */
export function parseWhatsOnCsv(text: string): ParseResult {
  if (/^\s*<(!doctype|html)/i.test(text)) {
    throw new WhatsOnFormatError('Got a web page, not CSV. Publish the sheet as CSV, not as a web page.');
  }
  const rows = parseCsv(text);
  if (rows.length === 0) throw new WhatsOnFormatError('The sheet is empty: the header row is missing.');

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const missing = COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) throw new WhatsOnFormatError(`Missing columns: ${missing.join(', ')}.`);
  const unknown = header.filter((h) => h !== '' && !(COLUMNS as readonly string[]).includes(h));
  if (unknown.length) throw new WhatsOnFormatError(`Unknown columns: ${unknown.join(', ')}.`);
  const dupes = header.filter((h, i) => h !== '' && header.indexOf(h) !== i);
  if (dupes.length) throw new WhatsOnFormatError(`Columns appear twice: ${dupes.join(', ')}.`);

  const items: WhatsOnItem[] = [];
  const problems: RowProblem[] = [];
  const seen = new Set<string>();

  rows.slice(1).forEach((cells, index) => {
    const rowNumber = index + 2;
    if (cells.every((c) => c.trim() === '')) return; // blank rows are fine
    const record: Partial<Record<Column, string>> = {};
    header.forEach((name, col) => {
      if (name) record[name as Column] = cells[col] ?? '';
    });
    const extra = cells.slice(header.length).some((c) => c.trim() !== '');
    const title = (record.title ?? '').trim();
    if (extra) {
      problems.push({ row: rowNumber, title, reason: 'it has more cells than the header has columns' });
      return;
    }
    const { item, reason } = checkRecord(record);
    if (!item) {
      problems.push({ row: rowNumber, title, reason: reason ?? 'invalid' });
      return;
    }
    if (seen.has(item.id)) {
      problems.push({ row: rowNumber, title, reason: 'another row already has this title' });
      return;
    }
    seen.add(item.id);
    items.push(item);
  });

  return { items, problems };
}
