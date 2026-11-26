import { expect, test, vi } from "vitest";
import { BrowserAppInstallation } from "./browser-app-installation.ts";

function offerEvent() {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  const prompt = vi.fn(async () => {});
  Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome: "accepted" }) });
  return { event, prompt };
}

function setup() {
  const target = new EventTarget();
  const installation = new BrowserAppInstallation(target);
  const seen: boolean[] = [];
  installation.canInstall.subscribe(
    (value) => seen.push(value),
    () => {},
  );
  return { target, installation, seen };
}

test("cannot install until the browser makes an offer", () => {
  expect(setup().seen).toEqual([false]);
});

test("can install once the browser makes an offer, and keeps the browser from asking by itself", () => {
  const { target, seen } = setup();
  const { event } = offerEvent();
  target.dispatchEvent(event);
  expect(seen).toEqual([false, true]);
  expect(event.defaultPrevented).toBe(true);
});

test("installing shows the browser's question once and then cannot install again", async () => {
  const { target, installation, seen } = setup();
  const { event, prompt } = offerEvent();
  target.dispatchEvent(event);
  await installation.install();
  expect(prompt).toHaveBeenCalledTimes(1);
  expect(seen).toEqual([false, true, false]);
  await installation.install();
  expect(prompt).toHaveBeenCalledTimes(1);
});

test("stops offering once the app has been installed", () => {
  const { target, seen } = setup();
  target.dispatchEvent(offerEvent().event);
  target.dispatchEvent(new Event("appinstalled"));
  expect(seen).toEqual([false, true, false]);
});

test("installing with no offer does nothing", async () => {
  await expect(setup().installation.install()).resolves.toBeUndefined();
});

test("a failing question does not break the app", async () => {
  const { target, installation } = setup();
  const { event } = offerEvent();
  Object.assign(event, { userChoice: Promise.reject(new Error("closed")) });
  target.dispatchEvent(event);
  await expect(installation.install()).resolves.toBeUndefined();
});
