# Visual editor and analytics upgrade

Base: main at 3261bf2, including PR #59. Ship through one isolated preview and pull request. Leave main untouched.

- [x] Capture baseline build and cross-reference recap dates with the MSA calendars.
- [x] Simplify the Home gallery, add Fall '26 albums, hide classification filters, and fix navigation and Prayer presentation.
- [x] Add visual structure, reusable pages and content blocks, private drafts, publishing, and collection editing.
- [x] Port PR #55 design controls to the owner dashboard and publish through the existing version store.
- [x] Extend analytics and add consent-aware Clarity, provider controls, and verification.
- [x] Measure mobile before and after with analytics on and off. Report the scores and transfer sizes in PR #60.
- [x] Verify private access, draft and scheduling exclusion, publishing permissions, and visual workflows in the browser and tests.
- [x] Deploy the upgrade as a protected Vercel preview for PR #60. Leave the pull request open and unmerged.
- [ ] Review sign-in and preview publishing with the real owner and a marketing administrator in the protected deployment.
- [ ] Run Owner → Analytics → Analytics providers → Verify connections with the environment’s provider credentials. Confirm real Clarity recordings in the project after a reviewed production release.

## Review notes

- On the Prayer page in Admin, click a Jumu’ah photo, adjust Crop across or Crop down, and use Next photo to inspect the other image. Use as preview photo changes the public cover after publishing.
- Page templates have their own URLs, publish windows, SEO and social cards. Built-in routes retain their URLs and support inline editing and section changes.
- Browser QA used an isolated management fixture. It exercised saved crops and covers, card and section ordering, draft recovery on refresh, the phone preview, and Owner A/B.
- Final production-dependency audit has two moderate findings listed under React Router packages. The audit offers a major-version upgrade for the remaining findings.
- The protected preview requires Vercel authentication. GA4 and Chrome UX Report data verification requires the corresponding service credentials. Clarity recordings use project `zjhbwa68n4` with a separate visitor opt-in. The optional export token is for owner dashboard aggregate data. See [provider setup](reporting-setup.md).

The board calendar confirms the 2025 Cedar Point, Fajr and Breakfast, paintball, and 2026 World Hijab Day dates. The event calendar confirms the other dates except the Fall GBM. Its August 26 entry is the first GBM, while the owner identified the pictured Fall GBM as September. Keep that recap at month precision until the day is confirmed. Fall 2026 albums currently use the supplied recap sheets where album originals are unavailable.
