import { SITE_NAME } from "../../shared/brand.js";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Content } from "@/editor/content";
import { getVisualPage } from "@/editor/visual-model";

interface PageMeta {
  title: string;
  description?: string;
}

const defaults = typeof document === "undefined" ? {} : {
  description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
  share: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
};

export function usePageMeta({ title: fallbackTitle, description: fallbackDescription }: PageMeta) {
  const { fields } = useContext(Content);
  const { pathname } = useLocation();
  const page = getVisualPage(fields, pathname);
  const title = page?.seoTitle || fallbackTitle;
  const description = page?.description || fallbackDescription || defaults.description;
  const share = page?.share ? new URL(page.share, location.origin).href : defaults.share;
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
  }, [title, description, share]);
}
