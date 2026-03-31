import { CalendarX } from "lucide-react";
import { motion } from "framer-motion";

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card-strong p-16 text-center"
  >
    <CalendarX size={48} className="mx-auto text-muted-foreground/40 mb-4" />
    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
      No events found
    </h3>
    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
      Try adjusting your filters or check back soon — we're always planning something new.
    </p>
  </motion.div>
);

export default EmptyState;
