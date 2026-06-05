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
              external: ["better-sqlite3", "electron-updater"],
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
        // Match any import that ends with /lib/store — covers both the @/ alias
        // form used in renderer/pages (e.g. "@/lib/store") and the relative form
        // used by pages from progress-journal/src (e.g. "../lib/store" or
        // "../../lib/store").  Relative imports bypass string-prefix aliases so a
        // regex is required.  The replacement is the Electron IPC store that talks
        // to the main process instead of IndexedDB.
        find: /^.*\/lib\/store(\.tsx?)?$/,
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
