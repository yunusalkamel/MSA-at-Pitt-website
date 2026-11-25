import { LinkField } from "@/editor/content";
import { TextField, Picture, ContentScope, itemIdentity, CardCopies } from "@/editor/content";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, Users, Moon, HandHeart, Calendar, Instagram } from "lucide-react";
import { useMemo } from "react";
import InstagramWidget from "@/components/InstagramWidget";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/lib/usePageMeta";
import SectionHeading from "@/components/SectionHeading";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import KhatamOverlay from "@/components/KhatamOverlay";
import BridgeBar from "@/components/BridgeBar";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import SanityImage from "@/components/SanityImage";
import PartnerLogos from "@/components/PartnerLogos";
import TodayNextEvent from "@/components/TodayNextEvent";
import { useCountUp } from "@/hooks/useCountUp";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES, urlFor } from "@/lib/sanity";
import heroImg from "@/assets/hero-gathering-1600.webp";
import heroMobileImg from "@/assets/hero-gathering-768.webp";
import communityImg from "@/assets/about-community-1024.webp";
import communityMobileImg from "@/assets/about-community-640.webp";
import patternImg from "@/assets/islamic-pattern-360.webp";
import { mockEvents, getUpcomingWindow } from "@/data/events";
import { LINKS } from "@/config/links";
import { getEventTier } from "@/components/events/calendar-utils";

// ── Fallback content ─────────────────────────────────────────────
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

function dateBadgeClass(event: { isSignature?: boolean; featured?: boolean; categories: string[] }): string {
  const tier = getEventTier(event as Parameters<typeof getEventTier>[0]);
  if (tier === "signature") return "gold-gradient text-primary-foreground";
  if (tier === "recurring") return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
  return "bg-jannah-mid/20 text-jannah-mid dark:text-jannah-light";
}

const StatItem = ({ value, numericValue, suffix, label, sub, bordered }: {
  value?: string; numericValue?: number; suffix?: string; label: string; sub: string; bordered?: boolean;
}) => {
  const { count, ref } = useCountUp(numericValue ?? 0, 1600);
  const display = value ?? (numericValue !== undefined ? `${count}${suffix ?? ""}` : "");
  return (
    <div ref={ref} className={`text-center px-2 md:px-5 py-3.5 md:py-3 flex flex-col items-center gap-0.5 ${bordered ? "border-r border-border/30" : ""}`}>
      <p className="eyebrow text-ink/50 dark:text-white/40 mb-0.5"><TextField id="Index_1">{label}</TextField></p>
      <p className="font-mono font-bold text-gradient-gold leading-none text-2xl md:text-4xl lg:text-5xl pb-1"><TextField id="Index_2">{display}</TextField></p>
      <p className="font-body text-muted-foreground text-[10px] leading-tight mt-0.5"><TextField id="Index_3">{sub}</TextField></p>
    </div>
  );
};

interface SanityGalleryAlbum {
  title: string;
  slug: string;
  coverImage?: { asset?: { _ref?: string }; lqip?: string };
  eventDate?: string;
}

