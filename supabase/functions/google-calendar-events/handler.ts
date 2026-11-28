import { cors, database, respond } from "../_shared/calendar-store.ts";

export async function handleCalendar(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok",{headers:cors});
  if (req.method !== "GET") return respond({error:"Method not allowed."},405);
  try {
    const [row] = await database("calendar_cache?id=eq.main&select=payload,fetched_at,last_error,next_attempt_at");
    if (!row?.payload) return respond({stage:"cache_empty",error:"The calendar is preparing its first update."},503,{"Cache-Control":"no-store","Retry-After":"60"});
    const today = new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    const events = row.payload.events.map((event: {startDate:string}) => ({...event,isPast:event.startDate < today}));
    return respond({...row.payload,events,fetchedAt:row.fetched_at,stale:!!row.last_error || Date.now()-Date.parse(row.fetched_at)>30*60000},200,{
      "Cache-Control":"public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    });
  } catch {
    return respond({stage:"cache_read",error:"The saved calendar is temporarily unavailable."},503,{"Cache-Control":"no-store"});
  }
}
