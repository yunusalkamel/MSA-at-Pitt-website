import { motion } from "framer-motion";
import { MapPin, Clock, CalendarPlus, ArrowRight, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import type { MSAEvent } from "@/data/events";
import { linkifyText } from "@/lib/linkify";

interface Props {
  event: MSAEvent;
  index?: number;
}

const ctaConfig: Record<string, { label: string; icon: typeof ArrowRight }> = {
  rsvp: { label: "RSVP", icon: ArrowRight },
  signup: { label: "Sign Up", icon: ArrowRight },
  "join-now": { label: "Join Now", icon: ArrowRight },
  "learn-more": { label: "Learn More", icon: ArrowRight },
  "view-photos": { label: "View Photos", icon: Camera },
};

const EventCard = ({ event, index = 0 }: Props) => {
  const day = new Date(event.startDate + "T12:00:00").getDate();
  const month = new Date(event.startDate + "T12:00:00")
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
  const cta = ctaConfig[event.ctaMode || "rsvp"];
  const isPast = event.isPast;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={`group relative ${isPast ? "opacity-75" : ""}`}
    >
      {/* Hover glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

      <div className="relative glass-card-hover p-0 overflow-hidden rounded-2xl">
        <div className="flex">
          {/* Date block */}
          <div
            className={`w-20 md:w-24 shrink-0 flex flex-col items-center justify-center py-6 ${
              isPast
                ? "bg-muted/50"
                : "bg-gradient-to-b from-primary/15 to-primary/5"
            }`}
          >
            <span
              className={`text-xs font-bold tracking-wider ${
                isPast ? "text-muted-foreground" : "text-primary"
              }`}
            >
              {month}
            </span>
            <span
              className={`font-display text-3xl md:text-4xl font-bold leading-none ${
                isPast ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {day}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 md:p-6 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold uppercase tracking-wider text-primary/80 bg-primary/8 border border-primary/15 px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{event.tags.length - 3}
                </span>
              )}
            </div>

            <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-1.5 leading-snug truncate">
              {event.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
              {linkifyText(event.shortBlurb)}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-primary/70" />
                {event.timeLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-secondary/70" />
                <span className="truncate max-w-[200px]">{event.location}</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2">
              {isPast && event.galleryUrl ? (
                <Link
                  to={event.galleryUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                  <Camera size={13} /> View Photos
                </Link>
              ) : event.signupUrl ? (
                <a
                  href={event.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gold-gradient text-primary-foreground px-5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-md"
                >
                  {cta.label} <ArrowRight size={13} />
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold glass-card text-foreground">
                  {cta.label}
                </span>
              )}

              {!isPast && event.addToCalendarUrl && (
                <a
                  href={event.addToCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold glass-card text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
                >
                  <CalendarPlus size={13} /> Calendar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
