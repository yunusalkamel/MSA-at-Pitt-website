import { useState, useMemo, useEffect } from "react";
import { Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import EventDetailSheet from "./EventDetailSheet";
import { getEventTier, getTagChipClass } from "./calendar-utils";

const AiSparkle = () => (
  <span
    title="AI-assisted tag"
    className="inline-block ml-0.5 opacity-25 select-none pointer-events-none text-[7px] leading-none align-super"
    aria-hidden="true"
  >✦</span>
);

type PastWindow = 7 | 30 | 90;
type PastWindowOption = PastWindow | null; // null = all time

function groupEvents(events: MSAEvent[], pastWindowDays?: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const twoWeeks = new Date(today);
  twoWeeks.setDate(today.getDate() + 14);

  const upcomingGroups: { label: string; events: MSAEvent[]; isPast?: boolean }[] = [];
  const thisWeek: MSAEvent[] = [];
  const nextWeekArr: MSAEvent[] = [];
  const byMonth: Record<string, MSAEvent[]> = {};
  const pastByMonth: Record<string, MSAEvent[]> = {};

  const pastCutoff = pastWindowDays
    ? new Date(today.getTime() - pastWindowDays * 24 * 60 * 60 * 1000)
    : null;

  events.forEach((e) => {
    const d = new Date(e.startDate + "T12:00:00");
    if (e.isPast || d < today) {
      if (pastCutoff && d < pastCutoff) return; // outside selected window
      const key = d.toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!pastByMonth[key]) pastByMonth[key] = [];
      pastByMonth[key].push(e);
      return;
    }
    if (d < nextWeek) { thisWeek.push(e); return; }
    if (d < twoWeeks) { nextWeekArr.push(e); return; }
    const key = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(e);
  });

  if (thisWeek.length) upcomingGroups.push({ label: "This Week", events: thisWeek });
  if (nextWeekArr.length) upcomingGroups.push({ label: "Next Week", events: nextWeekArr });
  Object.entries(byMonth).forEach(([label, evts]) => upcomingGroups.push({ label, events: evts }));

  const pastGroups: { label: string; events: MSAEvent[]; isPast: true }[] = [];
  Object.entries(pastByMonth)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .forEach(([label, evts]) => pastGroups.push({
      label,
      events: evts.sort((a, b) => b.startDate.localeCompare(a.startDate)),
      isPast: true,
    }));

  return { upcomingGroups, pastGroups };
}

const PAST_WINDOW_LABELS: { days: PastWindowOption; label: string }[] = [
  { days: 7, label: "Past week" },
  { days: 30, label: "Past month" },
  { days: 90, label: "Past 3 months" },
  { days: null, label: "All time" },
];

const AUDIENCE_TAGS = new Set(["Brothers", "Sisters", "General"]);

