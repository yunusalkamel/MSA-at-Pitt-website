import { setHeroTrials, useHeroTrials } from "./heroTrials";
import "./review.css";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import {
  choices,
  current,
  proposed,
  switches,
  useReview,
  changeReview,
  type Choice,
  type Switch,
} from "./options";
import { useTheme } from "@/contexts/ThemeContext";

const groups: { title: string; url: string; keys: (Choice | Switch)[] }[] = [
  {
    title: "Home",
    url: "/",
    keys: [
      "hero",
      "framing",
      "wash",
      "density",
      "realPhotos",
      "cardPhotos",
      "themed",
      "texture",
      "eventFirst",
      "nextEvent",
      "eventsOrder",
      "cleanStats",
      "stats",
      "cleanPattern",
      "gradient",
      "chapters",
      "homePrayer",
      "moments",
      "newcomer",
      "plainCopy",
      "punctuation",
    ],
  },
  {
    title: "Navigation and footer",
    url: "/",
    keys: [
      "notice",
      "sampleNotice",
      "themeFade",
      "prayerNav",
      "nextPrayer",
      "lunar",
      "footer",
    ],
  },
  {
    title: "Prayer",
    url: "/resources/prayer",
    keys: ["simpleTimes", "locationPhotos", "mosqueLinks"],
  },
  { title: "Resources", url: "/resources", keys: ["cards", "details"] },
  {
    title: "Events",
    url: "/events",
    keys: ["agenda", "eventPhotos", "eventActions"],
  },
  { title: "About", url: "/about", keys: ["partners"] },
  { title: "Gallery", url: "/gallery", keys: ["collection", "recap"] },
];
const labels = {
  hero: "Hero layout",
  framing: "Hero framing",
  wash: "Hero gradient",
  density: "Collage density",
  chapters: "Section transitions",
  stats: "Stats position",
  collection: "Gallery presentation",
  texture: "Photo texture",
  cards: "Resource card finish",
  details: "Card details",
};
export default function ReviewPanel() {
  const [open, setOpen] = useState(false);
  const { before, picks } = useReview();
  const { theme, toggle } = useTheme();
  const setThemePhotos = picks.themed ? theme : "light";
  const trials = useHeroTrials(setThemePhotos);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  function set(key: Switch | Choice, value: boolean | string) {
    changeReview({ before: false, picks: { ...picks, [key]: value } });
  }
  return (
    <aside
      className="review-tools"
      aria-label="Design comparison"
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      {open && (
        <section
          id="review-controls"
          className="review-panel"
          aria-label="Design controls"
        >
          <header>
            <h2>Design review</h2>
            <button onClick={close} aria-label="Close design controls">
              <X size={19} />
            </button>
          </header>
          <p>Compare the original with your saved choices on this device.</p>
          <div className="review-modes">
            {[true, false].map((a) => (
              <button
                key={String(a)}
                aria-pressed={before === a}
                onClick={() => changeReview({ before: a })}
              >
                {a ? "A · Current" : "B · My choices"}
              </button>
            ))}
          </div>
          <div className="review-actions">
            <button
              onClick={() =>
                changeReview({ before: false, picks: { ...proposed } })
              }
            >
              All proposed
            </button>
            <button
              onClick={() =>
                changeReview({ before: false, picks: { ...current } })
              }
            >
              Start from current
            </button>
            <button onClick={toggle}>
              {theme === "light" ? "Dark" : "Light"} mode
            </button>
          </div>
          {groups.map((g) => (
            <details key={g.title}>
              <summary>{g.title}</summary>
              <Link to={g.url} onClick={close}>
                View {g.title.toLowerCase()} ↗
              </Link>
              {g.keys.map((k) =>
                k in choices ? (
                  <label key={k}>
                    {labels[k as Choice]}
                    <select
                      value={picks[k as Choice]}
                      onChange={(e) => set(k, e.target.value)}
                    >
                      {choices[k as Choice].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label key={k}>
                    <input
                      type="checkbox"
                      checked={picks[k as Switch]}
                      onChange={(e) => set(k, e.target.checked)}
                    />
                    {switches[k as Switch]}
                  </label>
                ),
              )}
              {g.title === "Home" && (
                <div className="hero-trials">
                  <label>
                    Try {setThemePhotos === "light" ? "daylight" : "evening"}{" "}
                    hero photos
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const selected = Array.from(
                          e.currentTarget.files ?? [],
                        );
                        if (selected.length) {
                          setHeroTrials(setThemePhotos, selected);
                          changeReview({
                            before: false,
                            picks: {
                              ...picks,
                              hero:
                                picks.hero === "Current"
                                  ? "Collage"
                                  : picks.hero,
                            },
                          });
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <small>Photos stay in this tab until you refresh.</small>
                  {trials.length > 0 && (
                    <button onClick={() => setHeroTrials(setThemePhotos, [])}>
                      Clear {trials.length} trial photos
                    </button>
                  )}
                </div>
              )}
            </details>
          ))}
        </section>
      )}
      <div className="review-bar">
        <button
          ref={trigger}
          aria-expanded={open}
          aria-controls="review-controls"
          onClick={() => setOpen((v) => !v)}
        >
          <SlidersHorizontal size={15} /> Design switches
        </button>
        <button
          onClick={() => changeReview({ before: !before })}
          aria-label={before ? "Show my choices" : "Show current site"}
        >
          {before ? "A · Current" : "B · My choices"} ⇄
        </button>
      </div>
    </aside>
  );
}
