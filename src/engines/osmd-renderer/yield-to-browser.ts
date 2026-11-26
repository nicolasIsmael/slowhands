/** Lets the browser paint (for example a loading message) before heavy work blocks the thread. */
export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });
}
