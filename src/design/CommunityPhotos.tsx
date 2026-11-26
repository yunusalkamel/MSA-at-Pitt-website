import { communityImageSizes } from "@/lib/communityImageSizes";
import { useHeroTrials } from "./heroTrials";
import { useCallback, useEffect, useMemo, useState, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { Picture, TextField } from "@/editor/content";
import { useTheme } from "@/contexts/ThemeContext";
import { useDesign } from "./options";
import { communityPhoto, communityAlbums, daylightWall, eveningWall } from "@/data/communityPhotos";
import { useReducedMotion } from "framer-motion";
import { ChevronRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";

type Photo = { id: string; src: string; title: string; phoneTile?: string };
const phone = window.matchMedia("(max-width: 767px)");
function subscribeToWidth(update: () => void) {
  phone.addEventListener("change", update);
  return () => phone.removeEventListener("change", update);
}
export function useHeroPhone() {
  return useSyncExternalStore(subscribeToWidth, () => phone.matches);
}
export function HeroPhotos() {
  const { hero, themed, texture, density } = useDesign();
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [wall, setWall] = useState<{ initial: Photo[]; tiles: Photo[]; step: number; previous?: Photo; changed: number }>({
    initial: [], tiles: [], step: 0, changed: -1,
  });
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reelPlaying, setReelPlaying] = useState(false);
  const collage = hero === "Collage";
  const compact = useHeroPhone();
  const columns = density === "Responsive" ? (compact ? 2 : 4) : Number(density[0]);
  const playing = collage
    ? !paused && !reduced
    : hero === "Photo reel" && reelPlaying;
  useEffect(() => {
    if (!host.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const [video, setVideo] = useState<File>();
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!video) return;
    const link = URL.createObjectURL(video);
    setUrl(link);
    return () => URL.revokeObjectURL(link);
  }, [video]);
  const night = themed && theme === "dark";
  const trials = useHeroTrials(night ? "dark" : "light");
  const series = useMemo<Photo[]>(() => {
    const library = (night ? eveningWall : daylightWall).map(id => ({
      ...communityPhoto(id), phoneTile: "/photos/community/" + id + "-tile.webp",
    }));
    return collage ? [...trials, ...library] : trials.length ? trials : library;
  }, [night, trials, collage]);
  const bridgePosition = !compact && columns === 4 && night && !trials.length ? 7 : -1;
  const initial = useMemo(() => {
    const tiles = series.slice(0, columns * columns);
    if (bridgePosition >= 0) tiles[bridgePosition] = communityPhoto("fajr-bridge");
    return tiles;
  }, [bridgePosition, columns, series]);
  const advanceWall = useCallback(() => {
    setWall(current => {
      const tiles = current.initial === initial ? current.tiles : initial;
      const step = current.initial === initial ? current.step : 0;
      const positions = tiles.map((_, i) => (i * (columns % 2 === 0 ? columns * 2 - 1 : columns + 1)) % tiles.length)
        .filter(i => i !== bridgePosition);
      const changed = positions[step % positions.length];
      const currentIds = new Set(tiles.map(photo => photo.id));
      const next = series.map((_, i) => series[(i + tiles.length + step) % series.length])
        .find(photo => !currentIds.has(photo.id));
      if (!next) return current;
      return {
        initial, step: step + 1, changed,
        previous: reduced ? undefined : tiles[changed],
        tiles: tiles.map((photo, i) => i === changed ? next : photo),
      };
    });
  }, [initial, series, columns, bridgePosition, reduced]);
  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (collage) advanceWall();
      else setIndex(i => (i + 1) % series.length);
    }, collage ? (compact ? 7600 : 3200) : 5600);
    return () => window.clearInterval(timer);
  }, [playing, visible, series.length, collage, compact, advanceWall]);
  const offset = index % series.length;
  const activeWall = wall.initial === initial ? wall : null;
  const shown = collage ? activeWall?.tiles ?? initial : [series[hero === "Photo reel" ? offset : 0]];
  const phoneSet = (picture: Photo) =>
    compact && collage && columns === 2 && picture.phoneTile ? picture.phoneTile + " 432w" : undefined;
  const sizes = collage ? Math.ceil(100 / columns) + "vw" : "100vw";
  return (
    <div
      ref={host}
      style={{ "--tiles": columns } as CSSProperties}
      className="community-media"
      data-layout={hero}
      data-texture={texture}
    >
      {hero === "Video" && url ? (
        <video
          key={url}
          controls
          playsInline
          preload="metadata"
          className="community-video"
          src={url}
        />
      ) : (
        <div className="photo-arrangement">
          {shown.map((p, i) => {
            const previous = i === activeWall?.changed ? activeWall.previous : undefined;
            const finishTransition = (restorePrevious = false) => {
              if (!previous) return;
              setWall(current => {
                if (current.initial !== initial || current.step !== activeWall?.step) return current;
                return {
                  ...current,
                  previous: undefined,
                  tiles: restorePrevious ? current.tiles.map((photo, j) => i === j ? previous : photo) : current.tiles,
                };
              });
            };
            return (
              <figure key={i} data-hero-tile={i} data-photo={p.id}>
                {previous && (
                  <img className="wall-previous" src={previous.src}
                    srcSet={phoneSet(previous) || communityImageSizes(previous.src)}
                    sizes={sizes} alt="" aria-hidden="true" />
                )}
                <Picture
                  key={p.id}
                  onLoad={event => {
                    if (previous) event.currentTarget.dataset.revealed = "";
                  }}
                  onError={() => finishTransition(true)}
                  onAnimationEnd={() => finishTransition()}
                  fieldId={`CommunityHero_${night ? "evening" : "day"}_${p.id}`}
                  src={p.src}
                  srcSet={phoneSet(p)}
                  alt={p.title}
                  sizes={sizes}
                  width={700}
                  height={450}
                  loading={i ? "lazy" : "eager"}
                  decoding="async"
                />
                <figcaption>
                  <TextField id={`CommunityCaption_${p.id}`}>{p.title}</TextField>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
      {collage && (
        <div className="wall-controls">
          {!reduced && (
            <button aria-pressed={paused} onClick={() => setPaused((v) => !v)} aria-label={paused ? "Play photos" : "Pause photos"} title={paused ? "Play photos" : "Pause photos"}>
              {paused ? <Play size={16}/> : <Pause size={16}/>}
            </button>
          )}
          <button
            onClick={advanceWall}
            aria-label="Change collage photos"
          >
            <ChevronRight size={18}/>
          </button>
        </div>
      )}
      {hero === "Photo reel" && (
        <div className="media-controls">
          <button
            aria-label="Previous photo"
            onClick={() =>
              setIndex((offset + series.length - 1) % series.length)
            }
          >
            ←
          </button>
          <span>
            {offset + 1} / {series.length}
          </span>
          <button
            aria-label="Next photo"
            onClick={() => setIndex((offset + 1) % series.length)}
          >
            →
          </button>
          <button
            aria-pressed={playing}
            onClick={() => setReelPlaying((v) => !v)}
          >
            {playing ? "Pause reel" : "Play reel"}
          </button>
        </div>
      )}
      {hero === "Video" && (
        <label className="movie-picker">
          Choose a video from this device
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              setVideo(e.target.files?.[0]);
              setUrl("");
            }}
          />
        </label>
      )}
    </div>
  );
}
export type RecapAlbum = {
  slug: string;
  title: string;
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
  const { collection } = useDesign();
  const [selected, setSelected] = useState("");
  const [frame, setFrame] = useState(0);
  const series = [...albums.filter(a => a.shots?.some(p => p.src)), ...communityAlbums].slice(0, 4);
  const album = series.find((a) => a.slug === selected) ?? series[0];
  const shots =
    album?.shots
      ?.filter((p) => p.src)
      .map((p, i) => ({
        id: album.slug + "-" + i,
        src: p.src,
        title: p.caption || album.title,
      })) ?? [];
  const index = frame % shots.length;
  const spotlight = collection === "Spotlight";
  return (
    <section className="moment-section" data-collection={collection}>
      <div className="moment-heading">
        <h2>Life with MSA</h2>
        {galleryLink && <Link to="/gallery">Explore the gallery ↗</Link>}
      </div>
      {series.length > 0 && (
        <div className="recap-selector">
          {series.map((a) => (
            <button
              key={a.slug}
              aria-pressed={album.slug === a.slug}
              onClick={() => {
                setSelected(a.slug);
                setFrame(0);
              }}
            >
              {a.title}
            </button>
          ))}
        </div>
      )}
      <div className="moment-grid">
        {(spotlight ? [shots[index]] : shots).map((p) => (
          <figure key={p.id}>
            <Picture
              fieldId={"Moment_" + p.id}
              src={recapSrc(p.src, spotlight ? 1024 : 480)}
              alt={p.title}
              loading="lazy"
              sizes={spotlight ? "90vw" : "(max-width: 767px) 48vw, 300px"}
              width={spotlight ? 1024 : 480}
              height={spotlight ? 620 : 300}
            />
            <figcaption>
              <TextField id={"MomentCaption_" + p.id}>{p.title}</TextField>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="recap-controls">
        {spotlight && (
          <>
            <button
              aria-label="Previous moment"
              onClick={() =>
                setFrame((index + shots.length - 1) % shots.length)
              }
            >
              ←
            </button>
            <span>
              {index + 1} / {shots.length}
            </span>
            <button
              aria-label="Next moment"
              onClick={() => setFrame((index + 1) % shots.length)}
            >
              →
            </button>
          </>
        )}
        {album && (
          <Link to={"/gallery/" + album.slug}>Open {album.title} album ↗</Link>
        )}
      </div>
    </section>
  );
}
