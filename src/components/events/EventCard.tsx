import type { MSAEvent } from "@/data/events";
import EventCardBase from "./EventCardBase";

interface Props {
  event: MSAEvent;
  index?: number;
}

const EventCard = ({ event, index = 0 }: Props) => {
  const day = new Date(event.startDate + "T12:00:00").getDate();
  const month = new Date(event.startDate + "T12:00:00")
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
  const isPast = event.isPast;
  const cta = event.ctaMode || "rsvp";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative ${isPast ? "opacity-70" : ""}`}
    >
      {/* Hover glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/15 via-transparent to-secondary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

      <div className="relative liquid-glass-hover p-0 overflow-hidden rounded-2xl">
        <div className="flex">
          {/* Date column */}
          <div className={`w-16 md:w-20 shrink-0 flex flex-col items-center justify-center py-6 gap-0.5
            ${isPast ? "bg-muted/40" : "bg-gradient-to-b from-primary/12 to-primary/4"}`}
          >
            <span className={`text-[10px] font-bold tracking-widest uppercase
              ${isPast ? "text-muted-foreground" : "text-primary"}`}>
              {month}
            </span>
            <span className={`font-display text-3xl md:text-4xl font-bold leading-none
              ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
              {day}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 md:p-6 min-w-0">
            {/* Tags — emerald chips by default, gold only for Signature */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {event.tags.slice(0, 3).map((tag) => (
                <span key={tag} className={
                  tag === "Signature Event"
                    ? "tag-chip-gold"
                    : isPast
                    ? "tag-chip-muted"
                    : "tag-chip"
                }>
                  {tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground/70 flex items-center">
                  +{event.tags.length - 3}
                </span>
              )}
            </div>

            <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-1.5 leading-snug line-clamp-1">
              {event.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
              {linkifyText(event.shortBlurb)}
            </p>

            <div className="md:hidden text-xs text-muted-foreground mb-4 space-y-1">
              <p className="flex items-center gap-1.5">
                <Clock size={12} className="text-primary/60 shrink-0" />
                <span className="truncate">{event.timeLabel}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin size={12} className="text-secondary/60 shrink-0" />
                <span className="truncate">{event.location}</span>
              </p>
            </div>

            <div className="hidden md:flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Clock size={11} className="text-primary/60" />
                {event.timeLabel}
              </span>
              <span className="flex items-center gap-1.5 min-w-0">
                <MapPin size={11} className="text-secondary/60 shrink-0" />
                <span className="truncate max-w-[180px]">{event.location}</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2">
              {isPast && event.galleryUrl ? (
                <Link
                  to={event.galleryUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                  <Camera size={12} /> View Photos
                </Link>
              ) : event.signupUrl ? (
                <a
                  href={event.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-premium text-xs px-4 py-1.5"
                >
                  {cta === "signup" ? "Sign Up" : cta === "join-now" ? "Join Now" : "RSVP"} <ArrowRight size={12} />
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold glass-card text-foreground">
                  {cta === "learn-more" ? "Learn More" : "Details"}
                </span>
              )}

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

export default EventCard;
