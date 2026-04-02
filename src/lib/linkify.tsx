import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<>"]+)/g;
const HREF_REGEX = /href\s*=\s*["']([^"']+)["']/gi;

function extractFirstHref(text: string): string | null {
  const match = HREF_REGEX.exec(text);
  HREF_REGEX.lastIndex = 0;
  return match?.[1] ?? null;
}

/**
 * Turns plain-text URLs into clickable <a> tags.
 * Returns a React fragment with mixed text and link nodes.
 */
export function linkifyText(text: string): React.ReactNode {
  const href = extractFirstHref(text);
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80 break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {href}
      </a>
    );
  }

  const parts = text.split(URL_REGEX);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//i.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part.length > 40 ? part.slice(0, 37) + "…" : part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
