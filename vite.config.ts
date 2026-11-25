import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  define: {
    __SITE_DATASET__: JSON.stringify(process.env.VERCEL_ENV === "preview" ? "preview" : "production"),
  },
  server: { host: "::", port: 8080, hmr: { overlay: false } },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
