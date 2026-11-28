import type { MSAEvent } from "@/data/events";

export type EventActionKind = "signup" | "gallery" | "learn-more" | "details" | "subscribe";

export interface EventAction {
  kind: EventActionKind;
  label: string;
  href?: string;
  external: boolean;
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const candidate = url.trim().replace(/[),.;]+$/, "");

  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  if (!/^https?:\/\//i.test(candidate)) return undefined;

  try {
    return new URL(candidate).toString();
  } catch {
    return undefined;
  }
}

export function resolveEventAction(event: MSAEvent): EventAction {
  // Past events with a gallery URL get a "View Photos" action
  const galleryUrl = normalizeUrl(event.galleryUrl);
  if (event.isPast && galleryUrl) {
    return {
      kind: "gallery",
      label: "View Photos",
      href: galleryUrl,
      external: !galleryUrl.startsWith("/"),
    };
  }

  // An actual registration link takes priority for every event category.
  const rsvpUrl = normalizeUrl(event.rsvpUrl);
  if (rsvpUrl) {
    return {
      kind: "signup",
      label: "RSVP",
      href: rsvpUrl,
      external: !rsvpUrl.startsWith("/"),
    };
  }

  return {
    kind: "details",
    label: "View details",
    href: `/events?event=${encodeURIComponent(event.id)}`,
    external: false,
  };
}
