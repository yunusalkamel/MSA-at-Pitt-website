import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

interface AnnouncementData {
  isActive: boolean;
  message: string;
  type: "info" | "urgent" | "celebration";
  linkLabel?: string;
  linkUrl?: string;
}

const TYPE_STYLES = {
  info: {
    bar: "bg-msa-blue/95 text-white border-b border-white/10",
    button: "bg-white/15 hover:bg-white/25 text-white",
    close: "text-white/60 hover:text-white",
  },
  urgent: {
    bar: "bg-msa-gold text-ink border-b border-ink/10",
    button: "bg-ink/10 hover:bg-ink/20 text-ink",
    close: "text-ink/60 hover:text-ink",
  },
  celebration: {
    bar: "bg-jannah-mid/95 text-white border-b border-white/10",
    button: "bg-white/15 hover:bg-white/25 text-white",
    close: "text-white/60 hover:text-white",
  },
};

export default function AnnouncementBar() {
  const { data } = useSanityData<AnnouncementData>(QUERIES.announcement);
  const [dismissed, setDismissed] = useState(false);

  // Only render when Sanity says it's active and the user hasn't dismissed it
  if (!data?.isActive || !data.message || dismissed) return null;

  const styles = TYPE_STYLES[data.type ?? "info"];

  return (
    <AnimatePresence>
      <motion.div
        key="announcement-bar"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`relative z-50 overflow-hidden ${styles.bar}`}
      >
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <p className="font-ui text-sm font-medium leading-snug truncate">
              {data.message}
            </p>
            {data.linkLabel && data.linkUrl && (
              <a
                href={data.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full
                  text-xs font-semibold transition-colors duration-150 backdrop-blur-sm
                  ${styles.button}
                `}
              >
                {data.linkLabel}
                <ArrowRight size={11} />
              </a>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcement"
            className={`flex-shrink-0 p-1 rounded transition-colors ${styles.close}`}
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
