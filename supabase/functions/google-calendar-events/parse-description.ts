// Parses a Google Calendar event description to extract RSVP URLs and #hashtags.
// This is the highest-priority classification source — explicit hashtags are always trusted over rules or AI.

type AudienceTag = "brothers" | "sisters" | "joint" | "general";
type EventCategory =
  | "jumuah" | "dawah" | "sports" | "social" | "halaqa"
  | "signature" | "ramadan" | "career" | "service"
  | "meeting" | "fundraiser" | "other";

export type ParsedDescription = {
  rsvpUrl?: string;
  audience: AudienceTag | null;   // null means no audience hashtag was found
  categories: EventCategory[];    // only populated from hashtags
  isSignature: boolean;
  tagSource: "explicit" | null;   // "explicit" only if at least one hashtag was found
  confidence: 1.0 | null;
};

// Hashtag → audience mapping (lowercase, no leading #)
const AUDIENCE_HASHTAGS: Record<string, AudienceTag> = {
  brothers: "brothers",
  brother: "brothers",
  sisters: "sisters",
  sister: "sisters",
  joint: "joint",
};

// Hashtag → category mapping (lowercase, no leading #)
// Some hashtags also set isSignature = true
const CATEGORY_HASHTAGS: Record<string, { category: EventCategory; signature?: true }> = {
  jumuah: { category: "jumuah" },
  jummah: { category: "jumuah" },
  jumua: { category: "jumuah" },
  jummahprayer: { category: "jumuah" },
  halaqa: { category: "halaqa" },
  dawah: { category: "dawah" },
  sports: { category: "sports" },
  social: { category: "social" },
  signature: { category: "signature", signature: true },
  featured: { category: "signature", signature: true },
  major: { category: "signature", signature: true },
  ramadan: { category: "ramadan" },
  career: { category: "career" },
  service: { category: "service" },
  meeting: { category: "meeting" },
  fundraiser: { category: "fundraiser" },
};

function stripTrailingPunctuation(url: string): string {
  return url.replace(/[),.:;]+$/, "");
}

function registrationDestination(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return (host === "forms.gle" && url.pathname.length > 1) ||
      (host === "docs.google.com" && url.pathname.startsWith("/forms/")) ||
      ((host === "typeform.com" || host.endsWith(".typeform.com")) && url.pathname.length > 1) ||
      ((host === "signupgenius.com" || host === "eventbrite.com") && /\/(?:go|e)\//.test(url.pathname));
  } catch { return false; }
}

export function extractRegistrationUrl(raw: string): string | undefined {
  const text = raw.replace(/<br\s*\/?\s*>|<\/(?:p|div|li)>/gi, "\n")
    .replace(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "$2 $1")
    .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&");
  const lines = text.split(/\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    for (const match of line.matchAll(/https?:\/\/[^\s<>"']+/gi)) {
      const url = stripTrailingPunctuation(match[0]);
      // A hub or calendar is not a direct registration destination.
      try { if (["linktr.ee","calendar.google.com"].includes(new URL(url).hostname.replace(/^www\./,""))) continue; }
      catch { continue; }
      const before = line.slice(0, match.index);
      const label = before.trim() ? before : (lines[index - 1] || "");
      const negative = /no\s+(?:rsvp|registration|sign.?up)(?:\s+(?:is|needed|required|necessary))*|(?:rsvp|registration)\s+(?:is\s+)?not\s+(?:required|needed)/i.test(label);
      const designated = !negative && /(?:rsvp|register|registration|sign[ -]?up|tickets)(?:(?![.!?\n]|https?:).){0,60}$/i.test(label);
      if (designated || registrationDestination(url)) return url;
    }
  }
  return undefined;
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-z0-9]+/gi) ?? [];
  return matches.map((tag) => tag.slice(1).toLowerCase()); // strip leading #, lowercase
}

export function parseDescription(
  rawDescription: string,
  _rawTitle: string,
): ParsedDescription {
  const rsvpUrl = extractRegistrationUrl(rawDescription);
  const hashtags = extractHashtags(rawDescription);

  if (hashtags.length === 0) {
    return {
      rsvpUrl,
      audience: null,
      categories: [],
      isSignature: false,
      tagSource: null,
      confidence: null,
    };
  }

  let audience: AudienceTag | null = null;
  const categoriesSet = new Set<EventCategory>();
  let isSignature = false;

  for (const tag of hashtags) {
    if (tag in AUDIENCE_HASHTAGS) {
      audience = AUDIENCE_HASHTAGS[tag];
    } else if (tag in CATEGORY_HASHTAGS) {
      const entry = CATEGORY_HASHTAGS[tag];
      categoriesSet.add(entry.category);
      if (entry.signature) isSignature = true;
    }
  }

  const categories = Array.from(categoriesSet);

  return {
    rsvpUrl,
    audience,
    categories,
    isSignature,
    tagSource: "explicit",
    confidence: 1.0,
  };
}
