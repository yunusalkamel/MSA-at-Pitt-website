import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, CalendarPlus, Clock, ExternalLink, MapPin, X } from "lucide-react";
import type { MSAEvent } from "@/data/events";
import { LINKS } from "@/config/links";

interface Props {
  event: MSAEvent | null;
  onClose: () => void;
}

const EventDetailSheet = ({ event, onClose }: Props) => {
  if (!event) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
  const actionUrl = event.signupUrl || event.fullCalendarUrl || LINKS.linktree;
  const isRsvp = !!event.signupUrl;

  return (
    <DialogPrimitive.Root open={!!event} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content — bottom sheet on mobile, centered modal on sm+ */}
        <DialogPrimitive.Content
          className="fixed z-50 bg-background shadow-2xl outline-none
            bottom-0 left-0 right-0 rounded-t-3xl rounded-b-none max-h-[92dvh] overflow-y-auto
            sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
            sm:max-w-lg sm:w-full sm:rounded-2xl sm:max-h-[90dvh]
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom
            sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95
            sm:data-[state=closed]:zoom-out-95
            duration-200"
        >
          {/* Drag handle — mobile only */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border/60" />
          </div>

          {/* BridgeBar accent */}
          <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #F2AB23, #148066)" }} />

          {/* Close button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors z-10">
            <X size={16} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <div className="p-6 pt-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3 pr-8">
              {event.tags.map((tag) => (
                <span key={tag} className={tag === "Signature" ? "tag-chip-gold" : "tag-chip"}>{tag}</span>
              ))}
            </div>

            {/* Title */}
            <h2 className="font-display text-2xl font-bold text-foreground mb-4 leading-tight pr-4">
              {event.title}
            </h2>

            {/* Time + Location */}
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock size={14} className="text-primary flex-shrink-0" />
                <span className="font-satoshi">{event.timeLabel}</span>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <MapPin size={14} className="text-secondary flex-shrink-0" />
                <span className="font-satoshi group-hover:underline">{event.location}</span>
                <span className="text-[10px] text-primary/60 font-semibold flex-shrink-0">(open in maps)</span>
              </a>
            </div>

            {/* Description */}
            {event.shortBlurb && (
              <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-5">
                {event.shortBlurb}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium flex-1 justify-center"
              >
                {isRsvp ? (
                  <>RSVP <ArrowRight size={13} /></>
                ) : (
                  <>More Details <ExternalLink size={13} /></>
                )}
              </a>
              {event.addToCalendarUrl && (
                <a
                  href={event.addToCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-premium-secondary flex-1 justify-center text-sm"
                >
                  <CalendarPlus size={14} /> Add to Calendar
                </a>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default EventDetailSheet;
