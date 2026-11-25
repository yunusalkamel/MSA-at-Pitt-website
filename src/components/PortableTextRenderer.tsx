import { PortableText, type PortableTextComponents } from "@portabletext/react";

import { TextField } from "@/editor/content";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-body text-muted-foreground text-base leading-relaxed mb-4 last:mb-0">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-xl font-semibold text-foreground mb-2 mt-6 first:mt-0">
        {children}
      </h3>
    ),
  },
  marks: {
    inlineField: ({ value }) => (
      <TextField id={value.fieldId}>{value.text}</TextField>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
      >
        {children}
      </a>
    ),
  },
};

interface PortableTextRendererProps {
  value: any[];
  className?: string;
}

export default function PortableTextRenderer({
  value,
  className,
}: PortableTextRendererProps) {
  if (!value || !Array.isArray(value)) return null;
  const editableBlocks = value.map((block, blockIndex) => {
    if (block._type !== "block" || !Array.isArray(block.children)) return block;
    const markDefs = [...(block.markDefs || [])];
    const children = block.children.map((span, index) => {
      if (span._type !== "span") return span;
      const key = "editable-" + (span._key || index);
      markDefs.push({
        _type: "inlineField",
        _key: key,
        text: span.text,
        fieldId:
          "body-" + (block._key || blockIndex) + "-" + (span._key || index),
      });
      return { ...span, marks: [...(span.marks || []), key] };
    });
    return { ...block, markDefs, children };
  });
  return (
    <div className={className}>
      <PortableText value={editableBlocks} components={components} />
    </div>
  );
}
