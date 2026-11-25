import { createClient } from "@sanity/client";
import { environment, fail } from "./management.js";
const id = "msaPrivate.analytics";
let cached;
export async function analyticsSettings(change) {
  const dataset = environment();
  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID || "rwdbbktc",
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
    token: process.env.SANITY_EDITOR_TOKEN,
  });
  if (change !== undefined) {
    if (typeof change !== "boolean")
      throw fail(400, "Invalid analytics setting.");
    if (
      change &&
      !(process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET)
    )
      throw fail(503, "Configure the GA4 measurement ID and API secret first.");
    await client.createOrReplace({
      _id: id,
      _type: "msaAnalyticsSettings",
      enabled: change,
    });
    cached = null;
  }
  if (!cached || cached.dataset !== dataset || Date.now() > cached.until) {
    const doc = await client.getDocument(id);
    cached = {
      dataset,
      until: Date.now() + 15000,
      enabled: doc?.enabled === true,
    };
  }
  return { enabled: cached.enabled };
}
