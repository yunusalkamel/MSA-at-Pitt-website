import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Rich layered background */}
      <div className="pointer-events-none fixed inset-0 gradient-mesh-full" />
      <div className="pointer-events-none fixed inset-0 texture-lines opacity-20" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-secondary/[0.02]" />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
