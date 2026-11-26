/**
 * Loads the score drawing library while the app is idle, so the first score does not wait for
 * its download and compilation. Failing to preload is harmless: showing a score loads it anyway.
 */
export function preloadOsmdWhenIdle(): void {
  const load = (): void => {
    import("opensheetmusicdisplay").catch(() => {});
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(load);
  } else {
    setTimeout(load, 1000);
  }
}
