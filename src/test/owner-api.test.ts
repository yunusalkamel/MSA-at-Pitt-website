import { afterEach, beforeEach, expect, it, vi } from "vitest";
import owner from "../../api/owner.js";
import editor from "../../api/site-editor.js";

const services = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  sanity: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getUser: services.getUser },
    rpc: services.rpc,
  }),
}));
vi.mock("@sanity/client", () => ({ createClient: services.sanity }));
async function call(handler, action, token = "valid") {
  const response = {
    code: 200,
    setHeader: vi.fn(),
    end: vi.fn(),
    json: vi.fn(),
    status(value) {
      this.code = value;
      return this;
    },
  };
  await handler(
    {
      method: "POST",
      headers: { authorization: token ? "Bearer " + token : "" },
      body: { action },
    },
    response,
  );
  return response.code;
}
beforeEach(() => {
  vi.clearAllMocks();
  for (const [name, value] of Object.entries({
    MSA_MANAGEMENT_KEY: "test",
    SANITY_EDITOR_DATASET: "preview",
    VERCEL_ENV: "preview",
    VITE_SUPABASE_URL: "test",
    VITE_SUPABASE_PUBLISHABLE_KEY: "test",
  }))
    vi.stubEnv(name, value);
  services.getUser.mockResolvedValue({
    data: { user: { email_confirmed_at: "today" } },
  });
});
afterEach(() => vi.unstubAllEnvs());
it("authenticates every owner action before returning private data", async () => {
  expect(await call(owner, "overview", "")).toBe(401);
  services.rpc.mockResolvedValue({ data: { error: "owner_only" } });
  for (const action of [
    "owner_session",
    "overview",
    "add",
    "note",
    "administrator",
    "add_owner",
    "transfer_ownership",
    "control",
    "health",
  ])
    expect(await call(owner, action)).toBe(403);
  expect(services.sanity).not.toHaveBeenCalled();
  services.getUser.mockResolvedValue({ error: { status: 401 } });
  expect(await call(owner, "overview")).toBe(401);
});
it("rechecks an existing editor session on publish and upload", async () => {
  services.rpc
    .mockResolvedValueOnce({
      data: { role: "administrator", environment: "preview" },
    })
    .mockResolvedValue({ data: { error: "disabled" } });
  expect(await call(editor, "session")).toBe(200);
  expect(await call(editor, "publish")).toBe(403);
  expect(await call(editor, "image")).toBe(403);
  expect(services.rpc).toHaveBeenCalledTimes(3);
  expect(services.sanity).not.toHaveBeenCalled();
});
it("fails closed when a preview is misconfigured", async () => {
  vi.stubEnv("SANITY_EDITOR_DATASET", "production");
  expect(await call(owner, "control")).toBe(503);
  expect(services.rpc).not.toHaveBeenCalled();
});

it("denies an administrator direct access to exports and analytics reports", async () => {
  const { default: reports } = await import("../../api/reports.js");
  services.rpc.mockResolvedValue({ data: { error: "owner_only" } });
  for (const action of ["export", "snapshot"])
    expect(await call(editor, action)).toBe(403);
  expect(await call(reports, "settings")).toBe(403);
  expect(await call(reports, "Overview")).toBe(403);
  expect(services.sanity).not.toHaveBeenCalled();
});
