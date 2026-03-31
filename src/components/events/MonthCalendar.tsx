import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    return map;
  }, [events]);

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="glass-card-strong p-4 md:p-6 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prev}
            className="glass-card w-10 h-10 flex items-center justify-center hover:border-primary/30 transition-colors"
          >
            <ChevronLeft size={18} className="text-foreground" />
          </button>
          <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
            {monthLabel}
          </h3>
          <button
            onClick={next}
            className="glass-card w-10 h-10 flex items-center justify-center hover:border-primary/30 transition-colors"
          >
            <ChevronRight size={18} className="text-foreground" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null)
              return <div key={`empty-${i}`} className="aspect-square" />;

            const dateStr = formatDateStr(year, month, day);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={dateStr}
                onClick={() => hasEvents && setSelectedDate(dateStr)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 md:pt-2 text-sm border transition-all duration-300 ${
                  isToday
                    ? "border-primary/40 bg-primary/10 shadow-[0_0_16px_hsl(40_100%_55%/0.15)]"
                    : hasEvents
                    ? "border-primary/10 bg-primary/5 hover:border-primary/30 hover:bg-primary/10 hover:scale-110 hover:z-10 hover:shadow-[0_0_20px_hsl(40_100%_55%/0.15)]"
                    : "border-transparent hover:border-border/50 hover:bg-muted/30"
                } ${hasEvents ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`font-semibold text-xs md:text-sm ${
                    isToday ? "text-primary" : hasEvents ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {day}
                </span>

                {/* Event pills — more visible */}
                <div className="flex flex-col gap-0.5 mt-1 w-full px-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`h-1.5 md:h-2 rounded-full w-full ${
                        ev.featured
                          ? "gold-gradient shadow-[0_0_6px_hsl(40_100%_55%/0.4)]"
                          : ev.isPast
                          ? "bg-muted-foreground/40"
                          : "bg-secondary"
                      }`}
                      title={ev.title}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-primary font-semibold text-center">
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>

                {/* Event count badge for days with events */}
                {hasEvents && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full gold-gradient flex items-center justify-center shadow-md">
                    <span className="text-[8px] font-bold text-primary-foreground">{dayEvents.length}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      <AnimatePresence>
        {selectedDate && (
          <DayEventsPanel
            date={selectedDate}
            events={eventsByDate[selectedDate] || []}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonthCalendar;
