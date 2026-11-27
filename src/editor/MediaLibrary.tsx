import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { messageOf, request } from "./ManagementLogin";

type Asset = { _id: string; url: string; originalFilename?: string; width?: number; height?: number };

export async function uploadMedia(session: Session, file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 32 * 1024 * 1024)
    throw Error("Choose a JPG, PNG or WebP under 32 MB.");
  if (file.size > 768 * 1024) {
    const image = await createImageBitmap(file);
    try {
      const scale = Math.min(1, 1920 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw Error("This browser could not resize the image.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(value => value ? resolve(value) : reject(Error("Could not optimize the image.")), "image/webp", .84));
      file = new File([blob], file.name, { type: blob.type });
    } finally {
      image.close();
    }
  }
  if (file.size > 3 * 1024 * 1024) throw Error("This optimized image exceeds 3 MB.");
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(Error("Could not read image."));
    reader.readAsDataURL(file);
  });
  const result = await request(session, { action: "image", data, name: file.name });
  return result.url as string;
}

export default function MediaLibrary({ session, choose }: { session: Session; choose?: (url: string) => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => {
      request(session, { action: "media", search, offset }).then(({ assets: result }) => {
        if (!live) return;
        setAssets(previous => offset ? [...previous, ...result] : result);
        setHasMore(result.length === 48);
      }).catch(error => { if (live) setStatus(messageOf(error)); });
    }, 200);
    return () => { live = false; clearTimeout(timer); };
  }, [session, search, offset, revision]);

  async function upload(files: FileList) {
    setBusy(true);
    const uploaded: string[] = [];
    const errors: string[] = [];
    for (const file of Array.from(files).slice(0, 30)) {
      try { uploaded.push(await uploadMedia(session, file)); }
      catch (error) { errors.push(`${file.name}: ${messageOf(error)}`); }
      setStatus(`Uploaded ${uploaded.length} of ${Math.min(files.length, 30)} images.`);
    }
    setStatus(errors.length ? errors.join(" ") : `Uploaded ${uploaded.length} images.`);
    setOffset(0);
    setSearch("");
    setRevision(value => value + 1);
    setBusy(false);
    if (choose && uploaded.length === 1) choose(uploaded[0]);
  }

  return <div className="msa-media">
    <label>Search media<input type="search" value={search} onChange={event => { setOffset(0); setSearch(event.target.value); }} /></label>
    <label>Upload images<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy}
      onChange={event => { if (event.target.files?.length) void upload(event.target.files); event.target.value = ""; }}/></label>
    <div className="msa-media-grid">{assets.map(asset => <button key={asset._id} type="button" onClick={async () => {
      if (choose) choose(asset.url);
      else try {
        await navigator.clipboard.writeText(asset.url);
        setStatus("Image URL copied.");
      } catch { setStatus(asset.url); }
    }}>
      <img src={asset.url + "?w=180&fit=max&auto=format"} loading="lazy" alt="" width={90} height={70} />
      <span>{asset.originalFilename || "Image"}</span>
    </button>)}</div>
    {hasMore && <button type="button" onClick={() => setOffset(assets.length)}>Load more</button>}
    <p role="status">{status}</p>
  </div>;
}
