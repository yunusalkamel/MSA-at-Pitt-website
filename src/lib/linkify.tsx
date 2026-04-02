import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<>"]+)/g;

/**
 * Turns plain-text URLs into clickable <a> tags.
 * Returns a React fragment with mixed text and link nodes.
 */
export function linkifyText(text: string): React.ReactNode {
  const parts = text.split(URL_REGEX);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
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
