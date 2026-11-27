import { isPublicSiteOrigin } from "@/config/site";
import { safePage } from "../../shared/traffic.js";

export const consentKey = "msa-analytics";
export const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID || "zjhbwa68n4";
export const productionPublic = import.meta.env.PROD && isPublicSiteOrigin(location.origin) &&
  !/^\/(?:admin|owner|auth)(?:\/|$)/i.test(location.pathname) &&
  !new URLSearchParams(location.search).has("code") &&
  !/(?:access_token|error_description)=/.test(location.hash);
export function consentGiven() {
  try { return localStorage.getItem(consentKey) === "yes"; }
  catch { return false; }
}
export function clarityPage(url: URL | Location) {
  return !!safePage(url.pathname) && ![...new URLSearchParams(url.search).keys()].some(key =>
    /^(?:code|token|access_token|id_token|email|password|error_description)$/i.test(key)) &&
    !/(?:access_token|error_description)=/.test(url.hash);
}
