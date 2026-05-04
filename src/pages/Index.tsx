import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, Users, Moon, HandHeart, Calendar } from "lucide-react";
import { useMemo } from "react";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/lib/usePageMeta";
import SectionHeading from "@/components/SectionHeading";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import InstagramWidget from "@/components/InstagramWidget";
import KhatamOverlay from "@/components/KhatamOverlay";
import CrescentWatermark from "@/components/CrescentWatermark";
import BridgeBar from "@/components/BridgeBar";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import { useCountUp } from "@/hooks/useCountUp";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES, urlFor } from "@/lib/sanity";
import heroImg from "@/assets/hero-gathering.jpg";
import communityImg from "@/assets/about-community.jpg";
import patternImg from "@/assets/islamic-pattern.jpg";
import galleryKickoffImg from "@/assets/gallery-kickoff.jpg";
import galleryIftarImg from "@/assets/gallery-iftar.jpg";
import galleryTopgolfImg from "@/assets/gallery-topgolf.jpg";
import { mockEvents, getUpcomingWindow } from "@/data/events";
import { LINKS } from "@/config/links";

// ── Fallback content (shown while Sanity loads or if nothing published yet) ───
const FALLBACK = {
  heroHeadline: "A Home Away",
  heroSubheadline: "From Home.",
  heroEyebrow: "Muslim Student Association · University of Pittsburgh",
  heroTagline: "Cultivate Community, Ignite Iman.",
  heroBody: null,
  statEventsPerSemester: 50,
  statFoundedYear: 1997,
  statMemberCount: 400,
  communityHeadline: "More than a club.",
  communityBody: null,
  communityPillars: [
    { iconName: "Users", title: "Brotherhood & Sisterhood", description: "Lifelong bonds formed through dedicated brothers' and sisters' programming and shared everyday experiences." },
    { iconName: "Heart", title: "Community", description: "Iftars, socials, TopGolf, sports — we show up for each other on and off campus." },
  ],
  imanPillars: [
    { iconName: "Moon", title: "Faith", description: "Weekly Jummah, halaqas, and Ramadan programming — nurturing your tarbiyyah throughout college." },
    { iconName: "HandHeart", title: "Service & Da'wah", description: "Outreach, volunteering, and giving back to Pittsburgh — continuing to serve the Ummah beyond graduation." },
  ],
};

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Users, Heart, Moon, HandHeart,
};

function formatEventMonthDay(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return { month: d.toLocaleString("en-US", { month: "short" }), day: d.getDate() };
}

const StatItem = ({ value, numericValue, suffix, label, sub, bordered }: {
  value?: string; numericValue?: number; suffix?: string; label: string; sub: string; bordered?: boolean;
}) => {
  const { count, ref } = useCountUp(numericValue ?? 0, 1600);
  const display = value ?? (numericValue !== undefined ? `${count}${suffix ?? ""}` : "");
  return (
    <div ref={ref} className={`text-center px-2 md:px-5 py-3.5 md:py-3 flex flex-col items-center gap-0.5 ${bordered ? "border-r border-border/30" : ""}`}>
      <p className="eyebrow text-ink/50 dark:text-white/40 mb-0.5">{label}</p>
      <p className="font-mono font-bold text-gradient-gold leading-none text-2xl md:text-4xl lg:text-5xl pb-1">{display}</p>
      <p className="font-body text-muted-foreground text-[10px] leading-tight mt-0.5">{sub}</p>
    </div>
  );
};

