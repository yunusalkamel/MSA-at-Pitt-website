import { motion } from "framer-motion";
import { CATEGORY_CONTENT_TAGS, AUDIENCE_TAGS } from "@/data/events";

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
}

const FilterBtn = ({
  tag,
  isActive,
  onClick,
}: {
  tag: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border
      ${isActive
        ? "gold-gradient text-primary-foreground border-transparent shadow-sm"
        : "bg-transparent border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
      }`}
  >
    {tag}
  </button>
);

const Divider = () => (
  <span className="w-px h-5 bg-border/50 self-center flex-shrink-0 mx-0.5" />
);

const EventsFilterBar = ({ selected, onChange }: Props) => {
  const toggle = (tag: string) => {
    if (tag === "All") { onChange(["All"]); return; }
    let next = selected.filter((t) => t !== "All");
    if (next.includes(tag)) next = next.filter((t) => t !== tag);
    else next = [...next, tag];
    if (next.length === 0) next = ["All"];
    onChange(next);
  };

  const isActive = (tag: string) =>
    selected.includes(tag) || (tag === "All" && selected.includes("All"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-1.5 justify-center items-center"
    >
      {/* All */}
      <FilterBtn tag="All" isActive={isActive("All")} onClick={() => toggle("All")} />

      <Divider />

      {/* Category tags */}
      {CATEGORY_CONTENT_TAGS.filter((t) => t !== "CEC").map((tag) => (
        <FilterBtn key={tag} tag={tag} isActive={isActive(tag)} onClick={() => toggle(tag)} />
      ))}

      <Divider />

      {/* Audience tags */}
      {AUDIENCE_TAGS.map((tag) => (
        <FilterBtn key={tag} tag={tag} isActive={isActive(tag)} onClick={() => toggle(tag)} />
      ))}
    </motion.div>
  );
};

export default EventsFilterBar;
