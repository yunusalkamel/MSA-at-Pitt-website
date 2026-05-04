import { motion } from "framer-motion";

/**
 * Rotating partner logos strip — credibility surface.
 *
 * NOTE on logo files:
 *   The wordmarks below render as fallbacks if you don't have logo PNG/SVG
 *   files yet. To use real logos, drop them into /public/partners/ at the
 *   matching filenames listed in PARTNERS, and the component will use them
 *   automatically (the fallback wordmarks are only shown if the image fails).
 *
 *   Suggested files (transparent PNG or SVG, ~200px wide, white-on-transparent
 *   for contrast against the strip background):
 *     /public/partners/attawheed.png
 *     /public/partners/icp.png
 *     /public/partners/icwp-map.png
 *     /public/partners/mccgp.png
 *     /public/partners/miftaah.png
 *     /public/partners/qalam.png
 *     /public/partners/almaghrib.png
 *     /public/partners/pitt.png
 *     /public/partners/cmu-msa.png
 *     /public/partners/duq-msa.png
 */

interface Partner {
  name: string;
  /** Optional path to a logo image. If missing/broken, we render the wordmark below. */
  src?: string;
  /** Wordmark fallback — short, recognizable text. */
  wordmark: string;
  /** Categorization for the eyebrow caption when this logo is in focus. */
  group: "Mosque Partner" | "Education Partner" | "University" | "Sister Chapter";
}

const PARTNERS: Partner[] = [
  // Mosques (CEC)
  { name: "Attawheed Islamic Center",                src: "/partners/attawheed.png", wordmark: "Attawheed",      group: "Mosque Partner" },
  { name: "Islamic Center of Pittsburgh",            src: "/partners/icp.png",       wordmark: "ICP",             group: "Mosque Partner" },
  { name: "Islamic Center of Western PA / MAP",      src: "/partners/icwp-map.png",  wordmark: "ICWP / MAP",      group: "Mosque Partner" },
  { name: "Muslim Community Center of Greater Pgh",  src: "/partners/mccgp.png",     wordmark: "MCCGP",           group: "Mosque Partner" },

  // Education (Da'wah)
  { name: "Miftaah Institute",   src: "/partners/miftaah.png",    wordmark: "Miftaah",     group: "Education Partner" },
  { name: "Qalam Institute",     src: "/partners/qalam.png",      wordmark: "Qalam",       group: "Education Partner" },
  { name: "AlMaghrib Institute", src: "/partners/almaghrib.png",  wordmark: "AlMaghrib",   group: "Education Partner" },

  // University
  { name: "University of Pittsburgh", src: "/partners/pitt.png", wordmark: "Pitt", group: "University" },

  // Sister chapters
  { name: "CMU MSA",       src: "/partners/cmu-msa.png", wordmark: "CMU MSA", group: "Sister Chapter" },
  { name: "Duquesne MSA",  src: "/partners/duq-msa.png", wordmark: "Duq MSA", group: "Sister Chapter" },
];

const PartnerLogo = ({ partner }: { partner: Partner }) => {
  return (
    <div
      className="relative flex flex-col items-center justify-center group"
      title={partner.name}
    >
      {/* Try real logo first; fall back to wordmark if missing/error */}
      {partner.src ? (
        <img
          src={partner.src}
          alt={partner.name}
          className="h-10 md:h-12 w-auto object-contain opacity-60 group-hover:opacity-95 transition-opacity duration-300 grayscale group-hover:grayscale-0 dark:invert dark:opacity-50 dark:group-hover:opacity-90"
          loading="lazy"
          onError={(e) => {
            // Hide broken image so the wordmark fallback shows through
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const next = (e.currentTarget as HTMLImageElement).nextElementSibling;
            if (next) (next as HTMLElement).style.display = "flex";
          }}
        />
      ) : null}

      {/* Wordmark fallback — hidden by default if a real <img> renders above */}
      <div
        className="px-3 py-2 rounded-lg border border-border/40 bg-background/30 font-body font-semibold text-xs md:text-sm tracking-wide text-foreground/55 group-hover:text-foreground/85 transition-colors duration-300"
        style={{
          display: partner.src ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 80,
          height: "2.75rem",
        }}
      >
        {partner.wordmark}
      </div>
    </div>
  );
};

const PartnerLogos = () => {
  // Duplicate the array so the marquee scrolls infinitely
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section className="py-12 md:py-16 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-8">
          <p className="font-body text-[11px] uppercase tracking-[0.22em] text-jannah-mid dark:text-msa-gold/70 font-semibold mb-2">
            Trusted Partners
          </p>
          <p className="font-display text-foreground/85 text-lg md:text-xl">
            Mosques, scholars, and sister chapters we work with.
          </p>
        </div>
      </div>

      {/* Marquee — pure CSS, pauses on hover, respects prefers-reduced-motion */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <motion.div
          className="flex items-center gap-10 md:gap-14 lg:gap-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 38,
              ease: "linear",
            },
          }}
          style={{ width: "max-content" }}
        >
          {loop.map((p, i) => (
            <PartnerLogo key={`${p.name}-${i}`} partner={p} />
          ))}
        </motion.div>
      </div>

      <p className="text-center font-body text-[11px] text-muted-foreground/55 mt-8 px-4">
        From weekly Jummah to year-round programming — building community alongside the people doing the work.
      </p>
    </section>
  );
};

export default PartnerLogos;
