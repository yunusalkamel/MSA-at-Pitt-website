import { useState, type ReactNode } from "react";
import { Picture } from "@/editor/content";
import { useDesign } from "./options";

type Props = {
  title: ReactNode;
  label: string;
  photo: string;
  tone: string;
  primary: ReactNode;
  body: ReactNode;
  extra?: ReactNode;
};
export function ResourceTile({
  title,
  label,
  photo,
  tone,
  primary,
  body,
  extra,
}: Props) {
  const { cards, details } = useDesign();
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = details === "Always visible" || expanded;
  const showDetails = open || hovered;
  return (
    <article
      className="resource-review resource-tile"
      data-finish={cards}
      data-tone={tone}
      data-back={showDetails || undefined}
      onPointerEnter={event => {
        if (details === "Desktop flip" && event.pointerType === "mouse" &&
            window.matchMedia("(min-width: 768px) and (hover: hover)").matches) setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      {(cards === "Photo tint" || cards === "Frosted photo") && (
        <Picture
          fieldId="resource-backdrop"
          src={photo}
          alt=""
          loading="lazy"
          sizes="(max-width: 767px) 90px, 360px"
          width={500}
          height={360}
        />
      )}
      <div className="resource-copy">
        <h3>{title}</h3>
        {showDetails && (
          <div className="tile-detail">
            <p>{body}</p>
            {extra}
          </div>
        )}
        <div className="resource-actions">{primary}</div>
      </div>
      {details !== "Always visible" && (
        <button
          className="tile-info"
          aria-label={
            (open ? "Hide details for " : "Show details for ") + label
          }
          aria-expanded={showDetails}
          onClick={() => { setHovered(false); setExpanded(v => !v); }}
        >
          {open ? "×" : "ⓘ"}
        </button>
      )}
    </article>
  );
}
