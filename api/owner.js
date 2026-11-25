import { createClient } from "@sanity/client";
import { management } from "../server/management.js";

async function sanityHealth(dataset) {
  const config = {
    projectId: process.env.SANITY_PROJECT_ID || "rwdbbktc",
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
  };
  const token = process.env.SANITY_EDITOR_TOKEN;
  const check = async (task) => {
    try {
      await task();
      return "Connected";
    } catch (error) {
      return [401, 403].includes(error.statusCode)
        ? "Permission denied. Check token access."
        : "Connection failed. Check dataset and service availability.";
    }
  };
  const [read, write] = await Promise.all([
    check(() =>
      createClient(config).fetch('count(*[_id=="website-inline-content"])'),
    ),
    token
      ? check(() =>
          createClient({ ...config, token }).mutate(
            [
              {
                createIfNotExists: {
                  _id: "website-inline-content",
                  _type: "websiteInlineContent",
                },
              },
            ],
            { dryRun: true },
          ),
        )
      : "Missing SANITY_EDITOR_TOKEN",
  ]);
  return {
    "Supabase authentication": "Connected",
    "Management database": "Connected",
    "Sanity reads": read,
    "Sanity write validation": write,
    "Publishing token": token ? "Configured" : "Missing",
    "Vercel Analytics": "Instrumented on public production pages",
  };
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") return res.status(405).end();
  const { action, ...payload } = req.body || {};
  if (
    ![
      "owner_session",
      "overview",
      "add",
      "note",
      "administrator",
      "control",
      "health",
    ].includes(action)
  )
    return res.status(400).end();
  if (payload.before != null && !/^\d{1,18}$/.test(String(payload.before)))
    return res.status(400).end();
  try {
    const authorize = await management(req);
    const result = await authorize(action, payload);
    if (result.role !== "owner") return res.status(403).end();
    if (action === "health")
      return res.json(await sanityHealth(result.environment));
    return res.json(result);
  } catch (error) {
    return res
      .status(error.publicStatus || 503)
      .json({
        error: error.publicStatus
          ? error.message
          : "Owner services are unavailable. Try again.",
      });
  }
}
