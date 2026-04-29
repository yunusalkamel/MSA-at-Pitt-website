import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import KhatamOverlay from "@/components/KhatamOverlay";
import CrescentWatermark from "@/components/CrescentWatermark";
import BridgeBar from "@/components/BridgeBar";
import { useTheme } from "@/contexts/ThemeContext";

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/join", label: "Join" },
  { to: "/resources", label: "Resources" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear > 2025 ? `2025–${currentYear}` : "2025";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer
      className="relative overflow-hidden transition-colors duration-500"
      style={{
        background: isDark
          ? "linear-gradient(180deg, #060B18 0%, #0D1528 100%)"
          : "#F8F3EA",
      }}
      role="contentinfo"
    >
      <BridgeBar />

      {/* Khatam: navy on parchment, gold on dark */}
      <KhatamOverlay
        variant={isDark ? "gold" : "navy"}
        size={60}
        opacity={isDark ? 0.22 : 0.8}
      />

      {/* Crescent watermark — 6% opacity, bottom-right per spec */}
      <CrescentWatermark
        color={isDark ? "#C9A84C" : "#14345A"}
        size={180}
        opacity={0.06}
        position="bottom-right"
      />

      {/* Atmospheric depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 80% 100%, rgba(20,128,102,.08) 0%, transparent 55%)"
            : "radial-gradient(ellipse at 80% 100%, rgba(20,52,90,.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-14">
        {/* Footer ayat — Cormorant italic per spec */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="w-10 h-px bg-gradient-to-r from-transparent"
              style={{ backgroundImage: `linear-gradient(to right, transparent, ${isDark ? "rgba(242,171,35,.2)" : "rgba(20,52,90,.2)"})` }}
            />
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: isDark ? "rgba(242,171,35,.4)" : "rgba(20,52,90,.35)" }}
            />
            <div
              className="w-10 h-px"
              style={{ backgroundImage: `linear-gradient(to left, transparent, ${isDark ? "rgba(242,171,35,.2)" : "rgba(20,52,90,.2)"})` }}
            />
          </div>

          <p
            className="font-arabic text-xl md:text-2xl mb-2"
            style={{ color: isDark ? "rgba(242,171,35,.7)" : "#14345A", opacity: isDark ? 1 : 0.65 }}
            dir="rtl"
          >
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
          </p>

          {/* Cormorant italic tagline per Bridge v2 spec */}
          <p
            className="font-display italic text-sm"
            style={{ color: isDark ? "rgba(255,255,255,.35)" : "#32312C", opacity: isDark ? 1 : 0.5 }}
          >
            "Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing." — Quran 2:127
          </p>

          <div className="flex items-center justify-center gap-3 mt-3">
            <div
              className="w-6 h-px"
              style={{ backgroundImage: `linear-gradient(to right, transparent, ${isDark ? "rgba(242,171,35,.1)" : "rgba(20,52,90,.12)"})` }}
            />
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: isDark ? "rgba(242,171,35,.22)" : "rgba(20,52,90,.2)" }}
            />
            <div
              className="w-6 h-px"
              style={{ backgroundImage: `linear-gradient(to left, transparent, ${isDark ? "rgba(242,171,35,.1)" : "rgba(20,52,90,.12)"})` }}
            />
          </div>
        </div>

        <div
          className="h-px mb-8"
          style={{
            backgroundImage: isDark
              ? "linear-gradient(90deg, transparent, rgba(242,171,35,.15), transparent)"
              : "linear-gradient(90deg, transparent, rgba(20,52,90,.12), transparent)",
          }}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            {/* Logo wordmark — Jakarta 800, adaptive colors */}
            <Link
              to="/"
              className="font-body font-extrabold text-xl tracking-[0.1em] hover:opacity-80 transition-opacity"
            >
              <span style={{ color: isDark ? "#C8E8DF" : "#148066" }}>MSA</span>{" "}
              <span style={{ color: isDark ? "rgba(255,255,255,.9)" : "#14345A" }}>AT PITT</span>
            </Link>
            <p
              className="font-body text-sm mt-1"
              style={{ color: isDark ? "rgba(255,255,255,.38)" : "#32312C", opacity: isDark ? 1 : 0.55 }}
            >
              Muslim Student Association · University of Pittsburgh
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-5">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-sm transition-all"
                style={{ color: isDark ? "rgba(255,255,255,.45)" : "#32312C", opacity: isDark ? 1 : 0.65 }}
                onMouseEnter={e => (e.currentTarget.style.color = isDark ? "#148066" : "#148066")}
                onMouseLeave={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,.45)" : "#32312C")}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {[
              { href: "mailto:msa.at.pitt@gmail.com", label: "Email", content: "Email" },
            ].map(({ href, label, content }) => (
              <a
                key={href}
                href={href}
                className="font-body text-sm transition-all"
                aria-label={label}
                style={{ color: isDark ? "rgba(255,255,255,.45)" : "#32312C", opacity: isDark ? 1 : 0.65 }}
                onMouseEnter={e => (e.currentTarget.style.color = isDark ? "#148066" : "#148066")}
                onMouseLeave={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,.45)" : "#32312C")}
              >
                {content}
              </a>
            ))}
            <a
              href="https://instagram.com/msa.at.pitt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-all"
              style={{ color: isDark ? "rgba(255,255,255,.45)" : "#32312C", opacity: isDark ? 1 : 0.65 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#148066")}
              onMouseLeave={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,.45)" : "#32312C")}
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://linktr.ee/msa.at.pitt"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm transition-all"
              style={{ color: isDark ? "rgba(255,255,255,.45)" : "#32312C", opacity: isDark ? 1 : 0.65 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#148066")}
              onMouseLeave={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,.45)" : "#32312C")}
            >
              Linktree
            </a>
          </div>
        </div>

        <p
          className="text-center font-body text-xs mt-8"
          style={{ color: isDark ? "rgba(255,255,255,.22)" : "#32312C", opacity: isDark ? 1 : 0.38 }}
        >
          © {copyrightYears} Muslim Student Association at the University of Pittsburgh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
