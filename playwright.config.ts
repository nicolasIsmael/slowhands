import { defineConfig, devices } from "@playwright/test";

const port = 4173;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  reporter: "list",
  // Drawing a score is slow when several browsers share one CPU; timing checks run alone.
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${port}`,
    locale: "en-US",
    serviceWorkers: "allow",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "pixel-7", use: { ...devices["Pixel 7"] }, testIgnore: "**/*.timing.spec.ts" },
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: "**/*.timing.spec.ts" },
    // Timing checks run alone (see the test:e2e script) so other tests do not compete for the CPU.
    { name: "timing", use: { ...devices["Pixel 7"] }, testMatch: "**/*.timing.spec.ts" },
  ],
  webServer: {
    command: `node --run build && node --run preview -- --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