const Index = () => {
  usePageMeta({
    title: "The MSA at Pitt — A Home Away From Home",
    description: "Connecting Muslim students at Pitt through faith, friendship, and service. Everyone is welcome.",
  });
  const prefersReduced = useReducedMotion();
  const yearsActive = new Date().getFullYear() - 1997;
  const { data: cms } = useSanityData<any>(QUERIES.homePage);
  const { data: galleryPreview } = useSanityData<SanityGalleryAlbum[]>(QUERIES.galleryAlbumsPreview);
  const { events: remoteEvents, loading: eventsLoading, error: eventsError } = useCalendarEvents();
  const sourceEvents = eventsError ? mockEvents : remoteEvents;
  const upcomingScrollEvents = useMemo(() => getUpcomingWindow(sourceEvents, 15, 3), [sourceEvents]);

  // Merge CMS over fallback — only include Sanity values that aren't null/undefined
  const d = { ...FALLBACK, ...Object.fromEntries(Object.entries(cms ?? {}).filter(([, v]) => v != null)) };

  const galleryCells = useMemo(() => {
    return (galleryPreview ?? []).slice(0, 6).map((album) => ({
      title: album.title,
      slug: album.slug as string | undefined,
      imageUrl: album.coverImage?.asset?._ref
        ? urlFor(album.coverImage).width(900).height(600).fit("crop").auto("format").url()
        : undefined,
      lqip: album.coverImage?.lqip as string | undefined,
    })).filter(c => c.imageUrl);
  }, [galleryPreview]);

  const heroSrc = cms?.heroImage?.asset?._ref
    ? urlFor(cms.heroImage).width(1920).height(1080).auto("format").url()
    : heroImg;
  const animateIntro = !prefersReduced && window.matchMedia("(min-width: 768px)").matches;
  const heroLqip = cms?.heroImage?.lqip as string | undefined;

  return (
    <Layout>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {/* Blur-up backdrop — kills the bundled-fallback flash */}
          {heroLqip && (
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${heroLqip})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: "scale(1.1)",
              }}
            />
          )}
          <Picture fieldId="Index_4"
            src={heroSrc}
            srcSet={heroSrc === heroImg ? `${heroMobileImg} 768w, ${heroImg} 1600w` : undefined}
            sizes="100vw"
            alt="MSA at Pitt community gathering"
            className="w-full h-full object-cover scale-110"
            width={1920}
            height={1080}
            loading="eager"
            // @ts-ignore — fetchpriority is valid HTML, React 18 accepts lowercase
            fetchpriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060B18]/90 via-[#0D1528]/55 to-[#14345A]/90" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "280px" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_45%,rgba(20,128,102,.22)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_60%,rgba(242,171,35,.1)_0%,transparent_50%)]" />
        </div>
        <BridgeBar />
        {/* Moon motif removed per spec */}
        <div className="hidden md:block absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-primary/12 blur-[140px] pointer-events-none" />
        <div className="hidden md:block absolute bottom-1/4 right-1/5 w-72 h-72 rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

        <motion.div className="relative z-10 text-center px-4 max-w-4xl mx-auto" initial={animateIntro && { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <motion.div initial={animateIntro && { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: "easeOut" }} className="mb-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 w-52">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
            <p className="font-arabic text-2xl md:text-3xl text-primary/80 tracking-wide" dir="rtl"><TextField id="Index_6">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</TextField></p>
            <div className="flex items-center gap-3 w-52">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
          </motion.div>
          <motion.p initial={animateIntro && { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="eyebrow text-msa-gold/90 mb-5">
            <TextField id="Index_7">{d.heroEyebrow}</TextField>
          </motion.p>
          {/* Display headline — extra horizontal padding prevents any descender clipping */}
          <motion.h1
            initial={animateIntro && { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-accent-foreground leading-[1.05] mb-2 tracking-tight px-2"
          >
            <TextField id="Index_8">{d.heroHeadline}</TextField>
          </motion.h1>
          <motion.div initial={animateIntro && { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-5 px-2">
            <span
              className="font-script text-gradient-gold inline-block pb-3"
              style={{ fontSize: "clamp(3.4rem, 9.5vw, 7.5rem)", lineHeight: 1.2 }}
            >
              <TextField id="Index_9">{d.heroSubheadline}</TextField>
            </span>
          </motion.div>
          <motion.p initial={animateIntro && { opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow text-msa-gold/65 mb-5">
            <TextField id="Index_10">{d.heroTagline}</TextField>
          </motion.p>
          <motion.div initial={animateIntro && { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-dm-sans text-base md:text-lg text-accent-foreground/60 max-w-xl mx-auto mb-10 leading-[1.75]">
            {d.heroBody ? (
              <ContentScope id="Index_11"><PortableTextRenderer value={d.heroBody} /></ContentScope>
            ) : (
              <p><TextField id="Index_12">Connecting Muslim students at Pitt through faith, friendship, and service. Everyone is welcome — wherever you're starting from.</TextField></p>
            )}
          </motion.div>
          <motion.div initial={animateIntro && { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/join" className="btn-premium text-base px-8 py-3.5"><TextField id="Index_13">Join the MSA </TextField><ArrowRight size={16} /></Link>
            <Link to="/events" className="btn-premium-secondary text-base px-8 py-3.5"><TextField id="Index_14">See Upcoming Events</TextField></Link>
          </motion.div>

          <TodayNextEvent />
        </motion.div>

        {/* Seamless fade into the section below — light uses a gold shimmer, dark fades to navy */}
        <div className="absolute bottom-0 left-0 right-0 h-[55vh] md:h-[70vh] pointer-events-none z-[5] dark:hidden" style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(242,171,35,0.06) 25%, rgba(242,171,35,0.22) 50%, rgba(251,240,208,0.75) 72%, rgba(248,243,234,0.96) 88%, #F8F3EA 100%)" }} aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] md:h-[65vh] pointer-events-none z-[5] hidden dark:block" style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(13,21,40,0.5) 45%, rgba(13,21,40,0.88) 72%, #0D1528 100%)" }} aria-hidden="true" />

        {animateIntro && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="w-px h-10 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent animate-pulse mx-auto" />
          </motion.div>
        )}
      </section>

      {/* ── Stats — overlaps slightly into the warm section below ── */}
      <section className="relative z-20 px-4 md:px-8 -mt-[4rem] mb-[-5rem] bg-transparent">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.6 }} className="liquid-glass-stats rounded-3xl max-w-3xl mx-3 sm:mx-auto p-4 md:p-6 grid grid-cols-3 items-stretch gap-0 overflow-hidden">
          <ContentScope id="Index_15"><StatItem numericValue={d.statEventsPerSemester} suffix="+" label="Events per Semester" sub="halaqas, socials, speakers & more" bordered /></ContentScope>
          <ContentScope id="Index_16"><StatItem value={String(d.statFoundedYear)} label="Founded at Pitt" sub="community since day one" bordered /></ContentScope>
          <ContentScope id="Index_17"><StatItem numericValue={d.statMemberCount} suffix="+" label="Community Members" sub="and growing every year" /></ContentScope>
        </motion.div>
      </section>

      {/* ── Community / Our Story ── */}
      <section className="section-padding pt-28 md:pt-32 warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-khatam opacity-[0.6]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={prefersReduced ? false : { opacity: 0, x: -24 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-br from-primary/30 via-secondary/15 to-primary/20 opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-sm" style={{ borderRadius: '22px' }} />
              <div className="relative liquid-glass p-3" style={{ borderRadius: '20px' }}>
                <ContentScope id="Index_18"><SanityImage
                  source={cms?.communityImage}
                  fallbackSrc={communityImg}
                fallbackSrcSet={`${communityMobileImg} 640w, ${communityImg} 1024w`}
                sizes="(max-width: 767px) 92vw, 570px"
                  width={1280}
                  height={854}
                  alt="MSA students on campus"
                  className="w-full aspect-[4/3] object-cover"
                  style={{ borderRadius: '20px' }}
                /></ContentScope>
              </div>
            </motion.div>
            <motion.div initial={prefersReduced ? false : { opacity: 0, x: 24 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.15 }}>
              <p className="eyebrow text-jannah-mid dark:text-msa-gold/70 mb-4"><TextField id="Index_19">Our Story</TextField></p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight"><TextField id="Index_20">{d.communityHeadline}</TextField></h2>
              {d.communityBody ? (
                <ContentScope id="Index_21"><PortableTextRenderer value={d.communityBody} className="mb-6" /></ContentScope>
              ) : (
                <>
                  <p className="font-dm-sans text-muted-foreground text-base leading-[1.8] mb-4"><TextField id="Index_22">MSA at Pitt is one of the largest and most vibrant student organizations at the University of Pittsburgh. We're a community rooted in Islamic values, cultivating a transformative space for Muslim students — and open to absolutely everyone.</TextField></p>
                  <p className="font-dm-sans text-muted-foreground text-base leading-[1.8] mb-6"><TextField id="Index_23">Whether you've been Muslim your whole life, just took your shahada, or you're simply curious — knowledge precedes action, and every journey starts somewhere.</TextField></p>
                </>
              )}
              <div className="pull-quote-gold mb-7">
                <ContentScope id="Index_24"><ArabicVerse arabic="وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" translation="And cooperate in righteousness and piety." reference="Quran 5:2" className="text-left py-0" compact /></ContentScope>
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-jannah-mid dark:text-msa-gold font-semibold hover:gap-3 transition-all duration-200 text-base"><TextField id="Index_25">
                Learn more about us </TextField><ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Events ──────────────────────────────────────────────── */}
      <section className="section-padding warm-surface-deep relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 texture-dots" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ContentScope id="Index_26"><SectionHeading title="What's coming up" subtitle="Stay connected and never miss a moment." /></ContentScope>
          {eventsError && (
            <div className="mb-4 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground/80"><TextField id="Index_27">
              Showing our curated event schedule. Live sync will resume automatically.
            </TextField></div>
          )}
          <div className="md:hidden flex flex-col gap-3">
            {eventsLoading && !eventsError && upcomingScrollEvents.length === 0 ? (
              <div className="glass-card p-6 flex items-center justify-center min-h-[120px]">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : upcomingScrollEvents.slice(0, 3).map((event) => {
              const { month, day } = formatEventMonthDay(event.startDate);
              return (
                <ContentScope key={event.id} id={"Index_28-" + itemIdentity(event, event.id)}><div key={event.id} className="glass-card p-4 flex gap-4">
                  <div className={`${dateBadgeClass(event)} w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0`}>
                    <span className="text-[9px] font-semibold uppercase tracking-wide opacity-80"><TextField id="Index_29">{month}</TextField></span>
                    <span className="font-display text-xl font-bold leading-none"><TextField id="Index_30">{day}</TextField></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-base text-foreground leading-tight truncate"><TextField id="Index_31">{event.title}</TextField></h3>
                    <p className="font-satoshi text-muted-foreground text-xs mt-0.5"><TextField id="Index_32">{event.timeLabel}</TextField></p>
                    <p className="font-satoshi text-muted-foreground text-xs">📍 <TextField id="Index_33">{event.location}</TextField></p>
                  </div>
                </div></ContentScope>
              );
            })}
            <Link to="/events" className="btn-premium w-full justify-center mt-1"><TextField id="Index_34">View all events </TextField><ArrowRight size={14} /></Link>
            <div className="flex justify-center gap-5 mt-1">
              <LinkField fieldId="Index_destination_1" href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Calendar size={11} /><TextField id="Index_35"> Google Calendar</TextField></LinkField>
              <LinkField fieldId="Index_destination_2" href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Calendar size={11} /><TextField id="Index_36"> Apple Calendar</TextField></LinkField>
            </div>
          </div>
          <div className="hidden md:flex gap-4 items-stretch">
            <div className="flex-1 min-w-0" style={{ maskImage: "linear-gradient(to right, black 75%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 75%, transparent 100%)" }}>
              <div className="overflow-x-auto pb-3 h-full" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(242,171,35,.25) transparent" }}>
                <div className="flex gap-4 min-w-max pr-2">
                  {eventsLoading && !eventsError && upcomingScrollEvents.length === 0 ? (
                    <div className="w-72 glass-card p-6 flex flex-col items-center justify-center min-h-[220px]">
                      <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
                      <p className="text-muted-foreground text-sm"><TextField id="Index_37">Loading…</TextField></p>
                    </div>
                  ) : upcomingScrollEvents.length === 0 ? (
                    <div className="w-72 glass-card p-6 flex flex-col items-center justify-center min-h-[220px] text-center">
                      <p className="font-display font-semibold text-xl text-foreground mb-2"><TextField id="Index_38">No upcoming events yet</TextField></p>
                      <p className="text-muted-foreground text-sm"><TextField id="Index_39">New events are added regularly. Check back soon.</TextField></p>
                    </div>
                  ) : upcomingScrollEvents.map((event) => {
                    const { month, day } = formatEventMonthDay(event.startDate);
                    return (
                      <ContentScope key={event.id} id={"Index_40-" + itemIdentity(event, event.id)}><div key={event.id} className="w-72 flex-shrink-0 glass-card p-6 flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`${dateBadgeClass(event)} w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-md`}>
                            <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide"><TextField id="Index_41">{month}</TextField></span>
                            <span className="font-display text-2xl font-bold leading-none"><TextField id="Index_42">{day}</TextField></span>
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-lg text-foreground leading-tight"><TextField id="Index_43">{event.title}</TextField></h3>
                            <p className="font-satoshi text-muted-foreground text-sm mt-0.5"><TextField id="Index_44">{event.timeLabel}</TextField></p>
                          </div>
                        </div>
                        <p className="font-satoshi text-muted-foreground text-sm mb-1.5">📍 <TextField id="Index_45">{event.location}</TextField></p>
                        <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-5 flex-1"><TextField id="Index_46">{event.shortBlurb}</TextField></p>
                        <LinkField fieldId="Index_destination_3" href={event.rsvpUrl || LINKS.eventSignupHub} target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-5 py-2 self-start"><TextField id="Index_47">RSVP </TextField><ArrowRight size={13} /></LinkField>
                      </div></ContentScope>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="w-52 md:w-60 flex-shrink-0 liquid-glass-hover flex flex-col items-center justify-center p-5 md:p-6 text-center group min-h-[220px] rounded-[var(--radius)]">
              <p className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors"><TextField id="Index_48">See all events</TextField></p>
              <p className="font-dm-sans text-muted-foreground text-xs mb-4 leading-relaxed"><TextField id="Index_49">Halaqas, speakers, sisters' events, and more.</TextField></p>
              <Link to="/events" className="btn-premium text-sm px-4 py-2 mb-3 w-full justify-center"><TextField id="Index_50">View All </TextField><ArrowRight size={13} /></Link>
              <div className="flex gap-3">
                <LinkField fieldId="Index_destination_4" href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Calendar size={11} /><TextField id="Index_51"> Google</TextField></LinkField>
                <span className="text-border">·</span>
                <LinkField fieldId="Index_destination_5" href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><Calendar size={11} /><TextField id="Index_52"> Apple</TextField></LinkField>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Subscribe-to-calendar moment ── */}
      <section className="py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-section-emerald-soft" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-10 text-center ring-1 ring-jannah-mid/20 shadow-[0_4px_40px_rgba(20,128,102,0.12)]">
            <p className="eyebrow text-jannah-mid dark:text-msa-gold/70 mb-3"><TextField id="Index_53">Never miss an event</TextField></p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3"><TextField id="Index_54">
              Subscribe once. </TextField><span className="text-gradient-gold italic"><TextField id="Index_55">Stay in sync forever.</TextField></span>
            </h2>
            <p className="font-dm-sans text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto mb-7"><TextField id="Index_56">
              Every halaqah, Jummah, social, and iftar — synced straight to your calendar automatically.
            </TextField></p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <LinkField fieldId="Index_destination_6" href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="btn-premium text-sm md:text-base px-7 py-3.5 w-full sm:w-auto justify-center">
                <Calendar size={15} /><TextField id="Index_57"> Add to Google Calendar
              </TextField></LinkField>
              <LinkField fieldId="Index_destination_7" href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm md:text-base px-7 py-3.5 w-full sm:w-auto justify-center">
                <Calendar size={15} /><TextField id="Index_58"> Add to Apple Calendar
              </TextField></LinkField>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Gallery Preview — wired to Sanity albums ───────────── */}
      {(galleryPreview ?? []).length > 0 && (
        <section className="py-10 md:py-14 warm-surface relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh-warm pointer-events-none" />
          <div className="absolute inset-0 texture-dots opacity-40 pointer-events-none" />
          <div className="relative z-10">
            {/* Header row — constrained, button inline with text */}
            <div className="px-4 md:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <p className="eyebrow text-jannah-mid dark:text-msa-gold/70 mb-1"><TextField id="Index_59">Our Gallery</TextField></p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight"><TextField id="Index_60">Moments from MSA</TextField></h2>
              </div>
              <Link to="/gallery" className="btn-premium-secondary text-sm px-5 py-2.5 self-start sm:self-auto flex-shrink-0"><TextField id="Index_61">
                Browse Gallery </TextField><ArrowRight size={14} />
              </Link>
            </div>

            {/* Horizontal scroll strip — no overflow clipping */}
            <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
              <div className="flex gap-3 px-4 md:px-6 min-w-max">
                {galleryCells.filter(c => c.imageUrl).map((cell, i) => {
                  const Card = (
                    <motion.div
                      className="relative rounded-2xl overflow-hidden group cursor-pointer flex-shrink-0"
                      style={{ width: "clamp(220px, 30vw, 340px)", height: "clamp(150px, 20vw, 230px)", ...(cell.lqip ? { backgroundImage: `url(${cell.lqip})`, backgroundSize: "cover", backgroundPosition: "center" } : {}) }}
                      initial={prefersReduced ? false : { opacity: 0, x: 16 }}
                      whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: i * 0.08 }}
                    >
                      {cell.imageUrl && (
                        <Picture fieldId="Index_62"
                          src={cell.imageUrl}
                          alt={cell.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          sizes="(max-width: 767px) 72vw, 390px"
                          width={900}
                          height={600}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <p className="absolute bottom-3 left-3 right-3 font-display text-white font-semibold text-sm drop-shadow-md leading-tight"><TextField id="Index_63">{cell.title}</TextField></p>
                    </motion.div>
                  );
                  return cell.slug
                    ? <ContentScope key={cell.slug} id={"Index_64-" + itemIdentity(cell, cell.slug)}><Link key={cell.slug} to={`/gallery/${cell.slug}`}><TextField id="Index_65">{Card}</TextField></Link></ContentScope>
                    : <ContentScope key={cell.title + i} id={"Index_66-" + itemIdentity(cell, cell.title + i)}><div key={cell.title + i}><TextField id="Index_67">{Card}</TextField></div></ContentScope>;
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ── Pillars ─────────────────────────────────────────────── */}
      <section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-khatam opacity-[0.55]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ContentScope id="Index_68"><SectionHeading title="What drives us" label="Our Pillars" /></ContentScope>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {[
              { pillars: d.communityPillars, label: "Cultivate Community.", gradient: "text-gradient-gold" },
              { pillars: d.imanPillars, label: "Ignite Iman.", gradient: "text-gradient-aura" },
            ].map(({ pillars, label, gradient }) => (
              <ContentScope key={label} id={"Index_69-" + label}><motion.div key={label} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}>
                <p className={`font-display italic ${gradient} inline-block pb-1 text-xl mb-6 tracking-wide`}><TextField id="Index_70">{label}</TextField></p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {pillars.map((pillar: any) => {
                    const Icon = ICON_MAP[pillar.iconName] ?? Users;
                    return (
                      <CardCopies key={pillar.title} id={"Index_71-" + itemIdentity(pillar, pillar.title)}><motion.div key={pillar.title} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="glass-card-hover p-6 md:p-8">
                        <div className="gold-gradient w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                          <Icon className="text-primary-foreground" size={20} />
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight"><TextField id="Index_72">{pillar.title}</TextField></h3>
                        <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed"><TextField id="Index_73">{pillar.description}</TextField></p>
                      </motion.div></CardCopies>
                    );
                  })}
                </div>
              </motion.div></ContentScope>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Partner logos — credibility surface ────────────────── */}
      <PartnerLogos />

      <SectionDivider />

      {/* ── CTA — Ready to find your people? ───────────────────── */}
      <section className="section-padding gradient-section-gold-soft relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 texture-dots" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(242,171,35,.08)_0%,transparent_60%)]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="eyebrow text-jannah-mid dark:text-msa-gold/70 mb-4"><TextField id="Index_74">Get Involved</TextField></p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight"><TextField id="Index_75">Ready to find</TextField></h2>
            <div className="my-1 py-4 px-6 -mx-8 overflow-visible">
              <span className="font-script text-gradient-gold inline-block" style={{ fontSize: "clamp(3.2rem, 9vw, 6rem)", lineHeight: 1.3, paddingLeft: "0.3em", paddingRight: "0.4em", paddingBottom: "0.15em" }}><TextField id="Index_76">your people?</TextField></span>
            </div>
            <p className="font-dm-sans text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 leading-[1.8] mt-3"><TextField id="Index_77">Join hundreds of students cultivating community and igniting iman at Pitt. Whatever stage of the journey you're on — there's a place for you here.</TextField></p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link to="/join" className="btn-premium text-base px-8 py-3.5"><TextField id="Index_78">Get Started </TextField><ArrowRight size={16} /></Link>
              <LinkField fieldId="Index_destination_8" href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-base px-8 py-3.5">
                <Instagram size={15} /><TextField id="Index_79"> Follow on Instagram
              </TextField></LinkField>
            </div>
            <div className="flex justify-center"><InstagramWidget /></div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
