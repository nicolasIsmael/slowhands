import { useCallback, useSyncExternalStore } from "react";
import { useServices } from "../app/services-context.tsx";
import { useFlag } from "./use-flag.ts";

export interface AppUpdateControl {
  /** A new version is waiting. */
  available: boolean;
  /** An import is under way, so applying the update has to wait. */
  mustWait: boolean;
  apply: () => void;
}

/** Whether a new version can be applied, and the action that applies it. */
export function useAppUpdate(): AppUpdateControl {
  const { updates, importActivity } = useServices();
  const available = useFlag(updates.available);
  const mustWait = useSyncExternalStore(importActivity.subscribe, importActivity.isBusy);
  const apply = useCallback(() => {
    void updates.apply();
  }, [updates]);
  return { available, mustWait, apply };
}
