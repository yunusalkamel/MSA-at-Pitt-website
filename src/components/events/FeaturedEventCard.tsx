import { motion } from "framer-motion";
import { MapPin, Clock, CalendarPlus, ArrowRight, Star } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import { linkifyText } from "@/lib/linkify";

interface Props {
  event: MSAEvent;
}

const FeaturedEventCard = ({ event }: Props) => {
  const day = new Date(event.startDate + "T12:00:00").getDate();
  const month = new Date(event.startDate + "T12:00:00").toLocaleString("en-US", { month: "short" }).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative group"
    >
      {/* Outer glow */}
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-primary/40 via-secondary/20 to-primary/30 opacity-60 group-hover:opacity-80 transition-opacity blur-sm" />

      <div className="relative glass-card-strong p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col lg:flex-row">
          {/* Left accent strip */}
          <div className="lg:w-56 shrink-0 gold-gradient flex flex-col items-center justify-center py-8 lg:py-0 gap-1">
            <Star size={20} className="text-primary-foreground/80 mb-1" />
            <span className="text-primary-foreground/80 text-xs font-semibold tracking-[0.15em] uppercase">
              Signature Event
            </span>
            <span className="font-display text-5xl font-bold text-primary-foreground leading-none mt-1">
              {day}
            </span>
            <span className="text-primary-foreground/90 text-sm font-semibold tracking-wider">
              {month}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-7 md:p-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="glass-card text-[11px] font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
              {event.title}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-2xl">
              {event.shortBlurb}
            </p>

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
              {event.signupUrl && (
                <a
                  href={event.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gold-gradient text-primary-foreground px-7 py-3 rounded-full text-sm font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                >
                  RSVP Now <ArrowRight size={16} />
                </a>
              )}
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
};

export default FeaturedEventCard;
