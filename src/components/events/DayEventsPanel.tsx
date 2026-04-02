import { motion } from "framer-motion";
import { X, Clock, MapPin, ExternalLink } from "lucide-react";
import type { MSAEvent } from "@/data/events";

interface Props {
  date: string;
  events: MSAEvent[];
  onClose: () => void;
  getEventLink: (event: MSAEvent) => string | undefined;
}

const DayEventsPanel = ({ date, events, onClose, getEventLink }: Props) => {
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const openEventLink = (event: MSAEvent) => {
    const link = getEventLink(event);
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      className="mt-6 glass-card-strong p-4 md:p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-display text-lg font-bold text-foreground">{dateLabel}</h4>
        <button
          onClick={onClose}
          className="glass-card w-8 h-8 flex items-center justify-center hover:border-primary/30 transition-colors rounded-full"
          aria-label="Close day events"
        >
          <X size={16} className="text-foreground" />
        </button>
      </div>

      <div className="grid gap-3 max-h-[60vh] overflow-auto pr-1">
        {events.map((event) => {
          const link = getEventLink(event);

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => openEventLink(event)}
              className={`w-full rounded-xl p-3 md:p-4 border text-left overflow-hidden transition-colors ${
                event.featured
                  ? "gold-gradient text-primary-foreground border-primary/40"
                  : "bg-background/95 border-primary/15 hover:border-primary/30"
              } ${link ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h5 className="font-semibold text-sm md:text-base leading-snug break-words whitespace-normal">{event.title}</h5>
                {link && <ExternalLink size={14} className="shrink-0 opacity-80 mt-0.5" />}
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm opacity-90">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="shrink-0" />
                  {event.timeLabel}
                </span>
                {event.location && event.location !== "Location to be announced" && (
                  <span className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={13} className="shrink-0" />
                    <span className="break-words whitespace-normal">{event.location}</span>
                  </span>
                )}
              </div>

              {event.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {event.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                        event.featured
                          ? "border-primary-foreground/30 bg-primary-foreground/10"
                          : "border-primary/20 bg-primary/10 text-primary"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DayEventsPanel;
