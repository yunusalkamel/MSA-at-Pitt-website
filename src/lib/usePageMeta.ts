import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
}

export function usePageMeta({ title, description }: PageMeta) {
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
      setMeta("og:description", description, "property");
      setMeta("twitter:description", description);
    }
    setMeta("og:title", title, "property");
    setMeta("twitter:title", title);
  }, [title, description]);
}
