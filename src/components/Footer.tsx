import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import KhatamOverlay from "@/components/KhatamOverlay";
import BridgeBar from "@/components/BridgeBar";
import { LINKS } from "@/config/links";

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const navColumn = [
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/join", label: "Join" },
];

const resourcesColumn = [
  { to: "/resources", label: "All Resources" },
  { to: "/resources/new-to-pitt", label: "New to Pitt" },
  { to: "/resources/prayer-locations", label: "Prayer Locations" },
  { to: "/prayer-times", label: "Prayer Times" },
  { to: "/resources/faq", label: "FAQ" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear > 2025 ? `2025–${currentYear}` : "2025";

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #14345A 0%, #0D2444 100%)" }}
      role="contentinfo"
    >
      <BridgeBar />

      {/* Khatam: gold on navy — subtle texture, never the focal point */}
      <KhatamOverlay variant="gold" size={60} opacity={0.18} />

      {/* Atmospheric depth (no crescent — kept restrained per spec) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(20,128,102,.10) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-16">
        {/* ── Brand block — logo + motto, central ───────────────────────── */}
        <div className="flex flex-col items-center text-center mb-12">
          <Link
            to="/"
            className="inline-block mb-5 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60 rounded-full"
          >
            <img
              src="/msa-logo-white.png"
              alt="MSA at Pitt"
              className="h-20 md:h-24 w-auto object-contain"
              width={120}
              height={120}
            />
          </Link>

          <p
            className="font-body font-extrabold text-2xl md:text-[1.7rem] tracking-[0.12em] leading-none mb-3"
          >
            <span style={{ color: "#C8E8DF" }}>MSA</span>{" "}
            <span style={{ color: "rgba(255,255,255,.92)" }}>AT PITT</span>
          </p>

          <p
            className="font-display italic text-lg md:text-xl leading-snug"
            style={{ color: "rgba(242,171,35,.85)" }}
          >
            Cultivate Community,&nbsp;
            <span className="font-display italic" style={{ color: "rgba(242,171,35,1)" }}>
              Ignite Iman.
            </span>
          </p>
          <p
            className="font-body text-xs md:text-sm tracking-wide mt-2"
            style={{ color: "rgba(255,255,255,.42)" }}
          >
            Muslim Student Association · University of Pittsburgh
          </p>
        </div>

        {/* ── Hairline divider ──────────────────────────────────────────── */}
        <div
          className="h-px mb-10"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent, rgba(242,171,35,.22), transparent)",
          }}
        />

        {/* ── Three-column nav grid (desktop) / stacked (mobile) ────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-12 text-center md:text-left">
          {/* Column 1: Explore */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p
              className="font-body text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "rgba(242,171,35,.7)" }}
            >
              Explore
            </p>
            {navColumn.map((link) => (
              <Link key={link.to} to={link.to} className="footer-link font-body text-sm">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 2: Resources */}
          <div className="flex flex-col items-center md:items-start gap-3 md:border-l md:border-r md:px-6"
               style={{ borderColor: "rgba(242,171,35,.12)" }}>
            <p
              className="font-body text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "rgba(242,171,35,.7)" }}
            >
              Resources
            </p>
            {resourcesColumn.map((link) => (
              <Link key={link.to} to={link.to} className="footer-link font-body text-sm">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3: Connect */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p
              className="font-body text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "rgba(242,171,35,.7)" }}
            >
              Connect
            </p>
            <a
              href={`mailto:${LINKS.email}`}
              className="footer-link font-body text-sm"
              aria-label="Email MSA at Pitt"
            >
              Email us
            </a>
            <Link to="/contact" className="footer-link font-body text-sm">
              Contact
            </Link>
            <a
              href={LINKS.linktree}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link font-body text-sm"
            >
              Linktree (RSVP hub)
            </a>

            {/* Social icons row */}
            <div className="flex items-center gap-4 mt-1">
              <a
                href={LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer-link inline-flex items-center"
              >
                <Instagram size={20} />
              </a>
              <a
                href={LINKS.whatsappAnnouncements}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MSA WhatsApp announcements"
                className="footer-link inline-flex items-center"
              >
                <WhatsAppIcon size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Closing ayat — Quran 3:103 (unity) ────────────────────────── */}
        <div
          className="rounded-2xl px-6 py-6 md:px-10 md:py-7 text-center max-w-3xl mx-auto"
          style={{
            background: "rgba(255,255,255,.025)",
            border: "1px solid rgba(242,171,35,.10)",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-12 h-px"
              style={{
                backgroundImage:
                  "linear-gradient(to right, transparent, rgba(242,171,35,.30))",
              }}
            />
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: "rgba(242,171,35,.5)" }}
            />
            <div
              className="w-12 h-px"
              style={{
                backgroundImage:
                  "linear-gradient(to left, transparent, rgba(242,171,35,.30))",
              }}
            />
          </div>

          <p
            className="font-arabic text-2xl md:text-[1.85rem] mb-3 leading-[1.6]"
            style={{ color: "rgba(242,171,35,.85)" }}
            dir="rtl"
          >
            وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا
          </p>
          <p
            className="font-display italic text-sm md:text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,.55)" }}
          >
            "And hold firmly to the rope of Allah, all together, and do not become divided."
          </p>
          <p
            className="font-body text-[11px] tracking-[0.15em] uppercase mt-3"
            style={{ color: "rgba(242,171,35,.55)" }}
          >
            Quran 3:103
          </p>
        </div>

        {/* ── Copyright ─────────────────────────────────────────────────── */}
        <p
          className="text-center font-body text-xs mt-10"
          style={{ color: "rgba(255,255,255,.28)" }}
        >
          © {copyrightYears} Muslim Student Association at the University of Pittsburgh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
