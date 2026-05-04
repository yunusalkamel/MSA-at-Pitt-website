import { Link } from "react-router-dom";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

interface ResourcesData {
  jummahTime?: string;
  jummahLocation?: string;
  jummahNotes?: string;
}

/**
 * Slim "Today's Jummah" card — only renders on Fridays.
 *
 * Pulls Jummah info from Sanity (resourcesPage). If the document hasn't been
 * created yet, sensible fallbacks are used so the card still works on day-one
 * before content is filled in.
 */
const TodayJummah = () => {
  const { data } = useSanityData<ResourcesData>(QUERIES.resourcesPage);
  const today = new Date();
  const isFriday = today.getDay() === 5;

  if (!isFriday) return null;

  const time = data?.jummahTime || "1:00 – 2:00 PM";
  const location = data?.jummahLocation || "Nordy's Place, Cathedral of Learning";
  const note = data?.jummahNotes || "Check our Instagram story this morning for room confirmation.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative max-w-3xl mx-auto px-4"
    >
      <Link
        to="/prayer-times"
        className="block group rounded-2xl liquid-glass-strong border border-msa-gold/25 hover:border-msa-gold/40 transition-all duration-300 px-5 py-4 md:px-6 md:py-5 shadow-[0_4px_24px_rgba(242,171,35,0.12)] hover:shadow-[0_8px_32px_rgba(242,171,35,0.18)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl gold-gradient flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground/80 text-[8px] font-bold uppercase tracking-wider leading-none">
              Today
            </span>
            <span className="text-primary-foreground font-display font-bold text-base md:text-lg leading-none mt-0.5">
              Fri
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-jannah-mid dark:text-msa-gold/70 font-semibold mb-0.5">
              Jummah Today
            </p>
            <p className="font-display font-bold text-foreground text-base md:text-lg leading-tight mb-1.5 truncate">
              {time}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 truncate">
                <MapPin size={11} className="text-secondary/70 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-muted-foreground/40 group-hover:text-msa-gold group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 hidden sm:block"
          />
        </div>
        {note && (
          <p className="font-body text-[11px] text-muted-foreground/70 mt-3 pt-3 border-t border-border/30 leading-relaxed">
            {note}
          </p>
        )}
      </Link>
    </motion.div>
  );
};

export default TodayJummah;
