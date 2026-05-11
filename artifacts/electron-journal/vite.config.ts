import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron/simple";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: "src/main/index.ts",
        vite: {
          build: {
            rollupOptions: {
              external: ["better-sqlite3"],
              output: {
                // Explicit CJS so Electron can require() the entry and
                // __dirname / __filename are available at runtime.
                format: "cjs",
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
              },
            },
          },
        },
      },
      preload: {
        input: path.join(import.meta.dirname, "src/preload/preload.ts"),
        vite: {
          build: {
            rollupOptions: {
              output: {
                format: "cjs",
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
              },
            },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: "@/lib/store",
        replacement: path.resolve(import.meta.dirname, "src/renderer/store-ipc.ts"),
      },
      {
        find: "@/pages/settings",
        replacement: path.resolve(import.meta.dirname, "src/renderer/pages/settings-desktop.tsx"),
      },
      {
        find: "@",
        replacement: path.resolve(import.meta.dirname, "../progress-journal/src"),
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
