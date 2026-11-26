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
  const open = details === "Always visible" || expanded;
  return (
    <article
      className="resource-review resource-tile"
      data-finish={cards}
      data-tone={tone}
      data-back={open || undefined}
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
        {open && (
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
          aria-expanded={open}
          onClick={() => setExpanded((v) => !v)}
        >
          {open ? "×" : "ⓘ"}
        </button>
      )}
    </article>
  );
}
