import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, ExternalLink, CalendarClock, MapPin } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import DayEventsPanel from "./DayEventsPanel";
import EventDetailSheet from "./EventDetailSheet";
import { DAYS, getDaysInMonth, getFirstDayOfMonth, formatDateStr, getTimeOnly, sortEvents, getEventTier } from "./calendar-utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props { events: MSAEvent[] }

// ── Shared event chip ─────────────────────────────────────────────────────────

const EventChip = ({
  event,
  compact = false,
  onClick,
}: {
  event: MSAEvent;
  compact?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) => {
  const isSignature = event.featured || event.isSignature;
  const isPast = event.isPast;
  const tier = getEventTier(event);
  const chipStyle = isSignature && !isPast
    ? "gold-gradient text-primary-foreground"
    : isSignature && isPast
    ? "border border-primary/35 bg-primary/[0.06] text-foreground/55 opacity-65"
    : isPast && tier === "recurring"
    ? "bg-blue-500/[0.07] text-blue-700/55 dark:text-blue-400/45 border border-blue-500/[0.12] opacity-65"
    : isPast
    ? "bg-jannah-mid/[0.07] text-jannah-mid/55 dark:text-jannah-light/45 border border-jannah-mid/[0.12] opacity-65"
    : tier === "recurring"
    ? "bg-blue-500/[0.12] text-blue-700 dark:text-blue-400 border border-blue-500/20"
    : "bg-jannah-mid/[0.12] text-jannah-mid dark:text-jannah-light border border-jannah-mid/20";

  return (
    <button
      onClick={onClick}
      title={`${event.title} · ${getTimeOnly(event.timeLabel)}${event.location ? ` · ${event.location}` : ""}`}
      className={`w-full rounded-md px-2 py-1.5 text-left overflow-hidden cursor-pointer
        ${chipStyle} hover:opacity-85 transition-opacity duration-150 ${compact ? "min-h-[36px]" : "min-h-[46px]"}`}
    >
      <div className={`font-semibold leading-tight truncate ${compact ? "text-[10px]" : "text-[11px]"}`}>
        {event.title}
      </div>
      <div className="flex items-center gap-1 mt-0.5 opacity-80">
        <Clock size={8} className="shrink-0" />
        <span className="text-[9px] truncate">{getTimeOnly(event.timeLabel)}</span>
        <ExternalLink size={8} className="shrink-0 opacity-50 ml-auto" />
      </div>
      {!compact && event.location && (
        <div className="hidden md:flex items-center gap-0.5 mt-[1px] opacity-70">
          <MapPin size={6} className="shrink-0" />
          <span className="text-[9px] truncate">{event.location}</span>
        </div>
      )}
    </button>
  );
};

// ── +N more pill ──────────────────────────────────────────────────────────────

const MorePill = ({ count, onClick }: { count: number; onClick: (e: React.MouseEvent) => void }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick(e); }}
    className="w-full rounded-md min-h-[24px] bg-primary/[0.09] border border-primary/20
      text-[9px] font-semibold text-primary px-2 py-1 text-left
      hover:bg-primary/[0.18] transition-colors leading-none flex items-center"
  >
    +{count} more
  </button>
);

// ── Month view (desktop) ──────────────────────────────────────────────────────

