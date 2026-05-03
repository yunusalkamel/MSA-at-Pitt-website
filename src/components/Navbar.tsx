import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronDown, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

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

const prefetchRoute = (path: string) => {
  const map: Record<string, () => Promise<unknown>> = {
    "/": () => import("../pages/Index"),
    "/about": () => import("../pages/About"),
    "/events": () => import("../pages/Events"),
    "/gallery": () => import("../pages/Gallery"),
    "/resources": () => import("../pages/Resources"),
    "/resources/new-to-pitt": () => import("../pages/NewToPitt"),
    "/resources/prayer-locations": () => import("../pages/PrayerLocations"),
    "/resources/faq": () => import("../pages/FAQ"),
    "/join": () => import("../pages/Join"),
  };
  map[path]?.();
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { theme, toggle: toggleTheme } = useTheme();

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
          {/* Logo — MSA in Jannah Mid/Light, AT PITT in MSA Blue/White, Jakarta 800 */}
          <Link
            to="/"
            className="font-body font-extrabold text-lg md:text-xl tracking-[0.1em] hover:opacity-80 transition-opacity"
          >
            <span className="text-jannah-mid dark:text-jannah-light">MSA</span>{' '}
            <span className="text-msa-blue dark:text-white/90">AT PITT</span>
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
                  onMouseEnter={() => prefetchRoute(link.to)}
                  onFocus={() => prefetchRoute(link.to)}
                  className={`relative text-[14px] font-semibold font-body transition-colors duration-200 pb-0.5 ${
                    isActive
                      ? "text-jannah-mid dark:text-msa-gold"
                      : "text-ink-mid/70 dark:text-white/45 hover:text-ink dark:hover:text-white/80"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-jannah-mid dark:bg-msa-gold rounded-full"
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
                className={`relative text-[14px] font-semibold font-body transition-colors duration-200 pb-0.5 flex items-center gap-1 ${
                  isResourcesActive
                    ? "text-jannah-mid dark:text-msa-gold"
                    : "text-ink-mid/70 dark:text-white/45 hover:text-ink dark:hover:text-white/80"
                }`}
              >
                Resources
                <ChevronDown size={13} className={`transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`} />
                {isResourcesActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-jannah-mid dark:bg-msa-gold rounded-full"
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
                          onMouseEnter={() => prefetchRoute(child.to)}
                          onFocus={() => prefetchRoute(child.to)}
                          className={`block px-3 py-2 rounded-lg text-sm font-semibold font-body transition-colors duration-150 ${
                            isChildActive
                              ? "text-jannah-mid dark:text-msa-gold bg-jannah/[0.07] dark:bg-msa-gold/[0.08]"
                              : "text-ink dark:text-white/70 hover:bg-jannah/[0.04] dark:hover:bg-white/[0.04] hover:text-jannah-mid dark:hover:text-msa-gold"
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

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-xl text-ink-mid/55 dark:text-white/40 hover:text-jannah-mid dark:hover:text-msa-gold transition-colors duration-200"
            >
              {theme === "dark"
                ? <Sun size={16} strokeWidth={2} />
                : <Moon size={16} strokeWidth={2} />
              }
            </button>

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
            className="pointer-events-auto fixed inset-0 top-[72px] bg-background/98 dark:bg-abyss/95 backdrop-blur-xl z-[55] flex flex-col items-center justify-center gap-7 md:hidden"
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
                      isActive
                        ? "text-jannah-mid dark:text-msa-gold"
                        : "text-ink dark:text-white/80"
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
                  isResourcesActive
                    ? "text-jannah-mid dark:text-msa-gold"
                    : "text-ink dark:text-white/80"
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
                          location.pathname === child.to
                            ? "text-jannah-mid dark:text-msa-gold"
                            : "text-ink-mid/70 dark:text-white/50"
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
              transition={{ delay: 0.38 }}
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
