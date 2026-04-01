import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 gradient-mesh-full" />
      <div className="pointer-events-none absolute inset-0 texture-lines opacity-30" />
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20 relative z-10">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
