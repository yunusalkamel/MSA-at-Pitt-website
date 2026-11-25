import { chromium, devices, webkit } from "playwright";

const [origin, engine = "chromium"] = process.argv.slice(2);
if (!origin || !["chromium", "webkit"].includes(engine)) {
  throw new Error("Usage: node scripts/performance-check.mjs <origin> [chromium|webkit]");
}
const expectedOrigin = new URL(origin).origin;

const browser = await (engine === "webkit" ? webkit : chromium).launch(
  engine === "chromium" && process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : {},
);
const device = devices["iPhone 13"];
const paths = ["/", "/events", "/resources/prayer", "/resources", "/about", "/gallery"];

try {
  for (const path of paths) {
    const context = await browser.newContext({ ...device });
    try {
      const page = await context.newPage();
      let requests = [];
      let errors = [];
      page.on("request", (request) => requests.push(request.resourceType()));
      page.on("pageerror", (error) => errors.push(error.message));
      if (engine === "chromium") {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 150,
          downloadThroughput: 1_600_000 / 8,
          uploadThroughput: 750_000 / 8,
          connectionType: "cellular3g",
        });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      }
      await page.addInitScript(() => {
        window.auditLcp = 0;
        if (PerformanceObserver.supportedEntryTypes?.includes("largest-contentful-paint")) {
          new PerformanceObserver((list) => {
            window.auditLcp = list.getEntries().at(-1).startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });
        }
      });

      for (const cache of ["cold", "warm"]) {
        requests = [];
        errors = [];
        const response = cache === "cold"
          ? await page.goto(new URL(path, origin).href)
          : await page.reload();
        if (!response?.ok()) throw new Error(`${path} returned HTTP ${response?.status()}`);
        if (new URL(page.url()).origin !== expectedOrigin) {
          throw new Error(`${path} redirected to ${new URL(page.url()).origin}. Sign in to the preview before auditing it.`);
        }
        const heading = await page.locator("main h1").first().innerText({ timeout: 15000 });
        await page.waitForFunction(() => document.fonts.status === "loaded", { timeout: 15000 });
        // Match the sampling window across cold and warm loads without waiting
        // for metrics beacons or polling connections to go idle.
        await page.waitForTimeout(1800);
        const timings = await page.evaluate(() => {
          const entries = performance.getEntriesByType("resource");
          const bytes = (rows) => rows.reduce((sum, row) => sum + row.transferSize, 0);
          const navigation = performance.getEntriesByType("navigation")[0];
          return {
            jsBytes: bytes(entries.filter((row) => /\.js(?:$|\?)/.test(row.name))),
            imageBytes: bytes(entries.filter((row) => row.initiatorType === "img")),
            totalBytes: navigation.transferSize + bytes(entries),
            loadMs: Math.round(navigation.loadEventEnd),
            lcpMs: Math.round(window.auditLcp) || null,
            adminBundle: entries.some((row) => /\/assets\/Admin-[\w-]+\.js/.test(row.name)),
            wide: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        console.log(JSON.stringify({ engine, path, cache, heading, requests: requests.length, errors, ...timings }));
        if (errors.length || timings.adminBundle || !heading.trim()) process.exitCode = 1;
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
