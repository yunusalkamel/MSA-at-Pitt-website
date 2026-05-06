import { useState, useMemo } from "react";
import { Clock, MapPin } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import EventDetailSheet from "./EventDetailSheet";

const AiSparkle = () => (
  <span
    title="AI-assisted tag"
    className="inline-block ml-0.5 opacity-25 select-none pointer-events-none text-[7px] leading-none align-super"
    aria-hidden="true"
  >✦</span>
);

function groupEvents(events: MSAEvent[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const twoWeeks = new Date(today);
  twoWeeks.setDate(today.getDate() + 14);

  const groups: { label: string; events: MSAEvent[]; isPast?: boolean }[] = [];
  const thisWeek: MSAEvent[] = [];
  const nextWeekArr: MSAEvent[] = [];
  const byMonth: Record<string, MSAEvent[]> = {};
  const pastByMonth: Record<string, MSAEvent[]> = {};

  events.forEach((e) => {
    const d = new Date(e.startDate + "T12:00:00");
    if (e.isPast || d < today) {
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

  if (thisWeek.length) groups.push({ label: "This Week", events: thisWeek });
  if (nextWeekArr.length) groups.push({ label: "Next Week", events: nextWeekArr });
  Object.entries(byMonth).forEach(([label, evts]) => groups.push({ label, events: evts }));

  // Past events — most recent month first, each month sorted newest first
  Object.entries(pastByMonth)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .forEach(([label, evts]) => groups.push({
      label,
      events: evts.sort((a, b) => b.startDate.localeCompare(a.startDate)),
      isPast: true,
    }));

  return groups;
}

const AgendaView = ({ events }: { events: MSAEvent[] }) => {
  const [selected, setSelected] = useState<MSAEvent | null>(null);
  const groups = useMemo(() => groupEvents(events), [events]);

  if (groups.length === 0) {
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
        {groups.map((group) => (
          <div key={group.label}>
            <div className="sticky top-[112px] md:top-[120px] z-20 py-2 mb-2">
              <span className={`eyebrow ${group.isPast ? "text-jannah-mid/50 dark:text-msa-gold/40" : "text-jannah-mid dark:text-msa-gold/70"}`}>
                {group.label}
              </span>
            </div>
            <div className="space-y-2">
              {group.events.map((event) => {
                const d = new Date(event.startDate + "T12:00:00");
                const dayLabel = d.toLocaleString("en-US", { weekday: "short" });
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelected(event)}
                    className={`w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-4 group transition-all duration-200
                      ${group.isPast
                        ? "bg-muted/30 border border-border/20 hover:bg-muted/50 opacity-70 dark:opacity-35"
                        : "liquid-glass-hover"
                      }`}
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{dayLabel}</p>
                      <p className={`font-display text-lg font-bold leading-none ${group.isPast ? "text-foreground/60" : "text-foreground"}`}>{d.getDate()}</p>
                      <p className="font-body text-[10px] text-muted-foreground uppercase">{d.toLocaleString("en-US", { month: "short" })}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-display font-bold text-base leading-tight line-clamp-1 transition-colors
                        ${group.isPast ? "text-foreground/60" : "text-foreground group-hover:text-primary"}`}>
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
                      <span className={`flex-shrink-0 hidden sm:block ${group.isPast ? "opacity-50" : ""} ${event.tags[0] === "Signature" ? "tag-chip-gold" : "tag-chip"}`}>
                        {event.tags[0]}{event.tagSource === "ai" && <AiSparkle />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <EventDetailSheet event={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default AgendaView;
