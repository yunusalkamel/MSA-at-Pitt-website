import { lazy, Suspense, useCallback, useContext, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { recapDate, recaps, type Recap } from "@/data/recaps";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { nextGathering } from "@/lib/nextGathering";
import { Content } from "@/editor/content";
import { findAvailable, getCollection } from "@/editor/visual-model";
import { sanityImageSrcSet } from "@/lib/sanityImageVariants";
import "./recaps.css";

const RecapViewer = lazy(() => import("./RecapViewer"));
const seenKey = "msa-seen-recaps-v1";
const filters = [
  { value: "all", label: "All" },
  { value: "brothers", label: "Brothers" },
  { value: "sisters", label: "Sisters" },
] as const;
type Filter = typeof filters[number]["value"];

function savedRecaps() {
  try {
    const contents: unknown = JSON.parse(localStorage.getItem(seenKey) ?? "[]");
    return new Set(Array.isArray(contents) ? contents.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function useRecapViewer(visible: Recap[], stories: Recap[]) {
  const location = useLocation();
  const navigate = useNavigate();
  const opener = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(savedRecaps);
  const params = new URLSearchParams(location.search);
  const story = stories.find(item => item.slug === params.get("story"));
  const requested = Number(params.get("slide") ?? "1");
  const slide = story && Number.isInteger(requested)
    ? Math.min(Math.max(requested - 1, 0), story.slides.length - 1)
    : 0;
  const list = visible.some(item => story?.slug === item.slug) ? visible : stories;

  function show(item?: Recap, index = 0) {
    if (item) {
      params.set("story", item.slug);
      params.set("slide", String(index + 1));
    } else {
      params.delete("story");
      params.delete("slide");
    }
    const search = params.toString();
    void navigate({ pathname: location.pathname, search: search ? "?" + search : "", hash: location.hash }, {
      replace: true, preventScrollReset: true,
    });
  }

  function open(item: Recap, trigger: HTMLElement) {
    opener.current = trigger;
    show(item);
  }

  const onOpen = useCallback((item: Recap) => {
    setSeen(previous => {
      if (previous.has(item.slug)) return previous;
      const updated = new Set(previous).add(item.slug);
      try { localStorage.setItem(seenKey, JSON.stringify([...updated])); } catch { /* Keep the in-memory seen state. */ }
      return updated;
    });
    void import("@/lib/traffic").then(({ trackStory }) => trackStory("story_open", item.slug));
  }, []);

  const onComplete = useCallback((item: Recap) => {
    void import("@/lib/traffic").then(({ trackStory }) => trackStory("story_complete", item.slug));
  }, []);

  return {
    seen, open,
    viewer: story && <Suspense fallback={null}>
      <RecapViewer stories={list} story={story} slide={slide} opener={opener.current}
        onShow={show} onClose={() => show()} onOpen={onOpen} onComplete={onComplete} />
    </Suspense>,
  };
}

function Bubbles({ stories, seen, onOpen, more = false }: {
  stories: Recap[];
  seen: Set<string>;
  onOpen: (story: Recap, trigger: HTMLElement) => void;
  more?: boolean;
}) {
  return (
    <div className="recap-bubble-rail">
      <div className="recap-bubbles" aria-label="Event recap stories" role="group">
        {stories.map(item => (
          <button key={item.slug} type="button" className="recap-bubble" data-seen={seen.has(item.slug) || undefined}
            aria-label={`${item.title}, ${recapDate(item.date)}${seen.has(item.slug) ? ", viewed" : ""}`}
            onClick={event => onOpen(item, event.currentTarget)}>
            <span className="recap-ring"><img src={item.cover} srcSet={sanityImageSrcSet(item.cover,320) || undefined} sizes="88px" width={320} height={320} alt="" loading="lazy" decoding="async" /></span>
            <span className="recap-bubble-title">{item.title}</span>
            <span className="recap-bubble-date">{recapDate(item.date, true)}</span>
          </button>
        ))}
        {more && <Link className="recap-bubble recap-more" to="/gallery">
          <span className="recap-ring"><span><ArrowRight size={21} aria-hidden="true" /></span></span>
          <span className="recap-bubble-title">See all</span>
        </Link>}
      </div>
    </div>
  );
}

function useStories() {
  const { fields } = useContext(Content);
  const managed = findAvailable(getCollection(fields, "stories"));
  if (!managed) return { stories: recaps, featured: recaps.slice(0, 6) };
  const configured = managed.flatMap(item => {
    if (!item.slug || !item.photos?.length) return [];
    const cover = item.image || item.photos[0].src;
    const story: Recap = {slug:item.slug,title:item.title,date:item.date,cover,audience:item.audience ?? "everyone",
      stat:item.body,slides:item.photos.map(photo => ({...photo,aspect:photo.aspect ?? .8}))};
    return [{story, home: item.home}];
  });
  return {stories: configured.map(item=>item.story), featured:configured.filter(item=>item.home).map(item=>item.story).slice(0,6)};
}

export function HomeStoryBubbles() {
  const { stories, featured: latest } = useStories();
  const story = useRecapViewer(latest, stories);
  return <><Bubbles stories={latest} seen={story.seen} onOpen={story.open} more />{story.viewer}</>;
}

function groupBySemester(stories: Recap[]) {
  const groups = new Map<string, Recap[]>();
  for (const story of stories) {
    const [year, month] = story.date?.split("-") ?? [];
    const semester = month ? `${Number(month) >= 8 ? "Fall" : "Spring"} ${year}` : "Dates to confirm";
    const members = groups.get(semester);
    if (members) members.push(story);
    else groups.set(semester, [story]);
  }
  return groups;
}

function NextRecapEvent() {
  const { events } = useCalendarEvents();
  const event = nextGathering(events, new Date(), "chronological");
  if (!event) return null;
  const date = new Date(event.startDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  return <Link className="recap-next-event" to={"/events?event=" + encodeURIComponent(event.id)}>
    <span><span className="recap-next-label">Next up</span><strong>{event.title}</strong>
      <span className="recap-next-meta">{[date, event.timeLabel, event.location].filter(Boolean).join(" · ")}</span></span>
    <ArrowRight size={21} aria-hidden="true" />
  </Link>;
}

export function GalleryStories() {
  const [selected, setFilter] = useState<Filter>("all");
  const { stories } = useStories();
  const filter = selected === "all" || stories.filter(item => item.audience === selected).length >= 2 ? selected : "all";
  const visible = filter === "all" ? stories : stories.filter(item => item.audience === filter);
  const story = useRecapViewer(visible, stories);
  return (
    <section className="gallery-stories site-container" aria-label="Event recaps">
      <div className="recap-filters" role="group" aria-label="Filter recaps">
        {filters.map(({ value, label }) => {
          const count = value === "all" ? stories.length : stories.filter(item => item.audience === value).length;
          if (value !== "all" && count < 2) return null;
          return <button key={value} type="button" aria-pressed={filter === value}
            onClick={() => setFilter(value)}>{label} <span>{count}</span></button>;
        })}
      </div>
      <Bubbles stories={visible} seen={story.seen} onOpen={story.open} />
      <div className="recap-timeline">
        {filter === "all" && <NextRecapEvent />}
        {[...groupBySemester(visible)].map(([semester, items]) => (
          <section key={semester} className="recap-semester" aria-label={semester}>
            <header><h2>{semester}</h2><span>{items.length} {items.length === 1 ? "recap" : "recaps"}</span></header>
            <div className="recap-cards">
              {items.map(item => (
                <button key={item.slug} type="button" className="recap-card" onClick={event => story.open(item, event.currentTarget)}>
                  <img src={item.cover.startsWith("/photos/recaps/") ? item.cover.replace("cover.webp", "thumb.webp") : item.cover} srcSet={sanityImageSrcSet(item.cover,640) || undefined} sizes="(max-width:767px) 85vw, 320px" width={420} height={525} alt="" loading="lazy" decoding="async" />
                  <span className="recap-card-body">
                    <span className="recap-card-date">{recapDate(item.date)}
                      {item.audience !== "everyone" && <span className="recap-audience">{item.audience}</span>}
                    </span>
                    <strong>{item.title}</strong>
                    {item.stat && <span className="recap-stat">{item.stat}</span>}
                    <span className="recap-card-action">View recap · {item.slides.length} slides <ArrowRight size={15} aria-hidden="true" /></span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      {story.viewer}
    </section>
  );
}
