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
  info:        { bar: "bg-[#14345A] text-white border-b border-white/10", btn: "bg-white/15 hover:bg-white/25 text-white", close: "text-white/50 hover:text-white" },
  urgent:      { bar: "bg-[#F2AB23] text-[#060B18] border-b border-black/10", btn: "bg-black/10 hover:bg-black/20 text-[#060B18]", close: "text-black/50 hover:text-black" },
  celebration: { bar: "bg-[#148066] text-white border-b border-white/10", btn: "bg-white/15 hover:bg-white/25 text-white", close: "text-white/50 hover:text-white" },
};

// This is rendered INSIDE the fixed navbar so it never goes behind it
export default function AnnouncementBar() {
  const { data } = useSanityData<AnnouncementData>(QUERIES.announcement);
  const [dismissed, setDismissed] = useState(false);

  if (!data?.isActive || !data.message || dismissed) return null;

  const s = TYPE_STYLES[data.type ?? "info"];

  return (
    <AnimatePresence>
      <motion.div
        key="ann-bar"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className={`w-full overflow-hidden pointer-events-auto ${s.bar}`}
      >
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <p className="font-ui text-xs font-semibold leading-snug truncate">{data.message}</p>
            {data.linkLabel && data.linkUrl && (
              <a
                href={data.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${s.btn}`}
              >
                {data.linkLabel} <ArrowRight size={10} />
              </a>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className={`flex-shrink-0 p-1 rounded transition-colors ${s.close}`}
          >
            <X size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
