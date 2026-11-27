import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { safePage } from "../../shared/traffic.js";
import { Content } from "@/editor/content";
import { getVisualPage, isScheduled } from "@/editor/visual-model";
import { clarityPage, clarityConsentKey, consentGiven } from "@/lib/analyticsPolicy";

type Settings = { enabled:boolean; clarity:boolean; vercel:boolean; speed:boolean };
function sanitize<T extends { url:string }>(event:T):T|null {
  const url = new URL(event.url, location.origin);
  const page = safePage(url.pathname);
  if (!page || !safePage(location.pathname)) return null;
  return {...event,url:url.origin + page};
}

export default function PublicAnalytics({settings}: {settings:Settings}) {
  const {pathname} = useLocation();
  const fields = useContext(Content).fields;
  const metadata = getVisualPage(fields,pathname);
  const campaign = metadata?.template === "campaign" && metadata.visibility === "published" && isScheduled(metadata);
  const permitted = !!safePage(pathname);
  useEffect(() => {
    if (permitted && clarityPage(location) && settings.clarity && consentGiven(clarityConsentKey)) void import("@/lib/clarity").then(({startClarity}) => startClarity());
    if (settings.enabled && consentGiven() && import.meta.env.VITE_OPTIONAL_ANALYTICS === "true")
      void import("@/lib/traffic").then(({visit}) => visit(pathname, campaign));
  },[settings,pathname,permitted,campaign]);
  if (!permitted) return null;
  return <>
    {settings.speed && <SpeedInsights beforeSend={sanitize}/>}
    {settings.vercel && <Analytics beforeSend={sanitize}/>}
  </>;
}
