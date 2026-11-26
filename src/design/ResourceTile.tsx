import { useId, type ReactNode } from "react";
import { Picture } from "@/editor/content";

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
};

export function ResourceTile({ title, label, photo, tone, primary, body, extra, summary, detailTitle, hint }: Props) {
  const detailsId = useId();
  return (
    <article className="resource-tile" data-tone={tone} tabIndex={0} aria-label={label} aria-describedby={detailsId}>
      <Picture fieldId="resource-backdrop" src={photo} alt="" loading="lazy"
        sizes="(width < 768px) 100px, 400px" width={500} height={360} />
      <div className="resource-copy">
        <h3>{title}</h3>
        {summary && <p className="tile-summary">{summary}</p>}
        <div className="tile-detail" id={detailsId}>
          {detailTitle && <p className="tile-detail-name">{detailTitle}</p>}
          <p className="tile-description">{body}</p>
          {extra}
        </div>
        <div className="resource-actions">{primary}</div>
        {hint && <div className="sr-only">{hint}</div>}
      </div>
    </article>
  );
}
