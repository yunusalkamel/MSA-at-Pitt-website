/**
 * Crescent moon watermark — extracted from the MSA logo geometry.
 * A large, low-opacity crescent positioned at a corner or edge.
 * Never the focal point. Always present.
 */

import { useId } from "react";

const CrescentWatermark = ({
  color = "#F2AB23",
  size = 320,
  opacity = 0.07,
  position = "right",
  className = "",
}: {
  color?: string;
  size?: number;
  opacity?: number;
  position?: "right" | "left" | "top-right" | "bottom-right";
  className?: string;
}) => {
  const r1 = size * 0.375;
  const r2 = size * 0.31;
  const cx1 = size * 0.43;
  const cy1 = size * 0.5;
  const cx2 = size * 0.625;
  const cy2 = size * 0.43;
  const maskId = useId();

  const positionStyles: Record<string, React.CSSProperties> = {
    right: { position: "absolute", right: -size * 0.08, top: "50%", transform: "translateY(-50%)" },
    left: { position: "absolute", left: -size * 0.08, top: "50%", transform: "translateY(-50%)" },
    "top-right": { position: "absolute", right: -size * 0.05, top: -size * 0.05 },
    "bottom-right": { position: "absolute", right: -size * 0.08, bottom: -size * 0.08 },
  };

  return (
    <svg
      className={`pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      style={{ ...positionStyles[position], opacity }}
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect width={size} height={size} fill="black" />
          <circle cx={cx1} cy={cy1} r={r1} fill="white" />
          <circle cx={cx2} cy={cy2} r={r2} fill="black" />
        </mask>
      </defs>
      <circle cx={cx1} cy={cy1} r={r1} fill={color} mask={`url(#${maskId})`} />
    </svg>
  );
};

export default CrescentWatermark;
