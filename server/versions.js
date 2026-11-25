import {
  randomUUID,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { fail } from "./management.js";

const liveId = "website-inline-content";
const prefix = "msaPrivate.version.";
const versionType = "msaEditorVersion";
const readFields = (doc) => JSON.parse(doc?.fieldsJson || "{}");
const pageOf = (key) =>
  key.startsWith("shared/")
    ? "shared"
    : key
        .split("/")
        .slice(
          0,
          key.startsWith("//")
            ? 1
            : key.startsWith("/resources/") || key.startsWith("/gallery/")
              ? 3
              : 2,
        )
        .join("/") || "/";
const keyBytes = () =>
  createHash("sha256")
    .update("msa-editor-history/v1/" + process.env.MSA_MANAGEMENT_KEY)
    .digest();
function seal(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(), iv);
  const body = Buffer.concat([
    cipher.update(gzipSync(Buffer.from(JSON.stringify(value)))),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}
function open(value) {
  const bytes = Buffer.from(value, "base64");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    keyBytes(),
    bytes.subarray(0, 12),
  );
  cipher.setAuthTag(bytes.subarray(12, 28));
  return JSON.parse(
    gunzipSync(
      Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]),
    ).toString(),
  );
}
export function changes(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]),
  );
}
async function version(client, id) {
  if (!/^[a-f\d-]{36}$/.test(id)) throw fail(400, "Choose a valid version.");
  const [meta, before, after] = await client.getDocuments([
    prefix + id,
    prefix + id + ".before",
    prefix + id + ".after",
  ]);
  if (!meta || !before || !after)
    throw fail(404, "Version unavailable in this dataset.");
  return {
    id,
    ...open(meta.details),
    before: open(before.payload),
    after: open(after.payload),
  };
}
export async function versions(client, body, actor, dataset) {
  const { action } = body;
  if (action === "history") {
    const offset = Number(body.offset || 0);
    if (!Number.isSafeInteger(offset) || offset < 0)
      throw fail(400, "Invalid history position.");
    const rows = await client.fetch(
      "*[_type==$type] | order(_createdAt desc,_id desc) [$start...$end]{_id,details}",
      { type: versionType, start: offset, end: offset + 40 },
    );
    return {
      dataset,
      rows: rows.map((r) => ({
        id: r._id.slice(prefix.length),
        ...open(r.details),
      })),
    };
  }
  if (action === "version") return version(client, body.id);
  const live = await client.getDocument(liveId);
  const before = readFields(live);
  if (action === "export")
    return {
      dataset,
      revision: live?._rev ?? null,
      exportedAt: new Date().toISOString(),
      fields: before,
      documents: await client.fetch(
        '*[_type in $types && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]',
        {
          types: [
            "homePage",
            "aboutPage",
            "resourcesPage",
            "newToPittPage",
            "prayerLocationsPage",
            "joinPage",
            "announcement",
            "faqItem",
            "leadership",
            "galleryAlbum",
            "sanity.imageAsset",
          ],
        },
      ),
    };
  const snapshot = action === "snapshot";
  if (!snapshot && (live?._rev ?? null) !== body.revision)
    throw fail(409, "Content changed. Reload before publishing or restoring.");
  let after = body.fields,
    source = null;
  if (action === "restore") {
    const previous = await version(client, body.id);
    const fields = body.side === "before" ? previous.before : previous.after;
    source = body.id;
    if (body.field || body.page) {
      after = { ...before };
      for (const key of changes(before, fields)) {
        if (body.field ? key !== body.field : pageOf(key) !== body.page)
          continue;
        if (Object.hasOwn(fields, key)) after[key] = fields[key];
        else delete after[key];
      }
    } else after = fields;
  }
  if (snapshot) after = before;
  const keys = changes(before, after);
  if (!snapshot && !keys.length)
    return { revision: live?._rev ?? null, unchanged: true };
  if (Buffer.byteLength(JSON.stringify(after)) > 2000000)
    throw fail(413, "Restored content exceeds the editor size limit.");
  const id = randomUUID(),
    base = prefix + id;
  const details = {
    actor,
    date: new Date().toISOString(),
    action,
    source,
    pages: [...new Set(keys.map(pageOf))],
    count: keys.length,
  };
  const tx = client
    .transaction()
    .create({ _id: base, _type: versionType, details: seal(details) });
  for (const [suffix, fields] of [
    ["before", before],
    ["after", after],
  ])
    tx.create({
      _id: base + "." + suffix,
      _type: "msaEditorState",
      payload: seal(fields),
    });
  if (!snapshot) {
    const fieldsJson = JSON.stringify(after);
    if (live)
      tx.patch(liveId, (p) =>
        p.ifRevisionId(body.revision).set({ fieldsJson }),
      );
    else tx.create({ _id: liveId, _type: "websiteInlineContent", fieldsJson });
  }
  const result = await tx.commit({ returnDocuments: true, returnFirst: false });
  return {
    id,
    dataset,
    revision: snapshot
      ? (live?._rev ?? null)
      : result.find((d) => d._id === liveId)._rev,
  };
}
