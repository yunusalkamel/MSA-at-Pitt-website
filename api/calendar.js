import { management } from "../server/management.js";
export default async function handler(req,res) {
  res.setHeader("Cache-Control","private, no-store");
  if (req.method !== "POST") return res.status(405).end();
  try {
    const authorize=await management(req);
    const access=await authorize("session");
    if (access.environment !== "production") return res.status(403).json({error:"Calendar refresh is available on the production website."});
    const response=await fetch("https://hvoiytjyimcyvpamsbay.supabase.co/functions/v1/sync-calendar",{
      method:"POST",headers:{Authorization:req.headers.authorization,"Content-Type":"application/json"},
      body:JSON.stringify({managementKey:process.env.MSA_MANAGEMENT_KEY}),signal:AbortSignal.timeout(110000),
    });
    return res.status(response.status).json(await response.json());
  } catch(error) {
    return res.status(error.publicStatus || 503).json({error:error.publicStatus ? error.message : "Calendar refresh could not finish. The saved calendar remains available."});
  }
}
