# AIPC Event Management Platform

A standalone React application for the Annual India Pastors' Conference (AIPC), built as the
**future event-management platform** for AIPC.

> **This project does not touch the live site.**
> `https://aipc.live/` runs on WordPress with Gravity Forms and Razorpay and is the system of
> record for the current event cycle. This application is a parallel build. It reads nothing
> from and writes nothing to the production site, its database, or its payment configuration.

---

## What this is

Two applications in one codebase:

| | |
|---|---|
| **Public event site** | Event information, programme, speakers, registration fees, registration flow, exhibition and stalls, gallery, venue, accommodation, travel, FAQs, documents, announcements, edition archive |
| **Admin platform** | Dashboard, editions, programme, speakers, registrations, attendees, check-in, badges, rooming, pricing, sponsors, partners, exhibitors, stalls floor plan, gallery, documents, FAQs, announcements, enquiries, settings |

## Technology

React 19 · TypeScript · Vite · React Router 7 · Tailwind CSS 3 · lucide-react

No state library, no UI kit, no chart library. The dashboard charts, the modal, the toasts and
the floor plan are all local components, which keeps the bundle small and the dependency
surface honest.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check then production build into dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

Node 20 or newer.

### Admin sign in (demo build only)

| Email | Password | Role |
|---|---|---|
| `admin@aipc.demo` | `aipc-demo` | Super admin |
| `checkin@aipc.demo` | `aipc-demo` | Check-in desk only |

Mock authentication lives in `src/auth/AuthContext.tsx` and is clearly isolated. There is no
"instant admin" link. Replace `signIn` with a call to the backend session endpoint before
deploying anywhere public.

## Environment variables

Copy `.env.example` to `.env.local`. Anything prefixed `VITE_` is bundled into the browser
build and is public, so no secret ever belongs there.

| Variable | Purpose |
|---|---|
| `VITE_DATA_ADAPTER` | `demo` (browser storage) or `api` (backend) |
| `VITE_API_BASE_URL` | Base URL of the future REST API |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **public** key id only |
| `VITE_SITE_URL` | Used for canonical and OpenGraph URLs |

Backend-only values (Razorpay key secret, database URL, JWT secret, SMTP, WhatsApp token,
WordPress application password, Gravity Forms consumer secret) are listed in `.env.example` as
comments so the backend team knows what to provision. None of them belong in this project.

## Project structure

```
src/
├── assets/              (images live in public/assets)
├── auth/                AuthContext.tsx, roles.ts        — mock auth, role matrix
├── components/
│   ├── admin/           AdminPage, CrudModule, StatCard, BarChart
│   ├── common/          Button, Modal, DataTable, FormField, Toasts, ErrorBoundary…
│   ├── exhibition/      FloorPlan
│   ├── layout/          PublicHeader, PublicFooter, AnnouncementBar, StickyCTA, AdminSidebar…
│   ├── public/          Hero, Countdown, PricingCards, FaqAccordion, Lightbox, EnquiryForm…
│   └── registration/    RegistrationWizard, Stepper
├── data/                Seed content extracted from aipc.live
├── hooks/               useCurrentEvent, useCountdown, useDocumentMeta, useScrollTop
├── layouts/             PublicLayout, AdminLayout
├── pages/
│   ├── admin/           21 admin screens
│   └── public/          25 public screens
├── routes/              Route table, ProtectedRoute, AreaRoute
├── services/            One module per domain + adapters/
│   └── adapters/        LocalDemoAdapter, ApiAdapter, WordPressAdapter,
│                        GravityFormsAdapter, RazorpayAdapter
├── store/               StoreContext, database shape
├── types/               Every domain model
└── utils/               format, ids, cn
```

Business logic sits in `src/services`. Components read from the store and call services; no
component builds a fetch call of its own.

## Routes

**Public** — `/` `/event` `/programme` `/agenda`→`/programme` `/speakers` `/speakers/:id`
`/registration` `/pricing` `/sponsors` `/partners` `/exhibition` `/stalls` `/stalls/:id`
`/exhibitors` `/gallery` `/venue` `/accommodation` `/travel` `/faq` `/contact` `/documents`
`/news` `/events` `/events/:slug` `/privacy-policy` `/terms` `/refund-policy` · 404 for anything else

**Admin** — `/admin` (sign in) then `/admin/dashboard` `/admin/events` `/admin/programme`
`/admin/speakers` `/admin/announcements` `/admin/registrations` `/admin/attendees`
`/admin/check-in` `/admin/badges` `/admin/rooming` `/admin/pricing` `/admin/sponsors`
`/admin/partners` `/admin/exhibitors` `/admin/stalls` `/admin/gallery` `/admin/documents`
`/admin/faqs` `/admin/enquiries` `/admin/settings`

