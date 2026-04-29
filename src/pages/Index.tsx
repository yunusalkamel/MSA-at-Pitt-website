import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Heart, Users, Moon, HandHeart, Calendar } from "lucide-react";
import { useMemo, useRef } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import InstagramWidget from "@/components/InstagramWidget";
import KhatamOverlay from "@/components/KhatamOverlay";
import CrescentWatermark from "@/components/CrescentWatermark";
import BridgeBar from "@/components/BridgeBar";
import { useCountUp } from "@/hooks/useCountUp";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import heroImg from "@/assets/hero-gathering.jpg";
import communityImg from "@/assets/about-community.jpg";
import patternImg from "@/assets/islamic-pattern.jpg";

import {
  mockEvents,
  getUpcomingEvents,
  EVENT_SIGNUP_HUB_URL,
  GOOGLE_CALENDAR_URL,
  APPLE_CALENDAR_URL,
  type MSAEvent,
} from "@/data/events";

const pillars = [
  { icon: Moon, title: "Faith", desc: "Weekly Jummah, halaqas, and Ramadan programming — nurturing your tarbiyyah throughout college." },
  { icon: Users, title: "Brotherhood & Sisterhood", desc: "Lifelong bonds formed through dedicated brothers' and sisters' programming and shared everyday experiences." },
  { icon: Heart, title: "Community", desc: "Iftars, socials, TopGolf, sports — we show up for each other on and off campus." },
  { icon: HandHeart, title: "Service & Da'wah", desc: "Outreach, volunteering, and giving back to Pittsburgh — continuing to serve the Ummah beyond graduation." },
];

const HOMEPAGE_PREVIEW_LIMIT = 2;

function isOnOrAfterToday(event: MSAEvent) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(`${event.startDate}T12:00:00`);
  return eventDate >= today;
}

function formatEventMonthDay(dateStr: string) {
  const eventDate = new Date(`${dateStr}T12:00:00`);
  return {
    month: eventDate.toLocaleString("en-US", { month: "short" }),
    day: eventDate.getDate(),
  };
}

function useSectionParallax(ref: React.RefObject<HTMLElement | null>, amount = 14) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return useTransform(scrollYProgress, [0, 1], [`-${amount}px`, `${amount}px`]);
}

// Subtle ornament that sits ON the natural boundary between two sections — zero layout height
const SectionDivider = ({ className = "" }: { className?: string }) => (
  <div className={`relative h-0 z-20 ${className}`}>
    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
      <div className="w-44 md:w-96 h-[3px] bg-gradient-to-r from-transparent to-primary/20" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/30 flex-shrink-0" />
      <span className="w-2 h-2 rounded-full bg-primary/45 flex-shrink-0" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/30 flex-shrink-0" />
      <div className="w-44 md:w-96 h-[3px] bg-gradient-to-l from-transparent to-primary/20" />
    </div>
  </div>
);

