import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import EventsHero from "@/components/events/EventsHero";
import FeaturedEventCard from "@/components/events/FeaturedEventCard";
import EventsFilterBar from "@/components/events/EventsFilterBar";
import MonthCalendar from "@/components/events/MonthCalendar";
import EventCard from "@/components/events/EventCard";
import SectionHeading from "@/components/SectionHeading";
import patternImg from "@/assets/islamic-pattern.jpg";
import {
  mockEvents,
  getFeaturedEvent,
  getUpcomingEvents,
  GOOGLE_CALENDAR_URL,
  APPLE_CALENDAR_URL,
  EVENT_SIGNUP_HUB_URL,
} from "@/data/events";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import type { MSAEvent } from "@/data/events";
import { useState } from "react";

function getUpcomingWindow(events: MSAEvent[], days = 21): MSAEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return events
    .filter((e) => {
      if (e.isPast) return false;
      const d = new Date(e.startDate + "T12:00:00");
      return d >= today && d <= cutoff;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

const Events = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);
  const { events: remoteEvents, loading, error } = useCalendarEvents();

  const sourceEvents = error ? mockEvents : remoteEvents;
  const featured = getFeaturedEvent(sourceEvents);
  const upcoming = useMemo(() => getUpcomingWindow(sourceEvents, 21), [sourceEvents]);
  const allEvents = useMemo(() => getUpcomingEvents(sourceEvents), [sourceEvents]);

  // Filtered events for the calendar
  const calendarEvents = useMemo(() => {
    if (selectedTags.includes("All")) return sourceEvents;
    return sourceEvents.filter((e) => e.tags.some((t) => selectedTags.includes(t)));
  }, [selectedTags, sourceEvents]);

  const upcomingScrollRef = useRef<HTMLDivElement>(null);

  return (
    <Layout>
      <EventsHero />

      {/* Signature event — immediately after hero */}
      {featured && (
        <section className="section-padding pt-10 pb-10 gradient-mesh-warm relative overflow-hidden">
          <div className="absolute inset-0 texture-dots" />
  
          <div className="max-w-5xl mx-auto relative z-10">
            <SectionHeading title="Signature Event" label="Don't Miss" />
            <FeaturedEventCard event={featured} />
          </div>
        </section>
      )}

      <div className="glass-divider-thick" />

      {/* Calendar — the main view */}
      <section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-cross opacity-50" />

        <div className="max-w-5xl mx-auto relative z-10">

          {error && (
            <div className="mb-5 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground/80">
              Showing our curated event schedule. Live sync will resume automatically.
            </div>
          )}

          {/* Filter chips */}
          <div className="flex justify-center mb-6">
            <EventsFilterBar selected={selectedTags} onChange={setSelectedTags} />
          </div>

          {loading && !error ? (
            <div className="glass-card-strong p-16 text-center rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm">Loading events…</p>
              </div>
            </div>
          ) : (
            <MonthCalendar events={calendarEvents} />
          )}

          {/* Sync calendar — understated, right below the calendar */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-border/30">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Sync to your calendar:
            </span>
            <a
              href={GOOGLE_CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Opens Google Calendar — click '+' at the bottom right to subscribe"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground glass-card px-3 py-1.5 rounded-full border-border/50 hover:border-border transition-all"
            >
              <Calendar size={11} /> Google Calendar
            </a>
            <a
              href={APPLE_CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribes directly to your Apple Calendar"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground glass-card px-3 py-1.5 rounded-full border-border/50 hover:border-border transition-all"
            >
              <Calendar size={11} /> Apple Calendar
            </a>
            <div className="ml-auto">
              <a
                href={EVENT_SIGNUP_HUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium text-xs px-4 py-2"
              >
                Event Signup Hub <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming events — horizontal scroll of cards */}
      {upcoming.length > 0 && (
        <section className="section-padding warm-surface-deep relative overflow-hidden">
          <div className="absolute inset-0 gradient-section-gold-soft opacity-70" />
          <div className="max-w-5xl mx-auto relative z-10">
            {/* Count badge — no "next 15 days" label */}
            <div className="flex items-center gap-3 mb-6">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">Coming Up</h3>
              <span className="liquid-glass text-xs font-bold text-primary px-3 py-1 rounded-full">
                {upcoming.length} event{upcoming.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Horizontal scroll */}
            <div
              ref={upcomingScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {upcoming.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
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
      )}

      {/* Closing ayat — relevant to gathering and taking action */}
      <section className="section-padding-sm gradient-section-emerald-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="glass-card-strong glass-glow p-7">
            <ArabicVerse
              arabic="وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ"
              translation="And hasten toward forgiveness from your Lord and a Garden."
              reference="Quran 3:133"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
