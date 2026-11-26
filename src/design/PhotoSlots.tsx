import { useContext, useRef, useState } from "react";
import { Picture, Content } from "@/editor/content";

// Temporary reviewer photos stay in this tab. The existing editor handles published images.
const trials = new Map<string, string>();
function TrialPhoto({ name, index }: { name: string; index: number }) {
  const { editing } = useContext(Content);
  const key = name + "/" + index;
  const [src, setSrc] = useState(() => trials.get(key));
  const file = useRef<HTMLInputElement>(null);
  const label = name + " · Photo " + (index + 1);
  return (
    <figure>
      <Picture
        fieldId={"location-photo-" + (index + 1)}
        src={src}
        emptyLabel={label}
        alt={name + " view " + (index + 1)}
        loading="lazy"
        width={640}
        height={400}
      />
      {!editing && (
        <>
          <button
            onClick={() => file.current?.click()}
            aria-label={"Try a photo for " + label}
          >
            Try a photo
          </button>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={file}
            onChange={(e) => {
              const image = e.target.files?.[0];
              if (!image || !image.type.startsWith("image/")) return;
              const old = trials.get(key);
              if (old) URL.revokeObjectURL(old);
              const url = URL.createObjectURL(image);
              trials.set(key, url);
              setSrc(url);
            }}
          />
        </>
      )}
    </figure>
  );
}
export function PhotoSlots({ name, count }: { name: string; count: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  return (
    <div className="venue-photos">
      <div
        className="location-photos"
        ref={track}
        role="region"
        aria-label={name + " photos"}
        tabIndex={count > 1 ? 0 : undefined}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / (el.clientWidth || 1)));
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <TrialPhoto key={i} name={name} index={i} />
        ))}
      </div>
      {count > 1 && (
        <div className="photo-pages">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              aria-label={name + " photo " + (i + 1)}
              aria-pressed={active === i}
              onClick={() =>
                track.current?.scrollTo({
                  left: i * track.current.clientWidth,
                  behavior: "instant",
                })
              }
            >
              <span />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
