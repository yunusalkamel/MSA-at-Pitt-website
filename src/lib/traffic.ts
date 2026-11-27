import { isPublicSiteOrigin } from "@/config/site";
import { safePage } from "../../shared/traffic.js";
let page: string | null = null,
  previous: string | null = null,
  measured = 0,
  scrolled = false,
  started = false;
function send(event: string, eventKey?: string) {
  if (
    !page ||
    (document.visibilityState !== "visible" && event!=="page_exit" && event!=="reading_time") ||
    page !== safePage(location.pathname) ||
    localStorage.getItem("msa-analytics") !== "yes"
  )
    return;
  const now = Date.now(),
    seconds = Math.floor(now / 1000);
  let visitor = localStorage.getItem("msa-visitor");
  if (!visitor) {
    visitor = crypto.getRandomValues(new Uint32Array(1))[0] + "." + seconds;
    localStorage.setItem("msa-visitor", visitor);
  }
  let session = Number(sessionStorage.getItem("msa-visit"));
  if (!session || now - Number(sessionStorage.getItem("msa-last")) > 1800000)
    session = seconds;
  sessionStorage.setItem("msa-visit", String(session));
  sessionStorage.setItem("msa-last", String(now));
  const source = document.referrer
    ? new URL(document.referrer).hostname.replace(/^www\./, "")
    : "";
  const ua = navigator.userAgent;
  const browser = /Edg/.test(ua)
    ? "Edge"
    : /Firefox|FxiOS/.test(ua)
      ? "Firefox"
      : /Chrome|CriOS/.test(ua)
        ? "Chrome"
        : /Safari/.test(ua)
          ? "Safari"
          : undefined;
  const system = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS/.test(ua)
          ? "MacOS"
          : /Linux/.test(ua)
            ? "Linux"
            : undefined;
  const campaign = new URLSearchParams(location.search).get("utm_campaign");
  const allowed = (import.meta.env.VITE_ANALYTICS_CAMPAIGNS || "")
    .split(",")
    .filter(Boolean);
  const body = {
    eventKey,
    browser,
    system,
    screen: innerWidth < 768 ? "small" : innerWidth < 1024 ? "medium" : "large",
    campaign: allowed.includes(campaign) ? campaign : undefined,
    event,
    page,
    previous,
    visitor,
    session,
    engagement: Math.max(1, now - measured),
    device:
      innerWidth < 768 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop",
    source: [
      "google.com",
      "instagram.com",
      "facebook.com",
      "bing.com",
      "linktr.ee",
    ].includes(source)
      ? source
      : undefined,
  };
  measured = now;
  void fetch("/api/traffic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
    credentials: "omit",
    referrerPolicy: "no-referrer",
  }).catch(() => {});
}
function click(e: MouseEvent) {
  const anchor = e.target instanceof Element ? e.target.closest("a") : null;
  if (!anchor || !page) return;
  const u = new URL(anchor.href, location.href);
  if (
    !["http:", "https:"].includes(u.protocol) ||
    (u.origin === location.origin && !safePage(u.pathname))
  )
    return;
  const host = u.hostname;
  const kind =
    anchor.dataset.analyticsAction ||
    (/^(?:chat\.)?whatsapp\.com$|^wa\.me$/.test(host)
      ? "whatsapp_click"
      : /^(?:www\.)?(instagram|facebook)\.com$/.test(host)
        ? "social_link_click"
        : /calendar\.google\.com|^webcal/.test(host)
          ? "calendar_click"
          : u.pathname.includes("/maps")
            ? "directions_click"
            : u.origin === location.origin
              ? "navigation_click"
              : page.startsWith("/resources")
                ? "resource_click"
                : "outbound_click");
  const id = anchor.dataset.eventKey;
  if (id) sendWithKey(kind, id);
  else send(kind);
}
function sendWithKey(event: string, id: string) {
  if (!globalThis.crypto?.subtle) return send(event);
  void crypto.subtle.digest("SHA-256", new TextEncoder().encode(id)).then(hash => {
    const key = Array.from(new Uint8Array(hash).slice(0, 8), n => n.toString(16).padStart(2, "0")).join("");
    send(event, key);
  }).catch(() => {});
}
export function trackStory(event: "story_open" | "story_complete", slug: string) {
  if (!import.meta.env.PROD || import.meta.env.VITE_OPTIONAL_ANALYTICS !== "true" ||
      !isPublicSiteOrigin(location.origin) || localStorage.getItem("msa-analytics") !== "yes") return;
  visit(location.pathname);
  sendWithKey(event, slug);
}
function scroll() {
  if (
    !scrolled &&
    document.documentElement.scrollHeight > innerHeight &&
    scrollY + innerHeight >= document.documentElement.scrollHeight * 0.9
  ) {
    scrolled = true;
    send("scroll_90");
  }
}
export function visit(path: string) {
  if (!started) {
    started = true;
    document.addEventListener("click", click, { capture: true, passive: true });
    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="visible")measured=Date.now();
      else if(measured){send("reading_time");measured=0;}
    });
    window.addEventListener("pagehide",()=>{if(!measured)measured=Date.now();send("page_exit");});
    window.addEventListener("scroll", scroll, { passive: true });
  }
  const next = safePage(path);
  if (next === page) return;
  previous = page;
  page = next;
  measured = Date.now();
  scrolled = false;
  if (page) send("page_view");
}
