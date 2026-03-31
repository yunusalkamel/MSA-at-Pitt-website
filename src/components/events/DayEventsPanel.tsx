import { motion } from "framer-motion";
import { X } from "lucide-react";
import EventCard from "./EventCard";
import type { MSAEvent } from "@/data/events";

interface Props {
  date: string;
  events: MSAEvent[];
  onClose: () => void;
}

const DayEventsPanel = ({ date, events, onClose }: Props) => {
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="mt-6 glass-card-strong p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-display text-lg font-bold text-foreground">{dateLabel}</h4>
        <button
          onClick={onClose}
          className="glass-card w-8 h-8 flex items-center justify-center hover:border-primary/30 transition-colors rounded-full"
        >
          <X size={16} className="text-foreground" />
        </button>
      </div>
      <div className="grid gap-4">
        {events.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </motion.div>
  );
};

export default DayEventsPanel;
