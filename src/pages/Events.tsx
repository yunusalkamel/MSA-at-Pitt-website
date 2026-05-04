import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, ArrowRight, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import EventsHero from "@/components/events/EventsHero";
import FeaturedEventCard from "@/components/events/FeaturedEventCard";
import EventsFilterBar from "@/components/events/EventsFilterBar";
import MonthCalendar from "@/components/events/MonthCalendar";
import EventCard from "@/components/events/EventCard";
import ViewSwitcher from "@/components/events/ViewSwitcher";
import AgendaView from "@/components/events/AgendaView";
import SectionHeading from "@/components/SectionHeading";
import SectionDivider from "@/components/SectionDivider";
import patternImg from "@/assets/islamic-pattern.jpg";
import {
  mockEvents,
  getFeaturedEvent,
  getUpcomingWindow,
} from "@/data/events";
import { LINKS } from "@/config/links";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageMeta } from "@/lib/usePageMeta";

type View = "agenda" | "calendar";

/** Self-ticking relative-time string. Only this small subcomponent re-renders. */
const RelativeTime = ({ at }: { at: number }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return <>{`Synced ${formatDistanceToNow(new Date(at), { addSuffix: true })}`}</>;
};

const Events = () => {
  usePageMeta({
    title: "Events — MSA at Pitt",
    description: "Halaqas, iftars, socials, and more. Subscribe once, never miss a moment.",
  });
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>("calendar");
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);
  const { events: remoteEvents, loading, error, lastSyncedAt, refresh } = useCalendarEvents();

  useEffect(() => {
    setView(isMobile ? "agenda" : "calendar");
  }, [isMobile]);

  const sourceEvents = error ? mockEvents : remoteEvents;
  const featured = getFeaturedEvent(sourceEvents);
  // Only show the "Signature" treatment if the event is *actually* tagged Signature
  const isSignature = !!featured && featured.tags.includes("Signature");
  const upcoming = useMemo(() => getUpcomingWindow(sourceEvents, 15, 3), [sourceEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedTags.includes("All")) return sourceEvents;
    if (selectedTags.includes("Past Events")) {
      const other = selectedTags.filter((t) => t !== "Past Events");
      const past = sourceEvents.filter((e) => e.isPast);
      return other.length === 0 ? past : past.filter((e) => e.tags.some((t) => other.includes(t)));
    }
    return sourceEvents
      .filter((e) => !e.isPast)
      .filter((e) => e.tags.some((t) => selectedTags.includes(t)));
  }, [selectedTags, sourceEvents]);

  const upcomingScrollRef = useRef<HTMLDivElement>(null);

  // ── Reusable "Coming Up" block — rendered above events on mobile, below on desktop ──
  const ComingUpBlock = upcoming.length > 0 && (
    <section className="section-padding warm-surface-deep relative overflow-hidden">
      <div className="absolute inset-0 gradient-section-gold-soft opacity-70" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">Coming Up</h3>
          <span className="liquid-glass text-xs font-bold text-primary px-3 py-1 rounded-full">
            {upcoming.length} event{upcoming.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div
          ref={upcomingScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {upcoming.map((event, i) => (
            <motion.div
              key={event.id}
              initial={prefersReduced ? false : { opacity: 0, x: 20 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex-shrink-0 w-[280px] md:w-[320px] snap-start"
            >
              <EventCard event={event} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <Layout>
      <EventsHero />

      {/* ── Featured/Signature event — only shows Signature treatment when actually tagged Signature ── */}
      {featured && (
        <section className="section-padding pt-10 pb-10 gradient-mesh-warm relative overflow-hidden">
          <div className="absolute inset-0 texture-dots" />
          <div className="max-w-5xl mx-auto relative z-10">
            {isSignature ? (
              <SectionHeading title="Signature Event" label="Don't Miss" />
            ) : (
              <SectionHeading title="Featured Event" label="Coming Up" />
            )}
            <FeaturedEventCard event={featured} showSignatureBadge={isSignature} />
          </div>
        </section>
      )}

      <div className="glass-divider-thick" />

      {/* ── Mobile: Coming Up sits ABOVE the calendar ── */}
      <div className="md:hidden">{ComingUpBlock}</div>

      {/* Main events section */}
      <section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-cross opacity-50" />

        <div className="max-w-5xl mx-auto relative z-10">

          {error && (
            <div className="mb-5 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground/80">
              Live calendar temporarily unavailable — showing recurring events only.{" "}
              <a href={LINKS.linktree} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                See Linktree for the full schedule →
              </a>
            </div>
          )}

          {/* View switcher + sync indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <ViewSwitcher view={view} onChange={setView} />

            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-body">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background:
                    lastSyncedAt && Date.now() - lastSyncedAt < 10 * 60 * 1000
                      ? "#148066"
                      : "#F2AB23",
                }}
              />
              {lastSyncedAt ? (
                <RelativeTime at={lastSyncedAt} />
              ) : loading ? (
                "Connecting to calendar…"
              ) : (
                "Calendar synced"
              )}
              <button
                onClick={refresh}
                disabled={loading}
                aria-label="Refresh calendar"
                className="ml-1 hover:text-primary transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60 rounded"
              >
                <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Mobile calendar subscribe */}
          <div className="md:hidden flex justify-center gap-3 mb-4">
            <a href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer"
              className="btn-premium-secondary text-sm px-4 py-2 flex-1 justify-center">
              <Calendar size={13} /> Google Calendar
            </a>
            <a href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer"
              className="btn-premium-secondary text-sm px-4 py-2 flex-1 justify-center">
              <Calendar size={13} /> Apple Calendar
            </a>
          </div>

          <div className={`flex justify-center mb-6 ${view === "agenda" ? "sticky top-[68px] md:top-[76px] z-30 py-2 backdrop-blur-sm" : ""}`}>
            <EventsFilterBar selected={selectedTags} onChange={setSelectedTags} />
          </div>

          {loading && !error ? (
            <div className="glass-card-strong p-16 text-center rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm">Loading events…</p>
              </div>
            </div>
          ) : view === "agenda" ? (
            <AgendaView events={filteredEvents} />
          ) : (
            <MonthCalendar events={filteredEvents} />
          )}

          <div className="hidden md:flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-border/40">
            <span className="text-sm font-body font-bold text-foreground/75 uppercase tracking-[0.15em]">
              Sync to your calendar:
            </span>
            <a
              href={LINKS.googleCalendarSubscribe}
              target="_blank"
              rel="noopener noreferrer"
              title="Opens Google Calendar — click '+' at the bottom right to subscribe"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground glass-card px-4 py-2 rounded-full border-primary/20 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
            >
              <Calendar size={13} /> Google Calendar
            </a>
            <a
              href={LINKS.appleCalendarSubscribe}
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribes directly to your Apple Calendar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground glass-card px-4 py-2 rounded-full border-primary/20 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
            >
              <Calendar size={13} /> Apple Calendar
            </a>
            <div className="ml-auto">
              <a
                href={LINKS.eventSignupHub}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium text-sm px-5 py-2.5"
              >
                Event Signup Hub <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Desktop: Coming Up sits BELOW the calendar ── */}
      {upcoming.length > 0 && <div className="hidden md:block"><SectionDivider /></div>}
      <div className="hidden md:block">{ComingUpBlock}</div>

      {/* ── Closing — Hadith on gathering for remembrance ── */}
      <section className="section-padding-sm gradient-section-emerald-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="glass-card-strong glass-glow p-7">
            <ArabicVerse
              arabic="مَا اجْتَمَعَ قَوْمٌ يَذْكُرُونَ اللَّهَ إِلَّا حَفَّتْهُمُ الْمَلَائِكَةُ"
              translation="No people gather to remember Allah without the angels surrounding them, mercy enveloping them, and tranquility descending upon them."
              reference="Hadith · Muslim 2700"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
