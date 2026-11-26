import { useEffect, useState } from "react";

const carriesFiles = (event: DragEvent): boolean =>
  event.dataTransfer?.types.includes("Files") ?? false;

/** Follows files being dragged over the window and hands over the ones that are dropped. */
class DragTracker {
  private depth = 0;
  private readonly onFiles: (files: File[]) => void;
  private readonly show: (dragging: boolean) => void;

  constructor(onFiles: (files: File[]) => void, show: (dragging: boolean) => void) {
    this.onFiles = onFiles;
    this.show = show;
  }

  attach(target: Window): () => void {
    const handlers: [string, EventListener][] = [
      ["dragenter", this.enter as EventListener],
      ["dragover", this.over as EventListener],
      ["dragleave", this.leave as EventListener],
      ["drop", this.drop as EventListener],
    ];
    for (const [name, handler] of handlers) {
      target.addEventListener(name, handler);
    }
    return () => {
      for (const [name, handler] of handlers) {
        target.removeEventListener(name, handler);
      }
    };
  }

  private enter = (event: DragEvent): void => {
    if (carriesFiles(event)) {
      this.depth += 1;
      this.show(true);
    }
  };

  private over = (event: DragEvent): void => {
    if (carriesFiles(event)) {
      event.preventDefault();
    }
  };

  private leave = (event: DragEvent): void => {
    if (carriesFiles(event)) {
      this.depth = Math.max(0, this.depth - 1);
      this.show(this.depth > 0);
    }
  };

  private drop = (event: DragEvent): void => {
    if (!carriesFiles(event)) {
      return;
    }
    event.preventDefault();
    this.depth = 0;
    this.show(false);
    this.onFiles(Array.from(event.dataTransfer?.files ?? []));
  };
}

/** Tells whether files are being dragged over the window, and hands over the ones dropped. */
export function useFileDrop(onFiles: (files: File[]) => void): boolean {
  const [dragging, setDragging] = useState(false);
  useEffect(() => new DragTracker(onFiles, setDragging).attach(window), [onFiles]);
  return dragging;
}
