import { expect, test, vi } from "vitest";
import { type RegisterWorker, ServiceWorkerUpdates } from "./service-worker-updates.ts";

function fakeRegistration() {
  const applied: boolean[] = [];
  let announce: () => void = () => {};
  const register: RegisterWorker = ({ onNeedRefresh }) => {
    announce = onNeedRefresh;
    return async (reloadPage) => {
      applied.push(reloadPage === true);
    };
  };
  return { register, applied, announceNewVersion: () => announce() };
}

const watch = (updates: ServiceWorkerUpdates): boolean[] => {
  const seen: boolean[] = [];
  updates.available.subscribe(
    (value) => seen.push(value),
    () => {},
  );
  return seen;
};

test("reports no update until the worker says a new version is waiting", () => {
  const { register } = fakeRegistration();
  expect(watch(new ServiceWorkerUpdates(register))).toEqual([false]);
});

test("reports the update once a new version is waiting", () => {
  const { register, announceNewVersion } = fakeRegistration();
  const updates = new ServiceWorkerUpdates(register);
  const seen = watch(updates);
  announceNewVersion();
  expect(seen).toEqual([false, true]);
});

test("applying activates the waiting version and reloads the page", async () => {
  const { register, applied } = fakeRegistration();
  await new ServiceWorkerUpdates(register).apply();
  expect(applied).toEqual([true]);
});

test("registers the worker only once", () => {
  const register = vi.fn<RegisterWorker>(() => async () => {});
  const updates = new ServiceWorkerUpdates(register);
  watch(updates);
  watch(updates);
  expect(register).toHaveBeenCalledTimes(1);
});
