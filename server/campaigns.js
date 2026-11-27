import { createClient } from "@sanity/client";
import { environment } from "./management.js";

const cache = new Map();
export async function isCampaign(path) {
  if (typeof path !== "string" || !/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) || path.length > 97) return false;
  const dataset = environment();
  const now = Date.now();
  let match = cache.get(dataset);
  if (!match || match.until < now) {
    const sanity = createClient({
      projectId:process.env.SANITY_PROJECT_ID || "rwdbbktc",dataset,
      apiVersion:"2024-01-01",useCdn:false,timeout:3500,
    });
    const snapshot = await sanity.getDocument("website-inline-content");
    const pages = Object.values(JSON.parse(snapshot?.fieldsJson || "{}")).filter(item =>
      item?.kind === "page" && item.path && item.template === "campaign" && item.visibility === "published"
    );
    match = {pages,until:now + 30000};
    cache.set(dataset,match);
  }
  return match.pages.some(page => page.path === path &&
    (!page.starts || Date.parse(page.starts) <= now) && (!page.ends || Date.parse(page.ends) > now));
}
