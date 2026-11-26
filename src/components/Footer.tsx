import { LinkField, ContentScope, Picture, TextField } from "@/editor/content";
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

import { useDesign } from "@/design/options";
const Footer = () => {
  const {footer} = useDesign();
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
              <Picture fieldId="Footer_2" src="/photos/brand/msa-logo.webp" alt="MSA at Pitt" className="h-20 md:h-24 w-auto object-contain" loading="lazy" decoding="async" sizes="96px" />
            </Link>
            <p className="font-display text-2xl md:text-3xl font-bold leading-tight" style={{ color: "rgba(255,255,255,.9)" }}><TextField id="Footer_3">
              MSA at Pitt
            </TextField></p>
            <div className="flex flex-col gap-0.5 text-center lg:text-left">
              <p className="font-body text-[13px]" style={{ color: "rgba(200,232,223,.65)" }}><TextField id="Footer_4">Muslim Student Association</TextField></p>
              <p className="font-body text-[13px]" style={{ color: "rgba(200,232,223,.4)" }}><TextField id="Footer_5">University of Pittsburgh</TextField></p>
            </div>
          </div>

          {/* Center: three nav columns */}
          <div className="grid grid-cols-3 gap-4 lg:gap-8 items-start">

            {/* Explore — left aligned */}
            <div className="flex flex-col gap-2.5 items-start">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(242,171,35,.6)" }}><TextField id="Footer_6">{footer?"Get involved":"Explore"}</TextField></p>
              {(footer?[{to:"/events",l:"Attend an event"},{to:"/join",l:"Join the MSA"},{to:"/gallery",l:"See our community"},{to:"/about",l:"Meet the board"}]:[
                { to: "/about",   l: "About"   },
                { to: "/events",  l: "Events"  },
                { to: "/gallery", l: "Gallery" },
                { to: "/join",    l: "Join"    },
              ]).map(({ to, l }) => (
                <ContentScope key={to} id={"Footer_7-" + to}><Link key={to} to={to} className="footer-link font-body text-sm"><TextField id="Footer_8">{l}</TextField></Link></ContentScope>
              ))}
            </div>

            {/* Resources — center aligned */}
            <div className="flex flex-col gap-2.5 items-center text-center">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(242,171,35,.6)" }}><TextField id="Footer_9">{footer?"Campus life":"Resources"}</TextField></p>
              {(footer?[{to:"/resources/new-to-pitt",l:"Student guide"},{to:"/resources/prayer",l:"Prayer on campus"},{to:"/resources/chaplain",l:"Meet the chaplain"},{to:"/resources",l:"All resources"}]:[
                { to: "/resources",                  l: "All Resources"    },
                { to: "/resources/new-to-pitt",      l: "New to Pitt"      },
                { to: "/resources/prayer-locations", l: "Prayer Locations" },
                { to: "/prayer-times",               l: "Prayer Times"     },
                { to: "/resources/faq",              l: "FAQ"              },
              ]).map(({ to, l }) => (
                <ContentScope key={to} id={"Footer_10-" + to}><Link key={to} to={to} className="footer-link font-body text-sm text-center whitespace-nowrap"><TextField id="Footer_11">{l}</TextField></Link></ContentScope>
              ))}
            </div>

            {/* Connect — right aligned */}
            <div className="flex flex-col gap-2.5 items-end text-right h-full">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(242,171,35,.6)" }}><TextField id="Footer_12">Connect</TextField></p>
              <LinkField fieldId="Footer_email_link" href={`mailto:${LINKS.email}`} className="footer-link font-body text-sm"><TextField id="Footer_13">Email</TextField></LinkField>
              <div className="flex items-center gap-3 mt-1">
                <LinkField fieldId="Footer_instagram_link" href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-link inline-flex items-center">
                  <Instagram size={17} />
                </LinkField>
                <LinkField fieldId="Footer_facebook_link" href={LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-link inline-flex items-center">
                  <Facebook size={17} />
                </LinkField>
                <LinkField fieldId="Footer_whatsapp_link" href={LINKS.whatsappAnnouncements} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="footer-link inline-flex items-center">
                  <WhatsAppIcon size={17} />
                </LinkField>
              </div>
              <LinkField fieldId="Footer_linktree_link" href={LINKS.linktree} target="_blank" rel="noopener noreferrer" className="footer-link font-body text-sm"><TextField id="Footer_14">Linktree</TextField></LinkField>
              <div className="mt-auto pt-2">
                <Link to="/contact" className="inline-flex items-center justify-end text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors duration-200"><TextField id="Footer_15">
                  Contact Us →
                </TextField></Link>
              </div>
            </div>
          </div>

          {/* Right: motto */}
          <div className="text-center lg:text-right">
            <h2 className="font-display text-3xl md:text-[2.6rem] font-bold text-accent-foreground leading-tight"><TextField id="Footer_16">
              Cultivate Community,
            </TextField></h2>
            <div>
              <span
                className="font-display italic text-gradient-aura inline-block"
                style={{ fontSize: "clamp(2.4rem, 3.5vw, 3.8rem)", lineHeight: 1.2, paddingBottom: "0.15em" }}
              ><TextField id="Footer_17">
                Ignite Iman.
              </TextField></span>
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
          <p className="font-arabic text-xl md:text-2xl mb-2 leading-relaxed" style={{ color: "rgba(242,171,35,.80)" }} dir="rtl"><TextField id="Footer_18">
            وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا
          </TextField></p>
          <p className="font-display italic text-sm" style={{ color: "rgba(255,255,255,.45)" }}><TextField id="Footer_19">
            "And hold firmly to the rope of Allah, all together, and do not become divided." — </TextField><span style={{ color: "rgba(242,171,35,.55)" }}><TextField id="Footer_20">Quran 3:103</TextField></span>
          </p>
        </div>

        <details className="text-center text-sm mb-4"><summary>Privacy and analytics</summary>
          <p>We use aggregate Vercel traffic and speed measurements on public pages. We exclude management and counseling pages. Optional Google Analytics measures page visits and link clicks using a random browser identifier. We do not send form entries or contact details.</p>
          {import.meta.env.VITE_OPTIONAL_ANALYTICS==="true" && location.hostname==="msaatpitt.vercel.app" && <button onClick={()=>{
            const enabled=localStorage.getItem("msa-analytics")==="yes";
            localStorage.setItem("msa-analytics",enabled?"no":"yes");
            if(enabled){localStorage.removeItem("msa-visitor");sessionStorage.removeItem("msa-visit");sessionStorage.removeItem("msa-last");}
            location.reload();
          }}>{localStorage.getItem("msa-analytics")==="yes"?"Turn off optional analytics":"Allow optional analytics"}</button>}
        </details>
        {/* ── Copyright ── */}
        <p className="text-center font-body text-xs" style={{ color: "rgba(255,255,255,.22)" }}>
          © <TextField id="Footer_21">{copyrightYears}</TextField><TextField id="Footer_22"> Muslim Student Association at the University of Pittsburgh
        </TextField></p>
      </div>
    </footer>
  );
};

export default Footer;
