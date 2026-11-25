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
  | { kind: "visibility"; hidden: boolean }
  | { kind: "copies"; ids: string[] };
export type Fields = Record<string, Field>;
export const Content = createContext<{ fields: Fields; editing: boolean }>({
  fields: {},
  editing: false,
});
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
function useField(id: string) {
  const scope = useContext(Scope);
  const { pathname } = useLocation();
  const shared = /^(Navbar|Footer|AnnouncementBar)_/.test(id);
  return (
    (shared ? "shared" : pathname.replace(/\/$/, "") || "/") + scope + "/" + id
  );
}
export function TextField({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const key = useField(id),
    { fields, editing } = useContext(Content);
  if (typeof children !== "string" && typeof children !== "number")
    return <>{children}</>;
  const field = fields[key];
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
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { fieldId: string }) {
  const key = useField(fieldId);
  const { fields, editing } = useContext(Content);
  const field = fields[key];
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
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { fieldId: string }) {
  const key = useField(fieldId),
    { fields, editing } = useContext(Content),
    value = fields[key];
  const overridden = value?.kind === "image";
  const src = overridden ? value.url : props.src;
  const maxWidth = Number(props.width) || 1920;
  const srcSet = overridden || !props.srcSet
    ? src && sanityImageSrcSet(src, maxWidth)
    : props.srcSet;
  return (
    <img
      {...props}
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
