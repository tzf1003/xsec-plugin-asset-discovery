import { build } from "esbuild";

const pluginRoot = new URL("../plugins/com.xsec.asset-discovery/", import.meta.url);

await build({
  entryPoints: [new URL("frontend-src/index.tsx", pluginRoot).pathname],
  outfile: new URL("com.xsec.desktop/frontend/index.js", pluginRoot).pathname,
  bundle: true,
  format: "esm",
  target: ["es2022"],
  jsx: "automatic",
  minify: true,
  legalComments: "none",
});
