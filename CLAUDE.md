# CLAUDE.md — MSA at Pitt Website

This file documents the codebase for Claude Code sessions. Read this before making changes.

---

## Project Overview

The MSA at Pitt website is a production React app for the Muslim Student Association at the University of Pittsburgh. It combines a CMS-driven home/about/gallery experience with a live events calendar synced from Google Calendar via a Supabase Edge Function.

**Live site**: Deployed on Vercel  
**Repo**: yunusalkamel/MSA-at-Pitt-website  
**Dev branch convention**: `claude/...` branches, PR → squash merge into `main`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + custom design system in `src/index.css` |
| Animation | Framer Motion |
| CMS | Sanity (content: hero, community, gallery albums, leadership) |
| Events backend | Supabase Edge Function (`google-calendar-events`) |
| Event parsing | Custom classifier + Gemini AI for tag extraction |
| Routing | React Router v6 (lazy-loaded pages) |
| State/cache | React Query + localStorage (events cache) |
| Deployment | Vercel (auto-deploy on main) |

---

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build + type check
npm run lint     # ESLint
```

---

## Design System (`src/index.css`)

### Color tokens (CSS variables, defined in `:root`)
- `--msa-gold: #F2AB23` — primary brand gold
- `--gold-pale: #FBF0D0` — pale gold for backgrounds
- `--jannah-mid-hex: #148066` — Islamic green, used for "upcoming" events
- `--background: 38 50% 95%` — HSL, renders as warm parchment `#F8F3EA`
- Dark mode overrides in `.dark`

### Key utility classes
- `gold-gradient` — gold background gradient (signature events, buttons)
- `liquid-glass` / `liquid-glass-hover` / `glass-card` / `glass-card-strong` — glassmorphism cards
- `warm-surface` — parchment background (`#F8F3EA`)
- `btn-premium` / `btn-premium-secondary` — CTA buttons
- `section-padding` / `section-padding-sm` — consistent section spacing
- `tag-chip` / `tag-chip-gold` / `tag-chip-blue` / `tag-chip-muted` — event category chips
- `font-display` (Cormorant Garamond), `font-script` (Pinyon Script), `font-arabic` (Amiri)
- `gradient-mesh-warm` / `gradient-mesh-gold` — background mesh gradients

---

## Events Architecture

### Data flow
1. Supabase Edge Function (`supabase/functions/google-calendar-events/`) fetches Google Calendar every ~2 hours
2. Events are parsed, classified, and stored in Supabase
3. `src/hooks/useCalendarEvents.ts` fetches from Supabase API, caches in localStorage
4. On mount, the hook seeds from localStorage immediately (stale-while-revalidate) — **never show a blank spinner if cached data exists**

### Event tier system (`src/components/events/calendar-utils.ts`)
```ts
type EventTier = "signature" | "recurring" | "upcoming"

getEventTier(event)    // gold=signature, blue=recurring (jummah/halaqa/sports), jannah=upcoming
getTagChipClass(tier, isPast)  // returns CSS class name for chips
```

### Event tier colors
| Tier | Color | CSS |
|------|-------|-----|
| signature | gold `#F2AB23` | `gold-gradient` / `tag-chip-gold` |
| recurring | blue `#60A5FA` | `bg-blue-500/...` / `tag-chip-blue` |
| upcoming | jannah `#148066` | `bg-jannah-mid/...` / `tag-chip` |
| past | muted | `tag-chip-muted` / lower opacity |

This system is applied consistently in: `AgendaView`, `MonthCalendar` (EventChip), `DayEventsPanel`, `EventDetailSheet`, `EventCardBase`, and home page event cards.

### CTA logic (`src/components/events/resolveEventAction.ts`)
- Past events with gallery URL → "View Photos"
- Recurring events → "Subscribe to Calendar" (Google Calendar)
- Future events with `rsvpUrl` → "RSVP"
- Future events without → "Learn More" → linktree

---

## Calendar (`src/components/events/MonthCalendar.tsx`)

### Mobile indicator modes
Controlled by `const MOBILE_INDICATOR: "A" | "B" | "C"` at the top of the file:
- **A** (default): 1 pill per color category + count badge if >1 of same type
- **B**: 1 pill per event in chronological order (max 4)
- **C**: 1 larger dot per individual event

### Islamic holiday tinting
`src/lib/hijri-utils.ts` converts Gregorian → Hijri dates using the `hijri-converter` package.
Each day cell gets a 3px bottom strip in the holiday color — **not** a full cell background.
Holiday categories: `ramadan`, `last10ramadan`, `eid`, `arafah`, `dhulhijjah`, `ashura`.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Home page — hero, stats, events carousel, gallery, pillars |
| `src/pages/Events.tsx` | Events page — view switcher, filter bar, calendar/agenda |
| `src/pages/About.tsx` | About page — mission, focus areas, leadership OrgChart |
| `src/components/events/MonthCalendar.tsx` | Desktop month/week + mobile month calendar |
| `src/components/events/AgendaView.tsx` | Agenda (list) view with past/upcoming grouping |
| `src/components/events/DayEventsPanel.tsx` | Day click popup with tier-colored event cards |
| `src/components/events/EventDetailSheet.tsx` | Bottom sheet / modal for full event details |
| `src/components/events/calendar-utils.ts` | Shared utils: tier system, sort, date formatting |
| `src/components/events/resolveEventAction.ts` | CTA label/URL logic for event actions |
| `src/hooks/useCalendarEvents.ts` | Supabase fetch + localStorage cache |
| `src/lib/hijri-utils.ts` | Gregorian → Hijri conversion + holiday category helpers |
| `src/components/OrgChart.tsx` | Leadership org chart (fetches from Sanity) |
| `src/components/PartnerLogos.tsx` | Community partner logos grid |
| `src/components/AppLoader.tsx` | Suspense splash screen (bismillah + gold progress bar) |
| `src/components/Layout.tsx` | App shell with Navbar, Footer, BackToTop |
| `src/config/links.ts` | All external URLs (Google Calendar, linktree, etc.) |
| `src/data/events.ts` | `MSAEvent` TypeScript interface + mock fallback events |
| `supabase/functions/google-calendar-events/` | Edge function: calendar sync + AI tagging |
| `index.html` | Entry point — favicon, meta tags, font preloads |

---

## Routing (`src/App.tsx`)

All routes are lazy-loaded via `React.lazy`. The `/prayer-times` path redirects to `/resources/prayer-times` (canonical).

---

## CMS (Sanity)

Queries live in `src/lib/sanity.ts` (`QUERIES` object). Components use `useSanityData<T>(query)` from `src/hooks/useSanityData.ts`. Content falls back gracefully to hardcoded `FALLBACK` constants when Sanity is unavailable.

---

## Environment Variables

Required in `.env.local` for full functionality:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SANITY_PROJECT_ID=...
VITE_SANITY_DATASET=production
```

Events will fall back to `src/data/events.ts` mock data if Supabase is unavailable.

---

## Conventions

- **No blank spinners if cached data exists** — always show stale data while refreshing
- **Tier colors everywhere** — recurring=blue, upcoming=jannah, signature=gold. Applied in every event view
- **No per-day background for Islamic holidays** — use 3px bottom strip so adjacent days blend
- **Calendar default**: calendar view (not agenda) for all devices
- **CEC always at bottom** of OrgChart (desktop Row 4 + mobile last section)
- **Section dividers**: one `<SectionDivider />` between major sections — never doubled
