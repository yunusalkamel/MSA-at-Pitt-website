import { motion } from "framer-motion";
import { List, CalendarDays } from "lucide-react";

interface Props {
  view: "upcoming" | "month";
  onChange: (view: "upcoming" | "month") => void;
}

const EventsViewToggle = ({ view, onChange }: Props) => (
  <div className="glass-card inline-flex p-1 gap-1">
    {(["upcoming", "month"] as const).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-[calc(var(--radius)-4px)] text-sm font-semibold transition-colors duration-200 ${
          view === v ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {view === v && (
          <motion.div
            layoutId="events-view-pill"
            className="absolute inset-0 gold-gradient rounded-[calc(var(--radius)-4px)] shadow-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {v === "upcoming" ? <List size={16} /> : <CalendarDays size={16} />}
          {v === "upcoming" ? "Upcoming" : "Month"}
        </span>
      </button>
    ))}
  </div>
);

export default EventsViewToggle;
