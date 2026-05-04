import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import KhatamOverlay from "@/components/KhatamOverlay";
import CrescentWatermark from "@/components/CrescentWatermark";
import BridgeBar from "@/components/BridgeBar";
import { LINKS } from "@/config/links";

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/join", label: "Join" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
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

      {/* Khatam: gold on navy always */}
      <KhatamOverlay
        variant="gold"
        size={60}
        opacity={0.18}
      />

      {/* Crescent watermark */}
      <CrescentWatermark
        color="#C9A84C"
        size={180}
        opacity={0.07}
        position="bottom-right"
      />

      {/* Atmospheric depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 80% 100%, rgba(20,128,102,.08) 0%, transparent 55%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-14">
        {/* Footer ayat — Cormorant italic per spec */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-px" style={{ backgroundImage: "linear-gradient(to right, transparent, rgba(242,171,35,.25))" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(242,171,35,.45)" }} />
            <div className="w-10 h-px" style={{ backgroundImage: "linear-gradient(to left, transparent, rgba(242,171,35,.25))" }} />
          </div>

          <p className="font-arabic text-xl md:text-2xl mb-2" style={{ color: "rgba(242,171,35,.75)" }} dir="rtl">
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
          </p>
          <p className="font-display italic text-sm" style={{ color: "rgba(255,255,255,.38)" }}>
            "Our Lord, accept from us. Indeed, You are the All-Hearing, the All-Knowing." — Quran 2:127
          </p>

          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-6 h-px" style={{ backgroundImage: "linear-gradient(to right, transparent, rgba(242,171,35,.12))" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(242,171,35,.25)" }} />
            <div className="w-6 h-px" style={{ backgroundImage: "linear-gradient(to left, transparent, rgba(242,171,35,.12))" }} />
          </div>
        </div>

        <div className="h-px mb-8" style={{ backgroundImage: "linear-gradient(90deg, transparent, rgba(242,171,35,.15), transparent)" }} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            {/* MSA logo mark */}
            <Link to="/" className="group flex items-center gap-3 hover:opacity-85 transition-opacity">
              <img
                src="/msa-logo-white.png"
                alt="MSA at Pitt"
                className="h-9 w-auto object-contain"
              />
              <div>
                <p className="font-body font-extrabold text-xl tracking-[0.1em] leading-none">
                  <span style={{ color: "#C8E8DF" }}>MSA</span>{" "}
                  <span style={{ color: "rgba(255,255,255,.9)" }}>AT PITT</span>
                </p>
              </div>
            </Link>
            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,.38)" }}>
              Muslim Student Association · University of Pittsburgh
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-5">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="footer-link font-body text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={`mailto:${LINKS.email}`}
              className="footer-link font-body text-sm"
              aria-label="Email MSA at Pitt"
            >
              Email
            </a>
            <a
              href={LINKS.whatsappAnnouncements}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MSA WhatsApp announcements"
              className="footer-link inline-flex items-center"
            >
              <WhatsAppIcon size={19} />
            </a>
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="footer-link inline-flex items-center"
            >
              <Instagram size={19} />
            </a>
            <a
              href={LINKS.linktree}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link font-body text-sm"
            >
              Linktree
            </a>
          </div>
        </div>

        <p className="text-center font-body text-xs mt-8" style={{ color: "rgba(255,255,255,.22)" }}>
          © {copyrightYears} Muslim Student Association at the University of Pittsburgh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
