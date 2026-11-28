import { describe, expect, it } from "vitest";
import { SEO_PAGES, canonicalUrl, sitemapPaths, sitemapXml, searchGraph } from "../../shared/seo.js";
import { pageHtml, robotsText, llmDirectory } from "../../scripts/search-metadata.mjs";
import { SITE_NAME } from "../../shared/brand.js";
import config from "../../vercel.json";
const origin="https://msaatpitt.org";
const html=`<!doctype html><html><head><title>${SITE_NAME}</title><meta name="description" content="${SITE_NAME}"><meta property="og:title" content="${SITE_NAME}"><script type="application/ld+json">{"old":true}</script></head><body><div id="root"></div><script src="/assets/app.js"></script></body></html>`;
describe("public search discovery",()=> {
 it("publishes only canonical public URLs, excluding drafts, scheduled and private pages",()=> {
  const fields={draft:{kind:"page",path:"/draft",visibility:"draft"},live:{kind:"page",path:"/welcome",visibility:"published"},future:{kind:"page",path:"/campaign",visibility:"published",starts:"2030-01-01"},owner:{kind:"page",path:"/owner",visibility:"published"}};
  const paths=sitemapPaths(fields,[],Date.parse("2026-11-28"));
  expect(paths).toContain("/welcome");expect(paths).not.toContain("/draft");expect(paths).not.toContain("/campaign");expect(paths).not.toContain("/owner");
  const xml=sitemapXml(origin,paths);expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');expect(xml).toContain("https://msaatpitt.org/resources/prayer</loc>");expect(xml).not.toContain("vercel.app");expect(xml).not.toContain("<lastmod>");
 });
 it("respects the managed album collection instead of reintroducing hidden legacy albums",()=> {
  const paths=sitemapPaths({albums:{kind:"collection",type:"albums",items:[{id:"hidden",hidden:true},{id:"visible"}]}},[{slug:"hidden"}]);
  expect(paths).toContain("/gallery/visible");expect(paths).not.toContain("/gallery/hidden");
 });
 it("removes query/fragment duplicates and keeps canonical origins safe",()=> {
  expect(canonicalUrl(origin,"/events/?event=one&utm_source=instagram#details")).toBe(origin+"/events");
  expect(canonicalUrl(origin,"/resources/prayer-locations")).toBe(origin+"/resources/prayer");
  expect(new URL(canonicalUrl(origin,"//elsewhere.example")).origin).toBe(origin);
 });
 it("delivers unique route metadata before JavaScript without changing shared-link branding or assets",()=> {
  const result=pageHtml(html,"/resources/prayer",origin);
  expect(result).toContain(`<title>${SEO_PAGES["/resources/prayer"].title.replace(/&/g,"&amp;")}</title>`);
  expect(result).toContain('<link rel="canonical" href="https://msaatpitt.org/resources/prayer"');
  expect(result).toContain(`<meta property="og:title" content="${SITE_NAME}">`);
  expect(result).toContain('<script src="/assets/app.js"></script>');expect(result).toContain('<noscript>');
  expect(result).not.toContain('{"old":true}');
 });
 it("keeps previews and unknown app-shell routes from inheriting a wrong homepage canonical",()=> {
  expect(pageHtml(html,"/",origin,true)).toContain('content="noindex, nofollow"');
  expect(pageHtml(html,null,origin)).not.toContain('rel="canonical"');
  expect(robotsText(origin,true)).toBe("User-agent: *\nDisallow: /\n");
  expect(robotsText(origin)).toContain("Sitemap: https://msaatpitt.org/sitemap.xml");
 });
 it("provides factual organization data and a small source directory without invented prayer schedules",()=> {
  const graph=searchGraph(origin,"/resources/prayer")["@graph"];
  expect(graph[0]).toMatchObject({name:SITE_NAME,alternateName:expect.arrayContaining(["Pitt MSA"])});
  expect(graph[0].sameAs).toContain("https://experience.pitt.edu/msa/home/");
  expect(llmDirectory(origin)).toContain("not a timetable");expect(llmDirectory(origin)).toContain(origin+"/resources/prayer");
 });
 it("redirects only the old production host, preserving paths and leaving previews alone",()=> {
  const rule=config.redirects.find(rule=>rule.has?.[0]?.type==="host");const host=new RegExp("^"+rule.has[0].value+"$");
  expect(host.test("msaatpitt.vercel.app")).toBe(true);expect(host.test("msaatpitt.org")).toBe(false);expect(host.test("msa-at-pitt-website-git-codex.vercel.app")).toBe(false);expect(rule.destination).toBe(origin+"/:path*");expect(rule.permanent).toBe(true);
 });
});
