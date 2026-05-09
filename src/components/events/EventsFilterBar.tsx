import { useMemo } from "react";
import { motion } from "framer-motion";
import { CATEGORY_CONTENT_TAGS, AUDIENCE_TAGS } from "@/data/events";
import type { MSAEvent } from "@/data/events";

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
  allEvents?: MSAEvent[];
}

const FilterBtn = ({
  tag,
  isActive,
  onClick,
  dimmed = false,
}: {
  tag: string;
  isActive: boolean;
  onClick: () => void;
  dimmed?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border
      ${isActive
        ? "gold-gradient text-primary-foreground border-transparent shadow-sm"
        : dimmed
        ? "bg-transparent border-border/40 text-muted-foreground/60 hover:border-border/70 hover:text-muted-foreground"
        : "bg-transparent border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
      }`}
  >
    {tag}
  </button>
);

const EventsFilterBar = ({ selected, onChange, allEvents }: Props) => {
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

  // Only show tags that appear on at least one event in the past year (or upcoming)
  const { visibleCategoryTags, visibleAudienceTags } = useMemo(() => {
    if (!allEvents || allEvents.length === 0) {
      return { visibleCategoryTags: [...CATEGORY_CONTENT_TAGS], visibleAudienceTags: [...AUDIENCE_TAGS] };
    }
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const yearAgoStr = yearAgo.toISOString().split("T")[0];

    const usedTags = new Set(
      allEvents
        .filter(e => !e.isPast || e.startDate >= yearAgoStr)
        .flatMap(e => e.tags)
    );

    return {
      visibleCategoryTags: CATEGORY_CONTENT_TAGS.filter(t => usedTags.has(t)),
      visibleAudienceTags: AUDIENCE_TAGS.filter(t => usedTags.has(t)),
    };
  }, [allEvents]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col gap-2 items-center"
    >
      {/* Row 1 — Event categories */}
      <div className="flex flex-wrap gap-1.5 justify-center items-center">
        <FilterBtn tag="All" isActive={isActive("All")} onClick={() => toggle("All")} />
        {visibleCategoryTags.map((tag) => (
          <FilterBtn key={tag} tag={tag} isActive={isActive(tag)} onClick={() => toggle(tag)} />
        ))}
      </div>

      {/* Row 2 — Audience */}
      {visibleAudienceTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center items-center">
          <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-muted-foreground/40 mr-0.5 select-none">
            Audience
          </span>
          {visibleAudienceTags.map((tag) => (
            <FilterBtn key={tag} tag={tag} isActive={isActive(tag)} onClick={() => toggle(tag)} dimmed />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default EventsFilterBar;
