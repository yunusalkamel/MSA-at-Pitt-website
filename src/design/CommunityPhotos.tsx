import { HomeStoryBubbles } from "@/components/recaps/RecapStories";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useHeroParallax } from "@/hooks/use-hero-parallax";
import { Content, Picture, TextField } from "@/editor/content";
import { getCollection, findAvailable } from "@/editor/visual-model";
import { useDesign } from "./useDesign";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { communityImageSizes } from "@/lib/communityImageSizes";
import { sanityImageSrcSet } from "@/lib/sanityImageVariants";
import {
  communityPhoto, daylightWall, eveningWall, wallCaption, type PhotoId,
} from "@/data/communityPhotos";

type WallPhoto = PhotoId | `managed-${string}`;
type Tile = { photo: WallPhoto; previous?: WallPhoto };

function intersects(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
function apart(a: number, b: number, columns: number) {
  return Math.max(Math.abs(a % columns - b % columns), Math.abs(Math.floor(a / columns) - Math.floor(b / columns))) > 1;
}

function Wall({ phone, night }: { phone: boolean; night: boolean }) {
  const design = useDesign();
  const fullPhoto = design.hero === "single" || design.hero === "reel";
  const still = design.hero === "single" || design.rotation === "still";
  const density = design.density === "dense" ? 5 : design.density === "sparse" ? 2 : 4;
  const columns = fullPhoto ? 1 : phone ? 2 : density;
  const rows = fullPhoto ? 1 : phone ? 4 : density;
  const { fields } = useContext(Content);
  const collection = getCollection(fields,"hero");
  const managedPhotos = useMemo(() => {
    const photos = findAvailable(collection)?.filter(item => item.image && [night ? "night" : "day","both"].includes(item.role || "day")) ?? [];
    return new Map<WallPhoto, {src:string; title:string}>(photos.map(photo => [`managed-${photo.id}`,{src:photo.image,title:photo.title}]));
  },[collection,night]);
  const library = useMemo(() => {
    const fallback = (night ? eveningWall : daylightWall) as readonly PhotoId[];
    const urls = new Set([...managedPhotos.values()].map(photo=>photo.src));
    return [...managedPhotos.keys(),...fallback.filter(id=>!urls.has(communityPhoto(id).src))];
  },[managedPhotos,night]);
  const reserveBridge = !fullPhoto && !phone && night && density === 4 && !managedPhotos.size ? 7 : -1;
  const sources = useRef(fields);
  sources.current = fields;
  const reduced = useReducedMotion();
  const parallax = useHeroParallax();
  const wall = useRef<HTMLDivElement>(null);
  const last = useRef(-1);
  const changes = useRef(0);
  const busy = useRef(false);
  const epoch = useRef(0);
  const prefix = night ? "CommunityHero_evening_" : "CommunityHero_day_";
  const start = useMemo(() => {
    const photos = library.filter(id => reserveBridge < 0 || id !== "fajr-bridge").slice(0, columns * rows);
    if (reserveBridge >= 0) photos[reserveBridge] = "fajr-bridge";
    if (phone && !fullPhoto && !managedPhotos.size) {
      const belowTopRight = columns + 1;
      [photos[1], photos[belowTopRight]] = [photos[belowTopRight], photos[1]];
    }
    return photos.map(photo => ({ photo }));
  }, [library, columns, rows, reserveBridge, phone, fullPhoto, managedPhotos]);
  const [tiles, setTiles] = useState<Tile[]>(start);
  const lastChanged = useRef<number[]>(start.map((_, index) => phone && index < columns * 2 ? -1 : 0));
  const board = useRef(tiles);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [paused, setPaused] = useState(false);
  const sizes = `${Math.ceil(100 / columns)}vw`;
  const fieldsReady = useRef(false);

  function source(id: WallPhoto, slot = -1) {
    const managed = managedPhotos.get(id);
    const photo = managed ?? communityPhoto(id as PhotoId);
    const selected = sources.current["//" + prefix + id];
    const legacy = slot === 0 ? sources.current["//Index_4"] : undefined;
    const custom = selected?.kind === "image" ? selected : legacy?.kind === "image" ? legacy : undefined;
    if (custom) {
      return { src: custom.url, srcSet: communityImageSizes(custom.url) || sanityImageSrcSet(custom.url, 720) };
    }
    const variants = communityImageSizes(photo.src);
    if (managed) return {src:photo.src,srcSet:variants || sanityImageSrcSet(photo.src,1920)};
    return { src: photo.src.replace(".webp", "-320.webp"), srcSet: variants };
  }

  useEffect(() => {
    if (!wall.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(wall.current);
    const updateTab = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateTab);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateTab);
      epoch.current++;
    };
  }, []);

  useEffect(() => {
    // A published override can refer to another photo already present in the grid.
    if (fieldsReady.current || !Object.keys(fields).length) return;
    fieldsReady.current = true;
    const urls = new Set<string>();
    const unique = board.current.map((tile, index) => {
      const fallback = library.find(id =>
        id !== "fajr-bridge" && !board.current.some(cell => cell.photo === id) && !urls.has(source(id).src));
      const photo = urls.has(source(tile.photo, index).src) && fallback ? fallback : tile.photo;
      urls.add(source(photo, index).src);
      return { photo };
    });
    board.current = unique;
    setTiles(unique);
  }, [fields, library]);

  async function advance() {
    if (still || reduced || busy.current || !wall.current || document.hidden ||
        board.current.filter(tile => tile.previous).length >= 2) return;
    const hero = wall.current.closest("[data-photo-hero]");
    if (!hero) return;
    const protectedBoxes = Array.from(hero.querySelectorAll(".hero-words h1, .hero-words .font-script, .hero-words .hero-actions"))
      .map(element => element.getBoundingClientRect());
    const indices = Array.from(wall.current.querySelectorAll("figure")).flatMap((element, index) => {
      const reserved = !!board.current[index].previous || index === reserveBridge || (index === 0 && sources.current["//Index_4"]?.kind === "image");
      return reserved || (!fullPhoto && protectedBoxes.some(box => intersects(box, element.getBoundingClientRect()))) ? [] : [index];
    });
    const movable = indices.filter(index => fullPhoto || index !== last.current);
    const eligible = phone || fullPhoto ? movable : movable.filter(index =>
      last.current < 0 || apart(index, last.current, columns));
    if (!eligible.length) return;
    const oldest = Math.min(...eligible.map(index => lastChanged.current[index]));
    const due = eligible.filter(index => lastChanged.current[index] === oldest);
    const spaced = due.filter(index => last.current < 0 || apart(index, last.current, columns));
    const slots = spaced.length ? spaced : due;
    const slot = slots[Math.floor(Math.random() * slots.length)];
    const shown = new Set(board.current.flatMap((tile, index) => [source(tile.photo, index).src, ...(tile.previous ? [source(tile.previous, index).src] : [])]));
    const alternatives = library.filter(id => !shown.has(source(id, slot).src));
    if (!alternatives.length) return;
    const photo = alternatives[Math.floor(Math.random() * alternatives.length)];
    const next = source(photo, slot);
    const img = new Image();
    img.sizes = sizes;
    if (next.srcSet) img.srcset = next.srcSet;
    img.src = next.src;
    busy.current = true;
    const currentEpoch = epoch.current;
    try { await img.decode(); } catch { return; } finally { busy.current = false; }
    if (epoch.current !== currentEpoch || document.hidden || !wall.current) return;
    last.current = slot;
    lastChanged.current[slot] = ++changes.current;
    board.current = board.current.map((tile, i) => i === slot ? { photo, previous: tile.photo } : tile);
    setTiles(board.current);
  }

  useEffect(() => {
    if (still || paused || reduced || !visible || !tabVisible) return;
    let timer: number;
    const schedule = () => {
      const wait = (phone ? 1800 + Math.random() * 900 : 1600 + Math.random() * 700) * (design.rotation === "slow" || fullPhoto ? 2 : 1);
      timer = window.setTimeout(async () => {
        await advance();
        if (epoch.current === activeEpoch) schedule();
      }, wait);
    };
    const activeEpoch = ++epoch.current;
    const images = Array.from(wall.current?.querySelectorAll("img") ?? []);
    void Promise.allSettled(images.map(image => image.decode())).then(() => {
      if (epoch.current === activeEpoch) schedule();
    });
    return () => { epoch.current++; window.clearTimeout(timer); };
  }, [paused, reduced, visible, tabVisible, phone, still, design.rotation, fullPhoto]);

  const finish = (index: number, previous: WallPhoto, restore: boolean) => {
    if (board.current[index].previous !== previous) return;
    board.current = board.current.map((tile, i) => i === index ? { photo: restore ? previous : tile.photo } : tile);
    setTiles(board.current);
  };

  return (
    <div className="community-media">
      <motion.div className="photo-arrangement" ref={wall} style={{ y: parallax,
        ...(columns !== (phone ? 2 : 4) || rows !== 4 ? {gridTemplateColumns:`repeat(${columns}, minmax(0,1fr))`,gridTemplateRows:`repeat(${rows}, minmax(0,1fr))`} : {})
      }} aria-hidden="true">
        {tiles.map(({ photo, previous }, index) => {
          return (
            <figure key={index} data-hero-tile={index} data-photo={photo}>
              {(previous ? [previous, photo] : [photo]).map(id => {
                const outgoing = id === previous;
                const incoming = !!previous && !outgoing;
                return <Picture key={id} fieldId={prefix + id} fallbackFieldIds={index === 0 ? ["Index_4"] : undefined}
                  {...source(id, index)} sizes={sizes} alt="" decoding="async" width={720} height={450}
                  {...(index === 0 && !outgoing ? { fetchpriority: "high" } : {})}
                  style={{ objectPosition: managedPhotos.has(id) ? "50% 38%" : communityPhoto(id as PhotoId).focus }}
                  className={outgoing ? "wall-previous" : incoming ? "wall-incoming" : undefined}
                  onAnimationEnd={incoming ? () => finish(index, previous, false) : undefined}
                  onError={incoming ? () => finish(index, previous, true) : undefined} />;
              })}
              <figcaption className="sr-only"><TextField id={`CommunityCaption_${photo}`}>{managedPhotos.get(photo)?.title ?? wallCaption(photo as PhotoId)}</TextField></figcaption>
            </figure>
          );
        })}
      </motion.div>
      {!reduced && !still && <div className="wall-controls">
        <button type="button" aria-label={paused ? "Play photos" : "Pause photos"} aria-pressed={paused}
          onClick={() => { epoch.current++; setPaused(!paused); }}>
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button type="button" aria-label="Change collage photos" onClick={() => void advance()}><ChevronRight size={18} /></button>
      </div>}
    </div>
  );
}

export function HeroPhotos() {
  const { theme } = useTheme();
  const phone = useIsMobile();
  const design = useDesign();
  const { fields } = useContext(Content);
  const managed = getCollection(fields,"hero");
  const night = design.photography === "night" || (design.photography !== "day" && theme === "dark");
  return <div className="wall-region" role="group" aria-label="Photos from MSA at Pitt gatherings">
    <Wall key={[phone,night,design.hero,design.density,managed?.map(item=>[item.id,item.image,item.role,item.hidden].join(",")).join(";")].join("|")} phone={phone} night={night} />
  </div>;
}

export function Moments() {
  return (
    <section className="moment-section recap-gallery">
      <div className="moment-heading">
        <h2><TextField id="Index_60">Life with MSA</TextField></h2>
        <Link to="/gallery"><TextField id="Index_61">Explore the gallery</TextField> →</Link>
      </div>
      <HomeStoryBubbles />
    </section>
  );
}
