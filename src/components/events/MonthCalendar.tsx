import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, ExternalLink, CalendarClock } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import DayEventsPanel from "./DayEventsPanel";

interface Props { events: MSAEvent[] }

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function formatDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function extractLink(event: MSAEvent): string | undefined {
  const candidates = [event.signupUrl, event.fullCalendarUrl, event.addToCalendarUrl];
  for (const c of candidates) { const n = normalizeUrl(c); if (n) return n; }
  if (event.description) {
    const hrefMatch = event.description.match(/href\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch?.[1]) { const n = normalizeUrl(hrefMatch[1]); if (n) return n; }
    const match = event.description.match(/https?:\/\/[^\s<>"]+/);
    if (match) { const n = normalizeUrl(match[0]); if (n) return n; }
  }
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const c = url.trim().replace(/[),.;]+$/, "");
  if (!/^https?:\/\//i.test(c)) return undefined;
  try { return new URL(c).toString(); } catch { return undefined; }
}

function getTimeOnly(timeLabel: string): string {
  const pieces = timeLabel.split("·").map(p => p.trim()).filter(Boolean);
  return pieces.length <= 1 ? timeLabel : pieces.slice(1).join(" · ");
}

function parseStartMinutes(event: MSAEvent): number {
  const m = getTimeOnly(event.timeLabel).match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2] ?? "0");
}

function sortEvents(evs: MSAEvent[]): MSAEvent[] {
  return [...evs].sort((a, b) => {
    const td = parseStartMinutes(a) - parseStartMinutes(b);
    if (td !== 0) return td;
    return a.title.localeCompare(b.title);
  });
}

// Single event cell — full size, no click needed
const SingleEventCell = ({
  event,
  onClick,
}: {
  event: MSAEvent;
  onClick: (e: React.MouseEvent) => void;
}) => {
  const link = extractLink(event);
  const isFeatured = event.featured;
  const isPast = event.isPast;
  const chipStyle = isFeatured
    ? "gold-gradient text-primary-foreground"
    : isPast
    ? "bg-muted/80 text-foreground/70"
    : "bg-secondary/90 text-secondary-foreground";

  return (
    <button
      onClick={onClick}
      className={`w-full flex-1 rounded-lg px-1.5 py-1 text-left overflow-hidden
        ${chipStyle} ${link ? "cursor-pointer hover:opacity-85" : "cursor-default"}
        transition-opacity duration-150`}
    >
      <div className="font-semibold text-[10px] md:text-xs leading-tight break-words line-clamp-2">
        {event.title}
      </div>
      <div className="text-[8px] md:text-[10px] opacity-80 flex items-center gap-0.5 mt-0.5">
        <Clock size={7} className="shrink-0" />
        {getTimeOnly(event.timeLabel)}
        {link && <ExternalLink size={7} className="shrink-0 opacity-60 ml-auto" />}
      </div>
    </button>
  );
};

// Static chip for multi-event cells — no expand behavior
const EventChip = ({
  event,
  onClick,
}: {
  event: MSAEvent;
  onClick: (e: React.MouseEvent) => void;
}) => {
  const link = extractLink(event);
  const isFeatured = event.featured;
  const isPast = event.isPast;
  const chipStyle = isFeatured
    ? "gold-gradient text-primary-foreground"
    : isPast
    ? "bg-muted/80 text-foreground/70"
    : "bg-secondary/90 text-secondary-foreground";

  return (
    <button
      onClick={onClick}
      title={`${event.title} · ${getTimeOnly(event.timeLabel)}`}
      className={`w-full rounded-md px-1 md:px-1.5 py-[3px] text-left overflow-hidden
        ${chipStyle} ${link ? "cursor-pointer hover:opacity-85" : "cursor-default"}
        transition-opacity duration-150`}
    >
      <div className="font-semibold text-[8px] md:text-[10px] leading-tight truncate">
        {event.title}
      </div>
    </button>
  );
};

