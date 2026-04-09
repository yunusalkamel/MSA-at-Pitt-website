import { motion } from "framer-motion";
import { CalendarX } from "lucide-react";

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="glass-card-strong p-16 md:p-24 text-center rounded-2xl"
  >
    <div className="w-14 h-14 rounded-2xl glass-card border-border/40 flex items-center justify-center mx-auto mb-5">
      <CalendarX size={24} className="text-muted-foreground/50" />
    </div>
    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
      No events found
    </h3>
    <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
      Try adjusting your filters or check back soon — we're always planning something new.
    </p>
  </motion.div>
);

export default EmptyState;
