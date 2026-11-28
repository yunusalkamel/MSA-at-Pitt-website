import { fetchAndClassifyBlocks, normalizeBlocks } from "../google-calendar-events/google-calendar-service.ts";
import { applyAiClassification } from "./classification.ts";
import { config, database, respond } from "../_shared/calendar-store.ts";

async function authorize(req: Request) {
  const secret = Deno.env.get("CALENDAR_SYNC_SECRET");
  if (secret && req.headers.get("x-calendar-sync") === secret) return false;
  const token = req.headers.get("authorization");
  if (!token?.startsWith("Bearer ")) throw Error("Unauthorized");
  const body = await req.json().catch(()=>({}));
  if (typeof body.managementKey !== "string" || body.managementKey.length>256) throw Error("Unauthorized");
  const {url,key} = config();
  const r = await fetch(url+"/rest/v1/rpc/msa_management",{
    method:"POST",headers:{apikey:key,Authorization:token,"Content-Type":"application/json"},
    body:JSON.stringify({env_key:body.managementKey,operation:"session",payload:{expected_environment:"production"}}),
    signal:AbortSignal.timeout(8000),
  });
  const access = await r.json();
  if (!r.ok || access.error || access.environment!=="production" || !["owner","administrator"].includes(access.role)) throw Error("Unauthorized");
  return true;
}
export async function handleSync(req: Request) {
  if (req.method !== "POST") return respond({error:"Method not allowed."},405);
  let manual: boolean;
  try { manual=await authorize(req); } catch { return respond({error:"Sign in as an authorized administrator."},403); }
  let lease: string | undefined;
  try {
    const [row] = await database("rpc/claim_calendar_sync",{method:"POST",body:JSON.stringify({manual})});
    if (!row) {
      const [state] = await database("calendar_cache?id=eq.main&select=fetched_at,last_error,next_attempt_at,lease_until");
      return respond({synced:false,...state,message:state?.last_error ? "The last saved calendar is available. The source is cooling down before retrying." : "A calendar refresh is already running or was just completed."});
    }
    lease=row.lease_token;
    const blocks = await fetchAndClassifyBlocks();
    await applyAiClassification(blocks.filter(item=>item.needsAI));
    const events=normalizeBlocks(blocks);
    const payload={stage:"success",implementation:"scheduled_cache_v1",source:Deno.env.get("GOOGLE_CALENDAR_API_KEY") ? "google_api" : "public_ics",count:events.length,events};
    const stored=await database("rpc/complete_calendar_sync",{method:"POST",body:JSON.stringify({token:lease,result:payload})});
    if (!stored) throw Error("The sync lease expired before publication.");
    return respond({synced:true,count:events.length,fetchedAt:new Date().toISOString()});
  } catch(error) {
    const message=error instanceof Error ? error.message : "Calendar synchronization failed.";
    if (lease) await database("rpc/complete_calendar_sync",{method:"POST",body:JSON.stringify({token:lease,failure:message})}).catch(()=>{});
    console.warn("[sync-calendar]",message);
    return respond({synced:false,error:message},502,{"Cache-Control":"no-store"});
  }
}
