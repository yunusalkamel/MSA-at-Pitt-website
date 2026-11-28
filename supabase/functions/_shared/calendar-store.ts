export const PROJECT = "hvoiytjyimcyvpamsbay";
export function config() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (url !== `https://${PROJECT}.supabase.co` || !key) throw Error("Calendar project configuration mismatch.");
  return {url,key};
}
export async function database(path: string, init: RequestInit = {}) {
  const {url,key} = config();
  const response = await fetch(url + "/rest/v1/" + path, {
    ...init, headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",...init.headers},
    signal:AbortSignal.timeout(12000),
  });
  if (!response.ok) throw Error(`Calendar storage unavailable (${response.status}).`);
  return response.status === 204 ? null : response.json();
}
export const cors = {
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
};
export const respond = (value: unknown, status = 200, headers = {}) => new Response(JSON.stringify(value),{
  status,headers:{...cors,"Content-Type":"application/json",...headers},
});
