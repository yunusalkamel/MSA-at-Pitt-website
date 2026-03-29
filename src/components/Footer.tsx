import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/join", label: "Join" },
  { to: "/resources", label: "Resources" },
];

const Footer = () => {
  return (
    <footer className="bg-accent text-accent-foreground relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto section-padding py-16">
        {/* Quranic ayat */}
        <div className="text-center mb-12">
          <p className="font-arabic text-2xl md:text-3xl mb-3 text-primary/70" dir="rtl">
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
          </p>
          <p className="italic text-sm opacity-60">
            "Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing." — Quran 2:127
          </p>
        </div>

        <div className="glass-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <Link to="/" className="font-display text-xl font-bold">
              MSA <span className="text-gradient-gold">at Pitt</span>
            </Link>
            <p className="text-sm opacity-60 mt-1">
              Muslim Student Association · University of Pittsburgh
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-all">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href="https://instagram.com/msa.at.pitt" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-70 hover:opacity-100 hover:text-primary transition-all">
              <Instagram size={20} />
            </a>
            <a href="https://linktr.ee/msa.at.pitt" target="_blank" rel="noopener noreferrer" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-all">
              Linktree
            </a>
          </div>
        </div>

        <p className="text-center text-xs opacity-40 mt-8">
          © 2025–2026 Muslim Student Association at the University of Pittsburgh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
