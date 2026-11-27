import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AnalyticsGate from "@/components/AnalyticsGate";
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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
          <AnalyticsGate/>
          </ThemeProvider>
          </SiteContent>
  </BrowserRouter>
);

export default App;
