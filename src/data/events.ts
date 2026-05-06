// ── Structured classification types ───────────────────────────
export type AudienceTag = "brothers" | "sisters" | "general";

export type EventCategory =
  | "jumuah"
  | "dawah"
  | "sports"
  | "social"
  | "halaqa"
  | "signature"
  | "ramadan"
  | "career"
  | "service"
  | "meeting"
  | "fundraiser"
  | "cec"
  | "other";

// ── Main event type ────────────────────────────────────────────
export interface MSAEvent {
  id: string;
  title: string;
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate?: string;
  timeLabel: string;
  location: string;
  shortBlurb: string;
  description?: string;

  // Structured classification (new)
  audience: AudienceTag;
  categories: EventCategory[];
  isSignature: boolean;
  tagSource: "explicit" | "rules" | "ai" | "uncategorized";
  confidence: number; // 0.0–1.0

  // URL fields (new)
  rsvpUrl?: string;            // RSVP/signup URL parsed from the description
  googleCalendarUrl?: string;  // direct link to this event in Google Calendar (from ICS URL field, may be absent)
  calendarFallbackUrl: string; // central MSA Google Calendar URL — always set
  clickUrl: string;            // computed: rsvpUrl → gcal → linktree

  // Display tags derived from audience + categories (for backward compat with filter bar + tag chips)
  tags: EventTag[];

  // Legacy / backward compat aliases — kept so existing components don't break
  featured?: boolean;
  isPast?: boolean;
  ctaMode?: "rsvp" | "signup" | "join-now" | "view-photos" | "learn-more";
  signupUrl?: string;    // ← same value as rsvpUrl; kept for backward compat
  galleryUrl?: string;
  addToCalendarUrl?: string;
  fullCalendarUrl?: string; // ← same value as clickUrl; kept for backward compat
  coverImage?: string;
}

// ── Display tags (for filter bar + tag chips) ─────────────────

// Category-based tags (what kind of event)
export const CATEGORY_CONTENT_TAGS = [
  "Jummah",
  "Halaqa",
  "Dawah",
  "Social",
  "Sports",
  "Ramadan",
  "Career",
  "Service",
  "Signature",
  "CEC",
] as const;

// Audience-based tags (who the event is for) — Joint is displayed as General
export const AUDIENCE_TAGS = [
  "Brothers",
  "Sisters",
  "General",
] as const;

export const EVENT_CONTENT_TAGS = [...CATEGORY_CONTENT_TAGS, ...AUDIENCE_TAGS] as const;

export type EventTag = (typeof EVENT_CONTENT_TAGS)[number];

export const EVENT_TAGS = ["All", ...EVENT_CONTENT_TAGS, "Past Events"] as const;

export { LINKS as EVENT_LINKS } from "@/config/links";
import { LINKS } from "@/config/links";

export const GOOGLE_CALENDAR_URL = LINKS.googleCalendarSubscribe;
export const APPLE_CALENDAR_URL = LINKS.appleCalendarSubscribe;
export const EVENT_SIGNUP_HUB_URL = LINKS.eventSignupHub;

// ── Helpers for dynamic evergreen dates ───────────────────────
function getNextWeekday(targetDay: number): string {
  const today = new Date();
  const day = today.getDay();
  const diff = (targetDay - day + 7) % 7 || 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next.toISOString().split("T")[0];
}

// ── Mock / Fallback Data ───────────────────────────────────────
export const mockEvents: MSAEvent[] = [
  {
    id: "evergreen-jummah",
    title: "Friday Prayer (Jummah)",
    startDate: getNextWeekday(5), // 5 = Friday
    timeLabel: "Friday · 1:00 – 2:00 PM",
    location: "Nordy's Place, Cathedral of Learning",
    shortBlurb: "Weekly congregational prayer open to all students, faculty, and staff. Check Instagram Stories Friday morning for location confirmation.",
    // Structured classification
    audience: "general",
    categories: ["jumuah"],
    isSignature: false,
    tagSource: "rules",
    confidence: 0.9,
    // URLs
    calendarFallbackUrl: GOOGLE_CALENDAR_URL,
    clickUrl: GOOGLE_CALENDAR_URL, // Jummah → calendar, not linktree
    // Display
    tags: ["Jummah", "General"] as EventTag[],
    // Backward compat
    ctaMode: "learn-more",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
  {
    id: "evergreen-halaqa",
    title: "Weekly Halaqa",
    startDate: getNextWeekday(2), // 2 = Tuesday
    timeLabel: "Tuesday · 7:00 – 8:30 PM",
    location: "Cathedral of Learning",
    shortBlurb: "Our weekly circle of knowledge — reflective discussion on Quranic themes and community conversation.",
    // Structured classification
    audience: "general",
    categories: ["halaqa"],
    isSignature: false,
    tagSource: "rules",
    confidence: 0.8,
    // URLs
    calendarFallbackUrl: GOOGLE_CALENDAR_URL,
    clickUrl: LINKS.linktree,
    // Display
    tags: ["Halaqa", "General"] as EventTag[],
    // Backward compat
    ctaMode: "learn-more",
    addToCalendarUrl: GOOGLE_CALENDAR_URL,
  },
];

// ── Helpers ──────────────────────────────────────────────
export function getUpcomingEvents(events: MSAEvent[]): MSAEvent[] {
  return events.filter((e) => !e.isPast).sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/**
 * Returns events within the next `days` days.
 * If fewer than `minimum` events fall in that window, falls back to the next `minimum` upcoming events.
 */
export function getUpcomingWindow(events: MSAEvent[], days = 15, minimum = 3): MSAEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  const sorted = events
    .filter((e) => !e.isPast)
    .filter((e) => new Date(e.startDate + "T12:00:00") >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const inWindow = sorted.filter((e) => new Date(e.startDate + "T12:00:00") <= cutoff);
  return inWindow.length >= minimum ? inWindow : sorted.slice(0, minimum);
}

export function getPastEvents(events: MSAEvent[]): MSAEvent[] {
  return events.filter((e) => e.isPast).sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getFeaturedEvent(events: MSAEvent[]): MSAEvent | undefined {
  // Prefer an event explicitly tagged "Signature" first, fall back to featured flag
  return (
    events.find((e) => !e.isPast && e.tags.includes("Signature")) ??
    events.find((e) => !e.isPast && e.featured)
  );
}

export function filterEventsByTags(events: MSAEvent[], selectedTags: string[]): MSAEvent[] {
  if (selectedTags.length === 0 || selectedTags.includes("All")) return events;
  if (selectedTags.includes("Past Events")) {
    const otherTags = selectedTags.filter((t) => t !== "Past Events");
    const pastEvents = events.filter((e) => e.isPast);
    if (otherTags.length === 0) return pastEvents;
    return pastEvents.filter((e) => e.tags.some((t) => otherTags.includes(t)));
  }
  return events
    .filter((e) => !e.isPast)
    .filter((e) => e.tags.some((t) => selectedTags.includes(t)));
}

export function getEventsForDate(events: MSAEvent[], dateStr: string): MSAEvent[] {
  return events.filter((e) => e.startDate === dateStr);
}
