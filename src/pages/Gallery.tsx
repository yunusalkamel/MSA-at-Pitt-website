import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/lib/usePageMeta";
import { Grid3X3, Sparkles, Star, Calendar, Users, UserSquare2, Eye, Leaf, Sun, Heart, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import BridgeBar from "@/components/BridgeBar";
import patternImg from "@/assets/islamic-pattern.jpg";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES, urlFor } from "@/lib/sanity";

import kickoffImg from "@/assets/gallery-kickoff.jpg";
import iftarImg from "@/assets/gallery-iftar.jpg";
import eidImg from "@/assets/gallery-eid.jpg";
import topgolfImg from "@/assets/gallery-topgolf.jpg";
import halaqaImg from "@/assets/gallery-halaqa.jpg";
import sistersImg from "@/assets/gallery-sisters.jpg";

type FilterCategory = "all" | "fall" | "spring" | "brothers" | "sisters" | "general" | "signature" | "social" | "dawah" | "cec";

interface GalleryAlbum {
  title: string;
  slug?: string;
  photoCount?: number;
  category: FilterCategory[];
  audience?: string;
  eventDate?: string;
  coverImage?: { asset?: { _ref?: string }; lqip?: string } | unknown;
  coverImageUrl?: string;
  coverImageLqip?: string;
}

const FALLBACK_ALBUMS: GalleryAlbum[] = [
  { title: "MSA Fall Kickoff",      photoCount: 120, category: ["fall", "signature", "general"],  audience: "Brothers & Sisters", eventDate: "2025-09-12", coverImageUrl: kickoffImg },
  { title: "Ramadan Iftar Night",   photoCount: 85,  category: ["spring", "signature", "general"], audience: "Brothers & Sisters", eventDate: "2026-03-08", coverImageUrl: iftarImg },
  { title: "Eid Social",            photoCount: 64,  category: ["spring", "signature", "general"], audience: "Brothers & Sisters", eventDate: "2026-04-01", coverImageUrl: eidImg },
  { title: "MSA TopGolf Night",     photoCount: 42,  category: ["spring", "social", "general"],   audience: "Brothers & Sisters", eventDate: "2026-02-15", coverImageUrl: topgolfImg },
  { title: "Weekly Halaqa",         photoCount: 30,  category: ["fall", "dawah", "general"],       audience: "Brothers & Sisters", eventDate: "2025-10-21", coverImageUrl: halaqaImg },
  { title: "Sisters' Social Night", photoCount: 38,  category: ["fall", "social", "sisters"],     audience: "Sisters",            eventDate: "2025-10-04", coverImageUrl: sistersImg },
];

type FilterGroup = { label: string; filters: { key: FilterCategory; label: string; icon: typeof Grid3X3 }[] };

const filterGroups: FilterGroup[] = [
  {
    label: "Semester",
    filters: [
      { key: "all",    label: "All",    icon: Grid3X3 },
      { key: "fall",   label: "Fall",   icon: Leaf },
      { key: "spring", label: "Spring", icon: Sun },
    ],
  },
  {
    label: "Audience",
    filters: [
      { key: "general",  label: "General",  icon: Users },
      { key: "brothers", label: "Brothers", icon: Users },
      { key: "sisters",  label: "Sisters",  icon: UserSquare2 },
    ],
  },
  {
    label: "Type",
    filters: [
      { key: "signature", label: "Signature", icon: Star },
      { key: "social",    label: "Social",    icon: Sparkles },
      { key: "dawah",     label: "Da'wah",    icon: BookOpen },
      { key: "cec",       label: "CEC",       icon: Heart },
    ],
  },
];

/** Build "Fall '25 · Signature" — semester/year first, event type secondary. */
const buildLabel = (album: GalleryAlbum) => {
  const year = album.eventDate ? new Date(album.eventDate).getFullYear() : null;
  const semester = album.category.includes("fall") ? "Fall" : album.category.includes("spring") ? "Spring" : null;
  const shortYear = year ? `'${String(year).slice(2)}` : null;
  const semLabel = semester && shortYear ? `${semester} ${shortYear}` : null;

  let type = "";
  if (album.category.includes("signature")) type = "Signature";
  else if (album.category.includes("social")) type = "Social";
  else if (album.category.includes("dawah")) type = "Da'wah";
  else if (album.category.includes("cec")) type = "CEC";
  else if (album.category.includes("sisters")) type = "Sisters";
  else if (album.category.includes("brothers")) type = "Brothers";

  if (semLabel && type) return `${semLabel} · ${type}`;
  if (semLabel) return semLabel;
  return type;
};

