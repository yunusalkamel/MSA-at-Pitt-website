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
    if(new URL(base).hostname === "127.0.0.1") {
      await page.route("https://rwdbbktc.apicdn.sanity.io/**",r=>r.fulfill({json:{result:null}}));
    }
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    const bar = page.getByRole("button", { name: "Design switches" });
    await bar.waitFor();
    await page.locator("[data-photo-hero] figure").first().waitFor();
    assert.equal(await page.locator("[data-photo-hero] figure").count(), 3);
    const picture = page.locator("[data-photo-hero] img").first();
    await picture.evaluate((img) => img.decode());
    assert.ok(await picture.evaluate((img) => img.naturalWidth > 0));
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
    const daytimePhoto = await picture.getAttribute("src");
    await page.getByRole("button", { name: "Dark mode", exact: true }).click();
    await page.waitForFunction(
      (src) =>
        document.querySelector("[data-photo-hero] img")?.getAttribute("src") !==
        src,
      daytimePhoto,
    );
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
    await page.goto(base + "/resources/prayer");
    await page.locator(".daily-prayers").waitFor();
    assert.equal(await page.locator(".daily-prayers dd").count(), 6);
    assert.equal(await page.locator("#chartjs-cdn").count(), 0);
    assert.equal(await page.locator(".location-photos > *").count(), 10);
    await page.getByRole("button", { name: /Explore seasonal/ }).click();
    await page.locator("#ctop").waitFor({ state: "attached" });
    await page.getByRole("button", { name: /Explore seasonal/ }).click();
    assert.equal(await page.locator("#ctop").count(), 0);
    await page.goto(base + "/about");
    await page.locator(".partner-directory a").first().waitFor();
    assert.equal(await page.locator(".partner-directory a").count(), 5);
    await page.goto(base + "/resources");
    const guide = page
      .locator(".resource-review")
      .first()
      .getByRole("link", { name: /Read the Tips/ });
    await guide.click();
    await page.locator("main h1").waitFor();
    assert.equal(new URL(page.url()).pathname, "/resources/new-to-pitt");
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
    console.log(
      name +
        " passed visual comparison, persistence, photo reel, prayer, mosque directory and guide navigation.",
    );
  } finally {
    await browser.close();
  }
}
