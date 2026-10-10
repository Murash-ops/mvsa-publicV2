# Backend migration: Supabase out, MVSA backend API in

This site used to read and write a Supabase project directly from the browser
and from server components. It now reads the venue's own backend service
("MVSA Backend 1.0.0"), server-side only.

The contract this was built against is checked in at
`src/lib/mvsa-api/openapi.json`, copied from the service that generates it.
Nothing in this repository may call the backend except `src/lib/mvsa-api`.

**Nothing here has been deployed.** The branch builds and its tests pass
locally. Three decisions below are the owner's, and the first of them —
whether and how the backend becomes reachable from the internet — blocks the
rest.

---

## 1. What moved where

| Old Supabase table | Now | Where in the code |
| --- | --- | --- |
| `time_slots` | `GET /v1/availability` | `src/app/api/availability/route.ts`, rendered by `BookingWidget` |
| `venues` | `GET /v1/knowledge/facts` for hours and prices; the two resource ids are fixed (`res_turf`, `res_meeting_room`) | `src/content/venues.ts` (name, photo, blurb only), `src/app/book/page.tsx` |
| booking writes (`create_booking_with_hold` RPC) | `POST /v1/customers/resolve` → `POST /v1/holds` → `POST /v1/bookings` | `src/lib/booking/service.ts`, `src/app/api/booking/*` |
| `site_content` | **no endpoint** — moved into the repository | `src/content/site.ts` |
| `programs` | **no endpoint** — checked-in seed data | `src/lib/academy-programs.ts` |
| `enrollments` | **no endpoint** — the enrolment write path was removed | WhatsApp enquiry on each programme page |
| `inquiries` | **no endpoint** — the form hands over to WhatsApp | `src/app/contact/page.tsx` |

Deleted along the way:

- `src/utils/supabase/*`, `src/proxy.ts` (its only job was refreshing a
  Supabase auth session; this site has no sign-in), `src/types/database.ts`;
- `@supabase/ssr` and `@supabase/supabase-js` from `package.json`;
- `src/components/programs/EnrollmentFlow.tsx` — it wrote the `enrollments`
  table and called a Supabase Edge Function for an M-Pesa STK push. Neither has
  a backend equivalent, and it was not referenced by any page;
- `src/components/booking/SlotCard.tsx` and `BookingSummary.tsx` — unreferenced,
  typed against the Supabase slot tables, and `BookingSummary` displayed a "50%
  deposit due now" rule the venue has not approved.

## 2. How the client works

`src/lib/mvsa-api` is the only door to the backend. It holds:

- the base URL and the bearer token, read from server-only environment
  variables;
- the three protected headers the contract requires on **every** call —
  `X-Tenant-Id`, `X-Request-Id`, `X-Contract-Version: 1.0.0`;
- an `Idempotency-Key` on every mutation (canonical UUIDv4, as the contract
  requires), derived per step from one browser intent key so a retry of the
  same customer action reuses the same key — see `src/lib/booking/idempotency.ts`
  and the note there about why each endpoint needs its own key;
- an 8-second default timeout and up to three attempts **for GETs only**;
  mutations are never replayed by the client;
- error normalisation: every failure becomes an `MvsaApiError` with a `kind`,
  so callers can tell "the venue cannot be reached" from "that slot just went".

**The browser never calls the backend.** Client components call this site's own
route handlers under `/api`, which call the backend. That is what keeps the
bearer token server-side, and it is why the backend host does **not** belong in
the `connect-src` of the Content-Security-Policy.

## 3. Honest failure behaviour

This was a requirement, not a nicety, because the backend is not reachable from
Vercel today.

- **Backend unreachable, timing out, misconfigured or erroring (502 from our
  route):** the booking page shows "We cannot reach the arena booking system
  right now", adds that this does not mean the arena is full, offers a retry,
  and shows the WhatsApp and phone route. It never renders an empty slot list
  in this case.
- **Backend reachable but no slots:** a separate message — "nothing of that
  length is left on this date" — with a suggestion to try a shorter booking or
  another day.
