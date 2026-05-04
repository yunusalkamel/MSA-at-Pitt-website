import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
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
  const location = useLocation();
  const navigate = useNavigate();
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
          <Link
            to="/"
            className="font-body font-extrabold text-lg md:text-xl tracking-[0.1em] hover:opacity-80 transition-opacity"
          >
            <span className="text-jannah-mid dark:text-jannah-light">MSA</span>{' '}
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

            {/* Resources dropdown — keyboard-accessible via Radix */}
            <DropdownMenuPrimitive.Root open={resourcesOpen} onOpenChange={setResourcesOpen}>
              <DropdownMenuPrimitive.Trigger asChild>
                <button
                  onMouseEnter={() => { setResourcesOpen(true); resourcesChildren.forEach(c => prefetchRoute(c.to)); }}
                  className={`relative text-[14px] font-semibold font-body transition-colors duration-200 pb-0.5 flex items-center gap-1 outline-none group/res ${
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
                  className="z-[60] w-52 liquid-glass-strong rounded-xl p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2"
                >
                  {resourcesChildren.map((child) => {
                    const isChildActive = location.pathname === child.to;
                    return (
                      <DropdownMenuPrimitive.Item
                        key={child.to}
                        onSelect={() => { prefetchRoute(child.to); navigate(child.to); }}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold font-body transition-colors duration-150 outline-none cursor-default select-none ${
                          isChildActive
                            ? "text-jannah-mid dark:text-msa-gold bg-jannah/[0.07] dark:bg-msa-gold/[0.08]"
                            : "text-ink dark:text-white/70 data-[highlighted]:bg-jannah/[0.04] dark:data-[highlighted]:bg-white/[0.04] data-[highlighted]:text-jannah-mid dark:data-[highlighted]:text-msa-gold"
                        }`}
                      >
                        {child.label}
                      </DropdownMenuPrimitive.Item>
                    );
                  })}
                </DropdownMenuPrimitive.Content>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>

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

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] text-ink-mid/70 dark:text-white/60 hover:text-jannah-mid dark:hover:text-msa-gold hover:bg-primary/10 dark:hover:bg-msa-gold/10 transition-all duration-200"
            >
              {theme === "dark" ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors -mr-1"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto fixed inset-0 top-[68px] bg-background/98 dark:bg-abyss/96 backdrop-blur-xl z-[55] flex flex-col items-center pt-10 pb-8 md:hidden overflow-y-auto"
          >
            {/* Join CTA — top of menu */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="mb-8"
            >
              <Link to="/join" className="btn-premium text-lg px-9 py-3.5">
                Join the MSA <ArrowRight size={16} />
              </Link>
            </motion.div>

            <div className="w-10 h-px bg-border/40 mb-8" />

            {navLinks.map((link, i) => {
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);
              return (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="mb-6"
                >
                  <Link
                    to={link.to}
                    className={`text-3xl font-display font-semibold transition-colors ${
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + navLinks.length * 0.06 }}
              className="flex flex-col items-center mb-6"
            >
              <button
                onClick={() => setMobileResourcesOpen((o) => !o)}
                className={`text-3xl font-display font-semibold transition-colors flex items-center gap-2 ${
                  isResourcesActive
                    ? "text-jannah-mid dark:text-msa-gold"
                    : "text-ink dark:text-white/80"
                }`}
              >
                Resources
                <ChevronDown size={20} className={`transition-transform duration-200 ${mobileResourcesOpen ? "rotate-180" : ""}`} />
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
                        className={`text-xl font-display transition-colors ${
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
