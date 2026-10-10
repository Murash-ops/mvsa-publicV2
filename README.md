# MVSA Public Site

Public-facing booking and information site for Mountain View Sports Arena.

> **Live URL**: [www.mvsa.co.ke](https://www.mvsa.co.ke)  
> **Data source**: the MVSA backend API (`MVSA Backend 1.0.0`). The checked-in
> contract is `src/lib/mvsa-api/openapi.json`; the migration notes and the open
> decisions are in [docs/backend-migration.md](docs/backend-migration.md).

---

## Overview

Next.js (App Router) application serving the public booking funnel, program catalog, and facility information. No user authentication required.

Venue facts, availability and bookings come from the MVSA backend. Every call is
server-side — through server components or the route handlers under
`src/app/api` — because the backend bearer token must never reach a browser
bundle. Editorial copy lives in `src/content`, and academy programmes come from
the checked-in adapter in `src/lib/academy-programs` because the backend has no
programmes endpoint.

See [PUBLIC_SITE.md](../PUBLIC_SITE.md) for the full page and booking flow reference.

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
```

Without these the site still builds and renders: pages that need venue facts say
the booking system cannot be reached and show the phone and WhatsApp route.

---

## Key Directories

```
src/
├── app/
│   ├── page.tsx             # Homepage (server component, dynamic from site_content)
│   ├── book/                # 6-step WhatsApp booking widget
│   ├── programs/            # Program catalog (checked-in adapter)
│   ├── about/               # Facility overview
│   ├── contact/             # Contact details + WhatsApp enquiry handover
│   └── api/                 # Server-side route handlers the browser calls
│       ├── availability/    # GET  -> backend GET /v1/availability
│       └── booking/         # POST -> backend /v1/holds and /v1/bookings
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Fixed top navigation with mobile hamburger
│   │   └── Footer.tsx       # MVSA branding and social links
│   └── booking/
│       └── BookingWidget.tsx # Availability, 15-minute hold, confirm
├── content/                 # Editorial copy and venue presentation (typed)
└── lib/
    ├── mvsa-api/            # The only place that calls the backend
    ├── booking/             # Booking flow: phone, idempotency, service
    └── academy-programs.ts  # Programme seed data (no backend endpoint yet)
```

---

## Design System

- **Fonts**: Cinzel (display headings), DM Sans (body), JetBrains Mono (prices/codes)
- **Colors**: Forest green (#2D5016), Gold (#C5A55A), deep dark background (#061a10 family)
- **Shape**: Sharp corners (`rounded-none`) throughout
- **WhatsApp**: Persistent floating button linking to `wa.me/254798258950` on every page

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
