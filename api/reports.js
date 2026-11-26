import { management } from "../server/management.js";
import { analyticsSettings } from "../server/analytics-settings.js";
import { report } from "../server/reports.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") return res.status(405).end();
  try {
    const authorize = await management(req);
    await authorize("owner_session");
    const body = req.body || {};
    if (body.action === "settings")
      return res.json(await analyticsSettings(body.enabled));
    return res.json(await report(body));
  } catch (e) {
    return res
      .status(e.publicStatus || 503)
      .json({
        error: e.publicStatus
          ? e.message
          : "Reporting service unavailable. Check configuration and retry.",
      });
  }
}
