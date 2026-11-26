import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "node",
            environment: "node",
            include: [
              "src/core/**/*.test.ts",
              "src/engines/**/*.test.ts",
              "src/storage/**/*.test.ts",
              "tooling/**/*.test.ts",
            ],
          },
        },
        {
          extends: true,
          test: {
            name: "ui",
            environment: "jsdom",
            include: ["src/ui/**/*.test.{ts,tsx}"],
            setupFiles: ["./src/ui/testing/vitest-setup.ts"],
          },
        },
      ],
    },
  }),
);
