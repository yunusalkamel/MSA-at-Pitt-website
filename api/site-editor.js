import { createClient } from "@sanity/client";
import { createClient as createAuth } from "@supabase/supabase-js";

const owner = "yunusaalkamel@gmail.com";
const documentId = "website-inline-content";
const maxImage = 3 * 1024 * 1024;
const validKey = (key) =>
  typeof key === "string" &&
  key.length > 0 &&
  key.length <= 1000 &&
  !["constructor", "__proto__", "prototype"].includes(key);
const validSize = (size) =>
  [undefined, "small", "normal", "large"].includes(size);
function validField(value, project, dataset) {
  if (!value || typeof value !== "object") return false;
  if (value.kind === "copies")
    return (
      Array.isArray(value.ids) &&
      value.ids.length <= 100 &&
      new Set(value.ids).size === value.ids.length &&
      value.ids.every((id) => /^[a-f0-9-]{36}$/.test(id))
    );
  if (value.kind === "image")
    return (
      typeof value.url === "string" &&
      value.url.startsWith(
        "https://cdn.sanity.io/images/" + project + "/" + dataset + "/",
      ) &&
      /^[a-zA-Z0-9.-]+$/.test(value.url.split("/").pop())
    );
  return (
    value.kind === "text" &&
    Array.isArray(value.runs) &&
    value.runs.length <= 2000 &&
    value.runs.every(
      (run) =>
        run &&
        typeof run.text === "string" &&
        validSize(run.size) &&
        [undefined, true, false].includes(run.bold) &&
        [undefined, true, false].includes(run.italic),
    )
  );
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const project = process.env.SANITY_PROJECT_ID || "rwdbbktc";
  const dataset = process.env.SANITY_EDITOR_DATASET || "production";
  const config = {
    projectId: project,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
  };
  try {
    if (req.method === "GET") {
      const doc = await createClient(config).getDocument(documentId);
      return res.json({
        revision: doc?._rev || null,
        fields: JSON.parse(doc?.fieldsJson || "{}"),
      });
    }
    if (req.method !== "POST") return res.status(405).end();
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return res.status(401).end();
    const auth = createAuth(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const {
      data: { user },
      error,
    } = await auth.auth.getUser(token);
    if (
      error ||
      !user?.email_confirmed_at ||
      user.email?.toLowerCase() !== owner
    )
      return res.status(403).end();
    if (req.body?.action === "session") return res.json({ authorized: true });
    
    if (!process.env.SANITY_EDITOR_TOKEN)
      return res.status(503).json({
        error: "SANITY_EDITOR_TOKEN is missing.",
      });

    if (process.env.VERCEL_ENV === "preview" && dataset === "production")
      return res.status(503).json({
        error: `Incorrect preview dataset: ${dataset}. Dataset variable ${
          process.env.SANITY_EDITOR_DATASET ? "is set" : "is missing"
        }.`,
      });
    
    const client = createClient({
      ...config,
      token: process.env.SANITY_EDITOR_TOKEN,
    });
    if (req.body?.action === "image") {
      const { data } = req.body;
      if (typeof data !== "string" || data.length > (maxImage * 4) / 3 + 4)
        return res.status(413).end();
      const bytes = Buffer.from(data, "base64");
      const mime = bytes
        .subarray(0, 8)
        .equals(Buffer.from("89504e470d0a1a0a", "hex"))
        ? "image/png"
        : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          ? "image/jpeg"
          : bytes.toString("ascii", 0, 4) === "RIFF" &&
              bytes.toString("ascii", 8, 12) === "WEBP"
            ? "image/webp"
            : null;
      if (!mime || bytes.length > maxImage)
        return res
          .status(400)
          .json({ error: "Choose a JPG, PNG or WebP under 3 MB." });
      const asset = await client.assets.upload("image", bytes, {
        contentType: mime,
      });
      return res.json({ url: asset.url });
    }
    const { action, revision, fields } = req.body || {};
    if (
      action !== "publish" ||
      !(revision === null || typeof revision === "string") ||
      !fields ||
      typeof fields !== "object" ||
      Array.isArray(fields) ||
      !Object.entries(fields).every(
        ([key, v]) => validKey(key) && validField(v, project, dataset),
      )
    )
      return res.status(400).end();
    const fieldsJson = JSON.stringify(fields);
    if (Buffer.byteLength(fieldsJson) > 2000000)
      return res
        .status(413)
        .json({ error: "Content is too large to publish." });
    const doc =
      revision === null
        ? await client.create({
            _id: documentId,
            _type: "websiteInlineContent",
            fieldsJson,
          })
        : await client
            .patch(documentId)
            .ifRevisionId(revision)
            .set({ fieldsJson })
            .commit();
    return res.json({ revision: doc._rev });
  } catch (error) {
    const conflict =
      error.statusCode === 409 || error.response?.statusCode === 409;
    return res
      .status(conflict ? 409 : 502)
      .json({
        error: conflict
          ? "Content changed in another tab. Reload before publishing."
          : "The content service is unavailable. Please try again.",
      });
  }
}
