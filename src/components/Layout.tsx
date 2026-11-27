import { type ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import VisualSections from "./VisualSections";

// Note: AnnouncementBar is rendered inside Navbar so it always
// appears above the floating pill and never behind it.

import { EditorialCopy } from "@/editor/content";
const Layout = ({ children, names }: { children: ReactNode; names?: string[] }) => {
  return (
    <EditorialCopy.Provider value><div data-continuous className="site-layout min-h-screen flex flex-col relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:btn-premium focus:text-sm"
      >
        Skip to content
      </a>

      <Navbar />
      <main id="main-content" role="main" className="flex-1 relative z-10"><VisualSections names={names}>{children}</VisualSections></main>
      <Footer />
      <BackToTop />
    </div></EditorialCopy.Provider>
  );
};

export default Layout;
