import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Content, type Fields } from "./content";
const Admin = lazy(() => import("./Admin"));
export const adminPath = /^\/admin(?:\/|$)/.test(window.location.pathname);
export type Snapshot = { revision: string | null; fields: Fields };
export async function loadContent(): Promise<Snapshot> {
  const response = await fetch("/api/site-editor");
  if (!response.ok) throw new Error("Could not load published content.");
  return response.json();
}
export default function SiteContent({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState<Fields>({});
  const framed = adminPath && window.parent !== window &&
    document.referrer.startsWith(location.origin + "/");
  useEffect(() => {
    if (!framed) return;
    const receive = (event: MessageEvent) => {
      if (event.source === window.parent && event.origin === location.origin && event.data?.type === "msa-visual-preview")
        setFields(event.data.fields);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [framed]);
  useEffect(() => {
    if (!adminPath && !/^\/owner(?:\/|$)/.test(window.location.pathname))
      loadContent()
        .then((result) => setFields(result.fields))
        .catch(() => {});
  }, []);
  if (adminPath && !framed)
    return (
      <Suspense fallback={null}>
        <Admin>{children}</Admin>
      </Suspense>
    );
  return (
    <Content.Provider value={{ fields, editing: false }}>
      {children}
    </Content.Provider>
  );
}
