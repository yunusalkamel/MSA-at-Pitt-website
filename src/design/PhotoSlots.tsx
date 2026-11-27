import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { Content, Picture, useField } from "@/editor/content";

type Photo = readonly [file: string, description: string, originalWidth?: number];
const sets: Record<string, readonly Photo[]> = {
  "WPU Reflection Room": [
    ["wpu-entrance", "Entrance to the William Pitt Union reflection room", 462],
    ["wpu-dividers", "Movable dividers inside the reflection room", 720],
    ["wpu-gathering", "Students listening to a talk in the reflection room"],
    ["wpu-students", "Students seated along the windows"],
  ],
  "Jummah prayer": [
    ["jummah-ballroom", "Students gathered for the Friday khutbah"],
    ["jummah-community", "Students seated on prayer mats at Jummah"],
  ],
  "Rec Center Reflection Room": [
    ["rec-entrance", "Reflection room entrance and shoe-free sign"],
    ["rec-room", "Inside the reflection room, facing the shoe shelves"],
    ["rec-wudu", "Wudu station beside the sink"],
    ["rec-guidelines", "Posted guidelines for using the reflection room"],
  ],
  "Benedum Room 403": [["benedum-room", "Prayer mat inside Benedum Room 403", 443]],
};

export function PhotoSlots({ name, wide = false, publicHidden = false, featured = 0 }: { name: string; wide?: boolean; publicHidden?: boolean; featured?: number }) {
  const photos = sets[name] ?? [];
  const [selected, setIndex] = useState<number>();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { editing, fields } = useContext(Content);
  const coverKey = useField("location-featured-photo");
  const cover = fields[coverKey];
  const coverIndex = cover?.kind === "selection" && cover.index < photos.length ? cover.index : featured;
  const index = selected ?? coverIndex;
  const fieldId = "location-photo-" + (index + 1);
  const key = useField(fieldId);
  const [file, description, originalWidth] = photos[index] ?? [];
  const alt = fields[key + "/alt"];
  const caption = alt?.kind === "alt" ? alt.text : description;
  const available = !!file || fields[key]?.kind === "image";
  const count = Math.max(1, photos.length);
  const step = (delta: number) => setIndex(i => ((i ?? coverIndex) + delta + count) % count);
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);

  if (!editing && (publicHidden || !available)) return null;

  const prefix = "/photos/prayer/" + file;
  const cardSource = originalWidth ? prefix + ".webp" : prefix + "-card.jpg";
  const positions: Record<string, string> = {
    "jummah-ballroom": "50% 100%",
    "jummah-community": "50% 100%",
    "wpu-gathering": "50% 58%",
    "rec-room": "50% 60%",
    "benedum-room": "50% 76%",
  };
  const picture = (full: boolean) => (
    <Picture fieldId={fieldId} className={full ? undefined : "venue-photo-image"}
      style={full ? undefined : { objectPosition: positions[file] ?? "center" }}
      srcSet={!full && wide && file ? `${prefix}-thumb.webp 340w, ${cardSource} ${originalWidth ?? 720}w` : undefined}
      sizes={wide && !full ? "(max-width: 767px) 82vw, 380px" : undefined}
      src={file ? prefix + (full ? "" : "-thumb") + ".webp" : undefined}
      emptyLabel="Photo coming soon" alt={description || (available ? name : "Photo coming soon")} width={full ? 1440 : wide ? 720 : 340}
      loading={full ? "eager" : "lazy"} decoding="async" />
  );
  return (
    <div className="venue-photos" data-cover-key={editing ? coverKey : undefined}
      data-cover-index={editing ? index : undefined} data-cover-current={editing ? coverIndex : undefined}>
      {editing || !available ? (
        <>
          {picture(false)}
          {editing && count > 1 && <button className="venue-edit-next" onClick={() => step(1)}>Next photo · {index + 1}/{count}</button>}
        </>
      ) : (
        <button className="venue-thumb" ref={trigger} aria-label={`View ${name} photos (${count})`} onClick={() => setOpen(true)}>
          {picture(false)}
          <span aria-hidden="true"><Images size={14}/>{count > 1 && count}</span>
        </button>
      )}
      {open && createPortal(
        <dialog ref={dialog} className="venue-viewer" aria-label={name + " photos"}
          onClose={() => {
            setOpen(false);
            setIndex(undefined);
            trigger.current?.focus({ preventScroll: true });
          }}
          onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}
          onKeyDown={e => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              step(e.key === "ArrowLeft" ? -1 : 1);
            }
          }}>
          <div className="venue-viewer-inner">
            <header><strong>{name}</strong><button autoFocus aria-label="Close photos" onClick={() => dialog.current?.close()}><X size={20}/></button></header>
            <figure onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
              onTouchEnd={e => {
                if (touchStart.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStart.current;
                if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
                touchStart.current = null;
              }}>
              {picture(true)}
            </figure>
            <footer>
              <p aria-live="polite">{count > 1 && <small>{index + 1} / {count}</small>}{caption}</p>
              {count > 1 && <div><button aria-label="Previous location photo" onClick={() => step(-1)}><ChevronLeft/></button><button aria-label="Next location photo" onClick={() => step(1)}><ChevronRight/></button></div>}
            </footer>
          </div>
        </dialog>, document.body)}
    </div>
  );
}
