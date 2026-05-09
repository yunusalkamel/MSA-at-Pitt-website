import { useState, useEffect, useMemo } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";
import { mockEvents } from "@/data/events";
import type { MSAEvent } from "@/data/events";
import { parseStartMinutes } from "@/components/events/calendar-utils";

interface ResourcesData {
  jummahTime?: string;
  jummahLocation?: string;
}

function nowMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function todayISOStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

const TodayNextEvent = () => {
  const [mins, setMins] = useState(nowMinutes);
  const { events: calEvents, error: calError } = useCalendarEvents();
  const { data: resources } = useSanityData<ResourcesData>(QUERIES.resourcesPage);

  // Tick every 60 s so the card advances to the next event automatically
  useEffect(() => {
    const id = setInterval(() => setMins(nowMinutes()), 60_000);
    return () => clearInterval(id);
  }, []);

  const next = useMemo(() => {
    const today = todayISOStr();
    const source: MSAEvent[] = calError ? mockEvents : calEvents;
    const candidates: MSAEvent[] = source.filter(e => e.startDate === today);

    // On Fridays, inject Jummah from Sanity if the calendar doesn't already have one
    const isFriday = new Date().getDay() === 5;
    if (isFriday && resources?.jummahTime) {
      const hasJummah = candidates.some(e => e.categories?.includes("jumuah"));
      if (!hasJummah) {
        candidates.push({
          id: "__jummah_sanity__",
          title: "Jummah Prayer",
          startDate: today,
          timeLabel: resources.jummahTime,
          location: resources.jummahLocation ?? "Nordy's Place, Cathedral of Learning",
          shortBlurb: "",
          audience: "general",
          categories: ["jumuah"],
          isSignature: false,
          tagSource: "explicit",
          confidence: 1,
          calendarFallbackUrl: "/prayer-times",
        } as MSAEvent);
      }
    }

    // Sort by start time; show the next event that started within the last 60 min or is upcoming
    return candidates
      .sort((a, b) => parseStartMinutes(a) - parseStartMinutes(b))
      .find(e => parseStartMinutes(e) >= mins - 60);
  }, [calEvents, calError, resources, mins]);

  if (!next) return null;

  const timeDisplay = next.timeLabel.includes("·")
    ? next.timeLabel.split("·").slice(1).join("·").trim()
    : next.timeLabel;

  const startMins = parseStartMinutes(next);
  const isNow = startMins <= mins;
  const dayAbbr = new Date().toLocaleDateString("en-US", { weekday: "short" });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={next.id}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.35, delay: 1.25 }}
        className="mt-5 max-w-xs mx-auto"
      >
        <Link
          to="/events"
          className="block group rounded-2xl liquid-glass border border-white/20 hover:border-msa-gold/40 transition-all duration-300 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gold-gradient flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground/80 text-[7px] font-bold uppercase tracking-wider leading-none">
                {isNow ? "Now" : "Next"}
              </span>
              <span className="text-primary-foreground font-display font-bold text-sm leading-none mt-0.5">
                {dayAbbr}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-[9px] uppercase tracking-[0.18em] text-msa-gold/80 font-semibold leading-none mb-0.5">
                Today
              </p>
              <p className="font-display font-semibold text-accent-foreground text-sm leading-tight truncate">
                {next.title}
              </p>
              <p className="font-body text-[11px] text-accent-foreground/55 mt-0.5 truncate">
                {timeDisplay}{next.location ? ` · ${next.location}` : ""}
              </p>
            </div>
            <ArrowRight
              size={13}
              className="text-accent-foreground/30 group-hover:text-msa-gold group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
            />
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

export default TodayNextEvent;
