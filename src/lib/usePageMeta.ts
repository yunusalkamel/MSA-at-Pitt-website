import { SEO_PAGES, canonicalPath, canonicalUrl, scheduled } from "../../shared/seo.js";
import { SITE_ORIGIN } from "@/config/site";
import { SITE_NAME } from "../../shared/brand.js";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Content } from "@/editor/content";
import { getVisualPage } from "@/editor/visual-model";

declare const __SITE_DATASET__: string;

interface PageMeta {
  title: string;
  description?: string;
  noindex?: boolean;
}

const defaults = typeof document === "undefined" ? {} : {
  description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
  share: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
};

export function usePageMeta({ title: fallbackTitle, description: fallbackDescription, noindex = false }: PageMeta) {
  const { fields } = useContext(Content);
  const { pathname } = useLocation();
  const page = getVisualPage(fields, pathname);
  const search = SEO_PAGES[canonicalPath(pathname)];
  const title = page?.seoTitle || search?.title || fallbackTitle;
  const description = page?.description || search?.description || fallbackDescription || defaults.description;
  const share = page?.share ? new URL(page.share, location.origin).href : defaults.share;
  const privatePage = /^\/(?:admin|owner|auth)(?:\/|$)/.test(window.location.pathname);
  const preview = typeof __SITE_DATASET__ !== "undefined" && __SITE_DATASET__ === "preview";
  const unpublished = page && ((page.visibility && page.visibility !== "published") || !scheduled(page));
  const exclude = noindex || privatePage || preview || unpublished;
  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, value: string, key: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${key}="${attr}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(key, attr);
        document.head.appendChild(el);
      }
      el.content = value;
    };

    const canonical = canonicalUrl(SITE_ORIGIN,pathname);
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;
    setMeta("og:url",canonical,"property");
    setMeta("robots",exclude ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    if (description) {
      setMeta("description", description);
      setMeta("og:description", SITE_NAME, "property");
      setMeta("twitter:description", SITE_NAME);
    }
    if (share) {
      setMeta("og:image", share, "property");
      setMeta("twitter:image", share);
    }
    setMeta("og:title", SITE_NAME, "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("twitter:title", SITE_NAME);
    return () => { document.title = SITE_NAME; };
  }, [title, description, share, pathname, exclude]);
}
