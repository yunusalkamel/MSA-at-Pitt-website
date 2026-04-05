import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Apple, ExternalLink, PenLine } from "lucide-react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import EventsHero from "@/components/events/EventsHero";
import FeaturedEventCard from "@/components/events/FeaturedEventCard";
import EventsViewToggle from "@/components/events/EventsViewToggle";
import EventsFilterBar from "@/components/events/EventsFilterBar";
import UpcomingEventsList from "@/components/events/UpcomingEventsList";
import MonthCalendar from "@/components/events/MonthCalendar";
import SectionHeading from "@/components/SectionHeading";
import patternImg from "@/assets/islamic-pattern.jpg";
import {
  mockEvents,
  getFeaturedEvent,
  getUpcomingEvents,
  filterEventsByTags,
  GOOGLE_CALENDAR_URL,
  APPLE_CALENDAR_URL,
  EVENT_SIGNUP_HUB_URL,
} from "@/data/events";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const Events = () => {
  const [view, setView] = useState<"upcoming" | "month">("upcoming");
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);
  const { events: remoteEvents, loading, error } = useCalendarEvents();

  const sourceEvents = error ? mockEvents : remoteEvents;
  const featured = getFeaturedEvent(sourceEvents);
  const filteredEvents = useMemo(
    () => filterEventsByTags(sourceEvents, selectedTags),
    [selectedTags, sourceEvents]
  );
  const upcomingFiltered = useMemo(
    () =>
      selectedTags.includes("Past Events")
        ? filteredEvents
        : getUpcomingEvents(filteredEvents),
    [filteredEvents, selectedTags]
  );

  return (
    <Layout>
      {/* Hero */}
      <EventsHero />

      {/* Featured event — immediately below hero, no fluff in between */}
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

      {/* Controls + Events list */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 gradient-section-emerald-soft" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
        <div className="max-w-5xl mx-auto relative z-10">

          {error && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground/80">
              Showing our curated event schedule. Live sync will resume automatically.
            </div>
          )}

          {/* Controls row: view toggle + filters */}
          <div className="flex flex-col items-center gap-5 mb-10">
            <EventsViewToggle view={view} onChange={setView} />
            <EventsFilterBar selected={selectedTags} onChange={setSelectedTags} />
          </div>

          {/* Event content */}
          {loading && !error ? (
            <div className="glass-card-strong p-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm">Loading events from Google Calendar…</p>
              </div>
            </div>
          ) : view === "upcoming" ? (
            <UpcomingEventsList events={upcomingFiltered} />
          ) : (
            <MonthCalendar events={filteredEvents} />
          )}

          {/* Sync calendar — inline, after events, unobtrusive */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 pt-6 border-t border-border/40 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sync to your calendar:</span>
            {[
              { label: "Google Calendar", icon: Calendar, href: GOOGLE_CALENDAR_URL },
              { label: "Apple Calendar", icon: Apple, href: APPLE_CALENDAR_URL },
              { label: "Full Calendar", icon: ExternalLink, href: GOOGLE_CALENDAR_URL },
              { label: "Event Signup Hub", icon: PenLine, href: EVENT_SIGNUP_HUB_URL },
            ].map((a) => (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <a.icon size={13} />
                {a.label}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Closing Ayat */}
      <section className="section-padding-sm gradient-section-gold-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-7">
            <ArabicVerse
              arabic="فَإِنَّ مَعَ الْعُسْرِ يُسْرًا"
              translation="For indeed, with hardship comes ease."
              reference="Quran 94:5"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
