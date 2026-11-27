import { clarityId, clarityPage, clarityConsentKey, consentGiven } from "./analyticsPolicy";

type Clarity = ((...args: unknown[]) => void) & { q?: unknown[][] };
declare global { interface Window { clarity?: Clarity } }

export function startClarity() {
  if (window.clarity || !clarityPage(location) || !consentGiven(clarityConsentKey) || !/^[a-z0-9]{8,20}$/.test(clarityId)) return;
  const clarity: Clarity = (...args) => { (clarity.q ??= []).push(args); };
  window.clarity = clarity;
  // Record interactions and document structure, with page text and personal fields masked.
  document.body.setAttribute("data-clarity-mask", "true");
  clarity("consentv2", {analytics_Storage:"granted", ad_Storage:"denied"});

  const script = document.createElement("script");
  script.src = "https://www.clarity.ms/tag/" + encodeURIComponent(clarityId);
  script.async = true;
  script.referrerPolicy = "no-referrer";
  document.head.append(script);

  // Use a fresh document before visiting private or counseling pages so
  // the existing recorder never observes their markup during SPA navigation.
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") as HTMLAnchorElement : null;
    if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.download) return;
    const target = new URL(anchor.href,location.href);
    if (target.origin === location.origin && !clarityPage(target)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.assign(target.href);
    }
  }, true);
}
