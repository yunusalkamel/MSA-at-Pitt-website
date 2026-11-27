import { useContext, useId, useState, type ReactNode } from "react";
import { Info, X } from "lucide-react";
import { useDesign } from "./useDesign";
import { Content, Picture } from "@/editor/content";

type Props = {
  title: ReactNode;
  label: string;
  photo: string;
  tone: string;
  primary: ReactNode;
  body: ReactNode;
  extra?: ReactNode;
  summary?: ReactNode;
  detailTitle?: ReactNode;
  hint?: ReactNode;
  hasOwnPage?: boolean;
};

export function ResourceTile({ title, label, photo, tone, primary, body, extra, summary, detailTitle, hint, hasOwnPage }: Props) {
  const design = useDesign();
  const detailsId = useId();
  const { editing } = useContext(Content);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const always = design.resourceDetails === "visible";
  const showDetails = always || expanded || hovered;
  return (
    <article className="resource-tile" data-design-card={design.resource} data-design-details={design.resourceDetails} data-tone={tone} data-back={showDetails || undefined}
      data-linked={hasOwnPage && !editing || undefined} aria-label={label}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={event => {
        if (event.target.closest("a") && event.target.matches(":focus-visible")) setHovered(true);
      }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
      }}>
      <Picture fieldId="resource-backdrop" src={photo} alt="" loading="lazy" decoding="async"
        sizes="(width < 768px) 100px, 360px" width={500} height={360} />
      <div className="resource-copy">
        <h3>{title}</h3>
        {summary && <p className="tile-summary">{summary}</p>}
        <div className="tile-detail" id={detailsId}>
          {detailTitle && <p className="tile-detail-name" aria-hidden="true">{detailTitle}</p>}
          <p className="tile-description">{body}</p>
        </div>
        {hint && <span className="sr-only">{hint}</span>}
        <div className="resource-actions">
          <div className="resource-primary">{primary}</div>
          {extra && <div className="resource-extra">{extra}</div>}
        </div>
      </div>
      {!always && <button type="button" className="tile-info" aria-controls={detailsId} aria-expanded={showDetails}
        aria-label={(showDetails ? "Hide details for " : "Show details for ") + label}
        onClick={() => { setHovered(false); setExpanded(!showDetails); }}>
        {showDetails ? <X size={15} aria-hidden="true"/> : <Info size={16} aria-hidden="true"/>}
      </button>}
    </article>
  );
}
