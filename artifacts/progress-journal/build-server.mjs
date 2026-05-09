import { build } from "esbuild";

await build({
  entryPoints: ["server.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/server.js",
  packages: "external",
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});

console.log("Server build complete → dist/server.js");
