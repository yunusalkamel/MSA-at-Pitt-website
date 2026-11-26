import { PageHero } from "@/components/PageHero";
import { Picture, TextField, ContentScope, itemIdentity } from "@/editor/content";
import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/lib/usePageMeta";
import { Eye, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import BridgeBar from "@/components/BridgeBar";
import patternImg from "@/assets/geometric-tile.svg";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES, urlFor } from "@/lib/sanity";

import { communityAlbums } from "@/data/communityPhotos";

type SemesterKey = `spring${number}` | `fall${number}`;
type FilterCategory = "all" | SemesterKey | "fall" | "spring" | "brothers" | "sisters" | "general" | "signature" | "social" | "dawah" | "cec" | "halaqa" | "jummah" | "sports" | "speaker";

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


function semesterFor(date: string | undefined) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-\d{2}$/.exec(date ?? "");
  if (!match) return;
  const [, year, month] = match;
  const fall = Number(month) >= 8;
  return {
    key: `${fall ? "fall" : "spring"}${Number(year)}` as SemesterKey,
    label: `${fall ? "Fall" : "Spring"} '${year.slice(2)}`,
    sort: Number(year) * 2 + Number(fall),
  };
}

type FilterGroup = { label: string; filters: { key: FilterCategory; label: string }[] };

const categoryGroups: FilterGroup[] = [
  {
    label: "Audience",
    filters: [
      { key: "general",  label: "General" },
      { key: "brothers", label: "Brothers" },
      { key: "sisters",  label: "Sisters" },
    ],
  },
  {
    label: "Type",
    filters: [
      { key: "signature", label: "Signature" },
      { key: "social",    label: "Social" },
      { key: "dawah",     label: "Da'wah" },
      { key: "halaqa",    label: "Halaqa" },
      { key: "jummah",    label: "Jummah" },
      { key: "sports",    label: "Sports" },
      { key: "speaker",   label: "Speaker" },
      { key: "cec",       label: "CEC" },
    ],
  },
];

