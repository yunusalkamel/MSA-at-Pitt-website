export function fetchPublicFunction(name: "google-calendar-events" | "instagram-stats") {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("The Supabase URL or publishable key is missing.");
  return fetch(`${url.replace(/\/$/, "")}/functions/v1/${name}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    credentials: "omit",
  });
}
