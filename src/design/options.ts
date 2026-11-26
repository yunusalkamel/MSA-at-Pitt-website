import { useSyncExternalStore } from "react";

declare const __DESIGN_PREVIEW__: boolean;
export const previewEnabled =
  typeof __DESIGN_PREVIEW__ !== "undefined" && __DESIGN_PREVIEW__;
export const switches = {
  notice: "Use a compact live announcement strip",
  cardPhotos: "Add photos to community and focus cards",
  eventActions: "Use descriptive event actions",
  realPhotos: "Use community photos across the site",
  themed: "Daylight and evening photo sets",
  eventFirst: "Lead with upcoming events",
  nextEvent: "Feature the next scheduled event",
  eventsOrder: "Move upcoming events above the story",
  cleanStats: "Remove the scroll cue and align the stats",
  cleanPattern: "Remove the khatam below the hero",
  gradient: "Use one continuous background",
  lunar: "Add a crescent to the prayer link",
  homePrayer: "Show prayer in the gallery position",
  newcomer: "Add a first-visit and volunteer path",
  prayerNav: "Give Prayer a main menu position",
  nextPrayer: "Show the next prayer in navigation",
  simpleTimes: "Put daily times first and fold the chart",
  locationPhotos: "Show prayer location photos",
  mosqueLinks: "Link to nearby mosque websites",
  partners: "Show the mosque partner directory",
  agenda: "Open Events in list view on phones",
  eventPhotos: "Show featured event photos",
  recap: "Link gallery recaps to upcoming events",
  footer: "Group footer links by student task",
  moments: "Show named community moments",
  plainCopy: "Use the revised welcome copy",
} as const;
export type Switch = keyof typeof switches;
export const choices = {
  hero: ["Current", "Single photo", "Collage", "Photo reel", "Video"],
  texture: ["Current", "Film grain", "Halftone"],
  cards: ["Current", "Flat", "Photo tint", "Frosted photo"],
  details: ["Always visible", "Desktop flip"],
} as const;
export type Choice = keyof typeof choices;
export type Options = Record<Switch, boolean> & Record<Choice, string>;
const flags = (on: boolean) =>
  Object.fromEntries(Object.keys(switches).map((k) => [k, on])) as Record<
    Switch,
    boolean
  >;
export const current: Options = {
  ...flags(false),
  hero: "Current",
  texture: "Current",
  cards: "Current",
  details: "Always visible",
};
export const proposed: Options = {
  ...flags(true),
  hero: "Collage",
  texture: "Film grain",
  cards: "Photo tint",
  details: "Always visible",
};
const storageKey = "msa.design.compare.v1";
type Review = { before: boolean; picks: Options };
function read(): Review {
  const picks = { ...proposed };
  if (previewEnabled)
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      for (const key of Object.keys(switches) as Switch[]) {
        if (typeof saved?.picks?.[key] === "boolean")
          picks[key] = saved.picks[key];
      }
      for (const key of Object.keys(choices) as Choice[]) {
        if ((choices[key] as readonly string[]).includes(saved?.picks?.[key]))
          picks[key] = saved.picks[key];
      }
      return { before: saved?.before === true, picks };
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  return { before: false, picks };
}
let review = read();
const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export function changeReview(next: Partial<Review>) {
  if (!previewEnabled) return;
  review = { ...review, ...next };
  try {
    localStorage.setItem(storageKey, JSON.stringify(review));
  } catch {
    /* In-memory controls still work. */
  }
  listeners.forEach((fn) => fn());
}
export function useReview() {
  return useSyncExternalStore(subscribe, () => review);
}
export function useDesign() {
  const state = useReview();
  return previewEnabled && !state.before ? state.picks : current;
}