/** Build "Fall '25 · Signature" — semester/year first, event type secondary. */
const buildLabel = (album: GalleryAlbum) => {
  const semLabel = semesterFor(album.eventDate)?.label;

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
      className="group relative rounded-2xl overflow-hidden shadow-xl cursor-pointer aspect-[1.15] md:aspect-[16/10]"
      style={lqip ? { backgroundImage: `url(${lqip})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {imageUrl && (
        <Picture fieldId="Gallery_1"
          src={imageUrl}
          alt={album.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          sizes="(max-width: 359px) 92vw, (max-width: 767px) 46vw, 560px"
          decoding="async"
          width={900}
          height={560}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-7 z-10">
        <h3 className="font-display text-base md:text-2xl font-bold text-white mb-1 drop-shadow-lg leading-tight">
          <TextField id="Gallery_2">{album.title}</TextField>
        </h3>
        <p className="text-white/85 text-xs md:text-sm md:mb-4">
          {album.photoCount ? `${album.photoCount} ${album.photoCount === 1 ? "photo" : "photos"}` : ""}
          {album.audience && <> · <TextField id="Gallery_3">{album.audience}</TextField></>}
        </p>
        <span className="hidden md:inline-flex items-center gap-2 gold-gradient text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg group-hover:scale-105 transition-transform duration-300">
          <Eye size={14} />
          {album.slug ? "View Album" : "View Photos"}
        </span>
      </div>

      {label && (
        <div className="hidden md:block absolute top-4 right-4 z-10">
          <span className="liquid-glass-pill px-3 py-1 text-xs font-semibold text-foreground">
            <TextField id="Gallery_4">{label}</TextField>
          </span>
        </div>
      )}
    </motion.div>
  );

  if (album.slug) {
    return <Link to={`/gallery/${album.slug}`}><TextField id="Gallery_5">{inner}</TextField></Link>;
  }
  return inner;
};

import { Moments,type RecapAlbum } from "@/design/CommunityPhotos";
function GalleryRecaps(){
 const {data}=useSanityData<RecapAlbum[]>(QUERIES.communityRecaps);
 return <Moments galleryLink={false} albums={data??[]}/>;
}
const Gallery = () => {
  usePageMeta({
    title: "Gallery — MSA at Pitt",
    description: "Iftars, kickoffs, halaqas, late-night socials — a year in the life of MSA at Pitt.",
  });
  const prefersReduced = useReducedMotion();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], prefersReduced ? ["0%", "0%"] : ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const { data: sanityAlbums } = useSanityData<any[]>(QUERIES.galleryAlbums);

  const albums: GalleryAlbum[] = useMemo(() => {
    const remote = (sanityAlbums ?? []).map((a) => ({
        title: a.title,
        slug: a.slug,
        photoCount: a.photoCount,
        category: (a.category ?? []) as FilterCategory[],
        audience: a.audience,
        eventDate: a.eventDate,
        coverImage: a.coverImage,
      }));
    return [...remote, ...communityAlbums.filter(a => !remote.some(r => r.slug === a.slug)).map(a => ({ ...a, category: a.category as FilterCategory[] }))];
  }, [sanityAlbums]);

  const semesters = useMemo(() => {
    const seen = new Map<SemesterKey, NonNullable<ReturnType<typeof semesterFor>>>();
    for (const album of albums) {
      const semester = semesterFor(album.eventDate);
      if (semester) seen.set(semester.key, semester);
    }
    return [...seen.values()].sort((a, b) => b.sort - a.sort);
  }, [albums]);
  const filterGroups: FilterGroup[] = [
    { label: "Semester", filters: [{ key: "all", label: "All" }, ...semesters] },
    ...categoryGroups,
  ];
  const activeLabel = filterGroups.flatMap(group => group.filters).find(filter => filter.key === activeFilter)?.label ?? "All";
  const filtered = useMemo(() => {
    if (activeFilter === "all") return albums;
    if (/^(?:fall|spring)\d{4}$/.test(activeFilter)) {
      return albums.filter(album => semesterFor(album.eventDate)?.key === activeFilter);
    }
    return albums.filter(album => album.category.includes(activeFilter));
  }, [albums, activeFilter]);

  return (
    <Layout>
      <PageHero ref={heroRef} className="relative text-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <div className="absolute inset-0 bg-accent" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
          <BridgeBar />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent" />
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-primary/10 blur-[90px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </motion.div>
        <motion.div className="relative z-10 max-w-3xl mx-auto" style={{ opacity: contentOpacity }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs uppercase tracking-[0.3em] text-primary font-semibold page-hero-kicker"><TextField id="Gallery_7">
            Memories
          </TextField></motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl font-bold text-accent-foreground mb-4 leading-[1.05] px-2"><TextField id="Gallery_8">
            Event </TextField><span className="text-gradient-gold inline-block pb-2"><TextField id="Gallery_9">Gallery</TextField></span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-accent-foreground/85 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
          ><TextField id="Gallery_10">
            Iftars, kickoffs, halaqas, late-night socials — a year in the life of MSA at Pitt.
          </TextField></motion.p>
        </motion.div>
      </PageHero>

      <GalleryRecaps/>
      <div className="recap-link"><Link to="/events">Come to the next gathering →</Link></div>
      {albums.length > 0 && <><section className="py-3 liquid-glass-strong sticky nav-sticky z-30 border-b border-border/30">
        <div className="max-w-5xl mx-auto px-4">
          <button type="button" aria-controls="album-filters" aria-expanded={showFilters} className="md:hidden w-full flex items-center justify-between min-h-11 text-sm font-semibold" onClick={() => setShowFilters(v => !v)}>
            Filter albums <span>{activeLabel} {showFilters ? "▴" : "▾"}</span>
          </button>
          <div id="album-filters" className={`space-y-2 ${showFilters ? "" : "hidden md:block"}`}>
          {filterGroups.map((group) => (
            <ContentScope key={group.label} id={"Gallery_11-" + itemIdentity(group, group.label)}><div key={group.label} className="flex items-center gap-3 min-w-0">
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold flex-shrink-0 hidden sm:block w-[52px]"><TextField id="Gallery_12">{group.label}</TextField></span>
              <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                <div className="flex gap-1.5 min-w-max">
                  {group.filters.map((f) => {
                    const isActive = activeFilter === f.key;
                    return (
                      <ContentScope key={f.key} id={"Gallery_13-" + itemIdentity(f, f.key)}><button
                        key={f.key}
                        aria-pressed={isActive}
                        onClick={() => { setActiveFilter(f.key); setShowFilters(false); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msa-gold/60 ${
                          isActive
                            ? "gold-gradient text-primary-foreground shadow-md"
                            : "glass-card text-foreground/80 hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        <TextField id="Gallery_14">{f.label}</TextField>
                      </button></ContentScope>
                    );
                  })}
                </div>
              </div>
            </div></ContentScope>
          ))}
          </div>
        </div>
      </section>

      <section className="section-padding relative">
        <div className="absolute inset-0 steps-surface" />
        <div className="absolute inset-0 texture-dots opacity-60" />
        <div className="max-w-6xl mx-auto relative z-10 pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeFilter} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="grid min-[360px]:grid-cols-2 gap-3 md:gap-8">
              {filtered.map((album, i) => (
                <ContentScope key={album.slug ?? album.title} id={"Gallery_15-" + itemIdentity(album, album.slug ?? album.title)}><AlbumCard key={album.slug ?? album.title} album={album} index={i} /></ContentScope>
              ))}
            </motion.div>
          </AnimatePresence>
          {filtered.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground text-lg py-20"><TextField id="Gallery_16">
              No events in this category yet — check back soon!
            </TextField></motion.p>
          )}
        </div>
      </section>

      </>}
      <section className="section-padding-sm gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ContentScope id="Gallery_17"><ArabicVerse
              arabic="فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي"
              translation="So remember Me; I will remember you. And be grateful to Me."
              reference="Quran 2:152"
            /></ContentScope>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
