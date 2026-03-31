import { motion } from "framer-motion";
import { EVENT_TAGS, type EventTag } from "@/data/events";

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
}

const EventsFilterBar = ({ selected, onChange }: Props) => {
  const toggle = (tag: string) => {
    if (tag === "All") {
      onChange(["All"]);
      return;
    }
    let next = selected.filter((t) => t !== "All");
    if (next.includes(tag)) {
      next = next.filter((t) => t !== tag);
    } else {
      next = [...next, tag];
    }
    if (next.length === 0) next = ["All"];
    onChange(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-2 justify-center"
    >
      {EVENT_TAGS.map((tag) => {
        const isActive = selected.includes(tag) || (tag === "All" && selected.includes("All"));
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border ${
              isActive
                ? "gold-gradient text-primary-foreground border-primary/40 shadow-[0_0_12px_hsl(40_100%_55%/0.2)]"
                : "glass-card text-muted-foreground border-transparent hover:border-primary/20 hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </motion.div>
  );
};

export default EventsFilterBar;
