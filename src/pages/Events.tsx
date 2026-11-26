import { useSearchParams } from "react-router-dom";
import EventDetailSheet from "@/components/events/EventDetailSheet";
import { LinkField } from "@/editor/content";
import { TextField, itemIdentity, ContentScope } from "@/editor/content";
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
import patternImg from "@/assets/geometric-tile.svg";
import {
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
  const [view, setView] = useState<View>(() => isMobile ? "agenda" : "calendar");
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);
  const { events: remoteEvents, loading, error, lastSyncedAt, refresh } = useCalendarEvents();

  const [query, setQuery] = useSearchParams();
  const sourceEvents = remoteEvents;
  const selectedEvent = sourceEvents.find(event => event.id === query.get("event")) ?? null;
  const closeEvent = () => setQuery(current => {
    const next = new URLSearchParams(current);
    next.delete("event");
    return next;
  }, { replace: true });
  const featured = getFeaturedEvent(sourceEvents);
  // Only show the "Signature" treatment if the event is *actually* tagged Signature
  const isSignature = !!featured && featured.tags.includes("Signature");
  const upcoming = useMemo(() => getUpcomingWindow(sourceEvents, 15, 3), [sourceEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedTags.includes("All")) return sourceEvents;
    if (selectedTags.includes("Past Events")) {
      // "Past Events" alone → only past; "Past Events" + tags → intersection of past + tags
      const other = selectedTags.filter((t) => t !== "Past Events");
      const past = sourceEvents.filter((e) => e.isPast);
      return other.length === 0 ? past : past.filter((e) => e.tags.some((t) => other.includes(t)));
    }
    // Category/audience filters show ALL matching events (past + upcoming)
    // AgendaView groups past events at the bottom automatically
    return sourceEvents.filter((e) => e.tags.some((t) => selectedTags.includes(t)));
  }, [selectedTags, sourceEvents]);

  const upcomingScrollRef = useRef<HTMLDivElement>(null);

  // Keep the live event cards after the calendar so their arrival cannot push it down.
  const ComingUpBlock = upcoming.length > 0 && (
    <section className="section-padding warm-surface-deep relative overflow-hidden">
      <div className="absolute inset-0 gradient-section-gold-soft opacity-70" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground"><TextField id="Events_1">Coming Up</TextField></h3>
          <span className="liquid-glass text-xs font-bold text-primary px-3 py-1 rounded-full">
            <TextField id="Events_2">{upcoming.length}</TextField><TextField id="Events_3"> event</TextField>{upcoming.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div
          ref={upcomingScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {upcoming.map((event, i) => (
            <ContentScope key={event.id} id={"Events_4-" + itemIdentity(event, event.id)}><motion.div
              key={event.id}
              initial={prefersReduced ? false : { opacity: 0, x: 20 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex-shrink-0 w-[280px] md:w-[320px] snap-start"
            >
              <EventCard event={event} index={i} />
            </motion.div></ContentScope>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <Layout>
      <EventsHero />
      <EventDetailSheet event={selectedEvent} onClose={closeEvent} />

      {/* ── Signature event hero — only shown when there is a real signature event ── */}
      {featured && isSignature && (
        <section className="section-padding gradient-mesh-warm relative overflow-hidden">
          <div className="absolute inset-0 texture-dots" />
          <div className="max-w-5xl mx-auto relative z-10">
            <ContentScope id="Events_5"><SectionHeading title="Signature Event" label="Don't Miss" /></ContentScope>
            <FeaturedEventCard event={featured} showSignatureBadge={true} />
          </div>
        </section>
      )}

      <div className="glass-divider-thick" />

      {/* Main events section */}
      <section className="section-padding warm-surface relative">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-cross opacity-50" />

        <div className="max-w-5xl mx-auto relative z-10">

          {error && sourceEvents.length === 0 && (
            <div className="mb-5 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground/80"><TextField id="Events_7">
              Events are taking a moment to load. Check </TextField>
              <LinkField fieldId="Events_destination_1" href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">@msa.at.pitt</LinkField><TextField id="Events_8"> on Instagram for this week.</TextField>
            </div>
          )}

          {/* View switcher + sync indicator */}
          <div className="events-switcher sticky z-30 flex items-center justify-between gap-3 mb-5 py-2 backdrop-blur-sm">
            <ViewSwitcher view={view} onChange={setView} />

            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-body">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background:
                    lastSyncedAt && Date.now() - lastSyncedAt < 10 * 60 * 1000
                      ? "#148066"
                      : "var(--gold)",
                }}
              />
              {lastSyncedAt ? (
                <RelativeTime at={lastSyncedAt} />
              ) : loading ? (
                "Connecting to calendar…"
              ) : (
                error ? "Calendar unavailable" : "Calendar synced"
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
            <LinkField fieldId="Events_destination_2" href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer"
              className="btn-premium-secondary text-sm px-4 py-2 flex-1 justify-center">
              <Calendar size={13} /><TextField id="Events_9"> Google Calendar
            </TextField></LinkField>
            <LinkField fieldId="Events_destination_3" href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer"
              className="btn-premium-secondary text-sm px-4 py-2 flex-1 justify-center">
              <Calendar size={13} /><TextField id="Events_10"> Apple Calendar
            </TextField></LinkField>
          </div>

          <div className="flex justify-center mb-6">
            <EventsFilterBar selected={selectedTags} onChange={setSelectedTags} allEvents={sourceEvents} />
          </div>

          {view === "agenda" && loading && !error && filteredEvents.length === 0 ? (
            <div className="glass-card-strong p-16 text-center rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm"><TextField id="Events_11">Loading events…</TextField></p>
              </div>
            </div>
          ) : view === "agenda" ? (
            <AgendaView events={filteredEvents} />
          ) : (
            <MonthCalendar events={filteredEvents} />
          )}

          <div className="hidden md:flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-border/40">
            <span className="text-sm font-body font-bold text-foreground/75 uppercase tracking-[0.15em]"><TextField id="Events_12">
              Sync to your calendar:
            </TextField></span>
            <LinkField fieldId="Events_destination_4"
              href={LINKS.googleCalendarSubscribe}
              target="_blank"
              rel="noopener noreferrer"
              title="Opens Google Calendar — click '+' at the bottom right to subscribe"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground glass-card px-4 py-2 rounded-full border-primary/20 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
            >
              <Calendar size={13} /><TextField id="Events_13"> Google Calendar
            </TextField></LinkField>
            <LinkField fieldId="Events_destination_5"
              href={LINKS.appleCalendarSubscribe}
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribes directly to your Apple Calendar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground glass-card px-4 py-2 rounded-full border-primary/20 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
            >
              <Calendar size={13} /><TextField id="Events_14"> Apple Calendar
            </TextField></LinkField>
            <div className="ml-auto">
              <LinkField fieldId="Events_destination_6"
                href={LINKS.eventSignupHub}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium text-sm px-5 py-2.5"
              ><TextField id="Events_15">
                Event Signup Hub </TextField><ArrowRight size={13} />
              </LinkField>
            </div>
          </div>
        </div>
      </section>

      {upcoming.length > 0 && <SectionDivider />}
      <TextField id="Events_6"><TextField id="Events_16">{ComingUpBlock}</TextField></TextField>

      {/* ── Closing — Hadith on gathering for remembrance ── */}
      <section className="section-padding-sm gradient-section-emerald-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="glass-card-strong glass-glow p-7">
            <ContentScope id="Events_17"><ArabicVerse
              arabic="مَا اجْتَمَعَ قَوْمٌ يَذْكُرُونَ اللَّهَ إِلَّا حَفَّتْهُمُ الْمَلَائِكَةُ"
              translation="No people gather to remember Allah without the angels surrounding them, mercy enveloping them, and tranquility descending upon them."
              reference="Hadith · Muslim 2700"
            /></ContentScope>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
