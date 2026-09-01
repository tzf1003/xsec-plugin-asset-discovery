import { useCallback, useEffect, useRef, useState } from "react";
import type { AssetDiscoveryApi } from "./host";
import type { CollectionRun, CollectorSettings, ExecutionDefaults } from "./types";
import { collectionBucket } from "./utils";

const RUN_REFRESH_INTERVAL_MS = 5_000;
type RunsLoadState = "ok" | "error" | "stale";

function useRuns(api: AssetDiscoveryApi) {
  const [runs, setRuns] = useState<CollectionRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [runsError, setRunsError] = useState<string>();
  const requestGeneration = useRef(0);
  const requestInFlight = useRef(false);
  const loadRuns = useCallback(async (): Promise<RunsLoadState> => {
    if (requestInFlight.current) return "stale";
    const generation = ++requestGeneration.current;
    requestInFlight.current = true;
    setRunsLoading(true);
    setRunsError(undefined);
    try {
      const next = await api.runs();
      if (generation !== requestGeneration.current) return "stale";
      setRuns(next);
      return "ok";
    } catch (reason) {
      if (generation !== requestGeneration.current) return "stale";
      setRunsError(`读取收集任务失败：${String(reason)}`);
      return "error";
    } finally {
      requestInFlight.current = false;
      if (generation === requestGeneration.current) setRunsLoading(false);
    }
  }, [api]);
  return { runs, runsLoading, runsError, loadRuns };
}

function useCollectorSetup(api: AssetDiscoveryApi) {
  const [defaults, setDefaults] = useState<ExecutionDefaults>();
  const [defaultsError, setDefaultsError] = useState<string>();
  const [settings, setSettings] = useState<CollectorSettings>();
  const [settingsError, setSettingsError] = useState<string>();
  const loadDefaults = useCallback(async () => {
    setDefaultsError(undefined);
    try {
      setDefaults(await api.defaults());
    } catch (reason) {
      setDefaultsError(`读取任务默认设置失败：${String(reason)}`);
    }
  }, [api]);
  const loadSettings = useCallback(async () => {
    setSettingsError(undefined);
    try {
      setSettings(await api.settings());
    } catch (reason) {
      setSettingsError(`读取资产发现设置失败：${String(reason)}`);
    }
  }, [api]);
  return { defaults, defaultsError, settings, settingsError, loadDefaults, loadSettings };
}

function useActiveRunRefresh(runs: CollectionRun[], loadRuns: () => Promise<RunsLoadState>) {
  useEffect(() => {
    if (!runs.some((run) => collectionBucket(run.status) === "running")) return;
    const timer = window.setInterval(() => {
      void loadRuns().then((state) => {
        if (state === "error") window.clearInterval(timer);
      });
    }, RUN_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loadRuns, runs]);
}

export function useDashboardState(api: AssetDiscoveryApi) {
  const runs = useRuns(api);
  const setup = useCollectorSetup(api);
  const refresh = useCallback(async () => {
    await Promise.all([runs.loadRuns(), setup.loadDefaults(), setup.loadSettings()]);
  }, [runs.loadRuns, setup.loadDefaults, setup.loadSettings]);
  useEffect(() => { void refresh(); }, [refresh]);
  useActiveRunRefresh(runs.runs, runs.loadRuns);
  return { ...runs, ...setup, refresh };
}
