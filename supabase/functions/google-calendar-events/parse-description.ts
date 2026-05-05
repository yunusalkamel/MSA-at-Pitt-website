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

// RSVP keyword prefixes that signal a signup/registration link on the same line
const RSVP_LINE_PREFIXES = [
  "rsvp:",
  "register:",
  "sign up:",
  "signup:",
  "link:",
];

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

function extractRsvpUrl(text: string): string | undefined {
  const lines = text.split(/\n/);

  // 1. Check for a line that starts with a recognized RSVP keyword prefix
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    for (const prefix of RSVP_LINE_PREFIXES) {
      if (trimmed.startsWith(prefix)) {
        const rest = line.slice(prefix.length).trim();
        const urlMatch = rest.match(/https?:\/\/[^\s<>"]+/i);
        if (urlMatch) return stripTrailingPunctuation(urlMatch[0]);
        break;
      }
    }
  }

  // 2. Fallback: find the first https URL whose surrounding context mentions RSVP/register/signup
  const urlPattern = /https?:\/\/[^\s<>"]+/gi;
  let match: RegExpExecArray | null;
  while ((match = urlPattern.exec(text)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(text.length, match.index + match[0].length + 30);
    const context = text.slice(start, end).toLowerCase();
    if (
      context.includes("rsvp") ||
      context.includes("register") ||
      context.includes("sign up") ||
      context.includes("signup")
    ) {
      return stripTrailingPunctuation(match[0]);
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
  const rsvpUrl = extractRsvpUrl(rawDescription);
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
