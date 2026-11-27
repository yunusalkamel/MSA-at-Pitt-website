import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { safePage } from "../../shared/traffic.js";
import { clarityPage, consentGiven } from "@/lib/analyticsPolicy";

type Settings = { enabled:boolean; clarity:boolean; vercel:boolean; speed:boolean };
function sanitize<T extends { url:string }>(event:T):T|null {
  const url = new URL(event.url, location.origin);
  const page = safePage(url.pathname);
  if (!page || !clarityPage(location)) return null;
  return {...event,url:url.origin + page};
}

export default function PublicAnalytics({settings}: {settings:Settings}) {
  const {pathname} = useLocation();
  const permitted = !!safePage(pathname) && clarityPage(location);
  useEffect(() => {
    if (!permitted || !consentGiven()) return;
    if (settings.clarity) void import("@/lib/clarity").then(({startClarity}) => startClarity());
    if (settings.enabled && import.meta.env.VITE_OPTIONAL_ANALYTICS === "true")
      void import("@/lib/traffic").then(({visit}) => visit(pathname));
  },[settings,pathname,permitted]);
  if (!permitted) return null;
  return <>
    {settings.speed && <SpeedInsights beforeSend={sanitize}/>}
    {settings.vercel && <Analytics beforeSend={sanitize}/>}
  </>;
}
