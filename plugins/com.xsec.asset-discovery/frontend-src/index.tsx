import { createRoot, type Root } from "react-dom/client";
import { AssetDiscoveryApp } from "./app";
import { createAssetDiscoveryApi } from "./host";
import { SettingsPage } from "./settings";
import type { PluginHost } from "./types";
import { styles } from "./styles";

function page(host: PluginHost) {
  const api = createAssetDiscoveryApi(host);
  if (host.context?.kind === "settings-page") return <SettingsPage api={api} />;
  return <AssetDiscoveryApp api={api} host={host} />;
}

export function activate(host: PluginHost) {
  let root: Root | undefined;
  return {
    mount(element: HTMLElement) {
      root = createRoot(element);
      root.render(<><style>{styles}</style>{page(host)}</>);
    },
    update() {},
    dispose() { root?.unmount(); },
  };
}
