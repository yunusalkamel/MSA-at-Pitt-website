import { createClient } from "@sanity/client";
import { getSiteOrigin } from "../shared/site-origin.js";
import { sitemapPaths, sitemapXml } from "../shared/seo.js";

export default async function handler(req,res) {
  if (!["GET","HEAD"].includes(req.method)) return res.status(405).end();
  if (process.env.VERCEL_ENV !== "production") {
    res.setHeader("X-Robots-Tag","noindex, nofollow");
    res.setHeader("Cache-Control","no-store");
    return res.status(404).end();
  }
  const origin=getSiteOrigin(process.env.SITE_ORIGIN,process.env.VERCEL_PROJECT_PRODUCTION_URL);
  let fields={},albums=[];
  try {
    if (process.env.SANITY_EDITOR_DATASET !== "production") throw Error("Production dataset required");
    const client=createClient({projectId:process.env.SANITY_PROJECT_ID || "rwdbbktc",dataset:"production",apiVersion:"2024-01-01",useCdn:true,timeout:2500,maxRetries:0});
    const results=await Promise.allSettled([
      client.getDocument("website-inline-content"),
      client.fetch('*[_type == "galleryAlbum"]{"slug":slug.current}'),
    ]);
    if(results[0].status==="fulfilled") { const parsed=JSON.parse(results[0].value?.fieldsJson || "{}"); if(parsed && typeof parsed==="object" && !Array.isArray(parsed)) fields=parsed; }
    if(results[1].status==="fulfilled" && Array.isArray(results[1].value)) albums=results[1].value;
  } catch { console.warn("[sitemap] Using public built-in routes until published metadata is available."); }
  const xml=sitemapXml(origin,sitemapPaths(fields,albums));
  res.setHeader("Content-Type","application/xml; charset=utf-8");
  res.setHeader("Cache-Control","public, s-maxage=300, stale-while-revalidate=3600");
  return req.method==="HEAD" ? res.status(200).end() : res.status(200).send(xml);
}
