export interface MSAEvent {
  id: string;
  title: string;
  startDate: string; // ISO date
  endDate?: string;
  timeLabel: string;
  location: string;
  shortBlurb: string;
  description?: string;
  tags: EventTag[];
  audience?: "Brothers" | "Sisters" | "Mixed" | "Open to All";
  featured?: boolean;
  isPast?: boolean;
  ctaMode?: "rsvp" | "signup" | "join-now" | "view-photos" | "learn-more";
  signupUrl?: string;
  galleryUrl?: string;
  addToCalendarUrl?: string;
  fullCalendarUrl?: string;
  coverImage?: string;
}

export const EVENT_CONTENT_TAGS = [
  "Social",
  "Dawah",
  "Brothers",
  "Sisters",
  "Joint",
  "Signature",
  "CEC",
  "Jummah",
] as const;

export type EventTag = (typeof EVENT_CONTENT_TAGS)[number];

export const EVENT_TAGS = ["All", ...EVENT_CONTENT_TAGS, "Past Events"] as const;

export { LINKS as EVENT_LINKS } from "@/config/links";
import { LINKS } from "@/config/links";

export const GOOGLE_CALENDAR_URL = LINKS.googleCalendarSubscribe;
export const APPLE_CALENDAR_URL = LINKS.appleCalendarSubscribe;
export const EVENT_SIGNUP_HUB_URL = LINKS.eventSignupHub;

// ── Helpers for dynamic evergreen dates ───────────────────
function getNextWeekday(targetDay: number): string {
  const today = new Date();
  const day = today.getDay();
  const diff = (targetDay - day + 7) % 7 || 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next.toISOString().split("T")[0];
}

// ── Mock / Fallback Data ───────────────────────────────────
export const mockEvents: MSAEvent[] = [
  {
    id: "evergreen-jummah",
    title: "Friday Prayer (Jummah)",
    startDate: getNextWeekday(5), // 5 = Friday
    timeLabel: "Friday · 1:00 – 2:00 PM",
    location: "Nordy's Place, Cathedral of Learning",
    shortBlurb: "Weekly congregational prayer open to all students, faculty, and staff. Check Instagram Stories Friday morning for location confirmation.",
    tags: ["Jummah"],
    audience: "Open to All",
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
    tags: ["Dawah"],
    audience: "Open to All",
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
