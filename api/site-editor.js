import { changes, open, seal, versions } from "../server/versions.js";
import { validEditorLink } from "../shared/editor-links.js";
import { createClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { visualFields, editorKeys, designProfiles } from "../shared/visual-schema.js";
import { management, environment, fail } from "../server/management.js";

const documentId = "website-inline-content";
const maxImage = 3 * 1024 * 1024;
const validKey = (key) =>
  typeof key === "string" &&
  key.length > 0 &&
  key.length <= 1000 &&
  !["constructor", "__proto__", "prototype"].includes(key);
const validSize = (size) =>
  [undefined, "small", "normal", "large"].includes(size);
function validField(value, project, dataset, key) {
  if (!value || typeof value !== "object") return false;
  if (Object.hasOwn(visualFields, value.kind)) {
    if (value.kind === "design" && key !== editorKeys.design) return false;
    if (value.kind === "page" && (!key.startsWith(editorKeys.page) ||
      (value.path ? key !== editorKeys.page + value.id || key.slice(editorKeys.page.length).startsWith("/") : !key.slice(editorKeys.page.length).startsWith("/")))) return false;
    if (value.kind === "menus" && key !== editorKeys.menus) return false;
    if (value.kind === "collection" && key !== editorKeys.collection + value.type) return false;
    return visualFields[value.kind].safeParse(value).success;
  }
  if (value.kind === "alt") return typeof value.text==="string" && value.text.length<=1000;
  if (value.kind === "visibility") return typeof value.hidden === "boolean";
  if (value.kind === "copies")
    return (
      Array.isArray(value.ids) &&
      value.ids.length <= 100 &&
      new Set(value.ids).size === value.ids.length &&
      value.ids.every((id) => /^[a-f0-9-]{36}$/.test(id))
    );
  if (value.kind === "link") return validEditorLink(value.url);
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
        [undefined, true, false].includes(run.underline) &&
        [undefined, true, false].includes(run.bold) &&
        [undefined, true, false].includes(run.italic),
    )
  );
}
function validFields(fields, project, dataset) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields) || !Object.entries(fields).every(
    ([key, value]) => validKey(key) && validField(value, project, dataset, key),
  )) return false;
  const paths = Object.values(fields).filter(value => value.kind === "page" && value.path).map(value => value.path);
  return paths.length === new Set(paths).size &&
    paths.every(path => !/^\/(?:about|events|gallery|join|contact|resources|board|admin|owner|auth|api|assets|photos|prayer-times)$/.test(path));
}

function publicFields(fields) {
  const now = Date.now();
  const live = entry => (!entry.starts || Date.parse(entry.starts) <= now) &&
    (!entry.ends || Date.parse(entry.ends) > now);
  const privatePaths = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value.kind === "page" && value.path && (value.visibility !== "published" || !live(value))) {
      privatePaths.push(value.path + "/");
      delete fields[key];
    }
    if (value.kind === "page") value.blocks = value.blocks.filter(block => !block.hidden && live(block));
    if (value.kind === "collection")
      value.items = value.items.filter(item => !item.hidden && live(item));
  }
  for (const key of Object.keys(fields)) {
    if (privatePaths.some(path => key.startsWith(path))) delete fields[key];
  }
  return fields;
}

async function designAction(client, body, access, dataset) {
  const id = "msaPrivate.designProfiles";
  const live = await client.getDocument(documentId);
  const revision = live?._rev ?? null;
  const fields = JSON.parse(live?.fieldsJson || "{}");
  if (body.action === "design_publish") {
    if (!visualFields.design.safeParse(body.design).success) throw fail(400, "Choose valid design options.");
    fields[editorKeys.design] = body.design;
    return versions(client, {action:"publish", revision:body.revision, fields}, access.actor, dataset, access.role);
  }
  const doc = await client.getDocument(id);
  const profileRevision = doc?._rev ?? null;
  if (body.action === "design_load") {
    return { revision, profileRevision, fields, profiles:doc?.payload ? open(doc.payload) : [] };
  }
  if (!designProfiles.safeParse(body.profiles).success) throw fail(400, "Choose unique valid preset names and options.");
  if (profileRevision !== body.profileRevision) throw fail(409, "Saved presets changed in another tab. Reload Design.");
  const payload = seal(body.profiles);
  const updated = doc ? await client.patch(id).ifRevisionId(profileRevision).set({payload}).commit()
    : await client.create({_id:id,_type:"msaDesignProfiles",payload});
  return {profileRevision:updated._rev};
}

