/**
 * What's on: where the cards come from.
 *
 * 1. If WHATS_ON_CSV_URL is set, the server fetches that published Google
 *    Sheet (CSV) and keeps the copy for an hour, so a change in the sheet is
 *    live within the hour without a deploy.
 * 2. If it is not set, cannot be reached, or is not a sheet in the expected
 *    shape, the site uses src/content/whats-on.json instead and logs why.
 *
 * Either way every row goes through the same checks (parse.ts), and a card
 * only shows between its show_from and show_until dates, in Nairobi time.
 * The browser never calls the sheet: the fetch happens on the server.
 */

import fallbackFile from '../../content/whats-on.json';
import {
  WhatsOnFormatError,
  checkRecord,
  isShowing,
  parseWhatsOnCsv,
  type Column,
  type RowProblem,
  type WhatsOnItem,
} from './parse';

export type { WhatsOnItem } from './parse';

export const WHATS_ON_ENV = 'WHATS_ON_CSV_URL';
/** How long the server keeps a copy of the sheet, in seconds. */
export const WHATS_ON_REVALIDATE = 3600;

export interface WhatsOnResult {
  items: WhatsOnItem[];
  source: 'sheet' | 'fallback';
  /** Why the fallback was used, when it was. */
  reason?: string;
}

type Logger = Pick<Console, 'warn'>;
type FetchLike = (url: string, init?: RequestInit & { next?: { revalidate?: number } }) => Promise<Response>;

function report(log: Logger, where: string, problems: RowProblem[]) {
  for (const p of problems) {
    log.warn(`[whats-on] ${where} row ${p.row}${p.title ? ` ("${p.title}")` : ''} skipped: ${p.reason}`);
  }
}

/** The checked-in rows, through the same checks as the sheet. */
export function fallbackItems(log: Logger = console): WhatsOnItem[] {
  const items: WhatsOnItem[] = [];
  const problems: RowProblem[] = [];
  (fallbackFile.rows as Partial<Record<Column, string>>[]).forEach((row, i) => {
    const { item, reason } = checkRecord(row);
    if (item) items.push(item);
    else problems.push({ row: i + 1, title: row.title ?? '', reason: reason ?? 'invalid' });
  });
  report(log, 'fallback file', problems);
  return items;
}

export async function loadWhatsOn({
  url = process.env[WHATS_ON_ENV],
  fetchImpl = fetch as FetchLike,
  now = new Date(),
  log = console,
}: {
  url?: string;
  fetchImpl?: FetchLike;
  now?: Date;
  log?: Logger;
} = {}): Promise<WhatsOnResult> {
  const fallback = (reason: string): WhatsOnResult => {
    if (url) log.warn(`[whats-on] using the checked-in list: ${reason}`);
    return { items: fallbackItems(log).filter((item) => isShowing(item, now)), source: 'fallback', reason };
  };

  if (!url) return fallback(`${WHATS_ON_ENV} is not set`);
  if (!/^https:\/\//.test(url)) return fallback(`${WHATS_ON_ENV} must start with https://`);

  let text: string;
  try {
    const response = await fetchImpl(url, {
      next: { revalidate: WHATS_ON_REVALIDATE },
      signal: AbortSignal.timeout(6000),
      headers: { accept: 'text/csv' },
    });
    if (!response.ok) return fallback(`the sheet answered ${response.status}`);
    text = await response.text();
  } catch (error) {
    return fallback(`the sheet could not be reached (${error instanceof Error ? error.message : String(error)})`);
  }

  try {
    const { items, problems } = parseWhatsOnCsv(text);
    report(log, 'sheet', problems);
    return { items: items.filter((item) => isShowing(item, now)), source: 'sheet' };
  } catch (error) {
    if (error instanceof WhatsOnFormatError) return fallback(`the sheet is not in the expected shape: ${error.message}`);
    throw error;
  }
}

/** Items that belong to one programme, matched by its slug or backend id. */
export function itemsForProgram(items: WhatsOnItem[], slug: string, id: string): WhatsOnItem[] {
  return items.filter((item) => item.programId === slug || item.programId === id);
}
