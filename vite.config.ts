import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { getSiteOrigin } from "./shared/site-origin.js";
import { recaps } from "./src/data/recaps";
import { daylightWall, eveningWall } from "./src/data/communityPhotos";
import { communityImageSizes } from "./src/lib/communityImageSizes";

const siteOrigin = getSiteOrigin(process.env.SITE_ORIGIN, process.env.VERCEL_PROJECT_PRODUCTION_URL);

export default defineConfig({
  define: {
    __SITE_ORIGIN__: JSON.stringify(siteOrigin),
    __VERCEL_PRODUCTION_HOST__: JSON.stringify(process.env.VERCEL_PROJECT_PRODUCTION_URL || ""),
    __SITE_DATASET__: JSON.stringify(
      process.env.VERCEL_ENV === "preview" ? "preview" : "production",
    ),
  },
  server: { host: "::", port: 8080, hmr: { overlay: false } },
  plugins: [
    react(),
    {
      name: "site-origin-metadata",
      transformIndexHtml: {
        order: "pre",
        handler: (html) => html.replaceAll("__SITE_ORIGIN__", siteOrigin),
      },
    },
    {
      name: "preload-public-entry",
      apply: "build",
      transformIndexHtml: {
        order: "post",
        handler(_html, context) {
          const chunks = Object.values(context.bundle || {}).filter(
            (chunk) => chunk.type === "chunk",
          );
          const asset = (name: string) =>
            chunks.find((chunk) => chunk.name === name)?.fileName;
          const layout = asset("Layout");
          const routes = {
            "/": [asset("Index"), layout],
            "/resources/prayer": [asset("Prayer"), layout],
            "/gallery": [asset("Gallery"), layout, asset("RecapStories")],
          };
          const phonePhotos = [daylightWall, eveningWall].map(list=>list.slice(0,4).map((id) => ({
            href: `/photos/community/${id}-320.webp`,
            srcset: communityImageSizes(`/photos/community/${id}.webp`,true),
          })));
          return [{
            tag: "script",
            injectTo: "head",
            children: `
              if (location.pathname === "/gallery" && matchMedia("(width < 768px)").matches) {
                const cover = document.createElement("link");
                cover.rel = "preload";
                cover.as = "image";
                cover.href = ${JSON.stringify(recaps[0].cover.replace("cover.webp", "preview.webp"))};
                document.head.append(cover);
              }
              for (const file of (${JSON.stringify(routes)}[location.pathname] || [])) {
                if (!file) continue;
                const link = document.createElement("link");
                link.rel = "modulepreload";
                link.crossOrigin = "anonymous";
                link.href = "/" + file;
                document.head.append(link);
              }
              if (location.pathname === "/" && matchMedia("(width < 768px)").matches) {
                const dark = document.documentElement.classList.contains("dark");
                for (const photo of ${JSON.stringify(phonePhotos)}[Number(dark)]) {
                  const link = document.createElement("link");
                  link.rel = "preload";
                  link.as = "image";
                  link.fetchPriority = "high";
                  link.href = photo.href;
                  link.imageSrcset = photo.srcset;
                  link.imageSizes = "50vw";
                  document.head.append(link);
                }
              }
            `,
          }];
        },
      },
    },
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
});