async function draftAction(client, body, actor) {
  const id = "msaPrivate.editorDraft." + createHash("sha256").update(actor.toLowerCase()).digest("hex");
  const [current, draft] = await Promise.all([client.getDocument(documentId), client.getDocument(id)]);
  const revision = current?._rev ?? null;
  const fields = JSON.parse(current?.fieldsJson || "{}");
  if (body.action === "draft_load") {
    const saved = draft?.payload ? open(draft.payload) : null;
    return { revision, fields, saved: saved?.revision === revision ? saved.delta : null,
      stale: saved && saved.revision !== revision ? saved.delta : null, draftVersion: draft?._rev ?? null };
  }
  if ((draft?._rev ?? null) !== body.draftVersion)
    throw fail(409, "The saved draft changed in another tab. Reload before replacing it.");
  if (body.action !== "draft_save" && body.action !== "draft_clear") throw fail(400, "Invalid draft operation.");
  if (body.action === "draft_save" && revision !== body.revision)
    throw fail(409, "A new version was published. Reload to review your draft against it.");
  const delta = body.action === "draft_save"
    ? Object.fromEntries(changes(fields, body.fields).map(key => [key, body.fields[key] ?? null]))
    : null;
  const payload = delta && Object.keys(delta).length ? seal({ revision, delta }) : null;
  if (!draft && !payload) return { draftVersion: null };
  const updated = draft
    ? await client.patch(id).ifRevisionId(draft._rev).set({ payload }).commit()
    : await client.create({ _id: id, _type: "msaEditorDraft", payload });
  return { draftVersion: updated._rev };
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
      environment();
      const doc = await createClient(config).getDocument(documentId);
      const fields = publicFields(JSON.parse(doc?.fieldsJson || "{}"));
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
      return res.json({
        revision: doc?._rev || null,
        fields,
      });
    }
    if (req.method !== "POST") return res.status(405).end();
    const actionName = req.body?.action;
    if (
      ![
        "publish",
        "image",
        "session",
        "history",
        "version",
        "restore",
        "snapshot",
        "export",
        "draft_load",
        "draft_save",
        "draft_clear",
        "media",
        "design_load",
        "design_save",
        "design_publish",
      ].includes(actionName)
    )
      return res.status(400).end();
    const authorize = await management(req);
    const access = await authorize(
      {
        history: "session",
        version: "session",
        restore: "publish",
        snapshot: "owner_session",
        export: "owner_session",
        draft_load: "session",
        draft_save: "session",
        draft_clear: "session",
        media: "session",
        design_load: "owner_session",
        design_save: "owner_session",
        design_publish: "owner_session",
      }[actionName] || actionName,
    );
    if (actionName === "session")
      return res.json({ authorized: true, role: access.role });

    if (!process.env.SANITY_EDITOR_TOKEN)
      return res.status(503).json({
        error: "SANITY_EDITOR_TOKEN is missing.",
      });

    const client = createClient({
      ...config,
      token: process.env.SANITY_EDITOR_TOKEN,
    });
    if (actionName.startsWith("design_")) {
      if (access.role !== "owner") throw fail(403, "Only owners can manage site design.");
      if (actionName === "design_publish") await authorize("publish");
      const result = await designAction(client, req.body, access, dataset);
      if (actionName === "design_publish" && !result.unchanged) {
        try { await authorize("published", {revision:"design:" + result.id}); }
        catch { result.warning = "Design published. The activity feed could not be updated."; }
      }
      return res.json(result);
    }
    if (actionName.startsWith("draft_")) {
      if (actionName === "draft_save" && (!validFields(req.body.fields, project, dataset) ||
        Buffer.byteLength(JSON.stringify(req.body.fields)) > 2000000))
        throw fail(400, "The draft contains invalid fields or exceeds the size limit.");
      return res.json(await draftAction(client, req.body, access.actor));
    }
    if (actionName === "media") {
      const term = typeof req.body.search === "string" ? req.body.search.trim().slice(0, 100) : "";
      const start = Math.max(0, Math.min(10000, Math.floor(Number(req.body.offset) || 0)));
      const assets = await client.fetch(
        '*[_type=="sanity.imageAsset" && ($term=="" || originalFilename match $match)] | order(_createdAt desc,_id desc) [$start...$end]{_id,url,originalFilename,"width":metadata.dimensions.width,"height":metadata.dimensions.height}',
        {term, match: term.replace(/[^a-zA-Z0-9._ -]/g, "") + "*", start, end: start + 48},
      );
      return res.json({ assets });
    }
    if (["history", "version", "snapshot", "export"].includes(actionName))
      return res.json(await versions(client, req.body, access.actor, dataset, access.role));
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
        filename: typeof req.body.name === "string" ? req.body.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 135) : undefined,
      });
      return res.json({ url: asset.url });
    }
    const { action, revision, fields } = req.body || {};
    if (
      action !== "restore" &&
      (action !== "publish" ||
        !(revision === null || typeof revision === "string") ||
        !validFields(fields, project, dataset))
    )
      return res.status(400).end();
    const result = await versions(client, req.body, access.actor, dataset, access.role);
    if (!result.unchanged) {
      try {
        await authorize("published", { revision: action + ":" + result.id });
      } catch {
        result.warning =
          "Saved with version history. The separate activity feed could not be updated.";
      }
    }
    return res.json(result);
  } catch (error) {
    if (error.publicStatus)
      return res.status(error.publicStatus).json({ error: error.message });
    if ([401, 403].includes(error.statusCode))
      return res
        .status(502)
        .json({
          error:
            "Sanity denied this operation. Check the publishing token and dataset permissions.",
        });
    const conflict =
      error.statusCode === 409 || error.response?.statusCode === 409;
    return res.status(conflict ? 409 : 502).json({
      error: conflict
        ? "Content changed in another tab. Reload before publishing."
        : "The content service is unavailable. Please try again.",
    });
  }
}