const AlbumCard = ({ album, index }: { album: GalleryAlbum; index: number }) => {
  const imageUrl = album.coverImageUrl ?? (
    (album.coverImage as { asset?: { _ref?: string } })?.asset?._ref
      ? urlFor(album.coverImage as never).width(900).height(560).fit("crop").auto("format").url()
      : undefined
  );
  const lqip = album.coverImageLqip ?? (album.coverImage as { lqip?: string })?.lqip;
  const label = buildLabel(album);

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="group relative rounded-2xl overflow-hidden shadow-xl cursor-pointer aspect-[16/10]"
      style={lqip ? { backgroundImage: `url(${lqip})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={album.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          width={900}
          height={560}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-10">
        <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg leading-tight">
          {album.title}
        </h3>
        <p className="text-white/80 text-sm mb-4">
          {album.photoCount ? `${album.photoCount} photos · ` : ""}{album.audience ?? "Brothers & Sisters"}
        </p>
        <span className="inline-flex items-center gap-2 gold-gradient text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg group-hover:scale-105 transition-transform duration-300">
          <Eye size={14} />
          {album.slug ? "View Album" : "View Photos"}
        </span>
      </div>

      {label && (
        <div className="absolute top-4 right-4 z-10">
          <span className="liquid-glass-pill px-3 py-1 text-xs font-semibold text-foreground">
            {label}
          </span>
        </div>
      )}
    </motion.div>
  );

  if (album.slug) {
    return <Link to={`/gallery/${album.slug}`}>{inner}</Link>;
  }
  return inner;
};

const Gallery = () => {
  usePageMeta({
    title: "Gallery — MSA at Pitt",
    description: "Iftars, kickoffs, halaqas, late-night socials — a year in the life of MSA at Pitt.",
  });
  const prefersReduced = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], prefersReduced ? ["0%", "0%"] : ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const { data: sanityAlbums } = useSanityData<any[]>(QUERIES.galleryAlbums);

  const albums: GalleryAlbum[] = useMemo(() => {
    if (sanityAlbums && sanityAlbums.length > 0) {
      return sanityAlbums.map((a) => ({
        title: a.title,
        slug: a.slug,
        photoCount: a.photoCount,
        category: (a.category ?? []) as FilterCategory[],
        audience: a.audience,
        eventDate: a.eventDate,
        coverImage: a.coverImage,
      }));
    }
    return FALLBACK_ALBUMS;
  }, [sanityAlbums]);

  const filtered =
    activeFilter === "all"
      ? albums
      : albums.filter((a) => a.category.includes(activeFilter));

  return (
    <Layout>
      <section ref={heroRef} className="relative min-h-[50vh] flex flex-col items-center justify-center pt-28 pb-16 md:pt-36 md:pb-20 text-center px-4 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <div className="absolute inset-0 bg-accent" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
          <BridgeBar />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent" />
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-primary/10 blur-[90px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </motion.div>
        <motion.div className="relative z-10 max-w-3xl mx-auto" style={{ opacity: contentOpacity }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5">
            Memories
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl font-bold text-accent-foreground mb-4 leading-[1.05] px-2">
            Event <span className="text-gradient-gold inline-block pb-2">Gallery</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-accent-foreground/85 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
          >
            Iftars, kickoffs, halaqas, late-night socials — a year in the life of MSA at Pitt.
          </motion.p>
        </motion.div>
      </section>

      <section className="px-4 py-4 gradient-section-gold-soft sticky top-[68px] md:top-[76px] z-30 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-5xl mx-auto space-y-2">
          {filterGroups.map((group) => (
            <div key={group.label} className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 font-semibold w-14 flex-shrink-0 hidden sm:block">{group.label}</span>
              <div className="flex gap-1.5 flex-wrap">
                {group.filters.map((f) => {
                  const active = activeFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60 ${
                        active
                          ? "gold-gradient text-primary-foreground shadow-md scale-[1.03]"
                          : "glass-card text-foreground hover:border-primary/30"
                      }`}
                    >
                      <f.icon size={12} />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding relative">
        <div className="absolute inset-0 steps-surface" />
        <div className="absolute inset-0 texture-dots opacity-60" />
        <div className="max-w-6xl mx-auto relative z-10 pb-4">
          <AnimatePresence>
            <motion.div key={activeFilter} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="grid md:grid-cols-2 gap-6 md:gap-8">
              {filtered.map((album, i) => (
                <AlbumCard key={album.slug ?? album.title} album={album} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
          {filtered.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground text-lg py-20">
              No events in this category yet — check back soon!
            </motion.p>
          )}
        </div>
      </section>

      <section className="section-padding-sm gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ArabicVerse
              arabic="فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي"
              translation="So remember Me; I will remember you. And be grateful to Me."
              reference="Quran 2:152"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
