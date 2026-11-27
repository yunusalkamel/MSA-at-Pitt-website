import { createClient } from "@sanity/client";
import { environment, fail } from "./management.js";

const id = "msaPrivate.analytics";
const cache = new Map();
export const clarityProject = process.env.VITE_CLARITY_PROJECT_ID || "zjhbwa68n4";
export const providers = ["ga4","clarity","vercel","speed"];

export async function analyticsSettings(change, provider = "ga4") {
  const dataset = environment();
  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID || "rwdbbktc",
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
    token: process.env.SANITY_EDITOR_TOKEN,
  });
  if (change !== undefined) {
    if (typeof change !== "boolean" || !providers.includes(provider))
      throw fail(400, "Invalid analytics setting.");
    if (change && provider === "ga4" && !(process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET))
      throw fail(503, "Configure the GA4 measurement ID and API secret first.");
    if (change && provider === "clarity" && !/^[a-z0-9]{8,20}$/.test(clarityProject))
      throw fail(503, "Configure the Clarity project ID first.");
    const key = provider === "ga4" ? "enabled" : provider;
    const doc = await client.getDocument(id);
    if (doc) await client.patch(id).ifRevisionId(doc._rev).set({[key]:change}).commit();
    else await client.create({_id:id,_type:"msaAnalyticsSettings",[key]:change});
    cache.delete(dataset);
  }
  let cached = cache.get(dataset);
  if (!cached || Date.now() > cached.until) {
    const doc = await client.getDocument(id);
    cached = {
      until: Date.now() + 15000,
      settings: {
        enabled: doc?.enabled === true,
        clarity: doc?.clarity !== false && /^[a-z0-9]{8,20}$/.test(clarityProject),
        vercel: doc?.vercel !== false,
        speed: doc?.speed !== false,
      },
    };
    cache.set(dataset,cached);
  }
  return cached.settings;
}
