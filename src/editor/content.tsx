import { communityImageSizes } from "@/lib/communityImageSizes";
import {
  createContext,
  useContext,
  Fragment,
  type ReactNode,
  type ImgHTMLAttributes,
  type AnchorHTMLAttributes,
} from "react";
import { useLocation } from "react-router-dom";
import { sanityImageSrcSet } from "@/lib/sanityImageVariants";

export type Run = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: "small" | "normal" | "large";
};
export type Field =
  | { kind: "text"; runs: Run[] }
  | { kind: "image"; url: string }
  | { kind: "link"; url: string }
  | { kind: "alt"; text: string }
  | { kind: "visibility"; hidden: boolean }
  | { kind: "copies"; ids: string[] };
export type Fields = Record<string, Field>;
export const Content = createContext<{ fields: Fields; editing: boolean }>({
  fields: {},
  editing: false,
});
export const EditorialCopy = createContext(false);
const Scope = createContext("");
export function ContentScope({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const parent = useContext(Scope);
  return (
    <Scope.Provider value={parent + "/" + encodeURIComponent(id)}>
      {children}
    </Scope.Provider>
  );
}
export function useField(id: string) {
  const scope = useContext(Scope);
  const { pathname } = useLocation();
  const shared = /^(Navbar|Footer|AnnouncementBar)_/.test(id);
  return (
    (shared ? "shared" : pathname.replace(/\/$/, "") || "/") + scope + "/" + id
  );
}
export function usePlainTextField(id: string, fallback: string, fallbackFieldKeys: string[] = []) {
  const key = useField(id);
  const { fields } = useContext(Content);
  const field = [key, ...fallbackFieldKeys].map(candidate => fields[candidate]).find(value => value?.kind === "text");
  return field?.kind === "text" ? field.runs.map(run => run.text).join("") : fallback;
}

export function TextField({
  id,
  children,
  fallbackFieldKeys = [],
}: {
  id: string;
  children: ReactNode;
  fallbackFieldKeys?: string[];
}) {
  const key = useField(id),
    { fields, editing } = useContext(Content);
  const revised = useContext(EditorialCopy);
  if (revised && typeof children === "string") children = children.replace(/^\s*—\s*/, "").replace(/\s*—\s*/g, ", ");
  if (typeof children !== "string" && typeof children !== "number")
    return <>{children}</>;
  const field = fields[key] ?? fallbackFieldKeys.map(alias => fields[alias]).find(value => value?.kind === "text");
  if (!editing && field?.kind !== "text") return <>{children}</>;
  return (
    <span data-edit-text={editing ? key : undefined}>
      {field?.kind === "text"
        ? field.runs.map((r, i) => (
            <span
              key={i}
              data-size={r.size}
              style={{
                whiteSpace: "pre-wrap",
                fontWeight: r.bold ? "bold" : undefined,
                textDecoration: r.underline ? "underline" : undefined,
                fontStyle: r.italic ? "italic" : undefined,
                fontSize: r.size
                  ? { small: "0.85em", normal: "1em", large: "1.25em" }[r.size]
                  : undefined,
              }}
            >
              {r.text}
            </span>
          ))
        : children}
    </span>
  );
}
export function LinkField({
  fieldId,
  fallback,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { fieldId: string; fallback?:ReactNode }) {
  const key = useField(fieldId);
  const { fields, editing } = useContext(Content);
  const field = fields[key];
  if(fallback && !editing && !props.href && field?.kind!=="link") return <>{fallback}</>;
  return (
    <a
      {...props}
      href={field?.kind === "link" ? field.url : props.href}
      data-edit-link={editing ? key : undefined}
    />
  );
}
export function Picture({
  fieldId,
  emptyLabel,
  editorOnlyPlaceholder,
  fallbackFieldIds = [],
  fallbackFieldKeys = [],
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { fieldId: string; emptyLabel?: string; editorOnlyPlaceholder?: boolean; fallbackFieldIds?: string[]; fallbackFieldKeys?: string[] }) {
  const key = useField(fieldId),
    { fields, editing } = useContext(Content);
  const fallbackKeys = [...fallbackFieldKeys, ...fallbackFieldIds.map(id => key.slice(0, -fieldId.length) + id)];
  const fallback = fallbackKeys.find(id => fields[id]?.kind === "image");
  const value = fields[key] ?? (fallback ? fields[fallback] : undefined);
  const alt = fields[key+"/alt"] ?? (fallback ? fields[fallback+"/alt"] : undefined);
  const overridden = value?.kind === "image";
  const originalSrc = overridden ? value.url : props.src;
  const retiredPicnic = originalSrc?.includes("/fb311b741cf77c989aeffca328c66551045e3372-640x640.webp");
  const src = retiredPicnic ? "/photos/community/campus-friends.webp" : originalSrc;
  if (!src && editorOnlyPlaceholder && !editing) return null;
  if (!src && emptyLabel) {
    return <span className="photo-slot-empty" data-edit-image={editing ? key : undefined} role="img" aria-label={emptyLabel}>{emptyLabel}</span>;
  }
  const maxWidth = Number(props.width) || 1920;
  const srcSet = retiredPicnic || overridden || !props.srcSet
    ? src && (communityImageSizes(src) || sanityImageSrcSet(src, maxWidth))
    : props.srcSet;
  return (
    <img
      {...props}
      alt={alt?.kind==="alt"?alt.text:props.alt}
      src={src}
      srcSet={srcSet || undefined}
      sizes={srcSet ? props.sizes ?? `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px` : undefined}
      data-edit-image={editing ? key : undefined}
    />
  );
}
export function CardCopies({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const key = useField(id),
    { fields, editing } = useContext(Content);
  const entry = fields[key],
    ids = ["original", ...(entry?.kind === "copies" ? entry.ids : [])];
  return (
    <>
      {ids.map((instance) => {
        const visibility = fields[key + "/visibility/" + instance];
        const hidden = visibility?.kind === "visibility" && visibility.hidden;
        if (hidden && !editing) return null;
        return (
        <Fragment key={instance}>
          <ContentScope id={id + "@" + instance}>
            {editing ? (
              <span
                style={{ display: "contents" }}
                data-edit-card={key}
                data-copy-scope={id + "@" + instance}
              >
                {hidden ? <button type="button">Hidden card · select to show</button> : children}
              </span>
            ) : (
              children
            )}
          </ContentScope>
        </Fragment>
      );})}
    </>
  );
}
export function itemIdentity(item: unknown, fallback: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const row = item as Record<string, unknown>;
    for (const key of [
      "_key",
      "id",
      "slug",
      "url",
      "name",
      "title",
      "q",
      "headline",
      "label",
      "to",
      "shortName",
    ]) {
      if (typeof row[key] === "string") return row[key] as string;
    }
  }
  return String(fallback);
}
