import { readFile } from "node:fs/promises";

const artifact = new URL("../plugins/com.xsec.asset-discovery/com.xsec.desktop/frontend/index.js", import.meta.url);
const source = await readFile(artifact, "utf8");

if (!source.includes("export{") || /from\s*["']\.?\//.test(source)) {
  throw new Error("资产发现前端制品必须是单一 ESM 模块");
}
