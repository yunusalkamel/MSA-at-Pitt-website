# Administration and analytics implementation checklist

Start from main at `81307ce` (merged inline editor). Each phase gets an isolated commit and verification before proceeding. Use a draft pull request and validate each change on Vercel Preview before any production release. Preview writes must target the preview Sanity dataset and preview-only database records.

## 1. Mobile performance

- [x] Inspect current public routes, editor, and Vercel instrumentation.
- [x] Audit cold mobile and desktop loads for Home, Events, Prayer, Resources, About, and Gallery.
- [x] Attempt a Google PageSpeed Insights audit and document its availability.
- [x] Optimize image payloads, public JavaScript, and redundant requests.
- [x] Verify warm and cold browser behavior and record measurements in [the performance report](mobile-performance.md).
- [x] Recheck the editor and identify pre-existing test failures.
- [x] Deploy the phase to Vercel Preview and verify Sanity allows credential-free reads from its exact origin.
- [ ] Run the deployed browser checks in a Vercel-authenticated session.

## 2. Owner dashboard and administrator permissions

- [x] Add isolated Supabase authorization, settings, and audit tables with RLS.
- [x] Add per-request permission checks and cover active-session revocation.
- [x] Implement the owner dashboard, administrator lifecycle, publishing/maintenance controls, security activity, and health checks.
- [x] Confirm owner access remains available with all administrator controls disabled.

- [x] Apply the additive management migration to the linked Supabase project.
- [ ] Connect the preview environment key and verify separate real accounts on the protected Vercel preview. See [owner setup and verification](owner-setup.md).

## 3. Google authentication

- [x] Configure Google OAuth and exact permitted callbacks for production and preview.
- [x] Implement persistent sessions, verified identity checks, expired/unauthorized states, and sign-out.
- [ ] Verify OAuth and owner-only authorization in preview with real accounts.

## Editor coverage

- [x] Add inline link destinations to Join, Contact, and shared footer links.
- [x] Allow removing an individual duplicate card.
- [x] Expand external link editing, hidden cards, copy ordering, image descriptions, upload resizing, underline, undo and redo.
- [x] Enable editing of event card titles, locations and external actions while preserving the calendar feed. Gallery image overrides and resource cards retain their existing IDs.

## 4. Versions, restoration, and backups

- [x] Add durable publication snapshots, field diffs, author identity, and reconciliation around Sanity revisions.
- [x] Add history filtering, before-and-after preview, restoration, and undo.
- [x] Add owner export and manual snapshots with explicit dataset labels.
- [x] Exercise real isolated preview Sanity transactions, stale revision rejection, restoration and preservation of later versions.
- [ ] Verify the protected deployment with the real owner and a second administrator.

## 5. Analytics and performance

- [x] Add consent-aware GA4 public tracking and owner-only reporting.
- [x] Add aggregate traffic, acquisition, and real supported interaction and funnel reports.
- [x] Add optional Clarity integration and usability links with recordings disabled by default.
- [x] Add analytics controls, privacy disclosures, exports, and a real-user performance view.
- [x] Measure analytics overhead and keep reporting code out of public bundles.

## 6. Final verification

- [x] Run automated authorization, isolation, migration, publishing, analytics, and privacy tests.
- [x] Exercise six public routes in Chrome and iPhone-sized WebKit and the simulated Chrome editor workflow.
- [ ] Run authenticated browser acceptance through Vercel protection and exercise configured external reports.
- [x] Repeat mobile and desktop performance audits and distinguish simulated metrics from real-user data.
- [x] Document external configuration and production rollout. Keep the PR in draft until review and approval.

[Final audit and mobile measurements](final-audit.md) · [External reporting setup and deployment checklist](reporting-setup.md)
