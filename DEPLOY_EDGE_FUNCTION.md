# Deploying `google-calendar-events` in Lovable Cloud / Supabase

This repository already contains the Edge Function source code at:

- `supabase/functions/google-calendar-events/index.ts`
- `supabase/functions/google-calendar-events/google-calendar-service.ts`

## Required deployed function name

The function **must** be deployed as:

- `google-calendar-events`

The frontend calls that exact name via Supabase Functions invoke.

## Required secret

Set this server-side secret in the same Supabase/Lovable project:

- `GOOGLE_CALENDAR_API_KEY`

The function reads this secret with `Deno.env.get("GOOGLE_CALENDAR_API_KEY")`.

## Lovable Cloud manual steps (UI)

1. Open your project in Lovable.
2. Go to **Cloud** → **Edge functions**.
3. Click **Deploy function** (or **Create/Deploy from repo**, depending on UI version).
4. Select function folder `supabase/functions/google-calendar-events`.
5. Confirm the deployed function name is exactly `google-calendar-events`.
6. In **Cloud** → **Secrets** (or Edge Function env settings), add:
   - key: `GOOGLE_CALENDAR_API_KEY`
   - value: your Google Calendar API key
7. Re-deploy the function after saving the secret.
8. Verify it appears in **Cloud** → **Edge functions** list as `google-calendar-events`.

## Validation checklist

- Edge Functions page shows `google-calendar-events`.
- Function logs show successful invocation from the frontend.
- Events page no longer shows fallback error banner.
