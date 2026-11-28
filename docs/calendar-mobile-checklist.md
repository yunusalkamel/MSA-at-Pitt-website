# Calendar reliability and mobile release

- [x] Start from latest main (including #60/#61); preserve desktop and editor IDs.
- [x] Correct Supabase project to hvoiytjyimcyvpamsbay.
- [x] Private persistent event snapshot, atomic sync lease, 15-minute schedule, exponential failure backoff.
- [x] Move Google/Gemini work out of visitor requests; support official API when configured.
- [x] Initialize from real calendar; deploy backend and verify 725 events, 227 upcoming.
- [x] Verify SQL authorization, concurrency and stale preservation with rolled-back transaction.
- [x] Add authenticated production-only Admin refresh control.
- [x] Meaningful event actions and safe preservation of calendar description links.
- [x] Align initial hero loading with image readiness, preserve prompt photo changes.
- [x] Optimize mobile image/font delivery and scroll work. Chrome responsive checks passed; local WebKit checks encountered upstream Sanity CORS restrictions.
- [ ] Mobile 90+ target remains unconfirmed. Extra benchmark passes stopped at the user’s request. Local home baseline was 63; iterative builds measured 63–78, so no 90+ claim is made. Clarity and Vercel scripts were exercised with tracking submissions intercepted.
- [x] Final validation: 41 app tests, 4 Edge Function tests, TypeScript and production build passed; no high/critical dependency findings.
- [x] Consolidated unmerged draft PR #62 and Vercel review preview.

Google Calendar API key is not currently installed. Public ICS scheduled sync succeeded;
if Google blocks it again the saved snapshot remains available. For the more reliable API,
enable Google Calendar API, restrict a key to that API, and install it as the Supabase
GOOGLE_CALENDAR_API_KEY secret. This server key must not use browser-referrer restrictions.
No frontend key is needed and calendar events remain in the existing shared Google calendar.

Success scheduling is aligned to quarter-hour cron ticks to avoid runtime drift.
SQL checks verified 15/30/60/120-minute retries, stale payload preservation and private access.
There are two existing moderate dependency advisories; no high or critical findings.

## Follow-up content and event polish
- Details is the default; genuine calendar-designated registration wins over recurring-event categories.
- The shared parser recognizes labeled URLs and known form destinations, but excludes generic links and Linktree hubs. Cached descriptions are rechecked on the frontend too.
- Every event popup retains registration (when present) and Add to Calendar. Open weekly programs show No RSVP needed; pending required registration links to Linktree.
- Apple subscriptions use a fixed, non-editor webcal destination. Desktop hero parallax changes from 48 to 64; phone stays at 120.
- The duplicate prayer page redirects to Prayer. ICP's current homepage adds a 2:15 PM English repeat service; no separate upcoming spring timetable was available.
- Removed the unsigned president quote, chaplain marketing item and obsolete footer policy paragraph, retaining consent controls.
- Fixed partner links and Brothers Social management; added per-page titles and exact organization-name social metadata; Gaza recap image responses get noindex.
