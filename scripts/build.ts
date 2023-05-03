import { build } from "esbuild";

(async () => {
  await build({
    entryPoints: ["./lib/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: "node",
    outfile: "./dist/index.js",
  });
})();
