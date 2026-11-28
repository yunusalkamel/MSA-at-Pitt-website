import type { ClassifiedBlock } from "../google-calendar-events/google-calendar-service.ts";
import { classifyWithGemini } from "../google-calendar-events/classify-ai.ts";
import { getCachedTagsBatch, setCachedTags, type CachedClassification } from "../google-calendar-events/tag-cache.ts";
const MAX_GEMINI_CALLS_PER_INVOCATION = 8;
/**
 * For blocks that need AI, checks the DB cache first, then calls Gemini for uncached ones.
 * Mutates the classification field on each block in-place.
 * Never throws — any failure silently keeps the rules-based result.
 */
export async function applyAiClassification(
  candidates: ClassifiedBlock[],
): Promise<void> {
  if (candidates.length === 0) return;
  console.log(`[ai] ${candidates.length} events need classification`);

  // Build cache lookup entries using the ICS UID and LAST-MODIFIED fields
  const cacheEntries = candidates.map((c) => ({
    id: c.block.UID || c.block.DTSTART || "unknown",
    updated: c.block["LAST-MODIFIED"] || "",
  }));

  let cachedResults = new Map<string, CachedClassification>();
  try {
    cachedResults = await getCachedTagsBatch(cacheEntries);
  } catch {
    // Cache read failure is non-fatal
  }

  const uncachedCandidates = candidates.filter((c) => !cachedResults.has(c.block.UID || c.block.DTSTART || "unknown"));
  const uncachedCount = uncachedCandidates.length;
  const geminiCallCount = Math.min(uncachedCount, MAX_GEMINI_CALLS_PER_INVOCATION);
  console.log(`[ai] ${cachedResults.size} cache hits, ${uncachedCount} need Gemini (capped at ${geminiCallCount}, ~${Math.ceil(geminiCallCount * 2.2)}s)`);

  // Process each candidate sequentially to avoid Gemini rate limits (429).
  // Cache hits are instant; only uncached events call Gemini (capped per invocation).
  // Circuit breaker: first 429 stops all further Gemini calls for this invocation.
  let geminiCallsMade = 0;
  let rateLimitHit = false;
  for (const item of candidates) {
    const eventId = item.block.UID || item.block.DTSTART || "unknown";
    const eventUpdated = item.block["LAST-MODIFIED"] || "";

    // Cache hit — use stored AI result, no network call needed
    const cached = cachedResults.get(eventId);
    if (cached) {
      item.classification = {
        ...item.classification,
        audience: cached.audience,
        categories: cached.categories,
        isSignature: cached.isSignature,
        confidence: cached.confidence,
        tagSource: "ai",
      };
      item.needsAI = false;
      continue;
    }

    // No cache — skip if over cap or rate limit already hit this invocation
    if (geminiCallsMade >= MAX_GEMINI_CALLS_PER_INVOCATION || rateLimitHit) {
      item.classification = { ...item.classification, tagSource: "uncategorized" };
      item.needsAI = false;
      continue;
    }

    geminiCallsMade++;
    const title = item.block.SUMMARY || "";
    const description = item.block.DESCRIPTION || "";
    const location = item.block.LOCATION || "";
    const start = item.block.DTSTART || "";

    const aiResult = await classifyWithGemini({ title, description, location, start });

    if (aiResult === null && geminiCallsMade === 1) {
      // First call failed (likely 429) — trip the circuit breaker for this invocation
      rateLimitHit = true;
      console.warn("[ai] Gemini unavailable — skipping remaining calls for this invocation");
    }

    if (aiResult && aiResult.confidence >= 0.7) {
      try {
        await setCachedTags(eventId, eventUpdated, aiResult, title);
      } catch {
        // Cache write failure is non-fatal
      }
      item.classification = {
        ...item.classification,
        audience: aiResult.audience,
        categories: aiResult.categories,
        isSignature: aiResult.isSignature,
        confidence: aiResult.confidence,
        tagSource: "ai",
      };
    } else {
      item.classification = { ...item.classification, tagSource: "uncategorized" };
    }
    item.needsAI = false;

    if (!rateLimitHit) {
      // 2200ms between calls keeps us at ~27 RPM, safely under Gemini free tier (30 RPM).
      await new Promise((r) => setTimeout(r, 2200));
    }
  }
}
