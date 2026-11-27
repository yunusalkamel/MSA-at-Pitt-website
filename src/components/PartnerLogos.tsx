import { Picture, TextField, itemIdentity, ContentScope, Content } from "@/editor/content";
import { motion, useMotionValue, useAnimationFrame, useInView, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useContext } from "react";

import { findAvailable, getCollection } from "@/editor/visual-model";

interface Partner {
  name: string;
  shortName: string;
  src?: string;
  href: string;
  group: "Mosque" | "Education" | "University" | "MSA Chapter" | "Community";
  hasBackground?: boolean;
  description?: string;
}

export const PARTNERS: Partner[] = [
  // Mosques
  { name: "Attawheed Islamic Center",              shortName: "Attawheed",  src: "/partners/attawheed.jpg",  href: "https://attawheed.org",      group: "Mosque",      hasBackground: true },
  { name: "Islamic Center of Pittsburgh",          shortName: "ICP",        src: "/partners/icp.jpeg",       href: "https://icp-pgh.org",        group: "Mosque",      hasBackground: true },
  { name: "Islamic Center of Western PA",          shortName: "ICWP",       src: "/partners/icwp.jpeg",      href: "https://icwpa.org",          group: "Mosque",      hasBackground: true },
  { name: "Muslim Association of Pittsburgh",      shortName: "MAP",        src: "/partners/map.png",        href: "https://mapitt.org",         group: "Mosque" },
  { name: "Muslim Community Center Greater Pgh",   shortName: "MCCGP",      src: "/partners/mccgp.jpg",      href: "https://mccgp.org",          group: "Mosque",      hasBackground: true },
  // Education
  { name: "Miftaah Institute",                     shortName: "Miftaah",    src: "/partners/miftaah.png",    href: "https://miftaah.org",        group: "Education" },
  { name: "Qalam Institute",                       shortName: "Qalam",      src: "/partners/qalam.png",      href: "https://qalam.institute",    group: "Education" },
  { name: "AlMaghrib Institute",                   shortName: "AlMaghrib",  src: "/partners/almaghrib.jpg",  href: "https://almaghrib.org",      group: "Education",   hasBackground: true },
  // University
  { name: "University of Pittsburgh",              shortName: "Pitt",       src: "/partners/pitt.png",       href: "https://pitt.edu",           group: "University" },
  // MSA Chapters
  { name: "CMU MSA",                               shortName: "CMU MSA",    src: "/partners/cmu-msa.jpg",    href: "https://cmu.edu",            group: "MSA Chapter", hasBackground: true },
  { name: "Duquesne MSA",                          shortName: "Duq MSA",    src: "/partners/duq-msa.jpg",    href: "https://duq.edu",            group: "MSA Chapter", hasBackground: true },
  { name: "AMMSA",                                 shortName: "AMMSA",      src: "/partners/ammsa.png",      href: "https://ammsa.org",          group: "MSA Chapter" },
  // Community orgs
  { name: "Sudanese American Professional Assoc.", shortName: "SAPA",       src: "/partners/sapa.png",       href: "https://sapa-usa.org",       group: "Community",   hasBackground: true },
  { name: "Human Development Foundation",          shortName: "HDF",        src: "/partners/hdf.png",        href: "https://hdf.com",            group: "Community" },
];

export function usePartners() {
  const { fields } = useContext(Content);
  const entries = findAvailable(getCollection(fields, "partners"));
  if (!entries) return PARTNERS;
  return entries.filter(entry => entry.url).map(entry => {
    const prior = PARTNERS.find(item => item.shortName.replace(/[^a-zA-Z0-9]+/g,"-") === entry.id);
    return { ...prior, name:entry.title, description:entry.body, shortName:prior?.shortName || entry.title,
      src:entry.image, group:(entry.role || "Community") as Partner["group"], href:entry.url };
  });
}

const partnerImage = (src: string) => src?.startsWith("/partners/") ? src.replace(/\.[^.]+$/, ".webp") : src;
const SCROLL_SPEED = 30; // px per second

