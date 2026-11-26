import { useSyncExternalStore } from "react";
import type { NavigationController } from "./navigation-controller.ts";
import type { View } from "./view.ts";

export function useNavigation(controller: NavigationController): View {
  return useSyncExternalStore(controller.subscribe, controller.current);
}
