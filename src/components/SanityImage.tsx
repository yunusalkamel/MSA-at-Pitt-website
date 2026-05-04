import { useState, type ImgHTMLAttributes } from "react";
import { urlFor } from "@/lib/sanity";

interface SanityImageRef {
  asset?: { _ref?: string };
  lqip?: string; // base64 data URI from sanity image metadata
  hotspot?: unknown;
  crop?: unknown;
}

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "ref"> {
  /** Sanity image reference (from a GROQ projection that includes `..., "lqip": asset->metadata.lqip`). */
  source: SanityImageRef | null | undefined;
  /** Bundled fallback shown when Sanity hasn't returned data yet. */
  fallbackSrc: string;
  /** Output width — used by Sanity's image pipeline. */
  width: number;
  /** Output height — used by Sanity's image pipeline. */
  height: number;
  /** Override how the image is fit. Defaults to "crop". */
  fit?: "crop" | "clip" | "fill" | "fillmax" | "max" | "scale" | "min";
  /** When true, sets fetchpriority="high" and loading="eager". Use for above-the-fold heroes. */
  eager?: boolean;
}

/**
 * Sanity-aware <img> that:
 *   1. Renders the bundled fallback synchronously on first paint.
 *   2. Shows a low-quality blurred placeholder (LQIP) under the loading image
 *      once Sanity responds, smoothing the swap.
 *   3. Crossfades to the full image when it decodes.
 *
 * Requires the GROQ projection to include `"lqip": asset->metadata.lqip`.
 */
export default function SanityImage({
  source,
  fallbackSrc,
  width,
  height,
  fit = "crop",
  eager = false,
  alt = "",
  className = "",
  style,
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const sanitySrc = source?.asset?._ref
    ? urlFor(source).width(width).height(height).fit(fit).auto("format").url()
    : null;

  // While Sanity hasn't returned, show the fallback at full opacity.
  // Once Sanity returns, render the full image on top of the LQIP and crossfade.
  if (!sanitySrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        // fetchpriority is a non-standard React attribute name → use lowercase
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fetchpriority={eager ? "high" : "auto"}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        ...style,
        backgroundImage: source?.lqip ? `url(${source.lqip})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src={sanitySrc}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fetchpriority={eager ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className="w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }}
        {...rest}
      />
    </div>
  );
}
