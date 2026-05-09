import { motion } from "framer-motion";
import { ArrowRight, CalendarPlus, Camera, Clock, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { MSAEvent } from "@/data/events";
import { linkifyText } from "@/lib/linkify";
import { resolveEventAction } from "./resolveEventAction";
import { getEventTier, getTagChipClass } from "./calendar-utils";

const AiSparkle = () => (
  <span
    title="AI-assisted tag"
    className="inline-block ml-0.5 opacity-25 select-none pointer-events-none text-[7px] leading-none align-super"
    aria-hidden="true"
  >✦</span>
);

interface Props {
  event: MSAEvent;
  variant?: "standard" | "featured";
  index?: number;
  /**
   * For "featured" variant only — controls whether the gold "Signature Event"
   * sash on the left rail is shown. Defaults to false. Pass `true` only when
   * the event is *actually* tagged Signature (caller's responsibility).
   */
  showSignatureBadge?: boolean;
}

const EventCardBase = ({ event, variant = "standard", index = 0, showSignatureBadge = false }: Props) => {
  const day = new Date(event.startDate + "T12:00:00").getDate();
  const month = new Date(event.startDate + "T12:00:00")
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();

  const isPast = event.isPast;
  const isFeatured = variant === "featured";
  const tier = getEventTier(event);
  const action = resolveEventAction(event);

  const renderAction = () => {
    if (!action.href) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold glass-card text-foreground">
          {action.label}
        </span>
      );
    }

    const actionBody = (
      <>
        {action.kind === "gallery" && <Camera size={isFeatured ? 14 : 12} />}
        {action.label}
        {action.kind !== "gallery" && <ArrowRight size={isFeatured ? 16 : 12} />}
      </>
    );

    const classes = isFeatured
      ? "btn-premium text-sm px-7 py-3"
      : "btn-premium text-xs px-4 py-1.5";

    if (action.external) {
      return (
        <a href={action.href} target="_blank" rel="noopener noreferrer" className={classes}>
          {actionBody}
        </a>
      );
    }

    return (
      <Link to={action.href} className={classes}>
        {actionBody}
      </Link>
    );
  };

  if (isFeatured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative group"
      >
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-primary/40 via-secondary/20 to-primary/30 opacity-60 group-hover:opacity-80 transition-opacity blur-sm" />

        <div className="relative glass-card-strong p-0 overflow-hidden rounded-2xl">
          <div className="flex flex-col lg:flex-row">
            {/* Left rail: gold for Signature, neutral primary for plain "Up Next" featured */}
            <div className={`lg:w-56 shrink-0 flex flex-col items-center justify-center py-8 lg:py-0 gap-1 ${
              showSignatureBadge ? "gold-gradient" : "bg-gradient-to-br from-primary/20 to-secondary/15"
            }`}>
              {showSignatureBadge && (
                <>
                  <Star size={20} className="text-primary-foreground/80 mb-1" />
                  <span className="text-primary-foreground/80 text-xs font-semibold tracking-[0.15em] uppercase">
                    Signature Event
                  </span>
                </>
              )}
              <span className={`font-display text-5xl font-bold leading-none ${showSignatureBadge ? "text-primary-foreground mt-1" : "text-foreground"}`}>
                {day}
              </span>
              <span className={`text-sm font-semibold tracking-wider ${showSignatureBadge ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                {month}
              </span>
            </div>

            <div className="flex-1 p-7 md:p-10">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.tags.map((tag) => (
                  <span key={tag} className={getTagChipClass(tier, isPast)}>
                    {tag}{event.tagSource === "ai" && <AiSparkle />}
                  </span>
                ))}
              </div>

              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">{event.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-2xl">{linkifyText(event.shortBlurb)}</p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-7">
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  {event.timeLabel}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-secondary" />
                  {event.location}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {renderAction()}
                {event.addToCalendarUrl && (
                  <a
                    href={event.addToCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card-hover inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground rounded-full"
                  >
                    <CalendarPlus size={16} className="text-primary" />
                    Add to Calendar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative ${isPast ? "opacity-70" : ""}`}
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/15 via-transparent to-secondary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

      <div className="relative liquid-glass-hover p-0 overflow-hidden rounded-2xl">
        <div className="flex">
          <div className={`w-16 md:w-20 shrink-0 flex flex-col items-center justify-center py-6 gap-0.5
            ${isPast
              ? "bg-muted/40"
              : tier === "recurring"
              ? "bg-gradient-to-b from-blue-500/15 to-blue-500/5"
              : tier === "signature"
              ? "bg-gradient-to-b from-primary/18 to-primary/6"
              : "bg-gradient-to-b from-jannah-mid/15 to-jannah-mid/5"
            }`}
          >
            <span className={`text-[10px] font-bold tracking-widest uppercase
              ${isPast ? "text-muted-foreground" : tier === "recurring" ? "text-blue-600 dark:text-blue-400" : tier === "signature" ? "text-primary" : "text-jannah-mid"}`}>
              {month}
            </span>
            <span className={`font-display text-3xl md:text-4xl font-bold leading-none
              ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
              {day}
            </span>
          </div>

          <div className="flex-1 p-5 md:p-6 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {event.tags.slice(0, 3).map((tag) => (
                <span key={tag} className={getTagChipClass(tier, isPast)}>
                  {tag}{event.tagSource === "ai" && <AiSparkle />}
                </span>
              ))}
              {event.tags.length > 3 && <span className="text-[10px] text-muted-foreground/70 flex items-center">+{event.tags.length - 3}</span>}
            </div>

            <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-1.5 leading-snug line-clamp-1">{event.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">{linkifyText(event.shortBlurb)}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Clock size={11} className="text-primary/60" />
                {event.timeLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={11} className="text-secondary/60" />
                <span className="truncate max-w-[180px]">{event.location}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {renderAction()}
              {!isPast && event.addToCalendarUrl && (
                <a
                  href={event.addToCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium glass-card text-muted-foreground hover:text-foreground hover:border-border transition-all"
                >
                  <CalendarPlus size={11} /> Add
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCardBase;