function EventRow({ event, isPast, onClick }: { event: MSAEvent; isPast?: boolean; onClick: () => void }) {
  const d = new Date(event.startDate + "T12:00:00");
  const dayLabel = d.toLocaleString("en-US", { weekday: "short" });
  const isSignature = event.isSignature || event.featured;
  const pastSignature = isPast && isSignature;
  const mutedPast = isPast && !isSignature;
  const liveSignature = isSignature && !isPast;
  const tier = getEventTier(event);
  // Show category tags (skip audience tags like Brothers/Sisters/General)
  const categoryTags = event.tags.filter((t) => !AUDIENCE_TAGS.has(t));
  const audienceTag = event.tags.find((t) => AUDIENCE_TAGS.has(t));

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-4 group transition-all duration-200
        ${liveSignature
          ? "gold-gradient border border-primary/40 shadow-md hover:opacity-95"
          : pastSignature
          ? "border border-primary/30 bg-primary/[0.05] opacity-70 hover:opacity-90"
          : mutedPast
          ? "bg-muted/30 border border-border/20 hover:bg-muted/50 opacity-70 dark:opacity-35"
          : "liquid-glass-hover"
        }`}
    >
      <div className="flex-shrink-0 w-16 text-center">
        <p className={`font-body text-[10px] font-semibold uppercase tracking-wider ${liveSignature ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{dayLabel}</p>
        <p className={`font-display text-lg font-bold leading-none ${liveSignature ? "text-primary-foreground" : mutedPast || pastSignature ? "text-foreground/60" : "text-foreground"}`}>{d.getDate()}</p>
        <p className={`font-body text-[10px] uppercase ${liveSignature ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{d.toLocaleString("en-US", { month: "short" })}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-display font-bold text-base leading-tight line-clamp-1 transition-colors
          ${liveSignature ? "text-primary-foreground" : mutedPast || pastSignature ? "text-foreground/60" : "text-foreground group-hover:text-primary"}`}>
          {event.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className={`font-satoshi text-xs flex items-center gap-1 ${liveSignature ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            <Clock size={10} className={liveSignature ? "text-primary-foreground/60" : "text-primary/60"} />{event.timeLabel}
          </span>
          <span className={`font-satoshi text-xs flex items-center gap-1 truncate ${liveSignature ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            <MapPin size={10} className={`flex-shrink-0 ${liveSignature ? "text-primary-foreground/60" : "text-secondary/60"}`} />
            <span className="truncate">{event.location}</span>
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-row items-center gap-1.5 flex-wrap justify-end max-w-[120px] sm:max-w-[160px]">
        {audienceTag && (
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${liveSignature ? "text-primary-foreground/70" : "text-muted-foreground/50"}`}>
            {audienceTag}
          </span>
        )}
        {categoryTags.slice(0, 3).map((tag, i) => (
          <span
            key={tag}
            className={`${liveSignature ? "border border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide" : pastSignature ? "border border-primary/25 bg-primary/[0.07] text-primary/70 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide" : getTagChipClass(tier, isPast || mutedPast)} ${mutedPast ? "opacity-50" : ""}`}
          >
            {tag}{i === categoryTags.length - 1 && event.tagSource === "ai" && <AiSparkle />}
          </span>
        ))}
      </div>
    </button>
  );
}

const AgendaView = ({ events, autoShowPast = false }: { events: MSAEvent[]; autoShowPast?: boolean }) => {
  const [selected, setSelected] = useState<MSAEvent | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [pastWindow, setPastWindow] = useState<PastWindowOption>(30);

  useEffect(() => {
    if (autoShowPast) setShowPast(true);
  }, [autoShowPast]);

  const pastWindowDays = showPast ? (pastWindow ?? undefined) : undefined;

  const { upcomingGroups, pastGroups } = useMemo(
    () => groupEvents(events, pastWindowDays),
    [events, pastWindowDays],
  );

  return (
    <>
      <div className="space-y-6">
        {/* Past events controls at the top */}
        <div className="flex flex-col items-center gap-3">
          {/* Only show the toggle button when not auto-managed */}
          {!autoShowPast && (
            <button
              onClick={() => setShowPast((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              {showPast ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showPast ? "Hide past events" : "Show past events"}
            </button>
          )}
          {/* Window selector — shown whenever past is visible */}
          {showPast && (
            <div className="flex gap-1.5 flex-wrap justify-center">
              {PAST_WINDOW_LABELS.map(({ days, label }) => (
                <button
                  key={String(days)}
                  onClick={() => setPastWindow(days)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border
                    ${pastWindow === days
                      ? "gold-gradient text-primary-foreground border-transparent"
                      : "bg-transparent border-border/40 text-muted-foreground/60 hover:border-border/70 hover:text-muted-foreground"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Past events — shown above upcoming when toggled/auto */}
        {showPast && pastGroups.map((group) => (
          <div key={group.label}>
            <div className="sticky top-[112px] md:top-[120px] z-20 py-2 mb-2">
              <span className="eyebrow text-jannah-mid/50 dark:text-msa-gold/40">{group.label}</span>
            </div>
            <div className="space-y-2">
              {group.events.map((event) => (
                <EventRow key={event.id} event={event} isPast onClick={() => setSelected(event)} />
              ))}
            </div>
          </div>
        ))}

        {showPast && pastGroups.length === 0 && (
          <p className="text-center text-xs text-muted-foreground/50 pb-2">No past events in this window.</p>
        )}

        {/* Upcoming events */}
        {upcomingGroups.map((group) => (
          <div key={group.label}>
            <div className="sticky top-[112px] md:top-[120px] z-20 py-2 mb-2">
              <span className="eyebrow text-jannah-mid dark:text-msa-gold/70">{group.label}</span>
            </div>
            <div className="space-y-2">
              {group.events.map((event) => (
                <EventRow key={event.id} event={event} onClick={() => setSelected(event)} />
              ))}
            </div>
          </div>
        ))}

        {upcomingGroups.length === 0 && (!showPast || pastGroups.length === 0) && (
          <div className="glass-card p-10 text-center">
            <p className="font-display text-xl font-semibold text-foreground mb-2">No events found</p>
            <p className="text-muted-foreground text-sm">Try a different filter or check back soon.</p>
          </div>
        )}
      </div>
      <EventDetailSheet event={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default AgendaView;
