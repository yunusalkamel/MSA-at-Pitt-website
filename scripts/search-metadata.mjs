import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { SEO_PAGES, canonicalUrl, escapeXml, searchGraph } from "../shared/seo.js";
import { SITE_NAME } from "../shared/brand.js";

export function pageHtml(html,path,origin,preview=false) {
  const page=SEO_PAGES[path];
  let result=html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>\s*/gi,"")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,"");
  if (page) result=result.replace(/<title>[\s\S]*?<\/title>/i,`<title>${escapeXml(page.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/i,`<meta name="description" content="${escapeXml(page.description)}" />`);
  const tags=[`<meta name="robots" content="${preview ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`];
  if(page) tags.push(`<link rel="canonical" href="${escapeXml(canonicalUrl(origin,path))}" />`, `<script type="application/ld+json">${JSON.stringify(searchGraph(origin,path)).replace(/</g,"\\u003c")}</script>`);
  const links=Object.entries(SEO_PAGES).map(([url,metadata])=>`<a href="${url}">${escapeXml(metadata.label)}</a>`).join(" · ");
  // A useful fallback for visitors without JavaScript, not a bot-specific response.
  const fallback=`<noscript><main><h1>${escapeXml(page?.label === "Home" ? SITE_NAME : page?.label || SITE_NAME)}</h1><p>${escapeXml(page?.description || SEO_PAGES["/"].description)}</p><nav aria-label="Site pages">${links}</nav><p><a href="mailto:msa.at.pitt@gmail.com">Contact Pitt MSA</a></p></main></noscript>`;
  return result.replace("</head>",tags.join("\n")+"\n</head>").replace("</body>",fallback+"\n</body>");
}
export function robotsText(origin,preview=false) {
  return preview ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /owner\nDisallow: /auth\nSitemap: ${canonicalUrl(origin,"/sitemap.xml")}\n`;
}
export function llmDirectory(origin) {
  return `# ${SITE_NAME}\n\n> Pitt MSA is a Muslim student organization at the University of Pittsburgh in Pittsburgh, Pennsylvania.\n\nOfficial website: ${canonicalUrl(origin,"/")}\n\n## Primary sources\n${Object.entries(SEO_PAGES).map(([path,page])=>`- [${page.label}](${canonicalUrl(origin,path)}): ${page.description}`).join("\n")}\n\n## Current information\nEvent details, registration links, prayer times and room availability can change. Use the current Events and Prayer pages and their linked official sources. This directory is not a timetable.\n`;
}
export function searchMetadataPlugin(origin) {
  const preview=process.env.VERCEL_ENV==="preview";
  return { name:"public-search-metadata",apply:"build",async writeBundle(options) {
    const root=resolve(options.dir || "dist");
    const html=await readFile(resolve(root,"index.html"),"utf8");
    await writeFile(resolve(root,"spa.html"),pageHtml(html,null,origin,preview));
    for(const path of Object.keys(SEO_PAGES)) {
      const file=resolve(root,path==="/" ? "index.html" : path.slice(1)+".html");
      await mkdir(dirname(file),{recursive:true});await writeFile(file,pageHtml(html,path,origin,preview));
    }
    await writeFile(resolve(root,"robots.txt"),robotsText(origin,preview));
    await writeFile(resolve(root,"llms.txt"),llmDirectory(origin));
  }};
}
