import { motion } from "framer-motion";
import { Instagram, ExternalLink } from "lucide-react";

// ↓ UPDATE THIS manually to match your current follower count
// Instagram's API requires Business account OAuth to fetch live — update as needed
const FOLLOWER_COUNT = "1.4K"; // e.g. "1.4K" or "1,412"
const INSTAGRAM_URL = "https://instagram.com/msa.at.pitt";
const HANDLE = "@msa.at.pitt";

const InstagramWidget = () => (
  <motion.a
    href={INSTAGRAM_URL}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.3 }}
    className="group inline-flex items-center gap-3 glass-card px-5 py-3 hover:border-pink-400/30 transition-colors duration-300"
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-sm flex-shrink-0">
      <Instagram size={16} className="text-white" />
    </div>
    <div className="text-left">
      <p className="text-xs text-muted-foreground leading-none mb-0.5">Follow us</p>
      <p className="text-sm font-semibold text-foreground leading-none">{HANDLE}</p>
    </div>
    <div className="ml-2 text-left border-l border-border/50 pl-3">
      <p className="text-xs text-muted-foreground leading-none mb-0.5">Followers</p>
      <p className="text-sm font-bold text-foreground leading-none">{FOLLOWER_COUNT}</p>
    </div>
    <ExternalLink size={13} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors ml-1 flex-shrink-0" />
  </motion.a>
);

export default InstagramWidget;
