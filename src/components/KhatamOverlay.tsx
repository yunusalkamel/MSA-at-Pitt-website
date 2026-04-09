/**
 * Khatam pattern overlay — Islamic 8-pointed star (two squares at 45°).
 * Renders as inline SVG so the geometry is crisp at any scale.
 * 
 * Variants:
 *   gold   — gold strokes on dark surfaces (Abyss, hero, footer)
 *   navy   — navy strokes on light surfaces (Parchment, Linen)
 *   aura   — aura gold strokes for Gala-tier contexts
 *   deep   — gold-deep strokes for contemplative/aura posts
 *   white  — white strokes on colored surfaces (Jannah, MSA Blue)
 */

import { useId } from "react";

const STROKE_MAP: Record<string, string> = {
  gold:  "rgba(242,171,35,.18)",
  navy:  "rgba(20,52,90,.07)",
  aura:  "rgba(201,168,76,.18)",
  deep:  "rgba(138,98,18,.25)",
  white: "rgba(255,255,255,.09)",
};

const KhatamOverlay = ({
  variant = "gold",
  size = 56,
  opacity = 1,
  className = "",
}: {
  variant?: "gold" | "navy" | "aura" | "deep" | "white";
  size?: number;
  opacity?: number;
  className?: string;
}) => {
  const stroke = STROKE_MAP[variant] || STROKE_MAP.gold;
  const half = size / 2;
  const inner = size * 0.464; // ~26/56 ratio
  const offset = (size - inner) / 2;
  const patternId = useId();

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} width={size} height={size} patternUnits="userSpaceOnUse">
          {/* Center tile */}
          <rect x={offset} y={offset} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" />
          <rect x={offset} y={offset} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" transform={`rotate(45,${half},${half})`} />
          {/* Corner tiles for seamless tiling */}
          <rect x={offset - size} y={offset - size} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" />
          <rect x={offset - size} y={offset - size} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" transform={`rotate(45,0,0)`} />
          <rect x={offset + size} y={offset + size} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" />
          <rect x={offset + size} y={offset + size} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" transform={`rotate(45,${size},${size})`} />
          <rect x={offset + size} y={offset - size} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" />
          <rect x={offset + size} y={offset - size} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" transform={`rotate(45,${size},0)`} />
          <rect x={offset - size} y={offset + size} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" />
          <rect x={offset - size} y={offset + size} width={inner} height={inner} fill="none" stroke={stroke} strokeWidth=".85" transform={`rotate(45,0,${size})`} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};

export default KhatamOverlay;
