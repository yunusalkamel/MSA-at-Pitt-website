import { afterEach, expect, it, vi } from "vitest";
import { safePage } from "../../shared/traffic.js";
import handler from "../../api/traffic.js";
import reports from "../../api/reports.js";
afterEach(() => vi.unstubAllEnvs());
const res = () => ({
  code: 200,
  status(code) {
    this.code = code;
    return this;
  },
  setHeader() {},
  end() {},
  json() {},
});
it("excludes private, unknown and sensitive routes and collapses album paths", () => {
  for (const path of [
    "/admin",
    "/owner",
    "/auth/callback",
    "/resources/chaplain",
    "/contact",
    "/unknown",
  ])
    expect(safePage(path)).toBeNull();
  expect(safePage("/gallery/a-photo")).toBe("/gallery/album");
});
it("blocks collection in preview and rejects sensitive client payloads", async () => {
  const req = {
    method: "POST",
    headers: { origin: "https://msaatpitt.vercel.app" },
    body: { page: "/resources/chaplain", event: "page_view" },
  };
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "msaatpitt.vercel.app");
  vi.stubEnv("VERCEL_ENV", "preview");
  let response = res();
  await handler(req, response);
  expect(response.code).toBe(403);
  vi.stubEnv("VERCEL_ENV", "production");
  response = res();
  await handler(req, response);
  expect(response.code).toBe(400);
});
it("requires a verified session before reading reporting settings or private reports", async () => {
  for (const body of [
    { action: "settings", enabled: true },
    { view: "Overview" },
    { view: "Performance" },
  ]) {
    const response = res();
    await reports({ method: "POST", headers: {}, body }, response);
    expect(response.code).toBe(401);
  }
});
