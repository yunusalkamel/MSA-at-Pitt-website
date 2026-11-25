import { createClient } from "@supabase/supabase-js";

const problems = {
  configuration: [
    503,
    "Management database configuration is incomplete for this deployment.",
  ],
  identity: [403, "Sign in with a verified email address."],
  administrator_conflict: [
    409,
    "The administrator list changed. Refresh the dashboard and try again.",
  ],
  disabled: [403, "Your administrator access has been disabled."],
  unauthorized: [403, "This account is not an authorized administrator."],
  owner_only: [403, "Only the website owner can open this section."],
  admins_paused: [403, "Administrator access is paused by the owner."],
  publishing_paused: [403, "Administrator publishing is paused by the owner."],
  uploads_paused: [403, "Administrator uploads are paused by the owner."],
  maintenance: [
    423,
    "Content is locked for maintenance. The owner can unlock it in Website controls.",
  ],
};
export function fail(status, message) {
  return Object.assign(new Error(message), { publicStatus: status });
}
export function environment() {
  const stage = process.env.VERCEL_ENV;
  const expected = stage === "production" ? "production" : "preview";
  if (process.env.SANITY_EDITOR_DATASET !== expected)
    throw fail(503, "Incorrect content dataset for this deployment.");
  return expected;
}
export async function management(req) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw fail(401, "Sign in to continue.");
  const stage = environment();
  const key = process.env.MSA_MANAGEMENT_KEY;
  if (
    !key ||
    !process.env.VITE_SUPABASE_URL ||
    !process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  )
    throw fail(...problems.configuration);
  const db = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      global: { headers: { Authorization: "Bearer " + token } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const { data, error } = await db.auth.getUser(token);
  if (error && (!error.status || error.status >= 500))
    throw fail(503, "Supabase authentication is unavailable.");
  if (error || !data?.user)
    throw fail(401, "Your session expired. Sign in again.");
  if (!data.user.email_confirmed_at) throw fail(...problems.identity);
  return async (operation, payload = {}) => {
    const { data: result, error } = await db.rpc("msa_management", {
      env_key: key,
      operation,
      payload: { ...payload, expected_environment: stage },
    });
    if (error || !result) throw fail(...problems.configuration);
    if (result.error)
      throw fail(
        ...(problems[result.error] || [
          400,
          "Check the management settings you submitted.",
        ]),
      );
    if (result.environment !== stage) throw fail(...problems.configuration);
    return result;
  };
}
