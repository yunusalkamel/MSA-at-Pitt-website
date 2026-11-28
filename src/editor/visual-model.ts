import type { Fields } from "./content";

export const visualKey = {
  design: "shared/visual/design",
  menus: "shared/visual/menus",
  page: "shared/visual/page/",
  collection: "shared/visual/collection/",
} as const;

export type Focal = { kind: "focal"; x: number; y: number };
export type Presentation = {
  tone?: "default" | "warm" | "emerald" | "navy";
  spacing?: "compact" | "normal" | "roomy";
  align?: "left" | "center";
  size?: "normal" | "large";
  columns?: "one" | "two" | "three";
};
export type VisualPhoto = { src: string; alt: string; aspect?: number };
export type VisualBlock = {
  id: string;
  type: "heading" | "text" | "image" | "button" | "gallery" | "grid" | "announcement" | "faq";
  title: string;
  body?: string;
  url?: string;
  image?: string;
  images?: VisualPhoto[];
  cards?: { id: string; title: string; body?: string; image?: string; url?: string }[];
  hidden?: boolean;
  starts?: string;
  ends?: string;
  presentation?: Presentation;
};
export type VisualSection = {
  id: string;
  source?: string;
  hidden?: boolean;
  presentation?: Presentation;
};
export type VisualPage = {
  kind: "page";
  id: string;
  path?: string;
  template?: "information" | "campaign" | "landing";
  title: string;
  subtitle?: string;
  seoTitle?: string;
  description?: string;
  share?: string;
  visibility?: "draft" | "published";
  starts?: string;
  ends?: string;
  sections: VisualSection[];
  blocks: VisualBlock[];
};
export type NavItem = { id: string; title: string; url: string };
export type SiteMenus = {
  kind: "menus";
  main?: NavItem[];
  resources?: NavItem[];
  footer?: (NavItem & { group: "involved" | "campus" | "connect" })[];
};
export type CollectionType = "stories" | "albums" | "board" | "partners" | "announcements" | "hero";
export type CollectionItem = {
  id: string;
  title: string;
  slug?: string;
  date?: string;
  audience?: "everyone" | "brothers" | "sisters";
  category?: string[];
  body?: string;
  role?: string;
  url?: string;
  linkLabel?: string;
  image?: string;
  photos?: VisualPhoto[];
  home?: boolean;
  hidden?: boolean;
  starts?: string;
  ends?: string;
  tone?: "info" | "urgent" | "celebration";
};
export type VisualCollection = { kind: "collection"; type: CollectionType; items: CollectionItem[] };

export const builtInPages: Record<string, string> = {
  "/": "Home", "/about": "About", "/events": "Events", "/gallery": "Gallery",
  "/join": "Join", "/contact": "Contact", "/resources": "Resources",
  "/resources/new-to-pitt": "New to Pitt", "/resources/prayer": "Prayer",
  "/resources/chaplain": "Chaplain",
  "/resources/faq": "FAQ", "/board": "Board",
};

export function getVisualPage(fields: Fields, path: string) {
  const builtIn = fields[visualKey.page + path];
  if (builtIn?.kind === "page") return builtIn;
  return customPages(fields).find(page => page.path === path);
}

export function customPages(fields: Fields): VisualPage[] {
  return Object.entries(fields).flatMap(([key, field]) =>
    key.startsWith(visualKey.page) && field.kind === "page" && field.path ? [field] : []);
}

export function getCollection(fields: Fields, type: CollectionType) {
  const collection = fields[visualKey.collection + type];
  return collection?.kind === "collection" ? collection.items : undefined;
}

export function isScheduled(item: { starts?: string; ends?: string }, now = Date.now()) {
  return (!item.starts || Date.parse(item.starts) <= now) && (!item.ends || Date.parse(item.ends) > now);
}

export function findAvailable<T extends { hidden?: boolean; starts?: string; ends?: string }>(items: T[] | undefined) {
  return items?.filter(item => !item.hidden && isScheduled(item));
}
