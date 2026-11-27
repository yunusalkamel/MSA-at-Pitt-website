import { Link } from "react-router-dom";
import { Picture, TextField, ContentScope, LinkField } from "@/editor/content";
import { presentationProps } from "./VisualSections";
import type { VisualBlock as Block } from "@/editor/visual-model";

export function VisualLink({ url, children, className }: { url: string; children: React.ReactNode; className?: string }) {
  if (url.startsWith("/") && !url.startsWith("//")) return <Link to={url} className={className}>{children}</Link>;
  return <a href={url} className={className}>{children}</a>;
}

export default function VisualBlock({ block }: { block: Block }) {
  return <ContentScope id={`visual-${block.id}`}>
    <section className="visual-block section-padding" {...presentationProps(block.presentation)}>
      <div className="site-container">
        {block.type === "faq" ? <details className="glass-card p-5">
          <summary className="font-semibold"><TextField id="question">{block.title}</TextField></summary>
          <p className="mt-3"><TextField id="answer">{block.body || "Add an answer."}</TextField></p>
        </details> : <>
          <h2 className="font-display text-3xl md:text-5xl font-bold"><TextField id="title">{block.title}</TextField></h2>
          {(block.body || block.type === "text") && <p className="mt-3 max-w-prose whitespace-pre-wrap text-muted-foreground"><TextField id="body">{block.body || "Add text here."}</TextField></p>}
          {block.type === "image" && <Picture fieldId="image" src={block.image} alt="" emptyLabel="Choose an image"
            editorOnlyPlaceholder className="mt-4 w-full max-w-3xl aspect-video rounded-2xl object-cover" loading="lazy" />}
          {block.url && <LinkField fieldId="action" href={block.url} className="btn-premium mt-5"><TextField id="link-label">Learn more</TextField> →</LinkField>}
          {block.type === "gallery" && <div className="visual-grid mt-5">
            {(block.images ?? []).map((photo, i) => <ContentScope key={i} id={`photo-${i}`}>
              <figure><Picture fieldId="image" src={photo.src} alt={photo.alt} className="w-full aspect-[4/3] rounded-xl object-cover" loading="lazy" />
              {photo.alt && <figcaption className="text-sm mt-2"><TextField id="caption">{photo.alt}</TextField></figcaption>}</figure>
            </ContentScope>)}
          </div>}
          {block.type === "grid" && <div className="visual-grid mt-5">
            {(block.cards ?? []).map(card => <ContentScope key={card.id} id={card.id}>
              <article className="glass-card p-5">
                {card.image && <Picture fieldId="image" src={card.image} alt="" className="w-full aspect-video rounded-xl object-cover mb-3" loading="lazy" />}
                <h3 className="font-display text-2xl font-bold"><TextField id="card-title">{card.title}</TextField></h3>
                {card.body && <p className="mt-2"><TextField id="card-body">{card.body}</TextField></p>}
                {card.url && <LinkField fieldId="card-link" href={card.url} className="underline mt-2 inline-block"><TextField id="card-link-label">Learn more</TextField> →</LinkField>}
              </article>
            </ContentScope>)}
          </div>}
        </>}
      </div>
    </section>
  </ContentScope>;
}
