import { PortableText, type PortableTextComponents } from "@portabletext/react";

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

export default function PortableTextRenderer({ value, className }: PortableTextRendererProps) {
  if (!value || !Array.isArray(value)) return null;
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}
