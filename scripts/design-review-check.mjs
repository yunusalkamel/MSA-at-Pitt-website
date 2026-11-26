import assert from "node:assert/strict";
import { chromium, webkit } from "@playwright/test";

const base = process.env.REVIEW_URL || "http://127.0.0.1:4297";
for (const [name, engine, width] of [
  ["Chrome", chromium, 1366],
  ["iPhone WebKit", webkit, 390],
]) {
  const browser = await engine.launch(
    name === "Chrome" ? { channel: "chrome" } : {},
  );
  try {
    const page = await browser.newPage({
      viewport: { width, height: width === 390 ? 844 : 920 },
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    // The local preview origin is outside the CMS allowlist. Use the empty
    // preview dataset response so browser checks also exercise bundled fallbacks.
    if (new URL(base).hostname === "127.0.0.1") {
      await page.route("https://rwdbbktc.apicdn.sanity.io/**", (r) =>
        r.fulfill({ json: { result: null } }),
      );
    }
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.setDefaultTimeout(12000);
    await page.goto(base);
    const bar = page.getByRole("button", { name: "Design switches" });
    await bar.waitFor();
    await page.locator("[data-photo-hero] figure").first().waitFor();
    assert.equal(await page.locator("[data-photo-hero] figure").count(), width < 768 ? 4 : 16);
    const wall = page.locator("[data-photo-hero] figure img");
    assert.equal(new Set(await wall.evaluateAll(images => images.map(img => img.src))).size, await wall.count());
    assert.equal(await page.locator("[data-framing]").getAttribute("data-wash"), "Soft gold gradient");
    const tiles = page.locator("[data-hero-tile]");
    const before = await tiles.evaluateAll(rows => rows.map(el => el.dataset.photo));
    await page.getByRole("button", {name:"Change collage photos"}).click();
    const after = await tiles.evaluateAll(rows => rows.map(el => el.dataset.photo));
    assert.equal(before.filter((id, i) => id !== after[i]).length, 1);
    assert.equal(new Set(after).size, after.length);
    if (width < 768) assert.equal(await page.locator(".mobile-welcome-intro").count(),1);
    const picture = page.locator("[data-photo-hero] img").first();
    await picture.evaluate((img) => img.decode());
    assert.ok(await picture.evaluate((img) => img.naturalWidth > 0));
    if (width < 768) {
      assert.ok(await wall.evaluateAll(images => images.every(img => img.currentSrc.endsWith("-tile.webp"))));
    }
    if (process.env.REVIEW_SCREENSHOTS)
      await page.screenshot({
        path:
          process.env.REVIEW_SCREENSHOTS + "/" + name.split(" ")[0] + ".png",
      });
    await page.getByRole("button", { name: "Show current site" }).click();
    assert.equal(await page.locator("[data-photo-hero]").count(), 0);
    await page.getByRole("button", { name: "Show my choices" }).click();
    await bar.click();
    await page
      .locator("summary")
      .filter({ hasText: /^Home$/ })
      .click();
    assert.ok(
      await page
        .locator("[data-framing]")
        .evaluate((el) => el.getBoundingClientRect().height >= innerHeight * (innerWidth < 768 ? .72 : .99)),
    );
    for (const option of ["Compact overlay", "Full overlay", "Photo first"]) {
      await page.getByLabel("Mobile hero").selectOption(option);
      assert.equal(await page.locator("[data-framing]").getAttribute("data-mobile-hero"), option);
      if (width < 768) {
        assert.equal(await page.locator(".mobile-welcome-intro").count(), option === "Full overlay" ? 0 : 1);
        if (process.env.REVIEW_SCREENSHOTS) {
          await page.getByRole("button", { name: "Close design controls" }).click();
          await page.screenshot({path: process.env.REVIEW_SCREENSHOTS + "/" + option.toLowerCase().replace(" ", "-") + ".png"});
          await bar.click();
          await page.locator("summary").filter({ hasText: /^Home$/ }).click();
        }
      }
    }
    for (const wash of ["Stronger gradient", "Gold panel", "Soft gold gradient"]) {
      await page.getByLabel("Hero gradient").selectOption(wash);
      assert.equal(await page.locator("[data-framing]").getAttribute("data-wash"), wash);
    }
    for (const [density, count] of [
      ["4 × 4", 16],
      ["5 × 5", 25],
      ["2 × 2", 4],
    ]) {
      await page.getByLabel("Collage density").selectOption(density);
      assert.equal(
        await page.locator("[data-photo-hero] figure").count(),
        count,
      );
    }
    const upload = page.locator(".hero-trials input");
    await upload.setInputFiles([
      "public/photos/community/flowers-320.webp",
      "public/photos/community/friendsgiving-serve-320.webp",
    ]);
    await page.waitForFunction(() =>
      document
        .querySelector("[data-photo-hero] img")
        ?.getAttribute("src")
        ?.startsWith("blob:"),
    );
    await page.getByRole("button", { name: /Clear 2 trial photos/ }).click();
    const daytimePhoto = await picture.getAttribute("src");
    await page.getByRole("button", { name: "Dark mode", exact: true }).click();
    await page.waitForFunction(
      (src) =>
        document.querySelector("[data-photo-hero] img")?.getAttribute("src") !==
        src,
      daytimePhoto,
    );
    await page.getByLabel("Collage density").selectOption("Responsive");
    if (width >= 768) {
      assert.equal(await tiles.filter({has:page.locator('img[src*="fajr-bridge"]')}).getAttribute("data-hero-tile"), "7");
    }
    await page.getByRole("button", { name: "Light mode", exact: true }).click();
    await page.getByLabel("Hero layout").selectOption("Single photo");
    assert.equal(await page.locator("[data-photo-hero] figure").count(), 1);
    await page.getByLabel("Hero layout").selectOption("Video");
    await page.locator(".movie-picker input").waitFor({ state: "attached" });
    assert.equal(await page.locator("video[src]").count(), 0);
    await page.getByLabel("Hero layout").selectOption("Photo reel");
    await page.getByRole("button", { name: "Close design controls" }).click();
    const caption = page.locator(".community-media figcaption");
    const first = await caption.textContent();
    await page.getByRole("button", { name: "Next photo", exact: true }).click();
    assert.notEqual(await caption.textContent(), first);
    await page.reload();
    await page.locator('[data-layout="Photo reel"]').waitFor();
    await bar.click();
    await page
      .locator("summary")
      .filter({ hasText: /Navigation and footer/ })
      .click();
    await page.getByLabel("Try the announcement strip with a sample").check();
    await page.getByText(/Sample announcement · Explore upcoming/).waitFor();
    await page.getByLabel("Try the announcement strip with a sample").uncheck();
    await page.getByRole("button", { name: "Close design controls" }).click();
    await page.goto(base + "/resources/prayer");
    await page.locator(".daily-prayers").waitFor();
    assert.equal(await page.locator(".daily-prayers dd").count(), 6);
    assert.equal(await page.locator("#chartjs-cdn").count(), 0);
    for (const [venue, count] of [
      ["WPU Reflection Room", 4], ["Jummah prayer", 2],
      ["Rec Center Reflection Room", 4], ["Benedum Room 403", 1],
    ]) {
      const trigger = page.getByRole("button", { name: `View ${venue} photos (${count})` });
      await trigger.click();
      const viewer = page.getByRole("dialog", { name: venue + " photos" });
      const sources = new Set();
      for (let i = 0; i < count; i++) {
        const img = viewer.locator("img");
        await img.evaluate(el => el.decode());
        sources.add(await img.getAttribute("src"));
        if (i + 1 < count) await viewer.getByRole("button", { name: "Next location photo" }).click();
      }
      assert.equal(sources.size, count);
      await page.keyboard.press("Escape");
      assert.equal(await viewer.count(), 0);
    }
    const publicHealth = page.locator(".liquid-glass-hover").filter({has: page.getByRole("heading", {name: /Room A721/})});
    await publicHealth.getByRole("img", {name: "Photo coming soon"}).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await page.getByRole("heading",{name:"Prayer at Pitt",exact:true}).count(),1);
    assert.equal(await page.getByRole("link",{name:"Back to Resources"}).count(),1);
    const openAlmanac = page.getByRole("button", { name: /Open solar almanac/i });
    assert.ok(await openAlmanac.evaluate(el => {
      const footer = el.parentElement.getBoundingClientRect();
      return footer.right - el.getBoundingClientRect().right < 2;
    }));
    if (process.env.REVIEW_SCREENSHOTS) {
      const folder = process.env.REVIEW_SCREENSHOTS;
      await page.locator(".prayer-start").screenshot({path: folder + "/prayer-" + width + ".png"});
      await page.locator(".prayer-photo-row").nth(1).screenshot({path: folder + "/venue-" + width + ".png"});
    }
    const oaklandTimes = await page.locator(".daily-prayers dd").allTextContents();
    await openAlmanac.click();
    await page.getByLabel("Almanac location", {exact:true}).selectOption("west");
    assert.deepEqual(await page.locator(".daily-prayers dd").allTextContents(), oaklandTimes);
    assert.match(await page.getByRole("link",{name:/William Pitt Union map/}).getAttribute("href"), /3959/);
    assert.match(await page.getByRole("link",{name:/Student Center map/}).getAttribute("href"), /4024/);
    const photo = page.getByRole("button",{name:/View WPU Reflection Room photos/});
    assert.ok(await photo.evaluate(el => el.getBoundingClientRect().width >= (innerWidth < 768 ? 95 : 200)));
    await page.locator("#ctop").waitFor({ state: "attached" });
    assert.equal(
      await page.locator("#card-title").textContent(),
      "Attawheed Islamic Center",
    );
    await page
      .getByRole("button", { name: /Close solar almanac/i })
      .click();
    assert.equal(await page.locator("#ctop").count(), 0);
    await page.goto(base + "/resources/chaplain");
    const portrait = page.getByAltText("Imam Muhammad Patel", {exact: true});
    await portrait.scrollIntoViewIfNeeded();
    await portrait.evaluate(el => el.decode());
    assert.ok(await portrait.evaluate(el => Math.abs(el.clientWidth / el.clientHeight - el.naturalWidth / el.naturalHeight) < .01));
    await page.getByText("Monday 5–6 PM after his halaqah · Friday 3–4 PM", {exact: true}).waitFor();
    await page.goto(base + "/about");
    await page.locator(".cec-partners:visible a").first().waitFor();
    assert.equal(await page.locator(".cec-partners:visible a").count(), 5);
    await page.goto(base + "/resources");
    const fresh = page.locator(".resource-tile").first();
    await fresh.waitFor();
    if (width >= 768) {
      await fresh.hover();
      await fresh.getByRole("link", {name:/Google Doc/}).waitFor();
      await page.mouse.move(width - 4, 90);
      await fresh.getByRole("link",{name:/Google Doc/}).waitFor({state:"hidden"});
    }
    if (width < 768) {
      assert.ok(await fresh.evaluate(el => el.getBoundingClientRect().bottom < innerHeight));
      assert.ok(await fresh.evaluate(el => el.getBoundingClientRect().height < 150));
      if (process.env.REVIEW_SCREENSHOTS) await page.screenshot({path: process.env.REVIEW_SCREENSHOTS + "/phone-resources.png"});
    }
    assert.equal(await fresh.locator(".tile-detail").count(), 0);
    await fresh.getByRole("button", { name: /Show details/ }).click();
    await fresh.getByRole("link", { name: /Google Doc/ }).waitFor();
    await fresh.getByRole("button", { name: /Hide details/ }).click();
    const guide = page
      .locator(".resource-review")
      .first()
      .getByRole("link", { name: /Read the Tips/ });
    await guide.click();
    await page.locator("main h1").waitFor();
    assert.equal(new URL(page.url()).pathname, "/resources/new-to-pitt");
    if (width < 768) {
      await page.getByText("Jump to a topic", {exact:true}).click();
      await page.getByRole("navigation", {name:"Student guide topics"}).getByRole("link",{name:"Halal Food"}).click();
      assert.equal(new URL(page.url()).hash, "#halal-food");
    }
    await page.goto(base + "/gallery");
    await page.locator('[data-collection="Contact sheet"]').waitFor();
    await bar.click();
    await page
      .locator("summary")
      .filter({ hasText: /^Gallery$/ })
      .click();
    await page.getByLabel("Gallery presentation").selectOption("Spotlight");
    await page.getByRole("button", { name: "Close design controls" }).click();
    const moment = page.locator(".moment-grid figcaption").first();
    const original = await moment.textContent();
    await page.getByRole("button", { name: "Next moment" }).click();
    assert.notEqual(await moment.textContent(), original);
    if (width < 768) {
      const filters = page.getByRole("button", { name: /Filter albums/ });
      await filters.click();
      await page.locator("#album-filters").getByRole("button", { name: "Spring '26" }).click();
      assert.equal(await filters.getAttribute("aria-expanded"), "false");
      await page.locator('a[href="/gallery/pitt-friendsgiving"]').filter({has: page.getByRole("heading", { name: "Friendsgiving", exact:true })}).waitFor({state:"detached"});
      await page.getByRole("heading", {name:"MSA Gala", exact:true}).waitFor();
    }
    await page.getByRole("link", {name: "Open Friendsgiving album"}).click();
    await page.getByRole("heading", {name:"Friendsgiving", exact:true}).waitFor();
    assert.equal(await page.getByRole("button", {name:/Open photo/}).count(), 4);
    await page.getByRole("button",{name:/Open photo 1/}).click();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await page.goto(base + "/events");
    await page.getByRole("button", { name: "Design switches" }).waitFor();
    await page
      .getByRole("button", {
        name: width === 390 ? "agenda" : "calendar",
        exact: true,
        pressed: true,
      })
      .waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    if (name === "Chrome") {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(base);
      await bar.click();
      await page.locator("summary").filter({ hasText: /^Home$/ }).click();
      await page.getByLabel("Hero layout").selectOption("Collage");
      await page.getByRole("button", { name: "Close design controls" }).click();
      await page.getByRole("button", { name: "Pause photos" }).click();
      const playingTiles = page.locator("[data-hero-tile]");
      const beforeReveal = await playingTiles.evaluateAll(rows => rows.map(el => el.dataset.photo));
      await page.getByRole("button", { name: "Change collage photos" }).click();
      await page.locator(".wall-previous + img[data-revealed]").waitFor();
      assert.equal(await page.locator("img.wall-previous").count(), 1);
      const afterReveal = await playingTiles.evaluateAll(rows => rows.map(el => el.dataset.photo));
      assert.equal(beforeReveal.filter((id, i) => id !== afterReveal[i]).length, 1);
      await page.locator("img.wall-previous").waitFor({ state: "detached" });
    }
    console.log(
      name +
        " passed visual comparison, persistence, photo reel, prayer, mosque directory and guide navigation.",
    );
  } finally {
    await browser.close();
  }
}
