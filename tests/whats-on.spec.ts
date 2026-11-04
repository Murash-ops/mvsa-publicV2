import { test, expect } from '@playwright/test';
import {
  COLUMNS,
  WhatsOnFormatError,
  isShowing,
  nairobiToday,
  parseCsv,
  parseSheetDate,
  parseWhatsOnCsv,
} from '../src/lib/whats-on/parse';
import { fallbackItems, loadWhatsOn, WHATS_ON_REVALIDATE } from '../src/lib/whats-on';

/**
 * What's on is read from a Google Sheet that anyone with edit access can
 * change from a phone. These tests hold the line: wrong rows are skipped and
 * reported, never guessed, and nothing forbidden reaches the site.
 */

const HEADER = COLUMNS.join(',');

function row(values: Partial<Record<(typeof COLUMNS)[number], string>>): string {
  return COLUMNS.map((c) => {
    const v = values[c] ?? '';
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(',');
}

const quiet = { warn: () => {} };

test.describe('CSV', () => {
  test('reads quoted fields, doubled quotes, commas and line breaks inside quotes, and CRLF', () => {
    const rows = parseCsv('a,b,c\r\n"x, y","say ""hi""","two\nlines"\r\n');
    expect(rows).toEqual([
      ['a', 'b', 'c'],
      ['x, y', 'say "hi"', 'two\nlines'],
    ]);
  });

  test('refuses a quote that never closes, or one in the middle of a field', () => {
    expect(() => parseCsv('a,"b\n')).toThrow(WhatsOnFormatError);
    expect(() => parseCsv('a,b"c\n')).toThrow(WhatsOnFormatError);
  });

  test('drops a byte-order mark at the start', () => {
    expect(parseCsv('﻿title\nx')[0]).toEqual(['title']);
  });
});

test.describe('the sheet as a whole', () => {
  test('a missing column makes the whole sheet untrusted', () => {
    expect(() => parseWhatsOnCsv('title,blurb\nA,B')).toThrow(/Missing columns/);
  });

  test('an unknown or repeated column is refused', () => {
    expect(() => parseWhatsOnCsv(`${HEADER},price\n`)).toThrow(/Unknown columns: price/);
    expect(() => parseWhatsOnCsv(`${HEADER},title\n`)).toThrow(/twice/);
  });

  test('a web page instead of CSV is refused', () => {
    expect(() => parseWhatsOnCsv('<!DOCTYPE html><html>…')).toThrow(/not CSV/);
  });

  test('columns can come in any order and in any case', () => {
    const header = [...COLUMNS].reverse().map((c) => c.toUpperCase()).join(',');
    const values = [...COLUMNS].reverse().map((c) => (c === 'title' ? 'Chess Club' : c === 'blurb' ? 'Saturdays.' : ''));
    const { items } = parseWhatsOnCsv(`${header}\n${values.join(',')}`);
    expect(items.map((i) => i.title)).toEqual(['Chess Club']);
  });
});

test.describe('rows', () => {
  test('a good row comes through with every column', () => {
    const csv = [
      HEADER,
      row({
        title: 'Holiday Training',
        kicker: "School's out",
        blurb: 'Coached sessions, six days a week.',
        dates_text: 'Mon–Sat, 11am–1pm',
        show_from: '2026-11-02',
        show_until: '19 Dec 2026',
        image: '/images/arena/corner-flag-line.webp',
        link_label: 'Register now',
        link_url: '/programs/holiday-training',
        program_id: 'holiday-training',
      }),
    ].join('\n');
    const { items, problems } = parseWhatsOnCsv(csv);
    expect(problems).toEqual([]);
    expect(items[0]).toMatchObject({
      id: 'holiday-training',
      title: 'Holiday Training',
      showFrom: '2026-11-02',
      showUntil: '2026-12-19',
      linkUrl: '/programs/holiday-training',
      programId: 'holiday-training',
    });
  });

  test('blank rows are ignored, not reported', () => {
    const { items, problems } = parseWhatsOnCsv(`${HEADER}\n,,,,,,,,,,\n\n${row({ title: 'A', blurb: 'B' })}`);
    expect(items).toHaveLength(1);
    expect(problems).toEqual([]);
  });

  const bad: [string, Parameters<typeof row>[0], RegExp][] = [
    ['no title', { blurb: 'x' }, /title is empty/],
    ['no blurb', { title: 'x' }, /blurb is empty/],
    ['a date that could be read two ways', { title: 'x', blurb: 'y', show_from: '11/04/2026' }, /show_from .* is not a date/],
    ['a date that does not exist', { title: 'x', blurb: 'y', show_until: '2026-02-30' }, /show_until/],
    ['dates the wrong way round', { title: 'x', blurb: 'y', show_from: '2026-12-01', show_until: '2026-11-01' }, /after show_until/],
    ['a picture from another website', { title: 'x', blurb: 'y', image: 'https://example.com/a.jpg' }, /picture on the site/],
    ['a link that is not https', { title: 'x', blurb: 'y', link_url: 'http://example.com', link_label: 'Go' }, /https/],
    ['a script link', { title: 'x', blurb: 'y', link_url: 'javascript:alert(1)', link_label: 'Go' }, /https/],
    ['a label with no link', { title: 'x', blurb: 'y', link_label: 'Go' }, /link_url is empty/],
    ['an Academy fee', { title: 'Chess Club', blurb: 'Only KSH 500 a session.' }, /price/],
    ['a Till number', { title: 'Holiday', blurb: 'Pay to Till 5282292.' }, /Till/],
    ['M-Pesa instructions', { title: 'Holiday', blurb: 'Pay by M-Pesa before Monday.' }, /payment/],
    [
      'Extra Time with evening play',
      { title: 'Extra Time', blurb: '30 minutes free tonight under the lights.', small_print: 'Valid on bookings 6am–6pm, 1–30 Nov.' },
      /evening/,
    ],
    ['Extra Time without its small print', { title: 'Extra Time', blurb: '30 minutes free on every booking.' }, /small print/],
    ['yoga called free', { title: 'Community Yoga', blurb: 'Free yoga on Friday.' }, /donation-based/],
    ['a title that is far too long', { title: 'x'.repeat(61), blurb: 'y' }, /title is longer/],
  ];

  for (const [name, values, reason] of bad) {
    test(`a row with ${name} is skipped and reported`, () => {
      const csv = [HEADER, row({ title: 'Good row', blurb: 'Fine.' }), row(values)].join('\n');
      const { items, problems } = parseWhatsOnCsv(csv);
      expect(items.map((i) => i.title)).toEqual(['Good row']);
      expect(problems).toHaveLength(1);
      expect(problems[0].row).toBe(3);
      expect(problems[0].reason).toMatch(reason);
    });
  }

  test('the Arena price is the one figure allowed', () => {
    const { items } = parseWhatsOnCsv([HEADER, row({ title: 'Book a pitch', blurb: 'From KSH 1,500 an hour.' })].join('\n'));
    expect(items).toHaveLength(1);
  });

  test('Extra Time with its small print is allowed', () => {
    const { items, problems } = parseWhatsOnCsv(
      [HEADER, row({ title: 'Extra Time', blurb: '30 minutes free on every booking.', small_print: 'Valid on bookings 6am–6pm, 1–30 Nov 2026.' })].join('\n')
    );
    expect(problems).toEqual([]);
    expect(items).toHaveLength(1);
  });

  test('a second row with the same title is skipped', () => {
    const { items, problems } = parseWhatsOnCsv([HEADER, row({ title: 'Chess Club', blurb: 'a' }), row({ title: 'Chess Club', blurb: 'b' })].join('\n'));
    expect(items).toHaveLength(1);
    expect(problems[0].reason).toMatch(/already has this title/);
  });

  test('a row with more cells than columns is skipped', () => {
    const { problems } = parseWhatsOnCsv(`${HEADER}\n${row({ title: 'A', blurb: 'B' })},extra`);
    expect(problems[0].reason).toMatch(/more cells/);
  });
});

test.describe('dates', () => {
  test('only unambiguous dates are read', () => {
    expect(parseSheetDate('2026-11-30')).toBe('2026-11-30');
    expect(parseSheetDate('30 Nov 2026')).toBe('2026-11-30');
    expect(parseSheetDate('30 November 2026')).toBe('2026-11-30');
    expect(parseSheetDate('1 Sept 2026')).toBe('2026-09-01');
    expect(parseSheetDate('11/30/2026')).toBeNull();
    expect(parseSheetDate('30 Novem 2026')).toBeNull();
    expect(parseSheetDate('tomorrow')).toBeNull();
  });

  test('the day is Nairobi’s, not the server’s', () => {
    // 22:30 UTC on 30 November is already 1 December in Nairobi.
    expect(nairobiToday(new Date('2026-11-30T22:30:00Z'))).toBe('2026-12-01');
    expect(nairobiToday(new Date('2026-11-30T20:59:00Z'))).toBe('2026-11-30');
  });

  test('a card shows from its first day to its last day, both included', () => {
    const card = { showFrom: '2026-11-01', showUntil: '2026-11-30' };
    expect(isShowing(card, new Date('2026-10-31T20:00:00Z'))).toBe(false); // 23:00, 31 Oct in Nairobi
    expect(isShowing(card, new Date('2026-10-31T21:00:00Z'))).toBe(true); // midnight, 1 Nov
    expect(isShowing(card, new Date('2026-11-30T20:59:00Z'))).toBe(true); // 23:59, 30 Nov
    expect(isShowing(card, new Date('2026-11-30T21:00:00Z'))).toBe(false); // midnight, 1 Dec
  });

  test('open-ended cards always show', () => {
    expect(isShowing({}, new Date('2030-01-01T00:00:00Z'))).toBe(true);
    expect(isShowing({ showUntil: '2026-12-19' }, new Date('2020-01-01T00:00:00Z'))).toBe(true);
  });
});

test.describe('the checked-in fallback', () => {
  test('every row passes the same checks as the sheet', () => {
    const warnings: string[] = [];
    const items = fallbackItems({ warn: (m: string) => warnings.push(m) });
    expect(warnings).toEqual([]);
    expect(items.map((i) => i.title)).toEqual(['Extra Time', 'Holiday Training', 'Chess Club', 'Community Yoga']);
  });

  test('Extra Time carries its small print and never mentions the evening', () => {
    const extra = fallbackItems(quiet).find((i) => i.title === 'Extra Time')!;
    expect(extra.smallPrint).toBe('Valid on bookings 6am–6pm, 1–30 Nov 2026.');
    expect(extra.blurb).toContain('30 minutes free on every booking');
    expect(JSON.stringify(extra)).not.toMatch(/night|evening|midnight|floodlit|lights/i);
  });

  test('Extra Time disappears after 30 November, holiday training after 19 December', async () => {
    const titles = async (iso: string) =>
      (await loadWhatsOn({ url: undefined, now: new Date(iso), log: quiet })).items.map((i) => i.title);
    expect(await titles('2026-11-04T09:00:00Z')).toContain('Extra Time');
    expect(await titles('2026-12-01T09:00:00Z')).not.toContain('Extra Time');
    expect(await titles('2026-12-19T09:00:00Z')).toContain('Holiday Training');
    expect(await titles('2026-12-20T09:00:00Z')).not.toContain('Holiday Training');
    expect(await titles('2026-12-20T09:00:00Z')).toEqual(['Chess Club', 'Community Yoga']);
  });
});

test.describe('loading', () => {
  const NOW = new Date('2026-11-04T09:00:00Z');
  const sheet = [HEADER, row({ title: 'From the sheet', blurb: 'Live.' }), row({ title: 'Old', blurb: 'Gone.', show_until: '2026-10-31' })].join('\n');

  test('with no sheet set, the checked-in list is used', async () => {
    const result = await loadWhatsOn({ url: undefined, now: NOW, log: quiet });
    expect(result.source).toBe('fallback');
    expect(result.items.length).toBeGreaterThan(0);
  });

  test('a reachable sheet is used, read on the server and kept for an hour', async () => {
    const calls: { url: string; init?: RequestInit & { next?: { revalidate?: number } } }[] = [];
    const result = await loadWhatsOn({
      url: 'https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv',
      now: NOW,
      log: quiet,
      fetchImpl: async (url, init) => {
        calls.push({ url, init });
        return new Response(sheet, { status: 200 });
      },
    });
    expect(result.source).toBe('sheet');
    expect(result.items.map((i) => i.title)).toEqual(['From the sheet']); // "Old" ended on 31 Oct
    expect(calls[0].init?.next?.revalidate).toBe(3600);
    expect(WHATS_ON_REVALIDATE).toBe(3600);
  });

  test('bad rows in the sheet are logged with their row number', async () => {
    const warnings: string[] = [];
    await loadWhatsOn({
      url: 'https://docs.google.com/x.csv',
      now: NOW,
      log: { warn: (m: string) => warnings.push(m) },
      fetchImpl: async () => new Response([HEADER, row({ title: 'Chess', blurb: 'KSH 500 a session' })].join('\n')),
    });
    expect(warnings.join('\n')).toMatch(/row 2 \("Chess"\) skipped: .*price/);
  });

  const failures: [string, () => Promise<Response>][] = [
    ['the sheet answers 404', async () => new Response('Not found', { status: 404 })],
    ['the network fails', async () => { throw new Error('ECONNRESET'); }],
    ['the sheet is published as a web page', async () => new Response('<html><body>sheet</body></html>')],
    ['the columns are wrong', async () => new Response('name,when\nA,B')],
  ];
  for (const [name, fetchImpl] of failures) {
    test(`when ${name}, the checked-in list is used and the reason logged`, async () => {
      const warnings: string[] = [];
      const result = await loadWhatsOn({ url: 'https://docs.google.com/x.csv', now: NOW, log: { warn: (m: string) => warnings.push(m) }, fetchImpl });
      expect(result.source).toBe('fallback');
      expect(result.items.map((i) => i.title)).toContain('Chess Club');
      expect(warnings[0]).toMatch(/using the checked-in list/);
    });
  }

  test('a sheet address that is not https is not fetched', async () => {
    let called = false;
    const result = await loadWhatsOn({
      url: 'http://docs.google.com/x.csv',
      now: NOW,
      log: quiet,
      fetchImpl: async () => {
        called = true;
        return new Response('');
      },
    });
    expect(called).toBe(false);
    expect(result.source).toBe('fallback');
  });

  test('the template in docs/ matches the columns and passes the checks', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const csv = readFileSync(join(__dirname, '..', 'docs', 'whats-on-template.csv'), 'utf8');
    const { items, problems } = parseWhatsOnCsv(csv);
    expect(problems).toEqual([]);
    expect(items).toHaveLength(4);
  });
});
