import { handleCalendar } from "./index.ts";
import { apiEventBlock, classifyCalendarText, normalizeBlocks } from "./google-calendar-service.ts";
function assert(value: unknown, message: string) { if (!value) throw Error(message); }
Deno.test("visitor endpoint reads only saved payload, retaining events after source failure", async () => {
  Deno.env.set("SUPABASE_URL","https://hvoiytjyimcyvpamsbay.supabase.co");
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY","test");
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = ((input: string | URL | Request) => {
    assert(String(input).includes("/rest/v1/calendar_cache?"),"Visitor contacted an upstream calendar");
    calls++;
    return Promise.resolve(Response.json([{payload:{stage:"success",count:1,events:[{id:"kept",startDate:"2024-01-01"}]},fetched_at:"2024-01-01T00:00:00Z",last_error:"HTTP 429"}]));
  }) as typeof fetch;
  try {
    const response = await handleCalendar(new Request("https://example.org"));
    const result = await response.json();
    assert(response.status === 200 && result.events[0].id === "kept" && result.events[0].isPast && result.stale,"Saved events lost");
    assert(calls === 1 && response.headers.get("Cache-Control")?.includes("max-age=60"),"Expected one cached read");
  } finally { globalThis.fetch = original; }
});
Deno.test("empty cache never fetches Google on a visitor request", async () => {
  const original = globalThis.fetch;
  let calls=0;
  globalThis.fetch = (() => {calls++;return Promise.resolve(Response.json([]));}) as typeof fetch;
  try { const response=await handleCalendar(new Request("https://example.org")); assert(response.status===503 && calls===1,"Empty cache triggered an upstream request"); }
  finally {globalThis.fetch=original;}
});
Deno.test("Google API timestamps and all-day events retain calendar semantics", () => {
  const timed=apiEventBlock({id:"timed",summary:"Halaqa",start:{dateTime:"2026-11-28T19:00:00-05:00"},end:{dateTime:"2026-11-28T20:00:00-05:00"}});
  assert(timed?.DTSTART === "20261129T000000Z","Lost timezone");
  const allDay=apiEventBlock({id:"day",summary:"Retreat",start:{date:"2026-11-28"},end:{date:"2026-11-29"}});
  assert(allDay?.DTSTART === "20261128","Lost all-day date");
  const events=normalizeBlocks(classifyCalendarText("BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:real\nDTSTART:20261128T190000Z\nSUMMARY:Community Halaqa\nEND:VEVENT\nEND:VCALENDAR"));
  assert(events.length===1 && events[0].title === "Community Halaqa","ICS fallback failed");
});