- **409 on hold or on confirm** (`RESOURCE_UNAVAILABLE` or `HOLD_EXPIRED`): the
  customer is told the time was taken while they were deciding, the dead hold is
  cleared, and availability is re-fetched. The database exclusion constraint is
  the final authority on overlap, so this can happen for a slot that availability
  showed a moment earlier; the site does not retry behind the customer's back or
  silently pick another time.
- **Hold expiry:** the 15-minute hold is shown as a live countdown. When it
  lapses the customer is told the slot is free for others again and the diary is
  re-read.
- **Homepage prices:** rendered from `GET /v1/knowledge/facts`. If that call
  fails the page says live rates are unavailable and gives reception's number
  instead of printing a figure it cannot stand behind.

## 4. The gaps

Three of the six Supabase tables have no equivalent in the backend contract, a
fourth (`enrollments`) has none either, and a fifth problem showed up in the
booking path. None of these are worked around silently.

### Gap 1 — `site_content`: fixed, and better off

Editorial copy now lives in `src/content/site.ts`, typed and version
controlled. It needs no database, no endpoint and no network call, and a change
to the hero or the mission statement is now a reviewable diff rather than a row
edit.

**Recommendation:** leave it in the repository. Do not ask for a site-content
endpoint. If staff need to edit copy without a developer, that is a separate
request — a small CMS or a staff page — not a reason to put marketing text in
the booking database.

One thing was lost: the old `site_content` row could change the hero image and
copy without a deploy. Nobody appears to have been using it (the shipped
fallbacks were what rendered), but it is a real reduction in flexibility and the
owner should know.

### Gap 2 — `programs`: seed data behind one adapter

`src/lib/academy-programs.ts` is the only source of programme data. It carries a
prominent comment that no backend endpoint exists, serves checked-in seed data
kept consistent with the activity catalogue the backend *does* serve
(`GET /v1/activities`, where every one of these is `booking_mode:
"enquiry_only"`), and is wired to nothing live. Both programme pages render from
it, so the site still looks right.

**Recommendation:** keep it as seed data for now; the five programmes change
rarely. If programme detail must be maintained by staff, the right fix is a
`GET /v1/programmes` (or an extension of `GET /v1/activities` with description,
age range and schedule) on the backend — then replace the two functions at the
bottom of that module and delete the seed. Ask Owen for that only if staff
actually need to edit it.

### Gap 3 — `enrollments`: write path removed, not faked

The old `EnrollmentFlow` created an `enrollments` row and triggered an M-Pesa STK
push through a Supabase Edge Function. There is no backend endpoint for either,
and no approved online payment flow for programmes. The component was already
unreferenced (an earlier commit had redirected enrolment to WhatsApp), so it was
deleted rather than left to rot with a dead data layer.

**Recommendation:** leave enrolment as a WhatsApp enquiry. Before any online
enrolment returns, the venue needs an approved enrolment record, a payment
provider decision and a refund policy — none of which exist. Do not reintroduce
a payment path on the public site without them.

### Gap 4 — `inquiries`: the form can no longer claim a message was stored

The old contact form inserted into `inquiries` and then told the visitor
"your message has been logged straight in our dashboard system". With that table
gone there is nowhere for it to go.

