import { useState, useMemo } from "react";
import { Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import EventDetailSheet from "./EventDetailSheet";

const AiSparkle = () => (
  <span
    title="AI-assisted tag"
    className="inline-block ml-0.5 opacity-25 select-none pointer-events-none text-[7px] leading-none align-super"
    aria-hidden="true"
  >✦</span>
);

type PastWindow = 7 | 30 | 90;

function groupEvents(events: MSAEvent[], pastWindowDays?: PastWindow) {
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

const PAST_WINDOW_LABELS: { days: PastWindow; label: string }[] = [
  { days: 7, label: "Past week" },
  { days: 30, label: "Past month" },
  { days: 90, label: "Past 3 months" },
];

function EventRow({ event, isPast, onClick }: { event: MSAEvent; isPast?: boolean; onClick: () => void }) {
  const d = new Date(event.startDate + "T12:00:00");
  const dayLabel = d.toLocaleString("en-US", { weekday: "short" });
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-4 group transition-all duration-200
        ${isPast
          ? "bg-muted/30 border border-border/20 hover:bg-muted/50 opacity-70 dark:opacity-35"
          : "liquid-glass-hover"
        }`}
    >
      <div className="flex-shrink-0 w-16 text-center">
        <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{dayLabel}</p>
        <p className={`font-display text-lg font-bold leading-none ${isPast ? "text-foreground/60" : "text-foreground"}`}>{d.getDate()}</p>
        <p className="font-body text-[10px] text-muted-foreground uppercase">{d.toLocaleString("en-US", { month: "short" })}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-display font-bold text-base leading-tight line-clamp-1 transition-colors
          ${isPast ? "text-foreground/60" : "text-foreground group-hover:text-primary"}`}>
          {event.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="font-satoshi text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={10} className="text-primary/60" />{event.timeLabel}
          </span>
          <span className="font-satoshi text-xs text-muted-foreground flex items-center gap-1 truncate">
            <MapPin size={10} className="text-secondary/60 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </span>
        </div>
      </div>
      {event.tags[0] && (
        <span className={`flex-shrink-0 hidden sm:block ${isPast ? "opacity-50" : ""} ${event.tags[0] === "Signature" ? "tag-chip-gold" : "tag-chip"}`}>
          {event.tags[0]}{event.tagSource === "ai" && <AiSparkle />}
        </span>
      )}
    </button>
  );
}

const AgendaView = ({ events }: { events: MSAEvent[] }) => {
  const [selected, setSelected] = useState<MSAEvent | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [pastWindow, setPastWindow] = useState<PastWindow>(30);

  const { upcomingGroups, pastGroups } = useMemo(
    () => groupEvents(events, showPast ? pastWindow : undefined),
    [events, showPast, pastWindow],
  );

  if (upcomingGroups.length === 0 && !showPast) {
    return (
      <div className="glass-card p-10 text-center">
        <p className="font-display text-xl font-semibold text-foreground mb-2">No upcoming events</p>
        <p className="text-muted-foreground text-sm">Check back soon or subscribe to the calendar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
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

        {/* Past events toggle */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={() => setShowPast((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            {showPast ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showPast ? "Hide past events" : "Show past events"}
          </button>

          {showPast && (
            <div className="flex gap-1.5">
              {PAST_WINDOW_LABELS.map(({ days, label }) => (
                <button
                  key={days}
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
          <p className="text-center text-xs text-muted-foreground/50 pb-4">No past events in this window.</p>
        )}
      </div>
      <EventDetailSheet event={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default AgendaView;
