import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import EventsHero from "@/components/events/EventsHero";
import EventsActionBar from "@/components/events/EventsActionBar";
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
      <EventsHero />

      <section className="section-padding pb-8 gradient-section-gold-soft">
        <EventsActionBar />
      </section>

      <section className="px-4 pb-12 gradient-section-gold-soft">
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

      {featured && (
        <section className="section-padding pt-4 pb-8 gradient-mesh-warm relative overflow-hidden">
          <div className="absolute inset-0 texture-dots" />
          <div className="max-w-5xl mx-auto relative z-10">
            <SectionHeading title="Signature Event" label="Don't Miss" />
            <FeaturedEventCard event={featured} />
          </div>
        </section>
      )}

      <div className="glass-divider-thick max-w-3xl mx-auto" />

      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 gradient-section-emerald-soft" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
        <div className="max-w-5xl mx-auto relative z-10">
          {error && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground/90">
              Live calendar is temporarily unavailable. Showing curated fallback events.
            </div>
          )}

          <div className="flex flex-col items-center gap-6 mb-10">
            <EventsViewToggle view={view} onChange={setView} />
            <EventsFilterBar selected={selectedTags} onChange={setSelectedTags} />
          </div>

          {loading && !error ? (
            <div className="glass-card-strong p-12 text-center text-muted-foreground">
              Loading events from Google Calendar…
            </div>
          ) : view === "upcoming" ? (
            <UpcomingEventsList events={upcomingFiltered} />
          ) : (
            <MonthCalendar events={filteredEvents} />
          )}
        </div>
      </section>

      <section className="section-padding gradient-section-gold-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-7">
            <ArabicVerse
              arabic="وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ"
              translation="And your Lord is going to give you, and you will be satisfied."
              reference="Quran 93:5"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