const Index = () => {
  usePageMeta({
    title: "The MSA at Pitt — A Home Away From Home",
    description: "Connecting Muslim students at Pitt through faith, friendship, and service. Everyone is welcome.",
  });
  const prefersReduced = useReducedMotion();
  const yearsActive = new Date().getFullYear() - 1997;
  const { data: cms } = useSanityData<any>(QUERIES.homePage);
  const { events: remoteEvents, loading: eventsLoading, error: eventsError } = useCalendarEvents();
  const sourceEvents = eventsError ? mockEvents : remoteEvents;
  const upcomingScrollEvents = useMemo(() => getUpcomingWindow(sourceEvents, 15, 3), [sourceEvents]);

  // Merge CMS over fallback — if field exists in CMS use it, otherwise fallback
  const d = { ...FALLBACK, ...cms };

  const heroImageUrl = cms?.heroImage ? urlFor(cms.heroImage).width(1920).height(1080).auto("format").url() : heroImg;
  const communityImageUrl = cms?.communityImage ? urlFor(cms.communityImage).width(1280).height(854).auto("format").url() : communityImg;

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImageUrl} alt="MSA at Pitt community gathering" className="w-full h-full object-cover scale-110" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060B18]/90 via-[#0D1528]/55 to-[#14345A]/90" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "280px" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_45%,rgba(20,128,102,.22)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_60%,rgba(242,171,35,.1)_0%,transparent_50%)]" />
        </div>
        <BridgeBar />
        <CrescentWatermark color="#F2AB23" size={380} opacity={0.05} position="right" />
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-primary/12 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-72 h-72 rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

        <motion.div className="relative z-10 text-center px-4 max-w-4xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} className="mb-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 w-52">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
            <p className="font-arabic text-2xl md:text-3xl text-primary/80 tracking-wide" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <div className="flex items-center gap-3 w-52">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="eyebrow text-msa-gold/90 mb-5">
            {d.heroEyebrow}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-accent-foreground leading-[1.0] mb-2 tracking-tight">
            {d.heroHeadline}
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.7 }} className="mb-5">
            <span className="font-script text-gradient-gold inline-block pb-2" style={{ fontSize: "clamp(3.4rem, 9.5vw, 7.5rem)", lineHeight: 1.15 }}>
              {d.heroSubheadline}
            </span>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="eyebrow text-msa-gold/65 mb-5">
            {d.heroTagline}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="font-dm-sans text-base md:text-lg text-accent-foreground/60 max-w-xl mx-auto mb-10 leading-[1.75]">
            {d.heroBody ? (
              <PortableTextRenderer value={d.heroBody} />
            ) : (
              <p>Connecting Muslim students at Pitt through faith, friendship, and service. Everyone is welcome — wherever you're starting from.</p>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/join" className="btn-premium text-base px-8 py-3.5">Join the MSA <ArrowRight size={16} /></Link>
            <Link to="/events" className="btn-premium-secondary text-base px-8 py-3.5">See Upcoming Events</Link>
          </motion.div>
        </motion.div>

        {!prefersReduced && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="w-px h-12 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent animate-pulse mx-auto" />
          </motion.div>
        )}
      </section>

      {/* ── Stats ── */}
      <section className="relative z-20 px-4 md:px-8 -mt-14 mb-[-6.5rem] bg-transparent">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.6 }} className="liquid-glass-stats rounded-3xl max-w-3xl mx-3 sm:mx-auto p-4 md:p-6 grid grid-cols-3 items-stretch gap-0 ring-1 ring-white/15 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] overflow-hidden">
          <StatItem numericValue={d.statEventsPerSemester} suffix="+" label="Events per Semester" sub="halaqas, socials, speakers & more" bordered />
          <StatItem value={String(d.statFoundedYear)} label="Founded at Pitt" sub="community since day one" bordered />
          <StatItem numericValue={d.statMemberCount} suffix="+" label="Community Members" sub="and growing every year" />
        </motion.div>
      </section>

      {/* ── Community / Our Story ── */}
      <section className="section-padding pt-28 -mt-4 warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-khatam opacity-[0.6]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={prefersReduced ? false : { opacity: 0, x: -24 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-secondary/15 to-primary/20 rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-sm" />
              <div className="relative liquid-glass p-3">
                <img src={communityImageUrl} alt="MSA students on campus" className="rounded-xl w-full object-cover aspect-[4/3]" loading="lazy" width={1280} height={854} />
              </div>
            </motion.div>
            <motion.div initial={prefersReduced ? false : { opacity: 0, x: 24 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.15 }}>
              <p className="eyebrow text-jannah-mid dark:text-msa-gold/70 mb-4">Our Story</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">{d.communityHeadline}</h2>
              {d.communityBody ? (
                <PortableTextRenderer value={d.communityBody} className="mb-6" />
              ) : (
                <>
                  <p className="font-dm-sans text-muted-foreground text-base leading-[1.8] mb-4">MSA at Pitt is one of the largest and most vibrant student organizations at the University of Pittsburgh. We're a community rooted in Islamic values, cultivating a transformative space for Muslim students — and open to absolutely everyone.</p>
                  <p className="font-dm-sans text-muted-foreground text-base leading-[1.8] mb-6">Whether you've been Muslim your whole life, just took your shahada, or you're simply curious — knowledge precedes action, and every journey starts somewhere.</p>
                </>
              )}
              <div className="pull-quote-gold mb-7">
                <ArabicVerse arabic="وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" translation="And cooperate in righteousness and piety." reference="Quran 5:2" className="text-left py-0" compact />
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-jannah-mid dark:text-msa-gold font-semibold hover:gap-3 transition-all duration-200 text-base">
                Learn more about us <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Events ── */}
      <section className="section-padding warm-surface-deep relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 texture-dots" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="What's coming up" subtitle="Stay connected and never miss a moment." />
          {eventsError && (
            <div className="mb-4 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground/80">
              Showing our curated event schedule. Live sync will resume automatically.
            </div>
          )}
          <div className="md:hidden flex flex-col gap-3">
            {eventsLoading && !eventsError ? (
              <div className="glass-card p-6 flex items-center justify-center min-h-[120px]">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : upcomingScrollEvents.slice(0, 3).map((event) => {
              const { month, day } = formatEventMonthDay(event.startDate);
              return (
                <div key={event.id} className="glass-card p-4 flex gap-4">
                  <div className="gold-gradient text-primary-foreground w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-semibold uppercase tracking-wide opacity-80">{month}</span>
                    <span className="font-display text-xl font-bold leading-none">{day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-base text-foreground leading-tight truncate">{event.title}</h3>
                    <p className="font-satoshi text-muted-foreground text-xs mt-0.5">{event.timeLabel}</p>
                    <p className="font-satoshi text-muted-foreground text-xs">📍 {event.location}</p>
                  </div>
                </div>
              );
            })}
            <Link to="/events" className="btn-premium w-full justify-center mt-1">View all events <ArrowRight size={14} /></Link>
            <div className="flex justify-center gap-5 mt-1">
              <a href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Calendar size={11} /> Google Calendar</a>
              <a href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Calendar size={11} /> Apple Calendar</a>
            </div>
          </div>
          <div className="hidden md:flex gap-4 items-stretch">
            <div className="flex-1 min-w-0" style={{ maskImage: "linear-gradient(to right, black 75%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 75%, transparent 100%)" }}>
              <div className="overflow-x-auto pb-3 h-full" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(242,171,35,.25) transparent" }}>
                <div className="flex gap-4 min-w-max pr-2">
                  {eventsLoading && !eventsError ? (
                    <div className="w-72 glass-card p-6 flex flex-col items-center justify-center min-h-[220px]">
                      <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
                      <p className="text-muted-foreground text-sm">Loading…</p>
                    </div>
                  ) : upcomingScrollEvents.length === 0 ? (
                    <div className="w-72 glass-card p-6 flex flex-col items-center justify-center min-h-[220px] text-center">
                      <p className="font-display font-semibold text-xl text-foreground mb-2">No upcoming events yet</p>
                      <p className="text-muted-foreground text-sm">New events are added regularly. Check back soon.</p>
                    </div>
                  ) : upcomingScrollEvents.map((event) => {
                    const { month, day } = formatEventMonthDay(event.startDate);
                    return (
                      <div key={event.id} className="w-72 flex-shrink-0 glass-card p-6 flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="gold-gradient text-primary-foreground w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">{month}</span>
                            <span className="font-display text-2xl font-bold leading-none">{day}</span>
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-lg text-foreground leading-tight">{event.title}</h3>
                            <p className="font-satoshi text-muted-foreground text-sm mt-0.5">{event.timeLabel}</p>
                          </div>
                        </div>
                        <p className="font-satoshi text-muted-foreground text-sm mb-1.5">📍 {event.location}</p>
                        <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-5 flex-1">{event.shortBlurb}</p>
                        <a href={LINKS.eventSignupHub} target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-5 py-2 self-start">RSVP <ArrowRight size={13} /></a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="w-52 md:w-60 flex-shrink-0 liquid-glass-hover flex flex-col items-center justify-center p-5 md:p-6 text-center group min-h-[220px] rounded-[var(--radius)]">
              <p className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">See all events</p>
              <p className="font-dm-sans text-muted-foreground text-xs mb-4 leading-relaxed">Halaqas, speakers, sisters' events, and more.</p>
              <Link to="/events" className="btn-premium text-sm px-4 py-2 mb-3 w-full justify-center">View All <ArrowRight size={13} /></Link>
              <div className="flex gap-3">
                <a href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Calendar size={11} /> Google</a>
                <span className="text-border">·</span>
                <a href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Calendar size={11} /> Apple</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Gallery Preview ── */}
      <section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm pointer-events-none" />
        <div className="absolute inset-0 texture-dots opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <SectionHeading title="Moments from MSA" label="Our Gallery" />
            <Link to="/gallery" className="btn-premium-secondary text-sm px-5 py-2.5 self-start sm:self-auto flex-shrink-0">Browse Gallery <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" style={{ height: "clamp(280px, 40vw, 460px)" }}>
            <motion.div className="col-span-1 md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer" initial={prefersReduced ? false : { opacity: 0, scale: 0.97 }} whileInView={prefersReduced ? undefined : { opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <img src={galleryKickoffImg} alt="MSA Fall Kickoff" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-white font-bold text-xl leading-tight drop-shadow-md">Fall Kickoff 2025</p>
            </motion.div>
            <div className="col-span-1 grid grid-rows-2 gap-3 md:gap-4">
              <motion.div className="relative rounded-2xl overflow-hidden group cursor-pointer" initial={prefersReduced ? false : { opacity: 0, x: 16 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.1 }}>
                <img src={galleryIftarImg} alt="Ramadan Iftar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 font-display text-white font-semibold text-sm drop-shadow-md">Ramadan Iftar</p>
              </motion.div>
              <motion.div className="relative rounded-2xl overflow-hidden group cursor-pointer" initial={prefersReduced ? false : { opacity: 0, x: 16 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.18 }}>
                <img src={galleryTopgolfImg} alt="MSA TopGolf Night" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 font-display text-white font-semibold text-sm drop-shadow-md">TopGolf Night</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Pillars ── */}
      <section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-khatam opacity-[0.55]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="What drives us" label="Our Pillars" />
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {[
              { pillars: d.communityPillars, label: "Cultivate Community.", gradient: "text-gradient-gold" },
              { pillars: d.imanPillars, label: "Ignite Iman.", gradient: "text-gradient-aura" },
            ].map(({ pillars, label, gradient }) => (
              <motion.div key={label} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}>
                <p className={`font-display italic ${gradient} inline-block pb-1 text-xl mb-6 tracking-wide`}>{label}</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {pillars.map((pillar: any) => {
                    const Icon = ICON_MAP[pillar.iconName] ?? Users;
                    return (
                      <motion.div key={pillar.title} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="glass-card-hover p-6 md:p-8">
                        <div className="gold-gradient w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                          <Icon className="text-primary-foreground" size={20} />
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">{pillar.title}</h3>
                        <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── CTA ── */}
      <section className="section-padding gradient-section-gold-soft relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 texture-dots" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(242,171,35,.08)_0%,transparent_60%)]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="eyebrow text-jannah-mid dark:text-msa-gold/70 mb-4">Get Involved</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">Ready to find</h2>
            <div className="my-1 py-2 -mx-8 overflow-visible">
              <span className="font-script text-gradient-gold inline-block" style={{ fontSize: "clamp(3.2rem, 9vw, 6rem)", lineHeight: 1.25, paddingLeft: "0.3em", paddingRight: "0.4em", paddingBottom: "0.1em" }}>your people?</span>
            </div>
            <p className="font-dm-sans text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 leading-[1.8] mt-3">Join hundreds of students cultivating community and igniting iman at Pitt. Whatever stage of the journey you're on — there's a place for you here.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link to="/join" className="btn-premium text-base px-8 py-3.5">Get Started <ArrowRight size={16} /></Link>
            </div>
            <div className="flex justify-center"><InstagramWidget /></div>
          </motion.div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="grain relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 abyss-surface" />
        <BridgeBar />
        <KhatamOverlay variant="gold" size={60} opacity={0.28} />
        <CrescentWatermark color="#C9A84C" size={320} opacity={0.06} position="right" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[#11233C]/35 blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative group flex justify-center md:justify-start">
              <div className="absolute -inset-6 rounded-full bg-[#11233C]/40 blur-3xl group-hover:bg-[#14345A]/50 transition-all duration-700 pointer-events-none" />
              <img src="/msa-logo-white.png" alt="MSA at Pitt logo" className="relative w-48 md:w-64 mix-blend-screen" width={256} height={256} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
              <p className="eyebrow mb-4" style={{ color: "#C9A84C", opacity: 0.55 }}>Muslim Student Association</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-accent-foreground mb-2 leading-tight">Cultivate Community,</h2>
              <div className="mb-5">
                <span className="font-display italic text-gradient-aura inline-block" style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", lineHeight: 1.15, paddingBottom: "0.1em" }}>Ignite Iman.</span>
              </div>
              <p className="font-dm-sans text-accent-foreground/45 text-base leading-[1.8] mb-8">Over {yearsActive} years of faith, friendship, and service at the University of Pittsburgh — and we're just getting started.</p>
              <div className="border-l-2 pl-5" style={{ borderColor: "rgba(242,171,35,.25)" }}>
                <ArabicVerse arabic="إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ" translation="The believers are but brothers." reference="Quran 49:10" className="text-left py-0" compact />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