const MonthCalendar = ({ events }: Props) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthLabel = new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" });
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const eventsByDate = useMemo(() => {
    const map: Record<string, MSAEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.startDate]) map[e.startDate] = [];
      map[e.startDate].push(e);
    });
    Object.keys(map).forEach(k => { map[k] = sortEvents(map[k]); });
    return map;
  }, [events]);

  const prev = useCallback(() => {
    setSelectedDate(null);
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  }, [month]);

  const next = useCallback(() => {
    setSelectedDate(null);
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  }, [month]);

  const goToToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(null);
  }, [today]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const handleEventClick = (ev: MSAEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = extractLink(ev);
    if (link) { window.open(link, "_blank", "noopener,noreferrer"); return; }
    setSelectedDate(ev.startDate);
  };

  return (
    <div>
      <div className="glass-card-strong p-4 md:p-6 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 gap-2">
          <button onClick={prev} aria-label="Previous month"
            className="glass-card w-9 h-9 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0">
            <ChevronLeft size={17} className="text-foreground" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <h3 className="font-display text-lg md:text-2xl font-bold text-foreground truncate">{monthLabel}</h3>
            {!isCurrentMonth && (
              <button onClick={goToToday}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary border border-primary/25 bg-primary/[0.06] hover:bg-primary/[0.12] transition-colors px-2.5 py-1 rounded-full">
                <CalendarClock size={11} /> Today
              </button>
            )}
          </div>

          <button onClick={next} aria-label="Next month"
            className="glass-card w-9 h-9 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0">
            <ChevronRight size={17} className="text-foreground" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] md:text-xs font-semibold text-muted-foreground py-1.5">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="min-h-[72px] md:min-h-[92px]" />;

            const dateStr = formatDateStr(year, month, day);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const hasEvents = dayEvents.length > 0;
            const isSingle = dayEvents.length === 1;
            const hiddenCount = Math.max(dayEvents.length - 2, 0);
            const visibleEvents = dayEvents.slice(0, 2);

            return (
              <div
                key={dateStr}
                onClick={() => dayEvents.length > 1 && setSelectedDate(dateStr)}
                className={`group relative min-h-[72px] md:min-h-[92px] rounded-xl flex flex-col items-start p-1.5 md:p-2 border transition-all duration-200 overflow-hidden
                  ${isToday
                    ? "border-primary/50 bg-primary/[0.08] shadow-[0_0_14px_hsl(var(--primary)/0.12)]"
                    : hasEvents
                    ? "border-primary/10 bg-primary/[0.03] hover:border-primary/25 hover:bg-primary/[0.07]"
                    : "border-transparent hover:border-border/40 hover:bg-muted/20"
                  } ${dayEvents.length > 1 ? "cursor-pointer" : "cursor-default"}`}
              >
                {/* Today dot */}
                {isToday && (
                  <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                  </span>
                )}

                <span className={`font-semibold text-[11px] md:text-sm shrink-0 leading-none mb-1.5
                  ${isToday ? "text-primary" : hasEvents ? "text-foreground" : "text-muted-foreground"}`}>
                  {day}
                </span>

                <div className="w-full flex flex-col gap-[3px] flex-1 min-h-0">
                  {isSingle ? (
                    // Single event: full size treatment
                    <SingleEventCell event={dayEvents[0]} onClick={(e) => handleEventClick(dayEvents[0], e)} />
                  ) : (
                    // Multiple events: compressed with expand on hover
                    <>
                      {visibleEvents.map((ev, idx) => (
                        <EventChip key={`${ev.id}-${idx}`} event={ev} onClick={(e) => handleEventClick(ev, e)} />
                      ))}
                      {hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedDate(dateStr); }}
                          className="rounded-md bg-primary/[0.1] border border-primary/20 text-[9px] md:text-[10px] font-semibold text-primary px-1 md:px-1.5 py-[2px] text-left hover:bg-primary/20 transition-colors"
                        >
                          +{hiddenCount} more
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 px-1 flex-wrap">
          {[
            { label: "Signature", style: "gold-gradient" },
            { label: "Upcoming", style: "bg-secondary" },
            { label: "Past", style: "bg-muted" },
          ].map(({ label, style }) => (
            <span key={label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`w-2.5 h-2.5 rounded-[3px] flex-shrink-0 ${style}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <DayEventsPanel
            date={selectedDate}
            events={eventsByDate[selectedDate] || []}
            onClose={() => setSelectedDate(null)}
            getEventLink={extractLink}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonthCalendar;
