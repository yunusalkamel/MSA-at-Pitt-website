# Final preview-branch audit

November 25, 2026. Lighthouse ran against locally served production builds in Chrome. The before columns use the Phase 1 production baseline. The candidate used the same mobile simulation and desktop preset. Network timings vary across hosts and runs. Localhost lacks production Sanity CORS access. Separate read-only browser checks used the permitted site origin. The homepage row uses the median score run per device after homepage module preloading. Other public routes do not execute that preload.

| Route | Mobile before → after | Desktop before → after | Mobile LCP | Mobile CLS | Mobile TBT | JS KiB | Images KiB | Total KiB | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| home | 26 → 73 | 81 → 94 | 5.71 s | 0.074 | 213 ms | 286 → 165 | 1733 → 247 | 3662 → 900 | 65 → 50 |
| events | 22 → 91 | 78 → 98 | 3.24 s | 0.012 | 12 ms | 300 → 176 | 531 → 36 | 2297 → 553 | 40 → 36 |
| resources-prayer | 50 → 87 | 84 → 97 | 3.18 s | 0.039 | 231 ms | 287 → 217 | 531 → 20 | 2360 → 638 | 68 → 30 |
| resources | 73 → 83 | 88 → 96 | 4.36 s | 0.000 | 62 ms | 221 → 151 | 531 → 36 | 2270 → 594 | 34 → 31 |
| about | 71 → 83 | 88 → 98 | 4.44 s | 0.003 | 6 ms | 222 → 152 | 834 → 209 | 2574 → 768 | 36 → 32 |
| gallery | 65 → 77 | 87 → 97 | 5.45 s | 0.005 | 133 ms | 220 → 151 | 994 → 323 | 2638 → 771 | 37 → 32 |

Homepage repeat scores were {'mobile': [73, 73, 74], 'desktop': [92, 94, 98]}. The largest homepage element was introductory text. Font stylesheet blocking and the wait for the page and shared layout modules contributed to rendering delay. The candidate loads the font stylesheet asynchronously and starts fetching the two homepage modules from the document head. Fonts, motion and public route JavaScript still contribute to mobile rendering time. A lab score does not establish p75 field LCP or INP. PageSpeed Insights returned HTTP 429. Field verification requires production traffic and reporting credentials.

## Cold and warm browser loads

iPhone 13 viewport in Chrome, 150 ms latency, 1.6 Mbps download and 4× CPU slowdown. Browser resource transfer excludes some cross-origin bytes without timing access. Cold and warm LCP are individual lab observations.

| Route | Cold / warm load (ms) | Cold / warm LCP (ms) | Cold / warm requests |
|---|---:|---:|---:|
| / | 777 / 203 | 2720 / 504 | 47 / 54 |
| /events | 788 / 204 | 2944 / 648 | 32 / 32 |
| /resources/prayer | 791 / 194 | 3416 / 460 | 28 / 29 |
| /resources | 788 / 207 | 2708 / 392 | 28 / 29 |
| /about | 791 / 266 | 4668 / 588 | 30 / 31 |
| /gallery | 857 / 287 | 3808 / 680 | 29 / 30 |

## Optional analytics overhead

The enabled build was tested in a 390-pixel Chrome viewport at 4× CPU slowdown with production-host routing to local files. Beacons were intercepted locally. This isolates public payload and request behavior. It cannot measure live Google ingestion or cellular latency. Both consent states used the same build.

| Consent | Load event (ms), two runs | Optional collector | Initial beacons | Management bundles |
|---|---:|---:|---:|---:|
| Declined | 1314, 171 | 0 bytes | 0 | 0 |
| Granted | 125, 147 | 1.52 kB gzip after idle | 1 | 0 |

Timing varied substantially between runs. The reliable overhead in this experiment is the opt-in module and one same-origin page-view request. The default build omits the collector. Google reporting, Clarity export and CrUX calls run on demand from the owner dashboard.

## Functional and security results

- All 22 automated tests passed. Four previously failing event-card tests used an outdated event fixture and lacked a viewport observer. They now exercise the current event actions. The independent PostgreSQL authorization suite passed. The application type check still reports 16 pre-existing errors in the gallery filters, calendar, chart component and homepage icon types.
- The real preview Sanity dataset passed a disposable, isolated two-publication test, revision rejection, restoration and preservation of the later version. Temporary audit documents were cleaned up. The deployment-specific Sanity token and the end-to-end Google owner session were not available to that test.
- Chrome and iPhone-sized WebKit rendered all six routes with live public reads at the permitted origin and no management bundles or browser exceptions. The local cold/warm WebKit run reported localhost Sanity CORS errors. The separate permitted-origin run passed. Chrome exercised inline edit, duplicate, publish and public reload against a simulated editor backend.
- Vercel deployment protection redirected the available browser to login. An authenticated preview acceptance run with two real accounts and live reporting providers remains open. The provider configuration and release steps are in [reporting setup](reporting-setup.md).
