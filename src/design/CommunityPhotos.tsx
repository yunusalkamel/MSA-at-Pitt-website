import { useEffect, useState } from "react";
import { Picture, TextField } from "@/editor/content";
import { useTheme } from "@/contexts/ThemeContext";
import { useDesign } from "./options";
import courtyard from "@/assets/community/courtyard.webp";
import flowers from "@/assets/community/flowers.webp";
import students from "@/assets/community/students.webp";
import football from "@/assets/community/football.webp";
import charity from "@/assets/community/charity-week.webp";
import { Link } from "react-router-dom";

export const photos = [
  { id: "courtyard", src: courtyard, title: "A day out together" },
  { id: "flowers", src: flowers, title: "Celebrating our community" },
  { id: "students", src: students, title: "Friends on campus" },
  { id: "charity", src: charity, title: "Charity Week at Pitt" },
  { id: "football", src: football, title: "Between games" },
];
type Photo = (typeof photos)[number];
export function HeroPhotos({ albums = [] }: { albums?: Photo[] }) {
  const { hero, themed, texture } = useDesign();
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [video, setVideo] = useState<File>();
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!video) return;
    const link = URL.createObjectURL(video);
    setUrl(link);
    return () => URL.revokeObjectURL(link);
  }, [video]);
  const night = themed && theme === "dark";
  const series = [
    ...(night
      ? [photos[3], photos[1], photos[0]]
      : [photos[0], photos[2], photos[1]]),
    ...albums,
    photos[4],
  ];
  useEffect(() => {
    if (!playing || hero !== "Photo reel") return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % series.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [playing, hero, series.length]);
  const offset = index % series.length;
  const shown =
    hero === "Collage"
      ? series.slice(0, 3)
      : [series[hero === "Photo reel" ? offset : 0]];
  return (
    <div className="community-media" data-layout={hero} data-texture={texture}>
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
            <figure key={p.id}>
              <Picture
                fieldId={`CommunityHero_${night ? "evening" : "day"}_${p.id}`}
                src={p.src}
                alt={p.title}
                sizes="(max-width: 767px) 88vw, 520px"
                width={700}
                height={450}
                loading={i ? "lazy" : "eager"}
              />
              <figcaption>
                <TextField id={`CommunityCaption_${p.id}`}>{p.title}</TextField>
              </figcaption>
            </figure>
          ))}
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
          <button aria-pressed={playing} onClick={() => setPlaying((v) => !v)}>
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
export function Moments({ galleryLink = true }: { galleryLink?: boolean }) {
  return (
    <section className="moment-section">
      <div className="moment-heading">
        <h2>Life with MSA</h2>
        {galleryLink && <Link to="/gallery">Explore the gallery ↗</Link>}
      </div>
      <div className="moment-grid">
        {[photos[4], photos[3], photos[1]].map((p) => (
          <figure key={p.id}>
            <Picture
              fieldId={"Moment_" + p.id}
              src={p.src}
              alt={p.title}
              loading="lazy"
              width={480}
              height={300}
            />
            <figcaption>
              <TextField id={"MomentCaption_" + p.id}>{p.title}</TextField>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
