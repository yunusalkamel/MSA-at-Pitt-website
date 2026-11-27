import { isPublicSiteOrigin } from "@/config/site";
import {safePage} from "../shared/traffic.js";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import AppLoader from "@/components/AppLoader";

import SiteContent, { adminPath } from "./editor/SiteContent";

const Owner = lazy(() => import("./editor/Owner"));
const Index = lazy(() => import("./pages/Index.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const Gallery = lazy(() => import("./pages/Gallery.tsx"));
const GalleryAlbum = lazy(() => import("./pages/GalleryAlbum.tsx"));
const Join = lazy(() => import("./pages/Join.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Resources = lazy(() => import("./pages/Resources.tsx"));
const NewToPitt = lazy(() => import("./pages/NewToPitt.tsx"));
const PrayerLocations = lazy(() => import("./pages/PrayerLocations.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const Prayer = lazy(() => import("./pages/Prayer.tsx"));
const Chaplain = lazy(() => import("./pages/Chaplain.tsx"));
const OrgChart = lazy(() => import("./pages/OrgChart.tsx"));
const VisualPage = lazy(() => import("./pages/VisualPage.tsx"));

const publicProduction = import.meta.env.PROD &&
  !new URLSearchParams(location.search).has("code") && !/(?:access_token|error_description)=/.test(location.hash) &&
  !/^(?:\/admin|\/owner|\/auth)(?:\/|$)/i.test(window.location.pathname) &&
  isPublicSiteOrigin(window.location.origin);

function sanitize<T extends {url:string}>(event:T):T|null {
  const url=new URL(event.url,window.location.origin);
  const page=safePage(url.pathname);
  if(!page || !safePage(location.pathname) || location.hash.includes("access_token") || new URLSearchParams(location.search).has("code"))return null;
  return {...event,url:url.origin+page};
}
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    let live=true;
    if(publicProduction && import.meta.env.VITE_OPTIONAL_ANALYTICS==="true" && localStorage.getItem("msa-analytics")==="yes"){
      const start=()=>{if(live)void import("./lib/traffic").then(m=>{if(live)m.visit(pathname);});};
      if(window.requestIdleCallback)window.requestIdleCallback(start);else setTimeout(start,500);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return ()=>{live=false;};
  }, [pathname]);
  return null;
};

const App = () => (
  <BrowserRouter basename={adminPath ? "/admin" : "/"}>
          <SiteContent>
          <ThemeProvider>
          <ScrollToTop />
          <Suspense fallback={<AppLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              {!adminPath && <Route path="/owner" element={<Owner />} />}
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/:slug" element={<GalleryAlbum />} />
              <Route path="/join" element={<Join />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/new-to-pitt" element={<NewToPitt />} />
              <Route path="/resources/prayer-locations" element={<PrayerLocations />} />
              <Route path="/resources/prayer-times" element={<Navigate to="/resources/prayer" replace />} />
              <Route path="/resources/prayer" element={<Prayer />} />
              <Route path="/resources/chaplain" element={<Chaplain />} />
              <Route path="/resources/faq" element={<FAQ />} />
              <Route path="/prayer-times" element={<Navigate to="/resources/prayer" replace />} />
              <Route path="/board" element={<OrgChart />} />
              <Route path="*" element={<VisualPage />} />
            </Routes>
          </Suspense>
          </ThemeProvider>
          </SiteContent>
          {publicProduction && <><SpeedInsights beforeSend={sanitize}/><Analytics beforeSend={sanitize}/></>}
  </BrowserRouter>
);

export default App;
