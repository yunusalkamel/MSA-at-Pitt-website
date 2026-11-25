const widths = [240, 400, 640, 800, 1120, 1440, 1920];

export function sanityImageSrcSet(source: string, maxWidth: number): string | undefined {
  const url = new URL(source, "https://msaatpitt.vercel.app");
  if (url.origin !== "https://cdn.sanity.io" || !url.pathname.startsWith("/images/")) return;

  const dimensions = url.pathname.match(/-(\d+)x(\d+)\.[a-z]+$/i);
  if (!dimensions) return;
  const width = Math.min(Number(dimensions[1]), maxWidth);
  if (!width) return;
  const ratio = Number(url.searchParams.get("h")) / Number(url.searchParams.get("w"));

  url.searchParams.set("auto", "format");
  url.searchParams.set("q", "82");
  return [...widths.filter((candidate) => candidate < width), width].map((candidate) => {
    url.searchParams.set("w", String(candidate));
    if (ratio > 0 && Number.isFinite(ratio)) {
      url.searchParams.set("h", String(Math.round(candidate * ratio)));
    }
    return `${url.href} ${candidate}w`;
  }).join(", ");
}
