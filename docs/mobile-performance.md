# Mobile performance audit

Measured November 25, 2026 with Lighthouse 12.8.2 on Chrome. The baseline was production at commit `81307ce`. The candidate was a local production build. Both used Lighthouse's default simulated mobile profile and desktop preset. The local build could not use the production Sanity browser origin or Vercel telemetry. Timing and scores are directional across hosts. Transfers include the files Chrome requested during each navigation.

| Page | Mobile score | Desktop score | Mobile LCP | Mobile CLS | Mobile TBT |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home | 26 → 74 | 81 → 95 | 19.03 → 6.29 s | 0.000 → 0.076 | 3,683 → 33 ms |
| Events | 22 → 60 | 78 → 96 | 11.80 → 6.24 s | 0.326 → 0.003 | 5,025 → 525 ms |
| Prayer | 50 → 51 | 84 → 96 | 11.30 → 7.35 s | 0.012 → 0.028 | 752 → 950 ms |
| Resources | 73 → 82 | 88 → 100 | 11.14 → 4.77 s | 0.003 → 0.000 | 56 → 35 ms |
| About | 71 → 75 | 88 → 97 | 12.51 → 6.63 s | 0.002 → 0.000 | 109 → 66 ms |
| Gallery | 65 → 77 | 87 → 98 | 11.76 → 5.50 s | 0.004 → 0.001 | 257 → 82 ms |

| Page | Mobile requests | Script transfer | Image transfer | Total transfer |
| --- | ---: | ---: | ---: | ---: |
| Home | 65 → 45 | 286 → 164 KiB | 1,733 → 206 KiB | 3,662 → 858 KiB |
| Events | 40 → 36 | 300 → 175 KiB | 531 → 36 KiB | 2,297 → 551 KiB |
| Prayer | 68 → 30 | 287 → 216 KiB | 531 → 20 KiB | 2,360 → 636 KiB |
| Resources | 34 → 31 | 221 → 151 KiB | 531 → 37 KiB | 2,270 → 577 KiB |
| About | 36 → 32 | 222 → 153 KiB | 834 → 209 KiB | 2,574 → 771 KiB |
| Gallery | 37 → 32 | 220 → 150 KiB | 994 → 323 KiB | 2,638 → 773 KiB |

Lighthouse classified the old compressed 1.1 MiB SVG favicon separately from images. The homepage also requested a 490 KiB footer logo, multiple full-size partner logos, and two 43 KiB copies of the calendar response. The built entry chunk fell from 98.44 to 58.87 kB gzip. Supabase Auth loads alongside the editor instead of the public pages. The shared Layout chunk fell from 96.79 to 81.49 kB gzip after the public Sanity reads stopped using the full SDK.

The Home and Prayer routes were also measured with both builds on the same compressed local server. Home desktop scored 79 → 95, with LCP 3.7 → 1.4 s and main-thread work 0.9 → 0.5 s. The local baseline Home mobile run could not calculate LCP. Prayer scored 68 → 58 mobile and 86 → 97 desktop in that set, with mobile LCP 11.4 → 6.4 s. The lower Prayer mobile score reflects main-thread work, which remains a follow-up alongside its Chart.js rendering.

An iPhone-sized Chrome run used 150 ms network latency, 1.6 Mbps download, and 4× CPU slowdown. The homepage LCP measured 3.82 → 2.76 s cold and 4.50 → 1.15 s warm. Chrome rendered all six route headings without browser exceptions, horizontal overflow, or downloads of the editor bundle. Those Chrome timings preceded the last Events layout and Prayer request changes. A final WebKit run rendered all six routes with live read-only integrations at the permitted site origin, and switched the Prayer location. The prayer chart fetched two annual responses for the visible period instead of 36 monthly responses. Safari WebDriver was unavailable because remote automation is disabled. WebKit used iPhone 13 viewport and touch emulation.

The built-in Vercel Analytics and Speed Insights scripts transferred about 10 KiB combined on the production homepage. The candidate keeps both for public pages on the production hostname. It excludes private management and preview pages. GA4 and Clarity overhead will be measured with those integrations enabled and disabled in Phase 5.

The PageSpeed Insights API returned HTTP 429 `RESOURCE_EXHAUSTED`. Real-user p75 LCP, INP, and CLS are unverified. The desktop lab scores met the 95 target. Mobile Lighthouse scores and LCP missed their targets. There is still meaningful work in the shared JavaScript and font request chain and Prayer's chart initialization. Repeat the mobile measurements on the deployed preview and check p75 field data after rollout.

## Verification

- Production build passed. The test suite reported the same four event-card failures as main, caused by fixture categories and the test environment's missing IntersectionObserver.
- The existing editor passed a Chrome smoke test with a simulated backend. The test edited text, duplicated a card, published, and reloaded the public Prayer page.
- To repeat the cold and warm browser checks, install Playwright browsers and run `node scripts/performance-check.mjs <origin> chromium` or `node scripts/performance-check.mjs <origin> webkit`. Set `CHROME_PATH` to use an installed Chrome binary.
- For live Sanity reads on a new preview domain, add its exact HTTPS origin under Sanity **API → CORS Origins** with **Allow credentials** off. Preview builds use the preview Sanity dataset. The site falls back to its built-in content if a public query fails.
