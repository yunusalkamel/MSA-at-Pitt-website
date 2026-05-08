import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import KhatamOverlay from "@/components/KhatamOverlay";
import BridgeBar from "@/components/BridgeBar";
import { LINKS } from "@/config/links";

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear > 2025 ? `2025–${currentYear}` : "2025";

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0D1528 0%, #101E38 45%, #0A1220 100%)" }}
      role="contentinfo"
    >
      <BridgeBar />
      <KhatamOverlay variant="gold" size={60} opacity={0.14} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 100%, rgba(20,128,102,.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 0%, rgba(242,171,35,.06) 0%, transparent 45%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 pt-12 pb-8">

        {/* ── Top row: logo | nav columns | motto ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-10 lg:gap-14 items-start mb-10">

          {/* Left: logo + name + description */}
          <div className="flex flex-col items-center lg:items-start gap-3">
            <Link to="/" className="hover:opacity-85 transition-opacity">
              <img src="/msa-logo-white.png" alt="MSA at Pitt" className="h-20 md:h-24 w-auto object-contain" />
            </Link>
            <p className="font-display text-2xl md:text-3xl font-bold leading-tight" style={{ color: "rgba(255,255,255,.9)" }}>
              MSA at Pitt
            </p>
            <div className="flex flex-col gap-0.5">
              <p className="font-body text-[13px]" style={{ color: "rgba(200,232,223,.65)" }}>Muslim Student Association</p>
              <p className="font-body text-[13px]" style={{ color: "rgba(200,232,223,.4)" }}>University of Pittsburgh</p>
            </div>
          </div>

          {/* Center: three nav columns */}
          <div className="grid grid-cols-3 gap-4 lg:gap-8">

            {/* Explore — left aligned */}
            <div className="flex flex-col gap-2.5 items-start">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(242,171,35,.6)" }}>Explore</p>
              {[
                { to: "/about",   l: "About"   },
                { to: "/events",  l: "Events"  },
                { to: "/gallery", l: "Gallery" },
                { to: "/join",    l: "Join"    },
              ].map(({ to, l }) => (
                <Link key={to} to={to} className="footer-link font-body text-sm">{l}</Link>
              ))}
            </div>

            {/* Resources — center aligned */}
            <div className="flex flex-col gap-2.5 items-center text-center">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(242,171,35,.6)" }}>Resources</p>
              {[
                { to: "/resources",                  l: "All Resources"    },
                { to: "/resources/new-to-pitt",      l: "New to Pitt"      },
                { to: "/resources/prayer-locations", l: "Prayer Locations" },
                { to: "/prayer-times",               l: "Prayer Times"     },
                { to: "/resources/faq",              l: "FAQ"              },
              ].map(({ to, l }) => (
                <Link key={to} to={to} className="footer-link font-body text-sm text-center whitespace-nowrap">{l}</Link>
              ))}
            </div>

            {/* Contact — right aligned */}
            <div className="flex flex-col gap-2.5 items-end text-right">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(242,171,35,.6)" }}>Contact</p>
              <Link to="/contact" className="inline-flex items-center justify-end text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors duration-200">
                Contact Us →
              </Link>
              <a href={`mailto:${LINKS.email}`} className="footer-link font-body text-sm">Email</a>
              <div className="flex items-center gap-3 mt-1">
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-link inline-flex items-center">
                  <Instagram size={17} />
                </a>
                <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-link inline-flex items-center">
                  <Facebook size={17} />
                </a>
                <a href={LINKS.whatsappAnnouncements} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="footer-link inline-flex items-center">
                  <WhatsAppIcon size={17} />
                </a>
              </div>
              <a href={LINKS.linktree} target="_blank" rel="noopener noreferrer" className="footer-link font-body text-sm">Linktree</a>
            </div>
          </div>

          {/* Right: motto */}
          <div className="text-center lg:text-right">
            <h2 className="font-display text-3xl md:text-[2.6rem] font-bold text-accent-foreground leading-tight">
              Cultivate Community,
            </h2>
            <div>
              <span
                className="font-display italic text-gradient-aura inline-block"
                style={{ fontSize: "clamp(2.4rem, 3.5vw, 3.8rem)", lineHeight: 1.2, paddingBottom: "0.15em" }}
              >
                Ignite Iman.
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ornament ── */}
        <div className="relative h-px mb-8" style={{ background: "linear-gradient(90deg, transparent, rgba(242,171,35,.2) 30%, rgba(242,171,35,.2) 70%, transparent)" }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(242,171,35,.45)" }} />
            <span className="w-2 h-2 rounded-full" style={{ background: "rgba(242,171,35,.65)" }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(242,171,35,.45)" }} />
          </div>
        </div>

        {/* ── Closing verse ── */}
        <div className="text-center mb-6">
          <p className="font-arabic text-xl md:text-2xl mb-2 leading-relaxed" style={{ color: "rgba(242,171,35,.80)" }} dir="rtl">
            وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا
          </p>
          <p className="font-display italic text-sm" style={{ color: "rgba(255,255,255,.45)" }}>
            "And hold firmly to the rope of Allah, all together, and do not become divided." — <span style={{ color: "rgba(242,171,35,.55)" }}>Quran 3:103</span>
          </p>
        </div>

        {/* ── Copyright ── */}
        <p className="text-center font-body text-xs" style={{ color: "rgba(255,255,255,.22)" }}>
          © {copyrightYears} Muslim Student Association at the University of Pittsburgh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
