# Calendar reliability and mobile release

- [x] Start from latest main (including #60/#61); preserve desktop and editor IDs.
- [x] Correct Supabase project to hvoiytjyimcyvpamsbay.
- [x] Private persistent event snapshot, atomic sync lease, 15-minute schedule, exponential failure backoff.
- [x] Move Google/Gemini work out of visitor requests; support official API when configured.
- [x] Initialize from real calendar; deploy backend and verify 725 events, 227 upcoming.
- [x] Verify SQL authorization, concurrency and stale preservation with rolled-back transaction.
- [x] Add authenticated production-only Admin refresh control.
- [x] Meaningful event actions and safe preservation of calendar description links.
- [ ] Align initial hero loading with image readiness, preserve prompt photo changes.
- [ ] Optimize mobile image/font delivery and scroll work; verify Chrome and WebKit.
- [ ] Before/after Lighthouse with analytics enabled and disabled (home/prayer).
- [ ] Final tests, types, build and security checks.
- [ ] Consolidated unmerged PR and preview.

Google Calendar API key is not currently installed. Public ICS scheduled sync succeeded;
if Google blocks it again the saved snapshot remains available. For the more reliable API,
enable Google Calendar API, restrict a key to that API, and install it as the Supabase
GOOGLE_CALENDAR_API_KEY secret. This server key must not use browser-referrer restrictions.
No frontend key is needed and calendar events remain in the existing shared Google calendar.
