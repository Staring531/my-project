import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const port = process.env.PORT ?? "3000";
const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src/client"),
    },
  },
  root: "src/client",
  server: {
    proxy: {
      // Trailing slashes keep /api.js, the client module, from being proxied.
      "/api/": `http://127.0.0.1:${port}`,
      "/images/": `http://127.0.0.1:${port}`,
    },
  },
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
});
