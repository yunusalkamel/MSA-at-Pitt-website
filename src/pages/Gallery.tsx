import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Grid3X3, Leaf, Sun, Calendar, Star, Eye } from "lucide-react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import CrescentWatermark from "@/components/CrescentWatermark";
import BridgeBar from "@/components/BridgeBar";
import patternImg from "@/assets/islamic-pattern.jpg";

import kickoffImg from "@/assets/gallery-kickoff.jpg";
import iftarImg from "@/assets/gallery-iftar.jpg";
import eidImg from "@/assets/gallery-eid.jpg";
import topgolfImg from "@/assets/gallery-topgolf.jpg";
import halaqaImg from "@/assets/gallery-halaqa.jpg";
import sistersImg from "@/assets/gallery-sisters.jpg";

type FilterCategory = "all" | "fall" | "spring" | "weekly" | "special";

interface GalleryEvent {
  title: string;
  photos: number;
  category: FilterCategory[];
  tag: string;
  image: string;
  link?: string;
}

const galleryEvents: GalleryEvent[] = [
  { title: "MSA Fall Kickoff 2025", photos: 120, category: ["fall"], tag: "Brothers & Sisters", image: kickoffImg },
  { title: "Ramadan Iftar Night", photos: 85, category: ["spring"], tag: "Brothers & Sisters", image: iftarImg },
  { title: "Eid Social 2026", photos: 64, category: ["spring", "special"], tag: "Brothers & Sisters", image: eidImg },
  { title: "MSA TopGolf Night", photos: 42, category: ["spring", "special"], tag: "Brothers & Sisters", image: topgolfImg },
  { title: "Weekly Halaqa", photos: 30, category: ["weekly"], tag: "Brothers & Sisters", image: halaqaImg },
  { title: "Sisters' Social Night", photos: 38, category: ["fall", "special"], tag: "Sisters", image: sistersImg },
];

const filters: { key: FilterCategory; label: string; icon: typeof Grid3X3 }[] = [
  { key: "all", label: "All Events", icon: Grid3X3 },
  { key: "fall", label: "Fall 2025", icon: Leaf },
  { key: "spring", label: "Spring 2026", icon: Sun },
  { key: "weekly", label: "MSA Weekly", icon: Calendar },
  { key: "special", label: "Special Events", icon: Star },
];

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const filtered =
    activeFilter === "all"
      ? galleryEvents
      : galleryEvents.filter((e) => e.category.includes(activeFilter));

  const categoryLabel = (event: GalleryEvent) => {
    if (event.category.includes("special")) return "✨ Special";
    if (event.category.includes("weekly")) return "📅 Weekly";
    if (event.category[0] === "fall") return "🍂 Fall";
    return "🌸 Spring";
  };

  return (
    <Layout>
      {/* Hero — consolidated into a single parallax section */}
      <section ref={heroRef} className="relative min-h-[50vh] flex flex-col items-center justify-center pt-28 pb-16 md:pt-36 md:pb-20 text-center px-4 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <div className="absolute inset-0 bg-accent" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }}
          />

          <BridgeBar />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent" />
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-primary/10 blur-[90px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </motion.div>
        {/* Crescent watermark */}
        <CrescentWatermark color="#F2AB23" size={260} opacity={0.06} position="right" />

        <motion.div className="relative z-10 max-w-3xl mx-auto" style={{ opacity: contentOpacity }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"
          >
            Event <span className="text-gradient-gold">Gallery</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-muted-foreground text-lg"
          >
            Memories from our amazing events and activities
          </motion.p>
        </motion.div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 py-8 gradient-section-gold-soft sticky top-[68px] md:top-[76px] z-30 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2 md:gap-3">
          {filters.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                  ${active
                    ? "gold-gradient text-primary-foreground shadow-md scale-[1.03]"
                    : "glass-card text-foreground hover:border-primary/30"
                  }`}
              >
                <f.icon size={14} />
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface" />
        <div className="absolute inset-0 texture-dots opacity-60" />

        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-secondary/[0.05] blur-[100px]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 gap-6 md:gap-8"
            >
              {filtered.map((event, i) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="group relative rounded-2xl overflow-hidden shadow-xl cursor-pointer aspect-[16/10]"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    width={800}
                    height={500}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-10">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg">
                      {event.title}
                    </h3>
                    <p className="text-white/75 text-sm mb-4">
                      {event.photos} photos · {event.tag}
                    </p>
                    <span className="inline-flex items-center gap-2 gold-gradient text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Eye size={14} />
                      View Photos
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <span className="liquid-glass-pill px-3 py-1 text-xs font-semibold text-foreground">
                      {categoryLabel(event)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground text-lg py-20"
            >
              No events in this category yet — check back soon!
            </motion.p>
          )}
        </div>
      </section>

      {/* Bottom Ayat */}
      <section className="section-padding-sm gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ArabicVerse
              arabic="فَاذْكُرُونِي أَذْكُرْكُمْ"
              translation="So remember Me; I will remember you."
              reference="Quran 2:152"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
