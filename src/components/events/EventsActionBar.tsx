import { motion } from "framer-motion";
import { Apple, Calendar, ExternalLink, PenLine } from "lucide-react";
import {
  GOOGLE_CALENDAR_URL,
  APPLE_CALENDAR_URL,
  EVENT_SIGNUP_HUB_URL,
} from "@/data/events";

const actions = [
  { label: "Google Calendar", icon: Calendar, href: GOOGLE_CALENDAR_URL, accent: true },
  { label: "Apple Calendar", icon: Apple, href: APPLE_CALENDAR_URL },
  { label: "Full Calendar", icon: ExternalLink, href: GOOGLE_CALENDAR_URL },
  { label: "Event Signup Hub", icon: PenLine, href: EVENT_SIGNUP_HUB_URL, accent: true },
];

const EventsActionBar = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35, duration: 0.5 }}
    className="flex flex-wrap justify-center gap-3 px-4"
  >
    {actions.map((a) => (
      <a
        key={a.label}
        href={a.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`glass-card group inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
          a.accent
            ? "hover:border-primary/40 hover:shadow-[0_0_20px_hsl(40_100%_55%/0.12)]"
            : "hover:border-secondary/30"
        }`}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-lg ${
            a.accent ? "gold-gradient" : "bg-accent"
          }`}
        >
          <a.icon size={16} className={a.accent ? "text-primary-foreground" : "text-accent-foreground"} />
        </span>
        <span className="text-foreground">{a.label}</span>
      </a>
    ))}
  </motion.div>
);

export default EventsActionBar;
