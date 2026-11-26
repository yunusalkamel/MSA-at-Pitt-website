import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "@playwright/test";

const base = process.env.REVIEW_URL || "http://127.0.0.1:4297";
const output = process.env.REVIEW_SCREENSHOTS;
const local = new URL(base).hostname === "127.0.0.1";
const pages = [
  ["home", "/"], ["events", "/events"], ["resources", "/resources"],
  ["prayer", "/resources/prayer"], ["about", "/about"],
];

async function contextFor(browser, width, height, colorScheme, reducedMotion = "reduce", fixture = {}) {
  const context = await browser.newContext({
    viewport: { width, height }, colorScheme, reducedMotion,
    deviceScaleFactor: 1, hasTouch: width < 768,
  });
  context.setDefaultTimeout(12000);
  if (local) {
    await context.route("**/api/site-editor", route => route.fulfill({ json: { fields: {}, revision: null } }));
    await context.route("https://rwdbbktc.apicdn.sanity.io/**", route => {
      const query = new URL(route.request().url()).searchParams.get("query") || "";
      const result = query.includes("announcement-main") && fixture.announcement
        ? { isActive: true, message: "Campus announcement for the navigation check", type: "info", linkUrl: "/events", linkLabel: "See events" }
        : query.includes('"resources-page"') && fixture.chaplain
          ? { imamEmail: "imam-test@example.org", imamOfficeHours: "Tuesday 2–3 PM" }
          : query.includes('"galleryAlbum"') && fixture.albums
            ? [
                { title: "Fall album from the calendar check", eventDate: "2026-10-12", slug: "fall-2026-check", category: ["social"] },
                { title: "Spring album from the calendar check", eventDate: "2027-03-15", slug: "spring-2027-check", category: ["social"] },
              ]
            : null;
      return route.fulfill({ json: { result } });
    });
    if (fixture.calendarError) {
      await context.route("**/functions/v1/google-calendar-events", route => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
    }
  }
  return context;
}

async function visit(page, path) {
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.locator("main h1").waitFor();
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 1800))]));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path + " overflows");
}
const titleTop = page => page.locator("main .page-hero h1").evaluate(el => el.getBoundingClientRect().top);
const prayerTimes = page => page.locator(".daily-prayers dd").allTextContents();
const tileList = page => page.locator("[data-hero-tile]").evaluateAll(tiles => tiles.map(tile => tile.dataset.photo));
const checkDistinct = tiles => assert.equal(new Set(tiles).size, tiles.length);
const pill = page => page.locator(".next-prayer-link");

async function checkWall(page, columns) {
  const tiles = page.locator("[data-hero-tile] img:not(.wall-previous)");
  await page.waitForFunction(() => Array.from(document.querySelectorAll("[data-hero-tile] img")).every(img => img.complete && img.naturalWidth));
  assert.equal(await tiles.count(), columns ** 2);
  assert.equal(await tiles.evaluateAll(images => new Set(images.map(img => img.currentSrc)).size), columns ** 2);
  checkDistinct(await tileList(page));
  await page.getByRole("group", { name: "Photos from MSA at Pitt gatherings" }).waitFor();
  assert.equal(await page.locator(".photo-arrangement").getAttribute("aria-hidden"), "true");
  if (columns === 3) assert.ok(await tiles.evaluateAll(images => images.every(img => img.currentSrc.endsWith("-tile.webp"))));
}

