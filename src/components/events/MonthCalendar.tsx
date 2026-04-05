import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, ExternalLink, CalendarClock } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import DayEventsPanel from "./DayEventsPanel";

interface Props {
  events: MSAEvent[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function extractLink(event: MSAEvent): string | undefined {
  const candidates = [event.signupUrl, event.fullCalendarUrl, event.addToCalendarUrl];
  for (const candidate of candidates) {
    const normalized = normalizeHttpUrl(candidate);
    if (normalized) return normalized;
  }
  if (event.description) {
    const hrefMatch = event.description.match(/href\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch?.[1]) {
      const normalized = normalizeHttpUrl(hrefMatch[1]);
      if (normalized) return normalized;
    }
    const match = event.description.match(/https?:\/\/[^\s<>"]+/);
    if (match) {
      const normalized = normalizeHttpUrl(match[0]);
      if (normalized) return normalized;
    }
  }
  return undefined;
}

function normalizeHttpUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const cleaned = url.trim().replace(/[),.;]+$/, "");
  if (!/^https?:\/\//i.test(cleaned)) return undefined;
  try {
    return new URL(cleaned).toString();
  } catch {
    return undefined;
  }
}

function getTimeOnlyLabel(timeLabel: string): string {
  const pieces = timeLabel.split("·").map((p) => p.trim()).filter(Boolean);
  if (pieces.length <= 1) return timeLabel;
  return pieces.slice(1).join(" · ");
}

function parseEventStartMinutes(event: MSAEvent): number {
  const timeOnly = getTimeOnlyLabel(event.timeLabel);
  const timeMatch = timeOnly.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!timeMatch) return Number.MAX_SAFE_INTEGER;
  const rawHours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2] ?? "0");
  const meridiem = timeMatch[3].toUpperCase();
  let hours24 = rawHours % 12;
  if (meridiem === "PM") hours24 += 12;
  return hours24 * 60 + minutes;
}

function sortDayEvents(evs: MSAEvent[]): MSAEvent[] {
  return [...evs].sort((a, b) => {
    const td = parseEventStartMinutes(a) - parseEventStartMinutes(b);
    if (td !== 0) return td;
    const titleD = a.title.localeCompare(b.title);
    if (titleD !== 0) return titleD;
    return a.id.localeCompare(b.id);
  });
}

function getEventKey(event: MSAEvent, index: number): string {
  return `${event.id}-${event.startDate}-${event.timeLabel}-${index}`;
}

const MonthCalendar = ({ events }: Props) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthLabel = new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" });
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const eventsByDate = useMemo(() => {
    const map: Record<string, MSAEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.startDate]) map[e.startDate] = [];
      map[e.startDate].push(e);
    });
    Object.keys(map).forEach((dateKey) => { map[dateKey] = sortDayEvents(map[dateKey]); });
    return map;
  }, [events]);

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Clear selected panel whenever navigating between months
  const prev = useCallback(() => {
    setSelectedDate(null);
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const next = useCallback(() => {
    setSelectedDate(null);
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
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
          <button
            onClick={prev}
            aria-label="Previous month"
            className="glass-card w-9 h-9 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0"
          >
            <ChevronLeft size={17} className="text-foreground" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <h3 className="font-display text-lg md:text-2xl font-bold text-foreground truncate">
              {monthLabel}
            </h3>
            {!isCurrentMonth && (
              <button
                onClick={goToToday}
                title="Go to today"
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary border border-primary/25 bg-primary/[0.06] hover:bg-primary/[0.12] transition-colors px-2.5 py-1 rounded-full"
              >
                <CalendarClock size={11} />
                Today
              </button>
            )}
          </div>

          <button
            onClick={next}
            aria-label="Next month"
            className="glass-card w-9 h-9 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0"
          >
            <ChevronRight size={17} className="text-foreground" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] md:text-xs font-semibold text-muted-foreground py-1.5">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null)
              return <div key={`empty-${i}`} className="min-h-[72px] md:min-h-[90px]" />;

            const dateStr = formatDateStr(year, month, day);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const hasEvents = dayEvents.length > 0;
            const visibleEvents = dayEvents.slice(0, 2);
            const hiddenCount = Math.max(dayEvents.length - 2, 0);

            return (
              <div
                key={dateStr}
                onClick={() => hasEvents && setSelectedDate(dateStr)}
                className={`group relative min-h-[72px] md:min-h-[90px] rounded-xl flex flex-col items-start p-1.5 md:p-2 border transition-all duration-200 overflow-hidden
                  ${isToday
                    ? "border-primary/50 bg-primary/[0.08] shadow-[0_0_14px_hsl(var(--primary)/0.12)]"
                    : hasEvents
                    ? "border-primary/10 bg-primary/[0.04] hover:border-primary/30 hover:bg-primary/[0.08]"
                    : "border-transparent hover:border-border/40 hover:bg-muted/20"
                  } ${hasEvents ? "cursor-pointer" : "cursor-default"}`}
              >
                {/* Pulsing today indicator */}
                {isToday && (
                  <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                  </span>
                )}

                <span className={`font-semibold text-[11px] md:text-sm mb-1 shrink-0 leading-none
                  ${isToday ? "text-primary" : hasEvents ? "text-foreground" : "text-muted-foreground"}`}>
                  {day}
                </span>

                <div className="w-full flex flex-col gap-[3px] flex-1 min-h-0">
                  {visibleEvents.map((ev, eventIndex) => {
                    const chipStyle = ev.featured
                      ? "gold-gradient text-primary-foreground"
                      : ev.isPast
                      ? "bg-muted/80 text-foreground/70"
                      : "bg-secondary/90 text-secondary-foreground";
                    const link = extractLink(ev);

                    return (
                      <motion.button
                        key={getEventKey(ev, eventIndex)}
                        layout
                        onClick={(e) => handleEventClick(ev, e)}
                        title={ev.title}
                        className={`w-full rounded-[5px] px-1 md:px-1.5 py-[3px] text-left overflow-hidden transition-opacity duration-150
                          ${chipStyle} ${link ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                      >
                        <div className="font-semibold text-[8px] md:text-[10px] leading-tight line-clamp-2 break-words">
                          {ev.title}
                        </div>
                        <div className="text-[7px] md:text-[9px] opacity-75 truncate flex items-center gap-0.5 mt-[1px]">
                          <Clock size={6} className="shrink-0" />
                          {getTimeOnlyLabel(ev.timeLabel)}
                          {link && <ExternalLink size={6} className="shrink-0 opacity-60 ml-auto" />}
                        </div>
                      </motion.button>
                    );
                  })}

                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedDate(dateStr); }}
                      className="rounded-[5px] bg-primary/[0.12] border border-primary/20 text-[9px] md:text-[10px] font-semibold text-primary px-1 md:px-1.5 py-[2px] text-left hover:bg-primary/20 transition-colors"
                    >
                      +{hiddenCount} more
                    </button>
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
