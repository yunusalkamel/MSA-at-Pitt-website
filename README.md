# MSA at Pitt — Website

The official website of the Muslim Student Association at the University of Pittsburgh.

**Live site**: [msaatpitt.org](https://msaatpitt.org)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 + custom design tokens |
| Animation | Framer Motion |
| CMS | Sanity.io (gallery, org chart) |
| Events | Google Calendar API (via Supabase Edge Function) |
| Hosting | Vercel |
| Analytics | Vercel Analytics + Speed Insights |

---

## Development

```bash
npm install
npm run dev       # localhost:8080
npm run build     # production build
npm run lint      # ESLint
```

Environment variables required (see `.env.example`):
- `VITE_SANITY_PROJECT_ID`
- `VITE_SANITY_DATASET`

---

## Project Structure

```
src/
  pages/          # Route-level components (Index, Events, About, …)
  components/
    events/       # Calendar, AgendaView, EventDetailSheet, …
    ui/           # Shadcn/ui primitives
  lib/            # Utilities (calendar-utils, hijri-utils, linkify, …)
  hooks/          # useCalendarEvents, useSanityData, …
  contexts/       # ThemeContext
public/
  favicon.svg     # SVG crescent + star favicon
  partners/       # Partner organization logos
supabase/
  functions/      # google-calendar-events Edge Function
```

---

## Events Architecture

Events are fetched from Google Calendar via a Supabase Edge Function, classified server-side, and cached in `localStorage`. The client seeds from cache immediately (stale-while-revalidate) and refreshes in the background.

### Tier System

| Tier | Criteria | Color |
|------|----------|-------|
| `signature` | `isSignature`, `featured`, or `#signature` tag | Gold |
| `recurring` | Categories: jumuah, halaqa, sports, social | Blue |
| `upcoming` | Everything else | Jannah green |

### Calendar Modes

The events page defaults to Calendar view. The mobile month calendar indicator style is controlled by `MOBILE_INDICATOR` in `MonthCalendar.tsx`:
- **A** — one pill per color category + count badge
- **B** — one pill per event (max 4)
- **C** — one dot per event (max 5)

### Islamic Holiday Tinting

Days in significant Islamic periods are marked with a 3px colored strip at the bottom of each calendar cell (via `src/lib/hijri-utils.ts` using the `hijri-converter` package). Clicking a highlighted day shows the holiday name in the day panel.

---

## Design System

Key Tailwind tokens (defined in `src/index.css`):
- `--gold` / `--primary`: MSA gold `#F2AB23`
- `--jannah-mid`: `#148066` (teal green)
- `--background`: `hsl(38 50% 95%)` light / `#060B18` dark
- `font-display`: Cormorant Garamond
- `font-body`: Plus Jakarta Sans
- `font-script`: Pinyon Script

---

## CMS (Sanity)

Used for gallery albums and the org chart. Content is fetched client-side via `@sanity/client`. The studio is managed separately.

---

## Contributing

1. Branch from `main`
2. Run `npm run build` before pushing — no TypeScript errors allowed
3. Follow existing component patterns; no new abstractions without clear need
4. Design tokens are in `src/index.css` — add colors there, not inline