async function capture(browser, width, height, theme, writeImages) {
  const context = await contextFor(browser, width, height, theme);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const positions = [];
  for (const [name, route] of pages) {
    await visit(page, route);
    if (name === "home") {
      await checkWall(page, width < 768 ? 3 : 4);
      assert.equal(await page.getByRole("button", { name: "Pause photos" }).count(), 0);
      if (width === 390 && theme === "dark" && writeImages) {
        const still = await tileList(page);
        await page.waitForTimeout(2100);
        assert.deepEqual(await tileList(page), still);
      }
      if (theme === "dark" && width >= 768) {
        assert.equal(await page.locator('[data-photo="fajr-bridge"]').getAttribute("data-hero-tile"), "7");
      }
      await page.getByRole("button", { name: "Switch to " + (theme === "dark" ? "light" : "dark") + " mode" }).waitFor();
    } else {
      await page.waitForTimeout(650);
      positions.push(await titleTop(page));
    }
    if (name === "events") {
      assert.equal(await page.getByRole("button", { name: width < 768 ? "agenda" : "calendar", exact: true }).getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator(".events-switcher").evaluate(el => getComputedStyle(el).top),
        await page.locator("html").evaluate(el => getComputedStyle(el).getPropertyValue("--nav-offset").trim()));
    }
    if (name === "prayer") {
      const photo = page.locator(".prayer-hero-photo");
      await page.waitForFunction(() => document.querySelector(".prayer-hero-photo")?.naturalWidth > 0);
      assert.match(await photo.getAttribute("src"), /lawn-prayer\.webp$/);
      assert.equal(await photo.evaluate(img => getComputedStyle(img).objectPosition), "100% 0%");
      assert.equal((await prayerTimes(page)).length, 6);
      assert.equal(await page.locator("img[src*='room-photo-pending']").count(), 0);
      assert.equal(await page.locator("#ctop").count(), 0);
    }
    if (writeImages && output) await page.screenshot({ path: `${output}/${width}x${height}-${theme}-${name}.png` });
  }
  assert.ok(Math.max(...positions) - Math.min(...positions) < 2, `Unaligned titles at ${width}: ${positions.join(", ")}`);
  assert.deepEqual(errors, []);
  await context.close();
  console.log(`${width}x${height} ${theme}: five pages, aligned titles, phone view, collage and assets`);
}

async function interactions(browser) {
  const context = await contextFor(browser, 1440, 900, "light");
  const page = await context.newPage();
  await visit(page, "/");
  const resources = page.getByRole("link", { name: "Resources", exact: true });
  const stats = page.locator(".home-stats .glass");
  const menu = page.locator("#resources-submenu");
  const nav = page.locator(".nav-pill");
  const style = locator => locator.evaluate(el => {
    const css = getComputedStyle(el);
    return [css.backgroundImage, css.backdropFilter, css.boxShadow];
  });
  const beforeWidth = await page.locator("html").evaluate(el => el.clientWidth);
  await resources.hover();
  await menu.waitFor({ state: "visible" });
  await menu.getByRole("link", { name: "New to Pitt" }).hover();
  await page.waitForTimeout(220);
  assert.equal(await menu.isVisible(), true);
  assert.equal(await page.locator("html").evaluate(el => el.clientWidth), beforeWidth);
  assert.deepEqual(await style(menu), await style(nav));
  assert.deepEqual(await style(stats), await style(nav));
  await page.mouse.move(5, 5);
  await menu.waitFor({ state: "hidden" });
  await resources.focus();
  await menu.waitFor({ state: "visible" });
  await resources.press("ArrowDown");
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "All Resources");
  await page.keyboard.press("Escape");
  await menu.waitFor({ state: "hidden" });
  const arrow = page.getByRole("button", { name: "Resources submenu" });
  await arrow.focus();
  await arrow.press("Enter");
  await menu.waitFor({ state: "visible" });
  await resources.click();
  await page.waitForURL("**/resources");

  const card = page.locator(".resource-tile").first();
  const box = await card.boundingBox();
  await card.hover();
  assert.equal(await card.locator(".tile-detail").isVisible(), true);
  assert.equal((await card.boundingBox()).height, box.height);
  await page.mouse.move(5, 5);
  await card.locator(".tile-detail").waitFor({ state: "hidden" });
  await card.focus();
  await card.locator(".tile-detail").waitFor({ state: "visible" });
  assert.equal((await card.boundingBox()).height, box.height);
  assert.equal(await card.locator(".tile-description").evaluate(el => getComputedStyle(el).webkitLineClamp), "4");

  await visit(page, "/");
  const homeTimes = await prayerTimes(page);
  const nextPrayer = await pill(page).getAttribute("aria-label");
  await visit(page, "/resources/prayer-times");
  await page.waitForURL("**/resources/prayer");
  assert.deepEqual(await prayerTimes(page), homeTimes);
  assert.equal(await pill(page).getAttribute("aria-label"), nextPrayer);
  await page.getByRole("button", { name: /Open solar almanac/i }).click();
  await page.waitForFunction(() => window.Chart?.getChart(document.getElementById("ctop")));
  const chartToday = await page.evaluate(() => {
    const a = window.Chart.getChart("ctop"), b = window.Chart.getChart("cbot");
    const date = new Date();
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric",
    }).formatToParts(date).map(part => [part.type, Number(part.value)]));
    const index = Math.round((Date.UTC(parts.year, parts.month - 1, parts.day) - Date.UTC(2026, 0, 1)) / 86400000);
    return [...a.data.datasets, ...b.data.datasets].map(series => {
      const time = series.data[index];
      const h = Math.floor(time / 60);
      return (h % 12 || 12) + ":" + String(time % 60).padStart(2, "0") + (h >= 12 ? "pm" : "am");
    });
  });
  assert.deepEqual(chartToday, homeTimes);
  await page.getByLabel("Almanac location").selectOption("west");
  await page.getByRole("heading", { name: "Attawheed Islamic Center", exact: true }).waitFor();
  assert.deepEqual(await prayerTimes(page), homeTimes);
  await page.getByRole("button", { name: /Close solar almanac/i }).click();
  await page.getByRole("button", { name: /View WPU Reflection Room photos/ }).click();
  const dialog = page.getByRole("dialog", { name: "WPU Reflection Room photos" });
  await dialog.waitFor();
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await context.close();
  console.log("Resources hover intent, navigation, keyboard, scroll width, shared glass, fixed cards and synchronized prayer times verified.");
}

