# MVSA Public Site

Public site for Mountain View Sports Arena: a shop window for the Arena on the
home page, What's on, a page for every programme, the shop, and one place to
book the Arena or the meeting room.

> **Live URL**: [www.mvsa.co.ke](https://www.mvsa.co.ke)  
> **Data source**: the MVSA backend API (`MVSA Backend 1.0.0`). The checked-in
> contract is `src/lib/mvsa-api/openapi.json`; the migration notes and the open
> decisions are in [docs/backend-migration.md](docs/backend-migration.md).

---

## Overview

Next.js (App Router) application. No sign-in.

| Page | What it does |
|---|---|
| `/` | Showcase: the Arena, What's on, every programme, the meeting room, the shop. Links to `/book`, never books itself. |
| `/whats-on` | Offers, the holiday programme and regular sessions, from the What's on sheet. |
| `/book` | The one booking page: the Arena (the 6-step WhatsApp widget) and the meeting room. Reached from the single **Book** button in the navigation. |
| `/programs` and `/programs/<name>` | One themed page per programme with its own share card, share buttons and a **Register now** button that opens WhatsApp with the message filled in. |
| `/shop` | Arena Kit, ordered on WhatsApp. The navigation shows it with a small animated bag. |

Programme addresses are plain words, made for sharing: `/programs/football-academy`,
`/programs/holiday-training`, `/programs/chess-club`, `/programs/community-yoga`,
`/programs/boxing`, `/programs/dance`, `/programs/individual-training`,
`/programs/events`. The old addresses (`/programs/football_academy`,
`/programs/chess`, …) redirect to them.

Venue facts, availability and bookings come from the MVSA backend. Every call is
server-side — through server components or the route handlers under
`src/app/api` — because the backend bearer token must never reach a browser
bundle. Editorial copy lives in `src/content`, and academy programmes come from
the checked-in adapter in `src/lib/academy-programs` because the backend has no
programmes endpoint.

See [PUBLIC_SITE.md](../PUBLIC_SITE.md) for the full page and booking flow reference.

---

## What's on (the Google Sheet)

The What's on cards come from a Google Sheet, so a new offer or event can go up
from a phone without a developer. The site reads the sheet on the server, at
most once an hour. If the sheet is not set up, cannot be reached or is in the
wrong shape, the site shows the checked-in list in `src/content/whats-on.json`
instead.

### Set it up (once)

1. In Google Sheets, make a new sheet called **MVSA What's on**.
2. **File → Import → Upload** `docs/whats-on-template.csv` and choose **Replace
   current sheet**. You now have the right columns and the current cards.
3. Select columns **E and F** (`show_from`, `show_until`) and choose
   **Format → Number → Plain text**. Type dates as `2026-11-30` (or
   `30 Nov 2026`). A date like `11/30/2026` is refused, because it can be read
   two ways.
4. **File → Share → Publish to web**. Pick the sheet, choose
   **Comma-separated values (.csv)**, press **Publish**, and copy the link.
5. In Vercel, open the project → **Settings → Environment Variables**, add
   `WHATS_ON_CSV_URL` with that link for Production and Preview, and redeploy
   once. From then on, sheet changes appear within an hour.

### The columns

| Column | What goes in it |
|---|---|
| `title` | Required. Short: "Holiday Training". Two rows cannot share a title. |
| `kicker` | The small tilted tag above the title: "School's out". |
| `blurb` | Required. One or two sentences. |
| `dates_text` | How the dates read on the card: "Mon–Sat, 11am–1pm, to 19 December". |
| `show_from` | First day the card shows. Blank: show now. |
| `show_until` | Last day the card shows. Blank: no end. Cards switch off by themselves, in Nairobi time. |
| `image` | A picture already on the site, e.g. `/images/arena/morning-turf.webp` (see `public/images`). Blank: the covered pitch. |
| `link_label` | The link text: "Register now". |
| `link_url` | A page on this site (`/programs/chess-club`, `/book`) or a full `https://` address. |
| `program_id` | Shows the card on that programme's page too: `chess-club`, `holiday-training`, … |
| `small_print` | Conditions. Extra Time must carry "Valid on bookings 6am–6pm, 1–30 Nov." |

### Rows that are skipped

A wrong row is skipped (the rest still show) and the reason is written to the
Vercel logs, with the row number, e.g. `[whats-on] sheet row 4 ("Chess Club")
skipped: it has a price …`. A row is skipped when it:

- has no title or blurb, a date that is not a real date, or `show_from` after `show_until`;
- uses a picture from another website, or a link that is not `https://` or a site page;
- shows any price except the Arena's "from KSH 1,500", a Till number or payment
  instructions (Academy fees are only shared on WhatsApp);
- mentions Extra Time with evening play, or without its 6am–6pm small print;
- calls yoga free (it is donation-based).

---

## Local Development

```bash
npm install
npm run dev     # http://localhost:3000
```

### Required `.env.local`

Copy `.env.example` and fill it in. Every variable is server-only; none may be
renamed to `NEXT_PUBLIC_*`.

```
MVSA_API_BASE_URL=http://localhost:8080
MVSA_API_TOKEN=<backend bearer token>
MVSA_API_TENANT_ID=mvsa
MVSA_BOOKING_WRITES_ENABLED=false
WHATS_ON_CSV_URL=            # optional, see "What's on"
```

Without these the site still builds and renders: pages that need venue facts say
the booking system cannot be reached and show the phone and WhatsApp route.

---

## Key Directories

```
src/
├── app/
│   ├── page.tsx             # Home: the showcase (What's on, programmes, room, shop)
│   ├── whats-on/            # What's on, from the sheet
│   ├── book/                # The Arena (6-step widget) and the meeting room
│   ├── programs/            # Catalogue + one themed page and share card per programme
│   ├── about/               # Facility overview
│   ├── contact/             # Contact details + WhatsApp enquiry handover
│   └── api/                 # Server-side route handlers the browser calls
│       ├── availability/    # GET  -> backend GET /v1/availability
│       └── booking/         # POST -> backend /v1/holds and /v1/bookings
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Fixed top navigation with mobile hamburger
│   │   └── Footer.tsx       # MVSA branding and social links
│   ├── booking/
│   │   ├── BookingWidget.tsx # Availability, 15-minute hold, confirm
│   │   └── MeetingRoom.tsx   # Meeting room section and WhatsApp request
│   ├── programs/            # Programme themes, motifs, cards, share buttons
│   └── whats-on/            # What's on posters
├── content/                 # Editorial copy and venue presentation (typed)
└── lib/
    ├── mvsa-api/            # The only place that calls the backend
    ├── booking/             # Booking flow: phone, idempotency, service
    ├── whats-on/            # Sheet reader: strict CSV, checks, hourly cache, fallback
    └── academy-programs.ts  # Programme facts (no backend endpoint yet)
```

---

## Design System

Pitch green and paper, brass accents, after `MVSA/design-system/DESIGN.md`.

- **Fonts**: Big Shoulders (display, heaviest weight; the same face as the social
  graphics), Barlow (body), Barlow Condensed (labels and buttons)
- **Colours**: ink `#0E1C14`, pitch `#2D5016`, grass `#3F8F4A`, brass `#C2A15B`, paper `#F5F2EA`
- **Club accents**, used sparingly: a tilted brass tag, a hard offset shadow under
  big headlines, photos pinned up in a tilted frame
- **Programme themes**: each programme page has its own ground and drawing (chalk
  pitch lines for the Academy, a board for chess, breathing rings for yoga, tape
  for boxing, beat bars for dance, cones for individual training, a burst for
  events), set in `src/content/programs.ts`
- **Children**: no child's face anywhere. A photo that may show children is only
  shown in duotone (forest to cream)
- **Money**: the only figure on the site is "from KSH 1,500 an hour". No Academy
  or chess fees, Till numbers or payment instructions
- **Motion**: the marquee, the shop bag's swing and the yoga rings stop for
  anyone who prefers reduced motion
- **WhatsApp**: floating button to `wa.me/254798258950` on every page

---

## Playwright Tests

End-to-end tests in `tests/`:

```bash
npx playwright test                  # Run all tests
npx playwright test --ui             # Interactive mode
```

`tests/booking.spec.ts` and `tests/booking-writes.spec.ts` drive the booking
path against a mocked `/api/*` layer, including the unreachable-backend and 409
cases, so they need no backend and no token.

`tests/whats-on.spec.ts` checks the sheet reader with no network: CSV quoting,
bad rows, date windows in Nairobi time, and the fallback. `tests/refresh.spec.ts`
checks the one Book button, the shop bag, What's on, the meeting room and every
programme page (share card, register link, no fees on Academy pages).

Key `data-testid` attributes used by tests:

| Attribute | Element |
|---|---|
| `venue-grid` | Venue card selection grid |
| `date-strip` | 14-day date scroller |
| `slot-grid` | Available start times |
| `slot-grid-skeleton` | Slot loading state |
| `duration-options` | Booking length selector |
| `backend-unreachable` | Shown when the backend cannot be reached |
| `slots-empty` | Shown when the backend returned no slots |
| `hold-panel` / `hold-countdown` | Active 15-minute hold |
| `confirm-booking` | Confirm button for a held slot |
| `booking-confirmed` | Confirmed booking screen |

---

## Build

```bash
npm run build    # TypeScript strict compilation
```

Zero TypeScript errors expected on `main`.