// Animated stat with count-up
const StatItem = ({
  value,
  numericValue,
  suffix,
  label,
  sub,
  bordered,
}: {
  value?: string;
  numericValue?: number;
  suffix?: string;
  label: string;
  sub: string;
  bordered?: boolean;
}) => {
  const { count, ref } = useCountUp(numericValue ?? 0, 1600);
  const display = value ?? (numericValue !== undefined ? `${count}${suffix ?? ""}` : "");

  return (
    <div ref={ref} className={`text-center px-2 md:px-5 py-3.5 md:py-3 flex flex-col items-center gap-0.5 ${bordered ? "border-r border-border/30" : ""}`}>
      <p className="eyebrow text-ink/50 mb-0.5">{label}</p>
      <p className="font-outfit font-bold text-gradient-gold leading-none text-2xl md:text-4xl lg:text-5xl">
        {display}
      </p>
      <p className="font-body text-muted-foreground text-[10px] leading-tight mt-0.5">{sub}</p>
    </div>
  );
};

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const communityRef = useRef<HTMLElement>(null);
  const pillarsRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "32%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);

  const communityBgY = useSectionParallax(communityRef, 14);
  const pillarsBgY = useSectionParallax(pillarsRef, 10);
  const { events: remoteEvents, loading: eventsLoading, error: eventsError } = useCalendarEvents();

  const sourceEvents = eventsError ? mockEvents : remoteEvents;
  const upcomingPreviewEvents = useMemo(
    () => getUpcomingEvents(sourceEvents).filter(isOnOrAfterToday).slice(0, HOMEPAGE_PREVIEW_LIMIT),
    [sourceEvents],
  );

  return (
    <Layout>
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 parallax-layer" style={{ y: heroY }}>
          <img src={heroImg} alt="MSA at Pitt community gathering" className="w-full h-full object-cover scale-110" width={1920} height={1080} />
          {/* Rich layered gradient — Abyss depth with warmth */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060B18]/90 via-[#0D1528]/55 to-[#14345A]/90" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '280px' }} />
          {/* Jannah atmospheric glow — green warmth from the right */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_45%,rgba(20,128,102,.22)_0%,transparent_50%)]" />
          {/* Gold warm glow from the left */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_60%,rgba(242,171,35,.1)_0%,transparent_50%)]" />
        </motion.div>

        {/* Bridge bar */}
        <BridgeBar />
        {/* Crescent — subtle */}
        <CrescentWatermark color="#F2AB23" size={380} opacity={0.05} position="right" />

        {/* Atmospheric blurs */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-primary/12 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/5 w-72 h-72 rounded-full bg-secondary/10 blur-[120px]" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full bg-[#11233C]/20 blur-[100px]" />

        <motion.div className="relative z-10 text-center px-4 max-w-4xl mx-auto" style={{ opacity: heroOpacity }}>
          {/* Bismillah */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="mb-8 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-3 w-52 md:w-68">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
            <p className="font-arabic text-2xl md:text-3xl text-primary/80 tracking-wide" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <div className="flex items-center gap-3 w-52 md:w-68">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="eyebrow text-msa-gold/90 mb-5"
          >
            Muslim Student Association · University of Pittsburgh
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-accent-foreground leading-[1.0] mb-5 tracking-tight"
          >
            A Home Away
            <br />
            <span className="font-script text-gradient-gold" style={{ fontSize: '1.1em' }}>From Home.</span>
          </motion.h1>

          {/* Brand tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="eyebrow text-msa-gold/65 mb-5"
          >
            Cultivate Community, Ignite Iman.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="font-dm-sans text-base md:text-lg text-accent-foreground/60 max-w-xl mx-auto mb-10 leading-[1.75]"
          >
            Connecting Muslim students at Pitt through faith, friendship, and service.
            Everyone is welcome — wherever you're starting from.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/join" className="btn-premium text-base px-8 py-3.5">
              Join the MSA <ArrowRight size={16} />
            </Link>
            <Link to="/events" className="btn-premium-secondary text-base px-8 py-3.5">
              See Upcoming Events
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-px h-12 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent animate-pulse mx-auto" />
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-20 px-4 md:px-8 -mt-14 mb-[-6.5rem] bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="liquid-glass-stats rounded-3xl max-w-3xl mx-3 sm:mx-auto p-4 md:p-6 grid grid-cols-3 items-stretch gap-0 ring-1 ring-white/15 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] overflow-hidden"
        >
          <StatItem numericValue={50} suffix="+" label="Events per Semester" sub="halaqas, socials & more" bordered />
          <StatItem value="1997" label="Founded at Pitt" sub="30+ years of community" bordered />
          <StatItem numericValue={400} suffix="+" label="Community Members" sub="and growing every year" />
        </motion.div>
      </section>

      {/* ── Our Story ── */}
      <section ref={communityRef} className="section-padding pt-28 -mt-4 warm-surface relative overflow-hidden">
        <motion.div className="absolute inset-0 gradient-mesh-warm" style={{ y: communityBgY }} />
        <div className="absolute inset-0 texture-khatam opacity-[0.6]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-secondary/15 to-primary/20 rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-sm" />
              <div className="relative liquid-glass p-3">
                <img src={communityImg} alt="MSA students on campus" className="rounded-xl w-full object-cover aspect-[4/3]" loading="lazy" width={1280} height={854} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
              <p className="eyebrow text-jannah-mid mb-4">Our Story</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                More than<br />a club.
              </h2>
              <p className="font-dm-sans text-muted-foreground text-base leading-[1.8] mb-4">
                MSA at Pitt is one of the largest and most vibrant student organizations at the University of Pittsburgh. We're a community rooted in Islamic values, cultivating a transformative space for Muslim students — and open to absolutely everyone.
              </p>
              <p className="font-dm-sans text-muted-foreground text-base leading-[1.8] mb-6">
                Whether you've been Muslim your whole life, just took your shahada, or you're simply curious — knowledge precedes action, and every journey starts somewhere.
              </p>
              <div className="pull-quote-gold mb-7">
                <ArabicVerse
                  arabic="وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ"
                  translation="And cooperate in righteousness and piety."
                  reference="Quran 5:2"
                  className="text-left py-0"
                  compact
                />
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-200 text-base">
                Learn more about us <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Upcoming Events ── */}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventsLoading && !eventsError ? (
              <GlassCard delay={0}>
                <div className="min-h-[220px] flex flex-col items-center justify-center text-center">
                  <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
                  <p className="text-muted-foreground text-sm">Loading upcoming events…</p>
                </div>
              </GlassCard>
            ) : upcomingPreviewEvents.length === 0 ? (
              <GlassCard delay={0}>
                <div className="min-h-[220px] flex flex-col items-center justify-center text-center">
                  <p className="font-display font-semibold text-xl text-foreground mb-2">No upcoming events yet</p>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    New events are added regularly. Check back soon or open the full events page.
                  </p>
                </div>
              </GlassCard>
            ) : (
              upcomingPreviewEvents.map((event, index) => {
                const { month, day } = formatEventMonthDay(event.startDate);

                return (
                  <GlassCard key={event.id} delay={index * 0.1}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="gold-gradient text-primary-foreground w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">{month}</span>
                        <span className="font-display text-2xl font-bold leading-none">{day}</span>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-foreground leading-tight">{event.title}</h3>
                        <p className="text-muted-foreground text-sm mt-0.5">{event.timeLabel}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1.5">📍 {event.location}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">{event.shortBlurb}</p>
                    <a href={EVENT_SIGNUP_HUB_URL} target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-5 py-2">
                      RSVP <ArrowRight size={13} />
                    </a>
                  </GlassCard>
                );
              })
            )}

            {/* See all card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="liquid-glass-hover flex flex-col items-center justify-center p-8 text-center min-h-[220px] group"
            >
              <p className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">See all events</p>
              <p className="text-muted-foreground text-sm mb-5">Halaqas, speakers, sisters' events, and more.</p>
              <Link to="/events" className="btn-premium text-sm px-5 py-2 mb-3">
                View Events Page <ArrowRight size={13} />
              </Link>
              <div className="flex gap-3">
                <a href={GOOGLE_CALENDAR_URL} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Calendar size={11} /> Google
                </a>
                <span className="text-border">·</span>
                <a href={APPLE_CALENDAR_URL} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Calendar size={11} /> Apple
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Pillars ── */}
      <section ref={pillarsRef} className="section-padding warm-surface relative overflow-hidden">
        <motion.div className="absolute inset-0 gradient-mesh-warm" style={{ y: pillarsBgY }} />
        <div className="absolute inset-0 texture-khatam opacity-[0.55]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="What drives us" label="Our Pillars" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar, i) => (
              <GlassCard key={pillar.title} delay={i * 0.08}>
                <div className="gold-gradient w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                  <pillar.icon className="text-primary-foreground" size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Join CTA ── */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 texture-dots" />
        {/* Warm atmospheric glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(242,171,35,.08)_0%,transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="eyebrow text-jannah-mid mb-4">Get Involved</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
              Ready to find<br />
              <span className="font-script text-gradient-gold" style={{ fontSize: '1.15em' }}>your people?</span>
            </h2>
            <p className="font-dm-sans text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 leading-[1.8]">
              Join 200+ students cultivating community and igniting iman at Pitt. Whatever stage of the journey you're on — there's a place for you here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link to="/join" className="btn-premium text-base px-8 py-3.5">
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
            {/* Instagram — tasteful, not a big block */}
            <div className="flex justify-center">
              <InstagramWidget />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Brand Stamp — abyss/royal dark section ── */}
      <section className="grain relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 abyss-surface" />
        <BridgeBar />
        {/* Khatam gold — per spec: reveals up close, disappears at a glance */}
        <KhatamOverlay variant="gold" size={60} opacity={0.28} />
        {/* Crescent — quiet presence */}
        <CrescentWatermark color="#C9A84C" size={320} opacity={0.06} position="right" />
        {/* Atmospheric glows — Gala Navy depth + Jannah warmth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[#11233C]/35 blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] rounded-full bg-[#14345A]/25 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-[#148066]/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/3 w-[200px] h-[200px] rounded-full bg-[#C9A84C]/6 blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="absolute inset-0 texture-dots opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* MSA logo */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group flex justify-center md:justify-start"
            >
              <div className="absolute -inset-6 rounded-full bg-[#11233C]/40 blur-3xl group-hover:bg-[#14345A]/50 transition-all duration-700 pointer-events-none" />
              <img src="/msa-logo-white.png" alt="MSA at Pitt logo" className="relative w-48 md:w-64 mix-blend-screen" width={256} height={256} />
            </motion.div>

            {/* Tagline + Closing Ayat */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <p className="eyebrow mb-4" style={{ color: '#C9A84C', opacity: 0.55 }}>Muslim Student Association</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-accent-foreground mb-5 leading-tight">
                Cultivate Community,<br />
                <span className="font-script text-gradient-aura" style={{ fontSize: '1.15em' }}>Ignite Iman.</span>
              </h2>
              <p className="font-dm-sans text-accent-foreground/45 text-base leading-[1.8] mb-8">
                Over 28 years of faith, friendship, and service at the University of Pittsburgh — and we're just getting started.
              </p>
              {/* Embedded closing ayat — pull-quote on dark: border-l in gold */}
              <div className="border-l-2 pl-5" style={{ borderColor: 'rgba(242,171,35,.25)' }}>
                <ArabicVerse
                  arabic="إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ"
                  translation="The believers are but brothers."
                  reference="Quran 49:10"
                  className="text-left py-0"
                  compact
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
