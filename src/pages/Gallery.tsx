import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, Leaf, Sun, Calendar, Star, Eye } from "lucide-react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
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
  {
    title: "MSA Fall Kickoff 2025",
    photos: 120,
    category: ["fall"],
    tag: "Brothers & Sisters",
    image: kickoffImg,
  },
  {
    title: "Ramadan Iftar Night",
    photos: 85,
    category: ["spring"],
    tag: "Brothers & Sisters",
    image: iftarImg,
  },
  {
    title: "Eid Social 2026",
    photos: 64,
    category: ["spring", "special"],
    tag: "Brothers & Sisters",
    image: eidImg,
  },
  {
    title: "MSA TopGolf Night",
    photos: 42,
    category: ["spring", "special"],
    tag: "Brothers & Sisters",
    image: topgolfImg,
  },
  {
    title: "Weekly Halaqa",
    photos: 30,
    category: ["weekly"],
    tag: "Brothers & Sisters",
    image: halaqaImg,
  },
  {
    title: "Sisters' Social Night",
    photos: 38,
    category: ["fall", "special"],
    tag: "Sisters",
    image: sistersImg,
  },
];

const filters: { key: FilterCategory; label: string; icon: typeof Grid3X3 }[] = [
  { key: "all", label: "All Events", icon: Grid3X3 },
  { key: "fall", label: "Fall 2025", icon: Leaf },
  { key: "spring", label: "Spring 2026", icon: Sun },
  { key: "weekly", label: "MSA Weekly Events", icon: Calendar },
  { key: "special", label: "Special Events", icon: Star },
];

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const filtered =
    activeFilter === "all"
      ? galleryEvents
      : galleryEvents.filter((e) => e.category.includes(activeFilter));

  return (
    <Layout>
      {/* Quranic Ayat Banner — Rutgers style */}
      <section className="pt-28 md:pt-36 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass-card-strong glass-glow p-8 md:p-10 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }}
            />
            <div className="relative z-10">
              <ArabicVerse
                arabic="وَاذْكُرُوا نِعْمَةَ اللَّهِ عَلَيْكُمْ"
                translation="And remember the favor of Allah upon you."
                reference="Quran 3:103"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Title */}
      <section className="text-center px-4 pt-8 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-7xl font-bold text-foreground"
        >
          Event <span className="text-gradient-gold">Gallery</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mt-3"
        >
          Memories from our amazing events and activities
        </motion.p>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
          {filters.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  active
                    ? "gold-gradient text-primary-foreground shadow-lg scale-105"
                    : "glass-card text-foreground hover:border-primary/30"
                }`}
              >
                <f.icon size={16} />
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Event Album Cards Grid */}
      <section className="section-padding gradient-mesh-warm">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {filtered.map((event, i) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden shadow-xl cursor-pointer aspect-[16/10]"
                >
                  {/* Background Image */}
                  <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    width={800}
                    height={544}
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                      {event.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      {event.photos} photos • {event.tag}
                    </p>
                    <span className="inline-flex items-center gap-2 gold-gradient text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Eye size={14} />
                      View Photos
                    </span>
                  </div>

                  {/* Top-right category badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="glass-card px-3 py-1 text-xs font-semibold text-white rounded-full">
                      {event.category.includes("special") ? "✨ Special" : event.category.includes("weekly") ? "📅 Weekly" : event.category[0] === "fall" ? "🍂 Fall" : "🌸 Spring"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-lg py-20">
              No events in this category yet — check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Bottom Ayat */}
      <section className="section-padding">
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
