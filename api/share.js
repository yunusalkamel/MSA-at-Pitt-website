import { createClient } from "@sanity/client";
import { environment } from "../server/management.js";
import { getSiteOrigin } from "../shared/site-origin.js";

const siteDescription = "Connecting Muslim students at Pitt through faith, friendship, and service. Everyone is welcome.";
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;",
}[char]));

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).end();
  const path = typeof req.query?.path === "string" ? "/" + req.query.path.replace(/^\/+|\/+$/g, "") : "/";
  if (!/^(?:\/[a-z0-9-]+)*\/?$/.test(path) || /^(?:\/admin|\/owner|\/auth)(?:\/|$)/.test(path))
    return res.status(404).end();

  const origin = getSiteOrigin(process.env.SITE_ORIGIN,process.env.VERCEL_PROJECT_PRODUCTION_URL);
  try {
    const client = createClient({
      projectId:process.env.SANITY_PROJECT_ID || "rwdbbktc", dataset:environment(),
      apiVersion:"2024-01-01", useCdn:false, timeout:3000,
    });
    const published = await client.getDocument("website-inline-content");
    const fields = JSON.parse(published?.fieldsJson || "{}");
    const pages = Object.values(fields).filter(field => field?.kind === "page");
    const custom = pages.find(page => page.path === path);
    const now = Date.now();
    if (custom && (custom.visibility !== "published" || (custom.starts && Date.parse(custom.starts) > now) ||
      (custom.ends && Date.parse(custom.ends) <= now))) return res.status(404).end();
    const page = custom ?? fields["shared/visual/page/" + path];
    const title = page?.seoTitle || (custom ? custom.title + " | MSA at Pitt" : "MSA at Pitt — A Home Away From Home");
    const description = page?.description || siteDescription;
    const image = new URL(page?.share || "/photos/brand/social-card.jpg",origin).href;
    const url = origin + path;
    res.setHeader("Content-Type","text/html; charset=utf-8");
    res.setHeader("Cache-Control","public, s-maxage=60, stale-while-revalidate=120");
    res.setHeader("Vary","User-Agent");
    const meta = (key,value,type="property") => `<meta ${type}="${key}" content="${escape(value)}">`;
    return res.send(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${escape(title)}</title>
${meta("description",description,"name")}
<link rel="canonical" href="${escape(url)}">
${[
  ["og:type","website"],["og:site_name","MSA at Pitt"],["og:url",url],["og:title",title],
  ["og:description",description],["og:image",image],
].map(([key,value])=>meta(key,value)).join("\n")}
${[
  ["twitter:card","summary_large_image"],["twitter:title",title],["twitter:description",description],["twitter:image",image],
].map(([key,value])=>meta(key,value,"name")).join("\n")}
</head><body><a href="${escape(url)}">${escape(title)}</a></body></html>`);
  } catch {
    return res.status(503).end();
  }
}
