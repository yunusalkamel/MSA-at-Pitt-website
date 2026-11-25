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

- [ ] Configure Google OAuth and exact permitted callbacks for production and preview.
- [x] Implement persistent sessions, verified identity checks, expired/unauthorized states, and sign-out.
- [ ] Verify OAuth and owner-only authorization in preview with real accounts.

## 4. Versions, restoration, and backups

- [ ] Add durable publication snapshots, field diffs, author identity, and reconciliation around Sanity revisions.
- [ ] Add history filtering, before-and-after preview, restoration, and undo.
- [ ] Add owner export and manual snapshots with explicit dataset labels.
- [ ] Test conflict handling and partial failures against preview.

## 5. Analytics and performance

- [ ] Add consent-aware GA4 public tracking and owner-only reporting.
- [ ] Add aggregate traffic, acquisition, and real supported interaction and funnel reports.
- [ ] Add optional Clarity integration and usability links with recordings disabled by default.
- [ ] Add analytics controls, privacy disclosures, exports, and a real-user performance view.
- [ ] Measure analytics overhead and keep reporting code out of public bundles.

## 6. Final verification

- [ ] Run automated authorization, isolation, migration, publishing, analytics, and privacy tests.
- [ ] Verify public and authenticated flows in Chrome and Safari or iPhone WebKit.
- [ ] Repeat mobile and desktop performance audits and distinguish simulated metrics from real-user data.
- [ ] Document external configuration and production rollout. Keep the PR in draft until review and approval.
