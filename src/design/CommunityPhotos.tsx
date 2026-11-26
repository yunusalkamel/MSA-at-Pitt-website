import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Content, Picture, TextField } from "@/editor/content";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { communityImageSizes } from "@/lib/communityImageSizes";
import { sanityImageSrcSet } from "@/lib/sanityImageVariants";
import {
  albumCaption, communityAlbums, communityPhoto, daylightWall, eveningWall, noPortraitTile, wallCaption, type PhotoId,
} from "@/data/communityPhotos";

type Tile = { photo: PhotoId; previous?: PhotoId };

function intersects(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
function apart(a: number, b: number, columns: number) {
  return Math.max(Math.abs(a % columns - b % columns), Math.abs(Math.floor(a / columns) - Math.floor(b / columns))) > 1;
}

function Wall({ phone, night }: { phone: boolean; night: boolean }) {
  const columns = phone ? 3 : 4;
  const reserveBridge = !phone && night ? 7 : -1;
  const library = useMemo(() => (night ? eveningWall : daylightWall).filter(
    id => phone ? !noPortraitTile.has(id) && id !== "fajr-bridge" : true,
  ), [phone, night]);
  const { fields } = useContext(Content);
  const sources = useRef(fields);
  sources.current = fields;
  const reduced = useReducedMotion();
  const wall = useRef<HTMLDivElement>(null);
  const last = useRef(-1);
  const busy = useRef(false);
  const epoch = useRef(0);
  const prefix = night ? "CommunityHero_evening_" : "CommunityHero_day_";
  const start = useMemo(() => {
    const photos = library.filter(id => reserveBridge < 0 || id !== "fajr-bridge").slice(0, columns * columns);
    if (reserveBridge >= 0) photos[reserveBridge] = "fajr-bridge";
    return photos.map(photo => ({ photo }));
  }, [library, columns, reserveBridge]);
  const [tiles, setTiles] = useState<Tile[]>(start);
  const board = useRef(tiles);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [paused, setPaused] = useState(false);
  const sizes = phone ? "34vw" : "25vw";
  const fieldsReady = useRef(false);

  function source(id: PhotoId, slot = -1) {
    const photo = communityPhoto(id);
    const selected = sources.current["//" + prefix + id];
    const legacy = slot === 0 ? sources.current["//Index_4"] : undefined;
    const custom = selected?.kind === "image" ? selected : legacy?.kind === "image" ? legacy : undefined;
    if (custom) {
      return { src: custom.url, srcSet: communityImageSizes(custom.url) || sanityImageSrcSet(custom.url, 720) };
    }
    return phone
      ? { src: photo.src.replace(".webp", "-tile.webp"), srcSet: photo.src.replace(".webp", "-tile.webp 432w") }
      : { src: photo.src.replace(".webp", "-320.webp"), srcSet: communityImageSizes(photo.src) };
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
    if (reduced || busy.current || !wall.current || document.hidden ||
        board.current.filter(tile => tile.previous).length >= 2) return;
    const hero = wall.current.closest("[data-photo-hero]");
    if (!hero) return;
    const protectedBoxes = Array.from(hero.querySelectorAll(".hero-words h1, .hero-words .font-script, .hero-words .hero-actions"))
      .map(element => element.getBoundingClientRect());
    const indices = Array.from(wall.current.querySelectorAll("figure")).flatMap((element, index) => {
      const reserved = !!board.current[index].previous || index === reserveBridge || (index === 0 && sources.current["//Index_4"]?.kind === "image");
      return reserved || protectedBoxes.some(box => intersects(box, element.getBoundingClientRect())) ? [] : [index];
    });
    const eligible = indices.filter(index =>
      (last.current < 0 || apart(index, last.current, columns)) && indices.some(other => apart(index, other, columns)));
    if (!eligible.length) return;
    const slot = eligible[Math.floor(Math.random() * eligible.length)];
    const shown = new Set(board.current.flatMap((tile, index) => [source(tile.photo, index).src, ...(tile.previous ? [source(tile.previous, index).src] : [])]));
    const alternatives = library.filter(id => id !== "fajr-bridge" && !shown.has(source(id, slot).src));
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
    board.current = board.current.map((tile, i) => i === slot ? { photo, previous: tile.photo } : tile);
    setTiles(board.current);
  }

  useEffect(() => {
    if (paused || reduced || !visible || !tabVisible) return;
    let timer: number;
    const schedule = () => {
      const wait = phone ? 1200 + Math.random() * 800 : 500 + Math.random() * 500;
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
  }, [paused, reduced, visible, tabVisible, phone]);

  const finish = (index: number, previous: PhotoId, restore: boolean) => {
    if (board.current[index].previous !== previous) return;
    board.current = board.current.map((tile, i) => i === index ? { photo: restore ? previous : tile.photo } : tile);
    setTiles(board.current);
  };

  return (
    <div className="community-media">
      <div className="photo-arrangement" ref={wall} aria-hidden="true">
        {tiles.map(({ photo, previous }, index) => {
          const display = source(photo, index);
          return (
            <figure key={index} data-hero-tile={index} data-photo={photo}>
              {previous && <img className="wall-previous" {...source(previous, index)} sizes={sizes}
                style={{ objectPosition: phone ? "center" : communityPhoto(previous).focus }} alt="" />}
              <Picture key={photo} fieldId={prefix + photo} fallbackFieldIds={index === 0 ? ["Index_4"] : undefined}
                {...display} sizes={sizes} alt="" decoding="async" width={720} height={450}
                {...(index === 0 ? { fetchpriority: "high" } : {})}
                style={{ objectPosition: phone ? "center" : communityPhoto(photo).focus }}
                className={previous ? "wall-incoming" : undefined}
                onAnimationEnd={previous ? () => finish(index, previous, false) : undefined}
                onError={previous ? () => finish(index, previous, true) : undefined} />
              <figcaption className="sr-only"><TextField id={`CommunityCaption_${photo}`}>{wallCaption(photo)}</TextField></figcaption>
            </figure>
          );
        })}
      </div>
      {!reduced && <div className="wall-controls">
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
  return <div className="wall-region" role="group" aria-label="Photos from MSA at Pitt gatherings">
    <Wall key={theme + String(phone)} phone={phone} night={theme === "dark"} />
  </div>;
}

export type RecapAlbum = {
  slug: string;
  title: string;
  eventDate?: string;
  shots?: { src: string; caption?: string }[];
};
function recapSrc(src: string, width: number) {
  if (!src.startsWith("https://cdn.sanity.io/images/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("auto", "format");
  return url.href;
}
export function Moments({
  galleryLink = true,
  albums = [],
}: {
  galleryLink?: boolean;
  albums?: RecapAlbum[];
}) {
  const [selected, setSelected] = useState("");
  const series = [...albums.filter(a => a.shots?.some(p => p.src)), ...communityAlbums].slice(0, 4);
  const album = series.find((a) => a.slug === selected) ?? series[0];
  const legacyScope = album.slug ? "Index_64-" + album.slug : "Index_66-" + album.title;
  const legacyField = (id: string) => "//" + encodeURIComponent(legacyScope) + "/" + id;
  const shots =
    album?.shots
      ?.filter((p) => p.src)
      .map((p, i) => ({
        id: album.slug + "-" + i,
        src: p.src,
        title: albumCaption(album),
        description: p.caption || album.title,
      })) ?? [];
  return (
    <section className="moment-section" data-collection="Contact sheet">
      <div className="moment-heading">
        <div>
          {galleryLink && <small className="eyebrow"><TextField id="Index_59">Our Gallery</TextField></small>}
          <h2>{galleryLink ? <TextField id="Index_60">Life with MSA</TextField> : "Life with MSA"}</h2>
        </div>
        {galleryLink && <Link to="/gallery"><TextField id="Index_61">Explore the gallery</TextField> →</Link>}
      </div>
      {series.length > 0 && (
        <div className="recap-selector">
          {series.map((a) => (
            <button
              key={a.slug}
              aria-pressed={album.slug === a.slug}
              onClick={() => {
                setSelected(a.slug);
              }}
            >
              {a.title}
            </button>
          ))}
        </div>
      )}
      <div className="moment-grid">
        {shots.map((p, index) => (
          <figure key={p.id}>
            <Picture
              fieldId={"Moment_" + p.id}
              fallbackFieldKeys={galleryLink && index === 0 ? [legacyField("Index_62")] : undefined}
              src={recapSrc(p.src, 480)}
              alt={p.description}
              loading="lazy"
              sizes="(width < 768px) 48vw, 300px"
              width={480}
              height={300}
            />
            <figcaption>
              <TextField id={"MomentCaption_" + p.id} fallbackFieldKeys={galleryLink && index === 0 ? [legacyField("Index_63")] : undefined}>{p.title}</TextField>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="recap-controls">
        {album && (
          <Link to={"/gallery/" + album.slug}><TextField id={album.slug ? "Index_65" : "Index_67"}>{`Open ${album.title} album →`}</TextField></Link>
        )}
      </div>
    </section>
  );
}
