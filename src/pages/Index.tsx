import { campusPrayerPhoto, communityPhoto, pillarPhotos } from "@/data/communityPhotos";
import { nextGathering } from "@/lib/nextGathering";
import { HeroPhotos, Moments } from "@/design/CommunityPhotos";
import { WelcomePath,NextEvent } from "@/design/Welcome";
import { DailyPrayers } from "@/design/DailyPrayers";
import { LinkField } from "@/editor/content";
import { TextField, Picture, ContentScope, itemIdentity, CardCopies } from "@/editor/content";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, Users, Moon, HandHeart, Calendar, Instagram, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import InstagramWidget from "@/components/InstagramWidget";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/lib/usePageMeta";
import SectionHeading from "@/components/SectionHeading";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import SanityImage from "@/components/SanityImage";
import PartnerLogos from "@/components/PartnerLogos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCountUp } from "@/hooks/useCountUp";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";
import patternImg from "@/assets/geometric-tile.svg";
import { getUpcomingWindow } from "@/data/events";
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

const ICON_MAP: Record<string, LucideIcon> = {
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
  shots?: {src:string;caption?:string}[];
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
  const { data: galleryPreview } = useSanityData<SanityGalleryAlbum[]>(QUERIES.communityRecaps);
  const { events: remoteEvents, loading: eventsLoading, error: eventsError } = useCalendarEvents();
  const sourceEvents = remoteEvents;
  const featuredOnPhone = nextGathering(remoteEvents);
  const upcomingScrollEvents = useMemo(() => getUpcomingWindow(sourceEvents, 15, 3), [sourceEvents]);

  // Merge CMS over fallback — only include Sanity values that aren't null/undefined
  const d = { ...FALLBACK, ...Object.fromEntries(Object.entries(cms ?? {}).filter(([, v]) => v != null)) };

  const phone = useIsMobile();
  const animateIntro = !phone && !prefersReduced;

  const storySection = (<section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />

        <div className="site-container relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={prefersReduced ? false : { opacity: 0, x: -24 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-br from-primary/30 via-secondary/15 to-primary/20 opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-sm" style={{ borderRadius: '22px' }} />
              <div className="relative liquid-glass p-3" style={{ borderRadius: '20px' }}>
                <ContentScope id="Index_18"><SanityImage
                  source={cms?.communityImage}
                  fallbackSrc={communityPhoto("gala-portraits").src}
                sizes="(max-width: 767px) 92vw, 570px"
                  width={1280}
                  height={854}
                  alt="MSA students gathered together"
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
      </section>);
  const eventsSection = (<section className="section-padding warm-surface-deep relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 texture-dots" />
        <div className="site-container relative z-10">
          <ContentScope id="Index_26"><SectionHeading title="What's coming up" subtitle="Stay connected and never miss a moment." /></ContentScope>
          <NextEvent event={featuredOnPhone} />
          {eventsError && sourceEvents.length === 0 && (
            <div className="mb-4 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground/80"><TextField id="Index_27">
              Events are taking a moment to load. Check </TextField><a href={LINKS.instagram}>@msa.at.pitt</a><TextField id="Index_events_status_suffix"> on Instagram for this week.
            </TextField></div>
          )}
          <div className="md:hidden flex flex-col gap-3">
            {eventsLoading && !eventsError && upcomingScrollEvents.length === 0 ? (
              <div className="glass-card p-6 flex items-center justify-center min-h-[120px]">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : upcomingScrollEvents.filter(event => event.id !== featuredOnPhone?.id).slice(0, 3).map((event) => {
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
      </section>);
  return (
    <Layout>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section data-photo-hero className="home-hero relative flex items-center justify-center overflow-hidden">
        <motion.div className="hero-words relative z-10 text-center px-4 max-w-4xl mx-auto" initial={animateIntro && { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <motion.div initial={animateIntro && { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: "easeOut" }} className="mb-8 flex flex-col items-center gap-3">
            <p className="font-arabic text-2xl md:text-3xl text-primary/80 tracking-wide" dir="rtl"><TextField id="Index_6">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</TextField></p>
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
          <motion.div initial={animateIntro && { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hero-intro hidden md:block font-dm-sans text-base md:text-lg text-accent-foreground/60 max-w-xl mx-auto mb-10 leading-[1.75]">
            {d.heroBody
              ? <ContentScope id="Index_11"><PortableTextRenderer value={d.heroBody} /></ContentScope>
              : <p><TextField id="Index_12">Connecting Muslim students at Pitt through faith, friendship, and service. Everyone is welcome — wherever you're starting from.</TextField></p>}
          </motion.div>
          <motion.div initial={animateIntro && { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hero-actions flex flex-col sm:flex-row justify-center">
            <Link to="/join" className="btn-premium text-base"><TextField id="Index_13">Join the MSA </TextField><ArrowRight size={16} /></Link>
            <Link to="/events" className="btn-premium-secondary text-base"><TextField id="Index_14">See Upcoming Events</TextField></Link>
          </motion.div>
        </motion.div>

        <HeroPhotos/>
      </section>

      {/* ── Stats — overlaps slightly into the warm section below ── */}
      <section className="home-stats relative z-20">
        <motion.div className="glass rounded-3xl max-w-3xl mx-auto grid grid-cols-3 items-stretch overflow-hidden">
          <ContentScope id="Index_15"><StatItem numericValue={d.statEventsPerSemester} suffix="+" label="Events per Semester" sub="halaqas, socials, speakers & more" bordered /></ContentScope>
          <ContentScope id="Index_16"><StatItem value={String(d.statFoundedYear)} label="Founded at Pitt" sub="community since day one" bordered /></ContentScope>
          <ContentScope id="Index_17"><StatItem numericValue={d.statMemberCount} suffix="+" label="Community Members" sub="and growing every year" /></ContentScope>
        </motion.div>
      </section>

      {eventsSection}
      <SectionDivider />
      {storySection}
      <Moments albums={galleryPreview ?? []} />

      <SectionDivider />

      {/* ── Subscribe-to-calendar moment ── */}
      <section className="section-padding relative overflow-hidden">
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

      <div className="home-prayer">
        <figure>
          <Picture fieldId="campus-prayer-photo" src={campusPrayerPhoto.src}
            alt={campusPrayerPhoto.title} width={720} height={480} loading="lazy" decoding="async"
            sizes="(width < 768px) 90vw, 400px" />
        </figure>
        <DailyPrayers />
      </div>

      <SectionDivider />

      {/* ── Pillars ─────────────────────────────────────────────── */}
      <section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />

        <div className="site-container relative z-10">
          <ContentScope id="Index_68"><SectionHeading title="What drives us" label="Our Pillars" /></ContentScope>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {[
              { pillars: d.communityPillars, label: "Cultivate Community.", gradient: "text-gradient-gold" },
              { pillars: d.imanPillars, label: "Ignite Iman.", gradient: "text-gradient-aura" },
            ].map(({ pillars, label, gradient }) => (
              <ContentScope key={label} id={"Index_69-" + label}><motion.div key={label} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}>
                <p className={`font-display italic ${gradient} inline-block pb-1 text-xl mb-6 tracking-wide`}><TextField id="Index_70">{label}</TextField></p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {pillars.map((pillar: any, i:number) => {
                    const Icon = ICON_MAP[pillar.iconName] ?? Users;
                    return (
                      <CardCopies key={pillar.title} id={"Index_71-" + itemIdentity(pillar, pillar.title)}><motion.div key={pillar.title} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="glass-card-hover p-6 md:p-8">
                        <Picture fieldId="pillar-photo" src={communityPhoto(pillarPhotos[pillars === d.imanPillars ? "iman" : "community"][Math.min(i, 1)]).src} alt="" className="community-card-photo" loading="lazy" width={460} height={250}/>
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
      <WelcomePath/>

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
