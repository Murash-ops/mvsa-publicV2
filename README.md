# MVSA Public Site

Public-facing booking and information site for Mountain View Sports Arena.

> **Live URL**: [www.mvsa.co.ke](https://www.mvsa.co.ke)  
> **Supabase project**: `ojblrfrfzzslsbwvvaei`

---

## Overview

Next.js 14 (App Router) application serving the public booking funnel, program catalog, and facility information. No user authentication required — bookings go through a WhatsApp-first flow.

See [PUBLIC_SITE.md](../PUBLIC_SITE.md) for the full page and booking flow reference.

---

## Local Development

```bash
npm install
npm run dev     # http://localhost:3000
```

### Required `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://ojblrfrfzzslsbwvvaei.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

---

## Key Directories

```
src/
├── app/
│   ├── page.tsx             # Homepage (server component, dynamic from site_content)
│   ├── book/                # 6-step WhatsApp booking widget
│   ├── programs/            # Program catalog + dynamic enrollment forms
│   ├── about/               # Facility overview
│   └── contact/             # Contact details + inquiry form
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Fixed top navigation with mobile hamburger
│   │   └── Footer.tsx       # MVSA branding and social links
│   └── booking/
│       └── BookingWidget.tsx # 6-step booking flow + WhatsApp redirect
└── utils/
    └── supabase/            # Browser + server Supabase client helpers
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

35 tests passing across public + admin codebases (as of TestSprite V3 report, May 29 2026).

Key `data-testid` attributes used by tests:

| Attribute | Element |
|---|---|
| `venue-grid` | Venue card selection grid |
| `date-strip` | 14-day date scroller |
| `slot-grid` | Available hourly slots |
| `slot-grid-skeleton` | Slot loading state |

---

## Build

```bash
npm run build    # TypeScript strict compilation
```

Zero TypeScript errors expected on `main`.
