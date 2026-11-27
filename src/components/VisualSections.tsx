import { Children, Fragment, Suspense, isValidElement, lazy, useContext, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Content, ContentScope } from "@/editor/content";
import { getVisualPage, isScheduled, type Presentation, type VisualSection } from "@/editor/visual-model";
import SectionDivider from "./SectionDivider";

const VisualBlock = lazy(() => import("./VisualBlock"));

export function presentationProps(presentation?: Presentation) {
  return {
    "data-tone": presentation?.tone,
    "data-spacing": presentation?.spacing,
    "data-align": presentation?.align,
    "data-size": presentation?.size,
    "data-columns": presentation?.columns,
  };
}

function sectionName(index: number, name?: string) {
  return name || (index === 0 ? "Page introduction" : `Section ${index + 1}`);
}

export default function VisualSections({ children, names = [] }: { children: ReactNode; names?: string[] }) {
  const { fields, editing } = useContext(Content);
  const { pathname } = useLocation();
  const page = getVisualPage(fields, pathname);
  if (!editing && !page) return <>{children}</>;

  const nodes: { id: string; label: string; node: ReactNode; dividers: ReactNode[] }[] = [];
  for (const node of Children.toArray(children)) {
    if (isValidElement(node) && node.type === SectionDivider && nodes.length) {
      nodes[nodes.length - 1].dividers.push(node);
    } else {
      const label = sectionName(nodes.length, names[nodes.length]);
      const id = names[nodes.length]?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `built-in-${nodes.length}`;
      nodes.push({ id, label, node, dividers: [] });
    }
  }
  const settings = page?.sections ?? [];
  const ordered: VisualSection[] = [
    ...settings,
    ...nodes.filter(node => !settings.some(section => section.id === node.id)).map(node => ({ id: node.id })),
    ...(page?.blocks ?? []).filter(block => !settings.some(section => section.id === block.id)).map(block => ({ id: block.id })),
  ];
  return <>{ordered.map(section => {
    const original = nodes.find(node => node.id === (section.source ?? section.id));
    const block = page?.blocks.find(item => item.id === section.id);
    if (!original && !block) return null;
    const hidden = section.hidden || (block && (block.hidden || !isScheduled(block)));
    if (hidden && !editing) return null;
    const label = original?.label ?? block.title;
    const content = original
      ? section.source ? <ContentScope id={`section-copy-${section.id}`}>{original.node}</ContentScope> : original.node
      : <Suspense fallback={null}><VisualBlock block={block} /></Suspense>;
    const wrapper = editing || section.presentation;
    return <Fragment key={section.id}>
      {wrapper ? <div className={section.presentation ? "visual-section-style" : "visual-section-marker"}
        {...presentationProps(section.presentation)}
        data-visual-section={editing ? section.id : undefined}
        data-visual-source={editing ? section.source : undefined}
        data-visual-label={editing ? label : undefined}>
        {hidden ? <p className="msa-hidden-section">{label} · Hidden</p> : content}
      </div> : content}
      {!hidden && original?.dividers}
    </Fragment>;
  })}</>;
}
