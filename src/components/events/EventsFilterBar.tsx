import { motion } from "framer-motion";
import { EVENT_TAGS } from "@/data/events";

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
}

const EventsFilterBar = ({ selected, onChange }: Props) => {
  const toggle = (tag: string) => {
    if (tag === "All") { onChange(["All"]); return; }
    let next = selected.filter((t) => t !== "All");
    if (next.includes(tag)) next = next.filter((t) => t !== tag);
    else next = [...next, tag];
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
            className={`min-h-10 px-4 py-2 rounded-full text-sm md:text-xs font-semibold tracking-wide transition-all duration-200 border
              ${isActive
                ? "gold-gradient text-primary-foreground border-transparent shadow-sm"
                : "bg-transparent border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
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
