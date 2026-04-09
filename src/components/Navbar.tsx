import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "/", label: "Home", exact: true },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
];

const resourcesChildren = [
  { to: "/resources", label: "All Resources" },
  { to: "/resources/new-to-pitt", label: "New to Pitt" },
  { to: "/resources/prayer-locations", label: "Prayer Locations" },
  { to: "/resources/faq", label: "FAQ" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isResourcesActive = location.pathname.startsWith("/resources");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setResourcesOpen(false);
    setMobileResourcesOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 md:pt-4 pointer-events-none" role="navigation" aria-label="Main navigation">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`pointer-events-auto w-full max-w-5xl transition-all duration-500 rounded-2xl px-4 md:px-6 ${
          scrolled
            ? "liquid-glass-strong shadow-lg"
            : "liquid-glass"
        }`}
      >
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-lg md:text-xl font-bold text-foreground tracking-tight hover:opacity-80 transition-opacity"
          >
            MSA <span className="text-gradient-gold">at Pitt</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-sm font-medium transition-colors duration-200 hover:text-foreground pb-0.5 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] gold-gradient rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {/* Resources dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setResourcesOpen((o) => !o)}
                onMouseEnter={() => setResourcesOpen(true)}
                className={`relative text-sm font-medium transition-colors duration-200 hover:text-foreground pb-0.5 flex items-center gap-1 ${
                  isResourcesActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Resources
                <ChevronDown size={13} className={`transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`} />
                {isResourcesActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] gold-gradient rounded-full"
                  />
                )}
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    onMouseLeave={() => setResourcesOpen(false)}
                    className="absolute top-full right-0 mt-3 w-52 liquid-glass-strong rounded-xl p-2 shadow-xl"
                  >
                    {resourcesChildren.map((child) => {
                      const isChildActive = location.pathname === child.to;
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                            isChildActive
                              ? "text-primary bg-primary/[0.08]"
                              : "text-foreground hover:bg-primary/[0.05] hover:text-primary"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/join"
              className="btn-premium text-sm px-5 py-2 ml-1"
            >
              Join <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground p-2 -mr-1"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto fixed inset-0 top-[72px] bg-background/98 backdrop-blur-xl z-[55] flex flex-col items-center justify-center gap-7 md:hidden"
          >
            {navLinks.map((link, i) => {
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);
              return (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={link.to}
                    className={`text-2xl font-display font-semibold transition-colors ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}

            {/* Mobile Resources expandable */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.07 }}
              className="flex flex-col items-center"
            >
              <button
                onClick={() => setMobileResourcesOpen((o) => !o)}
                className={`text-2xl font-display font-semibold transition-colors flex items-center gap-2 ${
                  isResourcesActive ? "text-primary" : "text-foreground"
                }`}
              >
                Resources
                <ChevronDown size={18} className={`transition-transform duration-200 ${mobileResourcesOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileResourcesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden flex flex-col items-center gap-3 mt-3"
                  >
                    {resourcesChildren.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={`text-lg font-display transition-colors ${
                          location.pathname === child.to ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
            >
              <Link to="/join" className="btn-premium text-lg px-8 py-3">
                Join the MSA <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
