import { useHeroTrials } from "./heroTrials";
import { useEffect, useState, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { Picture, TextField } from "@/editor/content";
import { useTheme } from "@/contexts/ThemeContext";
import { useDesign } from "./options";
import courtyard from "@/assets/community/courtyard.webp";
import flowers from "@/assets/community/flowers.webp";
import students from "@/assets/community/students.webp";
import football from "@/assets/community/football.webp";
import charity from "@/assets/community/charity-week.webp";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

export const photos = [
  { id: "courtyard", src: courtyard, title: "A day out together" },
  { id: "flowers", src: flowers, title: "Celebrating our community" },
  { id: "students", src: students, title: "Friends on campus" },
  { id: "charity", src: charity, title: "Charity Week at Pitt" },
  { id: "football", src: football, title: "Between games" },
];
type Photo = (typeof photos)[number];
const phone = window.matchMedia("(max-width: 767px)");
function subscribeToWidth(update: () => void) {
  phone.addEventListener("change", update);
  return () => phone.removeEventListener("change", update);
}
export function HeroPhotos({ albums = [] }: { albums?: Photo[] }) {
  const { hero, themed, texture, density } = useDesign();
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reelPlaying, setReelPlaying] = useState(false);
  const collage = hero === "Collage";
  const compact = useSyncExternalStore(subscribeToWidth, () => phone.matches);
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
  const series = trials.length
    ? trials
    : [
        ...(night
          ? [photos[3], photos[1], photos[4], photos[0], photos[2]]
          : [photos[0], photos[2], photos[1], photos[4], photos[3]]),
        ...albums,
      ];
  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % series.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [playing, visible, series.length]);
  const offset = index % series.length;
  const shown =
    hero === "Collage"
      ? Array.from(
          { length: columns * columns },
          (_, i) =>
            series[
              (i +
                (series.length <= columns ? Math.floor(i / columns) : 0) +
                offset) %
                series.length
            ],
        )
      : [series[hero === "Photo reel" ? offset : 0]];
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
          {shown.map((p, i) => (
            <figure key={i}>
              <Picture
                fieldId={`CommunityHero_${night ? "evening" : "day"}_${p.id}`}
                src={p.src}
                alt={p.title}
                sizes={collage ? Math.ceil(100 / columns) + "vw" : "100vw"}
                width={700}
                height={450}
                loading={i ? "lazy" : "eager"}
                decoding="async"
              />
              <figcaption>
                <TextField id={`CommunityCaption_${p.id}`}>{p.title}</TextField>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {collage && (
        <div className="wall-controls">
          {!reduced && (
            <button aria-pressed={paused} onClick={() => setPaused((v) => !v)}>
              {paused ? "Play photos" : "Pause photos"}
            </button>
          )}
          <button
            onClick={() => setIndex((i) => (i + 1) % series.length)}
            aria-label="Change collage photos"
          >
            Next ↗
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
  const series = albums.filter((a) => a.shots?.some((p) => p.src));
  const album = series.find((a) => a.slug === selected) ?? series[0];
  const shots =
    album?.shots
      ?.filter((p) => p.src)
      .map((p, i) => ({
        id: album.slug + "-" + i,
        src: p.src,
        title: p.caption || album.title,
      })) ?? photos;
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
