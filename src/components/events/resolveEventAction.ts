import type { MSAEvent } from "@/data/events";
import { getEventTier } from "./calendar-utils";
import { LINKS } from "@/config/links";

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

  // Recurring events (Jummah / halaqa / sports) → subscribe to calendar
  const tier = getEventTier(event);
  if (tier === "recurring") {
    return {
      kind: "subscribe",
      label: "Subscribe to Calendar",
      href: LINKS.googleCalendarSubscribe,
      external: true,
    };
  }

  // Upcoming/signature: use rsvpUrl if present, else linktree
  const rsvpUrl = normalizeUrl(event.rsvpUrl);
  if (rsvpUrl) {
    return {
      kind: "signup",
      label: "RSVP",
      href: rsvpUrl,
      external: true,
    };
  }

  const clickUrl = normalizeUrl(event.clickUrl);
  if (clickUrl) {
    return {
      kind: "learn-more",
      label: "Learn More",
      href: clickUrl,
      external: !clickUrl.startsWith("/"),
    };
  }

  return {
    kind: "learn-more",
    label: "Learn More",
    href: LINKS.linktree,
    external: true,
  };
}
