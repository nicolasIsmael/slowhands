import { afterEach, expect, test, vi } from "vitest";
import { NavigationController } from "./navigation-controller.ts";

const controllers: NavigationController[] = [];
const create = (): NavigationController => {
  const controller = new NavigationController();
  controllers.push(controller);
  return controller;
};
const expectList = (controller: NavigationController): Promise<void> =>
  vi.waitFor(() => expect(controller.current()).toEqual({ name: "list" }));

afterEach(() => {
  for (const controller of controllers.splice(0)) {
    controller.dispose();
  }
});

test("starts on the song list", () => {
  expect(create().current()).toEqual({ name: "list" });
});

test("ignores a viewer entry left in the history by an earlier visit", () => {
  window.history.replaceState({ name: "viewer", songId: "old" }, "");
  expect(create().current()).toEqual({ name: "list" });
  expect(window.history.state).toBeNull();
});

test("opening the viewer shows it and keeps the address unchanged", () => {
  const before = window.location.href;
  const controller = create();
  controller.openViewer("song-1");
  expect(controller.current()).toEqual({ name: "viewer", songId: "song-1" });
  expect(window.location.href).toBe(before);
});

test("the back button returns from the viewer to the list", async () => {
  const controller = create();
  controller.openViewer("song-1");
  window.history.back();
  await expectList(controller);
});

test("showing the list from the viewer goes back one step", async () => {
  const controller = create();
  controller.openViewer("song-1");
  controller.showList();
  await expectList(controller);
});

test("tells subscribers when the view changes", () => {
  const controller = create();
  let notifications = 0;
  controller.subscribe(() => {
    notifications += 1;
  });
  controller.openViewer("song-1");
  expect(notifications).toBe(1);
});
