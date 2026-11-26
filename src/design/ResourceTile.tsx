import { useContext, useId, type ReactNode } from "react";
import { Content, Picture } from "@/editor/content";

type Props = {
  title: ReactNode;
  label: string;
  icon: ReactNode;
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

export function ResourceTile({ title, label, icon, photo, tone, primary, body, extra, summary, detailTitle, hint, hasOwnPage }: Props) {
  const detailsId = useId();
  const { editing } = useContext(Content);
  return (
    <article className="resource-tile liquid-glass" data-tone={tone} data-details={!!detailTitle || undefined}
      data-linked={hasOwnPage && !editing || undefined} aria-label={label} aria-describedby={detailsId}>
      {editing && <Picture fieldId="resource-backdrop" src={photo} alt="" width={500} height={360} className="resource-edit-photo" />}
      <div className="resource-icon" aria-hidden="true">{icon}</div>
      <h3 className="resource-title">{title}</h3>
      {summary && <p className="tile-summary">{summary}</p>}
      <div className="tile-detail" id={detailsId}>
        {detailTitle && <p className="tile-detail-name" aria-hidden="true">{detailTitle}</p>}
        <p className="tile-description">{body}</p>
      </div>
      {hint && <p className="resource-hint" aria-hidden="true">{hint}</p>}
      <div className="resource-actions">
        <div className="resource-primary">{primary}</div>
        {extra && <div className="resource-extra">{extra}</div>}
      </div>
    </article>
  );
}