const PartnerTile = ({ partner }: { partner: Partner }) => (
  <a
    href={partner.href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center gap-2 group flex-shrink-0 select-none"
    title={partner.description || partner.name}
    draggable={false}
  >
    <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
      {partner.src ? (
        partner.hasBackground ? (
          <div className="h-11 w-11 md:h-12 md:w-12 rounded-full overflow-hidden flex-shrink-0 opacity-85 group-hover:opacity-100 transition-opacity duration-300">
            <Picture fieldId="PartnerLogos_1"
              src={partnerImage(partner.src)}
              alt={partner.name}
              className="h-full w-full object-cover"
              loading="lazy"
              sizes="48px"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <Picture fieldId="PartnerLogos_2"
            src={partnerImage(partner.src)}
            alt={partner.name}
            className="h-10 md:h-11 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
            sizes="72px"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )
      ) : (
        <div
          className="px-3 py-1.5 rounded-lg border font-body font-semibold text-xs tracking-wide opacity-60 group-hover:opacity-90 transition-opacity duration-300"
          style={{ borderColor: "rgba(var(--border-rgb), 0.3)", color: "rgba(var(--foreground-rgb), 0.6)" }}
        >
          <TextField id="PartnerLogos_3">{partner.shortName}</TextField>
        </div>
      )}
    </div>
    <span className="font-body text-[11px] font-semibold text-muted-foreground/65 group-hover:text-foreground/80 transition-colors duration-300 text-center leading-tight whitespace-nowrap">
      <TextField id="PartnerLogos_4">{partner.shortName}</TextField>
    </span>
  </a>
);

const PartnerLogos = () => {
  const partners = usePartners();
  const loop = [...partners, ...partners];
  const x = useMotionValue(0);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const visible = useInView(containerRef);
  const reducedMotion = useReducedMotion();
  const dragStartClientX = useRef(0);
  const dragStartMotionX = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!visible || reducedMotion || isDragging.current || !innerRef.current) return;
    const halfWidth = innerRef.current.scrollWidth / 2;
    let next = x.get() - (delta * SCROLL_SPEED) / 1000;
    if (next <= -halfWidth) next += halfWidth;
    x.set(next);
  });

  // Pointer events for desktop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // handled by touch listeners below
    isDragging.current = true;
    didDrag.current = false;
    dragStartClientX.current = e.clientX;
    dragStartMotionX.current = x.get();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !isDragging.current || !innerRef.current) return;
    const delta = e.clientX - dragStartClientX.current;
    if (Math.abs(delta) > 6) didDrag.current = true;
    const halfWidth = innerRef.current.scrollWidth / 2;
    let next = dragStartMotionX.current + delta;
    while (next < -halfWidth) next += halfWidth;
    while (next > 0) next -= halfWidth;
    x.set(next);
  };

  const stopDrag = () => { isDragging.current = false; };

  // Touch events for mobile — must be non-passive to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      didDrag.current = false;
      dragStartClientX.current = e.touches[0].clientX;
      dragStartMotionX.current = x.get();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !innerRef.current) return;
      const delta = e.touches[0].clientX - dragStartClientX.current;
      if (Math.abs(delta) > 6) {
        didDrag.current = true;
        e.preventDefault(); // prevent page scroll while dragging carousel
      }
      const halfWidth = innerRef.current.scrollWidth / 2;
      let next = dragStartMotionX.current + delta;
      while (next < -halfWidth) next += halfWidth;
      while (next > 0) next -= halfWidth;
      x.set(next);
    };

    const onTouchEnd = () => { isDragging.current = false; };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [x]);

  return (
    <section className="py-10 md:py-14 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-7 text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-jannah-mid dark:text-msa-gold/70 font-semibold mb-1.5"><TextField id="PartnerLogos_5">
          Community Partners
        </TextField></p>
        <p className="font-display text-foreground/75 text-lg"><TextField id="PartnerLogos_6">
          Mosques, scholars, sister chapters, and organizations we work alongside.
        </TextField></p>
      </div>

      <div
        ref={containerRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          touchAction: "pan-y",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={() => { isDragging.current = false; didDrag.current = false; }}
        onPointerLeave={() => { isDragging.current = false; }}
        onClickCapture={(e) => {
          if (didDrag.current) {
            e.preventDefault();
            e.stopPropagation();
            didDrag.current = false;
          }
        }}
      >
        <motion.div
          ref={innerRef}
          className="flex items-center gap-10 md:gap-14 py-3"
          style={{ x, width: "max-content" }}
        >
          {loop.map((p, i) => (
            <ContentScope key={`${p.shortName}-${i}`} id={"PartnerLogos_7-" + itemIdentity(p, `${p.shortName}-${i}`)}><PartnerTile key={`${p.shortName}-${i}`} partner={p} /></ContentScope>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerLogos;
