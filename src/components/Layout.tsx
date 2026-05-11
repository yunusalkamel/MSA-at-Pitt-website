import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

// Note: AnnouncementBar is rendered inside Navbar so it always
// appears above the floating pill and never behind it.

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:btn-premium focus:text-sm"
      >
        Skip to content
      </a>

      <div className="pointer-events-none fixed inset-0 gradient-mesh-warm" />
      <div className="pointer-events-none fixed inset-0 texture-lines opacity-20" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-secondary/[0.02]" />

      <Navbar />
      <main id="main-content" role="main" className="flex-1 relative z-10">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