async function announcementAndPhone(browser) {
  for (const width of [360, 390, 1440]) {
    const context = await contextFor(browser, width, 900, "light", "reduce", { announcement: true });
    const page = await context.newPage();
    const results = [];
    for (const [, route] of pages.slice(1)) {
      await visit(page, route);
      const strip = page.getByText("Campus announcement for the navigation check");
      await strip.waitFor();
      await page.waitForTimeout(700);
      const withStrip = await titleTop(page);
      const offset = await page.locator("html").evaluate(el => Number.parseFloat(el.style.getPropertyValue("--nav-offset")));
      await page.getByRole("button", { name: "Dismiss" }).click();
      await strip.waitFor({ state: "hidden" });
      await page.waitForTimeout(250);
      const withoutStrip = await titleTop(page);
      const smaller = await page.locator("html").evaluate(el => Number.parseFloat(el.style.getPropertyValue("--nav-offset")));
      assert.ok(withStrip > withoutStrip);
      assert.ok(Math.abs(withStrip - withoutStrip - (offset - smaller)) < 2);
      results.push(withStrip);
    }
    assert.ok(Math.max(...results) - Math.min(...results) < 2, `Unaligned with announcement at ${width}: ${results}`);
    await context.close();
  }
  console.log("Titles align with the announcement on and off. Navigation fits at 360px and 390px.");
}

async function motion(browser, width, height) {
  const context = await contextFor(browser, width, height, "light", "no-preference");
  const page = await context.newPage();
  await visit(page, "/");
  const columns = width < 768 ? 3 : 4;
  await checkWall(page, columns);
  await page.getByRole("button", { name: "Pause photos" }).click();
  const paused = await tileList(page);
  await page.waitForTimeout(2100);
  assert.deepEqual(await tileList(page), paused);
  const changed = [];
  for (let i = 0; i < 4; i++) {
    const before = await tileList(page);
    await page.getByRole("button", { name: "Change collage photos" }).click();
    const incoming = page.locator(".wall-incoming");
    await incoming.waitFor();
    assert.equal(await page.locator("img.wall-previous").count(), 1);
    assert.equal(await incoming.evaluate(el => getComputedStyle(el).animationDuration), columns === 3 ? "0.5s" : "0.4s");
    const after = await tileList(page);
    const different = before.flatMap((id, index) => id === after[index] ? [] : [index]);
    assert.equal(different.length, 1);
    const position = different[0];
    const previous = changed.at(-1);
    if (previous != null) assert.ok(Math.max(Math.abs(position % columns - previous % columns),
      Math.abs(Math.floor(position / columns) - Math.floor(previous / columns))) > 1);
    changed.push(position);
    checkDistinct(after);
    assert.ok(await incoming.evaluate(el => {
      const rect = el.closest("figure").getBoundingClientRect();
      return Array.from(document.querySelectorAll(".hero-words h1,.hero-words .font-script,.hero-words .hero-actions"))
        .map(node => node.getBoundingClientRect())
        .every(box => rect.right <= box.left || rect.left >= box.right || rect.bottom <= box.top || rect.top >= box.bottom);
    }));
    await incoming.waitFor({ state: "detached" });
  }
  await page.getByRole("button", { name: "Play photos" }).click();
  await page.locator(".wall-incoming").waitFor();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hidden = await tileList(page);
  await page.waitForTimeout(2100);
  assert.deepEqual(await tileList(page), hidden);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(300);
  const offscreen = await tileList(page);
  await page.waitForTimeout(2100);
  assert.deepEqual(await tileList(page), offscreen);
  await context.close();
  console.log(`${width}: paused, automatic, hidden-tab and offscreen collage motion verified. Swaps avoid text and adjacent tiles.`);
}

