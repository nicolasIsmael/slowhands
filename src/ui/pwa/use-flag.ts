import type { Subscribable } from "@core/reactive/subscribable.ts";
import { useEffect, useState } from "react";

/** The current value of a yes/no fact that something outside the screen keeps up to date. */
export function useFlag(source: Subscribable<boolean>): boolean {
  const [value, setValue] = useState(false);
  useEffect(() => source.subscribe(setValue, () => setValue(false)), [source]);
  return value;
}
