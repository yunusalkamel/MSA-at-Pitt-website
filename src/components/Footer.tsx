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
    <footer className="bg-accent text-accent-foreground relative overflow-hidden" role="contentinfo">
      <BridgeBar />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/5" />
      <KhatamOverlay variant="gold" size={56} opacity={0.3} />
      <CrescentWatermark color="#C9A84C" size={180} opacity={0.04} position="bottom-right" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-14">
        {/* Footer ayat */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-primary/25" />
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-primary/25" />
          </div>
          <p className="font-arabic text-xl md:text-2xl mb-2 text-primary/65" dir="rtl">
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
          </p>
          <p className="italic text-xs opacity-50">
            "Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing." — Quran 2:127
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-6 h-px bg-gradient-to-r from-transparent to-primary/15" />
            <div className="w-1 h-1 rounded-full bg-primary/25" />
            <div className="w-6 h-px bg-gradient-to-l from-transparent to-primary/15" />
          </div>
        </div>

        <div className="glass-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Link to="/" className="font-display text-xl font-bold">
              MSA <span className="text-gradient-gold">at Pitt</span>
            </Link>
            <p className="text-sm opacity-60 mt-1">
              Muslim Student Association · University of Pittsburgh
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-5">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="mailto:msa.at.pitt@gmail.com"
              className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-all"
            >
              Email
            </a>
            <a
              href="https://instagram.com/msa.at.pitt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="opacity-70 hover:opacity-100 hover:text-primary transition-all"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://linktr.ee/msa.at.pitt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-all"
            >
              Linktree
            </a>
          </div>
        </div>

        <p className="text-center text-xs opacity-40 mt-8">
          © {copyrightYears} Muslim Student Association at the University of Pittsburgh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
