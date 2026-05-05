import type { MSAEvent } from "@/data/events";

export type EventActionKind = "signup" | "gallery" | "learn-more" | "details";

export interface EventAction {
  kind: EventActionKind;
  label: string;
  href?: string;
  external: boolean;
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const candidate = url.trim().replace(/[),.;]+$/, "");

  if (candidate.startsWith("/")) return candidate;
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

  // Use the pre-computed clickUrl (set server-side: rsvpUrl → gcal → linktree)
  const url = normalizeUrl(event.clickUrl);
  if (url) {
    const isRsvp = !!event.rsvpUrl;
    return {
      kind: isRsvp ? "signup" : "learn-more",
      label: isRsvp ? "RSVP" : "View Details",
      href: url,
      external: !url.startsWith("/"),
    };
  }

  return {
    kind: "details",
    label: "Details",
    external: false,
  };
}
