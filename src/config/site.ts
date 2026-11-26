import { getSiteOrigin, isSiteOrigin } from "../../shared/site-origin.js";

declare const __SITE_ORIGIN__: string;
export const SITE_ORIGIN = getSiteOrigin(typeof __SITE_ORIGIN__ === "string" ? __SITE_ORIGIN__ : undefined);
export const isPublicSiteOrigin = (origin: string) => isSiteOrigin(origin, SITE_ORIGIN);
