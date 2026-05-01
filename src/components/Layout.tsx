import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Skip to content — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:btn-premium focus:text-sm"
      >
        Skip to content
      </a>

      {/* Rich layered background */}
      <div className="pointer-events-none fixed inset-0 gradient-mesh-full" />
      <div className="pointer-events-none fixed inset-0 texture-lines opacity-20" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-secondary/[0.02]" />
      <Navbar />
      <main id="main-content" role="main" className="flex-1 relative z-10">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;
