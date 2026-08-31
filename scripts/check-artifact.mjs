import { readFile } from "node:fs/promises";

const artifact = new URL("../plugins/com.xsec.asset-discovery/com.xsec.desktop/frontend/index.js", import.meta.url);
const manifestPath = new URL("../plugins/com.xsec.asset-discovery/plugin.json", import.meta.url);
const codexManifestPath = new URL("../plugins/com.xsec.asset-discovery/.codex-plugin/plugin.json", import.meta.url);
const packagePath = new URL("../package.json", import.meta.url);
const source = await readFile(artifact, "utf8");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const codexManifest = JSON.parse(await readFile(codexManifestPath, "utf8"));
const packageMetadata = JSON.parse(await readFile(packagePath, "utf8"));

if (!source.includes("export function activate(host)") || /from\s*["']\.?\//.test(source)) {
  throw new Error("资产发现前端制品必须是单一 ESM 模块");
}
if (codexManifest.version !== manifest.version || packageMetadata.version !== manifest.version) {
  throw new Error("资产发现发布元数据必须使用一致版本");
}
