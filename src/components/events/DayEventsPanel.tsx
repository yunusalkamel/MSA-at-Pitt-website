import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Clock, MapPin, ExternalLink, Tag } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import { resolveEventAction } from "./resolveEventAction";

interface Props {
  date: string;
  events: MSAEvent[];
  onClose: () => void;
  onEventSelect?: (event: MSAEvent) => void;
}

const DayEventsPanel = ({ date, events, onClose, onEventSelect }: Props) => {
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    // Also prevent body scroll while panel is open
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscape);
    };
  }, [onClose]);

  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const openEventLink = (event: MSAEvent) => {
    if (onEventSelect) {
      onEventSelect(event);
      return;
    }
    const action = resolveEventAction(event);
    if (!action.href) return;
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.assign(action.href);
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/75 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-2xl glass-card-strong rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/40">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-primary font-semibold mb-0.5">
              Schedule
            </p>
            <h4 className="font-display text-lg font-bold text-foreground">{dateLabel}</h4>
          </div>
          <button
            onClick={onClose}
            className="glass-card w-8 h-8 flex items-center justify-center hover:border-primary/30 transition-colors rounded-full flex-shrink-0"
            aria-label="Close"
          >
            <X size={15} className="text-foreground" />
          </button>
        </div>

        {/* Event list */}
        <div className="max-h-[65vh] overflow-y-auto overscroll-contain p-4 md:p-5 grid gap-3">
          {events.map((event, index) => {
            const action = resolveEventAction(event);
            const link = action.href;
            const isFeatured = event.featured;
            const isPast = event.isPast;

            return (
              <button
                key={`${event.id}-${event.startDate}-${event.timeLabel}-${index}`}
                type="button"
                onClick={() => openEventLink(event)}
                className={`w-full rounded-xl p-4 border text-left transition-all duration-200 group
                  ${isFeatured
                    ? "gold-gradient text-primary-foreground border-primary/40 shadow-lg"
                    : isPast
                    ? "bg-muted/40 border-border/30 hover:border-border/60"
                    : "bg-background/90 border-primary/12 hover:border-primary/30 hover:bg-primary/[0.03]"
                  } ${link ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h5 className={`font-semibold text-sm md:text-base leading-snug break-words
                    ${isFeatured ? "text-primary-foreground" : "text-foreground"}`}>
                    {event.title}
                  </h5>
                  {link && (
                    <ExternalLink
                      size={13}
                      className={`shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                        ${isFeatured ? "opacity-80" : "text-primary opacity-60"}`}
                    />
                  )}
                </div>

                <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs
                  ${isFeatured ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="shrink-0" />
                    {event.timeLabel}
                  </span>
                  {event.location && event.location !== "Location to be announced" && (
                    <span className="flex items-center gap-1.5 min-w-0">
                      <MapPin size={12} className="shrink-0" />
                      <span className="break-words whitespace-normal">{event.location}</span>
                    </span>
                  )}
                </div>

                {event.shortBlurb && (
                  <p className={`mt-2 text-xs leading-relaxed line-clamp-2
                    ${isFeatured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {event.shortBlurb}
                  </p>
                )}

                {event.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                    <Tag size={10} className={`shrink-0 ${isFeatured ? "text-primary-foreground/50" : "text-primary/40"}`} />
                    {event.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border
                          ${isFeatured
                            ? "border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground/90"
                            : "border-primary/15 bg-primary/[0.07] text-primary/90"
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

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {events.length} event{events.length !== 1 ? "s" : ""} on this day
          </span>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
};

export default DayEventsPanel;
