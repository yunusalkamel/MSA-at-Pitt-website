import { motion } from "framer-motion";

/**
 * Rotating partner logos strip — each tile shows the logo image (if available)
 * AND the name underneath, always. Subtle, never heavy.
 *
 * Drop real logo files into /public/partners/ — filenames listed below.
 * Logos work best as white-on-transparent PNG or SVG.
 * For JPG/background logos, set hasBackground: true to apply circular crop.
 */

interface Partner {
  name: string;
  shortName: string;
  src?: string;
  group: "Mosque" | "Education" | "University" | "MSA Chapter" | "Community";
  hasBackground?: boolean; // true for logos with non-transparent backgrounds
}

const PARTNERS: Partner[] = [
  // Mosques
  { name: "Attawheed Islamic Center",               shortName: "Attawheed",   src: "/partners/attawheed.png",  group: "Mosque" },
  { name: "Islamic Center of Pittsburgh",           shortName: "ICP",         src: "/partners/icp.jpeg",       group: "Mosque",      hasBackground: true },
  { name: "Islamic Center of Western PA",           shortName: "ICWP",        src: "/partners/icwp.jpeg",      group: "Mosque",      hasBackground: true },
  { name: "Muslim Association of Pittsburgh",       shortName: "MAP",         src: "/partners/map.png",        group: "Mosque" },
  { name: "Muslim Community Center Greater Pgh",   shortName: "MCCGP",       src: "/partners/mccgp.jpg",      group: "Mosque",      hasBackground: true },
  // Education
  { name: "Miftaah Institute",                      shortName: "Miftaah",     src: "/partners/miftaah.png",    group: "Education" },
  { name: "Qalam Institute",                        shortName: "Qalam",       src: "/partners/qalam.png",      group: "Education" },
  { name: "AlMaghrib Institute",                    shortName: "AlMaghrib",   src: "/partners/almaghrib.jpg",  group: "Education",   hasBackground: true },
  // University
  { name: "University of Pittsburgh",               shortName: "Pitt",        src: "/partners/pitt.png",       group: "University" },
  // MSA Chapters
  { name: "CMU MSA",                                shortName: "CMU MSA",     src: "/partners/cmu-msa.jpg",    group: "MSA Chapter", hasBackground: true },
  { name: "Duquesne MSA",                           shortName: "Duq MSA",     src: "/partners/duq-msa.jpg",    group: "MSA Chapter", hasBackground: true },
  { name: "American Muslim Medical Student Assoc.", shortName: "AMMSA",       src: "/partners/ammsa.png",      group: "MSA Chapter" },
  // Community orgs
  { name: "Sudanese American Professional Assoc.",  shortName: "SAPA",        src: "/partners/sapa.png",       group: "Community" },
  { name: "Human Development Foundation",           shortName: "HDF",         src: "/partners/hdf.png",        group: "Community" },
];

const PartnerTile = ({ partner }: { partner: Partner }) => {
  return (
    <div className="flex flex-col items-center gap-2 group flex-shrink-0" title={partner.name}>
      {/* Logo — fixed height container so tiles stay aligned */}
      <div className="h-9 md:h-10 flex items-center justify-center">
        {partner.src ? (
          partner.hasBackground ? (
            /* Circular crop for logos with non-transparent backgrounds */
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden flex-shrink-0 opacity-50 group-hover:opacity-90 transition-all duration-300 grayscale group-hover:grayscale-0">
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
            /* Transparent PNG — show as-is with invert for dark mode */
            <img
              src={partner.src}
              alt={partner.name}
              className="max-h-full w-auto object-contain opacity-50 group-hover:opacity-90 transition-all duration-300 grayscale group-hover:grayscale-0 dark:invert"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )
        ) : (
          /* Wordmark placeholder if no image file yet */
          <div
            className="px-3 py-1.5 rounded-lg border font-body font-semibold text-xs tracking-wide"
            style={{ borderColor: "rgba(var(--border-rgb), 0.3)", color: "rgba(var(--foreground-rgb), 0.45)" }}
          >
            {partner.shortName}
          </div>
        )}
      </div>
      {/* Name — always visible */}
      <span
        className="font-body text-[11px] font-semibold text-muted-foreground/65 group-hover:text-foreground/80 transition-colors duration-300 text-center leading-tight whitespace-nowrap"
      >
        {partner.shortName}
      </span>
    </div>
  );
};

const PartnerLogos = () => {
  const loop = [...PARTNERS, ...PARTNERS];

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
        className="relative"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <motion.div
          className="flex items-end gap-10 md:gap-14"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 42, ease: "linear" } }}
          style={{ width: "max-content" }}
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
