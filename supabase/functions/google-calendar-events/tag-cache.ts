// Supabase DB cache for AI-generated event classifications.
// Uses direct PostgREST REST calls — no JS SDK import needed in Deno.
// Returns empty results (not an error) when DB is unreachable, so the calendar always loads.

type AudienceTag = "brothers" | "sisters" | "joint" | "general";
type EventCategory =
  | "jumuah" | "dawah" | "sports" | "social" | "halaqa"
  | "signature" | "ramadan" | "career" | "service"
  | "meeting" | "fundraiser" | "other";

export type CachedClassification = {
  audience: AudienceTag;
  categories: EventCategory[];
  isSignature: boolean;
  confidence: number;
};

type CacheEntry = {
  id: string;
  updated: string;
};

// Row shape returned by PostgREST
type DbRow = {
  google_event_id: string;
  google_event_updated: string;
  audience: string;
  categories: string[];
  is_signature: boolean;
  confidence: number;
};

function getSupabaseConfig(): { url: string; serviceKey: string } | null {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    console.warn("[tag-cache] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — cache disabled");
    return null;
  }
  return { url, serviceKey };
}

function makeHeaders(serviceKey: string): Record<string, string> {
  return {
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

function rowToClassification(row: DbRow): CachedClassification {
  return {
    audience: row.audience as AudienceTag,
    categories: (row.categories ?? []) as EventCategory[],
    isSignature: row.is_signature,
    confidence: Number(row.confidence),
  };
}

/**
 * Batch-reads AI tag cache entries for the given (id, updated) pairs.
 * Returns a Map keyed by google_event_id → CachedClassification.
 * Only returns rows where both id AND updated match (stale entries are skipped).
 */
export async function getCachedTagsBatch(
  entries: CacheEntry[],
): Promise<Map<string, CachedClassification>> {
  const result = new Map<string, CachedClassification>();
  if (entries.length === 0) return result;

  const config = getSupabaseConfig();
  if (!config) return result;

  const ids = entries.map((e) => e.id);
  // PostgREST: filter by google_event_id in (list), fetch only needed columns
  const idList = ids.map((id) => encodeURIComponent(id)).join(",");
  const tableUrl = `${config.url}/rest/v1/calendar_event_ai_tags?google_event_id=in.(${idList})&select=google_event_id,google_event_updated,audience,categories,is_signature,confidence`;

  try {
    const response = await fetch(tableUrl, {
      headers: makeHeaders(config.serviceKey),
    });

    if (!response.ok) {
      console.warn(`[tag-cache] Cache read failed: HTTP ${response.status}`);
      return result;
    }

    const rows: DbRow[] = await response.json();
    // Build a lookup by id → updated so we can validate staleness
    const updatedByEntry = new Map(entries.map((e) => [e.id, e.updated]));

    for (const row of rows) {
      const expectedUpdated = updatedByEntry.get(row.google_event_id);
      if (expectedUpdated !== undefined && row.google_event_updated === expectedUpdated) {
        result.set(row.google_event_id, rowToClassification(row));
      }
      // Mismatched google_event_updated → event changed, skip stale cache row
    }
  } catch (err) {
    console.warn(`[tag-cache] Cache read error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}

/**
 * Writes (or updates) an AI classification result to the cache.
 * Uses upsert on the unique (google_event_id, google_event_updated) index.
 * Failures are logged and swallowed — the calendar must not break.
 */
export async function setCachedTags(
  id: string,
  updated: string,
  classification: CachedClassification,
  title: string,
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) return;

  const tableUrl = `${config.url}/rest/v1/calendar_event_ai_tags`;

  const payload = {
    google_event_id: id,
    google_event_updated: updated,
    title,
    audience: classification.audience,
    categories: classification.categories,
    is_signature: classification.isSignature,
    confidence: classification.confidence,
    tag_source: "ai",
    updated_at: new Date().toISOString(),
  };

  try {
    const response = await fetch(tableUrl, {
      method: "POST",
      headers: {
        ...makeHeaders(config.serviceKey),
        // PostgREST upsert: prefer=resolution=merge-duplicates on the unique index
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn(`[tag-cache] Cache write failed: HTTP ${response.status} — ${text}`);
    }
  } catch (err) {
    console.warn(`[tag-cache] Cache write error: ${err instanceof Error ? err.message : String(err)}`);
  }
}