The form now composes the message and hands it to the venue's WhatsApp line. The
disclosure is shown **before** sending ("messages are not stored on this
site…") and repeated after ("nothing was stored on this site, so the message
only reaches us once you send it"), next to reception's phone number. No
submission is silently dropped and no confirmation is shown for something that
did not happen.

**Recommendation:** keep the WhatsApp handover. Enquiries are already read on
WhatsApp, and the bot sits on the same line. If a stored enquiry trail is
wanted, the backend already has `POST /v1/conversations/messages` for inbound
messages — that is a conversation about whether website enquiries should enter
the same message store, and it needs Owen's input on channel and provider
fields, which today are WhatsApp-specific. Until then, no new endpoint.

### Gap 5 — website customer resolution is an open contract item

This one was not in the original list and it is the reason booking writes ship
switched **off**.

`POST /v1/holds` and `POST /v1/bookings` both require a `customer_id`. The only
way to get one is `POST /v1/customers/resolve`, and that endpoint fixes
`provider` to `"meta_cloud"` and `channel` to `"whatsapp"`. There is no website
variant — even though `POST /v1/bookings` *does* accept `channel: "website"`.

So a website booking has to be resolved through the WhatsApp provider, using the
number the visitor typed as the WhatsApp identifier. That is how
`src/lib/booking/service.ts` does it, with the constraint written out in a
comment, and it is why `MVSA_BOOKING_WRITES_ENABLED` defaults to `false`.

The risk is not theoretical: if the visitor's WhatsApp number differs from the
number they typed, an identifier is attached to the wrong customer, and the
contract itself warns about that (`409 IDENTITY_CONFLICT`).

**Recommendation:** ask Owen for a website channel on
`POST /v1/customers/resolve` — a `channel: "website"` with a `provider` such as
`"web"` whose `provider_user_id` is the verified phone, or a documented
statement that resolving through `meta_cloud` from the website is acceptable.
Until one of those exists, leave writes off: the widget still shows live
availability and hands the customer to WhatsApp, which is exactly what the site
did before, minus the misleading "Reserving slot…" button.

Related, already handled: when resolve returns
`needs_identity_confirmation: true` (match type `existing_record_unverified`),
the site does not proceed. It tells the customer reception must confirm it is
them and hands over, as the backend's addendum requires.

## 5. Environment variables

All server-only. None may be renamed to `NEXT_PUBLIC_*`: that prefix inlines the
value into the browser bundle, and one of these is a bearer token.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MVSA_API_BASE_URL` | yes | Backend origin, no trailing slash, no `/v1` |
| `MVSA_API_TOKEN` | yes | HTTP bearer token; every endpoint except `/v1/health` |
| `MVSA_API_TENANT_ID` | no (default `mvsa`) | Sent as `X-Tenant-Id`; must match the backend's `MVSA_TENANT_ID` or every call gets 403 |
| `MVSA_API_TIMEOUT_MS` | no (default `8000`) | Per-request timeout |
| `MVSA_BOOKING_WRITES_ENABLED` | no (default `false`) | Allows the hold/confirm path. See gap 5 |

With none of them set the site still builds and renders; the pages that need
venue facts say the booking system cannot be reached.

## 6. The site must follow the backend on prices and start times

A pricing change is due in the backend: turf will be priced **per clock-hour
band** rather than from the booking's start time, and turf starts will be
restricted to **:00 and :20**.

This site does not need code changes for either, and it must stay that way:

- **Start times are not generated here.** The widget renders exactly the slots
  `GET /v1/availability` returns, in the order it returns them. When the backend
  stops offering `:40` starts, they stop appearing. Nothing in the UI assumes a
  20-minute cadence; the copy says "the arena publishes the start times it can
  offer".
- **Prices are not calculated here.** Each slot shows its own
  `price.display` from the API, the hold shows the backend's `price_quote`, and
  the confirmation shows `amount_due`. There is no hourly rate multiplied by a
  duration anywhere in this repository, and the old "peak / off-peak" tiles —
  which did assume one rate for a whole booking — are gone. The homepage rate
  cards render `pricing_summary` straight from `GET /v1/knowledge/facts`.
- **Two things to watch when the change lands.** First, if a booking spanning
  two bands gets a composite price, `price.display` must carry the total the
  customer will pay, because that single string is what the site shows; if the
  backend starts returning a per-band breakdown it would be worth displaying,
  and that is a small follow-up here. Second, the widget offers 1–5 hours and a
  full day (`src/components/booking/BookingWidget.tsx`,
  `DURATION_OPTIONS`); the allowed set is validated server-side against
  `ALLOWED_DURATION_MINUTES` in `src/lib/booking/contracts.ts`. If whole-hour
  durations stop being the rule, both lists need revisiting — but no price
  arithmetic does, because there is none.

## 7. Response headers (`vercel.json`)

- Every `*.supabase.co` / `*.supabase.in` entry is gone from the CSP, along with
  `images.unsplash.com` and `transparenttextures.com` (the hero image is now a
  local asset and the texture belonged to a deleted component). `img-src` is
  down to `'self' data: blob:`.
- **The backend host is deliberately absent from `connect-src`.** The browser
  only ever calls this site's own `/api` routes, which `'self'` covers. If the
  API host ever appears in `connect-src`, that is a sign someone has started
  calling the backend from the browser — which would mean the token is in the
  bundle.
- **`Access-Control-Allow-Origin: *` and the two other CORS headers are
  removed.** They were applied to every response, which let any website read
  this site's responses — including, now, the new `/api/availability` route,
  which would have let any page on the internet drive the venue's backend
  through a visitor's browser. Nothing cross-origin needs to read this site; if
  something ever does, allow that one origin on that one path.

## 8. What the owner has to do to make this live

In order. The first item blocks everything after it.

1. **Decide whether the backend becomes reachable from Vercel, and how.** Today
   it is not: `compose-mvsa-backend-1` listens on port 8080 on the Docker network
   of the VPS, is not published to the host, and the Cloudflare tunnel exposes
   only `bot.mvsa.co.ke/webhook/*` to n8n. Vercel runs the site's server code in
   Vercel's own network, so with the backend closed the deployed site will show
   the "cannot be reached" state on every page that needs venue facts. The
   options are all the owner's call, and each has strings attached:
   - a Cloudflare tunnel hostname for the API, locked down with Cloudflare
     Access or a WAF rule, so only Vercel's requests with the bearer token get
     through;
   - mutual TLS or an IP allowlist — awkward, because Vercel's egress addresses
     are not fixed unless a static-egress feature is paid for;
   - leave the backend closed and keep the public site read-only against copy
     and seed data, with booking handled on WhatsApp as it is today.
   Whatever is chosen, exposure brings consequences the backend does not handle
   yet: **rate limiting** (there is none in front of these endpoints, and
   `/v1/availability` is cheap to call in a loop), **a second token** so the
   website's credential is not the bot's, **token rotation**, and **logging and
   alerting** on 401/403 so a leaked token is visible. This branch does not
   touch `tunnel/config.yml` or anything on the VPS; that work is deliberately
   left to the owner.
2. **Answer gap 5** with Owen — a website channel on
   `POST /v1/customers/resolve`, or a written decision that resolving through
   `meta_cloud` is acceptable. Only then set
   `MVSA_BOOKING_WRITES_ENABLED=true`.
3. **Set the environment variables** in Vercel (Production and Preview), as
   plain encrypted env vars, not `NEXT_PUBLIC_*`: `MVSA_API_BASE_URL`,
   `MVSA_API_TOKEN`, `MVSA_API_TENANT_ID=mvsa`. Leave
   `MVSA_BOOKING_WRITES_ENABLED` unset until step 2 is done.
4. **Check the tenant id matches** the backend's `MVSA_TENANT_ID`. A mismatch is
   a 403 on every call and looks exactly like an outage.
5. **Verify on a preview deployment before production**: the booking page shows
   real start times and prices; the homepage rate cards match
   `GET /v1/knowledge/facts`; and with the token deliberately wrong, the site
   shows the "cannot be reached" state rather than an empty diary.
6. **Then, and only with writes enabled, make one real booking end to end** and
   check it appears for reception, before announcing online booking to
   customers. The site shows a reference and says payment is due at reception;
   nothing is charged online.

## 9. Known limits of this branch

- No endpoint was invented. `POST /v1/conversations/messages` exists in the
  contract but is not used by the site; it is the WhatsApp gateway's.
- The confirmed-booking screen cannot be revisited: there is no endpoint to look
  a booking up again, so the reference is shown once and reception is the way
  back to it.
- `customer_id` never reaches the browser. The confirm step re-resolves the
  customer with the same idempotency key, which replays the stored response, so
  the booking is attached to the same customer without putting an internal
  identifier in a page.
- The site does not cancel or reschedule. The backend reports
  `can_cancel: false` and `can_reschedule: false`, and no cancellation or refund
  policy has been approved; cancellation requests go to the manager.
