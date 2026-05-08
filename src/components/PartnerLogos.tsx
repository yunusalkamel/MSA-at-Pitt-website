import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { useRef } from "react";

interface Partner {
  name: string;
  shortName: string;
  src?: string;
  group: "Mosque" | "Education" | "University" | "MSA Chapter" | "Community";
  hasBackground?: boolean;
}

const PARTNERS: Partner[] = [
  // Mosques
  { name: "Attawheed Islamic Center",              shortName: "Attawheed",  src: "/partners/attawheed.png",  group: "Mosque" },
  { name: "Islamic Center of Pittsburgh",          shortName: "ICP",        src: "/partners/icp.jpeg",       group: "Mosque",      hasBackground: true },
  { name: "Islamic Center of Western PA",          shortName: "ICWP",       src: "/partners/icwp.jpeg",      group: "Mosque",      hasBackground: true },
  { name: "Muslim Association of Pittsburgh",      shortName: "MAP",        src: "/partners/map.png",        group: "Mosque" },
  { name: "Muslim Community Center Greater Pgh",   shortName: "MCCGP",      src: "/partners/mccgp.jpg",      group: "Mosque",      hasBackground: true },
  // Education
  { name: "Miftaah Institute",                     shortName: "Miftaah",    src: "/partners/miftaah.png",    group: "Education" },
  { name: "Qalam Institute",                       shortName: "Qalam",      src: "/partners/qalam.png",      group: "Education" },
  { name: "AlMaghrib Institute",                   shortName: "AlMaghrib",  src: "/partners/almaghrib.jpg",  group: "Education",   hasBackground: true },
  // University
  { name: "University of Pittsburgh",              shortName: "Pitt",       src: "/partners/pitt.png",       group: "University" },
  // MSA Chapters
  { name: "CMU MSA",                               shortName: "CMU MSA",    src: "/partners/cmu-msa.jpg",    group: "MSA Chapter", hasBackground: true },
  { name: "Duquesne MSA",                          shortName: "Duq MSA",    src: "/partners/duq-msa.jpg",    group: "MSA Chapter", hasBackground: true },
  { name: "AMMSA",                                 shortName: "AMMSA",      src: "/partners/ammsa.png",      group: "MSA Chapter" },
  // Community orgs
  { name: "Sudanese American Professional Assoc.", shortName: "SAPA",       src: "/partners/sapa.png",       group: "Community",   hasBackground: true },
  { name: "Human Development Foundation",          shortName: "HDF",        src: "/partners/hdf.png",        group: "Community" },
];

const SCROLL_SPEED = 80; // px per second

const PartnerTile = ({ partner }: { partner: Partner }) => (
  <div
    className="flex flex-col items-center gap-2 group flex-shrink-0 select-none"
    title={partner.name}
  >
    <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
      {partner.src ? (
        partner.hasBackground ? (
          <div className="h-11 w-11 md:h-12 md:w-12 rounded-full overflow-hidden flex-shrink-0 opacity-85 group-hover:opacity-100 transition-opacity duration-300">
            <img
              src={partner.src}
              alt={partner.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <img
            src={partner.src}
            alt={partner.name}
            className="h-10 md:h-11 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
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
          {partner.shortName}
        </div>
      )}
    </div>
    <span className="font-body text-[11px] font-semibold text-muted-foreground/65 group-hover:text-foreground/80 transition-colors duration-300 text-center leading-tight whitespace-nowrap">
      {partner.shortName}
    </span>
  </div>
);

const PartnerLogos = () => {
  const loop = [...PARTNERS, ...PARTNERS];
  const x = useMotionValue(0);
  const isDragging = useRef(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const dragStartClientX = useRef(0);
  const dragStartMotionX = useRef(0);

  useAnimationFrame((_, delta) => {
    if (isDragging.current || !innerRef.current) return;
    const halfWidth = innerRef.current.scrollWidth / 2;
    let next = x.get() - (delta * SCROLL_SPEED) / 1000;
    if (next <= -halfWidth) next += halfWidth;
    x.set(next);
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartClientX.current = e.clientX;
    dragStartMotionX.current = x.get();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !innerRef.current) return;
    const halfWidth = innerRef.current.scrollWidth / 2;
    let next = dragStartMotionX.current + (e.clientX - dragStartClientX.current);
    while (next < -halfWidth) next += halfWidth;
    while (next > 0) next -= halfWidth;
    x.set(next);
  };

  const stopDrag = () => { isDragging.current = false; };

  return (
    <section className="py-10 md:py-14 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-7 text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-jannah-mid dark:text-msa-gold/70 font-semibold mb-1.5">
          Community Partners
        </p>
        <p className="font-display text-foreground/75 text-lg">
          Mosques, scholars, sister chapters, and organizations we work alongside.
        </p>
      </div>

      <div
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onPointerLeave={stopDrag}
      >
        <motion.div
          ref={innerRef}
          className="flex items-center gap-10 md:gap-14 py-3"
          style={{ x, width: "max-content" }}
        >
          {loop.map((p, i) => (
            <PartnerTile key={`${p.shortName}-${i}`} partner={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerLogos;
