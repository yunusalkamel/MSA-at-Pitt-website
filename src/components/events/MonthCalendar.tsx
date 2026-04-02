import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, ExternalLink } from "lucide-react";
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
  if (event.signupUrl) return event.signupUrl;
  if (event.fullCalendarUrl) return event.fullCalendarUrl;
  if (event.description) {
    const hrefMatch = event.description.match(/href\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch?.[1]) return hrefMatch[1];
    const match = event.description.match(/https?:\/\/[^\s<>"]+/);
    if (match) return match[0];
  }
  return event.addToCalendarUrl;
}

function getTimeOnlyLabel(timeLabel: string): string {
  const pieces = timeLabel
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
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

function sortDayEvents(events: MSAEvent[]): MSAEvent[] {
  return [...events].sort((a, b) => {
    const timeDelta = parseEventStartMinutes(a) - parseEventStartMinutes(b);
    if (timeDelta !== 0) return timeDelta;

    const titleDelta = a.title.localeCompare(b.title);
    if (titleDelta !== 0) return titleDelta;

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
  const monthLabel = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const eventsByDate = useMemo(() => {
    const map: Record<string, MSAEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.startDate]) map[e.startDate] = [];
      map[e.startDate].push(e);
    });

    Object.keys(map).forEach((dateKey) => {
      map[dateKey] = sortDayEvents(map[dateKey]);
    });

    return map;
  }, [events]);

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };

  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const handleEventClick = (ev: MSAEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = extractLink(ev);
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }
    setSelectedDate(ev.startDate);
  };

  return (
    <div>
      <div className="glass-card-strong p-4 md:p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prev}
            className="glass-card w-10 h-10 flex items-center justify-center hover:border-primary/30 transition-colors"
          >
            <ChevronLeft size={18} className="text-foreground" />
          </button>
          <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">{monthLabel}</h3>
          <button
            onClick={next}
            className="glass-card w-10 h-10 flex items-center justify-center hover:border-primary/30 transition-colors"
          >
            <ChevronRight size={18} className="text-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;

            const dateStr = formatDateStr(year, month, day);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const hasEvents = dayEvents.length > 0;
            const visibleEvents = dayEvents.slice(0, 2);
            const hiddenCount = Math.max(dayEvents.length - 2, 0);
            const rowCount = dayEvents.length >= 3 ? 3 : Math.max(dayEvents.length, 1);

            return (
              <div
                key={dateStr}
                onClick={() => hasEvents && setSelectedDate(dateStr)}
                className={`group relative aspect-square rounded-xl flex flex-col items-start p-1.5 md:p-2 text-sm border transition-all duration-300 overflow-hidden ${
                  isToday
                    ? "border-primary/40 bg-primary/10 shadow-[0_0_16px_hsl(var(--primary)/0.15)]"
                    : hasEvents
                    ? "border-primary/10 bg-primary/5 hover:border-primary/30 hover:bg-primary/10"
                    : "border-transparent hover:border-border/50 hover:bg-muted/30"
                } ${hasEvents ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`font-semibold text-xs md:text-sm mb-1 shrink-0 ${
                    isToday ? "text-primary" : hasEvents ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {day}
                </span>

                <div
                  className="w-full min-h-0 flex-1 grid gap-1"
                  style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
                >
                  {visibleEvents.map((ev, eventIndex) => {
                    const sharedStyles = ev.featured
                      ? "gold-gradient text-primary-foreground shadow-[0_0_6px_hsl(var(--primary)/0.3)]"
                      : ev.isPast
                      ? "bg-muted text-foreground/80"
                      : "bg-secondary text-secondary-foreground";

                    const link = extractLink(ev);

                    return (
                      <motion.button
                        key={getEventKey(ev, eventIndex)}
                        layout
                        onClick={(e) => handleEventClick(ev, e)}
                        className={`w-full h-full rounded-md px-1.5 md:px-2 py-1 text-left transition-colors overflow-hidden border border-transparent hover:border-primary/25 ${sharedStyles} ${
                          link ? "cursor-pointer" : "cursor-default"
                        }`}
                        title={ev.title}
                      >
                        <div className="font-semibold text-[9px] md:text-[10px] leading-tight line-clamp-2 break-words">
                          {ev.title}
                        </div>
                        <div className="text-[8px] md:text-[9px] opacity-80 truncate flex items-center gap-0.5 mt-0.5">
                          <Clock size={7} className="shrink-0" />
                          {getTimeOnlyLabel(ev.timeLabel)}
                          {link && <ExternalLink size={7} className="shrink-0 opacity-70 ml-auto" />}
                        </div>
                      </motion.button>
                    );
                  })}

                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(dateStr);
                      }}
                      className="rounded-md bg-primary/15 border border-primary/25 text-[10px] md:text-xs font-semibold text-primary px-2 text-left hover:bg-primary/20 transition-colors"
                    >
                      +{hiddenCount} more
                    </button>
                  )}

                  {!hasEvents && <div className="rounded-md bg-transparent" />}
                </div>
              </div>
            );
          })}
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
