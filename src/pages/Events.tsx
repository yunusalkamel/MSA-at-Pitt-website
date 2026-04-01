import { useState, useMemo } from "react";
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

const Events = () => {
  const [view, setView] = useState<"upcoming" | "month">("upcoming");
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);

  const featured = getFeaturedEvent(mockEvents);
  const filteredEvents = useMemo(
    () => filterEventsByTags(mockEvents, selectedTags),
    [selectedTags]
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

      {/* Action bar */}
      <section className="section-padding pb-8 gradient-section-gold-soft">
        <EventsActionBar />
      </section>

      {/* Ayat divider */}
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

      {/* Featured Event */}
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

      {/* Main Events Area */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 gradient-section-emerald-soft" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Controls */}
          <div className="flex flex-col items-center gap-6 mb-10">
            <EventsViewToggle view={view} onChange={setView} />
            <EventsFilterBar selected={selectedTags} onChange={setSelectedTags} />
          </div>

          {/* View */}
          {view === "upcoming" ? (
            <UpcomingEventsList events={upcomingFiltered} />
          ) : (
            <MonthCalendar events={filteredEvents} />
          )}
        </div>
      </section>

      {/* Bottom Ayat */}
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