async function galleryAndChaplain(browser) {
  const context = await contextFor(browser, 1440, 900, "light", "reduce", { albums: true, chaplain: true });
  const page = await context.newPage();
  await visit(page, "/gallery");
  await page.getByRole("button", { name: "Fall '26", exact: true }).click();
  await page.getByRole("heading", { name: "Fall album from the calendar check" }).waitFor();
  await page.getByRole("heading", { name: "Spring album from the calendar check" }).waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Spring '27", exact: true }).click();
  await page.getByRole("heading", { name: "Spring album from the calendar check" }).waitFor();
  await visit(page, "/resources/chaplain");
  await page.getByText("Tuesday 2–3 PM", { exact: true }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Email Imam Muhammad Patel" }).getAttribute("href"), "mailto:imam-test@example.org");
  await visit(page, "/resources/faq");
  await page.getByRole("button", { name: /Where can I find the university chaplain/ }).click();
  await page.getByText(/Tuesday 2–3 PM/).waitFor();
  await context.close();
  console.log("New semester tabs and Sanity chaplain email and hours verified.");
}

async function calendarFallback(browser) {
  const context = await contextFor(browser, 390, 844, "light", "reduce", { calendarError: true });
  const page = await context.newPage();
  await visit(page, "/events");
  const fallback = page.getByText("Events are taking a moment to load. Check @msa.at.pitt on Instagram for this week.");
  await fallback.waitFor();
  const id = "calendar-check";
  const startDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  await page.evaluate(({ id, startDate }) => {
    localStorage.setItem("msa-calendar-events-v1", JSON.stringify({
      events: [{ id, startDate, title: "Calendar refresh check", shortBlurb: "", tags: ["Social"], categories: ["social"],
        timeLabel: "6:00 PM", location: "Campus", audience: "general" }], syncedAt: Date.now(),
    }));
  }, { id, startDate });
  await visit(page, "/");
  const featured = page.locator(".upcoming-invite");
  await featured.getByRole("link", { name: "Event details" }).click();
  await page.waitForURL("**/events?event=" + id);
  await page.getByRole("dialog").getByText("Calendar refresh check", { exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Refresh calendar" }).click();
  assert.equal(await fallback.count(), 0);
  await page.getByRole("button", { name: /Calendar refresh check/ }).first().waitFor();
  await context.close();
  console.log("Calendar error fallback, cached refresh and event details link verified.");
}

if (output) await mkdir(output, { recursive: true });
const desktop = await chromium.launch({ channel: "chrome" });
try {
  for (const theme of ["light", "dark"]) {
    await capture(desktop, 1440, 900, theme, true);
    await capture(desktop, 390, 844, theme, true);
  }
  await interactions(desktop);
  if (local) {
    await announcementAndPhone(desktop);
    await calendarFallback(desktop);
    await galleryAndChaplain(desktop);
  }
  await motion(desktop, 1440, 900);
  await motion(desktop, 390, 844);
} finally {
  await desktop.close();
}

const phone = await webkit.launch();
try {
  for (const theme of ["light", "dark"]) await capture(phone, 390, 844, theme, false);
} finally {
  await phone.close();
}
