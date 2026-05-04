import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

const Index = lazy(() => import("./pages/Index.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const Gallery = lazy(() => import("./pages/Gallery.tsx"));
const GalleryAlbum = lazy(() => import("./pages/GalleryAlbum.tsx"));
const Join = lazy(() => import("./pages/Join.tsx"));
const Resources = lazy(() => import("./pages/Resources.tsx"));
const NewToPitt = lazy(() => import("./pages/NewToPitt.tsx"));
const PrayerLocations = lazy(() => import("./pages/PrayerLocations.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const PrayerTimes = lazy(() => import("./pages/PrayerTimes.tsx"));
const OrgChart = lazy(() => import("./pages/OrgChart.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/:slug" element={<GalleryAlbum />} />
              <Route path="/join" element={<Join />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/new-to-pitt" element={<NewToPitt />} />
              <Route path="/resources/prayer-locations" element={<PrayerLocations />} />
              <Route path="/resources/faq" element={<FAQ />} />
              <Route path="/prayer-times" element={<PrayerTimes />} />
              <Route path="/board" element={<OrgChart />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <SpeedInsights />
          <Analytics />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
