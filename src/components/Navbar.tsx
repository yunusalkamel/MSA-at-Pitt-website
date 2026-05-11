import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Menu, X, ArrowRight, ChevronDown, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import AnnouncementBar from "./AnnouncementBar";

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
  { to: "/prayer-times", label: "Prayer Times" },
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
    "/prayer-times": () => import("../pages/PrayerTimes"),
    "/join": () => import("../pages/Join"),
    "/contact": () => import("../pages/Contact"),
  };
  map[path]?.();
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isResourcesActive = location.pathname.startsWith("/resources") || location.pathname === "/prayer-times";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setResourcesOpen(false);
    setMobileResourcesOpen(false);
  }, [location.pathname]);

  // Mobile menu — escape key + body scroll lock + focus management
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none"
      role="navigation"
      aria-label="Main navigation"
    >
      <AnnouncementBar />

      {/* Floating pill */}
      <div className="flex justify-center px-4 pt-3 md:pt-4 w-full">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`pointer-events-auto w-full max-w-5xl transition-all duration-500 rounded-2xl px-4 md:px-6 ${
            scrolled ? "liquid-glass-strong shadow-lg" : "liquid-glass"
          }`}
        >
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link
              to="/"
              className="font-body font-extrabold text-lg md:text-xl tracking-[0.1em] hover:opacity-80 transition-opacity rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              <span className="text-jannah-mid dark:text-jannah-light">MSA</span>{" "}
              <span className="text-msa-blue dark:text-white/90">At Pitt</span>
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
                    aria-current={isActive ? "page" : undefined}
                    className={`relative text-[14px] font-semibold font-body transition-colors duration-200 pb-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60 ${
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

              <DropdownMenuPrimitive.Root open={resourcesOpen} onOpenChange={setResourcesOpen}>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button
                    onMouseEnter={() => { setResourcesOpen(true); resourcesChildren.forEach(c => prefetchRoute(c.to)); }}
                    aria-current={isResourcesActive ? "page" : undefined}
                    className={`relative text-[14px] font-semibold font-body transition-colors duration-200 pb-0.5 flex items-center gap-1 outline-none rounded focus-visible:ring-2 focus-visible:ring-msa-gold/60 ${
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
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    align="end"
                    sideOffset={12}
                    className="z-[60] w-56 liquid-glass-strong rounded-2xl p-2 shadow-xl [clip-path:inset(0_round_1rem)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2"
                  >
                    {resourcesChildren.map((child) => {
                      const isChildActive = location.pathname === child.to;
                      return (
                        <DropdownMenuPrimitive.Item
                          key={child.to}
                          onSelect={() => { prefetchRoute(child.to); navigate(child.to); }}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold font-body transition-colors duration-150 outline-none cursor-default select-none ${
                            isChildActive
                              ? "text-jannah-mid dark:text-msa-gold bg-jannah/[0.07] dark:bg-msa-gold/[0.08]"
                              : "text-ink dark:text-white/70 data-[highlighted]:bg-black/[0.04] dark:data-[highlighted]:bg-white/[0.04] data-[highlighted]:text-jannah-mid dark:data-[highlighted]:text-msa-gold"
                          }`}
                        >
                          {child.label}
                        </DropdownMenuPrimitive.Item>
                      );
                    })}
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>

              <button
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-xl text-ink-mid/55 dark:text-white/40 hover:text-jannah-mid dark:hover:text-msa-gold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60"
              >
                {theme === "dark" ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
              </button>

              <Link to="/join" className="btn-premium text-sm px-5 py-2 ml-1">
                Join <ArrowRight size={13} />
              </Link>
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-ink-mid/70 dark:text-white/60 hover:text-jannah-mid dark:hover:text-msa-gold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60"
                style={{ backdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                {theme === "dark" ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-foreground transition-all duration-200 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60"
                style={{ backdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile menu — full-screen overlay, dialog semantics, centered items */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto fixed inset-0 top-0 z-[55] flex flex-col items-center justify-center pb-8 md:hidden overflow-y-auto"
            style={{
              // Solid surface — no transparency that could clash with whatever
              // hero/page is rendering underneath.
              background: theme === "dark" ? "#060B18" : "#F8F3EA",
            }}
          >
            {/* Close button — top-right, with ref for focus trap */}
            <button
              ref={closeButtonRef}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-xl text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60"
            >
              <X size={22} />
            </button>

            <div className="flex flex-col items-center w-full max-w-sm px-6 -mt-4">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className="mb-7"
              >
                <Link to="/join" className="btn-premium text-base px-9 py-3.5">
                  Join the MSA <ArrowRight size={16} />
                </Link>
              </motion.div>

              <div className="w-12 h-px bg-border/40 mb-6" />

              <div className="flex flex-col items-center w-full">
                {navLinks.map((link, i) => {
                  const isActive = link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);
                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="w-full text-center mb-5"
                    >
                      <Link
                        to={link.to}
                        aria-current={isActive ? "page" : undefined}
                        className={`inline-block text-3xl font-display font-semibold transition-colors px-6 py-1.5 rounded-lg ${
                          isActive
                            ? "text-jannah-mid dark:text-msa-gold"
                            : "text-ink dark:text-white/85"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Resources accordion — centered */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + navLinks.length * 0.06 }}
                  className="w-full flex flex-col items-center mb-5"
                >
                  <button
                    onClick={() => setMobileResourcesOpen((o) => !o)}
                    aria-expanded={mobileResourcesOpen}
                    className={`text-3xl font-display font-semibold transition-colors flex items-center gap-2 px-6 py-1.5 rounded-lg ${
                      isResourcesActive ? "text-jannah-mid dark:text-msa-gold" : "text-ink dark:text-white/85"
                    }`}
                  >
                    Resources
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-200 ${
                        mobileResourcesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileResourcesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden flex flex-col items-center gap-3 mt-4"
                      >
                        {resourcesChildren.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            aria-current={location.pathname === child.to ? "page" : undefined}
                            className={`text-xl font-display transition-colors text-center ${
                              location.pathname === child.to
                                ? "text-jannah-mid dark:text-msa-gold"
                                : "text-ink-mid/75 dark:text-white/55"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Contact link */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (navLinks.length + 1) * 0.06 }}
                  className="w-full text-center"
                >
                  <Link
                    to="/contact"
                    className="text-xl font-body font-semibold text-ink-mid/70 dark:text-white/55 hover:text-jannah-mid dark:hover:text-msa-gold transition-colors"
                  >
                    Contact
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
