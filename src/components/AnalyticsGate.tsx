import { lazy, Suspense, useEffect, useState } from "react";
import { productionPublic } from "@/lib/analyticsPolicy";

const PublicAnalytics = lazy(() => import("./PublicAnalytics"));
const defaults = {enabled:false,clarity:false,vercel:true,speed:true};

export default function AnalyticsGate() {
  const [settings,setSettings] = useState<typeof defaults>();
  useEffect(() => {
    if (!productionPublic) return;
    let live = true;
    const start = () => {
      if (!live) return;
      fetch("/api/reports").then(response => response.ok ? response.json() : defaults)
        .then(value => { if (live) setSettings(value); })
        .catch(() => { if (live) setSettings(defaults); });
    };
    // Wait until the public page has rendered before requesting provider settings.
    const timer = window.setTimeout(() => {
      if (window.requestIdleCallback) window.requestIdleCallback(start,{timeout:1800});
      else start();
    }, 1650);
    return () => { live = false; clearTimeout(timer); };
  },[]);
  return settings && <Suspense fallback={null}><PublicAnalytics settings={settings}/></Suspense>;
}