Every admin route is behind `ProtectedRoute`; each area is additionally gated by `AreaRoute`
against the signed-in role.

## Data models

`EventEdition` `Speaker` `Session` `RegistrationCategory` `Registration` `Attendee` `Room`
`Sponsor` `Partner` `Exhibitor` `Stall` `GalleryAlbum` `GalleryImage` `Enquiry` `EventDocument`
`Announcement` `Faq` `SiteSettings` `AdminUser`

Nothing hard-codes 2026. `SiteSettings.currentEventId` selects the edition the public site
shows; adding AIPC 2027 in Admin → Editions and switching that setting is enough to start the
next cycle.

## Where the content came from

Real AIPC content, verified against aipc.live on 10 September 2026:

- Event name, 8th edition, theme "Living as Exiles", 1 Peter 1:24-25, dates 29 Sept – 1 Oct 2026
- GCC Hotel & Club, Mira Road, Mumbai; check-in 12 noon on the 29th; close after lunch on the 1st
- Organiser Equip Indian Churches; 600+ pastors, 25+ states, 3 days
- All eight registration fees (early bird and normal, three sharing types plus day scholar)
- Extended-stay rates, eligibility and English-language notices
- Partners For The Truth and Truth:78
- All ten published FAQs, verbatim
- Travel guidance by train and air
- Contact phone numbers
- Logo and one hero photograph, re-encoded to WebP at three widths

Marked `Content pending` rather than invented: contact email (obfuscated on the live site),
session titles and times, the 2025 archive record, the brochure file, most gallery photographs.

`DEMO DATA` and `isDemo: true`: sponsors, exhibitors, stalls and the whole floor plan,
registrations, attendees, rooms, one enquiry. Demo sponsors are inactive so they never reach
the public site. No production attendee or payment record exists anywhere in this repository.

**AIPC publishes no speakers on purpose** — the conference states it does not want participants
drawn to particular preachers. The speaker module is fully built and deliberately empty; the
policy is quoted on the public speakers page.

## Connecting a backend

`src/services/dataSource.ts` is the only place the data source is chosen. Implement
`DataAdapter` (`load` / `persist`), point `VITE_DATA_ADAPTER=api` at it, and no UI file changes.

Adapter sketches already in the repository:

- **`ApiAdapter`** — future Node/Fastify + PostgreSQL REST API
- **`WordPressAdapter`** — read-only. Lists pages from the WordPress REST API. Never writes.
- **`GravityFormsAdapter`** — read-only. Maps Gravity entries onto `Registration`. Requires a
  backend proxy holding the consumer secret; field ids are configuration because they change
  per form revision.
- **`RazorpayAdapter`** — order creation only, against a backend endpoint.

## Payments

`src/services/paymentService.ts` returns `not-configured` in this build, and the registration
wizard says so plainly on the review step. Registrations are recorded as unpaid.

To connect payments later: backend creates the Razorpay order using the key secret, frontend
opens Checkout with the public key id and that order id, and a **server-side webhook verifies
the signature** before any registration is marked paid. Never trust the browser for that.

## Notifications

`notificationService.ts` defines the templates (registration confirmation, payment pending,
enquiry acknowledgement, speaker application acknowledgement, event reminder, check-in
information, admin notification). `whatsappService.ts` describes the WhatsApp side. Both
describe intent only; a backend job runner sends them.

## Still to connect

1. Backend API and database — everything currently lives in browser storage
2. Real authentication and server-enforced roles
3. Payments (Razorpay orders and webhook verification)
4. Email and WhatsApp providers
5. File and image upload (gallery, logos, documents currently take URLs)
6. QR scanning at the check-in desk — the badge payload already carries a scannable value
7. Gravity Forms import, if and when AIPC authorises reading the live entries
8. The GST position on registration fees, which AIPC has not published

## Accessibility and quality

Semantic landmarks, a skip link, labelled form fields with error text, `aria-expanded` on
disclosure controls, keyboard-operable floor plan, focus-visible outlines in AIPC gold,
`prefers-reduced-motion` respected, and status conveyed by text as well as colour.

Verified in a headless browser at 1440px and 390px across all 26 public routes and all 20 admin
routes: no console errors, no page errors, no horizontal overflow, every route renders an `h1`.

Performance choices, made deliberately against the problems found on the live WordPress site:
route-level code splitting, one Google Fonts request for two families, `loading="lazy"` on
non-hero images, `srcSet`/`sizes` on the hero, WebP at three widths, no full-resolution
originals anywhere.

## Using this in Google Antigravity

Extract the ZIP. The top-level folder `AIPC-Event-Management/` is the project root — open that
folder directly. Then `npm install` and `npm run dev`. The repository contains no
`node_modules`, no build output, no OS metadata and no credentials.
