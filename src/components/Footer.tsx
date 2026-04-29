import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import KhatamOverlay from "@/components/KhatamOverlay";
import CrescentWatermark from "@/components/CrescentWatermark";
import BridgeBar from "@/components/BridgeBar";

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

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "#F8F3EA" }}
      role="contentinfo"
    >
      <BridgeBar />
      {/* Khatam navy pattern on parchment — per Bridge v2 spec */}
      <KhatamOverlay variant="navy" size={60} opacity={0.8} />
      {/* Crescent watermark at 6% opacity, bottom-right — per spec */}
      <CrescentWatermark color="#14345A" size={180} opacity={0.06} position="bottom-right" />
      {/* Subtle warm gradient to add depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(20,52,90,.04)_0%,transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-14">
        {/* Footer ayat — Cormorant italic per spec */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-msa-blue/20" />
            <div className="w-1 h-1 rounded-full bg-msa-blue/35" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-msa-blue/20" />
          </div>
          <p
            className="font-arabic text-xl md:text-2xl mb-2"
            style={{ color: '#14345A', opacity: 0.65 }}
            dir="rtl"
          >
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
          </p>
          <p className="font-display italic text-sm" style={{ color: '#32312C', opacity: 0.5 }}>
            "Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing." — Quran 2:127
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-msa-blue/12" />
            <div className="w-1 h-1 rounded-full bg-msa-blue/20" />
            <div className="w-6 h-px bg-gradient-to-l from-transparent to-msa-blue/12" />
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-msa-blue/12 to-transparent mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            {/* Logo wordmark — Jakarta 800, MSA in jannah-mid, AT PITT in msa-blue */}
            <Link
              to="/"
              className="font-body font-extrabold text-xl tracking-[0.1em] hover:opacity-80 transition-opacity"
            >
              <span style={{ color: '#148066' }}>MSA</span>{' '}
              <span style={{ color: '#14345A' }}>AT PITT</span>
            </Link>
            <p
              className="font-body text-sm mt-1"
              style={{ color: '#32312C', opacity: 0.55 }}
            >
              Muslim Student Association · University of Pittsburgh
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-5">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-sm transition-all hover:text-jannah-mid"
                style={{ color: '#32312C', opacity: 0.65 }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="mailto:msa.at.pitt@gmail.com"
              className="font-body text-sm transition-all hover:text-jannah-mid"
              style={{ color: '#32312C', opacity: 0.65 }}
            >
              Email
            </a>
            <a
              href="https://instagram.com/msa.at.pitt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-all hover:text-jannah-mid"
              style={{ color: '#32312C', opacity: 0.65 }}
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://linktr.ee/msa.at.pitt"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm transition-all hover:text-jannah-mid"
              style={{ color: '#32312C', opacity: 0.65 }}
            >
              Linktree
            </a>
          </div>
        </div>

        <p
          className="text-center font-body text-xs mt-8"
          style={{ color: '#32312C', opacity: 0.38 }}
        >
          © {copyrightYears} Muslim Student Association at the University of Pittsburgh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
