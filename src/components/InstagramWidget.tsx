import { motion } from "framer-motion";
import { Instagram, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const INSTAGRAM_URL = "https://instagram.com/msa.at.pitt";
const HANDLE = "@msa.at.pitt";
const FALLBACK_COUNT = "2.5K+";

const InstagramWidget = () => {
  const [count, setCount] = useState<string>(FALLBACK_COUNT);

  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("instagram-stats");
        if (!error && data?.count && !cancelled) {
          setCount(data.count);
        }
      } catch {
        // silently fallback
      }
    };
    void fetchCount();
    return () => { cancelled = true; };
  }, []);

  return (
    <motion.a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group inline-flex items-center gap-3 liquid-glass px-5 py-3 hover:border-pink-400/25 transition-colors duration-300"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-sm flex-shrink-0">
        <Instagram size={15} className="text-white" />
      </div>
      <div className="text-left">
        <p className="text-[10px] text-muted-foreground leading-none mb-0.5 uppercase tracking-wider">Follow us</p>
        <p className="text-sm font-semibold text-foreground leading-none">{HANDLE}</p>
      </div>
      <div className="ml-1 text-left border-l border-border/50 pl-3">
        <p className="text-[10px] text-muted-foreground leading-none mb-0.5 uppercase tracking-wider">Followers</p>
        <p className="text-sm font-bold text-foreground leading-none">{count}</p>
      </div>
      <ExternalLink size={12} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors ml-1 flex-shrink-0" />
    </motion.a>
  );
};

export default InstagramWidget;
