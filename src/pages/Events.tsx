import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Smartphone, ExternalLink, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import EventsHero from "@/components/events/EventsHero";
import FeaturedEventCard from "@/components/events/FeaturedEventCard";
import EventsViewToggle from "@/components/events/EventsViewToggle";
import EventsFilterBar from "@/components/events/EventsFilterBar";
import UpcomingEventsList from "@/components/events/UpcomingEventsList";
import MonthCalendar from "@/components/events/MonthCalendar";
import EventCard from "@/components/events/EventCard";
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
import type { MSAEvent } from "@/data/events";

function getNext15DaysEvents(events: MSAEvent[]): MSAEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
  return events
    .filter((e) => {
      if (e.isPast) return false;
      const d = new Date(e.startDate + "T12:00:00");
      return d >= today && d <= cutoff;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

const Events = () => {
  const [view, setView] = useState<"upcoming" | "month">("upcoming");
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);
  const { events: remoteEvents, loading, error } = useCalendarEvents();

  const sourceEvents = error ? mockEvents : remoteEvents;
  const featured = getFeaturedEvent(sourceEvents);
  const next15 = useMemo(() => getNext15DaysEvents(sourceEvents), [sourceEvents]);
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
      <EventsHero />

      {/* Featured event — immediately after hero */}
      {featured && (
        <section className="section-padding pt-10 pb-10 gradient-mesh-warm relative overflow-hidden">
          <div className="absolute inset-0 texture-dots" />
          <div className="max-w-5xl mx-auto relative z-10">
            <SectionHeading title="Signature Event" label="Don't Miss" />
            <FeaturedEventCard event={featured} />
          </div>
        </section>
      )}

      {/* Calendar sync + Signup Hub */}
      <section className="px-4 md:px-8 lg:px-16 xl:px-24 py-6 warm-surface-deep relative overflow-hidden">
        <div className="absolute inset-0 texture-dots opacity-50" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Sync to calendar — left side, understated */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mr-1">
                Sync calendar:
              </span>
              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Opens Google Calendar — use the '+' button at bottom right to subscribe"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-full px-3 py-1.5 transition-all glass-card"
              >
                <Calendar size={12} />
                Google Calendar
              </a>
              <a
                href={APPLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Adds MSA calendar directly to your Apple Calendar"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-full px-3 py-1.5 transition-all glass-card"
              >
                <Smartphone size={12} />
                Apple Calendar
              </a>
            </div>

            {/* Signup Hub — emphasized, right side */}
            <a
              href={EVENT_SIGNUP_HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium text-sm px-6 py-2.5 flex-shrink-0"
            >
              Event Signup Hub <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* Next 15 days — only shown if there are events */}
      {next15.length > 0 && (
        <section className="px-4 md:px-8 lg:px-16 xl:px-24 pt-8 pb-4 warm-surface relative overflow-hidden">
          <div className="absolute inset-0 gradient-section-gold-soft opacity-60" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-baseline gap-3 mb-5">
              <h3 className="font-display text-2xl font-bold text-foreground">Next 15 Days</h3>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {next15.length} event{next15.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="max-h-[420px] overflow-y-auto pr-1 grid gap-3 overscroll-contain">
              {next15.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="glass-divider-thick mx-4 md:mx-8 lg:mx-16 xl:mx-24" />

      {/* Full event browser */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 gradient-section-emerald-soft" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
        <div className="max-w-5xl mx-auto relative z-10">

          {error && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground/80">
              Showing our curated event schedule. Live sync will resume automatically.
            </div>
          )}

          <div className="flex flex-col items-center gap-5 mb-10">
            <EventsViewToggle view={view} onChange={setView} />
            <EventsFilterBar selected={selectedTags} onChange={setSelectedTags} />
          </div>

          {loading && !error ? (
            <div className="glass-card-strong p-16 text-center rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm">Loading events…</p>
              </div>
            </div>
          ) : view === "upcoming" ? (
            <UpcomingEventsList events={upcomingFiltered} />
          ) : (
            <MonthCalendar events={filteredEvents} />
          )}
        </div>
      </section>

      {/* Closing ayat — only one, at the very end */}
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
