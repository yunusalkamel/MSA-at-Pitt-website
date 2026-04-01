# Deploying `google-calendar-events` in Lovable Cloud / Supabase

This repository contains the Edge Function source code at:

- `supabase/functions/google-calendar-events/index.ts`
- `supabase/functions/google-calendar-events/google-calendar-service.ts`

## Required deployed function name

The function **must** be deployed as:

- `google-calendar-events`

The frontend calls that exact name via Supabase Functions invoke.

## Data source (no Google API key required)

This implementation uses the public Google Calendar iCal/ICS feed:

- `https://calendar.google.com/calendar/ical/2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com/public/basic.ics`

No Google Calendar API key is required for this fallback path.

## Lovable/Supabase deployment path

If your Lovable Cloud project does not expose an Edge Function deploy button,
use the Supabase project dashboard (or Supabase CLI) for deployment.

1. Open the Supabase project linked to this app.
2. Go to **Edge Functions**.
3. Deploy function folder `supabase/functions/google-calendar-events`.
4. Confirm the function name is exactly `google-calendar-events`.
5. Verify it appears in Edge Functions list.

## Validation checklist

- Edge Functions list shows `google-calendar-events`.
- Calling `/functions/v1/google-calendar-events` returns JSON with `stage: "success"`.
- Events page loads live events; if feed is unreachable, UI falls back gracefully to curated events.
