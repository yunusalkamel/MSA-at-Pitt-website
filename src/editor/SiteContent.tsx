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
  useEffect(() => {
    if (!adminPath)
      loadContent()
        .then((result) => setFields(result.fields))
        .catch(() => {});
  }, []);
  if (adminPath)
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
