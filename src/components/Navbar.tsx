import { TextField, itemIdentity, ContentScope, Content } from "@/editor/content";
import { useState, useEffect, useLayoutEffect, useRef, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronDown, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useDesign } from "@/design/useDesign";
import { mainMenu, resourceMenu } from "@/data/siteMenus";
import { visualKey } from "@/editor/visual-model";
import AnnouncementBar from "./AnnouncementBar";

import { useIsMobile } from "@/hooks/use-mobile";
import { PrayerLink } from "@/design/DailyPrayers";
const prefetchRoute = (path: string) => {
  const map: Record<string, () => Promise<unknown>> = {
    "/": () => import("../pages/Index"),
    "/about": () => import("../pages/About"),
    "/events": () => import("../pages/Events"),
    "/gallery": () => import("../pages/Gallery"),
    "/resources": () => import("../pages/Resources"),
    "/resources/new-to-pitt": () => import("../pages/NewToPitt"),
    "/resources/prayer": () => import("../pages/Prayer"),
    "/resources/chaplain": () => import("../pages/Chaplain"),
    "/resources/faq": () => import("../pages/FAQ"),
    "/join": () => import("../pages/Join"),
    "/contact": () => import("../pages/Contact"),
  };
  map[path]?.();
};

const Navbar = () => {
  const design = useDesign();
  const phone = useIsMobile();
  const menus = useContext(Content).fields[visualKey.menus];
  const main = menus?.kind === "menus" ? menus.main : undefined;
  const resources = menus?.kind === "menus" ? menus.resources : undefined;
  const navLinks = (main ?? mainMenu).map(item => ({ ...item, to:item.url, label:item.title, exact:item.url === "/" }));
  const resourcesChildren = (resources ?? resourceMenu).map(item => ({ ...item, to:item.url, label:item.title }));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle: toggleTheme } = useTheme();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const resourcesLink = useRef<HTMLAnchorElement>(null);
  const firstResource = useRef<HTMLAnchorElement>(null);
  const timer = useRef<number>();
  const focusOnOpen = useRef(false);
  const focusMenu = () => {
    window.clearTimeout(timer.current);
    if (resourcesOpen) {
      firstResource.current?.focus();
      return;
    }
    focusOnOpen.current = true;
    setResourcesOpen(true);
  };
  useLayoutEffect(() => {
    if (!resourcesOpen || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    firstResource.current?.focus();
  }, [resourcesOpen]);
  function scheduleResources(open: boolean) {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (open || !resourcesRef.current?.contains(document.activeElement)) setResourcesOpen(open);
    }, open ? 80 : 180);
  }

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const update = () => document.documentElement.style.setProperty("--nav-offset", `${nav.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const isResourcesActive = (location.pathname.startsWith("/resources") && location.pathname !== "/resources/prayer") || location.pathname.startsWith("/gallery");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.clearTimeout(timer.current);
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
      ref={navRef}
      data-design-nav={design.navigation}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none"
      role="navigation"
      aria-label="Main navigation"
    >
      {design.announcement !== "hidden" && <AnnouncementBar roomy={design.announcement === "roomy"} />}

      {/* Floating pill */}
      <div className="nav-shell">
        <motion.div
          initial={phone ? false : { y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="nav-pill pointer-events-auto w-full rounded-2xl"
          data-scrolled={scrolled || undefined}
        >
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link
              to="/" aria-label="MSA at Pitt home"
              className="flex shrink-0 items-center gap-2 font-body font-extrabold text-sm md:text-lg tracking-wide hover:opacity-80 transition-opacity rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              <img src="/photos/brand/msa-logo-32.webp" srcSet="/photos/brand/msa-logo-32.webp 1x, /photos/brand/msa-logo-64.webp 2x" width={32} height={32} className="w-8 h-8" alt="" />
              <span className="hidden whitespace-nowrap min-[350px]:inline"><span className="text-jannah-mid dark:text-jannah-light"><TextField id="Navbar_1">MSA</TextField></span>{" "}
              <span className="text-msa-blue dark:text-white/90"><TextField id="Navbar_2">at Pitt</TextField></span></span>
            </Link>

            {/* Desktop nav */}
            {design.prayerNav !== "link" && <PrayerLink/>}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = link.exact
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);
                return (
                  <ContentScope key={link.id} id={"Navbar_3-" + (mainMenu.find(item => item.id === link.id)?.title ?? link.id)}><Link
                    key={link.id}
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
                    <TextField id="Navbar_4">{link.label}</TextField>
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-jannah-mid dark:bg-msa-gold rounded-full"
                      />
                    )}
                  </Link></ContentScope>
                );
              })}

              <div
                className="nav-resources"
                ref={resourcesRef}
                onPointerEnter={event => { if (event.pointerType === "mouse") scheduleResources(true); }}
                onPointerLeave={event => { if (event.pointerType === "mouse") scheduleResources(false); }}
                onFocus={() => { window.clearTimeout(timer.current); }}
                onBlur={event => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleResources(false);
                }}
                onKeyDown={event => {
                  if (event.key === "ArrowDown" && !(event.target as HTMLElement).closest("ul")) {
                    event.preventDefault();
                    focusMenu();
                  }
                  if (event.key === "Escape" && resourcesOpen) {
                    event.preventDefault();
                    resourcesLink.current?.focus();
                    window.clearTimeout(timer.current);
                    setResourcesOpen(false);
                  }
                }}
              >
                <Link
                  ref={resourcesLink} to="/resources"
                  onFocus={() => { setResourcesOpen(true); prefetchRoute("/resources"); }}
                  onClick={() => setResourcesOpen(false)}
                  aria-current={location.pathname === "/resources" ? "page" : undefined}
                  className={`nav-resources-link ${isResourcesActive ? "text-jannah-mid dark:text-msa-gold" : ""}`}
                ><TextField id="Navbar_5">Resources</TextField></Link>
                <button
                  type="button" aria-label="Resources submenu" aria-expanded={resourcesOpen} aria-controls="resources-submenu"
                  onClick={() => resourcesOpen ? setResourcesOpen(false) : focusMenu()}
                ><ChevronDown size={13} aria-hidden="true" /></button>
                <ul id="resources-submenu" className="glass nav-resources-menu" hidden={!resourcesOpen}>
                  {resourcesChildren.map((child, index) => (
                    <li key={child.id}>
                      <ContentScope id={"Navbar_6-" + (resourceMenu.find(item => item.id === child.id)?.title ?? child.id)}>
                        <Link ref={index === 0 ? firstResource : undefined} to={child.to}
                          aria-current={location.pathname === child.to ? "page" : undefined}
                          onFocus={() => prefetchRoute(child.to)} onMouseEnter={() => prefetchRoute(child.to)}
                          onClick={() => setResourcesOpen(false)}>
                          <TextField id="Navbar_13">{child.label}</TextField>
                        </Link>
                      </ContentScope>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-xl text-ink-mid/55 dark:text-white/40 hover:text-jannah-mid dark:hover:text-msa-gold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60"
              >
                {theme === "dark" ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
              </button>

              <Link to="/join" className="btn-premium text-sm px-5 py-2 ml-1"><TextField id="Navbar_7">
                Join </TextField><ArrowRight size={13} />
              </Link>
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-ink-mid/70 dark:text-white/60 hover:text-jannah-mid dark:hover:text-msa-gold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60"
                style={{ backdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                {theme === "dark" ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-foreground transition-colors duration-200 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60"
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
              background: theme === "dark" ? "rgba(6, 11, 24, 0.82)" : "rgba(248, 243, 234, 0.82)",
              backdropFilter: "blur(48px) saturate(200%)",
              WebkitBackdropFilter: "blur(48px) saturate(200%)",
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
                <Link to="/join" className="btn-premium text-base px-9 py-3.5"><TextField id="Navbar_8">
                  Join the MSA </TextField><ArrowRight size={16} />
                </Link>
              </motion.div>

              <div className="w-12 h-px bg-border/40 mb-6" />

              <div className="flex flex-col items-center w-full">
                {navLinks.map((link, i) => {
                  const isActive = link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);
                  return (
                    <ContentScope key={link.id} id={"Navbar_3-" + (mainMenu.find(item => item.id === link.id)?.title ?? link.id)}><motion.div
                      key={link.id}
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
                        <TextField id="Navbar_4">{link.label}</TextField>
                      </Link>
                    </motion.div></ContentScope>
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
                  ><TextField id="Navbar_11">
                    Resources
                    </TextField><ChevronDown
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
                          <ContentScope key={child.id} id={"Navbar_6-" + (resourceMenu.find(item => item.id === child.id)?.title ?? child.id)}><Link
                            key={child.id}
                            to={child.to}
                            aria-current={location.pathname === child.to ? "page" : undefined}
                            className={`text-xl font-display transition-colors text-center ${
                              location.pathname === child.to
                                ? "text-jannah-mid dark:text-msa-gold"
                                : "text-ink-mid/75 dark:text-white/55"
                            }`}
                          >
                            <TextField id="Navbar_13">{child.label}</TextField>
                          </Link></ContentScope>
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
                  ><TextField id="Navbar_14">
                    Contact
                  </TextField></Link>
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
