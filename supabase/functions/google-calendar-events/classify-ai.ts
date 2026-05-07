// Gemini AI classifier — optional fallback only. Returns null on any failure.
// The calendar works perfectly when this returns null; callers must handle that.

type AudienceTag = "brothers" | "sisters" | "general";
type EventCategory =
  | "jumuah" | "dawah" | "sports" | "social" | "halaqa"
  | "signature" | "ramadan" | "career" | "service"
  | "meeting" | "fundraiser" | "cec" | "other";

export type AiClassification = {
  audience: AudienceTag;
  categories: EventCategory[];
  isSignature: boolean;
  confidence: number;
};

export type GeminiInput = {
  title: string;
  description: string;
  location: string;
  start: string;
};

const VALID_AUDIENCES = new Set<string>(["brothers", "sisters", "general"]);
const VALID_CATEGORIES = new Set<string>([
  "jumuah", "dawah", "sports", "social", "halaqa",
  "signature", "ramadan", "career", "service",
  "meeting", "fundraiser", "cec", "other",
]);

const SYSTEM_PROMPT = `You are a classifier for a Muslim Students Association (MSA) event calendar.
Given an event's title, description, location, and start time, classify it.

Respond with ONLY valid JSON in exactly this shape:
{
  "audience": "brothers" | "sisters" | "general",
  "categories": Array of one or more: "jumuah" | "dawah" | "sports" | "social" | "halaqa" | "signature" | "ramadan" | "career" | "service" | "meeting" | "fundraiser" | "cec" | "other",
  "isSignature": boolean,
  "confidence": number between 0.0 and 1.0
}

IMPORTANT: Every event MUST have an audience value. Never omit it.

Definitions:
- audience: "brothers" = men only event, "sisters" = women only event, "general" = open to everyone / mixed / unclear (use this for all joint or general events)
- jumuah: Friday congregational prayer
- halaqa: Islamic study circle, Quran/hadith discussion
- dawah: outreach, tabling, spreading awareness
- sports: any athletic or recreational sport (default audience to "brothers" unless explicitly mixed/sisters)
- social: casual gatherings, dinners, game nights, hangouts, eid celebrations, potlucks
- signature: major annual or high-profile event (gala, banquet, fast-a-thon, major eid dinner)
- ramadan: iftar, taraweeh, suhoor, or other Ramadan-specific events
- career: professional development, resume workshops, networking
- service: volunteering, community service, charity, food pantry, food bank, ICP, clothing drives
- meeting: PUBLIC general body or community meetings only (NOT internal officer/exec meetings)
- fundraiser: donation drives, fundraising events, bake sales
- cec: Community Engagement Center events — outreach to youth, other mosques/masjids, homeless outreach, after-school/mentorship programs, interfaith, downtown community programs
- other: does not clearly fit any category above
- isSignature: true ONLY for major annual events like gala, banquet, fast-a-thon, or large-scale eid dinner. Social events, sports, takeovers, and regular halaqas are NEVER isSignature.
- confidence: your confidence in this classification (0.0 = unsure, 1.0 = certain)

Use "other" only when the event truly does not fit any category. Most events fit at least one category.
Always pick the most specific category — do not default to "other" if a better match exists.`;

function validateAiResponse(raw: unknown): AiClassification | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  if (!VALID_AUDIENCES.has(obj.audience as string)) return null;
  if (!Array.isArray(obj.categories) || obj.categories.length === 0) return null;
  if (obj.categories.some((c) => !VALID_CATEGORIES.has(c as string))) return null;
  if (typeof obj.isSignature !== "boolean") return null;
  if (typeof obj.confidence !== "number") return null;

  return {
    audience: obj.audience as AudienceTag,
    categories: obj.categories as EventCategory[],
    isSignature: obj.isSignature,
    confidence: Math.max(0, Math.min(1, obj.confidence)),
  };
}

export async function classifyWithGemini(
  input: GeminiInput,
): Promise<AiClassification | null> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.warn("[classify-ai] GEMINI_API_KEY not set — skipping AI classification");
    return null;
  }

  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.0-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const userContent = [
    `Title: ${input.title}`,
    `Description: ${input.description || "(none)"}`,
    `Location: ${input.location || "(none)"}`,
    `Start: ${input.start}`,
  ].join("\n");

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          audience: { type: "STRING", enum: ["brothers", "sisters", "general"] },
          categories: { type: "ARRAY", items: { type: "STRING" } },
          isSignature: { type: "BOOLEAN" },
          confidence: { type: "NUMBER" },
        },
        required: ["audience", "categories", "isSignature", "confidence"],
      },
      temperature: 0.1,
      maxOutputTokens: 256,
    },
  };

  const TIMEOUT_MS = 15000;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
    console.warn("[classify-ai] Gemini request timed out after 15s");
  }, TIMEOUT_MS);

  try {
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    // Single retry on 429 — short wait so we don't stall the whole invocation.
    // The 8-call cap + 2.2s inter-call delay keeps us well under rate limits normally.
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "4");
      const waitMs = Math.min(retryAfter * 1000, 5000);
      console.warn(`[classify-ai] Gemini 429 — retrying after ${waitMs}ms`);
      await new Promise((r) => setTimeout(r, waitMs));
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    }

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[classify-ai] Gemini returned HTTP ${response.status}`);
      return null;
    }

    const json = await response.json();
    const candidate = json?.candidates?.[0]?.content?.parts?.[0];

    if (!candidate) {
      console.warn("[classify-ai] Gemini returned no candidate content");
      return null;
    }

    // With responseMimeType=application/json, text contains a JSON string.
    const rawText: string | undefined = candidate.text;
    if (!rawText) {
      console.warn("[classify-ai] Gemini returned no text in response");
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = rawText;
      console.warn("[classify-ai] Gemini response was not valid JSON, attempting direct use");
    }

    const validated = validateAiResponse(parsed);
    if (!validated) {
      console.warn("[classify-ai] Gemini response failed schema validation");
      return null;
    }

    return validated;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      // Timeout already logged above
      return null;
    }
    console.warn(`[classify-ai] Gemini request failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
