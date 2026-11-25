export const publicPages = [
  "/",
  "/about",
  "/board",
  "/events",
  "/gallery",
  "/join",
  "/resources",
  "/resources/faq",
  "/resources/new-to-pitt",
  "/resources/prayer",
  "/resources/prayer-times",
  "/resources/prayer-locations",
];
export const interactions = [
  "page_view",
  "navigation_click",
  "rsvp_click",
  "whatsapp_click",
  "donation_link_click",
  "social_link_click",
  "directions_click",
  "resource_click",
  "calendar_click",
  "outbound_click",
  "scroll_90",
];
export function safePage(path) {
  if (/^\/gallery\/[^/]+\/?$/.test(path)) return "/gallery/album";
  const clean = path.replace(/\/$/, "") || "/";
  return publicPages.includes(clean) ? clean : null;
}
