import { designChoices } from "./design-options.js";
import { z } from "zod";
import { validEditorLink } from "./editor-links.js";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(96);
const identifier = z.string().regex(/^[a-zA-Z0-9_.:-]+$/).max(128);
const title = z.string().trim().min(1).max(160);
const text = z.string().max(6000);
const date = z.string().regex(/^\d{4}-\d{2}(?:-\d{2})?$/);
const instant = z.string().datetime({ offset: true });
const link = z.string().refine(value => validEditorLink(value) || /^(?:\/|#[a-z0-9-]+$|\/(?!\/)[a-zA-Z0-9/_-]+(?:[?#][a-zA-Z0-9_?&=%./-]+)?)$/.test(value));
const asset = z.string().max(1000).regex(/^(?:\/(?:photos|partners)\/[a-zA-Z0-9_./-]+|https:\/\/cdn\.sanity\.io\/images\/[a-zA-Z0-9_/-]+\.[a-z]+)$/).refine(value => !value.includes(".."));
const optionalText = text.optional();
const navigation = z.object({ id: identifier, title, url: link });
const photo = z.object({ src: asset, alt: text, aspect: z.number().min(.15).max(6).optional() });
const presentation = z.object({
  tone: z.enum(["default", "warm", "emerald", "navy"]).optional(),
  spacing: z.enum(["compact", "normal", "roomy"]).optional(),
  align: z.enum(["left", "center"]).optional(),
  size: z.enum(["normal", "large"]).optional(),
  columns: z.enum(["one", "two", "three"]).optional(),
}).strict();
const unique = (values, key = "id") => new Set(values.map(value => value[key])).size === values.length;
const block = z.object({
  id: identifier,
  type: z.enum(["heading", "text", "image", "button", "gallery", "grid", "announcement", "faq"]),
  title,
  body: optionalText,
  url: link.optional(),
  image: asset.optional(),
  images: z.array(photo).max(24).optional(),
  cards: z.array(z.object({ id: identifier, title, body: optionalText, image: asset.optional(), url: link.optional() })).max(24).refine(unique).optional(),
  starts: instant.optional(),
  ends: instant.optional(),
  hidden: z.boolean().optional(),
  presentation: presentation.optional(),
}).strict().refine(item => !item.starts || !item.ends || Date.parse(item.starts) < Date.parse(item.ends));
const section = z.object({
  id: identifier,
  source: identifier.optional(),
  hidden: z.boolean().optional(),
  presentation: presentation.optional(),
}).strict();

export const optionsSchema = z.record(z.string(), z.string()).refine(options => Object.entries(options).every(
  ([key,value]) => Object.hasOwn(designChoices,key) && Object.hasOwn(designChoices[key].choices,value),
));
export const designProfiles = z.array(z.object({
  name: z.string().trim().min(1).max(70), options: optionsSchema,
}).strict()).max(20).refine(values => unique(values, "name"));
export const visualFields = {
  design: z.object({kind:z.literal("design"),options:optionsSchema}).strict(),
  order: z.object({kind:z.literal("order"),ids:z.array(z.string().min(1).max(170)).max(150)
    .refine(items => new Set(items).size === items.length)}).strict(),
  selection: z.object({kind:z.literal("selection"), index:z.number().int().min(0).max(31)}).strict(),
  focal: z.object({ kind: z.literal("focal"), x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).strict(),
  page: z.object({
    kind: z.literal("page"),
    id: identifier,
    path: z.string().regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/).max(97).optional(),
    template: z.enum(["information", "campaign", "landing"]).optional(),
    title, subtitle: optionalText, seoTitle: title.optional(), description: text.optional(), share: asset.optional(),
    visibility: z.enum(["draft", "published"]).optional(),
    starts: instant.optional(), ends: instant.optional(),
    sections: z.array(section).max(60).refine(unique),
    blocks: z.array(block).max(50).refine(unique),
  }).strict().refine(item => Boolean(item.path) === Boolean(item.template) && (!item.starts || !item.ends || Date.parse(item.starts) < Date.parse(item.ends))),
  menus: z.object({
    kind: z.literal("menus"),
    main: z.array(navigation).max(10).refine(unique).optional(),
    resources: z.array(navigation).max(14).refine(unique).optional(),
    footer: z.array(navigation.extend({ group: z.enum(["involved", "campus", "connect"]) })).max(18).refine(unique).optional(),
  }).strict(),
  collection: z.object({
    kind: z.literal("collection"),
    type: z.enum(["stories", "albums", "board", "partners", "announcements", "hero"]),
    items: z.array(z.object({
      id: identifier, title, slug: slug.optional(), date: date.optional(), audience: z.enum(["everyone", "brothers", "sisters"]).optional(),
      category: z.array(z.string().max(65)).max(12).optional(),
      body: optionalText, role: optionalText, url: link.optional(), linkLabel: title.optional(), image: asset.optional(),
      photos: z.array(photo).max(32).optional(), home: z.boolean().optional(), hidden: z.boolean().optional(),
      starts: instant.optional(), ends: instant.optional(),
      tone: z.enum(["info", "urgent", "celebration"]).optional(),
    }).strict().refine(item => !item.starts || !item.ends || Date.parse(item.starts) < Date.parse(item.ends))).max(125).refine(unique).refine(values => unique(values.filter(value => value.slug), "slug")),
  }).strict(),
};

export const editorKeys = {
  design: "shared/visual/design",
  menus: "shared/visual/menus",
  page: "shared/visual/page/",
  collection: "shared/visual/collection/",
};