const MonthView = ({
  year, month, eventsByDate, todayStr, monthLabel, isCurrentMonth,
  onPrev, onNext, onGoToday, onSelectDate, onEventSelect,
}: {
  year: number; month: number; eventsByDate: Record<string, MSAEvent[]>;
  todayStr: string; monthLabel: string; isCurrentMonth: boolean;
  onPrev: () => void; onNext: () => void; onGoToday: () => void;
  onSelectDate: (date: string) => void;
  onEventSelect: (event: MSAEvent) => void;
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const handleEventClick = (ev: MSAEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(ev);
  };

  return (
    <div className="glass-card-strong p-4 md:p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-5 gap-2">
        <button onClick={onPrev} aria-label="Previous month"
          className="glass-card w-9 h-9 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0">
          <ChevronLeft size={17} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <h3 className="font-display text-lg md:text-2xl font-bold text-foreground truncate">{monthLabel}</h3>
          {!isCurrentMonth && (
            <button onClick={onGoToday}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary border border-primary/25 bg-primary/[0.06] hover:bg-primary/[0.12] transition-colors px-2.5 py-1 rounded-full">
              <CalendarClock size={11} /> Today
            </button>
          )}
        </div>
        <button onClick={onNext} aria-label="Next month"
          className="glass-card w-9 h-9 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0">
          <ChevronRight size={17} className="text-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] md:text-xs font-semibold text-muted-foreground py-1.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="min-h-[42px]" />;

          const dateStr = formatDateStr(year, month, day);
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const hasEvents = dayEvents.length > 0;
          const compact = dayEvents.length >= 3;

          return (
            <div
              key={dateStr}
              onClick={() => hasEvents && onSelectDate(dateStr)}
              className={`relative rounded-xl flex flex-col items-start p-1.5 md:p-2 border transition-all duration-200 overflow-hidden
                ${!hasEvents ? "min-h-[42px]" : ""}
                ${isToday
                  ? "border-primary/50 bg-primary/[0.08] shadow-[0_0_14px_hsl(var(--primary)/0.12)]"
                  : hasEvents
                  ? "border-primary/10 bg-primary/[0.03] hover:border-primary/25 hover:bg-primary/[0.07] cursor-pointer"
                  : "border-transparent hover:border-border/40 hover:bg-muted/20"
                }`}
            >
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
              <div className="w-full flex flex-col gap-[3px]">
                {dayEvents.map((ev, idx) => (
                  <EventChip key={`${ev.id}-${idx}`} event={ev} compact={compact} onClick={(e) => handleEventClick(ev, e)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 px-1 flex-wrap">
        {[
          { label: "Signature", color: "#F2AB23" },
          { label: "Upcoming",  color: "#148066" },
          { label: "Recurring", color: "#60A5FA" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Mobile month view — color-coded event indicators ─────────────────────────

// Change to "dots" or "pills" to switch indicator style:
const MOBILE_INDICATOR: "dots" | "pills" = "pills";

// Gold = signature, Green = special one-off, Blue = recurring (jumuah / halaqa)
// Dot/pill colors match the tier system: gold=signature, jannah=upcoming, blue=recurring
const EVENT_COLORS = {
  signature: "#F2AB23",
  upcoming:  "#148066",
  recurring: "#60A5FA",
} as const;

function getEventColor(event: MSAEvent): string {
  const tier = getEventTier(event);
  return EVENT_COLORS[tier];
}

/** Returns unique colors in priority order: gold → jannah → blue */
function uniqueEventColors(events: MSAEvent[]): string[] {
  const priority = [EVENT_COLORS.signature, EVENT_COLORS.upcoming, EVENT_COLORS.recurring];
  const used = new Set(events.map(getEventColor));
  return priority.filter((c) => used.has(c));
}

const MobileMonthView = ({
  year, month, eventsByDate, todayStr, monthLabel, isCurrentMonth,
  onPrev, onNext, onGoToday, onSelectDate,
}: {
  year: number; month: number; eventsByDate: Record<string, MSAEvent[]>;
  todayStr: string; monthLabel: string; isCurrentMonth: boolean;
  onPrev: () => void; onNext: () => void; onGoToday: () => void;
  onSelectDate: (date: string) => void;
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="glass-card-strong p-3 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <button onClick={onPrev} aria-label="Previous month"
          className="glass-card w-8 h-8 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0">
          <ChevronLeft size={15} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-display text-base font-bold text-foreground truncate">{monthLabel}</h3>
          {!isCurrentMonth && (
            <button onClick={onGoToday}
              className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-primary border border-primary/25 bg-primary/[0.06] hover:bg-primary/[0.12] transition-colors px-2 py-0.5 rounded-full">
              <CalendarClock size={10} /> Today
            </button>
          )}
        </div>
        <button onClick={onNext} aria-label="Next month"
          className="glass-card w-8 h-8 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0">
          <ChevronRight size={15} className="text-foreground" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[9px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-[3px]">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="h-14" />;
          const dateStr = formatDateStr(year, month, day);
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const hasEvents = dayEvents.length > 0;
          const colors = hasEvents ? uniqueEventColors(dayEvents) : [];

          return (
            <div
              key={dateStr}
              onClick={() => hasEvents && onSelectDate(dateStr)}
              className={`h-14 rounded-lg flex flex-col items-center pt-2 pb-1.5 gap-1 relative transition-all duration-150
                ${isToday
                  ? "ring-1 ring-primary/60 bg-primary/[0.07]"
                  : hasEvents
                  ? "cursor-pointer hover:bg-primary/[0.06]"
                  : ""}`}
            >
              {/* Day number */}
              <span className={`text-xs font-semibold leading-none
                ${isToday ? "text-primary" : hasEvents ? "text-foreground/80" : "text-muted-foreground/50"}`}>
                {day}
              </span>

              {/* Indicators */}
              {hasEvents && MOBILE_INDICATOR === "dots" && (
                <div className="flex gap-1 items-center justify-center">
                  {colors.slice(0, 3).map((color, ci) => (
                    <span
                      key={ci}
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              )}

              {hasEvents && MOBILE_INDICATOR === "pills" && (
                <div className="flex flex-col gap-[3px] w-full px-1.5">
                  {colors.slice(0, 3).map((color, ci) => (
                    <div
                      key={ci}
                      className="h-1.5 rounded-full w-full"
                      style={{ background: color, opacity: 0.85 }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 px-1 flex-wrap">
        {[
          { color: EVENT_COLORS.signature, label: "Signature" },
          { color: EVENT_COLORS.upcoming,  label: "Upcoming" },
          { color: EVENT_COLORS.recurring, label: "Recurring" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            {MOBILE_INDICATOR === "dots" ? (
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            ) : (
              <span className="w-3.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
            )}
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Week view (kept but no longer used on mobile) ─────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const WeekView = ({
  weekStart, eventsByDate, todayStr,
  onPrevWeek, onNextWeek, onGoToday, onSelectDate, onEventSelect,
}: {
  weekStart: Date; eventsByDate: Record<string, MSAEvent[]>; todayStr: string;
  onPrevWeek: () => void; onNextWeek: () => void; onGoToday: () => void;
  onSelectDate: (date: string) => void;
  onEventSelect: (event: MSAEvent) => void;
}) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weekLabel = (() => {
    const end = addDays(weekStart, 6);
    const sameMonth = weekStart.getMonth() === end.getMonth();
    if (sameMonth) {
      return `${weekStart.toLocaleString("en-US", { month: "long" })} ${weekStart.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${weekStart.toLocaleString("en-US", { month: "short" })} ${weekStart.getDate()} – ${end.toLocaleString("en-US", { month: "short" })} ${end.getDate()}, ${end.getFullYear()}`;
  })();

  const isCurrentWeek = days.some(d =>
    formatDateStr(d.getFullYear(), d.getMonth(), d.getDate()) === todayStr
  );

  const handleEventClick = (ev: MSAEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(ev);
  };

  return (
    <div className="glass-card-strong p-4 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button onClick={onPrevWeek} aria-label="Previous week"
          className="glass-card w-8 h-8 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <div className="flex flex-col items-center gap-1 min-w-0">
          <h3 className="font-display text-sm font-bold text-foreground text-center leading-tight">{weekLabel}</h3>
          {!isCurrentWeek && (
            <button onClick={onGoToday}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary border border-primary/25 bg-primary/[0.06] hover:bg-primary/[0.12] transition-colors px-2 py-0.5 rounded-full">
              <CalendarClock size={10} /> Today
            </button>
          )}
        </div>
        <button onClick={onNextWeek} aria-label="Next week"
          className="glass-card w-8 h-8 flex items-center justify-center hover:border-primary/30 transition-colors rounded-xl flex-shrink-0">
          <ChevronRight size={16} className="text-foreground" />
        </button>
      </div>

      {/* Day header row */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {days.map((d, i) => {
          const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
          const isToday = dateStr === todayStr;
          return (
            <div key={`hdr-${i}`} className="flex flex-col items-center gap-0.5 pb-1.5">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
                {DAYS[d.getDay()]}
              </span>
              <span className={`text-xs font-bold leading-none w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Event cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={`cell-${i}`}
              onClick={() => hasEvents && onSelectDate(dateStr)}
              className={`min-h-[72px] rounded-xl flex flex-col gap-[3px] p-1 border transition-all duration-200
                ${isToday
                  ? "border-primary/40 bg-primary/[0.07]"
                  : hasEvents
                  ? "border-primary/10 bg-primary/[0.02] cursor-pointer hover:bg-primary/[0.06] hover:border-primary/20"
                  : "border-transparent"
                }`}
            >
              {dayEvents.map((ev, idx) => (
                <EventChip
                  key={`${ev.id}-${idx}`}
                  event={ev}
                  compact
                  onClick={(e) => handleEventClick(ev, e)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 px-1 flex-wrap">
        {[
          { label: "Signature", color: "#F2AB23" },
          { label: "Upcoming",  color: "#148066" },
          { label: "Recurring", color: "#60A5FA" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <span className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────

const MonthCalendar = ({ events }: Props) => {
  const hasAnyEvents = events.length > 0;
  const today = new Date();
  const isMobile = useIsMobile();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MSAEvent | null>(null);

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const monthLabel = new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" });
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const eventsByDate = useMemo(() => {
    const map: Record<string, MSAEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.startDate]) map[e.startDate] = [];
      map[e.startDate].push(e);
    });
    Object.keys(map).forEach(k => { map[k] = sortEvents(map[k]); });
    return map;
  }, [events]);

  const prevMonth = useCallback(() => {
    setSelectedDate(null);
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    setSelectedDate(null);
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  }, [month]);

  const goToTodayMonth = useCallback(() => {
    setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(null);
  }, [today]);

  const prevWeek = useCallback(() => { setSelectedDate(null); setWeekStart(w => addDays(w, -7)); }, []);
  const nextWeek = useCallback(() => { setSelectedDate(null); setWeekStart(w => addDays(w, 7)); }, []);
  const goToTodayWeek = useCallback(() => { setWeekStart(getWeekStart(today)); setSelectedDate(null); }, [today]);

  return (
    <div>
      {isMobile ? (
        <MobileMonthView
          year={year}
          month={month}
          eventsByDate={eventsByDate}
          todayStr={todayStr}
          monthLabel={monthLabel}
          isCurrentMonth={isCurrentMonth}
          onPrev={prevMonth}
          onNext={nextMonth}
          onGoToday={goToTodayMonth}
          onSelectDate={setSelectedDate}
        />
      ) : (
        <MonthView
          year={year}
          month={month}
          eventsByDate={eventsByDate}
          todayStr={todayStr}
          monthLabel={monthLabel}
          isCurrentMonth={isCurrentMonth}
          onPrev={prevMonth}
          onNext={nextMonth}
          onGoToday={goToTodayMonth}
          onSelectDate={setSelectedDate}
          onEventSelect={setSelectedEvent}
        />
      )}

      {!hasAnyEvents && (
        <div className="glass-card mt-4 p-8 text-center rounded-2xl">
          <p className="font-display text-lg font-semibold text-foreground mb-1">No events found</p>
          <p className="text-muted-foreground text-sm">Try a different filter or check back soon.</p>
        </div>
      )}

      <AnimatePresence>
        {selectedDate && (
          <DayEventsPanel
            date={selectedDate}
            events={eventsByDate[selectedDate] || []}
            onClose={() => setSelectedDate(null)}
            onEventSelect={(ev) => {
              setSelectedDate(null);
              setSelectedEvent(ev);
            }}
          />
        )}
      </AnimatePresence>

      <EventDetailSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

export default MonthCalendar;
