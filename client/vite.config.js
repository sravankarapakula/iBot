import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "./", // important for GitHub Pages / Vercel
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
