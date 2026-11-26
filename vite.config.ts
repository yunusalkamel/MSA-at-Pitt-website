import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { getSiteOrigin } from "./shared/site-origin.js";

const siteOrigin = getSiteOrigin(process.env.SITE_ORIGIN);

export default defineConfig({
  define: {
    __SITE_ORIGIN__: JSON.stringify(siteOrigin),
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
          };
          return [
            {
              tag: "script",
              injectTo: "head",
              children:
                'for(const file of (' + JSON.stringify(routes) + '[location.pathname]||[])){if(!file)continue;const link=document.createElement("link");link.rel="modulepreload";link.crossOrigin="anonymous";link.href="/"+file;document.head.append(link)}',
            },
          ];
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
