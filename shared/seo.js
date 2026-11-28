import { SITE_NAME } from "./brand.js";

export const SEO_PAGES = {
  "/": { label:"Home", title:`Pitt MSA | ${SITE_NAME}`, description:"Pitt MSA connects Muslim students at the University of Pittsburgh in Pittsburgh, Pennsylvania. Find Islamic programs, events, prayer spaces and ways to join." },
  "/about": { label:"About", title:"About Pitt MSA | Muslim Students at the University of Pittsburgh", description:"Learn about the Muslim Student Association at the University of Pittsburgh: our community, Islamic education, service and campus partners in Pittsburgh, PA." },
  "/events": { label:"Events", title:"Pitt MSA Events | Muslim Student Events in Pittsburgh", description:"Find upcoming Pitt MSA halaqas, Jummah, sports, socials and community events for Muslim students at the University of Pittsburgh. View details and calendar links." },
  "/resources": { label:"Resources", title:"Muslim Student Resources at Pitt | Pitt MSA", description:"Resources for Muslim students at the University of Pittsburgh: campus prayer rooms, Jummah, halal food, Islamic education, the chaplain and student guidance." },
  "/resources/prayer": { label:"Prayer at Pitt", title:"Prayer at Pitt | Prayer Times, Campus Rooms & Jummah | Pitt MSA", description:"Find daily prayer times, Friday Jummah, campus prayer rooms and nearby mosques for Muslim students at the University of Pittsburgh in Oakland, Pittsburgh." },
  "/resources/new-to-pitt": { label:"New to Pitt", title:"Muslim Student Guide to Pitt | Prayer, Halal Food & Campus Life", description:"New to the University of Pittsburgh? Explore the Pitt MSA guide to Muslim student life, including prayer rooms, halal food, Ramadan and finding community." },
  "/resources/chaplain": { label:"University Chaplain", title:"Muslim Chaplain at Pitt | Imam Muhammad Patel | Pitt MSA", description:"Meet University Chaplain Imam Muhammad Patel. Find spiritual guidance, naseeha, office hours and support for Muslim students at the University of Pittsburgh." },
  "/resources/faq": { label:"Frequently Asked Questions", title:"Pitt MSA FAQ | Joining, Prayer & Muslim Student Life", description:"Questions about Pitt MSA? Learn how to join the Muslim Student Association, attend events, find campus prayer spaces and connect with students at Pitt." },
  "/join": { label:"Join", title:"Join Pitt MSA | University of Pittsburgh Muslim Student Association", description:"Join the Muslim Student Association at the University of Pittsburgh. Find membership, announcements and ways to meet Muslim students through faith and community." },
  "/contact": { label:"Contact", title:"Contact Pitt MSA | Muslim Student Association, Pittsburgh PA", description:"Contact the Muslim Student Association at the University of Pittsburgh for questions about membership, events, partnerships and Muslim student life at Pitt." },
  "/gallery": { label:"Gallery", title:"Pitt MSA Gallery | Muslim Student Community in Pittsburgh", description:"Explore Pitt MSA photo albums and event recaps from Muslim student gatherings, service, socials and community programs at the University of Pittsburgh." },
  "/board": { label:"Board", title:"Pitt MSA Board | Student Leadership at the University of Pittsburgh", description:"Meet the student board and Community Engagement Council of the Muslim Student Association at the University of Pittsburgh." },
};
const aliases = {"/resources/prayer-locations":"/resources/prayer","/resources/prayer-times":"/resources/prayer","/prayer-times":"/resources/prayer"};
export function canonicalPath(path = "/") {
  const clean = (path.split(/[?#]/)[0].replace(/\/+$/,"") || "/");
  return aliases[clean] || clean;
}
export function canonicalUrl(origin, path = "/") {
  const url = new URL(origin);
  url.pathname = canonicalPath(path);
  url.search = ""; url.hash = "";
  return url.href;
}
export function publicPath(path) {
  return typeof path === "string" && path.startsWith("/") && /^(?:\/[a-z0-9-]+)*\/?$/.test(path) && !/^\/(?:admin|owner|auth|api)(?:\/|$)/.test(path);
}
export function scheduled(item, now = Date.now()) {
  return !item.hidden && (!item.starts || Date.parse(item.starts) <= now) && (!item.ends || Date.parse(item.ends) > now);
}
export function sitemapPaths(fields = {}, albums = [], now = Date.now()) {
  const paths = new Set(Object.keys(SEO_PAGES));
  let managedAlbums = false;
  for (const [key,item] of Object.entries(fields)) {
    if (item?.kind === "page") {
      const path = item.path || key.replace(/^shared\/visual\/page\//,"");
      if (!publicPath(path)) continue;
      if ((item.visibility && item.visibility !== "published") || !scheduled(item,now)) paths.delete(path);
      else if (!item.path || item.visibility === "published") paths.add(canonicalPath(path));
    }
    if (item?.kind === "collection" && item.type === "albums") {
      managedAlbums = true;
      for (const album of item.items || []) if (album && scheduled(album,now) && /^[a-z0-9-]+$/.test(album.id)) paths.add("/gallery/"+album.id);
    }
  }
  for (const album of managedAlbums ? [] : albums) if (/^[a-z0-9-]+$/.test(album?.slug || "")) paths.add("/gallery/"+album.slug);
  return [...paths].sort();
}
export const escapeXml = value => String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
export function sitemapXml(origin,paths) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+paths.map(path=>`  <url><loc>${escapeXml(canonicalUrl(origin,path))}</loc></url>`).join("\n")+'\n</urlset>\n';
}
export function searchGraph(origin,path) {
  const home = canonicalUrl(origin,"/");
  const page = SEO_PAGES[canonicalPath(path)];
  const url = canonicalUrl(origin,path);
  const graph = [
    {"@type":"Organization","@id":home+"#organization",name:SITE_NAME,url:home,alternateName:["Pitt MSA","MSA at Pitt","Pitt Muslim Student Association"],description:SEO_PAGES["/"].description,logo:home+"photos/brand/icon-512.png",sameAs:["https://instagram.com/msa.at.pitt","https://facebook.com/msaatpitt","https://linktr.ee/msa.at.pitt","https://experience.pitt.edu/msa/home/"],areaServed:{"@type":"City",name:"Pittsburgh",containedInPlace:{"@type":"State",name:"Pennsylvania"}},parentOrganization:{"@type":"CollegeOrUniversity",name:"University of Pittsburgh",url:"https://www.pitt.edu"}},
    {"@type":"WebSite","@id":home+"#website",url:home,name:SITE_NAME,alternateName:"Pitt MSA",publisher:{"@id":home+"#organization"}},
    {"@type":"WebPage","@id":url+"#webpage",url,name:page?.title || SITE_NAME,description:page?.description || SEO_PAGES["/"].description,isPartOf:{"@id":home+"#website"},about:{"@id":home+"#organization"}},
  ];
  if (path!=="/" && page) graph.push({"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:home},{"@type":"ListItem",position:2,name:page.label,item:url}]});
  return {"@context":"https://schema.org","@graph":graph};
}
