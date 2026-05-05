// Deterministic keyword-based classifier. No network calls, always fast.
// Used when no explicit hashtags are found in the event description.

type AudienceTag = "brothers" | "sisters" | "joint" | "general";
type EventCategory =
  | "jumuah" | "dawah" | "sports" | "social" | "halaqa"
  | "signature" | "ramadan" | "career" | "service"
  | "meeting" | "fundraiser" | "other";

export type RulesClassification = {
  audience: AudienceTag;
  categories: EventCategory[];
  isSignature: boolean;
  confidence: number;
};

// Each entry is a list of keywords; any match triggers that category.
// Keywords are matched against the combined lowercase title + description + location blob.
const CATEGORY_KEYWORDS: Array<{ category: EventCategory; keywords: string[]; signature?: true }> = [
  {
    category: "jumuah",
    keywords: ["jumuah", "jummah", "jumua", "friday prayer", "khutbah"],
  },
  {
    category: "sports",
    keywords: ["basketball", "soccer", "football", "volleyball", "sports", "tournament", "fitness", "gym"],
  },
  {
    category: "halaqa",
    keywords: ["halaqa", "quran", "seerah", "tafsir", "hadith", "ilm", "class", "lesson", "study circle"],
  },
  {
    category: "dawah",
    keywords: ["dawah", "da'wah", "tabling", "outreach"],
  },
  {
    // Public, high-profile events only
    category: "signature",
    signature: true,
    keywords: ["banquet", "gala", "fast-a-thon", "fastathon", "keynote", "iftar dinner", "annual dinner"],
  },
  {
    category: "ramadan",
    keywords: ["ramadan", "iftar", "suhoor", "taraweeh", "qiyam", "laylatul qadr"],
  },
  {
    category: "career",
    keywords: ["career", "resume", "internship", "professional", "networking", "job fair", "interview"],
  },
  {
    category: "service",
    keywords: ["volunteer", "service", "charity", "cleanup", "food drive", "community service"],
  },
  {
    category: "fundraiser",
    keywords: ["fundraiser", "donation", "fundraising", "zakat", "sadaqah campaign"],
  },
  {
    category: "social",
    keywords: ["social", "game night", "bonfire", "potluck", "dinner", "hangout", "picnic", "movie night", "bowling"],
  },
  {
    // Public-facing meetings only — NOT internal board/exec/officer/committee meetings
    category: "meeting",
    keywords: ["gbm", "general body meeting", "general body", "town hall", "open forum", "info session", "orientation"],
  },
];

const BROTHERS_KEYWORDS = ["brothers", "brotherhood", " men ", "boys"];
const SISTERS_KEYWORDS = ["sisters", "sisterhood", " women ", "girls"];
const JOINT_KEYWORDS = ["joint", "everyone", "community", "all welcome", "open to all"];

function inferAudience(blob: string): AudienceTag {
  if (BROTHERS_KEYWORDS.some((kw) => blob.includes(kw))) return "brothers";
  if (SISTERS_KEYWORDS.some((kw) => blob.includes(kw))) return "sisters";
  if (JOINT_KEYWORDS.some((kw) => blob.includes(kw))) return "joint";
  return "general";
}

export function classifyByRules(
  title: string,
  description: string,
  location: string,
): RulesClassification {
  const blob = ` ${title} ${description} ${location} `.toLowerCase();

  const audience = inferAudience(blob);
  const matchedCategories: EventCategory[] = [];
  let isSignature = false;

  for (const { category, keywords, signature } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => blob.includes(kw))) {
      matchedCategories.push(category);
      if (signature) isSignature = true;
    }
  }

  const categories: EventCategory[] = matchedCategories.length > 0
    ? matchedCategories
    : ["other"];

  // Confidence: higher when we matched something meaningful
  let confidence = matchedCategories.length > 0 ? 0.8 : 0.4;
  // Small boost when audience is specific (non-general)
  if (audience !== "general") confidence = Math.min(1.0, confidence + 0.05);

  return { audience, categories, isSignature, confidence };
}
